"use client";

import { siteConfig } from "@/config/site";
import { useMsIdContext } from "@/modules/msid/context/useMsIdContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { AutoConnect } from "thirdweb/react";
import LoadingScreen from "./loading-screen";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const { status, validJWT } = useMsIdContext();

  useEffect(() => {
    if (pathname !== "/") {
      const timer = setTimeout(() => {
        if (status === "disconnected") {
          router.push("/");
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [pathname, status, router]);

  if (pathname === "/") {
    return <>{children}</>;
  }

  if (validJWT) {
    return <>{children}</>;
  } else {
    return (
      <>
        <AutoConnect client={siteConfig.thirdwebClient} />
        <LoadingScreen />
      </>
    );
  }
}