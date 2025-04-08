"use client";

import { AppConfig } from "@/config/apps";
import { useMsIdContext } from "@/modules/msid/context/useMsIdContext";
import { MatchProvider, wagmiConfig } from "@matchain/matchid-sdk-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { WagmiProvider } from 'wagmi';
import { ClaimForm } from "./claim-form";
import { ConnectForm } from "./connect-form";

const LoginForm: React.FC<{ appConfig: AppConfig }> = ({ appConfig }) => {
  const { isClaimPending } =
    useMsIdContext();

  const queryClient = new QueryClient();
  
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <MatchProvider appid="pnh3wxqoqilsa1zy" wallet={{ type: "Base" }}>
          <div className="flex max-w-[386px] flex-col gap-8 transition-[height] duration-300 ease-in-out">
            <div className="flex items-center justify-center">
              {appConfig.logo}
            </div>
            {isClaimPending ? (
              <ClaimForm />
            ) : (
              <ConnectForm pre={appConfig.pre} />
            )}
          </div>
        </MatchProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
};

export default LoginForm;