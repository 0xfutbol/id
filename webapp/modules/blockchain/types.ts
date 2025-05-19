import { ChainName } from "@0xfutbol/constants";

// Define the shape of Blockchain data as returned by the services
export interface NFTItem {
  tokenId: string;
  name: string;
  image: string;
  chain: ChainName;
  contractAddress: string;
}

// Define the base interface for Blockchain services
export interface BlockchainService {
  getNFTsByOwner(params: {
    walletAddress: string;
    contractAddress: string;
  }): Promise<NFTItem[]>;
} 