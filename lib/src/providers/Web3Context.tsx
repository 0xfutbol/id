import { ChainName, networkConfig } from "@0xfutbol/constants";
import React, { createContext, ReactNode, useCallback, useEffect, useState } from "react";
import { ethers5Adapter } from "thirdweb/adapters/ethers5";
import { useActiveWallet, useActiveWalletConnectionStatus, useDisconnect } from "thirdweb/react";

import { chains, thirdwebClient } from "@/config";

type Web3ContextProviderProps = {
  children: ReactNode;
}

const getChainName = (chainId: number): ChainName | undefined => {
  return Object.entries(networkConfig).find(([, value]) => value.chainId === chainId)?.[0] as ChainName;
};

const useWeb3ContextState = () => {
  const activeWallet = useActiveWallet();
  const status = useActiveWalletConnectionStatus();
  const { disconnect } = useDisconnect();

  const [chainName, setChainName] = useState<ChainName | undefined>("polygon");
  const [signer, setSigner] = useState<ReturnType<typeof ethers5Adapter.provider.toEthers> | undefined>(undefined);
  const [switchingChain, setSwitchingChain] = useState(false);

  const switchChainAndThen = useCallback(async (chainId: number, action: () => unknown) => {
    if (!activeWallet) return;

    if (activeWallet.getChain()?.id !== chainId) {
      console.log("Switching chain", chainId);
      setSwitchingChain(true);
      const activeChain = Object.values(chains).find((c) => c.ref.id === chainId)!.ref;
      await activeWallet.switchChain(activeChain);
      console.log("Switched chain", activeChain);
      setChainName(getChainName(chainId));
      setSwitchingChain(false);
      action();
    } else {
      console.log("Executing action on chain", chainId);
      action();
    }
  }, [activeWallet]);

  useEffect(() => {
    const fetchSigner = async () => {
      const account = activeWallet?.getAccount();
      const chain = chains[chainName as ChainName]?.ref;

      if (activeWallet && account && chain) {
        const ethersSigner = await ethers5Adapter.signer.toEthers({
          account: account,
          client: thirdwebClient,
          chain: chain
        });
        setSigner(ethersSigner);
      } else {
        setSigner(undefined);
      }
    };

    fetchSigner();
  }, [activeWallet, chainName]);

  return { activeWallet, chainName, signer, status, switchingChain, disconnect, switchChainAndThen };
};

export const Web3Context = createContext<ReturnType<typeof useWeb3ContextState> | undefined>(undefined);

export function Web3ContextProvider({ children }: Web3ContextProviderProps) {
  const state = useWeb3ContextState();

  return (
    <Web3Context.Provider value={state}>
      {children}
    </Web3Context.Provider>
  );
}

export const useWeb3Context = () => {
  const context = React.useContext(Web3Context);
  if (context === undefined) {
    throw new Error("useWeb3Context must be used within a Web3ContextProvider");
  }
  return context;
};