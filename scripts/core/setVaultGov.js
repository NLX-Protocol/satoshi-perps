const { contractAt, sendTxn } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")


async function main() {

  const vault = await contractAt("Vault", "0x8D1F4c528FD879A83aa41d4e1261c210Dd6e28d0")
  const positionRouter = await contractAt("PositionRouter", "0xB2F7dC79768Ba86587Aa283C7F7dB1072a9ade40",undefined,{
    libraries: {
      PositionUtils:"0x914b5D85E586B0e4B6dDDfC2D902ED75EbE33950",
    }
  })
  const referralStorage = await contractAt("ReferralStorage", "0x2997249971523381AD58512905b863DCE6929787")
  const alreadyDeployedVaultTimelock = await contractAt("Timelock", "0x255955ec37A50857A6C874f3372c2ed98E2ff752")
  
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
