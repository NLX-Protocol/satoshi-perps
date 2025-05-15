const { getFrameSigner, deployContract, contractAt, sendTxn, readTmpAddresses, writeTmpAddresses } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const { toUsd } = require("../../test/shared/units")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')[network];


async function main() {
  const addresses = readTmpAddresses()
  const wallet = (await ethers.getSigners())[0]

  const {
    BTC, CORE, ETH, SOL, BNB, DOGE, TRX, SUI, AVAX, XRP, SHIB, BONK, FLOKI, ENA, LINK, POPCAT, TRUMP, BERA, VIRTUAL, APT, SOLV, KAITO, SolvBTC, WCORE, USDT
  } = tokens
  const tokenArr = [BTC, CORE, ETH, SOL, BNB, DOGE, TRX, SUI, AVAX, XRP, SHIB, BONK, FLOKI, ENA, LINK, POPCAT, TRUMP, BERA, VIRTUAL, APT, SOLV, KAITO, SolvBTC, WCORE, USDT]

  const vaultPriceFeed = await contractAt("VaultPriceFeed", addresses.vaultPriceFeedBTC)
  const vault = await contractAt("Vault", addresses.vaultBTC)
  for (const token of tokenArr) {
    console.log({
      vault: vault.address, // _vault
      token: token.address, // _token
      tokenDecimals: token.decimals, // _tokenDecimals
      tokenWeight: token.tokenWeight, // _tokenWeight
      minProfitBps: token.minProfitBps, // _minProfitBps
      maxUsdgAmount: expandDecimals(token.maxUsdgAmount, 30), // _maxUsdgAmount
      maxLongOpenInterest: expandDecimals(token.maxLongOpenInterest, 30), // _maxLongOpenInterest
      maxShortOpenInterest: expandDecimals(token.maxShortOpenInterest, 30), // _maxShortOpenInterest
      isStable: token.isStable, // _isStable
      isShortable: token.isShortable // _isShortable
    });

  }

  const vaultPriceFeedTimelock = await deployContract("PriceFeedTimelock", [
    wallet.address,
    0,
    wallet.address
  ])

  const timelock = await contractAt("Timelock", await vault.gov())
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

  for (const token of tokenArr) {
    await sendTxn(timelock.setVaultTokenConfig(
      vault.address, // _vault
      token.address, // _token
      token.decimals, // _tokenDecimals
      token.tokenWeight, // _tokenWeight
      token.minProfitBps, // _minProfitBps
      expandDecimals(token.maxUsdgAmount, 30), // _maxUsdgAmount
      expandDecimals(token.maxLongOpenInterest, 30), // _maxLongOpenInterest
      expandDecimals(token.maxShortOpenInterest, 30), // _maxShortOpenInterest
      token.isStable, // _isStable
      token.isShortable // _isShortable
    ), `timelock.setTokenConfig(${token.name}) ${token.address}`)
  }

  await sendTxn(vaultPriceFeed.setGov(vaultPriceFeedTimelock.address), "vaultPriceFeed.setGov")

  writeTmpAddresses({
    vaultPriceFeedTimelockBTC: vaultPriceFeedTimelock.address,
  })

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
//  npx hardhat run scripts/core/configPriceFeed.js --network core-testnet
