import { OxFutbolID } from "@0xfutbol/id";

export const oxFutboId = new OxFutbolID({
  chainId: parseInt(process.env.ONCHAIN_CHAIN_ID as string),
  contractAddress: process.env.ONCHAIN_CONTRACT_ADDRESS as string,
  jwtSecret: process.env.JWT_SECRET as string,
  privateKey: process.env.ONCHAIN_PRIVATE_KEY as string,
});