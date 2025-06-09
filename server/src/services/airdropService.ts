import axios from 'axios';
import { verifyMessage } from 'ethers/lib/utils';
import fs from 'fs';
import path from 'path';
import { getAirdropClaimByAddress, getUserDetailsByAddress } from '../models/db';

interface CsvCache {
  msa: Map<string, string> | null;
  telegram: Map<string, string> | null;
  msu: Map<string, { allocation: string; category: string }> | null;
}

const cache: CsvCache = {
  msa: null,
  telegram: null,
  msu: null,
};

function loadCsv(filePath: string): Map<string, string> {
  console.debug(`[airdropService] Loading CSV from ${filePath}`);
  if (!fs.existsSync(filePath)) {
    console.warn(`[airdropService] CSV file not found at ${filePath}`);
    return new Map();
  }
  const data = fs.readFileSync(filePath, 'utf8');
  const lines = data.trim().split(/\r?\n/);
  const map = new Map<string, string>();
  // Skip the header line (first line)
  for (const line of lines.slice(1)) {
    const [key, value] = line.split(',');
    if (key && value) {
      map.set(key.trim().toLowerCase(), value.trim());
    }
  }
  console.debug(`[airdropService] Loaded ${map.size} entries from ${filePath}`);
  return map;
}

function loadMsuCsv(filePath: string): Map<string, { allocation: string; category: string }> {
  console.debug(`[airdropService] Loading MSU CSV from ${filePath}`);
  if (!fs.existsSync(filePath)) {
    console.warn(`[airdropService] MSU CSV file not found at ${filePath}`);
    return new Map();
  }
  const data = fs.readFileSync(filePath, 'utf8');
  const lines = data.trim().split(/\r?\n/);
  const map = new Map<string, { allocation: string; category: string }>();
  // Skip header
  for (const line of lines.slice(1)) {
    if (!line) continue;
    const parts = line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/); // split by commas outside quotes
    if (parts.length < 4) continue;
    const address = parts[0].trim().toLowerCase();
    const category = parts[2].trim();
    const futbolRaw = parts[3].trim().replace(/"/g, '');
    const allocation = futbolRaw.replace(/,/g, ''); // remove thousands separator
    map.set(address, { allocation, category });
  }
  console.debug(`[airdropService] Loaded ${map.size} MSU entries from ${filePath}`);
  return map;
}

export type AirdropStrategy = 'MSA' | 'MSU' | 'TELEGRAM';

export type AllocationStatus = 'UNCLAIMED' | 'PENDING' | 'APPROVED';

export interface AllocationResult {
  strategy?: AirdropStrategy;
  allocation?: string;
  message?: string;
  telegramId?: string;
  category?: string;
  status: AllocationStatus;
  claimUrl?: string;
}

const MSA_CSV = process.env.AIRDROP_MSA_CSV_PATH || path.resolve(__dirname, '../../data/msa_allocations.csv');
const TG_CSV = process.env.AIRDROP_TG_CSV_PATH || path.resolve(__dirname, '../../data/telegram_allocations.csv');
const MSU_CSV = process.env.AIRDROP_MSU_CSV_PATH || path.resolve(__dirname, '../../data/msu_allocations.csv');

const WEBHOOK_URL = process.env.AIRDROP_CLAIM_WEBHOOK_URL || 'https://hook.us2.make.com/ukuqhgsbxzjycctwz8xuuj6cbzrakve7';

const airdropService = {
  async getAllocation(address: string): Promise<AllocationResult | null> {
    // First, check if user already initiated a claim
    const existingClaim = await getAirdropClaimByAddress(address);
    if (existingClaim) {
      const status: AllocationStatus = existingClaim.claim_url ? 'APPROVED' : 'PENDING';
      return {
        status,
        strategy: existingClaim.strategy,
        allocation: existingClaim.allocation,
        message: existingClaim.message,
        telegramId: existingClaim.telegram_id ?? undefined,
        claimUrl: existingClaim.claim_url ?? undefined,
      };
    }

    console.debug(`[airdropService] getAllocation called for address: ${address}`);

    // Ensure caches are loaded
    if (!cache.msa) {
      console.debug('[airdropService] Loading MSA CSV cache...');
      cache.msa = loadCsv(MSA_CSV);
    }
    if (!cache.telegram) {
      console.debug('[airdropService] Loading Telegram CSV cache...');
      cache.telegram = loadCsv(TG_CSV);
    }
    if (!cache.msu) {
      console.debug('[airdropService] Loading MSU CSV cache...');
      cache.msu = loadMsuCsv(MSU_CSV);
    }

    // Strategy 1: Telegram (preferred if telegram user details found)
    const details = await getUserDetailsByAddress(address);

    const telegramDetail: any | undefined = details?.find((d: any) => d.provider === 'telegram');
    if (telegramDetail && telegramDetail.id) {
      const telegramId = String(telegramDetail.id);
      const allocation = cache.telegram.get(telegramId) ?? '0';
      console.debug(`[airdropService] Telegram strategy: telegramId=${telegramId}, allocation=${allocation}`);
      if (allocation === '0') {
        console.debug(`[airdropService] No allocation for Telegram user ${telegramId}`);
        return null;
      }
      const message = `I am claiming my Futbol airdrop as Telegram user ${telegramId}.`;
      console.debug(`[airdropService] Returning Telegram allocation for address ${address}:`, { strategy: 'TELEGRAM', allocation, message, telegramId });
      return { status: 'UNCLAIMED', strategy: 'TELEGRAM', allocation, message, telegramId };
    }

    // Strategy 2: MSU by address
    const msuEntry = cache.msu.get(address.toLowerCase());
    if (msuEntry) {
      const { allocation: msuAllocation, category } = msuEntry;
      console.debug(`[airdropService] MSU strategy: address=${address.toLowerCase()}, allocation=${msuAllocation}, category=${category}`);
      if (msuAllocation === '0') {
        console.debug(`[airdropService] No allocation for address ${address.toLowerCase()} in MSU`);
      } else {
        const message = `I am claiming my Futbol airdrop as an ${category} with allocation of ${msuAllocation} FUTBOL tokens.`;
        return { status: 'UNCLAIMED', strategy: 'MSU', allocation: msuAllocation, message, category };
      }
    }

    // Strategy 3: MSA by address
    const allocation = cache.msa.get(address.toLowerCase()) ?? '0';
    console.debug(`[airdropService] MSA strategy: address=${address.toLowerCase()}, allocation=${allocation}`);
    if (allocation === '0') {
      console.debug(`[airdropService] No allocation for address ${address.toLowerCase()}`);
      return null;
    }
    const message = `I am claiming my Futbol airdrop allocation of ${allocation} FUTBOL tokens.`;
    console.debug(`[airdropService] Returning MSA allocation for address ${address}:`, { strategy: 'MSA', allocation, message });
    return { status: 'UNCLAIMED', strategy: 'MSA', allocation, message };
  },

  verifySignature(message: string, signature: string, expectedAddress: string): boolean {
    console.debug(`[airdropService] Verifying signature for address: ${expectedAddress}`);
    try {
      const signer = verifyMessage(message, signature);
      const isValid = signer.toLowerCase() === expectedAddress.toLowerCase();
      console.debug(`[airdropService] Signature valid: ${isValid}, signer: ${signer}, expected: ${expectedAddress}`);
      return isValid;
    } catch (err) {
      console.error('[airdropService] Signature verification failed', err);
      return false;
    }
  },

  async notifyWebhook(payload: any): Promise<void> {
    console.debug('[airdropService] Notifying webhook with payload:', payload);
    try {
      await axios.post(WEBHOOK_URL, payload, { timeout: 5000 });
      console.debug('[airdropService] Webhook notification sent successfully');
    } catch (err) {
      console.error('[airdropService] Error calling webhook', err);
    }
  },
};

export default airdropService; 