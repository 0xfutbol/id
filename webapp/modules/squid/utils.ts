import { ChainName } from "@0xfutbol/constants";

import { bobaService } from "./boba-service";
import { matchainService } from "./matchain-service";
import { polygonService } from "./polygon-service";
import { xdcService } from "./xdc-service";

export { bobaService } from "./boba-service";
export { matchainService } from "./matchain-service";
export { polygonService } from "./polygon-service";
export { xdcService } from "./xdc-service";

export function getSquidByChain(chain: ChainName) {
  switch (chain) {
    case "boba":
      return bobaService;
    case "matchain":
      return matchainService;
    case "polygon":
      return polygonService;
    case "xdc":
      return xdcService;
    default:
      throw new Error(`No squid service available for chain: ${chain}`);
  }
} 