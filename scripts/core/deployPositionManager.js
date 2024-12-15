const { getFrameSigner, deployContract, contractAt, sendTxn, writeTmpAddresses } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const { toUsd } = require("../../test/shared/units")
const { errors } = require("../../test/core/Vault/helpers")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')[network];

const depositFee = 30 // 0.3%


async function main() {

  // -------------------BTC --------------------
  const positionManagerAddress = undefined
  const vault = await contractAt("Vault", "0x20192f037BfC79f667Ca0e444D87E8a7cC7f6345")
  const timelock = await contractAt("Timelock", await vault.gov())
  const router = await contractAt("Router", await vault.router())
  const shortsTracker = await contractAt("ShortsTracker", "0x936C54e4E9530e26a2655D09182898b75DE566cF")
  const shortsTrackerTimelock = await contractAt("ShortsTrackerTimelock", await shortsTracker.gov())
  const weth = await contractAt("WETH", tokens.nativeToken.address)
  const orderBook = await contractAt("OrderBook", "0x762D4046fE8Cd4EA194930CD5cC9073B086A1968")
  const referralStorage = await contractAt("ReferralStorage", "0x0db0429B421295590E1328Ba877cb22ba59637e5")
  const positionUtils = await contractAt("PositionUtils", "0xe128bD2BCeE14260f4262ff9276f8ba0b27415c8")


  const orderKeepers = [
    { address: "0x77B6935623878F8f9dce8E1A28d4A8A7E89A37b6" },
    { address: "0x0666992F2D2fD045e9b876B5490F5470452aFBD3" }
  ]
  const liquidators = [
    { address: "0x73CbB4801bFE4AD34d8B0Fd3dab8bE0E9e9d2579" }
  ]

  const partnerContracts = []




  let positionManager
  if (positionManagerAddress) {
    console.log("Using position manager at", positionManagerAddress)
    positionManager = await contractAt("PositionManager", positionManagerAddress)
  } else {
    console.log("Deploying new position manager")
    const positionManagerArgs = [vault.address, router.address, shortsTracker.address, weth.address, depositFee, orderBook.address]
    positionManager = await deployContract("PositionManager", positionManagerArgs, "PositionManager", {
      libraries: {
        PositionUtils: positionUtils.address,
      }
    })
  }

  // positionManager only reads from referralStorage so it does not need to be set as a handler of referralStorage
  if ((await positionManager.referralStorage()).toLowerCase() != referralStorage.address.toLowerCase()) {
    await sendTxn(positionManager.setReferralStorage(referralStorage.address), "positionManager.setReferralStorage")
  }
  if (await positionManager.shouldValidateIncreaseOrder()) {
    await sendTxn(positionManager.setShouldValidateIncreaseOrder(false), "positionManager.setShouldValidateIncreaseOrder(false)")
  }

  for (let i = 0; i < orderKeepers.length; i++) {
    const orderKeeper = orderKeepers[i]
    if (!(await positionManager.isOrderKeeper(orderKeeper.address))) {
      await sendTxn(positionManager.setOrderKeeper(orderKeeper.address, true), "positionManager.setOrderKeeper(orderKeeper)")
    }
  }

  for (let i = 0; i < liquidators.length; i++) {
    const liquidator = liquidators[i]
    if (!(await positionManager.isLiquidator(liquidator.address))) {
      await sendTxn(positionManager.setLiquidator(liquidator.address, true), "positionManager.setLiquidator(liquidator)")
    }
  }

  if (!(await timelock.isHandler(positionManager.address))) {
    await sendTxn(timelock.setContractHandler(positionManager.address, true), "timelock.setContractHandler(positionManager)")
  }
  if (!(await vault.isLiquidator(positionManager.address))) {
    await sendTxn(timelock.setLiquidator(vault.address, positionManager.address, true), "timelock.setLiquidator(vault, positionManager, true)")
  }
  if (!(await shortsTracker.isHandler(positionManager.address))) {
    await sendTxn(shortsTrackerTimelock.signalSetHandler(shortsTracker.address, positionManager.address, true), "shortsTrackerTimelock.signalSetHandler")
    await sendTxn(shortsTrackerTimelock.setHandler(shortsTracker.address, positionManager.address, true), "shortsTrackerTimelock.setHandler")
    // await sendTxn(shortsTracker.setHandler(positionManager.address, true), "shortsTracker.setContractHandler(positionManager.address, true)")
  }
  if (!(await router.plugins(positionManager.address))) {
    await sendTxn(router.addPlugin(positionManager.address), "router.addPlugin(positionManager)")
  }

  for (let i = 0; i < partnerContracts.length; i++) {
    const partnerContract = partnerContracts[i]
    if (!(await positionManager.isPartner(partnerContract))) {
      await sendTxn(positionManager.setPartner(partnerContract, true), "positionManager.setPartner(partnerContract)")
    }
  }

  if ((await positionManager.gov()) != (await vault.gov())) {
    await sendTxn(positionManager.setGov(await vault.gov()), "positionManager.setGov")
  }

  const addresses = {
    positionManagerBTC: positionManager.address,
  }
  writeTmpAddresses(addresses)
  console.log("done.")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
