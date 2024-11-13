"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSessionStorage } from "react-use";

import { ClaimForm } from "@/components/claim-form";
import { LoginForm } from "@/components/login-form";
import { APP_CONFIG } from "@/config/apps";
import { useMsIdContext } from "@/modules/msid/context/useMsIdContext";
import { getImgUrl } from "@/utils/getImgUrl";

const METASOCCER_ID_SESSION_APP = "METASOCCER_ID_SESSION_APP";

function useAppParam(searchParams: { app: string }) {
  console.debug("[MetaSoccer ID] Search params:", searchParams);
  const urlParams = new URLSearchParams(searchParams);
  const appParam = urlParams.get("app")?.toUpperCase();
  const [app] = useSessionStorage(METASOCCER_ID_SESSION_APP, appParam ?? "ID");

  return app;
}

export default function Home({ searchParams }: { searchParams: { app: string } }) {
  const { isAuthenticated, isClaimPending, isSwitchingChain } =
    useMsIdContext();

  const app = useAppParam(searchParams);

  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      if (APP_CONFIG[app].redirectUri) {
        console.debug("[MetaSoccer ID] Redirecting to:", APP_CONFIG[app].redirectUri);
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
          alt="MetaSoccer"
          className="h-full w-full object-cover"
          src={getImgUrl("https://assets.metasoccer.com/ui/login/1.png")}
        />
      </div>
      <div className="flex h-screen flex-1 items-center justify-center bg-background p-8">
        <div className="flex max-w-[386px] flex-col gap-8 transition-[height] duration-300 ease-in-out">
          <div className="flex items-center justify-center">
            {APP_CONFIG[app].logo}
          </div>
          {isSwitchingChain ? (
            <p className="text-center text-sm text-foreground-500">
              MetaSoccer ID operates on the SKALE network. Please switch to
              SKALE to proceed.
            </p>
          ) : isClaimPending ? (
            <ClaimForm />
          ) : (
            <LoginForm pre={APP_CONFIG[app].pre} />
          )}
        </div>
      </div>
    </div>
  );
}
