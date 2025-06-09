import { getSavedJWT } from '@0xfutbol/id';
import axios, { AxiosInstance } from 'axios';

export interface AllocationResponse {
  strategy?: 'MSA' | 'MSU' | 'TELEGRAM';
  allocation?: string;
  message?: string;
  telegramId?: string;
  category?: string;
  status: 'UNCLAIMED' | 'PENDING' | 'APPROVED';
  claimUrl?: string;
}

export class AirdropService {
  private readonly client: AxiosInstance;

  constructor(private readonly baseUrl: string) {
    this.client = axios.create({ baseURL: baseUrl });
  }

  async getAllocation(): Promise<AllocationResponse | null> {
    const { data } = await this.client.get<AllocationResponse>('/airdrop/allocation', {
      headers: { Authorization: `Bearer ${getSavedJWT()}` },
    });
    return data;
  }

  async claim(payload: { message: string; signature: string; destinationAddress: string }): Promise<void> {
    await this.client.post('/airdrop/claim', payload, {
      headers: { Authorization: `Bearer ${getSavedJWT()}` },
    });
  }
} 