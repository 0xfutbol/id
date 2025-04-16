"use client";

import { OxFutbolIdProvider } from "@0xfutbol/id";
import flagsmith from "flagsmith";
import { FlagsmithProvider } from "flagsmith/react";
import { ThemeProviderProps } from "next-themes/dist/types";

import { AuthGuard } from "@/components/auth-guard";
import BaseRouter from "@/components/base-router";
import { AppProvider } from "@/context/AppContext";

const FLAGSMITH_OPTIONS = {
  environmentID: process.env.NEXT_PUBLIC_FLAG_ENVIRONMENT_ID ?? "LC7s8jPGYB5aK5smocTyQq",
  cacheFlags: true,
};

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

export default function Main({ children }: { children: React.ReactNode }) {
  return (
    <OxFutbolIdProvider>
      <FlagsmithProvider flagsmith={flagsmith} options={FLAGSMITH_OPTIONS}>
        <AppProvider>
          <BaseRouter>
            <AuthGuard>{children}</AuthGuard>
          </BaseRouter>
        </AppProvider>
      </FlagsmithProvider>
    </OxFutbolIdProvider>
  );
}
