const { contractAt, deployContract, sendTxn, writeTmpAddresses, deployUpgradeableContract, readTmpAddresses } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const { toUsd } = require("../../test/shared/units")
const { errors } = require("../../test/core/Vault/helpers")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')[network];

async function main() {
  const { nativeToken } = tokens
  const wallet = (await ethers.getSigners())[0]

  // Check if this is first deployment or upgrade
  let isUpgrade = false;
  let addresses;

  try {
    addresses = readTmpAddresses();
    isUpgrade = addresses.vaultBTC !== undefined;
  } catch (e) {
    console.log("No existing addresses found, proceeding with fresh deployment");
  }

  let vault, vaultImplementation, vaultProxyAdmin;

  if (isUpgrade) {
    console.log("Performing upgrade of existing vault...");

    // Use existing proxy address
    vault = await contractAt("Vault", addresses.vaultBTC);
    const proxyAdmin = await contractAt("GovernedProxyAdmin", addresses.vaultBTCProxyAdmin);

    // Deploy new implementation only
    const newImplementation = await deployContract("Vault", []);
    console.log("New implementation deployed at:", newImplementation.address);

    // Save current implementation before upgrading
    const currentImpl = await proxyAdmin.getProxyImplementation(addresses.vaultBTC);
    console.log("Current implementation:", currentImpl);

    // Upgrade proxy to new implementation
    await proxyAdmin.upgrade(addresses.vaultBTC, newImplementation.address);
    console.log("Vault upgraded!");

    vaultImplementation = newImplementation.address;
    vaultProxyAdmin = addresses.vaultBTCProxyAdmin;


    const currentGov = await vault.gov();
    console.log("Current gov:", currentGov);
    // Transfer gov back to wallet temporarily
    if (currentGov !== wallet.address) {
      const timelock = await contractAt("Timelock", currentGov);
      const tx = await timelock.signalSetGov(vault.address, wallet.address);
      await tx.wait();
      await new Promise(resolve => setTimeout(resolve, 2000));
      await timelock.setGov(vault.address);
      console.log("Gov transferred to wallet");
    }

  } else {
    console.log("Performing fresh deployment...");

    // Deploy new upgradeable vault
    const vaultUpgradeableContracts = await deployUpgradeableContract("Vault", [], undefined, {
      proxyAdmin: "GovernedProxyAdmin"
    })

    vault = vaultUpgradeableContracts.proxy;
    vaultImplementation = vaultUpgradeableContracts.implementationAddress;
    vaultProxyAdmin = vaultUpgradeableContracts.proxyAdminAddress;
  }


  let btcUsdg;
  let slpBTC;
  let router;
  let vaultPriceFeed;
  if(isUpgrade){
    btcUsdg = await contractAt("BTC_USDG", addresses.btcUsdg);
    slpBTC = await contractAt("SLPBTC", addresses.slpBTC);
    router = await contractAt("Router", addresses.routerBTC)
    vaultPriceFeed = await contractAt("VaultPriceFeed", addresses.vaultPriceFeedBTC)
  } else {
    btcUsdg = await deployContract("BTC_USDG", [vault.address])
    slpBTC = await deployContract("SLPBTC", [])
    router = await deployContract("Router", [vault.address, btcUsdg.address, nativeToken.address])
    vaultPriceFeed = await deployContract("VaultPriceFeed", [])
  }

  const shortsTracker = await deployContract("ShortsTracker", [vault.address], "ShortsTracker")

  const slpManager = await deployContract("SlpManager", [
    vault.address,
    btcUsdg.address,
    slpBTC.address,
    shortsTracker.address,
    0,
  ])
  // await sendTxn(slpManager.setInPrivateMode(true), "slpManager.setInPrivateMode")

  await sendTxn(slpBTC.setMinter(slpManager.address, true), "slpBTC.setMinter")
  await sendTxn(btcUsdg.addVault(slpManager.address), "btcUsdg.addVault(slpManager)")

  // Only initialize if fresh deployment
  if (!isUpgrade) {
    await sendTxn(vaultPriceFeed.setMaxStrictPriceDeviation(expandDecimals(1, 28)), "vaultPriceFeed.setMaxStrictPriceDeviation")

    await sendTxn(vault.initialize(
      router.address, // router
      btcUsdg.address, // usdg
      vaultPriceFeed.address, // priceFeed
      toUsd(5), // liquidationFeeUsd
      100, // fundingRateFactor
      100 // stableFundingRateFactor
    ), "vault.initialize")
  } else {
    console.log("Skipping vault initialization (already initialized)");
  }

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

  // Save addresses
  writeTmpAddresses({
    btcUsdg: btcUsdg.address,
    slpBTC: slpBTC.address,
    vaultBTC: vault.address,
    currentVaultImplementationBTC: vaultImplementation,
    previousVaultImplementationBTC: isUpgrade ? addresses.currentVaultImplementationBTC : undefined,
    vaultBTCProxyAdmin: vaultProxyAdmin,
    routerBTC: router.address,
    vaultPriceFeedBTC: vaultPriceFeed.address,
    slpManagerBTC: slpManager.address,
    shortsTrackerBTC: shortsTracker.address,
    vaultErrorControllerBTC: vaultErrorController.address,
    vaultUtilsBTC: vaultUtils.address,
    vaultTimelockBTC: vaultTimelock.address,
  })
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })

// npx hardhat run scripts/core/deployVault.js --network core-testnet
