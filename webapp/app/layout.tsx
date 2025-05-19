import "@/styles/globals.css";

import clsx from "clsx";
import { Metadata, Viewport } from "next";

import Main from "./main";

import { fontSans } from "@/config/fonts";

export const metadata: Metadata = {
  title: "0xFútbol ID",
  description: "0xFútbol ID",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  initialScale: 1,
  minimumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  width: "device-width"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning lang="en">
      <body className={clsx("antialiased bg-background dark font-sans h-screen overflow-x-hidden overflow-y-auto text-foreground w-screen", fontSans.variable)}>
        <Main>
          {children}
        </Main>
      </body>
    </html>
  );
}
