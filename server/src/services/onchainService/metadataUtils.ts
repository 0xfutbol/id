import { ChainName } from "@0xfutbol/constants";
import { Contract, providers } from 'ethers';
import { BlockchainError } from "./types";
import { sanitizeUrl } from "./utils";

/**
 * Safely fetch and parse JSON metadata
 */
export async function fetchMetadata(url: string): Promise<Record<string, any>> {
  try {
    const response = await fetch(sanitizeUrl(url));
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    throw new BlockchainError(
      `Failed to fetch metadata from ${url}`,
      undefined,
      'METADATA_ERROR',
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Fetches metadata for lands using contract's tokenURI method
 */
export async function fetchLandMetadata(tokenId: string, contractAddress: string, rpcUrl: string): Promise<{ name: string; image: string }> {
  try {
    const provider = new providers.JsonRpcProvider(rpcUrl);
    const abi = ['function tokenURI(uint256 tokenId) view returns (string)'];
    const contract = new Contract(contractAddress, abi, provider);
    
    const tokenUri = await contract.tokenURI(tokenId);
    console.log('tokenUri', sanitizeUrl(tokenUri));
    const data = await fetchMetadata(tokenUri);
    return {
      name: data.name || `Land #${tokenId}`,
      image: data.image || ''
    };
  } catch (error) {
    console.error('Error fetching land metadata:', error);
    return {
      name: `Land #${tokenId}`,
      image: ''
    };
  }
}

/**
 * Fetches metadata for packs
 */
export async function fetchPackMetadata(rarity: string): Promise<{ name: string; image: string }> {
  try {
    const rarityName = rarity.toLowerCase();
    const url = `https://bafybeiftt3dxnq6int6zl5j2linhszg2n4i5qosr4gzjckues7755hnhl4.ipfs.w3s.link/${rarityName}.json`;
    const data = await fetchMetadata(url);
    return {
      name: data.name,
      image: sanitizeUrl(data.image)
    };
  } catch (error) {
    console.error('Error fetching pack metadata:', error);
    return {
      name: `Pack #${rarity}`,
      image: ''
    };
  }
}

/**
 * Fetches metadata for players
 */
export async function fetchPlayerMetadata(tokenId: string, chain: ChainName): Promise<{ name: string; image: string }> {
  try {
    const url = `https://play.metasoccer.com/api/2024/opensea/player/${chain}/${tokenId}`;
    const data = await fetchMetadata(url);
    return {
      name: data.name || `Player #${tokenId}`,
      image: data.image || ''
    };
  } catch (error) {
    console.error('Error fetching player metadata:', error);
    return {
      name: `Player #${tokenId}`,
      image: ''
    };
  }
}

/**
 * Fetches metadata for scouts
 */
export async function fetchScoutMetadata(tokenId: string, chain: ChainName): Promise<{ name: string; image: string }> {
  try {
    const url = `https://play.metasoccer.com/api/2024/opensea/scout/${chain}/${tokenId}`;
    const data = await fetchMetadata(url);
    return {
      name: data.name || `Scout #${tokenId}`,
      image: data.image || ''
    };
  } catch (error) {
    console.error('Error fetching scout metadata:', error);
    return {
      name: `Scout #${tokenId}`,
      image: ''
    };
  }
}
