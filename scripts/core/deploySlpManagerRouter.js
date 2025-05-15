const {contractAt, deployContract, sendTxn, writeTmpAddresses, readTmpAddresses} = require("../shared/helpers")
const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')[network];

async function main() {
  const addresses = readTmpAddresses()

  // deploy
  const slpManager = await contractAt("SlpManager", addresses.slpManagerBTC)
  const slpManagerRouter = await deployContract("SlpManagerRouter", [
    addresses.WCORE,// _weth,
    await slpManager.slp(),
    slpManager.address// _slpManager
  ])

  //   make handler
  await sendTxn(slpManager.setHandler(slpManagerRouter.address, true), "slpManager.setHandler(slpManagerRouter)")

  writeTmpAddresses({
    slpManagerRouterBTC: slpManagerRouter.address,
  })
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })

// npx hardhat run scripts/core/deploySlpManagerRouter.js --network core-testnet
