import { ChainName, networkConfig } from "@0xfutbol/constants";
import { ethers } from "ethers";
import { erc721Abi } from "../../utils/erc721Abi";
import { sanitizeUrl } from "../../utils/sanitizeUrl";
import { formatNFTItem } from "./nft-utils";
import { BlockchainService, NFTItem } from "./types";

const RPC_URL = networkConfig.xdc.rpcEndpoint;
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

export class XdcService implements BlockchainService {
  private readonly chainName: ChainName = "xdc";
  
  private async retryContractCall<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error = new Error("Failed to execute contract call");
    
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Check if it's a rate limiting error (429)
        const isRateLimitError = 
          error instanceof Error && 
          (error.message.includes("429") || error.message.includes("Too Many Requests"));
        
        if (!isRateLimitError) {
          throw lastError;
        }
        
        if (attempt < MAX_RETRIES - 1) {
          // Calculate exponential backoff delay: 1s, 2s, 4s...
          const delayMs = BASE_DELAY_MS * Math.pow(2, attempt);
          console.log(`Rate limit hit, retrying in ${delayMs}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }
    
    throw lastError;
  }
  
  async getNFTsByOwner(params: {
    walletAddress: string;
    contractAddress: string;
  }): Promise<NFTItem[]> {
    const { walletAddress, contractAddress } = params;
    
    try {
      // Format addresses for XDC network (replace 0x with xdc)
      const formattedWalletAddress = walletAddress.replace("0x", "xdc");
      const formattedContractAddress = contractAddress.replace("0x", "xdc");
      
      // For ethers we need to convert back to 0x format
      const ethWalletAddress = formattedWalletAddress.replace("xdc", "0x");
      const ethContractAddress = formattedContractAddress.replace("xdc", "0x");
      
      // Create provider and contract instance
      const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
      const contract = new ethers.Contract(ethContractAddress, erc721Abi, provider);
      
      // Get balance
      const balance = await this.retryContractCall(() => contract.balanceOf(ethWalletAddress));
      const balanceNumber = Number(balance);
      
      if (balanceNumber === 0) {
        return [];
      }
      
      // Get all token IDs owned by the address
      const nfts: NFTItem[] = [];
      let tokenUriPattern: string | null = null;
      
      for (let i = 0; i < balanceNumber; i++) {
        try {
          // Get token ID at index i with retry
          const tokenId = await this.retryContractCall<ethers.BigNumber>(() => 
            contract.tokenOfOwnerByIndex(ethWalletAddress, i)
          );
          
          // If we haven't detected a tokenURI pattern yet, fetch the URI for this token
          let tokenUri;
          let metadata: any = null;
          
          if (!tokenUriPattern) {
            // Get tokenURI for this NFT with retry
            const uri = await this.retryContractCall<string>(() => contract.tokenURI(tokenId));
            
            // Check if URI contains the tokenId - if so, we can infer a pattern
            if (uri.includes(`/${tokenId.toString()}`)) {
              tokenUriPattern = uri.replace(`/${tokenId.toString()}`, "/{id}");
            }
            
            tokenUri = sanitizeUrl(uri);
            
            // Fetch metadata
            try {
              const metadataResponse = await fetch(tokenUri);
              metadata = await metadataResponse.json();
            } catch (error) {
              console.error(`Error fetching metadata from ${tokenUri}:`, error instanceof Error ? error.message : String(error));
              metadata = null;
            }
          } else {
            // If we have a pattern, use it instead of making another contract call
            tokenUri = sanitizeUrl(tokenUriPattern.replace("{id}", tokenId.toString()));
            
            // Fetch metadata
            try {
              const metadataResponse = await fetch(tokenUri);
              metadata = await metadataResponse.json();
            } catch (error) {
              console.error(`Error fetching metadata from ${tokenUri}:`, error instanceof Error ? error.message : String(error));
              metadata = null;
            }
          }

          nfts.push(
            formatNFTItem({
              chainName: this.chainName,
              tokenId: tokenId.toString(),
              contractAddress: formattedContractAddress,
              name: metadata?.name || "",
              image: metadata?.image ? sanitizeUrl(metadata.image) : "",
            })
          );
        } catch (error) {
          console.error(`Error fetching token ${i} for ${formattedWalletAddress} on ${this.chainName}:`, error instanceof Error ? error.message : String(error));
        }
      }
      
      return nfts;
    } catch (error) {
      console.error(`Error fetching NFTs for ${this.chainName}:`, error instanceof Error ? error.message : String(error));
      throw new Error(error instanceof Error ? error.message ?? "Failed to fetch NFTs" : "Failed to fetch NFTs");
    }
  }
} 