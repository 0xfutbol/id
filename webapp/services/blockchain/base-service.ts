import { ChainName } from "@0xfutbol/constants";
import { AnkrProvider } from "@ankr.com/ankr.js";
import { formatNFTItem } from "./nft-utils";
import { BlockchainService, NFTItem } from "./types";

// Initialize Ankr provider for Base chain
const provider = new AnkrProvider(`https://rpc.ankr.com/multichain/${process.env.NEXT_PUBLIC_ANKR_API_KEY}`);

export class BaseChainService implements BlockchainService {
  private readonly chainName: ChainName = "base";
  
  async getNFTsByOwner(params: {
    walletAddress: string;
    contractAddress: string;
  }): Promise<NFTItem[]> {
    const { walletAddress, contractAddress } = params;
    
    try {
      // Use Ankr's multichain endpoint for Base chain
      const response = await provider.getNFTsByOwner({
        walletAddress,
        blockchain: "base" as any,
        filter: [{ [contractAddress]: [] }],
      });

      const nftItems = await Promise.all(
        response.assets?.map(async (nft) => {
          // Require tokenUrl to be present
          if (!nft.tokenUrl) {
            throw new Error(`Missing tokenUrl for NFT with ID ${nft.tokenId}`);
          }
          
          try {
            // Replace player and scout URLs
            let tokenUrl = nft.tokenUrl;

            const metadataResponse = await fetch(tokenUrl);
            if (!metadataResponse.ok) {
              throw new Error(`Failed to fetch metadata: ${metadataResponse.status} ${metadataResponse.statusText}`);
            }
            
            const metadata = await metadataResponse.json();
            if (!metadata.name || !metadata.image) {
              throw new Error(`Metadata missing required name or image fields`);
            }

            return formatNFTItem({
              chainName: this.chainName,
              tokenId: nft.tokenId,
              name: metadata.name,
              image: metadata.image,
              contractAddress,
            });
          } catch (metadataError) {
            console.error(`Error processing metadata for token ${nft.tokenId}:`, 
              metadataError instanceof Error ? metadataError.message : String(metadataError));
            throw metadataError;
          }
        }) || []
      );
      
      return nftItems;
    } catch (error) {
      console.error(`Error fetching NFTs from ANKR for ${this.chainName}:`, error instanceof Error ? error.message : String(error));
      throw new Error(error instanceof Error ? error.message : "Failed to fetch NFTs");
    }
  }
} 