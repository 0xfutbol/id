"use client";

import { siteConfig } from "@/config/site";
import { useMsIdContext } from "@/modules/msid/context/useMsIdContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { AutoConnect } from "thirdweb/react";
import LoadingScreen from "./loading-screen";

const PUBLIC_ROUTES = ["/", "/logout"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const { isAuthenticated, status } = useMsIdContext();

  useEffect(() => {
    if (!PUBLIC_ROUTES.includes(pathname)) {
      const timer = setTimeout(() => {
        if (status === "disconnected") {
          router.push("/");
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [pathname, status, router]);

  return (
    <>
      <AutoConnect client={siteConfig.thirdwebClient} />
      {PUBLIC_ROUTES.includes(pathname) || isAuthenticated ? children : <LoadingScreen />}
    </>
  );
}