const { contractAt, deployContract, sendTxn, writeTmpAddresses } = require("../shared/helpers")

async function main() {
    // // ---------- BTC ----------
    // const SLP_MANAGER_ADDRESS = "0xbCb9573a247921a4F3fa3BcF210354E4561f967C"

    // // ---------- USD ----------
    // const SLP_MANAGER_ADDRESS = "0x16aCa8b0547566eA9b2aa7a232871D5D5C8160a6"

    // ---------- CORE ----------
    const SLP_MANAGER_ADDRESS = "0xCCC4280Ba073cab90c671D6cb1d1b89910EEE6AE"
    
    const WCORE = "0x8154036681373780a862cB1bD05098D452871305"

    // deploy
    const slpManager = await contractAt("SlpManager", SLP_MANAGER_ADDRESS)
    const slpManagerRouter = await deployContract("SlpManagerRouter", [
        WCORE,// _weth,
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
