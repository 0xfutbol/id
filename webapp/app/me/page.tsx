"use client";

import { Avatar, Button, Card, CardBody, CircularProgress, Tab, Tabs, Tooltip } from "@nextui-org/react";
import axios from 'axios';
import Image from "next/image";
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from "react";
import { SiDiscord } from "react-icons/si";
import { ThirdwebContract } from "thirdweb";
import { NFT } from "thirdweb/react";

import { Gallery } from "@/components/gallery";
import { GalleryCard } from "@/components/gallery-card";
import { siteConfig } from "@/config/site";
import { useMsIdContext } from "@/modules/msid/context/useMsIdContext";
import { polygonService } from "@/modules/squid/services/PolygonService";
import { skaleService } from "@/modules/squid/services/SkaleService";
import { chainMetadata } from "@/utils/chainMetadata";
import { getImgUrl } from "@/utils/getImgUrl";

const ACHIEVEMENTS = [
  { src: "https://assets.metasoccer.com/badges/early-adopter.png?v=1", alt: "Early Adopter Medal", title: "Early Adopter" },
];

interface AssetItem {
  contract: ThirdwebContract;
  tokenId: bigint;
  chain: keyof typeof chainMetadata;
}

export default function ProfilePage() {
  const { address, username, validJWT } = useMsIdContext();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');

  const [discordAccount, setDiscordAccount] = useState<string | null>(null);
  const [assets, setAssets] = useState<{ [key: string]: AssetItem[] }>({
    // clubs: [],
    lands: [],
    players: [],
    scouts: [],
  });

  const tabs = ["achievements", ...Object.keys(assets)];
  const [selectedTab, setSelectedTab] = useState<string>("achievements");

  useEffect(() => {
    if (tab && tabs.includes(tab)) {
      setSelectedTab(tab);
    }
  }, [tab, tabs]);

  useEffect(() => {
    if (!address || !validJWT) return;

    const fetchDiscordAccount = async () => {
      try {
        const response = await axios.get(`${siteConfig.backendUrl}/account/discord`, {
          headers: { 'Authorization': `Bearer ${validJWT}` }
        });
        if (response.data?.info?.username) {
          setDiscordAccount(response.data.info.username);
        }
      } catch (error) {
        console.error("Error fetching Discord account:", error);
      }
    };

    const fetchAssets = async () => {
      try {
        const [clubsData, landsData, playersData, scoutsData] = await Promise.all([
          skaleService.queryClubs(address),
          polygonService.queryLands(address),
          polygonService.queryPlayers(address),
          polygonService.queryScouts(address),
        ]);

        setAssets({
          // clubs: clubsData.map((club: any) => ({
          //   contract: siteConfig.contracts.skaleNebula.clubs,
          //   tokenId: BigInt(club.id),
          //   chain: "skaleNebula",
          // })),
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
    };

    fetchDiscordAccount();
    fetchAssets();
  }, [address, validJWT]);

  const handleConnectDiscord = () => {
    const clientId = "1229091313333309480";
    const redirectUri = `${window.location.origin}/discord-oauth`;
    window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify%20email`;
  };

  const renderAchievementItem = (item: typeof ACHIEVEMENTS[number]) => (
    <GalleryCard
      title={item.title}
      src={getImgUrl(item.src)}
      alt={item.alt}
    />
  );

  const renderAssetItem = (item: AssetItem) => (
    <NFT contract={item.contract} tokenId={item.tokenId}>
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
            <Tooltip content={chainMetadata[item.chain].name}>
              <Image
                alt={chainMetadata[item.chain].name}
                src={chainMetadata[item.chain].icon}
                width={18} height={18}
              />
            </Tooltip>
          </div>
        )}
        alt=""
      />
    </NFT>
  );

  const handleTabChange = (key: string) => {
    setSelectedTab(key);
    const params = new URLSearchParams(searchParams);
    params.set('tab', key);
    window.history.pushState(null, '', `?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-8 max-w-[1280px] py-4 w-full">
      <Card className="w-full">
        <CardBody>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Avatar 
                src={`https://effigy.im/a/${address}.png`}
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
      <div className="w-full flex-grow">
        <Tabs 
          aria-label="Profile tabs" 
          className="w-full pb-4"
          selectedKey={selectedTab}
          onSelectionChange={(key) => handleTabChange(key as string)}
        >
          <Tab key="achievements" title="Achievements">
            <Gallery items={ACHIEVEMENTS} renderItem={renderAchievementItem} />
          </Tab>
          {Object.entries(assets).map(([key, items]) => (
            <Tab key={key} title={key.charAt(0).toUpperCase() + key.slice(1)}>
              <Gallery items={items} renderItem={renderAssetItem} />
            </Tab>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
