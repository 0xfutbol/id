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
    const matchainChainId = chain.chainId ?? undefined;
    const matchainAddress = wallet.address ?? undefined;
    const matchainWalletReady = wallet.walletReady ?? false;

    const chainIdChanged = matchainChainId !== chainId.current;
    const walletAddressChanged = matchainAddress !== currentAddress.current;
    const walletReadyChanged = matchainWalletReady !== walletReady.current;

    if (!chainIdChanged && !walletAddressChanged && !walletReadyChanged) {
      return;
    }

    chainId.current = matchainChainId;
    currentAddress.current = matchainAddress;
    walletReady.current = matchainWalletReady;

    if (chainId.current !== undefined) {
      const newChainName = getChainName(chainId.current);
      setChainName(newChainName);
    } else {
      setChainName(undefined);
    }

    const isConnected = Boolean(currentAddress.current);

    status.current = isConnected ? "connected" : "disconnected";
    web3Ready.current = isConnected ? wallet.walletReady : true;

    if (wallet.walletReady) {
      const newSigner = new MatchIdSigner(chain, wallet);
      setSigner(newSigner);
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