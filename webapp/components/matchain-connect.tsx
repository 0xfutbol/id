"use client";

import { Components, MatchProvider } from "@matchain/matchid-sdk-react";

const MatchainConnect: React.FC = () => {
  return (
    <MatchProvider appid="pnh3wxqoqilsa1zy" wallet={{ type: "UserPasscode" }}>
      <Components.LoginButton
        key="matchain_id"
        methods={['telegram', 'twitter']}
        popoverPosition="center"
        popoverType="click"
        popoverGap={10}
        recommendMethods={['wallet', 'email', 'google']}
        walletMethods={['evm', 'sol']}
        onLoginClick={() => {
          console.log('Login button clicked');
        }}
      />
    </MatchProvider>
  );
};

export default MatchainConnect;
