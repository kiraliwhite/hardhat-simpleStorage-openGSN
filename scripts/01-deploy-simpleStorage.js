const hre = require("hardhat");

async function main() {
  const forwarder = require("../build/gsn/Forwarder").address;
  console.log(`forwarder address is ${forwarder}`);

  console.log("Deploying contract...");
  const simpleStorageFactory = await hre.ethers.getContractFactory(
    "SimpleStorage"
  );
  const simpleStorage = await simpleStorageFactory.deploy(forwarder);
  await simpleStorage.deployed();

  console.log(`Contract address is ${simpleStorage.address}`);

  const trustedForwarder = await simpleStorage.getTrustedForwarder();
  console.log(`trustedForwarder address is ${trustedForwarder}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
