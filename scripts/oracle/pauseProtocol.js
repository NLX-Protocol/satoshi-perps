// test-timelock-fees.js
const { ethers } = require("hardhat");
const { contractAt, readTmpAddresses, sendTxn} = require("../shared/helpers");

async function main() {
  const addresses = readTmpAddresses();

  const wallet = (await ethers.getSigners())[0]
  console.log(`Using account: ${wallet.address}`);

  const vault = await ethers.getContractAt("Vault", addresses.vaultBTC);
  const timelock = await ethers.getContractAt("Timelock", addresses.vaultTimelockBTC);

  console.log("Vault is paused ", await vault.paused());
  const orderBook = await contractAt("OrderBook", addresses.orderBookBTC)
  console.log("OrderBook is paused:", await orderBook.paused());

  const tx = await timelock.pauseProtocol(
    addresses.vaultBTC,
    addresses.positionRouterBTC,
    addresses.positionManagerBTC,
    addresses.orderBookBTC,
    addresses.slpManagerBTC
  );

  console.log("Pause transaction sent:", tx.hash);

  const receipt = await tx.wait();
  console.log("Pause transaction confirmed in block:", receipt.blockNumber);

  console.log("Vault is paused ", await vault.paused());
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error("Fatal error:", error);
    process.exit(1);
  });

// npx hardhat run scripts/oracle/pauseProtocol.js --network core-testnet
