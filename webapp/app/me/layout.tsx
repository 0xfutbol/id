"use client";

import { Navbar } from "@/components/navbar";
import { useMsIdContext } from "@/modules/msid/context/useMsIdContext";
import { CircularProgress } from "@nextui-org/react";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useMsIdContext();

  if (status === "connecting") {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress color="primary" size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <Navbar />
      {children}
    </div>
  );
}
