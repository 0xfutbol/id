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
  sponsorGas?: boolean;
}

type OxFutbolIdState = {
  // web3
  address?: string;
  chainId?: number;
  defaultChain?: ChainName;
  signer?: Record<ChainName, Signer>;
  status: string;
  userDetails?: Web3ContextState["userDetails"];
  walletProvider: "matchain_id" | "thirdweb" | "metasoccer-waas" | "unknown";
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
  claim: (username: string, email?: string) => Promise<void>;
  loginWithWaas?: (params: {
    jwt: string;
    walletId: string;
    walletAddress: string;
    waasBaseUrl: string;
    waasSessionToken: string;
    chains: ChainName[];
  }) => void;
}

const useOxFutbolIdState = (): OxFutbolIdState => {
  const web3Context = useWeb3Context();
  const authContext = useAuthContext();

  if (authContext.waasSession) {
    return {
      address: authContext.waasSession.address,
      chainId: web3Context.chainId,
      defaultChain: web3Context.defaultChain,
      signer: authContext.waasSession.signers,
      status: "connected",
      userDetails: web3Context.userDetails,
      walletProvider: "metasoccer-waas",
      web3Ready: true,
      connect: web3Context.connect,
      disconnect: web3Context.disconnect,
      nativeBalanceOf: web3Context.nativeBalanceOf,
      newContract: web3Context.newContract,
      switchChain: web3Context.switchChain,
      authStatus: authContext.authStatus,
      isClaimPending: authContext.isClaimPending,
      isWaitingForSignature: authContext.isWaitingForSignature,
      username: authContext.username,
      userClaims: authContext.userClaims,
      claim: authContext.claim,
      loginWithWaas: authContext.loginWithWaas,
    };
  }

  return {
    ...web3Context,
    ...authContext,
    loginWithWaas: authContext.loginWithWaas,
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

export function OxFutbolIdProvider({ backendUrl, chains, children, sponsorGas = false }: OxFutbolIdProviderProps) {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ThirdwebProvider>
        <MatchIDProvider>
          <Web3ContextProvider chains={chains} sponsorGas={sponsorGas}>
            <AuthContextProvider backendUrl={backendUrl} chainToSign="base">
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
