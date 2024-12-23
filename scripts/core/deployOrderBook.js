const { deployContract, contractAt, sendTxn, writeTmpAddresses } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')[network];

async function main() {
  const { nativeToken } = tokens


  // ------------BTC market
  const orderBook = await deployContract("OrderBook", []);
  await sendTxn(orderBook.initialize(
    "0xd910dE6Ac0ED5a5085EF41bFCfDEaB3B3ba39c96", // router
    "0x736Cad071Fdb5ce7B17F35bB22f68Ad53F55C207", // vault
    nativeToken.address, // weth
    "0xa60DC7bAb41c8BdB7F0ae762aEdCE13DE0909e73", // usdg
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