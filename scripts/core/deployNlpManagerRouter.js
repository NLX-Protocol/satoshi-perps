const { contractAt, deployContract, sendTxn, writeTmpAddresses } = require("../shared/helpers")

async function main() {
    // // ---------- BTC ----------
    // const NLP_MANAGER_ADDRESS = "0xbCb9573a247921a4F3fa3BcF210354E4561f967C"

    // // ---------- USD ----------
    // const NLP_MANAGER_ADDRESS = "0x16aCa8b0547566eA9b2aa7a232871D5D5C8160a6"

    // ---------- CORE ----------
    const NLP_MANAGER_ADDRESS = "0xa0aD95c8145e5eE58aB4Bb5484Fa041703Fb62C0"
    
    const WCORE = "0x0B4501d4e506956c648908F306717608f7625831"

    // deploy
    const nlpManager = await contractAt("NlpManager", NLP_MANAGER_ADDRESS)
    const nlpManagerRouter = await deployContract("NlpManagerRouter", [
        WCORE,// _weth,
        await nlpManager.nlp(),
        nlpManager.address// _nlpManager
    ])

    //   make handler
    await sendTxn(nlpManager.setHandler(nlpManagerRouter.address, true), "nlpManager.setHandler(nlpManagerRouter)")


    writeTmpAddresses({
        nlpManagerRouterCore: nlpManagerRouter.address,
    })
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })
