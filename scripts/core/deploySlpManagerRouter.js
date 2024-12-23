const { contractAt, deployContract, sendTxn, writeTmpAddresses } = require("../shared/helpers")
const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')[network];

async function main() {
  const { nativeToken } = tokens

    // // ---------- BTC ----------
    // const SLP_MANAGER_ADDRESS = "0xbCb9573a247921a4F3fa3BcF210354E4561f967C"

    // // ---------- USD ----------
    // const SLP_MANAGER_ADDRESS = "0x16aCa8b0547566eA9b2aa7a232871D5D5C8160a6"

    // ---------- CORE ----------
    const SLP_MANAGER_ADDRESS = "0x7C393006729b18FD63346138f9E730CF812529a4"
    


    // deploy
    const slpManager = await contractAt("SlpManager", SLP_MANAGER_ADDRESS)
    const slpManagerRouter = await deployContract("SlpManagerRouter", [
        nativeToken.address,// _weth,
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