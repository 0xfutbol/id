import "@/styles/globals.css";

import clsx from "clsx";
import { Viewport } from "next";

import { Providers } from "./providers";

import { AuthGuard } from "@/components/auth-guard";
import BaseRouter from "@/components/base-router";
import DynamicHead from "@/components/head";
import { fontSans } from "@/config/fonts";
import { AppProvider } from "@/context/AppContext";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        {/* @ts-ignore */}
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <AppProvider>
            <DynamicHead />
            <BaseRouter>
              <AuthGuard>{children}</AuthGuard>
            </BaseRouter>
          </AppProvider>
        </Providers>
      </body>
    </html>
  );
}
