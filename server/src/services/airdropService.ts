import axios from 'axios';
import { verifyMessage } from 'ethers/lib/utils';
import fs from 'fs';
import path from 'path';
import { getUserDetailsByAddress } from '../models/db';

interface CsvCache {
  msa: Map<string, string> | null;
  telegram: Map<string, string> | null;
}

const cache: CsvCache = {
  msa: null,
  telegram: null,
};

function loadCsv(filePath: string): Map<string, string> {
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
  return map;
}

export type AirdropStrategy = 'MSA' | 'TELEGRAM';

export interface AllocationResult {
  strategy: AirdropStrategy;
  allocation: string;
  message: string;
  telegramId?: string;
}

const MSA_CSV = process.env.AIRDROP_MSA_CSV_PATH || path.resolve(__dirname, '../../data/msa_allocations.csv');
const TG_CSV = process.env.AIRDROP_TG_CSV_PATH || path.resolve(__dirname, '../../data/telegram_allocations.csv');
const WEBHOOK_URL = process.env.AIRDROP_CLAIM_WEBHOOK_URL || 'https://example.com/airdrop-webhook';

const airdropService = {
  async getAllocation(address: string): Promise<AllocationResult | null> {
    // Ensure caches are loaded
    if (!cache.msa) cache.msa = loadCsv(MSA_CSV);
    if (!cache.telegram) cache.telegram = loadCsv(TG_CSV);

    // Strategy 1: Telegram (preferred if telegram user details found)
    const details = await getUserDetailsByAddress(address);
    const telegramDetail: any | undefined = details?.find((d: any) => d.provider === 'telegram');

    if (telegramDetail && telegramDetail.id) {
      const telegramId = String(telegramDetail.id);
      const allocation = cache.telegram.get(telegramId) ?? '0';
      if (allocation === '0') return null;
      const message = `I am claiming my Futbol airdrop as Telegram user ${telegramId}.`;
      return { strategy: 'TELEGRAM', allocation, message, telegramId };
    }

    // Strategy 2: MSA by address
    const allocation = cache.msa.get(address.toLowerCase()) ?? '0';
    if (allocation === '0') return null;
    const message = `I am claiming my Futbol airdrop allocation of ${allocation} FUTBOL tokens.`;
    return { strategy: 'MSA', allocation, message };
  },

  verifySignature(message: string, signature: string, expectedAddress: string): boolean {
    try {
      const signer = verifyMessage(message, signature);
      return signer.toLowerCase() === expectedAddress.toLowerCase();
    } catch (err) {
      console.error('[airdropService] Signature verification failed', err);
      return false;
    }
  },

  async notifyWebhook(payload: any): Promise<void> {
    try {
      await axios.post(WEBHOOK_URL, payload, { timeout: 5000 });
    } catch (err) {
      console.error('[airdropService] Error calling webhook', err);
    }
  },
};

export default airdropService; 