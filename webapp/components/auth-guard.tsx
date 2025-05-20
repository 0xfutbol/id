"use client";

import { useOxFutbolIdContext } from "@0xfutbol/id";
import { useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useMemo } from "react";

import LoadingScreen from "./loading-screen";

const LOGIN_PATH = "/login";
const ME_PATH = "/me";
const PUBLIC_PATHS = [LOGIN_PATH];

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = memo(({ children }) => {
  const router = useRouter();

  const { authStatus, web3Ready } = useOxFutbolIdContext();

  const currentPath = useMemo(() => window.location.pathname, []);
  const isPublicPath = useMemo(
    () => PUBLIC_PATHS.some((path) => currentPath.startsWith(path)),
    [currentPath]
  );

  const logAuthState = useCallback(() => {
    console.debug("AuthGuard State:", {
      authStatus,
      currentPath,
      isPublicPath,
      web3Ready,
      timestamp: new Date().toISOString(),
    });
  }, [authStatus, currentPath, isPublicPath, web3Ready]);

  const redirectToLogin = useCallback(() => {
    if (!isPublicPath && authStatus === "unauthenticated") {
      console.info("Redirecting to login from:", currentPath);
      router.push(LOGIN_PATH);
    }
  }, [authStatus, currentPath, isPublicPath, router]);

  const redirectToMe = useCallback(() => {
    if (authStatus === "authenticated" && currentPath === LOGIN_PATH) {
      console.info("Redirecting to profile from login");
      router.push(ME_PATH);
    }
  }, [authStatus, currentPath, router]);

  useEffect(() => {
    if (!web3Ready) return;

    logAuthState();
    redirectToMe();
    redirectToLogin();
  }, [web3Ready, logAuthState, redirectToMe, redirectToLogin]);

  if (!web3Ready) {
    return <LoadingScreen />;
  }

  if (isPublicPath || authStatus === "authenticated") {
    return <>{children}</>;
  }

  return <LoadingScreen />;
});
