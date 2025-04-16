"use client";

import { useOxFutbolIdContext } from "@0xfutbol/id";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAppParam } from "@/context/AppContext";

export default function Home() {
  const { isAuthenticated } = useOxFutbolIdContext();

  const app = useAppParam();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/me");
    } else {
      router.push("/login");
    }
  }, [app, router, isAuthenticated]);

  return null;
}
