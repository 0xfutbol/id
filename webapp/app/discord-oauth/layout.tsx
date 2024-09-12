"use client";

import LoadingScreen from "@/components/loading-screen";
import { Suspense } from "react";

export default function DiscordOAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <div className="flex items-center h-screen justify-center w-screen">
        {children}
      </div>
    </Suspense>
  );
}
