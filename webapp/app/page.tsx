"use client";

import { ClaimForm } from "@/components/claim-form";
import { LoginForm } from "@/components/login-form";
import { useMsIdContext } from "@/modules/msid/context/useMsIdContext";
import { getImgUrl } from "@/utils/getImgUrl";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isClaimPending, isSwitchingChain } = useMsIdContext();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/me");
    }
  }, [isAuthenticated, router]);

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
            <img alt="MetaSoccer ID Logo" src={getImgUrl("https://assets.metasoccer.com/msid-logo.png")} style={{ height: "40px", width: "auto" }} />
          </div>
          {isSwitchingChain ? (
            <p className="text-center text-sm text-foreground-500">MetaSoccer ID operates on the SKALE network. Please switch to SKALE to proceed.</p>
          ) : (
            isClaimPending ? <ClaimForm /> : <LoginForm />
          )}
        </div>
      </div>
    </div>
  );
}
