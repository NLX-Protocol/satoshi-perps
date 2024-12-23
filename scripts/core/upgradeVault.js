const { deployContract, contractAt, sendTxn, writeTmpAddresses, callWithRetries } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const { toUsd } = require("../../test/shared/units")
const { errors } = require("../../test/core/Vault/helpers")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')[network];

// this should only be used for development
// mainnet contracts should be controller by a timelock
async function main() {
  const { SolvBTC } = tokens
  const wallet = { address: "0xB08c0B39BAd8eD79dA4dB80D6a07cB56A204368b" }

  const vault = await contractAt("Vault", "0x8D1F4c528FD879A83aa41d4e1261c210Dd6e28d0")
  
  const timelockGov = await contractAt("Timelock", await vault.gov())
  
  const token = await contractAt("Token", SolvBTC.address)
  const balance = await token.balanceOf(vault.address)
  await sendTxn(timelockGov.signalUpgradeVault(vault.address, wallet.address, SolvBTC.address, balance.toString()), "timelockGov.signalUpgradeVault")
  await sendTxn(timelockGov.upgradeVault(vault.address, wallet.address, SolvBTC.address, balance.toString()), "timelockGov.upgradeVault")


}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
