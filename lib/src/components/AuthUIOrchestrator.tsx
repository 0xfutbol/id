import { JSX, useCallback, useState } from "react";

import { useOxFutbolIdContext, WALLET_OPTIONS } from "@/providers";

interface AuthUIOrchestratorProps {
  claimComponent: (props: {
    error?: string;
    isLoading: boolean;
    isTakingLong: boolean;
    onClaimClick: (username: string, email?: string) => Promise<void>;
    onDisconnectClick: (walletKey: string) => void;
  }) => JSX.Element;
  waasComponent: (props: {
    isWaitingForSignature: boolean;
    onShowOtherOptions: () => void;
    onHideOtherOptions: () => void;
    showOtherOptions: boolean;
  }) => JSX.Element;
  otherOptionsComponent: (props: {
    WALLET_OPTIONS: typeof WALLET_OPTIONS;
    isWaitingForSignature: boolean;
    onConnectClick: (walletKey: string) => void;
    onHide: () => void;
  }) => JSX.Element;
}

export function AuthUIOrchestrator({ claimComponent, waasComponent, otherOptionsComponent }: AuthUIOrchestratorProps) {
  const { isClaimPending, isWaitingForSignature, claim, connect, disconnect } = useOxFutbolIdContext();

  const [showOtherOptions, setShowOtherOptions] = useState(false);

  const [error, setError] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isTakingLong, setIsTakingLong] = useState(false);

  const onClaimClick = useCallback(
    async (username: string, email?: string) => {
      setError(undefined);
      setIsLoading(true);
      setIsTakingLong(false);

      const timer = setTimeout(() => {
        setIsTakingLong(true);
      }, 10000);

      try {
        await claim(username, email);
      } catch (err: any) {
        console.error("[AuthUIOrchestrator] Error claiming username:", err);
        setError(err?.response?.data?.error ?? err.message ?? "An error occurred while claiming the 0xFútbol ID");
      } finally {
        clearTimeout(timer);
        setIsLoading(false);
        setIsTakingLong(false);
      }
    },
    [claim],
  );

  const onConnectClick = useCallback((walletKey: string) => {
    connect(walletKey);
  }, [connect]);

  const onDisconnectClick = useCallback(() => {
    disconnect();
  }, [disconnect]);

  if (isClaimPending) {
    return claimComponent({ error, isLoading, isTakingLong, onClaimClick, onDisconnectClick });
  } else {
    const otherWalletOptions = WALLET_OPTIONS.filter((option) => option.key !== "metasoccer-waas");

    return showOtherOptions
      ? otherOptionsComponent({
        WALLET_OPTIONS: otherWalletOptions,
        isWaitingForSignature,
        onConnectClick,
        onHide: () => setShowOtherOptions(false)
      })
      : waasComponent({
        isWaitingForSignature,
        onShowOtherOptions: () => setShowOtherOptions(true),
        onHideOtherOptions: () => setShowOtherOptions(false),
        showOtherOptions,
      });
  }
}
