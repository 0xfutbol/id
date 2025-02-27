import { erc721Abi } from "@/utils/erc721Abi";
import { createThirdwebClient, getContract } from "thirdweb";
import { chains } from "./chains";

export type SiteConfig = typeof siteConfig;

const thirdwebClient = createThirdwebClient({ clientId: "a8fd5d4d91d0da0f0485ac27da84b578" });

export const siteConfig = {
  name: "0xFútbol ID",
  description: "0xFútbol ID is your unique identifier in the 0xFútbol Hub",
  backendUrl: process.env.NODE_ENV === "development" ? "http://localhost:6743" : "https://id.0xfutbol.com/api",
  chain: chains.skaleNebula.ref,
  contracts: {
    ethereumSepolia: {
      tokenVesting: getContract({
        address: "0x68b6986416c7a38f630cbc644a2833a0b78b3631",
        abi: erc721Abi,
        client: thirdwebClient,
        chain: chains.ethereumSepolia.ref
      }),
    },
    polygon: {
      lands: getContract({
        address: "0x5b40f62fe5dd53ec89d82d432c05b9ed79764c5a",
        abi: erc721Abi,
        client: thirdwebClient,
        chain: chains.polygon.ref
      }),
      players: getContract({
        address: "0x6f5D7bA06aD7B28319d86fceC09fae5bbC83d32F",
        abi: erc721Abi,
        client: thirdwebClient,
        chain: chains.polygon.ref
      }),
      scouts: getContract({
        address: "0x94E42811Db93EF7831595b6fF9360491B987DFbD",
        abi: erc721Abi,
        client: thirdwebClient,
        chain: chains.polygon.ref
      }),
    },
    skaleNebula: {
      clubs: getContract({
        address: "0x975fBFcF94Ea593e4f758E7F4e839f76153FDc7c",
        abi: erc721Abi,
        client: thirdwebClient,
        chain: chains.skaleNebula.ref
      }),
    },
  },
  thirdwebClient
};
