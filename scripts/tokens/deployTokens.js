const { deployContract, sendTxn, writeTmpAddresses, callWithRetries } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")

async function main() {
  const addresses = {}
  addresses.aBTC = (await callWithRetries(deployContract, ["FaucetToken", ["Bitcoin", "aBTC", 18, expandDecimals(1, 18)]])).address
  addresses.COREBTC = (await callWithRetries(deployContract, ["FaucetToken", ["Bitcoin", "COREBTC", 8, expandDecimals(1, 8)]])).address
  addresses.solvBTC = (await callWithRetries(deployContract, ["FaucetToken", ["Bitcoin", "solvBTC", 18, expandDecimals(1, 18)]])).address
  addresses.USDT = (await callWithRetries(deployContract, ["FaucetToken", ["Tether", "USDT", 6, expandDecimals(1000, 6)]])).address
  addresses.USDC = (await callWithRetries(deployContract, ["FaucetToken", ["USDC Coin", "USDC", 6, expandDecimals(1000, 6)]])).address
  addresses.USDE = (await callWithRetries(deployContract, ["FaucetToken", ["USDE Coin", "USDE", 6, expandDecimals(1000, 6)]])).address
  addresses.WCORE = (await callWithRetries(deployContract, ["WCORE", []])).address

  writeTmpAddresses(addresses)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })

// GMX
// Vault
// Router
// PositionRouter
// OrderBook
// Reader
// RewardReader
// OrderBookReader
// StakedGmx
// StakedGlp
// GlpManager
// RewardRouter
// GlpRewardRouter
// ReferralStorage
// GMX-ETH Uniswap Pool