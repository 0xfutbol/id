
// Icons from https://coinpaper.com/crypto-logos

import { defineChain } from "thirdweb";
import { polygon } from "thirdweb/chains";

export const chains = {
  polygon: {
    name: "Polygon",
    icon: "https://res.coinpaper.com/coinpaper/polygon_matic_logo_4f17efa0e5.png",
    ref: polygon
  },
  skaleNebula: {
    name: "Skale Nebula Hub",
    icon: "https://res.coinpaper.com/coinpaper/SKL_q1dnei.png",
    ref: defineChain({
      id: 1482601649,
      name: "Skale Nebula Hub",
      nativeCurrency: { name: "SKL", symbol: "SKL", decimals: 18 },
      blockExplorers: [
        {
          name: "Skale Nebula Hub Explorer",
          url: "https://green-giddy-denebola.explorer.mainnet.skalenodes.com",
          apiUrl: "https://green-giddy-denebola.explorer.mainnet.skalenodes.com/api",
        },
      ]
    })
  },
  xdcApothem: {
    name: "XDC Apothem Network",
    icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/2634.png",
    ref: defineChain({
      id: 51,
      name: "XDC Apothem Network",
      nativeCurrency: { name: "TXDC", symbol: "TXDC", decimals: 18 },
      blockExplorers: [
        {
          name: "Skale Nebula Hub Explorer",
          url: "https://apothem.xdcscan.io",
          apiUrl: "https://apothem.xdcscan.io/api",
        },
      ]
    })
  }
}