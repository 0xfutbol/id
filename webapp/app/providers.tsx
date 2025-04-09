"use client";

import { NextUIProvider } from "@nextui-org/system";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import flagsmith from 'flagsmith';
import { FlagsmithProvider } from "flagsmith/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProviderProps } from "next-themes/dist/types";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Suspense } from "react";
import { ThirdwebProvider } from "thirdweb/react";

import LoadingScreen from "@/components/loading-screen";
import { MsIdContextProvider } from "@/modules/msid/context/MsIdProvider";

const FLAGSMITH_OPTIONS = {
  environmentID: process.env.NEXT_PUBLIC_FLAG_ENVIRONMENT_ID ?? "LC7s8jPGYB5aK5smocTyQq",
  cacheFlags: true
};

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();
  const queryClient = new QueryClient();

  return (
    <Suspense fallback={<LoadingScreen />}>
      <FlagsmithProvider options={FLAGSMITH_OPTIONS} flagsmith={flagsmith}>
        <NextUIProvider navigate={router.push}>
          <NextThemesProvider {...themeProps}>
            <QueryClientProvider client={queryClient}>
              <ThirdwebProvider>
                <MsIdContextProvider>{children}</MsIdContextProvider>
              </ThirdwebProvider>
            </QueryClientProvider>
          </NextThemesProvider>
        </NextUIProvider>
      </FlagsmithProvider>
    </Suspense>
  );
}
