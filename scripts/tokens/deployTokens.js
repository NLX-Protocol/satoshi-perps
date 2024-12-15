const { deployContract, sendTxn, writeTmpAddresses, callWithRetries } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")

async function main() {
  const addresses = {}

  // SYNTHETICS
  addresses["BTC"] = (await callWithRetries(deployContract, ["SyntheticToken", ["Bitcoin", "BTC"]])).address
  // addresses["GOLD"] = (await callWithRetries(deployContract, ["SyntheticToken", ["GOLD", "GOLD"]])).address
  // addresses["OIL"] = (await callWithRetries(deployContract, ["SyntheticToken", ["OIL", "OIL"]])).address
  addresses["CORE"] = (await callWithRetries(deployContract, ["SyntheticToken", ["CORE", "CORE"]])).address
  addresses["ETH"] = (await callWithRetries(deployContract, ["SyntheticToken", ["ETH", "ETH"]])).address
  addresses["SOL"] = (await callWithRetries(deployContract, ["SyntheticToken", ["SOL", "SOL"]])).address
  addresses["BNB"] = (await callWithRetries(deployContract, ["SyntheticToken", ["BNB", "BNB"]])).address
  addresses["DOGE"] = (await callWithRetries(deployContract, ["SyntheticToken", ["DOGE", "DOGE"]])).address
  addresses["TRX"] = (await callWithRetries(deployContract, ["SyntheticToken", ["TRX", "TRX"]])).address
  addresses["SUI"] = (await callWithRetries(deployContract, ["SyntheticToken", ["SUI", "SUI"]])).address
  addresses["AVAX"] = (await callWithRetries(deployContract, ["SyntheticToken", ["AVAX", "AVAX"]])).address
  addresses["XRP"] = (await callWithRetries(deployContract, ["SyntheticToken", ["XRP", "XRP"]])).address
  addresses["SHIB"] = (await callWithRetries(deployContract, ["SyntheticToken", ["SHIB", "SHIB"]])).address
  addresses["BONK"] = (await callWithRetries(deployContract, ["SyntheticToken", ["BONK", "BONK"]])).address
  addresses["FLOKI"] = (await callWithRetries(deployContract, ["SyntheticToken", ["FLOKI", "FLOKI"]])).address
  addresses["ENA"] = (await callWithRetries(deployContract, ["SyntheticToken", ["ENA", "ENA"]])).address
  addresses["LINK"] = (await callWithRetries(deployContract, ["SyntheticToken", ["LINK", "LINK"]])).address
  addresses["POPCAT"] = (await callWithRetries(deployContract, ["SyntheticToken", ["POPCAT", "POPCAT"]])).address

  // COLLATERAL TOKENS
  addresses["SolvBTC.CORE"] = (await callWithRetries(deployContract, ["FaucetToken", ["SolvBTC.CORE", "SolvBTC.CORE", 18, expandDecimals(1, 18)]])).address

  // Native Token
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