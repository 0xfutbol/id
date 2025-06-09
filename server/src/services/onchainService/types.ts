import { ChainName } from "@0xfutbol/constants";

// Custom error class for blockchain-related errors
export class BlockchainError extends Error {
  constructor(
    message: string,
    public readonly chain?: ChainName,
    public readonly code?: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'BlockchainError';
  }
}

// Base NFT interface that all asset types extend
export interface NFTItem {
  tokenId: string;
  name: string;
  image: string;
  chain: ChainName;
  type: 'land' | 'player' | 'scout' | 'pack' | 'ultra';
}

// Define token balance information
export interface TokenBalance {
  address: string;
  symbol: string;
  balance: string;
  chain: ChainName;
  decimals: number;
}

// Parameters for asset fetching
export interface GetAssetParams {
  walletAddress: string;
}

// Parameters for token balance fetching
export interface GetTokenBalanceParams {
  tokenAddress: string;
  walletAddress: string;
}

// Define the base interface for Blockchain services
export interface BlockchainService {
  // Asset-specific methods
  getLands(params: GetAssetParams): Promise<NFTItem[]>;
  getPacks(params: GetAssetParams): Promise<NFTItem[]>;
  getPlayers(params: GetAssetParams): Promise<NFTItem[]>;
  getScouts(params: GetAssetParams): Promise<NFTItem[]>;
  getUltras(params: GetAssetParams): Promise<NFTItem[]>;
  // Token balance method
  getTokenBalance(params: GetTokenBalanceParams): Promise<string>;
}

// Response types for multi-chain fetching
export type MultiChainNFTResponse = Record<ChainName, NFTItem[] | undefined>;

// Response type for multi-chain token balance fetching
export interface MultiChainTokenBalanceResponse {
  tokens: TokenBalance[];
} 