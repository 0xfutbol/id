import { ChainName } from "@0xfutbol/constants";
import { BaseChainService } from "./base-service";
import { BobaService } from "./boba-service";
import { MatchainService } from "./matchain-service";
import { PolygonService } from "./polygon-service";
import { BlockchainService } from "./types";
import { XdcService } from "./xdc-service";

// Export all service types
export * from "./types";

// Service instances
const bobaService = new BobaService();
const matchainService = new MatchainService();
const polygonService = new PolygonService();
const xdcService = new XdcService();
const baseService = new BaseChainService();

// Factory to get the correct service by chain
export function getBlockchainServiceByChain(chain: ChainName): BlockchainService {
  switch (chain) {
    case "boba":
      return bobaService;
    case "matchain":
      return matchainService;
    case "polygon":
      return polygonService;
    case "xdc":
      return xdcService;
    case "base":
      return baseService;
    default:
      throw new Error(`No blockchain service available for chain: ${chain}`);
  }
}

// Helper to fetch tokens from multiple chains in parallel
export async function fetchNFTsFromMultipleChains(params: {
  walletAddress: string;
  contractMap: Record<ChainName, string>;
}): Promise<Record<ChainName, any[]>> {
  const { walletAddress, contractMap } = params;
  
  // Build a list of promises, one for each chain with a contract address
  const promises = Object.entries(contractMap)
    .filter(([_, contractAddress]) => contractAddress) // Skip empty contract addresses
    .map(([chain, contractAddress]) => {
      try {
        const service = getBlockchainServiceByChain(chain as ChainName);
        return service.getNFTsByOwner({
          walletAddress,
          contractAddress,
        }).then(nfts => ({
          chain: chain as ChainName,
          nfts
        }))
        .catch(error => {
          console.error(`Error fetching NFTs for chain ${chain}:`, error instanceof Error ? error.message : String(error));
          return { chain: chain as ChainName, nfts: [] };
        });
      } catch (error) {
        console.error(`Error initializing service for chain ${chain}:`, error instanceof Error ? error.message : String(error));
        return Promise.resolve({ chain: chain as ChainName, nfts: [] });
      }
    });
  
  // Wait for all promises to resolve
  const results = await Promise.all(promises);
  
  // Convert the array of results to a record
  return results.reduce((acc, { chain, nfts }) => {
    acc[chain] = nfts;
    return acc;
  }, {} as Record<ChainName, any[]>);
} 