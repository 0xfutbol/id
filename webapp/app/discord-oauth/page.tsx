"use client";

import { useMsIdContext } from "@/modules/msid/context/useMsIdContext";
import { accountService } from "@/modules/msid/services/AccountService";
import { CircularProgress } from "@nextui-org/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function DiscordOAuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  const { validJWT } = useMsIdContext();

  useEffect(() => {
    if (!code) return;
    if (!validJWT) return;

    const redirectUri = `${window.location.origin}/discord-oauth`;

    accountService.linkDiscord(code, redirectUri, validJWT)
      .then(() => {
        // Success handling can be added here if needed
      })
      .catch((error) => {
        console.error("Error linking Discord:", error);
      })
      .finally(() => {
        router.replace("/me");
      });
  }, [code, router, validJWT]);

  return <CircularProgress />;
}
