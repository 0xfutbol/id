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

export interface NFTItem {
  tokenId: string;
  name: string;
  image: string;
  chain: ChainName;
  type: 'land' | 'player' | 'scout' | 'pack' | 'ultra';
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