const {
  getFrameSigner,
  deployContract,
  contractAt,
  sendTxn,
  readTmpAddresses,
  writeTmpAddresses
} = require("../shared/helpers")
const {expandDecimals} = require("../../test/shared/utilities")
const {toUsd} = require("../../test/shared/units")

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
  const addresses = readTmpAddresses()
  const vault = await contractAt("Vault", addresses.vaultBTC)
  const shortsTracker = await contractAt("ShortsTracker", addresses.shortsTrackerBTC)

  const wallet = (await ethers.getSigners())[0]

  const router = await contractAt("Router", addresses.routerBTC)
  const weth = await contractAt("WCORE", addresses.WCORE)


  const depositFee = "30" // 0.3%
  const minExecutionFee = "100000000000000000" // 0.1 Core


  let isUpgrade = false;

  try {
    isUpgrade = addresses.referralStorageBTC !== undefined;
  } catch (e) {
    console.log("No existing addresses found, proceeding with fresh deployment");
  }

  let referralStorage;
  if(isUpgrade){
    referralStorage = await contractAt("ReferralStorage", addresses.referralStorageBTC)
    // turn gov back to wallet temporarily
    const currentGov = await referralStorage.gov();
    if (currentGov !== wallet.address) {
      const timelock = await contractAt("Timelock", currentGov);
      const tx = await timelock.signalSetGov(referralStorage.address, wallet.address);
      await tx.wait();
      await new Promise(resolve => setTimeout(resolve, 1000));
      await timelock.setGov(referralStorage.address);
      console.log("referralStorage Gov transferred to wallet");
    }
  } else
    referralStorage = await deployContract("ReferralStorage", [])

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
  for (const positionKeeper of positionKeepers) {
    console.log({positionKeeper});
    await sendTxn(positionRouter.setPositionKeeper(positionKeeper, true), "positionRouter.setPositionKeeper")
  }

  // deploy shortsTrackerTimelock
  const buffer = 0 // 0 seconds
  const updateDelay = 300 // 300 seconds, 5 minutes
  const maxAveragePriceChange = 20 // 0.2%
  const shortsTrackerTimelock = await deployContract("ShortsTrackerTimelock", [wallet.address, buffer, updateDelay, maxAveragePriceChange])

  await sendTxn(shortsTracker.setGov(shortsTrackerTimelock.address), "shortsTracker.setGov")

  writeTmpAddresses({
    referralStorageBTC: referralStorage.address,
    positionUtilsBTC: positionUtils.address,
    positionRouterBTC: positionRouter.address,
    shortsTrackerTimelockBTC: shortsTrackerTimelock.address,
  })
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })

// npx hardhat run scripts/core/deployPositionRouter.js --network core-testnet
