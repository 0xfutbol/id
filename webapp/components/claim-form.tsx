"use client";

import { useMsIdContext } from "@/modules/msid/context/useMsIdContext";
import { Button, Input } from "@nextui-org/react";
import { useCallback, useEffect, useRef, useState } from "react";

export const ClaimForm = () => {
  const { isWaitingForSignature, claim, invalidateJWT } = useMsIdContext();

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await claim(username);
    } catch (err) {
      if (err instanceof Error && 'response' in err && err.response) {
        const responseBody = (err.response as any).data;
        setError(responseBody.error || "An error occurred while claiming the MetaSoccer ID");
      } else {
        setError((err as Error).message || "An error occurred while claiming the MetaSoccer ID");
      }
    } finally {
      setIsLoading(false);
    }
  }, [claim, username]);

  const handleGoBack = useCallback(() => {
    invalidateJWT();
  }, [invalidateJWT]);

  const handleUsernameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value.replace(/\s+/g, '-');
    setUsername(newUsername);
    setError(""); // Clear error when username changes
  }, []);

  return (
    <div className="flex flex-col space-y-4 w-full">
      <div className="flex items-start gap-2">
        <p className="text-sm">MetaSoccer ID is your unique identifier in the MetaSoccer World—think of it like your username for any MetaSoccer game.</p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          ref={inputRef}
          errorMessage={error}
          isInvalid={!!error}
          label="Enter your desired MetaSoccer ID"
          value={username}
          onChange={handleUsernameChange}
        />
        <Button type="submit" color="primary" isLoading={isLoading || isWaitingForSignature}>
          Claim MetaSoccer ID
        </Button>
        <Button variant="bordered" onClick={handleGoBack}>
          Go Back
        </Button>
      </form>
    </div>
  );
};
