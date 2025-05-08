"use client";

import { useOxFutbolIdContext } from "@0xfutbol/id";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import LoadingScreen from "./loading-screen";

const LOGIN_PATH = "/login";
const PUBLIC_PATHS = [LOGIN_PATH];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const { isAuthenticated, isAuthenticating, web3Ready } = useOxFutbolIdContext();
  const currentPath = window.location.pathname;
  const isPublicPath = PUBLIC_PATHS.some((path) => currentPath.startsWith(path));

  useEffect(() => {
    console.log("[AuthGuard] State:", { 
      isAuthenticated, 
      web3Ready, 
      currentPath, 
      isPublicPath 
    });

    if (isAuthenticating) {
      console.log("[AuthGuard] Authenticating...");
      return;
    }

    if (!web3Ready) {
      console.log("[AuthGuard] Web3 not ready yet, waiting...");
      return;
    }

    if (isAuthenticated && currentPath === LOGIN_PATH) {
      console.log("[AuthGuard] User is authenticated and on login page, redirecting to /me");
      router.push("/me");
    }

    if (!isAuthenticated && !isPublicPath) {
      console.log("[AuthGuard] User is not authenticated and not on public path, redirecting to login");
      router.push(LOGIN_PATH);
    }
  }, [currentPath, isAuthenticated, isAuthenticating, web3Ready, router, isPublicPath]);

  console.log("[AuthGuard] Rendering decision:", { 
    isPublicPath, 
    isAuthenticated, 
    renderingChildren: isPublicPath || isAuthenticated 
  });

  if (isPublicPath) {
    return children;
  } else {
    return isAuthenticated ? children : <LoadingScreen />;
  }
}
