import axios from 'axios';

const baseURL = process.env.WALLET_SERVICE_URL;
const internalToken = process.env.WALLET_SERVICE_TOKEN;

if (!baseURL) {
  console.warn('[walletClient] WALLET_SERVICE_URL is not configured; wallet calls will fail.');
}

const client = axios.create({
  baseURL,
  timeout: 15000,
  headers: internalToken ? { 'x-internal-token': internalToken } : {},
});

interface CreateWalletPayload {
  ownerType: string;
  ownerId: string;
  chainName: string;
  meta?: Record<string, unknown>;
  privateKey?: string;
}

const walletClient = {
  async createWallet(payload: CreateWalletPayload): Promise<{ id: string; address: string; engineWalletId?: string }> {
    if (!baseURL) {
      throw new Error('WALLET_SERVICE_URL is not set');
    }
    const response = await client.post('/wallets', payload);
    return response.data;
  },
};

export default walletClient;
