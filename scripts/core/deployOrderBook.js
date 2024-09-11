const { deployContract, contractAt, sendTxn, writeTmpAddresses } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')[network];

async function main() {
  const { nativeToken } = tokens

  const orderBook = await deployContract("OrderBook", []);

  // // ------------BTC markets   
  // await sendTxn(orderBook.initialize(
  //   "0x2c82171Ae959BAA99A41B8185aCae9B72ad12EFE", // router
  //   "0xB3992C9eaE205CC5AD8c95F79131d429287aE1e7", // vault
  //   nativeToken.address, // weth
  //   "0x5fC409DBdBe40D5EC1A2b8E83C89871594c44a11", // usdg
  //   expandDecimals(1, 17), // 0.01 
  //   expandDecimals(10, 30) // min purchase token amount usd
  // ), "orderBook.initialize");

  // writeTmpAddresses({
  //   orderBookBTC: orderBook.address
  // })

  // // ------------CORE markets   
  // await sendTxn(orderBook.initialize(
  //   "0x4a02be3715112Cb7781438d3Af5e3d3C0AB8C031", // router
  //   "0x026a7149B3591b9811B5500041ba143a74c71344", // vault
  //   nativeToken.address, // weth
  //   "0xafE604f9eB343De2f431dd3Bbc73e74f95dDE4c9", // usdg
  //   expandDecimals(1, 17), // 0.01 
  //   expandDecimals(10, 30) // min purchase token amount usd
  // ), "orderBook.initialize");

  // writeTmpAddresses({
  //   orderBookCore: orderBook.address
  // })

  // ------------USD markets   
  await sendTxn(orderBook.initialize(
    "0xeB389909dB517F92A70aB893204613260A13cd56", // router
    "0x4204d09EC45e305Ecf06dC872B928e345F664678", // vault
    nativeToken.address, // weth
    "0x2468C5e719c01337de9155FB6B1f093607fe2e21", // usdg
  expandDecimals(1, 17), // 0.01 
  expandDecimals(10, 30) // min purchase token amount usd
  ), "orderBook.initialize");

  writeTmpAddresses({
    orderBookUsd: orderBook.address
  })


}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
