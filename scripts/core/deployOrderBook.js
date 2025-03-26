const { deployContract, contractAt, sendTxn, writeTmpAddresses } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')[network];

async function main() {
  const { nativeToken } = tokens


  // ------------BTC market
  const ROUTER = "0xd910dE6Ac0ED5a5085EF41bFCfDEaB3B3ba39c96"
  const VAULT = "0x736Cad071Fdb5ce7B17F35bB22f68Ad53F55C207"
  const USDG = "0xa60DC7bAb41c8BdB7F0ae762aEdCE13DE0909e73"
  const MULTISIG = "0x9f50221ea9Cb120807121c930a2B8583Fc567e66"

  const orderBook = await deployContract("OrderBook", []);
  await sendTxn(orderBook.initialize(
    ROUTER,
    VAULT,
    nativeToken.address, // weth
    USDG, // usdg
    expandDecimals(1, 17), // 0.01 
    expandDecimals(10, 30) // min purchase token amount usd
  ), "orderBook.initialize");
  await sendTxn(orderBook.setGov(MULTISIG), "orderBook.setGov")


  // // ------------BTC market testnet
  // const ROUTER = "0x08F8645433657c5242F44d5B7252a9E0717BB39d"
  // const VAULT = "0x683fb89cf3C1009f43517A61138703C4f2e8DF95"
  // const USDG = "0x4b051D4DD8575CfF935600063e4FB0a9B9722Df3"

  // const vault = await contractAt("Vault", VAULT);
  // const timelock  = await contractAt("Timelock", await vault.gov())
  // const orderBook = await deployContract("OrderBook", []);
  // const router = await contractAt("Router", ROUTER)

  // await sendTxn(orderBook.initialize(
  //   router.address,
  //   VAULT,
  //   nativeToken.address, // weth
  //   USDG, // usdg
  //   expandDecimals(1, 17), // 0.01 
  //   expandDecimals(10, 30) // min purchase token amount usd
  // ), "orderBook.initialize");
  // await sendTxn(router.addPlugin(orderBook.address), "router.addPlugin")
  // await sendTxn(timelock.setContractHandler(orderBook.address, VAULT), "timelock.setContractHandler")

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