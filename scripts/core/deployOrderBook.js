const { deployContract, contractAt, sendTxn, writeTmpAddresses } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')[network];

async function main() {
  const { nativeToken } = tokens


  // ------------BTC market
  const orderBook = await deployContract("OrderBook", []);
  await sendTxn(orderBook.initialize(
    "0xC9e6275cc66f066f485617F6C9C6B9D32D4a31B4", // router
    "0x8D1F4c528FD879A83aa41d4e1261c210Dd6e28d0", // vault
    nativeToken.address, // weth
    "0x9bC26AC9C5Dc3AA99eC178731C64915Ed286ac0E", // usdg
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
