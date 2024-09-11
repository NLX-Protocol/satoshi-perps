const { getFrameSigner, deployContract, contractAt, sendTxn, readTmpAddresses, writeTmpAddresses } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const { toUsd } = require("../../test/shared/units")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')[network];





async function main() {

  const wallet = (await ethers.getSigners())[0]


  // // ------------BTC MARKETS
  // const vault = await contractAt("Vault", "0xB3992C9eaE205CC5AD8c95F79131d429287aE1e7")
  // const shortsTracker = await contractAt("ShortsTracker", "0xEE4e97f7Fb8c15e3B5F5755202e3b8f92dC6173a")

  // // ------------CORE MARKETS
  // const vault = await contractAt("Vault", "0x026a7149B3591b9811B5500041ba143a74c71344")
  // const shortsTracker = await contractAt("ShortsTracker", "0x83C1699a78C9071AFc2ad1d2c1C4b0013Dc073ad")

  // ------------USD MARKETS
  const vault = await contractAt("Vault", "0x4204d09EC45e305Ecf06dC872B928e345F664678")
  const shortsTracker = await contractAt("ShortsTracker", "0x000E4E3AdBB355E8ffb14f4dA5c5b021FAE2B0BC")



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
  await sendTxn(positionRouter.setGov(await vault.gov()), "positionRouter.setGov")

  console.log("vault gov: " + await vault.gov());
  const vaultTimelock = await contractAt("Timelock", await vault.gov())

  await sendTxn(vaultTimelock.setContractHandler(positionRouter.address, true), "positionRouter.setContractHandler")


  // deploy shortsTrackerTimelock
  const buffer = 0 // 0 seconds
  const updateDelay = 300 // 300 seconds, 5 minutes
  const maxAveragePriceChange = 20 // 0.2%
  const shortsTrackerTimelock = await deployContract("ShortsTrackerTimelock", [wallet.address, buffer, updateDelay, maxAveragePriceChange])

  await sendTxn(shortsTracker.setGov(shortsTrackerTimelock.address), "shortsTracker.setGov")
  await sendTxn(referralStorage.setGov(await vault.gov()), "referralStorage.setGov")

  const addresses = {
    referralStorageUsd: referralStorage.address,
    positionUtilsUsd: positionUtils.address,
    positionRouterUsd: positionRouter.address,
    shortsTrackerTimelockUsd: shortsTrackerTimelock.address,
  }

  writeTmpAddresses(addresses)


}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
