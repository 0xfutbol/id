import { createThirdwebClient, defineChain } from "thirdweb";

export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "MetaSoccer ID",
  description: "MetaSoccer ID is your unique identifier in the MetaSoccer World",
  chain: defineChain({
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
  }),
  thirdwebClient: createThirdwebClient({ clientId: "92fc269e1a4386a026bc24727a115e12" })
};
