const { getFrameSigner, deployContract, contractAt, sendTxn, readTmpAddresses, writeTmpAddresses } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const { toUsd } = require("../../test/shared/units")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')[network];




// ------------BTC MARKETS
const positionKeepers = [
  "0x77B6935623878F8f9dce8E1A28d4A8A7E89A37b6",
  "0x0666992F2D2fD045e9b876B5490F5470452aFBD3",
  "0x73CbB4801bFE4AD34d8B0Fd3dab8bE0E9e9d2579"
]

async function main() {
  const vault = await contractAt("Vault", "0x20192f037BfC79f667Ca0e444D87E8a7cC7f6345")
  const shortsTracker = await contractAt("ShortsTracker", "0x936C54e4E9530e26a2655D09182898b75DE566cF")

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
