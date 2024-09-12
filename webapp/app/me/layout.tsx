"use client";

import LoadingScreen from "@/components/loading-screen";
import { Navbar } from "@/components/navbar";
import { Suspense } from "react";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <div className="flex flex-col items-center px-2">
        <Navbar />
        {children}
      </div>
    </Suspense>
  );
}
