import { siteConfig } from "@/config/site";
import { ChainName } from "@0xfutbol/constants";
import { fetchNFTsFromMultipleChains, NFTItem } from "./blockchain";

// Asset types configuration
const ASSET_TYPES = [
  { type: "lands" as const, name: "Land" },
  { type: "players" as const, name: "Player" },
  { type: "scouts" as const, name: "Scout" },
];

type SupportedChain = "boba" | "matchain" | "polygon" | "xdc";

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
    
    const chains: SupportedChain[] = ["boba", "matchain", "polygon", "xdc"];
    const results: Record<string, NFTItem[]> = {
      lands: [],
      players: [],
      scouts: [],
    };
    
    // Process each asset type
    for (const { type, name } of ASSET_TYPES) {
      // Create a contract map for this asset type
      const contractMap: Partial<Record<ChainName, string>> = {};
      
      for (const chain of chains) {
        // Get contract address for the current chain and asset type
        const contractAddress = (siteConfig.contracts as any)[chain][type].address;
        contractMap[chain as ChainName] = contractAddress;
      }
      
      // Fetch NFTs for this asset type across all chains
      const nftsMap = await fetchNFTsFromMultipleChains({
        walletAddress,
        contractMap: contractMap as Record<ChainName, string>,
      });
      
      // Flatten the results for this asset type
      const nfts = Object.values(nftsMap).flat();
      results[type] = nfts;
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
    
    const contractAddress = siteConfig.contracts.base.ultras.address;
    
    // Create a contract map for ultras NFTs (only on Base chain)
    const contractMap: Partial<Record<ChainName, string>> = {
      base: contractAddress
    };
    
    // Fetch NFTs
    const nftsMap = await fetchNFTsFromMultipleChains({
      walletAddress,
      contractMap: contractMap as Record<ChainName, string>,
    });
    
    // Return flattened results
    return Object.values(nftsMap).flat();
  }
}; 