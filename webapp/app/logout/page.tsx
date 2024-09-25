"use client";

import { useMsIdContext } from "@/modules/msid/context/useMsIdContext";
import { CircularProgress } from "@nextui-org/react";
import { useEffect } from "react";

export default function LogoutPage() {
  const { logout } = useMsIdContext();

  useEffect(() => {
    logout();
  }, []);

  return <CircularProgress />;
}
