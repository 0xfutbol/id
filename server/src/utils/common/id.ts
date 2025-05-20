import { OxFutbolID } from "@0xfutbol/id-sign";

console.log({
  chainId: parseInt(process.env.ONCHAIN_CHAIN_ID as string),
  contractAddress: process.env.ONCHAIN_CONTRACT_ADDRESS as string,
  messageTemplate: process.env.ONCHAIN_MESSAGE_TEMPLATE,
  jwtSecret: process.env.JWT_SECRET as string,
  privateKey: process.env.ONCHAIN_PRIVATE_KEY as string,
});

export const oxFutboId = new OxFutbolID({
  chainId: parseInt(process.env.ONCHAIN_CHAIN_ID as string),
  contractAddress: process.env.ONCHAIN_CONTRACT_ADDRESS as string,
  messageTemplate: process.env.USE_METASOCCER_SIGNATURE
    ? 'Authenticate with MetaSoccerID\n\nID: {id}\n\nExpiration: {expiration}'
    : undefined,
  jwtSecret: process.env.JWT_SECRET as string,
  privateKey: process.env.ONCHAIN_PRIVATE_KEY as string,
});