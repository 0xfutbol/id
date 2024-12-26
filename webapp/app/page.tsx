"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { ClaimForm } from "@/components/claim-form";
import { LoginForm } from "@/components/login-form";
import { APP_CONFIG } from "@/config/apps";
import { useAppParam } from "@/hooks/useAppParam";
import { useMsIdContext } from "@/modules/msid/context/useMsIdContext";
import { getImgUrl } from "@/utils/getImgUrl";

export default function Home() {
  const { isAuthenticated, isClaimPending } =
    useMsIdContext();

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
  }, [router, isAuthenticated]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen w-full flex-col md:flex-row">
      <div className="flex-1 h-full">
        <img
          alt="0xFútbol ID"
          className="h-full w-full object-cover"
          src={getImgUrl("https://assets.metasoccer.com/ui/login/1.png")}
        />
      </div>
      <div className="flex h-screen flex-1 items-center justify-center bg-background p-8">
        <div className="flex max-w-[386px] flex-col gap-8 transition-[height] duration-300 ease-in-out">
          <div className="flex items-center justify-center">
            {APP_CONFIG[app].logo}
          </div>
          {isClaimPending ? (
            <ClaimForm />
          ) : (
            <LoginForm pre={APP_CONFIG[app].pre} />
          )}
        </div>
      </div>
    </div>
  );
}
