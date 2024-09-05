const hre = require("hardhat");

async function main() {
  const MetaSoccerID = await hre.ethers.getContractFactory("MetaSoccerID");
  const metaSoccerID = await MetaSoccerID.deploy();

  await metaSoccerID.deployed();

  console.log("MetaSoccerID deployed to:", metaSoccerID.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });