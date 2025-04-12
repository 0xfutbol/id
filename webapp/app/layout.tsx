"use client";

import "@/styles/globals.css";

import { NextUIProvider } from "@nextui-org/react";
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
      <body className={clsx("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
        <Main>
          <NextUIProvider navigate={router.push}>
            {/* @ts-ignore */}
            <NextThemesProvider themeProps={{ attribute: "class", defaultTheme: "dark" }}>
              {children}
            </NextThemesProvider>
          </NextUIProvider>
        </Main>
      </body>
    </html>
  );
}
