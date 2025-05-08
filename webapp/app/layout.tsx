"use client";

import "@/styles/globals.css";

import { NextUIProvider } from "@nextui-org/react";
import clsx from "clsx";
import { Viewport } from "next";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useRouter } from "next/navigation";

import Main from "./main";

import { fontSans } from "@/config/fonts";
import { QueryClient } from "@tanstack/react-query";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();
  const router = useRouter();

  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body className={clsx("antialiased bg-background font-sans min-h-screen overflow-hidden", fontSans.variable)}>
        <NextUIProvider navigate={router.push}>
          {/* @ts-ignore */}
          <NextThemesProvider themeProps={{ attribute: "class", defaultTheme: "dark" }}>
            <Main>
              {children}
            </Main>
          </NextThemesProvider>
        </NextUIProvider>
      </body>
    </html>
  );
}
