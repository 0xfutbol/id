import { OxFutbolID } from "@0xfutbol/id-sign";
import { OxFutbolID as OxFutbolIDLegacy } from "@0xfutbol/id-sign-legacy";

const legacyOxFutboId = new OxFutbolIDLegacy({
  chainId: parseInt(process.env.ONCHAIN_CHAIN_ID as string),
  contractAddress: process.env.ONCHAIN_CONTRACT_ADDRESS as string,
  jwtSecret: process.env.JWT_SECRET as string,
  privateKey: process.env.ONCHAIN_PRIVATE_KEY as string,
});

const modernOxFutboId = new OxFutbolID({
  chainId: parseInt(process.env.ONCHAIN_CHAIN_ID as string),
  contractAddress: process.env.ONCHAIN_CONTRACT_ADDRESS as string,
  jwtSecret: process.env.JWT_SECRET as string,
  privateKey: process.env.ONCHAIN_PRIVATE_KEY as string,
});

export const oxFutboId = process.env.USE_METASOCCER_SIGNATURE
  ? legacyOxFutboId
  : modernOxFutboId;
