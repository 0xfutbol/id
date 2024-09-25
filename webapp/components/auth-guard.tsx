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

  const { isAuthenticated, status } = useMsIdContext();

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

  if (pathname === "/" || pathname === "/logout") {
    return <>{children}</>;
  }

  if (isAuthenticated) {
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