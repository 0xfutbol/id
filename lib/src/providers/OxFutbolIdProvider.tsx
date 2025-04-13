import { MatchProvider } from "@matchain/matchid-sdk-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import { createContext } from "react";
import { AutoConnect, ThirdwebProvider } from "thirdweb/react";

import { thirdwebClient } from "@/config";

import { AuthContextProvider, useAuthContext } from "./AuthContext";
import { useWeb3Context, Web3ContextProvider } from "./Web3Context";

type OxFutbolIdProviderProps = {
  children: React.ReactNode;
}

const useOxFutbolIdState = () => {
  const authContext = useAuthContext();
  const web3Context = useWeb3Context();

  return { ...web3Context, ...authContext };
};

export const OxFutbolIdContext = createContext<ReturnType<typeof useOxFutbolIdState> | undefined>(undefined);

const MatchIDProvider = ({ children }: { children: React.ReactNode }) => {
  if (typeof window === 'undefined') {
    return <>{children}</>;
  }
  
  return (
    <MatchProvider appid="pnh3wxqoqilsa1zy" wallet={{ type: "Base" }}>
      {children}
    </MatchProvider>
  );
};

function OxFutbolIdInnerProvider({ children }: OxFutbolIdProviderProps) {
  const state = useOxFutbolIdState();

  return (
    <OxFutbolIdContext.Provider value={state}>
      {children}
    </OxFutbolIdContext.Provider>
  );
}

export function OxFutbolIdProvider({ children }: OxFutbolIdProviderProps) {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ThirdwebProvider>
        <MatchIDProvider>
          <Web3ContextProvider>
            <AuthContextProvider>
              <OxFutbolIdInnerProvider>
                <AutoConnect client={thirdwebClient} />
                {children}
              </OxFutbolIdInnerProvider>
            </AuthContextProvider>
          </Web3ContextProvider>
        </MatchIDProvider>
      </ThirdwebProvider>
    </QueryClientProvider>
  );
}
