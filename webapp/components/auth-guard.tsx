"use client";

import { AutoConnect, thirdwebClient, useMsIdContext } from "@0xfutbol/id";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import LoadingScreen from "./loading-screen";

import { APP_CONFIG } from "@/config/apps";
import { useAppParam } from "@/context/AppContext";

const PUBLIC_ROUTES = ["/", "/logout"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const { isAuthenticated, status } = useMsIdContext();

  const app = useAppParam();

  useEffect(() => {
    if (!PUBLIC_ROUTES.includes(pathname)) {
      const timer = setTimeout(() => {
        if (status === "disconnected") {
          if (APP_CONFIG[app].redirectUri) {
            console.debug("[0xFútbol ID] Redirecting to:", APP_CONFIG[app].redirectUri);
            window.location.href = APP_CONFIG[app].redirectUri;
          } else {
            router.push("/");
          }
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [pathname, status, router]);

  return (
    <>
      <AutoConnect client={thirdwebClient} />
      {PUBLIC_ROUTES.includes(pathname) || isAuthenticated ? children : <LoadingScreen />}
    </>
  );
}
