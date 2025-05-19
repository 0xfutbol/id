import { ChainName } from "@0xfutbol/constants";
import React, { createContext, ReactNode, useCallback, useEffect, useState } from "react";
import { ethers5Adapter } from "thirdweb/adapters/ethers5";
import { AutoConnect, useActiveWallet, useActiveWalletConnectionStatus, useConnectModal } from "thirdweb/react";
import { getWalletBalance, Wallet } from "thirdweb/wallets";

import { chains as chainsConfig, thirdwebClient } from "@/config";
import { getChainName } from "@/utils";
import { BigNumber, Signer } from "ethers";

type ThirdwebContextProviderProps = {
  chains: Array<ChainName>;
  children: ReactNode;
}

const useThirdwebContextState = (chains: Array<ChainName>) => {
  const activeWallet = useActiveWallet();
  const status = useActiveWalletConnectionStatus();
  const { connect: openModal } = useConnectModal();

  const [signer, setSigner] = useState<Record<ChainName, Signer> | undefined>(undefined);

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
    localStorage.clear();
    await activeWallet?.disconnect();
  }, [activeWallet]);

  const nativeBalanceOf = useCallback(async (address: string, chainId: number) => {
    const balance = await getWalletBalance({
      client: thirdwebClient,
      chain: chainsConfig[getChainName(chainId) as ChainName]!.ref,
      address
    });

    return BigNumber.from(balance.value);
  }, []);

  const switchChain = useCallback(async (chain: ChainName) => {
    await activeWallet?.switchChain(chainsConfig[chain]!.ref);
  }, [activeWallet]);

  useEffect(() => {
    const buildSigners = async () => {
      const account = activeWallet?.getAccount();

      if (activeWallet && account) {
        const signers = await chains.reduce(async (accPromise, chainName) => {
          const acc = await accPromise;
          const chainRef = chainsConfig[chainName]?.ref;
          
          if (!chainRef) {
            throw new Error(`Chain ${chainName} not found in chainsConfig`);
          }
          
          const ethersSigner = await ethers5Adapter.signer.toEthers({
            account: account,
            client: thirdwebClient,
            chain: chainRef
          });
          
          return { ...acc, [chainName]: ethersSigner };
        }, Promise.resolve({} as Record<ChainName, Signer>));
        
        setSigner(signers);
      } else {
        setSigner(undefined);
      }
    };

    buildSigners();
  }, [activeWallet, chains]);

  return {
    address: activeWallet?.getAccount()?.address,
    signer,
    status,
    web3Ready: (status === "connected" && signer !== undefined) || status === "disconnected",
    connect,
    disconnect,
    nativeBalanceOf,
    switchChain
  };
};

export const ThirdwebContext = createContext<ReturnType<typeof useThirdwebContextState> | undefined>(undefined);

export function ThirdwebContextProvider({ chains, children }: ThirdwebContextProviderProps) {
  const state = useThirdwebContextState(chains);

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