import { Components } from "@matchain/matchid-sdk-react";
import React from "react";

import "@matchain/matchid-sdk-react/index.css";

export const MatchainConnect: React.FC = () => {
  return (
    <div style={{ position: "absolute", top: "-100%" }}>
      <Components.LoginButton
        className={`connect-button-matchain_id`}
        methods={['discord', 'email', 'google', 'telegram', 'twitter']}
        popoverPosition="center"
        popoverType="click"
        popoverGap={10}
        recommendMethods={['email', 'google']}
        walletMethods={['btc', 'evm', 'sol']}
      />
    </div>
  );
};
