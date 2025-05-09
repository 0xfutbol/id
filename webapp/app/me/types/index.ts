import { ChainName } from "@0xfutbol/constants";

export interface NFTData {
  id: bigint;
  metadata: {
    image?: string;
    name?: string;
  };
}

export interface Achievement {
  src: string;
  alt: string;
  title: string;
  isAchieved: (params: { referralCount: number }) => boolean;
}

export interface AssetItem {
  chain: ChainName;
  image: string;
  name: string;
  tokenId: bigint;
}

export interface TokenItem {
  address: string;
  symbol: string;
  balance: string;
  chain: ChainName;
}

export interface GameCardProps {
  title: string;
  description: string;
  image: string;
  url: string;
  buttonText: string;
} 