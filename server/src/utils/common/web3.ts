import { providers } from "ethers";

export const provider = new providers.JsonRpcProvider(process.env.ONCHAIN_RPC_URL);
