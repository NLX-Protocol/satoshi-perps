const { getFrameSigner, deployContract, contractAt, sendTxn, readTmpAddresses, writeTmpAddresses } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const { toUsd } = require("../../test/shared/units")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')[network];



// const VAULT = "0x683fb89cf3C1009f43517A61138703C4f2e8DF95" //BTC - testnet
const VAULT = "0x736Cad071Fdb5ce7B17F35bB22f68Ad53F55C207" // btc -- mainnet

async function main() {
  
    const vault = await contractAt("Vault", VAULT)
    const timelock = await contractAt("Timelock", await vault.gov())


    await sendTxn(timelock.setShouldToggleIsLeverageEnabled(true), `timelock.setShouldToggleIsLeverageEnabled`)
    await sendTxn(timelock.enableLeverage(vault.address,), `timelock.enableLeverage`)


}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })
//  npx hardhat run scripts/core/configPriceFeed.js --network core-testnet