/* eslint-disable no-console */
"use client";

import { chains, useOxFutbolIdContext } from "@0xfutbol/id";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardFooter,
  Chip,
  Image,
  Link,
  Image as NextImage,
  Snippet,
  Spacer,
  Tab,
  Tabs,
  Tooltip
} from "@nextui-org/react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SiDiscord } from "react-icons/si";

import { Gallery } from "@/components/gallery";
import { GalleryCard } from "@/components/gallery-card";
import { siteConfig } from "@/config/site";
import { bobaService } from "@/modules/squid/services/BobaService";
import { matchainService } from "@/modules/squid/services/MatchainService";
import { polygonService } from "@/modules/squid/services/PolygonService";
import { xdcService } from "@/modules/squid/services/XdcService";
import { accountService } from "@/services/accountService";
import { erc20Abi } from "@/utils/erc20Abi";
import { getImgUrl } from "@/utils/getImgUrl";
import { ChainName } from "@0xfutbol/constants";

// Interfaces
interface NFTData {
  id: bigint;
  metadata: {
    image?: string;
    name?: string;
  };
}

interface Achievement {
  src: string;
  alt: string;
  title: string;
  isAchieved: (params: { referralCount: number }) => boolean;
}

interface AssetItem {
  chain: keyof typeof chains;
  image: string;
  name: string;
  tokenId: bigint;
}

interface TokenItem {
  address: string;
  symbol: string;
  balance: string;
  chain: keyof typeof chains;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    src: "https://assets.metasoccer.com/badges/early-adopter.png?v=2",
    alt: "Early Adopter Medal",
    title: "Early Adopter",
    isAchieved: () => true,
  },
  {
    src: "https://assets.metasoccer.com/badges/referrer.png?v=2",
    alt: "Referrer Medal",
    title: "Referrer",
    isAchieved: ({ referralCount }) => referralCount >= 3,
  },
];

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab");
  const { address, isAuthenticated, username, newContract } = useOxFutbolIdContext();

  // State declarations with proper typing
  const [assets, setAssets] = useState<{ [key: string]: AssetItem[] }>({ lands: [], players: [], scouts: [] });
  const [discordAccount, setDiscordAccount] = useState<string | null>(null);
  const [referralCount, setReferralCount] = useState<number>(0);
  const [selectedTab, setSelectedTab] = useState<string>("achievements");
  const [ultras, setUltras] = useState<AssetItem[]>([]);
  const [msuBalance, setMsuBalance] = useState<string>("0");
  const [msaBalance, setMsaBalance] = useState<string>("0");
  const [futbolBalance, setFutbolBalance] = useState<string>("0");
  const [futbolXdcBalance, setFutbolXdcBalance] = useState<string>("0");
  const [tokenVestingBalance, setTokenVestingBalance] = useState<string>("0");
  const [ultrasNFTs, setUltrasNFTs] = useState<NFTData[]>([]);
  const [assetsError, setAssetsError] = useState<string | null>(null);
  const [tokensError, setTokensError] = useState<string | null>(null);
  const [ultrasError, setUltrasError] = useState<string | null>(null);

  // Consolidated token balance fetching
  useEffect(() => {
    async function fetchTokenBalances() {
      if (!address || !newContract) return;

      try {
        const [msuContract, msaContract, futbolContract, futbolXdcContract, vestingContract] = await Promise.all([
          newContract("polygon", "0xe8377A076adAbb3F9838afB77Bee96Eac101ffB1", erc20Abi),
          newContract("polygon", "0x02aea6F7742Fb098b4EEF3B4C4C1FeB1d3426f1B", erc20Abi),
          newContract("polygon", "0x3D45987F1C8812913a80Efbe3aCdd91DA8676E9c", erc20Abi), // Base workaround
          newContract("xdc", "0x2C8b1699170135E486C4dB52F46f439B4967b4c9", erc20Abi),
          newContract("base", siteConfig.contracts.ethereumSepolia.tokenVesting.address, erc20Abi), // Sepolia workaround
        ]);

        const [msuBal, msaBal, futbolBal, futbolXdcBal, vestingBal] = await Promise.all([
          msuContract.balanceOf(address),
          msaContract.balanceOf(address),
          futbolContract.balanceOf(address),
          futbolXdcContract.balanceOf(address),
          vestingContract.balanceOf(address),
        ]);

        setMsuBalance(msuBal.toString());
        setMsaBalance(msaBal.toString());
        setFutbolBalance(futbolBal.toString());
        setFutbolXdcBalance(futbolXdcBal.toString());
        setTokenVestingBalance(vestingBal.toString());
        setTokensError(null);
      } catch (error) {
        console.error("Error fetching token balances:", error);
        setTokensError("Failed to load token balances. Please try again later.");
      }
    }

    fetchTokenBalances();
  }, [address, newContract]);

  // Fetch Ultras NFTs
  useEffect(() => {
    async function fetchUltrasNFTs() {
      if (!address || !newContract) return;

      try {
        const contract = newContract("base", siteConfig.contracts.base.ultras.address, siteConfig.contracts.base.ultras.abi!);
        console.log("contract", contract);
        const balance = await contract.balanceOf(address);
        console.log("balance", balance);
        contract.balanceOf(address).then((balance: any) => {
          console.log("balance", balance);
        });
        const tokenCount = Number(balance);
        const nfts: NFTData[] = [];

        for (let i = 0; i < tokenCount; i++) {
          try {
            const tokenId = await contract.tokenOfOwnerByIndex(address, i);
            const tokenURI = await contract.tokenURI(tokenId);
            let metadata = { name: `NFT #${tokenId}` };
            try {
              if (tokenURI.startsWith('http')) {
                const response = await fetch(tokenURI);
                metadata = await response.json();
              } else if (tokenURI.startsWith('data:application/json;base64,')) {
                const base64 = tokenURI.replace('data:application/json;base64,', '');
                const decoded = atob(base64);
                metadata = JSON.parse(decoded);
              }
            } catch (metadataError) {
              console.error(`Error parsing metadata for token ${tokenId}:`, metadataError);
            }
            nfts.push({ id: tokenId, metadata });
          } catch (tokenError) {
            console.error(`Error fetching token at index ${i}:`, tokenError);
          }
        }

        setUltrasNFTs(nfts);
        setUltrasError(null);
      } catch (error) {
        console.error("Error fetching Ultras NFTs:", error);
        setUltrasError("Failed to load Ultras NFTs. Please try again later.");
      }
    }

    fetchUltrasNFTs();
  }, [address, newContract]);

  const tokens = useMemo(() => {
    const formatBalance = (balance: string) => {
      const num = Number(balance || "0");
      return num.toFixed(num % 1 === 0 ? 0 : 2);
    };

    return [
      { address: "0xe8377A076adAbb3F9838afB77Bee96Eac101ffB1", symbol: "MSU", balance: formatBalance(msuBalance), chain: "polygon" as ChainName },
      { address: "0x02aea6F7742Fb098b4EEF3B4C4C1FeB1d3426f1B", symbol: "MSA", balance: formatBalance(msaBalance), chain: "polygon" as ChainName },
      { address: "0x3D45987F1C8812913a80Efbe3aCdd91DA8676E9c", symbol: "FUTBOL (Base)", balance: formatBalance(futbolBalance), chain: "base" as ChainName },
      { address: "0x2C8b1699170135E486C4dB52F46f439B4967b4c9", symbol: "FUTBOL (XDC)", balance: formatBalance(futbolXdcBalance), chain: "xdc" as ChainName },
    ];
  }, [msuBalance, msaBalance, futbolBalance, futbolXdcBalance]);

  const tabs = useMemo(() => ["achievements", ...Object.keys(assets), "tokens", "ultras"], [assets]);

  const fetchAccountInfo = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const info = await accountService.getInfo();
      setDiscordAccount(info.discord?.info?.username ?? null);
      setReferralCount(info.referralCount ?? 0);
    } catch (error) {
      console.error("Error fetching account info:", error);
    }
  }, [isAuthenticated]);

  const fetchAssets = useCallback(async () => {
    if (!address) return;

    try {
      const [
        bobaLandsData, bobaPlayersData, bobaScoutsData,
        matchainLandsData, matchainPlayersData, matchainScoutsData,
        polygonLandsData, polygonPlayersData, polygonScoutsData,
        xdcLandsData, xdcPlayersData, xdcScoutsData,
      ] = await Promise.all([
        bobaService.queryLands(address), bobaService.queryPlayers(address), bobaService.queryScouts(address),
        matchainService.queryLands(address), matchainService.queryPlayers(address), matchainService.queryScouts(address),
        polygonService.queryLands(address), polygonService.queryPlayers(address), polygonService.queryScouts(address),
        xdcService.queryLands(address), xdcService.queryPlayers(address), xdcService.queryScouts(address),
      ]);

      setAssets({
        lands: [
          ...bobaLandsData.map((land: any) => ({ contract: siteConfig.contracts.boba.lands, tokenId: BigInt(land.id), chain: "boba" })),
          ...matchainLandsData.map((land: any) => ({ contract: siteConfig.contracts.matchain.lands, tokenId: BigInt(land.id), chain: "matchain" })),
          ...polygonLandsData.map((land: any) => ({ contract: siteConfig.contracts.polygon.lands, tokenId: BigInt(land.id), chain: "polygon" })),
          ...xdcLandsData.map((land: any) => ({ contract: siteConfig.contracts.xdc.lands, tokenId: BigInt(land.id), chain: "xdc" })),
        ],
        players: [
          ...bobaPlayersData.map((player: any) => ({ contract: siteConfig.contracts.boba.players, tokenId: BigInt(player.id), chain: "boba" })),
          ...matchainPlayersData.map((player: any) => ({ contract: siteConfig.contracts.matchain.players, tokenId: BigInt(player.id), chain: "matchain" })),
          ...polygonPlayersData.map((player: any) => ({ contract: siteConfig.contracts.polygon.players, tokenId: BigInt(player.id), chain: "polygon" })),
          ...xdcPlayersData.map((player: any) => ({ contract: siteConfig.contracts.xdc.players, tokenId: BigInt(player.id), chain: "xdc" })),
        ],
        scouts: [
          ...bobaScoutsData.map((scout: any) => ({ contract: siteConfig.contracts.boba.scouts, tokenId: BigInt(scout.id), chain: "boba" })),
          ...matchainScoutsData.map((scout: any) => ({ contract: siteConfig.contracts.matchain.scouts, tokenId: BigInt(scout.id), chain: "matchain" })),
          ...polygonScoutsData.map((scout: any) => ({ contract: siteConfig.contracts.polygon.scouts, tokenId: BigInt(scout.id), chain: "polygon" })),
          ...xdcScoutsData.map((scout: any) => ({ contract: siteConfig.contracts.xdc.scouts, tokenId: BigInt(scout.id), chain: "xdc" })),
        ],
      });
      setAssetsError(null);
    } catch (error) {
      console.error("Error fetching assets:", error);
      setAssetsError("Failed to load assets. Please try again later.");
    }
  }, [address]);

  const fetchUltras = useCallback(() => {
    if (!ultrasNFTs || ultrasNFTs.length === 0) return;
    try {
      const ultrasTokens: AssetItem[] = ultrasNFTs.map(nft => ({
        chain: "base",
        image: nft.metadata.image!,
        name: nft.metadata.name!,
        tokenId: nft.id,
      }));
      setUltras(ultrasTokens);
    } catch (error) {
      console.error("Error processing Ultras:", error);
      setUltrasError("Failed to process Ultras NFTs.");
    }
  }, [ultrasNFTs]);

  useEffect(() => {
    if (address && isAuthenticated) {
      fetchAccountInfo();
      fetchAssets();
      fetchUltras();
    }
  }, [address, isAuthenticated, fetchAccountInfo, fetchAssets, fetchUltras]);

  useEffect(() => {
    if (initialTab && tabs.includes(initialTab)) setSelectedTab(initialTab);
  }, [initialTab, tabs]);

  const handleConnectDiscord = () => {
    const clientId = "1229091313333309480";
    const redirectUri = `${window.location.origin}/discord-oauth`;
    const url = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify%20email`;
    window.location.href = url;
  };

  const handleTabChange = useCallback((key: string | number) => {
    const tabKey = String(key);
    setSelectedTab(tabKey);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabKey);
    window.history.pushState(null, "", `?${params.toString()}`);
  }, [searchParams]);

  const renderAchievementItem = useCallback((item: Achievement) => (
    <GalleryCard key={item.title} alt={item.alt} src={getImgUrl(item.src)} title={item.title} />
  ), []);

  const renderAssetItem = useCallback((item: AssetItem) => (
    <GalleryCard
      alt={item.name}
      headerComponent={
        <div className="flex w-full justify-end">
          <Tooltip content={chains[item.chain].name}>
            <Image alt={chains[item.chain].name} height={18} src={chains[item.chain].icon} width={18} />
          </Tooltip>
        </div>
      }
      src={item.image}
      title={<p>{item.name}</p>}
    />
  ), []);

  const renderTokenItem = useCallback((item: TokenItem) => (
    <GalleryCard
      key={item.symbol}
      alt={`${item.symbol} token`}
      headerComponent={
        <div className="flex w-full justify-end">
          <Tooltip content={chains[item.chain].name}>
            <Image alt={chains[item.chain].name} height={18} src={chains[item.chain].icon} width={18} />
          </Tooltip>
        </div>
      }
      src={getImgUrl(`https://assets.metasoccer.com/tokens/${item.symbol.split(" ")[0].toLowerCase()}.png`)}
      title={`${item.balance} ${item.symbol}`}
    />
  ), []);

  const achievedAchievements = useMemo(() => ACHIEVEMENTS.filter(achievement => achievement.isAchieved({ referralCount })), [referralCount]);

  if (!address || !isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Card><CardBody><p>Please connect your wallet to view your profile.</p></CardBody></Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-[1280px] py-4 w-full mx-auto">
      <Card className="w-full">
        <CardBody>
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center">
              <Avatar className="mr-4" size="lg" src={ultrasNFTs.length > 0 ? ultrasNFTs[0].metadata.image : `https://effigy.im/a/${address}.png`} />
              <div><p className="text-gray-400">{username}<span className="text-gray-500">.fut</span></p></div>
            </div>
            <div className="flex items-center">
              {discordAccount ? (
                <div className="flex items-center gap-2"><SiDiscord size={24} /><p>{discordAccount}</p></div>
              ) : (
                <Button color="primary" startContent={<SiDiscord size={24} />} onClick={handleConnectDiscord}>Connect Discord</Button>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {(tokenVestingBalance && Number(tokenVestingBalance) > 0) && (
        <Snippet hideCopyButton hideSymbol color="success" size="md">
          <span className="text-wrap">
            You're eligible to claim <b>{Math.round((parseFloat(msuBalance) * 0.001925) / 0.03)} $FUTBOL</b> tokens based on your MSU balance!
          </span>
          <Spacer y={1} />
          <span className="text-wrap">
            Visit <Link className="text-[#00ff00]" href="https://app.hedgey.finance/vesting" size="sm" target="_blank">hedgey.finance</Link> and connect your wallet to claim your tokens. Have questions? Join our <Link className="text-[#00ff00]" href="https://0xfutbol.com/discord" size="sm" target="_blank">community</Link> for support!
          </span>
        </Snippet>
      )}

      <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "MetaSoccer", description: "Multi-player soccer manager game offering rewards for competitions.", image: "https://assets.metasoccer.com/banner/metasoccer.png?v=1", url: "https://app.metasoccer.com?utm_source=msid&utm_medium=profile&utm_campaign=game_card", buttonText: "Play" },
          { title: "Wonderkid", description: "Telegram mini-game to raise the next super star.", image: "https://assets.metasoccer.com/banner/wonderkid.png?v=2", url: "https://0xfutbol.com/wonderkid?utm_source=msid&utm_medium=profile&utm_campaign=game_card", buttonText: "Play" },
          { title: "Ultras", description: "The official NFT Collection of the 0xFútbol community.", image: "https://assets.metasoccer.com/banner/ultras.png?v=4", url: "https://magiceden.io/collections/base/0x84eb2086352ec0c08c1f7217caa49e11b16f34e8", buttonText: "Explore" },
        ].map(card => (
          <Card key={card.title} isFooterBlurred isPressable className="aspect-video" onClick={() => window.open(card.url, "_blank")}>
            <NextImage removeWrapper alt={card.title} className="z-0 w-full h-full object-cover" src={getImgUrl(card.image)} />
            <CardFooter className="absolute bg-black/40 bottom-0 z-10 border-t-1 border-default-600 dark:border-default-100 gap-1">
              <div className="flex flex-grow gap-2 items-start">
                <div className="flex flex-col text-left"><p className="text-tiny text-white">{card.title}</p><p className="text-tiny text-white/60">{card.description}</p></div>
              </div>
              <Chip color="success" size="sm">{card.buttonText}</Chip>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="w-full flex-grow">
        <Tabs aria-label="Profile tabs" className="w-full pb-4" selectedKey={selectedTab} onSelectionChange={handleTabChange}>
          <Tab key="achievements" title="Achievements">
            <Gallery items={achievedAchievements} renderItem={renderAchievementItem} />
          </Tab>
          {Object.entries(assets).map(([key, items]) => (
            <Tab key={key} title={key.charAt(0).toUpperCase() + key.slice(1)}>
              {assetsError ? <p className="text-red-500">{assetsError}</p> : <Gallery items={items} renderItem={renderAssetItem} />}
            </Tab>
          ))}
          <Tab key="tokens" title="Tokens">
            {tokensError ? <p className="text-red-500">{tokensError}</p> : <Gallery items={tokens} renderItem={renderTokenItem} />}
          </Tab>
          <Tab key="ultras" title="Ultras">
            {ultrasError ? <p className="text-red-500">{ultrasError}</p> : <Gallery items={ultras} renderItem={renderAssetItem} />}
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}