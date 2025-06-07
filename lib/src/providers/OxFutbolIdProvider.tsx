import { ChainName } from "@0xfutbol/constants";
import { MatchProvider } from "@matchain/matchid-sdk-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BigNumber, Contract, Signer } from "ethers";
import * as React from "react";
import { createContext } from "react";
import { ThirdwebProvider } from "thirdweb/react";

import { AuthContextProvider, useAuthContext } from "@/providers/AuthContext";
import { useWeb3Context, Web3ContextProvider, Web3ContextState } from "@/providers/Web3Context";
import { AuthStatus } from "@/providers/types";

type OxFutbolIdProviderProps = {
  backendUrl: string;
  chains: Array<ChainName>;
  children: React.ReactNode;
}

type OxFutbolIdState = {
  // web3
  address?: string;
  defaultChain?: ChainName;
  signer?: Record<ChainName, Signer>;
  status: string;
  userDetails?: Web3ContextState["userDetails"];
  walletProvider: "matchain_id" | "thirdweb" | "unknown";
  web3Ready: boolean;
  connect: (walletKey: string) => Promise<void>;
  disconnect: () => Promise<void>;
  nativeBalanceOf: (address: string, chainId: number) => Promise<BigNumber>;
  newContract: (chain: ChainName, contractAddress: string, contractAbi: any) => Contract;
  switchChain: (chain: ChainName) => Promise<void>;
  // auth
  authStatus: AuthStatus;
  isClaimPending: boolean;
  isWaitingForSignature: boolean;
  username?: string;
  userClaims?: Record<string, any>;
  claim: (username: string) => Promise<void>;
}

const useOxFutbolIdState = (): OxFutbolIdState => {
  const web3Context = useWeb3Context();
  const authContext = useAuthContext();

  return {
    ...web3Context,
    ...authContext,
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

function OxFutbolIdInnerProvider({ children }: Omit<OxFutbolIdProviderProps, "backendUrl" | "chains">) {
  const state = useOxFutbolIdState();

  return (
    <OxFutbolIdContext.Provider value={state}>
      {children}
    </OxFutbolIdContext.Provider>
  );
}

export function OxFutbolIdProvider({ backendUrl, chains, children }: OxFutbolIdProviderProps) {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ThirdwebProvider>
        <MatchIDProvider>
          <Web3ContextProvider chains={chains}>
            <AuthContextProvider backendUrl={backendUrl} chainToSign="polygon">
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
