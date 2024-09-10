"use client";

import { MsIdContextProvider } from "@/modules/msid/MsIdProvider";
import { NextUIProvider } from "@nextui-org/system";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProviderProps } from "next-themes/dist/types";
import { useRouter } from "next/navigation";
import * as React from "react";
import { ThirdwebProvider } from "thirdweb/react";

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
        <QueryClientProvider client={queryClient}>
          <ThirdwebProvider>
            <MsIdContextProvider>
              {children}
            </MsIdContextProvider>
          </ThirdwebProvider>
        </QueryClientProvider>
      </NextThemesProvider>
    </NextUIProvider>
  );
}
