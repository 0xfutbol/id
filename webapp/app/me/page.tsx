"use client";

import { Gallery } from "@/components/gallery";
import { GalleryCard } from "@/components/gallery-card";
import { siteConfig } from "@/config/site";
import { useMsIdContext } from "@/modules/msid/context/useMsIdContext";
import { polygonService } from "@/modules/squid/services/PolygonService";
import { skaleService } from "@/modules/squid/services/SkaleService";
import { chainMetadata } from "@/utils/chainMetadata";
import { Avatar, Button, Card, CardBody, CircularProgress, Tab, Tabs, Tooltip } from "@nextui-org/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ThirdwebContract } from "thirdweb";
import { NFT } from "thirdweb/react";

const achievements = [
  { src: "https://picsum.photos/seed/achievement1/300/200", alt: "Achievement 1", title: "Achievement 1" },
  { src: "https://picsum.photos/seed/achievement2/300/200", alt: "Achievement 2", title: "Achievement 2" },
  { src: "https://picsum.photos/seed/achievement3/300/200", alt: "Achievement 3", title: "Achievement 3" },
  { src: "https://picsum.photos/seed/achievement4/300/200", alt: "Achievement 4", title: "Achievement 4" },
  { src: "https://picsum.photos/seed/achievement5/300/200", alt: "Achievement 5", title: "Achievement 5" },
  { src: "https://picsum.photos/seed/achievement6/300/200", alt: "Achievement 6", title: "Achievement 6" },
];

interface AssetItem {
  contract: ThirdwebContract;
  tokenId: bigint;
  chain: keyof typeof chainMetadata;
}

export default function ProfilePage() {
  const router = useRouter();

  const { address, isAuthenticated, username } = useMsIdContext();

  const [clubs, setClubs] = useState<AssetItem[]>([]);
  const [lands, setLands] = useState<AssetItem[]>([]);
  const [players, setPlayers] = useState<AssetItem[]>([]);
  const [scouts, setScouts] = useState<AssetItem[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!address) return;

    const fetchClubs = async () => {
      try {
        const clubsData = await skaleService.queryClubs(address);
        console.log("clubsData", clubsData);
        const formattedClubs = clubsData.map((club: any) => ({
          contract: siteConfig.contracts.skaleNebula.clubs,
          tokenId: BigInt(club.id),
          chain: "skaleNebula",
        }));
        setClubs(formattedClubs);
      } catch (error) {
        console.error("Error fetching clubs:", error);
      }
    };

    const fetchLands = async () => {
      try {
        const landsData = await polygonService.queryLands(address);
        console.log("landsData", landsData);
        const formattedLands = landsData.map((land: any) => ({
          contract: siteConfig.contracts.polygon.lands,
          tokenId: BigInt(land.id),
          chain: "polygon",
        }));
        setLands(formattedLands);
      } catch (error) {
        console.error("Error fetching lands:", error);
      }
    };

    const fetchPlayers = async () => {
      try {
        const playersData = await polygonService.queryPlayers(address);
        console.log("playersData", playersData);
        const formattedPlayers = playersData.map((player: any) => ({
          contract: siteConfig.contracts.polygon.players,
          tokenId: BigInt(player.id),
          chain: "polygon",
        }));
        setPlayers(formattedPlayers);
      } catch (error) {
        console.error("Error fetching players:", error);
      }
    };

    const fetchScouts = async () => {
      try {
        const scoutsData = await polygonService.queryScouts(address);
        console.log("scoutsData", scoutsData);
        const formattedScouts = scoutsData.map((scout: any) => ({
          contract: siteConfig.contracts.polygon.scouts,
          tokenId: BigInt(scout.id),
          chain: "polygon",
        }));
        setScouts(formattedScouts);
      } catch (error) {
        console.error("Error fetching scouts:", error);
      }
    };

    fetchClubs();
    fetchLands();
    fetchPlayers();
    fetchScouts();
  }, [address]);

  // This is a placeholder. In a real application, you'd fetch this from your user state or API
  const discordAccount = null; // Change to a string value to simulate a connected account

  const handleConnectDiscord = () => {
    // Implement Discord connection logic here
    console.log("Connecting to Discord...");
  };

  const renderAchievementItem = (item: typeof achievements[number]) => (
    <GalleryCard
      title={item.title}
      src={item.src}
      alt=""
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
                src={chainMetadata[item.chain].icon}
                alt={chainMetadata[item.chain].name}
                width={18}
                height={18}
              />
            </Tooltip>
          </div>
        )}
        alt=""
      />
    </NFT>
  );

  return (
    <div className="flex flex-col gap-8 max-w-[1280px] py-8 w-full">
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
                <h2 className="text-2xl font-bold">John Doe</h2>
                <p className="text-gray-400">{username}<span className="text-gray-500">.ms</span></p>
              </div>
            </div>
            <div className="flex items-center">
              {discordAccount ? (
                <>
                  <Image src="/discord-icon.svg" alt="Discord" width={24} height={24} className="mr-2" />
                  <p><strong>Discord:</strong> {discordAccount}</p>
                </>
              ) : (
                <Button 
                  color="primary" 
                  onClick={handleConnectDiscord}
                  startContent={<Image src="/discord-icon.svg" alt="Discord" width={24} height={24} />}
                >
                  Connect Discord
                </Button>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
      <div className="w-full flex-grow">
        <Tabs aria-label="Profile tabs" className="w-full pb-4">
          <Tab key="achievements" title="Achievements">
            <Gallery items={achievements} renderItem={renderAchievementItem} />
          </Tab>
          <Tab key="clubs" title="Clubs">
            <Gallery items={clubs} renderItem={renderAssetItem} />
          </Tab>
          <Tab key="lands" title="Lands">
            <Gallery items={lands} renderItem={renderAssetItem} />
          </Tab>
          <Tab key="players" title="Players">
            <Gallery items={players} renderItem={renderAssetItem} />
          </Tab>
          <Tab key="scouts" title="Scouts">
            <Gallery items={scouts} renderItem={renderAssetItem} />
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}
