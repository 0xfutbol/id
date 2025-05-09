"use client";

import { useOxFutbolIdContext } from "@0xfutbol/id";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import LoadingScreen from "./loading-screen";

const LOGIN_PATH = "/login";
const PUBLIC_PATHS = [LOGIN_PATH];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const { isAuthenticated, web3Ready } = useOxFutbolIdContext();
  const currentPath = window.location.pathname;
  const isPublicPath = PUBLIC_PATHS.some((path) => currentPath.startsWith(path));

  useEffect(() => {
    if (!web3Ready) {
      return;
    }

    if (isAuthenticated && currentPath === LOGIN_PATH) {
      router.push("/me");
    }

    if (!isAuthenticated && !isPublicPath) {
      router.push(LOGIN_PATH);
    }
  }, [currentPath, isAuthenticated, web3Ready, router, isPublicPath]);

  if (isPublicPath) {
    return children;
  } else {
    return isAuthenticated ? children : <LoadingScreen />;
  }
}
