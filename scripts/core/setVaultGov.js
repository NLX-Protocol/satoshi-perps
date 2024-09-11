const { deployContract, contractAt, sendTxn } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const { toUsd } = require("../../test/shared/units")
const { errors } = require("../../test/core/Vault/helpers")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')[network];

async function main() {
	const wallet = (await ethers.getSigners())[0]

  const vault = await contractAt("Vault", "0x02b11043120Acaa940bc48fd9809B40CACF10F77")

    const vaultTimelock = await deployContract("Timelock", [
        wallet.address, // admin
        0, // buffer
        wallet.address, // tokenManager
        wallet.address, // mintReceiver
        wallet.address, // nlpManager
        wallet.address, // prevNlpManager
        wallet.address, // rewardRouter
        expandDecimals(1000, 18), // maxTokenSupply
        50, // marginFeeBasisPoints 0.5%
        500, // maxMarginFeeBasisPoints 5%
      ])
      await vault.setGov(vaultTimelock.address)
}


main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
