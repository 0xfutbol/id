import { ChainName, networkConfig } from "@0xfutbol/constants";

export const getChainName = (chainId: number): ChainName | undefined => {
  return Object.entries(networkConfig).find(([, value]) => value.chainId === chainId)?.[0] as ChainName;
};