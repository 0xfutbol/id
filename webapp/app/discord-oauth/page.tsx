/* eslint-disable no-console */
"use client";

import { accountService } from "@/modules/account/account-service";
import { useOxFutbolIdContext } from "@0xfutbol/id";
import { CircularProgress } from "@heroui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function DiscordOAuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  const { isAuthenticated } = useOxFutbolIdContext();

  useEffect(() => {
    if (!code) return;
    if (!isAuthenticated) return;

    const redirectUri = `${window.location.origin}/discord-oauth`;

    accountService
      .linkDiscord(code, redirectUri)
      .then(() => {
        // Success handling can be added here if needed
      })
      .catch((error) => {
        console.error("Error linking Discord:", error);
      })
      .finally(() => {
        router.replace("/me");
      });
  }, [code, router]);

  return <CircularProgress />;
}
