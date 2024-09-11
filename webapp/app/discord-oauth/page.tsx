"use client";

import { useMsIdContext } from "@/modules/msid/context/useMsIdContext";
import { CircularProgress } from "@nextui-org/react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function DiscordOAuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  const { address, validJWT } = useMsIdContext();

  useEffect(() => {
    if (!address) return;
    if (!code) return;
    if (!validJWT) return;

    const redirectUri = `${window.location.origin}/discord-oauth`;

    axios
      .post("http://localhost:6743/account/discord", { code, redirectUri }, { headers: { Authorization: `Bearer ${validJWT}` } })
      .then(() => {
        
      })
      .catch(() => {
      })
      .finally(() => {
        router.replace("/");
      });
  }, [address, code, router, validJWT]);

  return <CircularProgress />;
}

export default function DiscordOAuthPage() {
  return (
    <Suspense fallback={<CircularProgress />}>
      <DiscordOAuthContent />
    </Suspense>
  );
}
