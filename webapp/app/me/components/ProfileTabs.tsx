import { Gallery } from "@/components/gallery";
import { GalleryCard } from "@/components/gallery-card";
import { getImgUrl } from "@/utils/getImgUrl";
import { chains } from "@0xfutbol/id";
import { Image, Skeleton, Tab, Tabs, Tooltip } from "@heroui/react";
import { useCallback } from "react";
import { Achievement, AssetItem, TokenItem } from "../types";

interface ProfileTabsProps {
  achievements: Achievement[];
  assets: { [key: string]: AssetItem[] };
  tokens: TokenItem[];
  ultras: AssetItem[];

  assetsError: string | null;
  tokensError: string | null;
  ultrasError: string | null;

  assetsLoading?: boolean;
  tokensLoading?: boolean;
  ultrasLoading?: boolean;
  achievementsLoading?: boolean;

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
  
  assetsError,
  tokensError,
  ultrasError,
  
  assetsLoading = false,
  tokensLoading = false,
  ultrasLoading = false,
  achievementsLoading = false,
  
  referralCount,
  selectedTab,
  tabs,
  
  onTabChange
}: ProfileTabsProps) {
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
            <Image alt={chains[item.chain].name} className="rounded-[9px]" height={18} src={chains[item.chain].icon} width={18} />
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
            <Image alt={chains[item.chain].name} className="rounded-[9px]" height={18} src={chains[item.chain].icon} width={18} />
          </Tooltip>
        </div>
      }
      src={getImgUrl(`https://assets.metasoccer.com/tokens/${item.symbol.split(" ")[0].toLowerCase()}.png`)}
      title={`${item.balance} ${item.symbol}`}
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
        
        {Object.entries(assets).map(([key, items]) => (
          <Tab key={key} title={key.charAt(0).toUpperCase() + key.slice(1)}>
            {assetsLoading ? (
              renderLoadingSkeleton()
            ) : assetsError ? (
              <p className="text-red-500">{assetsError}</p>
            ) : (
              <Gallery items={items} renderItem={renderAssetItem} />
            )}
          </Tab>
        ))}
        
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