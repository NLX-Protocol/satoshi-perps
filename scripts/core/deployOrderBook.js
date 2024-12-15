const { deployContract, contractAt, sendTxn, writeTmpAddresses } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')[network];

async function main() {
  const { nativeToken } = tokens


  // ------------BTC market
  const orderBook = await deployContract("OrderBook", []);
  await sendTxn(orderBook.initialize(
    "0x49a01E1C664D1a63c7bfafF2298d86A9D548356e", // router
    "0x20192f037BfC79f667Ca0e444D87E8a7cC7f6345", // vault
    nativeToken.address, // weth
    "0x538fbBA3B0d9d2eA116d5A7EAa6D68a778d15c4E", // usdg
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
