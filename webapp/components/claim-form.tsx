"use client";

import { Button, Input } from "@nextui-org/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useActiveWallet, useDisconnect } from "thirdweb/react";

import { useMsIdContext } from "@/modules/msid/context/useMsIdContext";

export const ClaimForm = () => {
  const { isWaitingForSignature, isSwitchingChain, claim, switchChain } = useMsIdContext();

  const activeWallet = useActiveWallet();
  const { disconnect } = useDisconnect();

  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTakingLong, setIsTakingLong] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!isSwitchingChain) {
      switchChain();
    }
  }, [isSwitchingChain, switchChain]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError("");
      setIsLoading(true);
      setIsTakingLong(false);

      const timer = setTimeout(() => {
        setIsTakingLong(true);
      }, 10000);

      try {
        await claim(username);
      } catch (err) {
        if (err instanceof Error && "response" in err && err.response) {
          const responseBody = (err.response as any).data;

          setError(
            responseBody.error ||
              "An error occurred while claiming the MetaSoccer ID",
          );
        } else {
          setError(
            (err as Error).message ||
              "An error occurred while claiming the MetaSoccer ID",
          );
        }
      } finally {
        clearTimeout(timer);
        setIsLoading(false);
        setIsTakingLong(false);
      }
    },
    [claim, username],
  );

  const handleGoBack = useCallback(() => {
    if (activeWallet) {
      disconnect(activeWallet);
    }
  }, [activeWallet, disconnect]);

  const handleUsernameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newUsername = e.target.value.replace(/\s+/g, "-");

      setUsername(newUsername);
      setError(""); // Clear error when username changes
    },
    [],
  );

  return (
    <div className="flex flex-col space-y-4 w-full">
      <div className="flex items-start gap-2">
        <p className="text-sm">
          MetaSoccer ID is your unique identifier in the MetaSoccer World—think
          of it like your username for any MetaSoccer game.
        </p>
      </div>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <Input
          ref={inputRef}
          errorMessage={error}
          isInvalid={!!error}
          label="Enter your desired MetaSoccer ID"
          value={username}
          onChange={handleUsernameChange}
        />
        {isTakingLong && !isWaitingForSignature && (
          <p className="text-xs">
            Claiming your MetaSoccer ID is a blockchain operation and might take
            a few seconds, so please hang tight—we’ll be ready soon!
          </p>
        )}
        <Button
          color="primary"
          isLoading={isLoading || isWaitingForSignature}
          type="submit"
        >
          Claim MetaSoccer ID
        </Button>
        <Button variant="bordered" onClick={handleGoBack}>
          Go Back
        </Button>
      </form>
    </div>
  );
};
