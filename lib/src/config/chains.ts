// Icons from https://coinpaper.com/crypto-logos

import { networkConfig } from "@0xfutbol/constants";
import { defineChain } from "thirdweb";
import { base, polygon, sepolia } from "thirdweb/chains";

export const chains = {
  base: {
    name: "Base",
    icon: "https://payload-marketing.moonpay.com/api/media/file/base%20logo.webp",
    ref: base
  },
  boba: {
    name: "Boba Network",
    icon: "https://s2.coinmarketcap.com/static/img/coins/200x200/14556.png",
    ref: defineChain({
      id: networkConfig.boba.chainId,
      name: "Boba Network",
      nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
      rpc: networkConfig.boba.rpcEndpoint
    })
  },
  ethereumSepolia: {
    name: "Ethereum Sepolia",
    icon: "https://res.coinpaper.com/coinpaper/ethereum_eth_logo_e69b1c2368.png",
    ref: sepolia
  },
  matchain: {
    name: "Matchain",
    icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMrM9PvMofNez2rIJdxCpCMyT3uJj6SO69FQ&s",
    ref: defineChain({
      id: networkConfig.matchain.chainId,
      name: "Matchain",
      nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
      rpc: networkConfig.matchain.rpcEndpoint
    })
  },
  polygon: {
    name: "Polygon",
    icon: "https://res.coinpaper.com/coinpaper/polygon_matic_logo_4f17efa0e5.png",
    ref: polygon
  },
  skaleNebula: {
    name: "Skale Nebula Hub",
    icon: "https://res.coinpaper.com/coinpaper/SKL_q1dnei.png",
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
    icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/2634.png",
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