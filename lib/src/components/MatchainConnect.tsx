import { Components } from "@matchain/matchid-sdk-react";
import React, { useEffect, useRef } from "react";

import "@matchain/matchid-sdk-react/index.css";

export const MatchainConnect: React.FC = () => {
  const instanceId = useRef(`matchain_${Math.random().toString(36).substring(2, 10)}`);

  useEffect(() => {
    console.log(`[Matchain ID ${instanceId.current}] Component initialized`);

    return () => {
      console.log(`[Matchain ID ${instanceId.current}] Component unmounted`);
    };
  }, []);

  return (
    <Components.LoginButton
      key={instanceId.current}
      className={`connect-button-matchain_id`}
      methods={['telegram', 'twitter']}
      popoverPosition="center"
      popoverType="click"
      popoverGap={10}
      recommendMethods={['email', 'google']}
      walletMethods={[]}
    />
  );
};
