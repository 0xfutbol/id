"use client";

import { Avatar, Button, Card, CardBody, CircularProgress, Link, Snippet, Spacer, Tab, Tabs, Tooltip } from "@nextui-org/react";
import Image from "next/image";
import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { SiDiscord } from "react-icons/si";
import { ThirdwebContract } from "thirdweb";
import { NFT, useWalletBalance } from "thirdweb/react";

import { Gallery } from "@/components/gallery";
import { GalleryCard } from "@/components/gallery-card";
import { chains } from "@/config/chains";
import { siteConfig } from "@/config/site";
import { useMsIdContext } from "@/modules/msid/context/useMsIdContext";
import { accountService } from "@/modules/msid/services/AccountService";
import { polygonService } from "@/modules/squid/services/PolygonService";
import { getImgUrl } from "@/utils/getImgUrl";

interface Achievement {
  src: string;
  alt: string;
  title: string;
  isAchieved: (params: { referralCount: number }) => boolean;
}

const ACHIEVEMENTS: Achievement[] = [
  { 
    src: "https://assets.metasoccer.com/badges/early-adopter.png?v=2", 
    alt: "Early Adopter Medal", 
    title: "Early Adopter",
    isAchieved: () => true // Always achieved for now
  },
  {
    src: "https://assets.metasoccer.com/badges/referrer.png?v=2",
    alt: "Referrer Medal",
    title: "Referrer",
    isAchieved: ({ referralCount }) => referralCount >= 3
  }
];

interface AssetItem {
  contract: ThirdwebContract;
  tokenId: bigint;
  chain: keyof typeof chains;
}

interface TokenItem {
  address: string;
  symbol: string;
  balance: string;
  chain: keyof typeof chains;
}

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');
  
  const { address, username, validJWT } = useMsIdContext();

  const [assets, setAssets] = useState<{ [key: string]: AssetItem[] }>({
    lands: [],
    players: [],
    scouts: [],
  });

  const [discordAccount, setDiscordAccount] = useState<string | null>(null);
  const [referralCount, setReferralCount] = useState<number>(0);

  const [selectedTab, setSelectedTab] = useState<string>("achievements");

  const { data: msuBalance } = useWalletBalance({
    tokenAddress: "0xe8377A076adAbb3F9838afB77Bee96Eac101ffB1",
    client: siteConfig.thirdwebClient,
    chain: chains.polygon.ref,
    address,
  });

  const { data: xFutbolBalance } = useWalletBalance({
    tokenAddress: "0x2C8b1699170135E486C4dB52F46f439B4967b4c9",
    client: siteConfig.thirdwebClient,
    chain: chains.xdcApothem.ref,
    address,
  });

  const { data: msaBalance } = useWalletBalance({
    tokenAddress: "0x02aea6F7742Fb098b4EEF3B4C4C1FeB1d3426f1B",
    client: siteConfig.thirdwebClient,
    chain: chains.polygon.ref,
    address,
  });

  const tokens = useMemo(() => {
    const formatBalance = (balance: string | undefined) => {
      const num = Number(balance ?? "0");
      return num.toFixed(num % 1 === 0 ? 0 : 2);
    };

    return [
      {
        address: "0xe8377A076adAbb3F9838afB77Bee96Eac101ffB1",
        symbol: "MSU",
        balance: formatBalance(msuBalance?.displayValue),
        chain: "polygon" as keyof typeof chains
      },
      {
        address: "0x02aea6F7742Fb098b4EEF3B4C4C1FeB1d3426f1B",
        symbol: "MSA",
        balance: formatBalance(msaBalance?.displayValue),
        chain: "polygon" as keyof typeof chains
      },
      {
        address: "0x2C8b1699170135E486C4dB52F46f439B4967b4c9",
        symbol: "FUTBOL",
        balance: formatBalance(xFutbolBalance?.displayValue),
        chain: "xdcApothem" as keyof typeof chains
      },
    ];
  }, [msuBalance, xFutbolBalance, msaBalance]);

  const tabs = useMemo(() => ["achievements", ...Object.keys(assets), "tokens"], [assets]);

  const fetchAccountInfo = useCallback(async () => {
    if (!validJWT) return;
    try {
      const info = await accountService.getInfo(validJWT);
      if (info.discord?.info?.username) {
        setDiscordAccount(info.discord.info.username);
      }
      setReferralCount(info.referralCount);
    } catch (error) {
      console.error("Error fetching account info:", error);
    }
  }, [validJWT]);

  const fetchAssets = useCallback(async () => {
    if (!address) return;
    try {
      const [landsData, playersData, scoutsData] = await Promise.all([
        polygonService.queryLands(address),
        polygonService.queryPlayers(address),
        polygonService.queryScouts(address),
      ]);

      setAssets({
        lands: landsData.map((land: any) => ({
          contract: siteConfig.contracts.polygon.lands,
          tokenId: BigInt(land.id),
          chain: "polygon",
        })),
        players: playersData.map((player: any) => ({
          contract: siteConfig.contracts.polygon.players,
          tokenId: BigInt(player.id),
          chain: "polygon",
        })),
        scouts: scoutsData.map((scout: any) => ({
          contract: siteConfig.contracts.polygon.scouts,
          tokenId: BigInt(scout.id),
          chain: "polygon",
        })),
      });
    } catch (error) {
      console.error("Error fetching assets:", error);
    }
  }, [address]);

  useEffect(() => {
    if (address && validJWT) {
      fetchAccountInfo();
      fetchAssets();
    }
  }, [address, validJWT, fetchAccountInfo, fetchAssets]);

  useEffect(() => {
    if (tab && tabs.includes(tab)) {
      setSelectedTab(tab);
    }
  }, [tab, tabs]);

  const handleConnectDiscord = () => {
    const clientId = "1229091313333309480";
    const redirectUri = `${window.location.origin}/discord-oauth`;
    window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify%20email`;
  };

  const handleTabChange = useCallback((key: string) => {
    setSelectedTab(key);
    const params = new URLSearchParams(searchParams);
    params.set('tab', key);
    window.history.pushState(null, '', `?${params.toString()}`);
  }, [searchParams]);

  const renderAchievementItem = useCallback((item: Achievement) => (
    <GalleryCard
      key={item.title}
      title={item.title}
      src={getImgUrl(item.src)}
      alt={item.alt}
    />
  ), []);

  const renderAssetItem = useCallback((item: AssetItem) => (
    <NFT key={`${item.chain}-${item.tokenId}`} contract={item.contract} tokenId={item.tokenId}>
      <GalleryCard
        title={(
          <Suspense fallback={<></>}>
            <NFT.Name />
          </Suspense>
        )}
        src={(
          <Suspense fallback={<div className="flex h-full items-center justify-center w-full"><CircularProgress color="default" size="sm" /></div>}>
            <NFT.Media style={{ width: "100%", height: "100%" }} />
          </Suspense>
        )}
        headerComponent={(
          <div className="flex f-full justify-end">
            <Tooltip content={chains[item.chain].name}>
              <Image
                alt={chains[item.chain].name}
                src={chains[item.chain].icon}
                width={18} height={18}
              />
            </Tooltip>
          </div>
        )}
        alt=""
      />
    </NFT>
  ), []);

  const renderTokenItem = useCallback((item: TokenItem) => (
    <GalleryCard
      key={item.symbol}
      title={`${item.balance} ${item.symbol}`}
      src={getImgUrl(`https://assets.metasoccer.com/tokens/${item.symbol.toLowerCase()}.png`)}
      alt={`${item.symbol} token`}
      headerComponent={
        <div className="flex f-full justify-end">
          <Tooltip content={chains[item.chain].name}>
            <Image
              alt={chains[item.chain].name}
              src={chains[item.chain].icon}
              width={18} height={18}
            />
          </Tooltip>
        </div>
      }
    />
  ), []);

  const achievedAchievements = useMemo(() => 
    ACHIEVEMENTS.filter(achievement => achievement.isAchieved({ referralCount })),
    [referralCount]
  );

  return (
    <div className="flex flex-col gap-8 max-w-[1280px] py-4 w-full">
      <Card className="w-full">
        <CardBody>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Avatar 
                src={`https://effigy.im/a/${address ?? "0x0000000000000000000000000000000000000000"}.png`}
                size="lg" 
                className="mr-4"
              />
              <div>
                <p className="text-gray-400">{username}<span className="text-gray-500">.ms</span></p>
              </div>
            </div>
            <div className="flex items-center">
              {discordAccount ? (
                <div className="flex items-center gap-2">
                  <SiDiscord width={24} height={24} />
                  <p>{discordAccount}</p>
                </div>
              ) : (
                <Button 
                  color="primary" 
                  startContent={<SiDiscord width={24} height={24} />}
                  onClick={handleConnectDiscord}
                >
                  Connect Discord
                </Button>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
      <Snippet symbol="" codeString={`${window.location.origin}?referrer=${address}`} color="success">
        <span className="text-wrap">MetaSoccer's referral program is live! Invite your friends to join the game, and you'll earn the Referrer Medal. Simply copy your <Link href={`${window.location.origin}?referrer=${address}`} isExternal showAnchorIcon>referral link</Link> and share it with them</span>
        <Spacer y={1} />
        <span className="text-wrap">Referrals: {referralCount}</span>
      </Snippet>
      <div className="w-full flex-grow">
        <Tabs 
          aria-label="Profile tabs" 
          className="w-full pb-4"
          selectedKey={selectedTab}
          onSelectionChange={(key) => handleTabChange(key as string)}
        >
          <Tab key="achievements" title="Achievements">
            <Gallery items={achievedAchievements} renderItem={renderAchievementItem} />
          </Tab>
          {Object.entries(assets).map(([key, items]) => (
            <Tab key={key} title={key.charAt(0).toUpperCase() + key.slice(1)}>
              <Gallery items={items} renderItem={renderAssetItem} />
            </Tab>
          ))}
          <Tab key="tokens" title="Tokens">
            <Gallery items={tokens} renderItem={renderTokenItem} />
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}
