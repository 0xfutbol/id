import { ChainName } from "@0xfutbol/constants";
import { NFTItem } from "./types";

/**
 * Formats Blockchain data consistently across all Blockchain services
 */
export function formatNFTItem(params: {
  chainName: ChainName;
  tokenId: string;
  name: string;
  image: string;
  contractAddress: string;
}): NFTItem {
  const { 
    chainName,
    tokenId, 
    name, 
    image, 
    contractAddress, 
  } = params;
  
  return {
    chain: chainName,
    tokenId,
    name,
    image,
    contractAddress,
  };
} 