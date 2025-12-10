import { ChainName } from "@0xfutbol/constants";
import React, { createContext, ReactNode, useCallback, useRef, useState } from "react";
import { BigNumber, Signer } from "ethers";

import { WaasService } from "@/services/WaasService";
import { createMetaSoccerWaaSSigner } from "@/utils/createMetaSoccerWaaSSigner";

export const META_SOCCER_WAAS_SESSION = "META_SOCCER_WAAS_SESSION";

export type MetaSoccerWaaSSession = {
  walletId: string;
  walletAddress: string;
  waasBaseUrl: string;
  waasSessionToken: string;
  chainId?: number;
};

export const loadMetaSoccerWaaSSession = (): MetaSoccerWaaSSession | undefined => {
  if (typeof window === "undefined") return undefined;
  const raw = localStorage.getItem(META_SOCCER_WAAS_SESSION);
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as MetaSoccerWaaSSession;
  } catch (err) {
    console.warn("[MetaSoccerWaaS] Failed to parse stored session", err);
    return undefined;
  }
};

export const saveMetaSoccerWaaSSession = (session: MetaSoccerWaaSSession) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(META_SOCCER_WAAS_SESSION, JSON.stringify(session));
};

export const clearMetaSoccerWaaSSession = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(META_SOCCER_WAAS_SESSION);
};

type MetaSoccerWaaSContextProviderProps = {
  chains: Array<ChainName>;
  children: ReactNode;
};

type ConnectParams = {
  walletId: string;
  walletAddress: string;
  waasBaseUrl: string;
  waasSessionToken: string;
  chainId?: number;
};

const useMetaSoccerWaaSContextState = (chains: Array<ChainName>) => {
  const waasService = useRef<WaasService | undefined>(undefined);
  const walletIdRef = useRef<string | undefined>(undefined);
  const walletAddressRef = useRef<string | undefined>(undefined);
  const chainIdRef = useRef<number | undefined>(undefined);

  const [signer, setSigner] = useState<Record<ChainName, Signer> | undefined>(undefined);
  const [status, setStatus] = useState<"connected" | "disconnected" | "unknown">("disconnected");

  const connect = useCallback(async (params: ConnectParams) => {
    waasService.current = new WaasService(params.waasBaseUrl, params.waasSessionToken);
    walletIdRef.current = params.walletId;
    walletAddressRef.current = params.walletAddress;
    chainIdRef.current = params.chainId;

    const signers = chains.reduce((acc, chainName) => {
      acc[chainName] = createMetaSoccerWaaSSigner({
        chain: chainName,
        chainId: chainIdRef.current,
        waasBaseUrl: params.waasBaseUrl,
        waasSessionToken: params.waasSessionToken,
        walletAddress: params.walletAddress,
        walletId: params.walletId,
        waasService: waasService.current,
      });
      return acc;
    }, {} as Record<ChainName, Signer>);

    setSigner(signers);
    setStatus("connected");
  }, [chains]);

  const disconnect = useCallback(async () => {
    waasService.current = undefined;
    walletIdRef.current = undefined;
    walletAddressRef.current = undefined;
    chainIdRef.current = undefined;
    setSigner(undefined);
    setStatus("disconnected");
  }, []);

  const nativeBalanceOf = useCallback(async (_address: string, _chainId: number) => {
    if (!waasService.current || !walletIdRef.current) {
      throw new Error("WaaS service not initialized");
    }
    const { balanceWei } = await waasService.current.getNativeBalance(walletIdRef.current, _chainId);
    return BigNumber.from(balanceWei);
  }, []);

  const switchChain = useCallback(async (_chain: ChainName) => {
    if (!waasService.current || !walletIdRef.current || chainIdRef.current === undefined) {
      console.warn("[MetaSoccerWaaS] switchChain called without initialized service");
      return;
    }
    await waasService.current.switchChain(walletIdRef.current, chainIdRef.current);
  }, []);

  return {
    address: walletAddressRef.current,
    chainId: chainIdRef.current,
    signer,
    status,
    web3Ready: (status === "connected" && signer !== undefined) || status === "disconnected",
    connect,
    disconnect,
    nativeBalanceOf,
    switchChain,
  };
};

export const MetaSoccerWaaSContext = createContext<ReturnType<typeof useMetaSoccerWaaSContextState> | undefined>(undefined);

export function MetaSoccerWaaSContextProvider({ chains, children }: MetaSoccerWaaSContextProviderProps) {
  const state = useMetaSoccerWaaSContextState(chains);

  return (
    <MetaSoccerWaaSContext.Provider value={state}>
      {children}
    </MetaSoccerWaaSContext.Provider>
  );
}

export const useMetaSoccerWaaSContext = () => {
  const context = React.useContext(MetaSoccerWaaSContext);
  if (context === undefined) {
    throw new Error("useMetaSoccerWaaSContext must be used within a MetaSoccerWaaSContextProvider");
  }
  return context;
};
