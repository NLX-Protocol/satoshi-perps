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

  // const vault = await contractAt("Vault", "0x489ee077994B6658eAfA855C308275EAd8097C4A")
  const usdgUsd = await deployContract("USDGUSD", [vault.address])
  // const usdg = await contractAt("USDG", "0x45096e7aA921f27590f8F19e457794EB09678141")
  const router = await deployContract("Router", [vault.address, usdgUsd.address, nativeToken.address])
  // const router = await contractAt("Router", "0xaBBc5F99639c9B6bCb58544ddf04EFA6802F4064")
  // const vaultPriceFeed = await contractAt("VaultPriceFeed", "0x30333ce00ac3025276927672aaefd80f22e89e54")
  // const secondaryPriceFeed = await deployContract("FastPriceFeed", [5 * 60])

  const vaultPriceFeed = await deployContract("VaultPriceFeed", [])

  await sendTxn(vaultPriceFeed.setMaxStrictPriceDeviation(expandDecimals(1, 28)), "vaultPriceFeed.setMaxStrictPriceDeviation") // 0.05 USD
  await sendTxn(vaultPriceFeed.setPriceSampleSpace(1), "vaultPriceFeed.setPriceSampleSpace")
  await sendTxn(vaultPriceFeed.setIsAmmEnabled(false), "vaultPriceFeed.setIsAmmEnabled")

  const nlpUsd = await deployContract("NLPUSD", [])
  await sendTxn(nlpUsd.setInPrivateTransferMode(true), "nlpUsd.setInPrivateTransferMode")


  const shortsTracker = await deployContract("ShortsTracker", [vault.address], "ShortsTracker",)

  const nlpManager = await deployContract("NlpManager", [vault.address, usdgUsd.address, nlpUsd.address, shortsTracker.address, 15 * 60])
  // await sendTxn(nlpManager.setInPrivateMode(true), "nlpManager.setInPrivateMode")

  await sendTxn(nlpUsd.setMinter(nlpManager.address, true), "nlpUsd.setMinter")
  await sendTxn(usdgUsd.addVault(nlpManager.address), "usdgUsd.addVault(nlpManager)")

  await sendTxn(vault.initialize(
    router.address, // router
    usdgUsd.address, // usdg
    vaultPriceFeed.address, // priceFeed
    toUsd(5), // liquidationFeeUsd
    100, // fundingRateFactor
    100 // stableFundingRateFactor
  ), "vault.initialize")

  await sendTxn(vault.setFundingRate(60 * 60, 100, 100), "vault.setFundingRate")

  await sendTxn(vault.setInManagerMode(true), "vault.setInManagerMode")
  await sendTxn(vault.setManager(nlpManager.address, true), "vault.setManager")

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
    nlpManager.address, // nlpManager
    nlpManager.address, // prevNlpManager
    wallet.address, // rewardRouter
    expandDecimals(100_000_000, 18), // maxTokenSupply
    50, // marginFeeBasisPoints 0.5%
    500, // maxMarginFeeBasisPoints 5%
  ])
  await sendTxn(vault.setGov(vaultTimelock.address), "vault.setGov")

  const addresses = {
    usdgUsd: usdgUsd.address,
    nlpUsd: nlpUsd.address,
    usdVault: vault.address,
    routerUsd: router.address,
    vaultPriceFeedUsd: vaultPriceFeed.address,
    nlpManagerUsd: nlpManager.address,
    shortsTrackerUsd: shortsTracker.address,
    vaultErrorControllerUsd: vaultErrorController.address,
    vaultUtilsUsd: vaultUtils.address,
    vaultTimelockUsd: vaultTimelock.address,
  }
  writeTmpAddresses(addresses)

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
