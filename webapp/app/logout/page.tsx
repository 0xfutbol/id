"use client";

import { useOxFutbolIdContext } from "@0xfutbol/id";
import { CircularProgress } from "@heroui/react";
import { useEffect } from "react";

export default function LogoutPage() {
  const { disconnect } = useOxFutbolIdContext();

  useEffect(() => {
    disconnect();
  }, [disconnect]);

  return <CircularProgress />;
}
