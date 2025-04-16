import { ChainName } from "@0xfutbol/constants";
import { MatchProvider } from "@matchain/matchid-sdk-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Signer } from "ethers";
import * as React from "react";
import { createContext } from "react";
import { ThirdwebProvider } from "thirdweb/react";

import { AuthContextProvider, useAuthContext } from "./AuthContext";
import { useWeb3Context, Web3ContextProvider } from "./Web3Context";

type OxFutbolIdProviderProps = {
  children: React.ReactNode;
}

type OxFutbolIdState = {
  // web3
  address?: string;
  chainName?: ChainName;
  signer?: Signer;
  status: string;
  switchingChain: boolean;
  web3Ready: boolean;
  connect: (walletKey: string) => Promise<void>;
  disconnect: () => Promise<void>;
  switchChainAndThen: <T extends void>(chainId: number, action: () => Promise<T>) => Promise<void>;
  // auth
  isAuthenticated: boolean;
  isClaimPending: boolean;
  isWaitingForSignature: boolean;
  username?: string;
  claim: (username: string) => Promise<void>;
}

const useOxFutbolIdState = (): OxFutbolIdState => {
  const authContext = useAuthContext();
  const web3Context = useWeb3Context();

  return {
    ...authContext,
    ...web3Context,
  };
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
                {children}
              </OxFutbolIdInnerProvider>
            </AuthContextProvider>
          </Web3ContextProvider>
        </MatchIDProvider>
      </ThirdwebProvider>
    </QueryClientProvider>
  );
}
