const { getFrameSigner, deployContract, contractAt, sendTxn, readTmpAddresses, writeTmpAddresses } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const { toUsd } = require("../../test/shared/units")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')[network];



const VAULT = "0xadFfd30C98181d5D647EaF0a969421f0f73d9028" //BTC
const VAULT_PRICE_FEED = "0xfD38B765A6dC05C42f8B369f421Ce6E9663ebF7D"

async function main() {
  const wallet = (await ethers.getSigners())[0]

  const {
    BTC, GOLD, OIL, CORE, ETH, SOL, BNB, DOGE, TRX, SUI, AVAX, XRP, SHIB, BONK, FLOKI, ENA, LINK, POPCAT, SolvBTC
  } = tokens

  const vaultPriceFeedTimelock = await deployContract("PriceFeedTimelock", [
    wallet.address,
    0,
    wallet.address
  ])

  // ----------BTC market----------


  const tokenArr = [BTC, GOLD, OIL, CORE, ETH, SOL, BNB, DOGE, TRX, SUI, AVAX, XRP, SHIB, BONK, FLOKI, ENA, LINK, POPCAT, SolvBTC]

  const addresses = {
    vaultPriceFeedTimelockBTC: vaultPriceFeedTimelock.address,
  }



  const vaultPriceFeed = await contractAt("VaultPriceFeed", VAULT_PRICE_FEED,)
  const vault = await contractAt("Vault", VAULT)


  for (const tokenItem of tokenArr) {
    if (tokenItem.spreadBasisPoints === undefined) { continue }
    await sendTxn(vaultPriceFeed.setSpreadBasisPoints(
      tokenItem.address, // _token
      tokenItem.spreadBasisPoints // _spreadBasisPoints
    ), `vaultPriceFeed.setSpreadBasisPoints(${tokenItem.name}) ${tokenItem.spreadBasisPoints}`)
  }



  for (const token of tokenArr) {
    await sendTxn(vault.setTokenConfig(
      token.address, // _token
      token.decimals, // _tokenDecimals
      token.tokenWeight, // _tokenWeight
      token.minProfitBps, // _minProfitBps
      expandDecimals(token.maxUsdgAmount, 30), // _maxUsdgAmount
      token.isStable, // _isStable
      token.isShortable // _isShortable
    ), `vault.setTokenConfig(${token.name}) ${token.address}`)
  }

  await sendTxn(vaultPriceFeed.setGov(vaultPriceFeedTimelock.address), "vaultPriceFeed.setGov")

  writeTmpAddresses(addresses)

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
