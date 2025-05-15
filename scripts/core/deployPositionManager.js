const { getFrameSigner, deployContract, contractAt, sendTxn, writeTmpAddresses, readTmpAddresses} = require("../shared/helpers")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')[network];

const depositFee = 30 // 0.3%


async function main() {

  const addresses = readTmpAddresses()

  const positionManagerAddress = undefined
  const vault = await contractAt("Vault", addresses.vaultBTC)
  const timelock = await contractAt("Timelock", await vault.gov())
  const router = await contractAt("Router", addresses.routerBTC)
  const shortsTracker = await contractAt("ShortsTracker", addresses.shortsTrackerBTC)
  const shortsTrackerTimelock = await contractAt("ShortsTrackerTimelock", await shortsTracker.gov())
  const weth = await contractAt("WETH", addresses.WCORE)
  const orderBook = await contractAt("OrderBook", addresses.orderBookBTC)
  const referralStorage = await contractAt("ReferralStorage", addresses.referralStorageBTC)
  const positionUtils = await contractAt("PositionUtils", addresses.positionUtilsBTC)

  const positionKeepers = [
    { address: "0x061B9ede7731dE3c16767CEA82eF18BED69fD8ce" },
    /*{ address: "0x82bbd2795d9b6Fc08305eb21ffB3c07C1Ad104E8" }*/
  ]
  const liquidators = [
    { address: "0x061B9ede7731dE3c16767CEA82eF18BED69fD8ce" },
    // { address: "0x1C415Dff215B695eFc798866094CfE0a81106D69" }
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

  for (let i = 0; i < positionKeepers.length; i++) {
    const orderKeeper = positionKeepers[i]
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

  writeTmpAddresses({
    positionManagerBTC: positionManager.address,
  })
  console.log("done.")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })

// npx hardhat run scripts/core/deployPositionManager.js --network core-testnet
