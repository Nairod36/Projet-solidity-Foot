// scripts/deploy.js
async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const BettingContract = await ethers.getContractFactory("BettingContract");
  const bettingContract = await BettingContract.deploy();

  console.log("BettingContract deployed to:", bettingContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
