import { ChainName } from "@0xfutbol/constants";
import { chains, tokenContracts } from "../../config/constants";
import { BaseChainService } from "./baseService";
import { BobaService } from "./bobaService";
import { MatchainService } from "./matchainService";
import { PolygonService } from "./polygonService";
import { BlockchainError, BlockchainService, MultiChainNFTResponse, MultiChainTokenBalanceResponse, TokenBalance } from "./types";
import { formatTokenBalance, handleBlockchainError, validateEnvironmentVariables } from "./utils";
import { XdcService } from "./xdcService";

// Export all service types
export * from "./types";

// Validate environment variables on module load
validateEnvironmentVariables();

// Service instances
const baseService = new BaseChainService();
const bobaService = new BobaService();
const matchainService = new MatchainService();
const polygonService = new PolygonService();
const xdcService = new XdcService();

// Factory to get the correct service by chain
export function getBlockchainServiceByChain(chain: ChainName): BlockchainService {
  switch (chain) {
    case "base":
      return baseService;
    case "boba":
      return bobaService;
    case "matchain":
      return matchainService;
    case "polygon":
      return polygonService;
    case "xdc":
      return xdcService;
    default:
      throw new BlockchainError(`No blockchain service available for chain: ${chain}`, chain, 'UNSUPPORTED_CHAIN');
  }
}

/**
 * Service for handling onchain operations
 */
export const onchainService = {
  /**
   * Fetch lands from multiple chains for a given wallet address and contract map
   */
  async fetchLandsFromMultipleChains(params: {
    walletAddress: string;
  }): Promise<MultiChainNFTResponse> {
    const { walletAddress } = params;
    
    const promises = chains
      .map(async (chain) => {
        try {
          const service = getBlockchainServiceByChain(chain as ChainName);
          const lands = await service.getLands({
            walletAddress,
          });
          return { chain: chain as ChainName, lands };
        } catch (error) {
          console.error(`Error fetching lands for chain ${chain}:`, error);
          return { chain: chain as ChainName, lands: [] };
        }
      });
    
    const results = await Promise.all(promises);
    
    return results.reduce((acc, { chain, lands }) => {
      acc[chain] = lands;
      return acc;
    }, {} as MultiChainNFTResponse);
  },

  /**
   * Fetch packs from multiple chains for a given wallet address and contract map
   */
  async fetchPacksFromMultipleChains(params: {
    walletAddress: string;
  }): Promise<MultiChainNFTResponse> {
    const { walletAddress } = params;
    
    const promises = chains
      .map(async (chain) => {
        try {
          const service = getBlockchainServiceByChain(chain as ChainName);
          const packs = await service.getPacks({
            walletAddress,
          });
          return { chain: chain as ChainName, packs };
        } catch (error) {
          console.error(`Error fetching packs for chain ${chain}:`, error);
          return { chain: chain as ChainName, packs: [] };
        }
      });
    
    const results = await Promise.all(promises);
    
    return results.reduce((acc, { chain, packs }) => {
      acc[chain] = packs;
      return acc;
    }, {} as MultiChainNFTResponse);
  },

  /**
   * Fetch players from multiple chains for a given wallet address and contract map
   */
  async fetchPlayersFromMultipleChains(params: {
    walletAddress: string;
  }): Promise<MultiChainNFTResponse> {
    const { walletAddress } = params;
    
    const promises = chains
      .map(async (chain) => {
        try {
          const service = getBlockchainServiceByChain(chain as ChainName);
          const players = await service.getPlayers({
            walletAddress,
          });
          return { chain: chain as ChainName, players };
        } catch (error) {
          console.error(`Error fetching players for chain ${chain}:`, error);
          return { chain: chain as ChainName, players: [] };
        }
      });
    
    const results = await Promise.all(promises);
    
    return results.reduce((acc, { chain, players }) => {
      acc[chain] = players;
      return acc;
    }, {} as MultiChainNFTResponse);
  },

  /**
   * Fetch scouts from multiple chains for a given wallet address and contract map
   */
  async fetchScoutsFromMultipleChains(params: {
    walletAddress: string;
  }): Promise<MultiChainNFTResponse> {
    const { walletAddress } = params;
    
    const promises = chains
      .map(async (chain) => {
        try {
          const service = getBlockchainServiceByChain(chain as ChainName);
          const scouts = await service.getScouts({
            walletAddress,
          });
          return { chain: chain as ChainName, scouts };
        } catch (error) {
          console.error(`Error fetching scouts for chain ${chain}:`, error);
          return { chain: chain as ChainName, scouts: [] };
        }
      });
    
    const results = await Promise.all(promises);
    
    return results.reduce((acc, { chain, scouts }) => {
      acc[chain] = scouts;
      return acc;
    }, {} as MultiChainNFTResponse);
  },

  /**
   * Fetch token balances from multiple chains for a given wallet address and token contracts
   */
  async fetchTokenBalancesFromMultipleChains(params: {
    walletAddress: string;
  }): Promise<MultiChainTokenBalanceResponse> {
    const { walletAddress } = params;
    
    try {
      const promises = Object.entries(tokenContracts).flatMap(([chain, tokens]) => 
        Object.entries(tokens).map(async ([symbol, address]) => {
          try {
            const service = getBlockchainServiceByChain(chain as ChainName);
            const balance = await service.getTokenBalance({
              walletAddress,
            });
            
            return {
              chain: chain as ChainName,
              symbol,
              address,
              balance: formatTokenBalance(balance),
              decimals: 18 // TODO: Fetch decimals from contract
            } as TokenBalance;
          } catch (error) {
            console.warn(`Error fetching balance for ${symbol} on ${chain}:`, error);
            return {
              chain: chain as ChainName,
              symbol,
              address,
              balance: "0",
              decimals: 18
            } as TokenBalance;
          }
        })
      );
      
      const tokens = await Promise.all(promises);
      
      const msuToken = tokens.find(t => t.symbol === 'MSU');
      const msuBalance = msuToken ? msuToken.balance : "0";

      return {
        tokens,
        msuBalance,
        tokenVestingBalance: "0" // This is kept as 0 since vesting contract is not implemented
      };
    } catch (error) {
      return handleBlockchainError(error, 'polygon', 'fetch token balances'); // Default to polygon for general errors
    }
  },

  /**
   * Fetch ultras from multiple chains for a given wallet address
   */
  async fetchUltrasFromMultipleChains(params: {
    walletAddress: string;
  }): Promise<MultiChainNFTResponse> {
    const { walletAddress } = params;

    const promises = chains
      .map(async (chain) => {
        try {
          const service = getBlockchainServiceByChain(chain as ChainName);
          const ultras = await service.getUltras({
            walletAddress,
          });
          return { chain: chain as ChainName, ultras };
        } catch (error) {
          console.error(`Error fetching ultras for chain ${chain}:`, error);
          return { chain: chain as ChainName, ultras: [] };
        }
      });

    const results = await Promise.all(promises);

    return results.reduce((acc, { chain, ultras }) => {
      acc[chain] = ultras;
      return acc;
    }, {} as MultiChainNFTResponse);
  }
};
