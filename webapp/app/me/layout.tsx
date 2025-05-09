"use client";

import { Navbar } from "@/components/navbar";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center h-screen overflow-y-auto w-screen">
      <Navbar />
      {children}
    </div>
  );
}
