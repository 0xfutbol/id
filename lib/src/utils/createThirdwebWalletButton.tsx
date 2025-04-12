import React from "react";

import { thirdwebClient } from "@/config";
import { ConnectButton } from "thirdweb/react";
import { Wallet } from "thirdweb/wallets";

export const createThirdwebWalletButton = (key: string, label: string, wallet: Wallet) => {
  return (
    <ConnectButton
      key={key}
      client={thirdwebClient}
      connectButton={{
        className: `connect-button-${key}`,
        label: label,
        style: {
          opacity: 0,
          position: "absolute",
        },
      }}
      connectModal={{
        size: "compact",
        showThirdwebBranding: false,
        privacyPolicyUrl: "https://0xfutbol.com/privacy-policy",
        termsOfServiceUrl: "https://0xfutbol.com/terms-of-service",
      }}
      wallets={[wallet]}
    />
  );
}