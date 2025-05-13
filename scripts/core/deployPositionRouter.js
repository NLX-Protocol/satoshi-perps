const { getFrameSigner, deployContract, contractAt, sendTxn, readTmpAddresses, writeTmpAddresses } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const { toUsd } = require("../../test/shared/units")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')[network];





// // testnet
// const positionKeepers = [
//   "0x77B6935623878F8f9dce8E1A28d4A8A7E89A37b6",
//   "0x0666992F2D2fD045e9b876B5490F5470452aFBD3",
// ]

// mainnet
/*const positionKeepers = [
  "0xa766db45cd087f3d8374d363624B6579f0474D5F",
  "0x82bbd2795d9b6Fc08305eb21ffB3c07C1Ad104E8",
]*/

const positionKeepers = [
  "0x061B9ede7731dE3c16767CEA82eF18BED69fD8ce",
]

async function main() {
  const vault = await contractAt("Vault", "0x7266488Fb3529a06B62092492B44824c21c47820")
  const shortsTracker = await contractAt("ShortsTracker", "0xc352346B69f8982e90ED78e38e2D7E91d50064e8")

  const wallet = (await ethers.getSigners())[0]




  const router = await contractAt("Router", await vault.router(),)
  const weth = await contractAt("WCORE", tokens.nativeToken.address)


  const depositFee = "30" // 0.3%
  const minExecutionFee = "100000000000000000" // 0.1 Core



  const referralStorage = await deployContract("ReferralStorage", [])

  const positionUtils = await deployContract("PositionUtils", [])


  const positionRouterArgs = [vault.address, router.address, weth.address, shortsTracker.address, depositFee, minExecutionFee]

  const positionRouter = await deployContract("PositionRouter", positionRouterArgs, "PositionRouter", {
    libraries: {
      PositionUtils: positionUtils.address,
    }
  })


  await sendTxn(referralStorage.setHandler(positionRouter.address, true), "referralStorage.setHandler(positionRouter)")
  await sendTxn(positionRouter.setReferralStorage(referralStorage.address), "positionRouter.setReferralStorage")



  await sendTxn(shortsTracker.setHandler(positionRouter.address, true), "shortsTrackerTimelock.signalSetHandler(positionRouter)")
  await sendTxn(router.addPlugin(positionRouter.address), "router.addPlugin")

  await sendTxn(positionRouter.setDelayValues(0, 180, 30 * 60), "positionRouter.setDelayValues")
  await sendTxn(positionRouter.setAdmin(wallet.address), "positionRouter.setAdmin")
  for (const positionKeeper of positionKeepers){
    console.log({ positionKeeper});

    await sendTxn(positionRouter.setPositionKeeper(positionKeeper, true), "positionRouter.setPositionKeeper")
  }


  // deploy shortsTrackerTimelock
  const buffer = 0 // 0 seconds
  const updateDelay = 300 // 300 seconds, 5 minutes
  const maxAveragePriceChange = 20 // 0.2%
  const shortsTrackerTimelock = await deployContract("ShortsTrackerTimelock", [wallet.address, buffer, updateDelay, maxAveragePriceChange])

  await sendTxn(shortsTracker.setGov(shortsTrackerTimelock.address), "shortsTracker.setGov")

  const addresses = {
    referralStorageBTC: referralStorage.address,
    positionUtilsBTC: positionUtils.address,
    positionRouterBTC: positionRouter.address,
    shortsTrackerTimelockBTC: shortsTrackerTimelock.address,
  }

  writeTmpAddresses(addresses)


}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })

  // npx hardhat run scripts/core/deployPositionRouter.js --network core-testnet
