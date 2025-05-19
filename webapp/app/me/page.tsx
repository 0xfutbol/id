/* eslint-disable no-console */
"use client";

import { useOxFutbolIdContext } from "@0xfutbol/id";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  fetchAccountInfo,
  fetchAssets,
  fetchPacks,
  fetchTokenBalances,
  fetchUltrasNFTs,
  selectAssets,
  selectAssetsError,
  selectAssetsLoading,
  selectDiscordAccount,
  selectMsuBalance,
  selectPacks,
  selectPacksError,
  selectPacksLoading,
  selectReferralCount,
  selectSelectedTab,
  selectTokenVestingBalance,
  selectTokens,
  selectTokensError,
  selectTokensLoading,
  selectUltras,
  selectUltrasError,
  selectUltrasLoading,
  selectUltrasNFTs,
  setSelectedTab
} from "@/store/features/profile";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  GameCards,
  ProfileHeader,
  ProfileTabs,
  TokenVestingBanner
} from "./components";
import { ACHIEVEMENTS, GAME_CARDS } from "./constants";
import { NFTItem } from "./types";

export default function ProfilePage() {
  // Local state
  const [accountLoading, setAccountLoading] = useState(false);
  const [achievementsLoading, setAchievementsLoading] = useState(false);
  
  // Redux
  const dispatch = useAppDispatch();
  const selectedTab = useAppSelector(selectSelectedTab);
  const discordAccount = useAppSelector(selectDiscordAccount);
  const referralCount = useAppSelector(selectReferralCount);
  
  const assets = useAppSelector(selectAssets);
  const assetsError = useAppSelector(selectAssetsError);
  const assetsLoading = useAppSelector(selectAssetsLoading);
  
  const tokens = useAppSelector(selectTokens);
  const msuBalance = useAppSelector(selectMsuBalance);
  const tokenVestingBalance = useAppSelector(selectTokenVestingBalance);
  const tokensError = useAppSelector(selectTokensError);
  const tokensLoading = useAppSelector(selectTokensLoading);
  
  const ultras = useAppSelector(selectUltras);
  const ultrasNFTs = useAppSelector(selectUltrasNFTs);
  const ultrasError = useAppSelector(selectUltrasError);
  const ultrasLoading = useAppSelector(selectUltrasLoading);

  const packs = useAppSelector(selectPacks);
  const packsError = useAppSelector(selectPacksError);
  const packsLoading = useAppSelector(selectPacksLoading);
  
  // External hooks
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab");
  const { address, username } = useOxFutbolIdContext();

  // Handle Discord connection
  const handleConnectDiscord = useCallback(() => {
    const clientId = "1229091313333309480";
    const redirectUri = `${window.location.origin}/discord-oauth`;
    const url = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify%20email`;
    window.location.href = url;
  }, []);

  // Fetch data using Redux thunks
  useEffect(() => {
    setAccountLoading(true);
    setAchievementsLoading(true);
    dispatch(fetchAccountInfo())
      .finally(() => {
        setAccountLoading(false);
        setAchievementsLoading(false);
      });
  }, [dispatch]);

  useEffect(() => {
    if (address) {
      dispatch(fetchAssets(address));
      dispatch(fetchUltrasNFTs(address));
      dispatch(fetchPacks(address));
      dispatch(fetchTokenBalances(address));
    }
  }, [address, dispatch]);

  // Convert string IDs to BigInt for the component props
  const convertedAssets = useMemo(() => {
    const result: Record<string, NFTItem[]> = {};
    
    Object.entries(assets).forEach(([key, items]) => {
      result[key] = items;
    });
    
    return result;
  }, [assets]);

  // Memoized values
  const tabs = useMemo(() => ["achievements", ...Object.keys(assets), "packs", "tokens", "ultras"], [assets]);
  const avatarSrc = ultrasNFTs.length > 0 && ultrasNFTs[0].metadata.image ? ultrasNFTs[0].metadata.image : "";

  // Effects
  useEffect(() => {
    if (initialTab && tabs.includes(initialTab)) dispatch(setSelectedTab(initialTab));
  }, [initialTab, tabs, dispatch]);

  // Callbacks
  const handleTabChange = useCallback((key: string | number) => {
    const tabKey = String(key);
    dispatch(setSelectedTab(tabKey));
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabKey);
    window.history.pushState(null, "", `?${params.toString()}`);
  }, [searchParams, dispatch]);

  // Get ultras data in the format expected by ProfileTabs
  const ultrasForTabs = useMemo(() => {
    return Array.isArray(ultras) ? ultras.map(item => ({
      ...item,
      tokenId: BigInt(item.tokenId), // Convert to BigInt for component
    })) : [];
  }, [ultras]);

  // Render
  return (
    <div className="flex flex-col gap-8 max-w-[1280px] py-4 w-full mx-auto">
      <ProfileHeader
        username={username}
        address={address!}
        discordAccount={discordAccount}
        avatarSrc={avatarSrc}
        onConnectDiscord={handleConnectDiscord}
      />

      <TokenVestingBanner
        tokenVestingBalance={tokenVestingBalance}
        msuBalance={msuBalance}
      />

      <GameCards cards={GAME_CARDS} />

      <ProfileTabs
        selectedTab={selectedTab}
        tabs={tabs}
        assets={convertedAssets}
        tokens={tokens}
        ultras={ultrasForTabs}
        packs={packs}
        achievements={ACHIEVEMENTS}
        assetsError={assetsError}
        tokensError={tokensError}
        ultrasError={ultrasError}
        packsError={packsError}
        referralCount={referralCount}
        assetsLoading={assetsLoading}
        tokensLoading={tokensLoading}
        ultrasLoading={ultrasLoading}
        packsLoading={packsLoading}
        achievementsLoading={achievementsLoading}
        onTabChange={handleTabChange}
      />
    </div>
  );
}