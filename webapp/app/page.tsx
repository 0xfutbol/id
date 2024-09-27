"use client";

import { ClaimForm } from "@/components/claim-form";
import { LoginForm } from "@/components/login-form";
import { useMsIdContext } from "@/modules/msid/context/useMsIdContext";
import { getImgUrl } from "@/utils/getImgUrl";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { isAuthenticated, isClaimPending, isSwitchingChain } = useMsIdContext();

  const clientId = "https://manag3r.metasoccer.com";

  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/me");
    }
  }, [router, isAuthenticated]);

  if (isAuthenticated) {
    return null;
  }

  const getLogo = () => {
    if (clientId === "https://manag3r.metasoccer.com") {
      return (
        <img
          alt="MetaSoccer Manag3r"
          src={getImgUrl("https://assets.metasoccer.com/manag3r.png")}
          style={{ height: "40px", width: "auto" }}
        />
      );
    } else {
      return (
        <img
          alt="MetaSoccer ID Logo"
          src={getImgUrl("https://assets.metasoccer.com/msid-logo.png")}
          style={{ height: "40px", width: "auto" }}
        />
      );
    }
  };

  const getPre = () => {
    if (clientId === "https://manag3r.metasoccer.com") {
      return (
        <>
          <p className="text-sm">Connect your MetaSoccer ID to start playing.</p>
          <div className="flex items-start gap-2">
            <p className="text-sm text-foreground-500">
              MetaSoccer ID is your unique identifier in the MetaSoccer World—think of it like your username for any MetaSoccer game.
            </p>
          </div>
          <p className="text-sm">Don’t have one yet? No worries! Just connect your wallet, and you’ll be able to claim yours instantly.</p>
        </>
      );
    } else {
      return (
        <>
          <p className="text-sm">Connect to get your MetaSoccer ID.</p>
          <div className="flex items-start gap-2">
            <p className="text-sm text-foreground-500">
              MetaSoccer ID is your unique identifier in the MetaSoccer World—think of it like your username for any MetaSoccer game.
            </p>
          </div>
          <p className="text-sm">Don’t have one yet? No worries! Just connect your wallet, and you’ll be able to claim yours instantly.</p>
        </>
      );
    }
  };

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
          <div className="flex items-center justify-center">{getLogo()}</div>
          {isSwitchingChain ? (
            <p className="text-center text-sm text-foreground-500">
              MetaSoccer ID operates on the SKALE network. Please switch to SKALE to proceed.
            </p>
          ) : isClaimPending ? (
            <ClaimForm />
          ) : (
            <LoginForm pre={getPre()} />
          )}
        </div>
      </div>
    </div>
  );
}
