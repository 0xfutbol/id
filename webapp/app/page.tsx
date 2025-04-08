"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import LoadingScreen from "@/components/loading-screen";
import { APP_CONFIG } from "@/config/apps";
import { useAppParam } from "@/context/AppContext";
import { useMsIdContext } from "@/modules/msid/context/useMsIdContext";

const LoginForm = dynamic(() => import("@/components/login-form"), {
  ssr: false,
  loading: () => (
    <LoadingScreen />
  ),
});

export default function Home() {
  const { isAuthenticated } = useMsIdContext();

  const app = useAppParam();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      if (APP_CONFIG[app].redirectUri) {
        console.debug("[0xFútbol ID] Redirecting to:", APP_CONFIG[app].redirectUri);
        window.location.href = APP_CONFIG[app].redirectUri;
      } else {
        router.push("/me");
      }
    }
  }, [app, router, isAuthenticated]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden md:flex-row">
      <div className="flex-1 h-full">
        <img
          alt={APP_CONFIG[app].name}
          className="h-full w-full object-cover"
          src={APP_CONFIG[app].background}
        />
      </div>
      <div className="flex h-screen flex-1 items-center justify-center bg-background p-8">
        <LoginForm appConfig={APP_CONFIG[app]} />
      </div>
    </div>
  );
}
