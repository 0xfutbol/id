"use client";

import { OxFutbolIdProvider } from "@0xfutbol/id";
import flagsmith from "flagsmith";
import { FlagsmithProvider } from "flagsmith/react";
import { ThemeProviderProps } from "next-themes/dist/types";
import { useEffect, useState } from "react";

import { AuthGuard } from "@/components/auth-guard";
import { API_CONFIG } from "@/config/api";
import { CircularProgress } from "@nextui-org/react";

const FLAGSMITH_OPTIONS = {
  environmentID: process.env.NEXT_PUBLIC_FLAG_ENVIRONMENT_ID ?? "LC7s8jPGYB5aK5smocTyQq",
  cacheFlags: true,
};

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

export default function Main({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex items-center h-screen justify-center w-screen">
        <CircularProgress />
      </div>
    );
  }

  return (
    <OxFutbolIdProvider backendUrl={API_CONFIG.backendUrl} chains={["boba", "matchain", "polygon", "xdc"]}>
      <FlagsmithProvider flagsmith={flagsmith} options={FLAGSMITH_OPTIONS}>
        <AuthGuard>{children}</AuthGuard>
      </FlagsmithProvider>
    </OxFutbolIdProvider>
  );
}
