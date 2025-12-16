"use client";

import axios from "axios";
import { AuthUIOrchestrator, useOxFutbolIdContext } from "@0xfutbol/id";
import { Button, Form, Image, Input, Listbox, ListboxItem } from "@heroui/react";
import React, { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { authService } from "@/modules/auth/auth-service";
import { selectUsername, setUsername } from "@/store/features/auth";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getImgUrl } from "@/utils/getImgUrl";
import { API_CONFIG } from "@/config/api";

const AuthForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const username = useAppSelector(selectUsername);
  const { loginWithWaas } = useOxFutbolIdContext();

  const [waasPassword, setWaasPassword] = useState("");
  const [waasPasswordConfirm, setWaasPasswordConfirm] = useState("");
  const [waasExists, setWaasExists] = useState<boolean | undefined>(undefined);
  const [waasStage, setWaasStage] = useState<"username" | "password">("username");
  const [waasError, setWaasError] = useState<string | undefined>(undefined);
  const [waasLoading, setWaasLoading] = useState(false);
  const [waasCheckingUsername, setWaasCheckingUsername] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement | null>(null);

  const handleUsernameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value.replace(/\s+/g, "-");
    dispatch(setUsername(newUsername));
    setWaasExists(undefined);
    setWaasError(undefined);
    setWaasPassword("");
    setWaasPasswordConfirm("");
    setWaasStage("username");
  }, [dispatch]);

  useEffect(() => {
    if (waasStage === "password" && passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  }, [waasStage]);

  const checkUsernameExists = useCallback(async (name: string) => {
    const trimmed = name.trim().toLowerCase();
    if (!trimmed) return undefined;
    const { data } = await axios.post(`${API_CONFIG.backendUrl}/auth/pre`, { username: trimmed });
    return Boolean(data?.exists);
  }, []);

  const handleWaasSubmit = useCallback(async () => {
    setWaasError(undefined);
    try {
      if (!loginWithWaas) throw new Error("WaaS login is not available");
      if (!API_CONFIG.waasBaseUrl) throw new Error("WaaS base URL is not configured");

      const trimmedUsername = username.trim().toLowerCase();
      if (!trimmedUsername) throw new Error("Username is required");

      if (waasStage === "username") {
        setWaasCheckingUsername(true);
        const exists = await checkUsernameExists(trimmedUsername);
        setWaasExists(exists);
        setWaasStage("password");
        return;
      }

      setWaasLoading(true);

      const exists = waasExists ?? await checkUsernameExists(trimmedUsername);
      setWaasExists(exists);

      if (!waasPassword) {
        throw new Error("Password is required");
      }

      if (exists === false && waasPassword !== waasPasswordConfirm) {
        throw new Error("Passwords do not match");
      }

      if (exists === undefined) {
        throw new Error("Unable to determine username status. Please try again.");
      }

      const payload = exists
        ? await authService.loginPassword(trimmedUsername, waasPassword)
        : await authService.registerPassword(trimmedUsername, waasPassword);

      const walletId = (payload as any).walletId ?? (payload as any).wallet?.id;
      const walletAddress = (payload as any).walletAddress ?? (payload as any).wallet?.address;
      const waasSessionToken = (payload as any).waasSessionToken;

      if (!walletId || !walletAddress || !waasSessionToken) {
        throw new Error("Missing WaaS session data from server");
      }

      await loginWithWaas({
        jwt: payload.token,
        walletId,
        walletAddress,
        waasBaseUrl: API_CONFIG.waasBaseUrl,
        waasSessionToken,
      });

      setWaasPassword("");
      setWaasPasswordConfirm("");
      setWaasExists(undefined);
      setWaasStage("username");
    } catch (err: any) {
      console.error("[AuthForm] WaaS auth error:", err);
      setWaasError(err?.response?.data?.error ?? err.message ?? "An error occurred");
    } finally {
      setWaasLoading(false);
      setWaasCheckingUsername(false);
    }
  }, [API_CONFIG.waasBaseUrl, checkUsernameExists, loginWithWaas, username, waasExists, waasPassword, waasPasswordConfirm, waasStage]);

  const waasIntroCopy = "Access the 0xFútbol Hub with a single ID. Tell us your username and we\'ll guide you.";

  const waasHint = useMemo(() => {
    const trimmed = username.trim();
    if (waasCheckingUsername) return "Checking username...";
    if (waasStage === "username") return "Enter your username to continue with 0xFútbol WaaS.";
    if (waasExists === undefined) return "Checking username...";
    if (waasExists) return trimmed ? `We found ${trimmed}. Enter your password to continue.` : "We found your username. Enter your password to continue.";
    return "This username is available. Create a password to sign up.";
  }, [username, waasCheckingUsername, waasStage, waasExists]);

  return (
    <div className="flex flex-col items-center gap-8 max-w-[386px] py-8">
      <Image
        alt="0xFútbol ID"
        className="h-10 w-auto"
        src={getImgUrl("https://assets.metasoccer.com/0xfutbol/msid/0xfutbol-logo.png?v=2")}
        radius="none"
      />
      <AuthUIOrchestrator
        claimComponent={({ error, isLoading, isTakingLong, onClaimClick, onDisconnectClick }) => (
          <div className="flex flex-col gap-4 p-4">
            <div className="flex items-start gap-2">
              <p className="text-sm">
                0xFútbol ID is your unique identifier in the 0xFútbol Hub—think of it like your username for any
                0xFútbol product.
              </p>
            </div>
            <Form
              onSubmit={(e: FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                onClaimClick(username);
              }}
              className="flex flex-col gap-4"
            >
              <Input
                label="Enter your desired username"
                labelPlacement="outside"
                id="username"
                name="username"
                value={username}
                onChange={handleUsernameChange}
                errorMessage={error}
                isInvalid={!!error}
                className="w-full"
              />
              {isTakingLong && (
                <p className="text-xs text-gray-500">
                  Claiming your 0xFútbol ID is a blockchain operation and might take a few seconds, so please hang
                  tight—we&apos;ll be ready soon!
                </p>
              )}
              <Button
                className="w-full text-black"
                isDisabled={isLoading}
                isLoading={isLoading}
                type="submit"
                color="primary"
              >
                {isLoading ? "Claiming..." : "Claim 0xFútbol ID"}
              </Button>
              <Button
                className="w-full"
                type="button"
                onClick={() => onDisconnectClick("")}
                variant="bordered"
              >
                Go Back
              </Button>
            </Form>
          </div>
        )}
        waasComponent={({ isWaitingForSignature, onShowOtherOptions, onHideOtherOptions, showOtherOptions }) => (
          <div className="flex flex-col gap-5 p-4 w-full">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold">MetaSoccer WaaS</p>
              <p className="text-xs text-gray-500">{waasIntroCopy}</p>
              <p className="text-xs text-gray-500">{waasHint}</p>
            </div>
            <Input
              label="Username"
              labelPlacement="outside"
              value={username}
              onChange={handleUsernameChange}
              isDisabled={waasLoading || waasCheckingUsername}
            />
            {waasStage === "password" && (
              <Input
                label="Password"
                labelPlacement="outside"
                type="password"
                value={waasPassword}
                onChange={(e) => setWaasPassword(e.target.value)}
                isDisabled={waasLoading}
                ref={passwordInputRef}
              />
            )}
            {waasStage === "password" && waasExists === false && (
              <Input
                label="Confirm Password"
                labelPlacement="outside"
                type="password"
                value={waasPasswordConfirm}
                onChange={(e) => setWaasPasswordConfirm(e.target.value)}
                isDisabled={waasLoading}
              />
            )}
            {waasError && <p className="text-xs text-danger">{waasError}</p>}
            <div className="flex flex-col gap-2">
              <Button
                className="w-full"
                isLoading={waasLoading || isWaitingForSignature || waasCheckingUsername}
                isDisabled={waasCheckingUsername || waasLoading || isWaitingForSignature || !username.trim()}
                onClick={async () => {
                  if (waasStage === "username" && showOtherOptions) onHideOtherOptions();
                  await handleWaasSubmit();
                }}
                color="primary"
              >
                {waasStage === "username"
                  ? waasCheckingUsername
                    ? "Checking..."
                    : "Continue"
                  : waasLoading
                    ? "Processing..."
                    : waasExists
                      ? "Continue"
                      : "Sign up"}
              </Button>
              {waasStage === "username" && (
                <Button
                  className="w-full"
                  variant="bordered"
                  isDisabled={isWaitingForSignature}
                  onClick={() => {
                    onShowOtherOptions();
                    setWaasError(undefined);
                    setWaasExists(undefined);
                    setWaasStage("username");
                    setWaasPassword("");
                    setWaasPasswordConfirm("");
                  }}
                >
                  Other options
                </Button>
              )}
            </div>
          </div>
        )}
        otherOptionsComponent={({ WALLET_OPTIONS, isWaitingForSignature, onConnectClick, onHide }) => (
          <div className="flex flex-col gap-4 p-4 w-full">
            <p className="text-sm">Other options</p>
            <Listbox aria-label="Wallet Options" className="p-0 gap-1 my-2">
              {WALLET_OPTIONS.map((option: any) => (
                <ListboxItem
                  key={option.key}
                  className="flex items-center gap-2 w-full p-2 rounded-lg"
                  onClick={() => onConnectClick(option.key)}
                  isDisabled={isWaitingForSignature}
                >
                  <div className="flex items-center gap-2 w-full">
                    <div className="flex-shrink-0">{option.icon}</div>
                    <div className="flex flex-col items-start justify-center gap-1">
                      <p className="text-sm">{option.label}</p>
                      <p className="text-xs text-gray-500">{option.description}</p>
                    </div>
                  </div>
                </ListboxItem>
              ))}
            </Listbox>
            <Button
              className="w-full"
              variant="bordered"
              onClick={() => {
                onHide();
              }}
            >
              Back
            </Button>
          </div>
        )}
      />
    </div>
  );
};

export default AuthForm;
