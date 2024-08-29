const { deployContract, contractAt , sendTxn, writeTmpAddresses } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')[network];

async function main() {
  const { nativeToken } = tokens

  const orderBook = await deployContract("OrderBook", []);

  // core testnet addresses
  await sendTxn(orderBook.initialize(
    "0x7112580590d076b48A3C551c169AEC32f7b4bD43", // router
    "0x02b11043120Acaa940bc48fd9809B40CACF10F77", // vault
    nativeToken.address, // weth
    "0x2468C5e719c01337de9155FB6B1f093607fe2e21", // usdg
    "10000000000000000", // 0.01 AVAX
    expandDecimals(10, 30) // min purchase token amount usd
  ), "orderBook.initialize");

  writeTmpAddresses({
    orderBook: orderBook.address
  })
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
