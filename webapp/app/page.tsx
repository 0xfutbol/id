"use client";

import { useOxFutbolIdContext } from "@0xfutbol/id";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


export default function Home() {
  const { authStatus } = useOxFutbolIdContext();
  const router = useRouter();

  useEffect(() => {
    if (authStatus === "authenticated") {
      router.push("/me");
    } else {
      router.push("/login");
    }
  }, [authStatus, router]);

  return null;
}
