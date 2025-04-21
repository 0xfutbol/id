import { ChainName } from "@0xfutbol/constants";
import React, { createContext, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { ethers5Adapter } from "thirdweb/adapters/ethers5";
import { AutoConnect, useActiveWallet, useActiveWalletConnectionStatus, useConnectModal } from "thirdweb/react";
import { getWalletBalance, Wallet } from "thirdweb/wallets";

import { chains, thirdwebClient } from "@/config";
import { getChainName } from "@/utils";
import { BigNumber, Signer } from "ethers";

type ThirdwebContextProviderProps = {
  children: ReactNode;
}

const useThirdwebContextState = () => {
  const activeWallet = useActiveWallet();
  const status = useActiveWalletConnectionStatus();
  const { connect: openModal } = useConnectModal();

  const switchingChain = useRef(false);

  const [chainName, setChainName] = useState<ChainName | undefined>("polygon");
  const [signer, setSigner] = useState<Signer | undefined>(undefined);

  const connect = useCallback(async (wallet: Wallet) => {
    await openModal({
      client: thirdwebClient,
      wallets: [wallet],
      size: "compact",
      showThirdwebBranding: false,
      privacyPolicyUrl: "https://0xfutbol.com/privacy-policy",
      termsOfServiceUrl: "https://0xfutbol.com/terms-of-service",
    });
  }, [openModal]);

  const disconnect = useCallback(async () => {
    await activeWallet?.disconnect();
  }, [activeWallet]);

  const nativeBalanceOf = useCallback(async (address: string, chainId: number) => {
    const balance = await getWalletBalance({
      client: thirdwebClient,
      chain: chains[getChainName(chainId) as ChainName]!.ref,
      address
    });

    return BigNumber.from(balance.value);
  }, []);

  const switchChainAndThen = useCallback(async (chainId: number, action: () => Promise<unknown>) => {
    if (!activeWallet) return;
    if (switchingChain.current) return;

    if (activeWallet.getChain()?.id !== chainId) {
      console.log("Switching chain", chainId);
      switchingChain.current = true;
      const activeChain = Object.values(chains).find((c) => c.ref.id === chainId)!.ref;
      await activeWallet.switchChain(activeChain);
      console.log("Switched chain", activeChain);
      setChainName(getChainName(chainId));
      switchingChain.current = false;
      await action();
    } else {
      console.log("Executing action on chain", chainId);
      await action();
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

  return {
    address: activeWallet?.getAccount()?.address,
    chainName,
    signer,
    status,
    switchingChain: switchingChain.current,
    web3Ready: status === "connected" || status === "disconnected",
    connect,
    disconnect,
    nativeBalanceOf,
    switchChainAndThen
  };
};

export const ThirdwebContext = createContext<ReturnType<typeof useThirdwebContextState> | undefined>(undefined);

export function ThirdwebContextProvider({ children }: ThirdwebContextProviderProps) {
  const state = useThirdwebContextState();

  return (
    <ThirdwebContext.Provider value={state}>
      <AutoConnect client={thirdwebClient} />
      {children}
    </ThirdwebContext.Provider>
  );
}

export const useThirdwebContext = () => {
  const context = React.useContext(ThirdwebContext);
  if (context === undefined) {
    throw new Error("useThirdwebContext must be used within a ThirdwebContextProvider");
  }
  return context;
};