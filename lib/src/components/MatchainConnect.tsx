import { Components, Hooks } from "@matchain/matchid-sdk-react";
import React, { useEffect, useRef } from "react";
import { useActiveWallet, useConnect } from "thirdweb/react";
import type { Wallet } from "thirdweb/src/wallets/interfaces/wallet.js";
import { WalletEmitterEvents } from "thirdweb/wallets";

import { chains, thirdwebClient } from "@/config";
import { createEmitter } from "@/utils";

import "@matchain/matchid-sdk-react/index.css";

const emitter = createEmitter<WalletEmitterEvents<"embedded">>();

type MatchainUserInfo = ReturnType<typeof Hooks.useUserInfo>;
type MatchainWallet = ReturnType<typeof Hooks.useWallet>;

export const createMatchainWallet = (userInfo: MatchainUserInfo, wallet: MatchainWallet) => {
  // Override signMessage only once when creating the wallet
  if (wallet.evmAccount && wallet.evmAccount.signMessage) {
    wallet.evmAccount.signMessage = async (params) => {
      console.log("[Matchain ID] Signing message with params:", params);
      return wallet.signMessage({
        message: params.message,
        // @ts-ignore
        chainType: "ethereum"
      });
    };
  }

  return {
    id: "embedded",
    subscribe: emitter.subscribe,
    getChain() { 
      return chains.matchain.ref; 
    },
    getConfig: () => {
      return {};
    },
    getAccount: () => {
      return wallet.evmAccount;
    },
    getProfiles: async () => {
      throw new Error("Not implemented");
    },
    autoConnect: async () => {
      throw new Error("Not implemented");
    },
    connect: async () => {
      throw new Error("Not implemented");
    },
    disconnect: async () => {
      try {
        console.log("[Matchain ID] Disconnecting wallet");
        await userInfo.logout();
        console.log("[Matchain ID] Logout successful");
      } catch (error) {
        console.warn("[Matchain ID] Failed to disconnect wallet", error);
      }
    },
    switchChain: async (newChain) => {
      console.error("[Matchain ID] Chain switching attempted but not supported", { requestedChain: newChain });
      throw new Error("Switch chain not supported");
    }
  } as Wallet<"embedded">;
}

export const MatchainConnect: React.FC = () => {
  const isConnecting = useRef(false);

  const activeWallet = useActiveWallet();
  const { connect } = useConnect({
    client: thirdwebClient,
  });

  const matchIdUser = Hooks.useUserInfo();
  const matchIdWallet = Hooks.useWallet();

  Hooks.useMatchEvents({
    onLogin: () => {
      console.log("[Matchain ID] Login");
    },
    onLogout: () => {
      console.log("[Matchain ID] Logout");
    }
  });

  useEffect(() => {
    if (isConnecting.current) return;
    if (!matchIdUser.isLogin) return;
    if (!matchIdWallet.walletReady) return;

    console.log("[Matchain ID] Ready to connect to thirdweb");

    (async () => {
      try {
        isConnecting.current = true;
        await connect(createMatchainWallet(matchIdUser, matchIdWallet));
        console.log("[Matchain ID] Wallet connection initiated");
      } catch (error) {
        await matchIdUser.logout();
        console.error("[Matchain ID] Failed to connect wallet", error);
      } finally {
        isConnecting.current = false;
      }
    })();
  }, [matchIdUser, matchIdWallet, connect]);

  return (
    <Components.LoginButton
      key="matchain_id"
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
