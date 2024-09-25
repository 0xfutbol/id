"use client";

import { CircularProgress } from "@nextui-org/react";
import { useEffect } from "react";
import { useActiveWallet, useDisconnect } from "thirdweb/react";

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
