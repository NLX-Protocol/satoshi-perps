const { contractAt, sendTxn } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")


async function main() {

  const vault = await contractAt("Vault", "0xadFfd30C98181d5D647EaF0a969421f0f73d9028")
  const positionRouter = await contractAt("PositionRouter", "0xBB6979Df90C29C1f6976Ab2Ab8eC9d5c74a45367",undefined,{
    libraries: {
      PositionUtils:"0xBfb1BD3132EF4d2854704451EA310a204551c1F5",
    }
  })
  const referralStorage = await contractAt("ReferralStorage", "0x03C101158D4f57b8bf39d7a371c0aE6A71F80454")
  const vaultTimelock = await contractAt("Timelock", "0xd6338fAF30b38685ceCfB673AA7e6c3bfC0A0665")
  
  await sendTxn(vaultTimelock.setContractHandler(positionRouter.address, true), "positionRouter.setContractHandler")
  
  await sendTxn(positionRouter.setGov(vaultTimelock.address), "positionRouter.setGov")

  await sendTxn(referralStorage.setGov(vaultTimelock.address), "referralStorage.setGov")
  await sendTxn(vault.setGov(vaultTimelock.address), "vault.setGov")
}


main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
