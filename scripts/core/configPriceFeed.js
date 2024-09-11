const { getFrameSigner, deployContract, contractAt, sendTxn, readTmpAddresses, writeTmpAddresses } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const { toUsd } = require("../../test/shared/units")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')[network];




async function main() {
  const wallet = (await ethers.getSigners())[0]

  const { aBTC, solvBTC, coreBTC, usdt, usdc, usde, core } = tokens
  const vaultPriceFeedTimelock = await deployContract("PriceFeedTimelock", [
    wallet.address,
    0,
    wallet.address
  ])

  // // ----------BTC market----------
  // const vaultPriceFeedContract = "0x7d47e535E620566fa7ba716D1B41E380d5dd2904"
  // const tokenArr = [aBTC, solvBTC, coreBTC]
  // const addresses = {
  //   vaultPriceFeedTimelockBTC: vaultPriceFeedTimelock.address,
  // }

  // // ----------CORE market----------
  // const vaultPriceFeedContract = "0x05DBa9dB32e5c54F8a523F5a43bD9DC9D04C8AcC"
  // const tokenArr = [core]
  // const addresses = {
  //   vaultPriceFeedTimelockCore: vaultPriceFeedTimelock.address,
  // }


  // ----------USD market----------
  const vaultPriceFeedContract = "0x94823c97c127E0e5617f5182d3FdcBBF3F9E56C5"
  const tokenArr = [usdt, usdc, usde ]
  const addresses = {
    vaultPriceFeedTimelockUsd: vaultPriceFeedTimelock.address,
  }

  const vaultPriceFeed = await contractAt("VaultPriceFeed", vaultPriceFeedContract,)

  await sendTxn(vaultPriceFeed.setMaxStrictPriceDeviation(expandDecimals(1, 28)), "vaultPriceFeed.setMaxStrictPriceDeviation") // 0.01 USD
  await sendTxn(vaultPriceFeed.setPriceSampleSpace(1), "vaultPriceFeed.setPriceSampleSpace")
  await sendTxn(vaultPriceFeed.setIsAmmEnabled(false), "vaultPriceFeed.setIsAmmEnabled")

  for (const [i, tokenItem] of tokenArr.entries()) {
    if (tokenItem.spreadBasisPoints === undefined) { continue }
    await sendTxn(vaultPriceFeed.setSpreadBasisPoints(
      tokenItem.address, // _token
      tokenItem.spreadBasisPoints // _spreadBasisPoints
    ), `vaultPriceFeed.setSpreadBasisPoints(${tokenItem.name}) ${tokenItem.spreadBasisPoints}`)
  }

  for (const token of tokenArr) {

    await sendTxn(vaultPriceFeed.setTokenConfig(
      token.address, // _token
      token.priceFeed, // _priceFeed
      token.priceDecimals, // _priceDecimals
      token.isStrictStable // _isStrictStable
    ), `vaultPriceFeed.setTokenConfig(${token.name}) ${token.address} ${token.priceFeed}`)
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
