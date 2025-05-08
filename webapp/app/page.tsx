"use client";

import { useOxFutbolIdContext } from "@0xfutbol/id";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


export default function Home() {
  const { isAuthenticated } = useOxFutbolIdContext();
  const router = useRouter();

  console.log("isAuthenticated", isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/me");
    } else {
      router.push("/login");
    }
  }, [router, isAuthenticated]);

  return null;
}
