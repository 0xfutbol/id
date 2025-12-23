"use client";

import { AuthUIOrchestrator, useWaasPasswordFlow } from "@0xfutbol/id";
import { Button, Form, Image, Input, Listbox, ListboxItem } from "@heroui/react";
import React, { FormEvent, useCallback, useEffect, useRef } from "react";

import { selectUsername, setUsername } from "@/store/features/auth";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getImgUrl } from "@/utils/getImgUrl";
import { API_CONFIG } from "@/config/api";

const AuthForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const storedUsername = useAppSelector(selectUsername);

  const {
    checking: waasCheckingUsername,
    error: waasError,
    exists: waasExists,
    hint: waasHint,
    introCopy: waasIntroCopy,
    loading: waasLoading,
    password: waasPassword,
    passwordConfirm: waasPasswordConfirm,
    reset: resetWaasFlow,
    setPassword: setWaasPassword,
    setPasswordConfirm: setWaasPasswordConfirm,
    setUsername: setWaasUsername,
    stage: waasStage,
    submit: handleWaasSubmit,
    username,
  } = useWaasPasswordFlow({
    waasBaseUrl: API_CONFIG.waasBaseUrl,
    initialUsername: storedUsername,
    onUsernameChange: (value) => dispatch(setUsername(value)),
  });

  const passwordInputRef = useRef<HTMLInputElement | null>(null);

  const handleUsernameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setWaasUsername(e.target.value);
  }, [setWaasUsername]);

  useEffect(() => {
    if (waasStage === "password" && passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  }, [waasStage]);

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-[386px] py-8">
      <Image
        alt="0xFútbol ID"
        className="h-10 w-auto"
        src={getImgUrl("https://assets.metasoccer.com/0xfutbol/msid/0xfutbol-logo.png?v=2")}
        radius="none"
      />
      <AuthUIOrchestrator
        claimComponent={({ error, isLoading, isTakingLong, onClaimClick, onDisconnectClick }) => (
          <div className="flex flex-col gap-4 p-4 w-full">
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
              className="flex flex-col gap-4 w-full"
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
          <div className="flex flex-col gap-4 p-4 w-full">
            <div className="flex flex-col gap-2">
              <p className="text-sm text-gray-600">{waasIntroCopy}</p>
              <p className="text-sm text-gray-600">{waasHint}</p>
            </div>
            <Input
              label="Username"
              labelPlacement="outside"
              value={username}
              onChange={handleUsernameChange}
              isDisabled={waasLoading || waasCheckingUsername}
              className="w-full"
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
                className="w-full"
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
                className="w-full"
              />
            )}
            {waasError && <p className="text-xs text-danger">{waasError}</p>}
            <div className="flex flex-col gap-4">
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
                    resetWaasFlow();
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
