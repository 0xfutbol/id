"use client";

import { useMsIdContext } from "@0xfutbol/id";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { APP_CONFIG } from "@/config/apps";
import { useAppParam } from "@/context/AppContext";

export default function Home() {
  const { isAuthenticated } = useMsIdContext();

  const app = useAppParam();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      if (APP_CONFIG[app].redirectUri) {
        console.debug("[0xFútbol ID] Redirecting to:", APP_CONFIG[app].redirectUri);
        window.location.href = APP_CONFIG[app].redirectUri;
      } else {
        router.push("/me");
      }
    } else {
      router.push("/login");
    }
  }, [app, router, isAuthenticated]);

  return null;
}
