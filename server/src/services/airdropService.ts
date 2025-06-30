import axios from 'axios';
import { verifyMessage } from 'ethers/lib/utils';
import fs from 'fs';
import path from 'path';
import { getAirdropClaimByAddress, getAirdropClaimByAddressAndStrategy, getUserDetailsByAddress } from '../models/db';

interface CsvCache {
  msa: Map<string, string> | null;
  telegram: Map<string, string> | null;
  msu: Map<string, { allocation: string; category: string }> | null;
  zealy: Map<string, string> | null;
  zealyII: Map<string, string> | null;
}

const cache: CsvCache = {
  msa: null,
  telegram: null,
  msu: null,
  zealy: null,
  zealyII: null,
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
    if (!line) continue;
    // Split by commas that are *outside* of quoted sections to correctly handle numbers like "1,234.56"
    const parts = line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);
    if (parts.length < 2) continue;
    const key = parts[0].trim().toLowerCase();
    // Remove surrounding quotes and thousands separators from the allocation value
    const rawValue = parts[1].trim().replace(/"/g, "");
    const value = rawValue.replace(/,/g, "");
    if (key && value !== undefined) {
      map.set(key, value);
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

function loadZealyCsv(filePath: string): Map<string, string> {
  console.debug(`[airdropService] Loading Zealy CSV from ${filePath}`);
  if (!fs.existsSync(filePath)) {
    console.warn(`[airdropService] Zealy CSV file not found at ${filePath}`);
    return new Map();
  }
  const data = fs.readFileSync(filePath, 'utf8');
  const lines = data.trim().split(/\r?\n/);
  const map = new Map<string, string>();
  // Skip header
  for (const line of lines.slice(1)) {
    if (!line) continue;
    // Zealy CSV is semicolon separated
    const parts = line.split(';');
    if (parts.length < 6) continue; // ensure FUTBOL column exists
    const discordId = parts[3].trim();
    const futbolRaw = parts[5].trim().replace(/\"/g, '');
    const numberMatch = futbolRaw.match(/([\d,]+)/);
    if (!numberMatch) continue;
    const allocation = numberMatch[1].replace(/,/g, '');
    if (discordId) {
      map.set(discordId, allocation);
    }
  }
  console.debug(`[airdropService] Loaded ${map.size} Zealy entries from ${filePath}`);
  return map;
}

// Zealy II CSV loader (discord handle at index 4, FUTBOL allocation at index 7)
function loadZealyIICsv(filePath: string): Map<string, string> {
  console.debug(`[airdropService] Loading Zealy II CSV from ${filePath}`);
  if (!fs.existsSync(filePath)) {
    console.warn(`[airdropService] Zealy II CSV file not found at ${filePath}`);
    return new Map();
  }
  const data = fs.readFileSync(filePath, 'utf8');
  const lines = data.trim().split(/\r?\n/);
  const map = new Map<string, string>();
  // Skip header
  for (const line of lines.slice(1)) {
    if (!line) continue;
    const parts = line.split(',');
    // Expecting at least 8 columns (index 7 is FUTBOL, index 5 is discordId)
    if (parts.length < 8) continue;
    const discord = parts[5].trim();
    const futbolRaw = parts[7].trim().replace(/"/g, '');
    const numberMatch = futbolRaw.match(/([\d,]+)/);
    if (!numberMatch) continue;
    const allocation = numberMatch[1].replace(/,/g, '');
    if (discord) {
      map.set(discord, allocation);
    }
  }
  console.debug(`[airdropService] Loaded ${map.size} Zealy II entries from ${filePath}`);
  return map;
}

export type AirdropStrategy = 'MSA' | 'MSU' | 'TELEGRAM' | 'ZEALY' | 'ZEALY_II';

export type AllocationStatus = 'UNCLAIMED' | 'PENDING' | 'APPROVED';

export interface AllocationResult {
  strategy?: AirdropStrategy;
  allocation?: string;
  message?: string;
  telegramId?: string;
  category?: string;
  discordUsername?: string;
  status: AllocationStatus;
  claimUrl?: string;
}

const MSA_CSV = process.env.AIRDROP_MSA_CSV_PATH || path.resolve(__dirname, '../../data/msa_allocations.csv');
const TG_CSV = process.env.AIRDROP_TG_CSV_PATH || path.resolve(__dirname, '../../data/telegram_allocations.csv');
const MSU_CSV = process.env.AIRDROP_MSU_CSV_PATH || path.resolve(__dirname, '../../data/msu_allocations.csv');
const ZEALY_CSV = process.env.AIRDROP_ZEALY_CSV_PATH || path.resolve(__dirname, '../../data/zealy_allocations.csv');
const ZEALY_II_CSV = process.env.AIRDROP_ZEALY_II_CSV_PATH || path.resolve(__dirname, '../../data/zealy_ii_allocations.csv');

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
    if (!cache.zealy) {
      console.debug('[airdropService] Loading Zealy CSV cache...');
      cache.zealy = loadZealyCsv(ZEALY_CSV);
    }
    if (!cache.zealyII) {
      console.debug('[airdropService] Loading Zealy II CSV cache...');
      cache.zealyII = loadZealyIICsv(ZEALY_II_CSV);
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

    // Strategy 2: Zealy (by Discord username)
    const discordDetail: any | undefined = details?.find((d: any) => d.provider === 'discord');
    console.debug(`[airdropService] Checking Zealy strategy for address ${address}. Discord detail:`, discordDetail);
    if (discordDetail) {
      const discordId = String(discordDetail.id || '').trim();
      console.debug(`[airdropService] Extracted discordId: "${discordId}" from discordDetail:`, discordDetail);
      if (discordId) {
        const zealyAllocation = cache.zealy.get(discordId) ?? '0';
        console.debug(`[airdropService] Zealy strategy: discord=${discordId}, allocation=${zealyAllocation}`);
        if (zealyAllocation !== '0') {
          const message = `I am claiming my Futbol airdrop as Zealy user ${discordId}.`;
          console.debug(`[airdropService] Returning Zealy allocation for address ${address}:`, { status: 'UNCLAIMED', strategy: 'ZEALY', allocation: zealyAllocation, message, discordUsername: discordId });
          return { status: 'UNCLAIMED', strategy: 'ZEALY', allocation: zealyAllocation, message, discordUsername: discordId };
        } else {
          console.debug(`[airdropService] No Zealy allocation for discordId: ${discordId}`);
          // Try Zealy II allocation if Zealy is zero
          const zealyIIAllocation = cache.zealyII.get(discordId) ?? '0';
          console.debug(`[airdropService] Zealy II strategy (fallback): discord=${discordId}, allocation=${zealyIIAllocation}`);
          if (zealyIIAllocation !== '0') {
            const message = `I am claiming my Futbol airdrop as Zealy II user ${discordId}.`;
            console.debug(`[airdropService] Returning Zealy II allocation for address ${address}:`, { status: 'UNCLAIMED', strategy: 'ZEALY_II', allocation: zealyIIAllocation, message, discordUsername: discordId });
            return { status: 'UNCLAIMED', strategy: 'ZEALY_II', allocation: zealyIIAllocation, message, discordUsername: discordId };
          }
        }
      } else {
        console.debug(`[airdropService] No valid discordId found in discordDetail for address ${address}`);
      }
    } else {
      console.debug(`[airdropService] No discordDetail found for address ${address}`);
    }

    // Strategy 3: MSU by address
    const msuEntry = cache.msu.get(address.toLowerCase());
    if (msuEntry) {
      const { allocation: msuAllocation, category } = msuEntry;
      console.debug(`[airdropService] MSU strategy: address=${address.toLowerCase()}, allocation=${msuAllocation}, category=${category}`);
      if (msuAllocation === '0') {
        console.debug(`[airdropService] No allocation for address ${address.toLowerCase()} in MSU`);
      } else {
        const message = `I am claiming my Futbol airdrop as a ${category} with allocation of ${msuAllocation} FUTBOL tokens.`;
        return { status: 'UNCLAIMED', strategy: 'MSU', allocation: msuAllocation, message, category };
      }
    }

    // Strategy 4: MSA by address
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

  async getAllocations(address: string): Promise<AllocationResult[]> {
    const allocations: AllocationResult[] = [];

    // Load caches if needed
    if (!cache.msa) {
      console.debug('[airdropService] Loading MSA CSV cache (getAllocations)...');
      cache.msa = loadCsv(MSA_CSV);
    }
    if (!cache.telegram) {
      console.debug('[airdropService] Loading Telegram CSV cache (getAllocations)...');
      cache.telegram = loadCsv(TG_CSV);
    }
    if (!cache.msu) {
      console.debug('[airdropService] Loading MSU CSV cache (getAllocations)...');
      cache.msu = loadMsuCsv(MSU_CSV);
    }
    if (!cache.zealy) {
      console.debug('[airdropService] Loading Zealy CSV cache (getAllocations)...');
      cache.zealy = loadZealyCsv(ZEALY_CSV);
    }
    if (!cache.zealyII) {
      console.debug('[airdropService] Loading Zealy II CSV cache (getAllocations)...');
      cache.zealyII = loadZealyIICsv(ZEALY_II_CSV);
    }

    // Helper to fetch claim information (status and claim URL) for a specific strategy
    const getClaimInfo = async (strategy: AirdropStrategy): Promise<{ status: AllocationStatus; claimUrl?: string }> => {
      try {
        const claim = await getAirdropClaimByAddressAndStrategy(address, strategy);
        if (!claim) {
          return { status: 'UNCLAIMED' };
        }
        const status: AllocationStatus = claim.claim_url ? 'APPROVED' : 'PENDING';
        return { status, claimUrl: claim.claim_url ?? undefined };
      } catch (err) {
        console.error('[airdropService] Error checking claim info', err);
        return { status: 'UNCLAIMED' };
      }
    };

    // Strategy: Telegram
    const details = await getUserDetailsByAddress(address);
    const telegramDetail: any | undefined = details?.find((d: any) => d.provider === 'telegram');
    if (telegramDetail && telegramDetail.id) {
      const telegramId = String(telegramDetail.id);
      const allocation = cache.telegram.get(telegramId) ?? '0';
      if (allocation !== '0') {
        const { status, claimUrl } = await getClaimInfo('TELEGRAM');
        const message = `I am claiming my Futbol airdrop as Telegram user ${telegramId}.`;
        allocations.push({
          status,
          strategy: 'TELEGRAM',
          allocation,
          message,
          telegramId,
          claimUrl,
        });
      }
    }

    // Strategy: Zealy
    const discordDetail: any | undefined = details?.find((d: any) => d.provider === 'discord');
    if (discordDetail) {
      const discordId = String(discordDetail.id || '').trim();
      console.debug(`[airdropService] Extracted discordId: "${discordId}" from discordDetail:`, discordDetail);
      if (discordId) {
        const zealyAllocation = cache.zealy.get(discordId) ?? '0';
        if (zealyAllocation !== '0') {
          const { status, claimUrl } = await getClaimInfo('ZEALY');
          const message = `I am claiming my Futbol airdrop as Zealy user ${discordId}.`;
          allocations.push({
            status,
            strategy: 'ZEALY',
            allocation: zealyAllocation,
            message,
            discordUsername: discordId,
            claimUrl,
          });
        }

        const zealyIIAllocation = cache.zealyII.get(discordId) ?? '0';
        if (zealyIIAllocation !== '0') {
          const { status: statusII, claimUrl: claimUrlII } = await getClaimInfo('ZEALY_II');
          const message = `I am claiming my Futbol airdrop as Zealy II user ${discordId}.`;
          allocations.push({
            status: statusII,
            strategy: 'ZEALY_II',
            allocation: zealyIIAllocation,
            message,
            discordUsername: discordId,
            claimUrl: claimUrlII,
          });
        }
      }
    }

    // Strategy: MSU by address
    const msuEntry = cache.msu.get(address.toLowerCase());
    if (msuEntry) {
      const { allocation: msuAllocation, category } = msuEntry;
      if (msuAllocation !== '0') {
        const { status, claimUrl } = await getClaimInfo('MSU');
        const message = `I am claiming my Futbol airdrop as a ${category} with allocation of ${msuAllocation} FUTBOL tokens.`;
        allocations.push({
          status,
          strategy: 'MSU',
          allocation: msuAllocation,
          message,
          category,
          claimUrl,
        });
      }
    }

    // Strategy: MSA by address
    const msaAllocation = cache.msa.get(address.toLowerCase()) ?? '0';
    if (msaAllocation !== '0') {
      const { status, claimUrl } = await getClaimInfo('MSA');
      const message = `I am claiming my Futbol airdrop allocation of ${msaAllocation} FUTBOL tokens.`;
      allocations.push({
        status,
        strategy: 'MSA',
        allocation: msaAllocation,
        message,
        claimUrl,
      });
    }

    return allocations;
  },
};

export default airdropService; 