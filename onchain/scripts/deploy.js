const hre = require("hardhat");

async function main() {
  const MetaSoccerID = await hre.ethers.getContractFactory("MetaSoccerID");
  const OxFutbolID = await hre.ethers.getContractFactory("OxFutbolID");

  // const metaSoccerID = await MetaSoccerID.deploy();
  // const oxFutbolID = await OxFutbolID.deploy(metaSoccerID.address);
  const oxFutbolID = await OxFutbolID.deploy("0x34C1c1d83FDf111ECf0Fa0A74B2B934D4153663e");

  // await metaSoccerID.deployed();
  await oxFutbolID.deployed();

  // console.log("MetaSoccerID deployed to:", metaSoccerID.address);
  console.log("OxFutbolID deployed to:", oxFutbolID.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });