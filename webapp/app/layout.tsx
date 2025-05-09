"use client";

import "@/styles/globals.css";

import { HeroUIProvider } from "@heroui/react";
import { ToastProvider } from "@heroui/toast";
import clsx from "clsx";
import { Viewport } from "next";
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
      <head>
        <title>0xFútbol ID</title>
        <meta name="description" content="0xFútbol Identity Platform" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
      </head>
      <body className={clsx("antialiased bg-background dark font-sans min-h-screen overflow-hidden text-foreground w-screen", fontSans.variable)}>
        <HeroUIProvider navigate={router.push}>
          <Main>
            {children}
          </Main>
          <ToastProvider placement="bottom-center" />
        </HeroUIProvider>
      </body>
    </html>
  );
}
