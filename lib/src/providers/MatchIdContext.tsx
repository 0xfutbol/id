import { ChainName } from "@0xfutbol/constants";
import { Hooks } from "@matchain/matchid-sdk-react";
import React, { createContext, ReactNode, useCallback, useEffect, useRef, useState } from "react";

import { MatchainConnect } from "@/components";
import { getChainName, MatchIdSigner } from "@/utils";
import { Signer } from "ethers";

type MatchIdContextProviderProps = {
  children: ReactNode;
}

const useMatchIdContextState = () => {
  const chain = Hooks.useMatchChain();
  const userInfo = Hooks.useUserInfo();
  const wallet = Hooks.useWallet();

  const chainId = useRef<number | undefined>(undefined);
  const currentAddress = useRef<string | undefined>(undefined);
  const status = useRef<"connected" | "disconnected" | "unknown">("unknown");
  const switchingChain = useRef(false);
  const walletReady = useRef(false);
  const web3Ready = useRef(false);

  const [chainName, setChainName] = useState<ChainName | undefined>("matchain");
  const [signer, setSigner] = useState<Signer | undefined>(undefined);

  const connect = useCallback(async () => {
    const connectButton = document.querySelector(
      `.connect-button-matchain_id`,
    );

    console.log(`[MatchIdContext] Connecting to matchain_id`, connectButton);

    if (connectButton instanceof HTMLElement) {
      connectButton.click();
    }
  }, []);
  
  const disconnect = useCallback(async () => {
    await userInfo.logout();
  }, [userInfo]);

  const switchChainAndThen = useCallback(async (chainId: number, action: () => Promise<unknown>) => {
    switchingChain.current = true;
    chain.setChainId(chainId);
    setChainName(getChainName(chainId));
    await action();
    switchingChain.current = false;
  }, [chain]);

  useEffect(() => {
    console.log(`[MatchIdContext] Effect triggered with chain:`, chain, `and wallet:`, wallet);

    const matchainChainId = chain.chainId ?? undefined;
    const matchainAddress = wallet.address ?? undefined;
    const matchainWalletReady = wallet.walletReady ?? false;

    const chainIdChanged = matchainChainId !== chainId.current;
    const walletAddressChanged = matchainAddress !== currentAddress.current;
    const walletReadyChanged = matchainWalletReady !== walletReady.current;
    
    console.log(`[MatchIdContext] State changes detected:`, {
      chainIdChanged,
      walletAddressChanged,
      currentChainId: chainId.current,
      newChainId: matchainChainId,
      currentWalletAddress: currentAddress.current,
      newWalletAddress: matchainAddress,
      currentWalletReady: walletReady.current,
      newWalletReady: matchainWalletReady
    });
    
    if (status.current !== "unknown" && !chainIdChanged && !walletAddressChanged && !walletReadyChanged) {
      console.log(`[MatchIdContext] No relevant changes, skipping effect`);
      return;
    }

    console.log(`[MatchIdContext] Updating context state`);
    
    chainId.current = matchainChainId;
    currentAddress.current = matchainAddress;
    walletReady.current = matchainWalletReady;

    if (chainId.current !== undefined) {
      const newChainName = getChainName(chainId.current);
      console.log(`[MatchIdContext] Setting chain name to:`, newChainName);
      setChainName(newChainName);
    } else {
      console.log(`[MatchIdContext] Chain ID is undefined`);
      setChainName(undefined);
    }

    const isConnected = Boolean(currentAddress.current);

    status.current = isConnected ? "connected" : "disconnected";
    web3Ready.current = isConnected ? wallet.walletReady : true;
    console.log(`[MatchIdContext] Status updated:`, {
      status: status.current,
      web3Ready: web3Ready.current
    });

    console.log(`[MatchIdContext] Wallet is ready, creating new MatchIdSigner`);
    if (web3Ready.current) {
      const newSigner = new MatchIdSigner(chain, wallet);
      console.log(`[MatchIdContext] MatchIdSigner created successfully:`, newSigner);
      setSigner(newSigner);
    } else {
      console.log(`[MatchIdContext] Wallet is not ready, skipping signer creation`);
    }
  }, [chain, wallet]);

  return {
    address: currentAddress.current,
    chainName,
    signer,
    status: status.current,
    switchingChain: switchingChain.current,
    web3Ready: web3Ready.current,
    connect,
    disconnect,
    switchChainAndThen
  };
};

export const MatchIdContext = createContext<ReturnType<typeof useMatchIdContextState> | undefined>(undefined);

export function MatchIdContextProvider({ children }: MatchIdContextProviderProps) {
  const state = useMatchIdContextState();

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