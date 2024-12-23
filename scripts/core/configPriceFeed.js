const { getFrameSigner, deployContract, contractAt, sendTxn, readTmpAddresses, writeTmpAddresses } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const { toUsd } = require("../../test/shared/units")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')[network];



const VAULT = "0x736Cad071Fdb5ce7B17F35bB22f68Ad53F55C207" //BTC
const VAULT_PRICE_FEED = "0x0eE402630B89A38325dcEAf3c0cF9cac933142D8"

async function main() {
  const wallet = (await ethers.getSigners())[0]

  const {
    BTC,  CORE, ETH, SOL, BNB, DOGE, TRX, SUI, AVAX, XRP, SHIB, BONK, FLOKI, ENA, LINK, POPCAT, SolvBTC
  } = tokens

  const vaultPriceFeedTimelock = await deployContract("PriceFeedTimelock", [
    wallet.address,
    0,
    wallet.address
  ])

  // ----------BTC market----------


  const tokenArr = [BTC,  CORE, ETH, SOL, BNB, DOGE, TRX, SUI, AVAX, XRP, SHIB, BONK, FLOKI, ENA, LINK, POPCAT, SolvBTC]

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
      expandDecimals(token.maxLongOpenInterest, 30), // _maxLongOpenInterest
      expandDecimals(token.maxShortOpenInterest, 30), // _maxShortOpenInterest
      token.isStable, // _isStable
      token.isShortable // _isShortable
    ), `vault.setTokenConfig(${token.name}) ${token.address}`)
  }

  // const timelock = await contractAt("Timelock", await vault.gov())
  // for (const token of tokenArr) {
  //   await sendTxn(timelock.setVaultTokenConfig(
  //     vault.address, // _vault
  //     token.address, // _token
  //     token.decimals, // _tokenDecimals
  //     token.tokenWeight, // _tokenWeight
  //     token.minProfitBps, // _minProfitBps
  //     expandDecimals(token.maxUsdgAmount, 30), // _maxUsdgAmount
  //     expandDecimals(token.maxLongOpenInterest, 30), // _maxLongOpenInterest
  //     expandDecimals(token.maxShortOpenInterest, 30), // _maxShortOpenInterest
  //     token.isStable, // _isStable
  //     token.isShortable // _isShortable
  //   ), `timelock.setTokenConfig(${token.name}) ${token.address}`)
  // }

  await sendTxn(vaultPriceFeed.setGov(vaultPriceFeedTimelock.address), "vaultPriceFeed.setGov")

  writeTmpAddresses(addresses)

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
//  npx hardhat run scripts/core/configPriceFeed.js --network core-testnet