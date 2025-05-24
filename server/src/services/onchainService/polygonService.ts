import { ChainName, networkConfig } from "@0xfutbol/constants";
import axios from 'axios';
import { fetchLandMetadata, fetchPackMetadata, fetchPlayerMetadata, fetchScoutMetadata } from "./metadataUtils";
import { BlockchainService, GetAssetParams, GetTokenBalanceParams, NFTItem } from "./types";
import { handleBlockchainError, validateGetTokenBalanceParams } from "./utils";

export class PolygonService implements BlockchainService {
  private readonly chainName: ChainName = "polygon";
  private readonly httpClient = axios.create({ baseURL: networkConfig.polygon.blockchainSquidEndpoint });
  private readonly rpcUrl = networkConfig.polygon.rpcEndpoint;

  async getLands(params: GetAssetParams): Promise<NFTItem[]> {
    try {
      const { data } = await this.httpClient.post("/graphql", {
        query: `
          query($owner: String!) {
            lands(where: {owner_containsInsensitive: $owner}) {
              id
            }
          }
        `,
        variables: { owner: params.walletAddress }
      });

      const lands = await Promise.all(data.data.lands.map(async (land: any) => {
        const metadata = await fetchLandMetadata(land.id, networkConfig.polygon.scLogs.MetaSoccerLand!.address, this.rpcUrl);
        return {
          tokenId: land.id,
          name: metadata.name,
          image: metadata.image,
          chain: this.chainName,
          type: 'land' as const
        };
      }));

      return lands;
    } catch (error) {
      return handleBlockchainError(error, this.chainName, 'fetch lands');
    }
  }

  async getPacks(params: GetAssetParams): Promise<NFTItem[]> {
    try {
      const { data } = await this.httpClient.post("/graphql", {
        query: `
          query($owner: String!) {
            packs(where: {owner_containsInsensitive: $owner}) {
              id
              rarity
            }
          }
        `,
        variables: { owner: params.walletAddress }
      });

      const packs = await Promise.all(data.data.packs.map(async (pack: any) => {
        const metadata = await fetchPackMetadata(pack.rarity);
        return {
          tokenId: pack.id,
          name: metadata.name,
          image: metadata.image,
          chain: this.chainName,
          type: 'pack' as const
        };
      }));

      return packs;
    } catch (error) {
      return handleBlockchainError(error, this.chainName, 'fetch packs');
    }
  }

  async getPlayers(params: GetAssetParams): Promise<NFTItem[]> {
    try {
      const { data } = await this.httpClient.post("/graphql", {
        query: `
          query($owner: String!) {
            players(where: {owner_containsInsensitive: $owner}) {
              id
            }
          }
        `,
        variables: { owner: params.walletAddress }
      });

      const players = await Promise.all(data.data.players.map(async (player: any) => {
        const metadata = await fetchPlayerMetadata(player.id, this.chainName);
        return {
          tokenId: player.id,
          name: metadata.name,
          image: metadata.image,
          chain: this.chainName,
          type: 'player' as const
        };
      }));

      return players;
    } catch (error) {
      return handleBlockchainError(error, this.chainName, 'fetch players');
    }
  }

  async getScouts(params: GetAssetParams): Promise<NFTItem[]> {
    try {
      const { data } = await this.httpClient.post("/graphql", {
        query: `
          query($owner: String!) {
            scouts(where: {owner_containsInsensitive: $owner}) {
              id
            }
          }
        `,
        variables: { owner: params.walletAddress }
      });

      const scouts = await Promise.all(data.data.scouts.map(async (scout: any) => {
        const metadata = await fetchScoutMetadata(scout.id, this.chainName);
        return {
          tokenId: scout.id,
          name: metadata.name,
          image: metadata.image,
          chain: this.chainName,
          type: 'scout' as const
        };
      }));

      return scouts;
    } catch (error) {
      return handleBlockchainError(error, this.chainName, 'fetch scouts');
    }
  }

  async getTokenBalance(params: GetTokenBalanceParams): Promise<string> {
    try {
      validateGetTokenBalanceParams(params);
      
      // TODO: Implement token balance fetching for Polygon
      throw new Error("Token balance fetching not implemented for Polygon");
    } catch (error) {
      return handleBlockchainError(error, this.chainName, 'fetch token balance');
    }
  }

  async getUltras(params: GetAssetParams): Promise<NFTItem[]> {
    try {
      return [];
    } catch (error) {
      return handleBlockchainError(error, this.chainName, 'fetch ultras');
    }
  }
} 