import { JSX, useCallback, useState } from "react";

import { useOxFutbolIdContext, WALLET_OPTIONS } from "@/providers";

interface AuthUIOrchestratorProps {
  claimComponent: (props: {
    error?: string;
    isLoading: boolean;
    isTakingLong: boolean;
    onClaimClick: (username: string) => Promise<void>;
    onDisconnectClick: (walletKey: string) => void;
  }) => JSX.Element;
  connectComponent: (props: {
    WALLET_OPTIONS: typeof WALLET_OPTIONS;
    isWaitingForSignature: boolean;
    onConnectClick: (walletKey: string) => void;
  }) => JSX.Element;
}

export function AuthUIOrchestrator({ claimComponent, connectComponent }: AuthUIOrchestratorProps) {
  const { isClaimPending, isWaitingForSignature, claim, connect, disconnect } = useOxFutbolIdContext();

  const [error, setError] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isTakingLong, setIsTakingLong] = useState(false);

  const onClaimClick = useCallback(
    async (username: string) => {
      setError(undefined);
      setIsLoading(true);
      setIsTakingLong(false);

      const timer = setTimeout(() => {
        setIsTakingLong(true);
      }, 10000);

      try {
        await claim(username);
      } catch (err) {
        setError((err as Error).message || "An error occurred while claiming the 0xFútbol ID");
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
    return connectComponent({ WALLET_OPTIONS, isWaitingForSignature, onConnectClick });
  }
}
