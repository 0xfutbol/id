import { erc721Abi } from "@/utils/erc721Abi";
import { createThirdwebClient, defineChain, getContract } from "thirdweb";
import { polygon } from "thirdweb/chains";

export type SiteConfig = typeof siteConfig;

const skaleNebula = defineChain({
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
});

const thirdwebClient = createThirdwebClient({ clientId: "92fc269e1a4386a026bc24727a115e12" });

export const siteConfig = {
  name: "MetaSoccer ID",
  description: "MetaSoccer ID is your unique identifier in the MetaSoccer World",
  backendUrl: process.env.NODE_ENV === "development" ? "http://localhost:6743" : "https://id.metasoccer.com/api",
  chain: skaleNebula,
  contracts: {
    polygon: {
      lands: getContract({
        address: "0x5b40f62fe5dd53ec89d82d432c05b9ed79764c5a",
        abi: erc721Abi,
        client: thirdwebClient,
        chain: polygon
      }),
      players: getContract({
        address: "0x6f5D7bA06aD7B28319d86fceC09fae5bbC83d32F",
        abi: erc721Abi,
        client: thirdwebClient,
        chain: polygon
      }),
      scouts: getContract({
        address: "0x94E42811Db93EF7831595b6fF9360491B987DFbD",
        abi: erc721Abi,
        client: thirdwebClient,
        chain: polygon
      }),
    },
    skaleNebula: {
      clubs: getContract({
        address: "0x975fBFcF94Ea593e4f758E7F4e839f76153FDc7c",
        abi: erc721Abi,
        client: thirdwebClient,
        chain: skaleNebula
      }),
    },
  },
  thirdwebClient
};
