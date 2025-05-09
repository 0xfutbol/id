import { networkConfig } from "@0xfutbol/constants";
import { chains } from "@0xfutbol/id";

import { erc721Abi } from "@/utils/erc721Abi";

export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "0xFútbol ID",
  description: "0xFútbol ID is your unique identifier in the 0xFútbol Hub",
  chain: chains.base.ref,
  contracts: {
    base: {
      ultras: {
        address: "0x84eb2086352ec0c08c1f7217caa49e11b16f34e8",
        abi: erc721Abi,
      },
    },
    boba: {
      lands: {
        address: networkConfig.boba.scLogs.MetaSoccerLand!.address,
        abi: erc721Abi,
      },
      players: {
        address: networkConfig.boba.scLogs.MetaSoccerPlayers!.address,
        abi: erc721Abi,
      },
      scouts: {
        address: networkConfig.boba.scLogs.YouthScouts!.address,
        abi: erc721Abi,
      },
    },
    ethereumSepolia: {
      tokenVesting: {
        address: "0x68b6986416c7a38f630cbc644a2833a0b78b3631",
        abi: erc721Abi,
      },
    },
    matchain: {
      lands: {
        address: networkConfig.matchain.scLogs.MetaSoccerLand!.address,
        abi: erc721Abi,
      },
      players: {
        address: networkConfig.matchain.scLogs.MetaSoccerPlayers!.address,
        abi: erc721Abi,
      },
      scouts: {
        address: networkConfig.matchain.scLogs.YouthScouts!.address,
        abi: erc721Abi,
      },
    },
    polygon: {
      lands: {
        address: "0x5b40f62fe5dd53ec89d82d432c05b9ed79764c5a",
        abi: erc721Abi,
      },
      players: {
        address: "0x6f5D7bA06aD7B28319d86fceC09fae5bbC83d32F",
        abi: erc721Abi,
      },
      scouts: {
        address: "0x94E42811Db93EF7831595b6fF9360491B987DFbD",
        abi: erc721Abi,
      },
    },
    skaleNebula: {
      clubs: {
        address: "0x975fBFcF94Ea593e4f758E7F4e839f76153FDc7c",
        abi: erc721Abi,
      },
    },
    xdc: {
      lands: {
        address: networkConfig.xdc.scLogs.MetaSoccerLand!.address,
        abi: erc721Abi,
      },
      players: {
        address: networkConfig.xdc.scLogs.MetaSoccerPlayers!.address,
        abi: erc721Abi,
      },
      scouts: {
        address: networkConfig.xdc.scLogs.YouthScouts!.address,
        abi: erc721Abi,
      },
    },
  }
};
