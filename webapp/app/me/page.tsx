/* eslint-disable no-console */
"use client";

import { useOxFutbolIdContext } from "@0xfutbol/id";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { accountService } from "@/modules/account/account-service";
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
  selectPacks,
  selectPacksError,
  selectPacksLoading,
  selectPip,
  selectReferralCount,
  selectSelectedTab,
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
  ProfileTabs
} from "./components";
import { AirdropClaimBanner } from "./components/AirdropClaimBanner";
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
  const tokensError = useAppSelector(selectTokensError);
  const tokensLoading = useAppSelector(selectTokensLoading);
  
  const ultras = useAppSelector(selectUltras);
  const ultrasNFTs = useAppSelector(selectUltrasNFTs);
  const ultrasError = useAppSelector(selectUltrasError);
  const ultrasLoading = useAppSelector(selectUltrasLoading);

  const packs = useAppSelector(selectPacks);
  const packsError = useAppSelector(selectPacksError);
  const packsLoading = useAppSelector(selectPacksLoading);

  const pip = useAppSelector(selectPip);

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

  // If user has no PiP but has ultras, set PiP to lowest tokenId ultra
  useEffect(() => {
    if (!pip && ultrasNFTs.length > 0 && address) {
      // Find the lowest tokenId
      const lowestUltra = ultrasNFTs.reduce((prev, curr) => {
        return BigInt(prev.id) < BigInt(curr.id) ? prev : curr;
      });
      // Call backend to update PiP using the service
      accountService.updatePiP(lowestUltra.id)
        .then(() => {
          dispatch(fetchAccountInfo());
        })
        .catch((err: any) => console.error("Failed to update PiP", err));
    }
  }, [pip, ultrasNFTs, address, dispatch]);

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
  const avatarSrc = pip || `https://api.dicebear.com/9.x/shapes/svg?seed=${address}`;

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

  // Only show the claim banner until September 10th, 2025
  const showAirdropClaimBanner = useMemo(() => {
    // September 10th, 2025 at 23:59:59 UTC
    const deadline = new Date(Date.UTC(2025, 8, 10, 23, 59, 59));
    return new Date() < deadline;
  }, []);

  // Render
  return (
    <div className="flex flex-col gap-4 max-w-screen-xl p-4 md:px-0 w-full mx-auto">
      <ProfileHeader
        username={username}
        address={address!}
        discordAccount={discordAccount}
        avatarSrc={avatarSrc}
        onConnectDiscord={handleConnectDiscord}
      />

      {showAirdropClaimBanner && <AirdropClaimBanner />}

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