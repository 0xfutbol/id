
import { ethers } from 'ethers';

export const provider = new ethers.JsonRpcProvider(process.env.ONCHAIN_RPC_URL);
