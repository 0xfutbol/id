"use client";

import { Navbar } from "@/components/navbar";
import { useMsIdContext } from "@/modules/msid/context/useMsIdContext";
import { CircularProgress } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, status } = useMsIdContext();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  if (status === "connecting") {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress color="primary" size="lg" />
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen"><CircularProgress color="primary" size="lg" /></div>}>
      <div className="flex flex-col items-center">
        <Navbar />
        {children}
      </div>
    </Suspense>
  );
}
