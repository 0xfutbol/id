import axios from 'axios';

const waasBaseUrl = process.env.WAAS_BASE_URL;
const waasInternalToken = process.env.WAAS_INTERNAL_TOKEN;

if (!waasBaseUrl) {
  console.warn('[waasClient] WAAS_BASE_URL is not configured; WaaS calls will fail.');
}

const client = axios.create({
  baseURL: waasBaseUrl,
  timeout: 10000,
  headers: {
    'User-Agent': 'metasoccer-backend/1.0',
  },
});

export const waasClient = {
  async createWallet(payload: {
    ownerType: string;
    ownerId: string;
    chainName: string;
    meta?: Record<string, unknown>;
    privateKey?: string;
  }) {
    if (!waasBaseUrl) throw new Error('WAAS_BASE_URL is not set');
    const response = await client.post('/wallets', payload, {
      headers: { 'x-internal-token': waasInternalToken ?? '' },
    });
    return response.data;
  },

  async createSession(walletId: string, msidJwt: string) {
    if (!waasBaseUrl) throw new Error('WAAS_BASE_URL is not set');
    if (!waasInternalToken) throw new Error('WAAS_INTERNAL_TOKEN is not set');
    const response = await client.post(
      '/sessions',
      { walletId },
      {
        headers: {
          Authorization: `Bearer ${msidJwt}`,
          'x-internal-token': waasInternalToken,
        },
      },
    );
    return response.data as { sessionToken: string; expiresAt: number };
  },
};

export default waasClient;
