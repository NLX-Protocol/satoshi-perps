const { ethers, network } = require("hardhat");
const {readTmpAddresses, contractAt} = require("../shared/helpers");
const tokens = require('../core/tokens')[network.name];

async function checkProxyAdmin() {
  const vaultProxy = "0x7266488Fb3529a06B62092492B44824c21c47820";

  const adminSlot = "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103";
  const adminAddress = await ethers.provider.getStorageAt(vaultProxy, adminSlot);
  console.log("Admin from storage slot:", adminAddress);

  const possibleProxyAdmins = [
    "0xC761C34a5dA689a9e39aa9A2369e60434C099d7d",
    "0x53F5CCBa12ba213e448499bC75e9cbd0e9422cC9",
  ];

  for (const adminAddress of possibleProxyAdmins) {
    if (!adminAddress) continue;

    try {
      const proxyAdmin = await contractAt("GovernedProxyAdmin", adminAddress);
      const impl = await proxyAdmin.getProxyImplementation(vaultProxy);
      console.log(`ProxyAdmin at ${adminAddress} controls vault. Implementation: ${impl}`);
      return proxyAdmin;
    } catch (e) {
      console.log(`${adminAddress} is not the proxy admin`);
    }
  }
}

async function main() {
  const addresses = readTmpAddresses()

  //await checkProxyAdmin();


  const proxyAdmin = await contractAt("GovernedProxyAdmin", "0xC761C34a5dA689a9e39aa9A2369e60434C099d7d");
  const vaultProxy = "0x7266488Fb3529a06B62092492B44824c21c47820";
  const correctImplementation = "0x21894803A3CA1Cd60e3A75f83a481D7C148C286F";

  // Check current state
  const currentImpl = await proxyAdmin.getProxyImplementation(vaultProxy);
  console.log("Current implementation:", currentImpl);
  console.log("Target implementation:", correctImplementation);

  // Upgrade to the correct implementation
  console.log("Upgrading to correct implementation...");
  await proxyAdmin.upgrade(vaultProxy, correctImplementation);

  // Verify the fix
  const newImpl = await proxyAdmin.getProxyImplementation(vaultProxy);
  console.log("New implementation:", newImpl);

  if (newImpl.toLowerCase() === correctImplementation.toLowerCase()) {
    console.log("✅ Successfully fixed implementation!");
  } else {
    console.log("❌ Implementation upgrade failed!");
  }


  /*const oldTimelock = await contractAt("Timelock", "0x1D8C714C76D7E725CcB85f6B36eA2B94d62940F1");
  const newTimelock = await contractAt("Timelock", addresses.vaultTimelockBTC);
  const proxyAdmin = await contractAt("GovernedProxyAdmin", "0xC761C34a5dA689a9e39aa9A2369e60434C099d7d");

  // Transfer ProxyAdmin governance to new timelock
  await oldTimelock.signalSetGov(proxyAdmin.address, newTimelock.address);
  // Wait for timelock buffer
  await newTimelock.acceptGov(proxyAdmin.address);

  // 2. Upgrade the vault implementation
  const vaultProxy = "0x7266488Fb3529a06B62092492B44824c21c47820";
  const newVaultImplementation = addresses.currentVaultImplementationBTC;

  await proxyAdmin.upgrade(vaultProxy, newVaultImplementation);

  // 3. That's it! No token transfers needed
  console.log("Vault upgraded. All tokens and state preserved at proxy address.");*/
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })

//  npx hardhat run scripts/oracle/upgradeVaultViaTimelock.js --network core-testnet
