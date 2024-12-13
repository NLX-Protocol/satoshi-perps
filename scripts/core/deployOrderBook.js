const { deployContract, contractAt, sendTxn, writeTmpAddresses } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')[network];

async function main() {
  const { nativeToken } = tokens


  // ------------BTC market
  const orderBook = await deployContract("OrderBook", []);
  await sendTxn(orderBook.initialize(
    "0xf284427d857038F94e0dB39A75392be76E5077C3", // router
    "0xadFfd30C98181d5D647EaF0a969421f0f73d9028", // vault
    nativeToken.address, // weth
    "0x1FCb2f02cC874Fd6465Ac50024bAD8a38e18208C", // usdg
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
