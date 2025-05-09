import { networkConfig } from "@0xfutbol/constants";
import { defineChain } from "thirdweb";
import { base, polygon } from "thirdweb/chains";

export const chains = {
  base: {
    name: "Base",
    ref: base
  },
  boba: {
    name: "Boba Network",
    ref: defineChain({
      id: networkConfig.boba.chainId,
      name: "Boba Network",
      nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
      rpc: networkConfig.boba.rpcEndpoint
    })
  },
  matchain: {
    name: "Matchain",
    ref: defineChain({
      id: networkConfig.matchain.chainId,
      name: "Matchain",
      nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
      rpc: networkConfig.matchain.rpcEndpoint
    })
  },
  polygon: {
    name: "Polygon",
    ref: polygon
  },
  skaleNebula: {
    name: "Skale Nebula Hub",
    ref: defineChain({
      id: networkConfig.skaleNebula.chainId,
      blockExplorers: [
        {
          name: "Skale Nebula Hub Explorer",
          url: "https://green-giddy-denebola.explorer.mainnet.skalenodes.com",
          apiUrl: "https://green-giddy-denebola.explorer.mainnet.skalenodes.com/api",
        },
      ],
      name: "Skale Nebula Hub",
      nativeCurrency: { name: "SKL", symbol: "SKL", decimals: 18 },
      rpc: networkConfig.skaleNebula.rpcEndpoint
    })
  },
  xdc: {
    name: "XDC Network",
    ref: defineChain({
      id: networkConfig.xdc.chainId,
      blockExplorers: [
        {
          name: "XDC Network Explorer",
          url: "https://xdcscan.com",
          apiUrl: "https://xdcscan.com/api",
        },
      ],
      name: "XDC Network",
      nativeCurrency: { name: "XDC", symbol: "XDC", decimals: 18 },
      rpc: networkConfig.xdc.rpcEndpoint
    })
  }
}