const { contractAt , sendTxn, callWithRetries, readTmpAddresses} = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")

async function main() {
  const addresses = readTmpAddresses()
  const wallet = (await ethers.getSigners())[0]

  const router = await callWithRetries(contractAt, ["Router", addresses.routerBTC])
  const vault = await contractAt("Vault", addresses.vaultBTC);
  const timelock  = await contractAt("Timelock", await vault.gov())

  console.log('timelock ', timelock.address);

  await sendTxn(callWithRetries(router.addPlugin.bind(router), [
    addresses.orderBookBTC
  ]), "router.addPlugin")

  await sendTxn(timelock.setContractHandler(addresses.orderBookBTC, addresses.vaultBTC), "timelock.setContractHandler")


  const positionRouter = await contractAt("PositionRouter", addresses.positionRouterBTC,undefined,{
    libraries: {
      PositionUtils:addresses.positionUtilsBTC,
    }
  })

  const isPluginApproved = await router.approvedPlugins(wallet.address, positionRouter.address)
  console.log("PositionRouter plugin is approved? ...", isPluginApproved)
  if (!isPluginApproved) {
    console.log("Approving plugin...")
    const approvePluginTx = await router.approvePlugin(positionRouter.address)
    await approvePluginTx.wait()
    console.log("PositionRouter Plugin approved!")
  }

  const isPositionRouterPlugin = await router.plugins(positionRouter.address);
  console.log("isPositionRouterPlugin is plugin:", isPositionRouterPlugin);

  const routerGov = await router.gov();
  console.log("Router gov:", routerGov);
  if (!isPositionRouterPlugin) {
    if (routerGov === timelock.address) {
      console.log("handle routerGov");
    } else if (routerGov === wallet.address) {
      await sendTxn(router.addPlugin(positionRouter.address), "router.addPlugin(positionRouter)");
    }
  }


  const positionContractOptions = {
    libraries: {
      PositionUtils: addresses.positionUtilsBTC
    }
  }
  const positionManager = await contractAt("PositionManager", addresses.positionManagerBTC, undefined, positionContractOptions);
  const isPositionManagerPlugin = await router.plugins(positionManager.address);
  console.log("positionManager is plugin:", isPositionManagerPlugin);
  if (!isPositionManagerPlugin) {
    if (routerGov === timelock.address) {
      console.log("handle routerGov");
    } else if (routerGov === wallet.address) {
      await sendTxn(router.addPlugin(positionManager.address), "router.addPlugin(positionManager)");
    }
  }


  const orderBook = await contractAt("OrderBook", addresses.orderBookBTC);
  const isOrderBookPlugin = await router.plugins(orderBook.address);
  console.log("OrderBook is plugin:", isOrderBookPlugin);
  if (!isOrderBookPlugin) {
    if (routerGov === timelock.address) {
      console.log("handle routerGov");
    } else if (routerGov === wallet.address) {
      await sendTxn(router.addPlugin(orderBook.address), "router.addPlugin(orderBook)");
    }
  }

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
//  npx hardhat run scripts/core/addPluginOrderBook.js --network core-testnet
