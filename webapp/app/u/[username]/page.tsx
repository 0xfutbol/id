/* eslint-disable no-console */
"use client";

import { useOxFutbolIdContext } from "@0xfutbol/id";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  fetchAssets,
  fetchPacks,
  fetchPublicAccountInfoByUsername,
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
  selectViewingUserAddress,
  selectViewingUserUsername,
  setSelectedTab
} from "@/store/features/profile";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  GameCards,
  ProfileHeader,
  ProfileTabs
} from "../../me/components";
import { ACHIEVEMENTS, GAME_CARDS } from "../../me/constants";
import { NFTItem } from "../../me/types";

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  
  // Get current user context
  const { address: currentUserAddress, username: currentUserUsername, authStatus } = useOxFutbolIdContext();
  
  // Local state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [achievementsLoading, setAchievementsLoading] = useState(false);
  
  // Redux
  const dispatch = useAppDispatch();
  const selectedTab = useAppSelector(selectSelectedTab);
  const discordAccount = useAppSelector(selectDiscordAccount);
  const referralCount = useAppSelector(selectReferralCount);
  const viewingUserAddress = useAppSelector(selectViewingUserAddress);
  const viewingUserUsername = useAppSelector(selectViewingUserUsername);
  
  const assets = useAppSelector(selectAssets);
  const assetsError = useAppSelector(selectAssetsError);
  const assetsLoading = useAppSelector(selectAssetsLoading);
  
  const tokens = useAppSelector(selectTokens);
  const tokensError = useAppSelector(selectTokensError);
  const tokensLoading = useAppSelector(selectTokensLoading);
  
  const ultras = useAppSelector(selectUltras);
  const ultrasError = useAppSelector(selectUltrasError);
  const ultrasLoading = useAppSelector(selectUltrasLoading);

  const packs = useAppSelector(selectPacks);
  const packsError = useAppSelector(selectPacksError);
  const packsLoading = useAppSelector(selectPacksLoading);

  const pip = useAppSelector(selectPip);

  // Check if user is viewing their own profile
  const isViewingOwnProfile = useMemo(() => {
    if (authStatus !== "authenticated" || !currentUserUsername) return false;
    return currentUserUsername.toLowerCase() === username.toLowerCase();
  }, [authStatus, currentUserUsername, username]);

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
  const avatarSrc = pip || `https://api.dicebear.com/9.x/shapes/svg?seed=${viewingUserAddress}`;

  // Callbacks
  const handleTabChange = useCallback((key: string | number) => {
    const tabKey = String(key);
    dispatch(setSelectedTab(tabKey));
  }, [dispatch]);

  // Get ultras data in the format expected by ProfileTabs
  const ultrasForTabs = useMemo(() => {
    return Array.isArray(ultras) ? ultras.map(item => ({
      ...item,
      tokenId: BigInt(item.tokenId), // Convert to BigInt for component
    })) : [];
  }, [ultras]);

  // Redirect to /me if user is viewing their own profile
  useEffect(() => {
    if (isViewingOwnProfile) {
      router.replace('/me');
      return;
    }
  }, [isViewingOwnProfile, router]);

  // Fetch user data
  useEffect(() => {
    if (!username || isViewingOwnProfile) return;

    setLoading(true);
    setError(null);
    
    dispatch(fetchPublicAccountInfoByUsername(username))
      .unwrap()
      .then(() => {
        setAchievementsLoading(true);
        setLoading(false);
        setAchievementsLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load user profile');
        setLoading(false);
      });
  }, [username, dispatch, isViewingOwnProfile]);

  // Fetch assets when we have the address
  useEffect(() => {
    if (viewingUserAddress && !isViewingOwnProfile) {
      dispatch(fetchAssets(viewingUserAddress));
      dispatch(fetchUltrasNFTs(viewingUserAddress));
      dispatch(fetchPacks(viewingUserAddress));
      dispatch(fetchTokenBalances(viewingUserAddress));
    }
  }, [viewingUserAddress, dispatch, isViewingOwnProfile]);

  // Don't render anything if redirecting
  if (isViewingOwnProfile) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg">Redirecting to your profile...</div>
      </div>
    );
  }

  // Determine if we're viewing another user (always true for this page since we redirect if viewing own profile)
  const isViewingOtherUser = true;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg">Loading user profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="text-lg text-red-500">Error: {error}</div>
        <button 
          onClick={() => router.push('/me')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go to My Profile
        </button>
      </div>
    );
  }

  // Render
  return (
    <div className="flex flex-col gap-4 max-w-screen-xl p-4 md:px-0 w-full mx-auto">
      <ProfileHeader
        username={viewingUserUsername || undefined}
        address={viewingUserAddress}
        discordAccount={discordAccount}
        avatarSrc={avatarSrc}
        isViewingOtherUser={isViewingOtherUser}
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
        isViewingOtherUser={isViewingOtherUser}
      />
    </div>
  );
} 