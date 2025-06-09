import { ChainName, networkConfig } from "@0xfutbol/constants";
import { AnkrProvider } from "@ankr.com/ankr.js";
import { BlockchainService, GetAssetParams, GetTokenBalanceParams, NFTItem } from "./types";
import { fetchERC20Balance, handleBlockchainError, validateGetTokenBalanceParams } from "./utils";

// Initialize Ankr provider for Base chain
const provider = new AnkrProvider(`https://rpc.ankr.com/multichain/${process.env.ONCHAIN_ANKR_API_KEY}`);

export class BaseChainService implements BlockchainService {
  private readonly chainName: ChainName = "base";
  private readonly rpcUrl = networkConfig.base.rpcEndpoint;

  async getLands(params: GetAssetParams): Promise<NFTItem[]> {
    return [];
  }

  async getPacks(params: GetAssetParams): Promise<NFTItem[]> {
    return [];
  }

  async getPlayers(params: GetAssetParams): Promise<NFTItem[]> {
    return []
  }

  async getScouts(params: GetAssetParams): Promise<NFTItem[]> {
    return []
  }

  async getUltras(params: GetAssetParams): Promise<NFTItem[]> {
    try {
      const response = await provider.getNFTsByOwner({
        walletAddress: params.walletAddress,
        blockchain: "base" as any,
        filter: [{ ["0x84eb2086352ec0c08c1f7217caa49e11b16f34e8"]: [] }],
      });

      if (!response.assets) {
        return [];
      }

      return response.assets.map(asset => {
        const attributes = (asset as any).attributes || [];
        return {
          tokenId: asset.tokenId,
          name: asset.name,
          image: asset.imageUrl,
          chain: this.chainName,
          type: 'ultra' as const
        };
      });
    } catch (error) {
      console.error('Error fetching NFTs from Ankr:', error);
      return [];
    }
  }

  async getTokenBalance(params: GetTokenBalanceParams): Promise<string> {
    try {
      validateGetTokenBalanceParams(params);
      
      const { tokenAddress, walletAddress } = params;
      
      const balance = await fetchERC20Balance(
        tokenAddress,
        walletAddress,
        this.rpcUrl
      );

      return balance;
    } catch (error) {
      return handleBlockchainError(error, this.chainName, 'fetch token balance');
    }
  }
} 