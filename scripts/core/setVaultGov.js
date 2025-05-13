const { contractAt, sendTxn } = require("../shared/helpers")

//const MULTISIG = "0x9f50221ea9Cb120807121c930a2B8583Fc567e66"

async function main() {

  const vault = await contractAt("Vault", "0x7266488Fb3529a06B62092492B44824c21c47820")
  const positionRouter = await contractAt("PositionRouter", "0xA2aEa186372BAaC0597bf78dB89C8A14b9b1B9E4",undefined,{
    libraries: {
      PositionUtils:"0xc4702BF1876ac8d9148D5a700D80e96e1ab7100c",
    }
  })
  const referralStorage = await contractAt("ReferralStorage", "0xdF928f566eadF71C254A5ff6395566e27b657f1D")
  const alreadyDeployedVaultTimelock = await contractAt("Timelock", "0x1D8C714C76D7E725CcB85f6B36eA2B94d62940F1")

  const governedProxyAdmin = await contractAt("GovernedProxyAdmin", "0xC761C34a5dA689a9e39aa9A2369e60434C099d7d")

  // const resilientOracle = await contractAt("ResilientOracle", "0x3e9b6c48A388e5d580e6D65bB2896D60b606CDaD")
  // const boundValidator = await contractAt("BoundValidator", "0x47794688e555F03F64cd0b4A65fFcec7C7387cA2")
  // const pythOracle = await contractAt("PythOracle", "0xAd1d1355be077B06D82fEA75eF3b9941EdE96958")

  //await sendTxn(governedProxyAdmin.setGov(alreadyDeployedVaultTimelock.address), "governedProxyAdmin.setGov")

  await sendTxn(alreadyDeployedVaultTimelock.setContractHandler(positionRouter.address, true), "positionRouter.setContractHandler")

  await sendTxn(positionRouter.setGov(alreadyDeployedVaultTimelock.address), "positionRouter.setGov")

  await sendTxn(referralStorage.setGov(alreadyDeployedVaultTimelock.address), "referralStorage.setGov")
  await sendTxn(vault.setGov(alreadyDeployedVaultTimelock.address), "vault.setGov")

  // await sendTxn(resilientOracle.setGov(MULTISIG), "resilientOracle.setGov")
  // await sendTxn(boundValidator.setGov(MULTISIG), "boundValidator.setGov")
  // await sendTxn(pythOracle.setGov(MULTISIG), "pythOracle.setGov")

}


main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })

  // npx hardhat run scripts/core/setVaultGov.js --network core-testnet
