"use client";

import { useActiveWallet, useDisconnect } from "@0xfutbol/id";
import { CircularProgress } from "@nextui-org/react";
import { useEffect } from "react";

export default function LogoutPage() {
  const activeWallet = useActiveWallet();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    if (activeWallet) {
      disconnect(activeWallet);
    }
  }, [activeWallet]);

  return <CircularProgress />;
}
