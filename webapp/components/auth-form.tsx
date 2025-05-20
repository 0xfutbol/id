"use client";

import { AuthUIOrchestrator } from "@0xfutbol/id";
import { Button, Image, Listbox, ListboxItem } from "@heroui/react";
import React, { FormEvent, useCallback } from "react";

import { selectUsername, setUsername } from "@/store/features/auth";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getImgUrl } from "@/utils/getImgUrl";

const AuthForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const username = useAppSelector(selectUsername);

  const handleUsernameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value.replace(/\s+/g, "-");
    dispatch(setUsername(newUsername));
  }, [dispatch]);

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
            <form
              onSubmit={(e: FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                onClaimClick(username);
              }}
            >
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium" htmlFor="username">
                    Enter your desired 0xFútbol ID
                  </label>
                  <input
                    className={`w-full px-3 py-2 rounded-md border ${error ? "border-red-500" : "border-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-primary`}
                    id="username"
                    name="username"
                    type="text"
                    value={username}
                    onChange={handleUsernameChange}
                  />
                  {error && <p className="text-xs text-red-500">{error}</p>}
                </div>
                {isTakingLong && (
                  <p className="text-xs text-gray-500">
                    Claiming your 0xFútbol ID is a blockchain operation and might take a few seconds, so please hang
                    tight—we&apos;ll be ready soon!
                  </p>
                )}
                <Button
                  className="w-full px-4 py-2 bg-primary text-black rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  isDisabled={isLoading}
                  isLoading={isLoading}
                  type="submit"
                >
                  {isLoading ? "Claiming..." : "Claim 0xFútbol ID"}
                </Button>
                <Button
                  className="w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  type="button"
                  onClick={() => onDisconnectClick("")}
                >
                  Go Back
                </Button>
              </div>
            </form>
          </div>
        )}
        connectComponent={({ WALLET_OPTIONS, isWaitingForSignature, onConnectClick }) => (
          <div className="flex flex-col gap-8 p-4">
            <div className="flex flex-col gap-4">
              <p className="text-sm">Connect your 0xFútbol ID to start playing.</p>
              <div className="flex items-start gap-2">
                <p className="text-sm text-gray-500">
                  0xFútbol ID is your unique identifier in the 0xFútbol Ecosystem—think of it like your username for any
                  0xFútbol product.
                </p>
              </div>
              <p className="text-sm">
                Don&apos;t have one yet? No worries! Just connect your wallet, and you&apos;ll be able to claim yours
                instantly.
              </p>
              <Listbox aria-label="Wallet Options" className="p-0 gap-1 my-2">
                {WALLET_OPTIONS.map((option: any) => (
                  <ListboxItem
                    key={option.key}
                    className="flex items-center gap-2 w-full p-2 rounded-lg"
                    onClick={() => onConnectClick(option.key)}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <div>{option.icon}</div>
                      <div className="flex flex-col items-start justify-center gap-1">
                        <p className="text-sm">{option.label}</p>
                        <p className="text-xs text-gray-500">{option.description}</p>
                      </div>
                    </div>
                  </ListboxItem>
                ))}
              </Listbox>
            </div>
            <p className="text-xs text-gray-500 text-center">
              By continuing, you agree to our{" "}
              <a className="text-primary hover:underline" href="https://0xfutbol.com/terms-of-service">
                Terms of Service
              </a>{" "}
              and{" "}
              <a className="text-primary hover:underline" href="https://0xfutbol.com/privacy-policy">
                Privacy Policy
              </a>
            </p>
          </div>
        )}
      />
    </div>
  );
};

export default AuthForm;
