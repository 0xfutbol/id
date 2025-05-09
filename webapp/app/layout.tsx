"use client";

import "@/styles/globals.css";

import { HeroUIProvider } from "@heroui/react";
import { ToastProvider } from "@heroui/toast";
import clsx from "clsx";
import { Viewport } from "next";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useRouter } from "next/navigation";

import Main from "./main";

import { fontSans } from "@/config/fonts";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body className={clsx("antialiased bg-background font-sans min-h-screen overflow-hidden px-4", fontSans.variable)}>
        <HeroUIProvider navigate={router.push}>
          {/* @ts-ignore */}
          <NextThemesProvider themeProps={{ attribute: "class", defaultTheme: "dark" }}>
            <Main>
              {children}
            </Main>
            <ToastProvider placement="top-right" />
          </NextThemesProvider>
        </HeroUIProvider>
      </body>
    </html>
  );
}
