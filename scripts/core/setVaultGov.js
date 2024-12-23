const { contractAt, sendTxn } = require("../shared/helpers")


async function main() {

  const vault = await contractAt("Vault", "0x736Cad071Fdb5ce7B17F35bB22f68Ad53F55C207")
  const positionRouter = await contractAt("PositionRouter", "0x6EdF4C4b15A53682E0461517C7c4C45405e4e9b3",undefined,{
    libraries: {
      PositionUtils:"0x859d66aD5C0dE79c1375326B9df6fC56A7145332",
    }
  })
  const referralStorage = await contractAt("ReferralStorage", "0x952c5Cb3355695Ed1DEDD72aD074c960C2D8ce03")
  const alreadyDeployedVaultTimelock = await contractAt("Timelock", "0x1c50FE94FAEB9443bc40eB02aFf4Df9f83C84F92")

  const governedProxyAdmin = await contractAt("GovernedProxyAdmin", "0x967D8782D7B6342bd7D7b677f9Ee3Ad68cFB4d00")
  const resilientOracle = await contractAt("ResilientOracle", "0x629aD6e4Fad7ecfd3Db76C8BeC0B8efab1D94765")
  const boundValidator = await contractAt("BoundValidator", "0x14e00f58f34007e5405106398999517db0D1D583")
  const pythOracle = await contractAt("PythOracle", "0x8219388A5fF06122Af687FC7dfda3C62a24574D5")
  
  await sendTxn(governedProxyAdmin.setGov(alreadyDeployedVaultTimelock.address), "governedProxyAdmin.setGov")
  await sendTxn(resilientOracle.setGov(alreadyDeployedVaultTimelock.address), "resilientOracle.setGov")
  await sendTxn(boundValidator.setGov(alreadyDeployedVaultTimelock.address), "boundValidator.setGov")
  await sendTxn(pythOracle.setGov(alreadyDeployedVaultTimelock.address), "pythOracle.setGov")

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

  // npx hardhat run scripts/core/setVaultGov.js --network core-testnet 