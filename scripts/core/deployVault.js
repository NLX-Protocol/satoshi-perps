const { deployContract, contractAt, sendTxn, writeTmpAddresses } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const { toUsd } = require("../../test/shared/units")
const { errors } = require("../../test/core/Vault/helpers")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')[network];

async function main() {

  const { nativeToken } = tokens

  const vault = await deployContract("Vault", [])

  const wallet = (await ethers.getSigners())[0]


  const btcUsdg = await deployContract("BTC_USDG", [vault.address])
  const router = await deployContract("Router", [vault.address, btcUsdg.address, nativeToken.address])


  const vaultPriceFeed = await deployContract("VaultPriceFeed", [])

  await sendTxn(vaultPriceFeed.setMaxStrictPriceDeviation(expandDecimals(1, 28)), "vaultPriceFeed.setMaxStrictPriceDeviation") // 0.05 USD

  const slpBTC = await deployContract("SLPBTC", [])
  // await sendTxn(slpBTC.setInPrivateTransferMode(true), "slpBTC.setInPrivateTransferMode")


  const shortsTracker = await deployContract("ShortsTracker", [vault.address], "ShortsTracker",)

  const slpManager = await deployContract("SlpManager", [
    vault.address, 
    btcUsdg.address, 
    slpBTC.address, 
    shortsTracker.address, 
    0,// coolDown Period - 15 * 60
  ])
  // await sendTxn(slpManager.setInPrivateMode(true), "slpManager.setInPrivateMode")

  await sendTxn(slpBTC.setMinter(slpManager.address, true), "slpBTC.setMinter")
  await sendTxn(btcUsdg.addVault(slpManager.address), "btcUsdg.addVault(slpManager)")

  await sendTxn(vault.initialize(
    router.address, // router
    btcUsdg.address, // usdg
    vaultPriceFeed.address, // priceFeed
    toUsd(5), // liquidationFeeUsd
    100, // fundingRateFactor
    100 // stableFundingRateFactor
  ), "vault.initialize")

  await sendTxn(vault.setFundingRate(60 * 60, 100, 100), "vault.setFundingRate")

  await sendTxn(vault.setInManagerMode(true), "vault.setInManagerMode")
  await sendTxn(vault.setManager(slpManager.address, true), "vault.setManager")

  await sendTxn(vault.setFees(
    10, // _taxBasisPoints
    5, // _stableTaxBasisPoints
    20, // _mintBurnFeeBasisPoints
    20, // _swapFeeBasisPoints
    1, // _stableSwapFeeBasisPoints
    50, // _marginFeeBasisPoints
    toUsd(5), // _liquidationFeeUsd
    24 * 60 * 60, // _minProfitTime
    true // _hasDynamicFees
  ), "vault.setFees")

  await sendTxn(vault.setMaxLeverage(
    250 * 10000 // 250x
  ), "vault.setMaxLeverage")

  const vaultErrorController = await deployContract("VaultErrorController", [])
  await sendTxn(vault.setErrorController(vaultErrorController.address), "vault.setErrorController")
  await sendTxn(vaultErrorController.setErrors(vault.address, errors), "vaultErrorController.setErrors")

  const vaultUtils = await deployContract("VaultUtils", [vault.address])
  await sendTxn(vault.setVaultUtils(vaultUtils.address), "vault.setVaultUtils")

  const vaultTimelock = await deployContract("Timelock", [
    wallet.address, // admin
    0, // buffer
    wallet.address, // tokenManager
    wallet.address, // mintReceiver
    slpManager.address, // slpManager
    slpManager.address, // prevSlpManager
    wallet.address, // rewardRouter
    expandDecimals(100_000_000, 18), // maxTokenSupply
    50, // marginFeeBasisPoints 0.5%
    500, // maxMarginFeeBasisPoints 5%
  ])
  // await sendTxn(vault.setGov(vaultTimelock.address), "vault.setGov")

  const addresses = {
    btcUsdg: btcUsdg.address,
    slpBTC: slpBTC.address,
    vaultBTC: vault.address,
    routerBTC: router.address,
    vaultPriceFeedBTC: vaultPriceFeed.address,
    slpManagerBTC: slpManager.address,
    shortsTrackerBTC: shortsTracker.address,
    vaultErrorControllerBTC: vaultErrorController.address,
    vaultUtilsBTC: vaultUtils.address,
    vaultTimelockBTC: vaultTimelock.address,
  }
  writeTmpAddresses(addresses)

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
