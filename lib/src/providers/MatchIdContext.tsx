import { ChainName } from "@0xfutbol/constants";
import { Chains, Hooks } from "@matchain/matchid-sdk-react";
import React, { createContext, ReactNode, useCallback, useEffect, useRef, useState } from "react";

import { MatchainConnect } from "@/components";
import { MatchIdSigner } from "@/utils";
import { BigNumber, Signer } from "ethers";

type MatchIdContextProviderProps = {
  chains: Array<ChainName>;
  children: ReactNode;
}

const useMatchIdContextState = (chains: Array<ChainName>) => {
  const userInfo = Hooks.useUserInfo();
  const wallet = Hooks.useWallet();

  console.log("[MatchIdContext] userInfo", userInfo);
  console.log("[MatchIdContext] wallet", wallet);

  const chainId = useRef<number>(Chains.MatchMain.id);
  const currentAddress = useRef<string | undefined>(undefined);
  const status = useRef<"connected" | "disconnected" | "unknown">("unknown");
  const walletReady = useRef(false);
  const web3Ready = useRef(false);
  
  const [signer, setSigner] = useState<Record<ChainName, Signer> | undefined>(undefined);

  const connect = useCallback(async () => {
    if (!web3Ready.current) {
      return;
    }

    const connectButton = document.querySelector(
      `.connect-button-matchain_id`,
    );

    if (connectButton instanceof HTMLElement) {
      connectButton.click();
    }
  }, []);
  
  const disconnect = useCallback(async () => {
    await userInfo.logout();
  }, [userInfo]);

  const nativeBalanceOf = useCallback(async (address: string, chainId: number) => {
    console.warn("[MatchIdContext] nativeBalanceOf not implemented");
    return BigNumber.from(0);
  }, []);

  useEffect(() => {
    const matchainChainId = chainId.current ?? undefined;
    const matchainAddress = wallet.address ?? undefined;
    const matchainWalletReady = wallet.walletReady ?? false;

    console.debug("[MatchIdContext] Current values:", {
      chainId: chainId.current,
      address: currentAddress.current,
      walletReady: walletReady.current,
      status: status.current
    });
    console.debug("[MatchIdContext] New values:", {
      chainId: matchainChainId,
      address: matchainAddress,
      walletReady: matchainWalletReady
    });

    const chainIdChanged = matchainChainId !== chainId.current;
    const walletAddressChanged = matchainAddress !== currentAddress.current;
    const walletReadyChanged = matchainWalletReady !== walletReady.current;

    if (!chainIdChanged && !walletAddressChanged && !walletReadyChanged) {
      console.debug("[MatchIdContext] No changes detected, skipping update");
      return;
    }

    console.debug("[MatchIdContext] Changes detected, updating state");
    chainId.current = matchainChainId;
    currentAddress.current = matchainAddress;
    walletReady.current = matchainWalletReady;

    const isConnected = Boolean(currentAddress.current);

    status.current = isConnected ? "connected" : "disconnected";
    web3Ready.current = isConnected ? walletReady.current : true;

    if (currentAddress.current && walletReady.current) {
      const signers = chains.reduce((acc, chainName) => {
        acc[chainName] = new MatchIdSigner(chainId.current, wallet);
        return acc;
      }, {} as Record<ChainName, Signer>);

      setSigner(signers);
    }
  }, [chains, wallet]);

  return {
    address: currentAddress.current,
    signer,
    status: status.current,
    web3Ready: web3Ready.current,
    connect,
    disconnect,
    nativeBalanceOf
  };
};

export const MatchIdContext = createContext<ReturnType<typeof useMatchIdContextState> | undefined>(undefined);

export function MatchIdContextProvider({ chains, children }: MatchIdContextProviderProps) {
  const state = useMatchIdContextState(chains);

  return (
    <MatchIdContext.Provider value={state}>
      <MatchainConnect />
      {children}
    </MatchIdContext.Provider>
  );
}

export const useMatchIdContext = () => {
  const context = React.useContext(MatchIdContext);
  if (context === undefined) {
    throw new Error("useMatchIdContext must be used within a MatchIdContextProvider");
  }
  return context;
};