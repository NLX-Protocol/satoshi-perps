const { deployContract, contractAt , sendTxn, writeTmpAddresses, readTmpAddresses} = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')[network];

async function main() {

  const addresses = readTmpAddresses()

  const { nativeToken } = tokens

  const orderBook = await deployContract("OrderBook", []);

  // Arbitrum mainnet addresses
  await sendTxn(orderBook.initialize(
    addresses.routerBTC, // router
    addresses.vaultBTC, // vault
    addresses.WCORE, // weth
    addresses.btcUsdg, // usde
    expandDecimals(1, 17), // 0.01
    expandDecimals(10, 30) // min purchase token amount usd
  ), "orderBook.initialize");

  writeTmpAddresses({
    orderBookBTC: orderBook.address
  })
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })

// npx hardhat run scripts/core/deployOrderBook.js --network core-testnet
