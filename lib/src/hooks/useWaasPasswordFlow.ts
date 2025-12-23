import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuthContext } from "@/providers/AuthContext";
import { AuthService } from "@/services";

type UseWaasPasswordFlowParams = {
  waasBaseUrl?: string;
  initialUsername?: string;
  onUsernameChange?: (username: string) => void;
};

export function useWaasPasswordFlow({ waasBaseUrl, initialUsername, onUsernameChange }: UseWaasPasswordFlowParams) {
  const { backendUrl, loginWithWaas } = useAuthContext();

  const authService = useMemo(() => new AuthService(backendUrl), [backendUrl]);

  const [username, setUsernameState] = useState(initialUsername ?? "");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [exists, setExists] = useState<boolean | undefined>(undefined);
  const [stage, setStage] = useState<"username" | "password">("username");
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (initialUsername === undefined) return;
    if (initialUsername === username) return;
    setUsernameState(initialUsername);
    setExists(undefined);
    setError(undefined);
    setStage("username");
    setPassword("");
    setPasswordConfirm("");
  }, [initialUsername, username]);

  const setUsername = useCallback(
    (value: string) => {
      const newUsername = value.replace(/\s+/g, "-");
      setUsernameState(newUsername);
      onUsernameChange?.(newUsername);
      setExists(undefined);
      setError(undefined);
      setPassword("");
      setPasswordConfirm("");
      setStage("username");
    },
    [onUsernameChange],
  );

  const reset = useCallback(() => {
    setPassword("");
    setPasswordConfirm("");
    setExists(undefined);
    setStage("username");
    setError(undefined);
  }, []);

  const checkUsernameExists = useCallback(
    async (name: string) => {
      const trimmed = name.trim().toLowerCase();
      if (!trimmed) return undefined;
      const { exists } = await authService.pre({ username: trimmed });
      return exists === undefined ? undefined : Boolean(exists);
    },
    [authService],
  );

  const submit = useCallback(async () => {
    setError(undefined);
    try {
      if (!loginWithWaas) throw new Error("WaaS login is not available");
      if (!waasBaseUrl) throw new Error("WaaS base URL is not configured");

      const trimmedUsername = username.trim().toLowerCase();
      if (!trimmedUsername) throw new Error("Username is required");

      if (stage === "username") {
        setChecking(true);
        const exists = await checkUsernameExists(trimmedUsername);
        setExists(exists);
        setStage("password");
        return;
      }

      setLoading(true);

      const usernameExists = exists ?? (await checkUsernameExists(trimmedUsername));
      setExists(usernameExists);

      if (!password) {
        throw new Error("Password is required");
      }

      if (usernameExists === false && password !== passwordConfirm) {
        throw new Error("Passwords do not match");
      }

      if (usernameExists === undefined) {
        throw new Error("Unable to determine username status. Please try again.");
      }

      const payload = usernameExists
        ? await authService.loginPassword(trimmedUsername, password)
        : await authService.registerPassword(trimmedUsername, password);

      const walletId = (payload as any).walletId ?? (payload as any).wallet?.id;
      const walletAddress = (payload as any).walletAddress ?? (payload as any).wallet?.address;
      const waasSessionToken = (payload as any).waasSessionToken;

      if (!walletId || !walletAddress || !waasSessionToken) {
        throw new Error("Missing WaaS session data from server");
      }

      await loginWithWaas?.({
        jwt: payload.token,
        walletId,
        walletAddress,
        waasBaseUrl,
        waasSessionToken,
      });

      reset();
    } catch (err: any) {
      console.error("[useWaasPasswordFlow] WaaS auth error:", err);
      setError(err?.response?.data?.error ?? err.message ?? "An error occurred");
    } finally {
      setLoading(false);
      setChecking(false);
    }
  }, [
    authService,
    checkUsernameExists,
    exists,
    loginWithWaas,
    password,
    passwordConfirm,
    reset,
    stage,
    username,
    waasBaseUrl,
  ]);

  const introCopy = "Sign in to the 0xFútbol Hub with your ID. Start with your username and we'll guide you.";

  const hint = useMemo(() => {
    const trimmed = username.trim();
    if (checking) return "Checking username...";
    if (stage === "username") return "Enter your 0xFútbol username to keep going.";
    if (exists === undefined) return "Checking username...";
    if (exists) return trimmed ? `We found ${trimmed}. Enter your password to continue.` : "We found your username. Enter your password to continue.";
    return "This username is available. Create a password to sign up.";
  }, [checking, exists, stage, username]);

  return {
    checking,
    error,
    exists,
    hint,
    introCopy,
    loading,
    password,
    passwordConfirm,
    setPassword,
    setPasswordConfirm,
    setUsername,
    stage,
    reset,
    submit,
    username,
  };
}
