import { NFTItem } from "@/app/me/types";
import { ChainName } from "@0xfutbol/constants";
import { API_CONFIG } from "../../config/api";

// Asset types configuration
const ASSET_TYPES = [
  { type: "lands" as const, name: "Land", endpoint: "/onchain/lands" },
  { type: "players" as const, name: "Player", endpoint: "/onchain/players" },
  { type: "scouts" as const, name: "Scout", endpoint: "/onchain/scouts" },
];

/**
 * Service for fetching and managing user assets from different chains
 */
export const assetService = {
  /**
   * Fetch all assets for a user across supported chains and asset types
   */
  async getAllAssets(walletAddress: string): Promise<Record<string, NFTItem[]>> {
    if (!walletAddress) {
      return {
        lands: [],
        players: [],
        scouts: [],
      };
    }
    
    const results: Record<string, NFTItem[]> = {
      lands: [],
      players: [],
      scouts: [],
    };
    
    // Process each asset type
    for (const { type, endpoint } of ASSET_TYPES) {
      try {
        const response = await fetch(`${API_CONFIG.backendUrl}${endpoint}/${walletAddress}`);
        if (!response.ok) {
          console.error(`Error fetching ${type}:`, await response.text());
          continue;
        }
        const nfts = await response.json() as Record<ChainName, NFTItem[]>;
        results[type] = Object.values(nfts).flat();
      } catch (error) {
        console.error(`Error fetching ${type}:`, error);
      }
    }
    
    return results;
  },
  
  /**
   * Fetch ultras NFTs for a user
   */
  async getUltrasNFTs(walletAddress: string): Promise<NFTItem[]> {
    if (!walletAddress) {
      return [];
    }
    
    try {
      const response = await fetch(`${API_CONFIG.backendUrl}/onchain/ultras/${walletAddress}`);
      if (!response.ok) {
        console.error('Error fetching ultras:', await response.text());
        return [];
      }
      const nfts = await response.json() as Record<ChainName, NFTItem[]>;
      return Object.values(nfts).flat();
    } catch (error) {
      console.error('Error fetching ultras:', error);
      return [];
    }
  },

  /**
   * Fetch token balances for a user
   */
  async getTokenBalances(walletAddress: string): Promise<{
    tokens: Array<{
      address: string;
      symbol: string;
      balance: string;
      chain: ChainName;
    }>;
  }> {
    if (!walletAddress) {
      return {
        tokens: []
      };
    }
    
    try {
      const response = await fetch(`${API_CONFIG.backendUrl}/onchain/token-balances/${walletAddress}`);
      if (!response.ok) {
        console.error('Error fetching token balances:', await response.text());
        return {
          tokens: []
        };
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching token balances:', error);
      return {
        tokens: []
      };
    }
  },

  /**
   * Fetch packs for a user across all supported chains
   */
  async getPacks(walletAddress: string): Promise<NFTItem[]> {
    if (!walletAddress) {
      return [];
    }

    try {
      const response = await fetch(`${API_CONFIG.backendUrl}/onchain/packs/${walletAddress}`);
      if (!response.ok) {
        console.error('Error fetching packs:', await response.text());
        return [];
      }
      const packsByChain = await response.json() as Record<ChainName, NFTItem[]>;
      return Object.values(packsByChain).flat();
    } catch (error) {
      console.error('Error fetching packs:', error);
      return [];
    }
  }
}; 