const { contractAt, sendTxn, readTmpAddresses} = require("../shared/helpers")

//const MULTISIG = "0x9f50221ea9Cb120807121c930a2B8583Fc567e66"

async function main() {
  const addresses = readTmpAddresses()
  const vault = await contractAt("Vault", addresses.vaultBTC)
  const positionRouter = await contractAt("PositionRouter", addresses.positionRouterBTC,undefined,{
    libraries: {
      PositionUtils:addresses.positionUtilsBTC,
    }
  })
  const referralStorage = await contractAt("ReferralStorage", addresses.referralStorageBTC)
  const alreadyDeployedVaultTimelock = await contractAt("Timelock", addresses.vaultTimelockBTC)

  const governedProxyAdmin = await contractAt("GovernedProxyAdmin", addresses.vaultBTCProxyAdmin)

  const orderBook = await contractAt("OrderBook", addresses.orderBookBTC)
  const slpManager = await contractAt("SlpManager", addresses.slpManagerBTC)

  // const resilientOracle = await contractAt("ResilientOracle", "0x3e9b6c48A388e5d580e6D65bB2896D60b606CDaD")
  // const boundValidator = await contractAt("BoundValidator", "0x47794688e555F03F64cd0b4A65fFcec7C7387cA2")
  // const pythOracle = await contractAt("PythOracle", "0xAd1d1355be077B06D82fEA75eF3b9941EdE96958")

  //await sendTxn(governedProxyAdmin.setGov(alreadyDeployedVaultTimelock.address), "governedProxyAdmin.setGov")

  await sendTxn(alreadyDeployedVaultTimelock.setContractHandler(positionRouter.address, true), "positionRouter.setContractHandler")

  await sendTxn(positionRouter.setGov(alreadyDeployedVaultTimelock.address), "positionRouter.setGov")

  await sendTxn(referralStorage.setGov(alreadyDeployedVaultTimelock.address), "referralStorage.setGov")
  await sendTxn(vault.setGov(alreadyDeployedVaultTimelock.address), "vault.setGov")

  await sendTxn(orderBook.setGov(alreadyDeployedVaultTimelock.address), "orderBook.setGov") // check
  await sendTxn(slpManager.setGov(alreadyDeployedVaultTimelock.address), "slpManager.setGov") // check

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
