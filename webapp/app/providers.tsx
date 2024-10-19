"use client";

import { NextUIProvider } from "@nextui-org/system";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProviderProps } from "next-themes/dist/types";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Suspense } from "react";
import { ThirdwebProvider } from "thirdweb/react";

import LoadingScreen from "@/components/loading-screen";
import { MsIdContextProvider } from "@/modules/msid/context/MsIdProvider";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();
  const queryClient = new QueryClient();

  return (
    <NextUIProvider navigate={router.push}>
      <NextThemesProvider {...themeProps}>
        <Suspense fallback={<LoadingScreen />}>
          <QueryClientProvider client={queryClient}>
            <ThirdwebProvider>
              <MsIdContextProvider>{children}</MsIdContextProvider>
            </ThirdwebProvider>
          </QueryClientProvider>
        </Suspense>
      </NextThemesProvider>
    </NextUIProvider>
  );
}
