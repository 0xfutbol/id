"use client";

import { ClaimForm } from "@/components/claim-form";
import { LoginForm } from "@/components/login-form";
import { useMsIdContext } from "@/modules/msid/context/useMsIdContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isClaimPending } = useMsIdContext();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/me");
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-full">
      <div className="flex-1 h-full">
        <img
          src="https://assets.metasoccer.com/ui/login/1.png"
          alt="MetaSoccer Background"
          className="object-cover w-full h-full"
        />
      </div>
      <div className="flex-1 flex items-center justify-center p-8 bg-background h-screen">
        {isClaimPending ? <ClaimForm /> : <LoginForm />}
      </div>
    </div>
  );
}
