require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");

require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  etherscan: {
    apiKey: "9QD4ARAR6K1R17M2PK1FHCG94VJXNG6AZM",
    customChains: [
      {
        network: "skale",
        chainId: 1482601649,
        urls: {
          apiURL: "https://internal-hubs.explorer.mainnet.skalenodes.com:10021/api",
          browserURL: "https://green-giddy-denebola.explorer.mainnet.skalenodes.com/",
        }
      }
    ],
  },
  networks: {
    skale: {
      url: "https://mainnet.skalenodes.com/v1/green-giddy-denebola", // Default SKALE Nebula Hub endpoint
      accounts: [process.env.PRIVATE_KEY] // Your private key from the .env file
    }
  }
};
