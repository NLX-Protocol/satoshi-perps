const { contractAt, sendTxn } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")


async function main() {

  const vault = await contractAt("Vault", "0x20192f037BfC79f667Ca0e444D87E8a7cC7f6345")
  const positionRouter = await contractAt("PositionRouter", "0x4cF447dFa02a4B0B4DAB99e2D48c841C96F265f8",undefined,{
    libraries: {
      PositionUtils:"0xe128bD2BCeE14260f4262ff9276f8ba0b27415c8",
    }
  })
  const referralStorage = await contractAt("ReferralStorage", "0x0db0429B421295590E1328Ba877cb22ba59637e5")
  const alreadyDeployedVaultTimelock = await contractAt("Timelock", "0xB656F8789B70c0E16706338C20A086d498996bf1")
  
  await sendTxn(alreadyDeployedVaultTimelock.setContractHandler(positionRouter.address, true), "positionRouter.setContractHandler")
  
  await sendTxn(positionRouter.setGov(alreadyDeployedVaultTimelock.address), "positionRouter.setGov")

  await sendTxn(referralStorage.setGov(alreadyDeployedVaultTimelock.address), "referralStorage.setGov")
  await sendTxn(vault.setGov(alreadyDeployedVaultTimelock.address), "vault.setGov")

  // set gov for slp
}


main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
