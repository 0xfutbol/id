import { ChainName } from "@0xfutbol/constants";
import { BlockchainError, GetTokenBalanceParams } from "./types";

/**
 * Formats token balance to a consistent decimal string
 */
export function formatTokenBalance(balance: string | number, decimals: number = 18): string {
  const balanceNum = typeof balance === 'string' ? Number(balance) : balance;
  return (balanceNum / Math.pow(10, decimals)).toFixed(decimals);
}

/**
 * Handles blockchain service errors consistently
 */
export function handleBlockchainError(error: unknown, chain: ChainName, operation: string): never {
  if (error instanceof BlockchainError) {
    throw error;
  }

  const message = error instanceof Error ? error.message : String(error);
  throw new BlockchainError(
    `Failed to ${operation}`,
    chain,
    'BLOCKCHAIN_ERROR',
    error instanceof Error ? error : undefined
  );
}

/**
 * Sanitizes URLs by converting IPFS URLs to HTTPS URLs.
 * If the URL already starts with "https://", it remains unchanged.
 * 
 * @param url - The URL to sanitize
 * @param filename - Optional filename to append to the URL
 * @returns The sanitized URL
 */
export function sanitizeUrl(url: string, provider: "ipfs.io" | "w3s" = "w3s", filename?: string): string {
  if (!url) return url;

  if (url.startsWith('ipfs://')) {
    const cidPath = url.replace('ipfs://', '');
    const parts = cidPath.split('/');
    const cid = parts[0];

    if (provider === "w3s") {
      if (filename) {
        return `https://${cid}.ipfs.w3s.link/${filename}.json`;
      } else if (parts.length > 1) {
        return `https://${cid}.ipfs.w3s.link/${parts.slice(1).join('/')}`;
      } else {
        return `https://${cid}.ipfs.w3s.link`;
      }
    } else {
      return `https://ipfs.io/ipfs/${cid}/${parts.slice(1).join('/')}`;
    }
  }

  return url;
}

/**
 * Validates environment variables required for blockchain services
 */
export function validateEnvironmentVariables(): void {
  const requiredVars = ['ONCHAIN_ANKR_API_KEY'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new BlockchainError(
      `Missing required environment variables: ${missingVars.join(', ')}`,
      undefined,
      'ENV_ERROR'
    );
  }
}

/**
 * Validates wallet address format
 */
export function validateWalletAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validates parameters for getTokenBalance
 */
export function validateGetTokenBalanceParams(params: GetTokenBalanceParams): void {
  if (!params.walletAddress || !validateWalletAddress(params.walletAddress)) {
    throw new BlockchainError('Invalid wallet address format');
  }
}
