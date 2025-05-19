import { Gallery } from "@/components/gallery";
import { GalleryCard } from "@/components/gallery-card";
import { chainIcons } from "@/config/chains";
import { Pack } from "@/modules/squid/types";
import { getImgUrl } from "@/utils/getImgUrl";
import { chains, useOxFutbolIdContext } from "@0xfutbol/id";
import { Image, Skeleton, Tab, Tabs, Tooltip } from "@heroui/react";
import { useCallback } from "react";
import { Achievement, AssetItem, TokenItem } from "../types";

interface ProfileTabsProps {
  achievements: Achievement[];
  assets: { [key: string]: AssetItem[] };
  packs: Pack[];
  tokens: TokenItem[];
  ultras: AssetItem[];

  assetsError: string | null;
  packsError: string | null;
  tokensError: string | null;
  ultrasError: string | null;

  achievementsLoading?: boolean;
  assetsLoading?: boolean;
  packsLoading?: boolean;
  tokensLoading?: boolean;
  ultrasLoading?: boolean;

  referralCount: number;
  selectedTab: string;
  tabs: string[];
  
  onTabChange: (key: string | number) => void;
}

export function ProfileTabs({
  achievements,
  assets,
  tokens,
  ultras,
  packs,
  
  assetsError,
  tokensError,
  ultrasError,
  packsError,
  
  assetsLoading = false,
  tokensLoading = false,
  ultrasLoading = false,
  packsLoading = false,
  achievementsLoading = false,
  
  referralCount,
  selectedTab,
  tabs,
  
  onTabChange
}: ProfileTabsProps) {
  const { walletProvider } = useOxFutbolIdContext();

  const achievedAchievements = achievements.filter(achievement => 
    achievement.isAchieved({ referralCount })
  );

  const renderAchievementItem = useCallback((item: Achievement) => (
    <GalleryCard 
      key={item.title} 
      alt={item.alt} 
      src={getImgUrl(item.src)} 
      title={item.title} 
    />
  ), []);

  const renderAssetItem = useCallback((item: AssetItem) => (
    <GalleryCard
      alt={item.name}
      headerComponent={
        <div className="flex w-full justify-end">
          <Tooltip content={chains[item.chain].name}>
            <Image alt={chains[item.chain].name} height={18} src={chainIcons[item.chain]} width={18} />
          </Tooltip>
        </div>
      }
      src={getImgUrl(item.image)}
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
            <Image alt={chains[item.chain].name} height={18} src={chainIcons[item.chain]} width={18} />
          </Tooltip>
        </div>
      }
      src={getImgUrl(`https://assets.metasoccer.com/tokens/${item.symbol.split(" ")[0].toLowerCase()}.png`)}
      title={`${item.balance} ${item.symbol}`}
    />
  ), []);

  const renderPackItem = useCallback((item: Pack) => (
    <GalleryCard
      key={item.id}
      alt={`Pack ${item.id}`}
      headerComponent={
        <div className="flex w-full justify-end">
          <Tooltip content={chains[item.chain as keyof typeof chains].name}>
            <Image 
              alt={chains[item.chain as keyof typeof chains].name} 
              height={18} 
              src={chainIcons[item.chain as keyof typeof chainIcons]} 
              width={18} 
            />
          </Tooltip>
        </div>
      }
      src={getImgUrl(`https://assets.metasoccer.com/packs/${item.rarity.toLowerCase()}.png`)}
      title={`${item.rarity} Pack`}
    />
  ), []);

  const renderLoadingSkeleton = useCallback(() => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array(10).fill(0).map((_, index) => (
        <div key={index} className="w-full">
          <Skeleton className="rounded-lg">
            <div className="h-40 rounded-lg bg-default-300"></div>
          </Skeleton>
          <Skeleton className="h-3 w-3/5 rounded-lg mt-2"></Skeleton>
        </div>
      ))}
    </div>
  ), []);

  return (
    <div className="w-full flex-grow">
      <Tabs 
        aria-label="Profile tabs" 
        className="w-full pb-4" 
        selectedKey={selectedTab} 
        onSelectionChange={onTabChange}
      >
        <Tab key="achievements" title="Achievements">
          {achievementsLoading ? (
            renderLoadingSkeleton()
          ) : (
            <Gallery items={achievedAchievements} renderItem={renderAchievementItem} />
          )}
        </Tab>

        <Tab key="lands" title="Lands">
          {assetsLoading ? (
            renderLoadingSkeleton()
          ) : assetsError ? (
            <p className="text-red-500">{assetsError}</p>
          ) : (
            <Gallery items={assets["lands"] || []} renderItem={renderAssetItem} />
          )}
        </Tab>

        <Tab key="packs" title="Packs">
          {packsLoading ? (
            renderLoadingSkeleton()
          ) : packsError ? (
            <p className="text-red-500">{packsError}</p>
          ) : Boolean(packs?.length) ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-lg text-default-500">You don't have any packs yet</p>
              {walletProvider === "matchain_id" && (
                <p className="mt-2 text-sm text-default-400">
                  Connect with Matchain ID to claim your gift pack!
                </p>
              )}
            </div>
          ) : (
            <Gallery items={packs} renderItem={renderPackItem} />
          )}
        </Tab>

        <Tab key="players" title="Players">
          {assetsLoading ? (
            renderLoadingSkeleton()
          ) : assetsError ? (
            <p className="text-red-500">{assetsError}</p>
          ) : (
            <Gallery items={assets["players"] || []} renderItem={renderAssetItem} />
          )}
        </Tab>

        <Tab key="scouts" title="Scouts">
          {assetsLoading ? (
            renderLoadingSkeleton()
          ) : assetsError ? (
            <p className="text-red-500">{assetsError}</p>
          ) : (
            <Gallery items={assets["scouts"] || []} renderItem={renderAssetItem} />
          )}
        </Tab>

        <Tab key="tokens" title="Tokens">
          {tokensLoading ? (
            renderLoadingSkeleton()
          ) : tokensError ? (
            <p className="text-red-500">{tokensError}</p>
          ) : (
            <Gallery items={tokens} renderItem={renderTokenItem} />
          )}
        </Tab>

        <Tab key="ultras" title="Ultras">
          {ultrasLoading ? (
            renderLoadingSkeleton()
          ) : ultrasError ? (
            <p className="text-red-500">{ultrasError}</p>
          ) : (
            <Gallery items={ultras} renderItem={renderAssetItem} />
          )}
        </Tab>
      </Tabs>
    </div>
  );
} 