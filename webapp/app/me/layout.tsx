"use client";

import LoadingScreen from "@/components/loading-screen";
import { Navbar } from "@/components/navbar";
import { useMsIdContext } from "@/modules/msid/context/useMsIdContext";
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
    return (<LoadingScreen />);
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <div className="flex flex-col items-center">
        <Navbar />
        {children}
      </div>
    </Suspense>
  );
}
