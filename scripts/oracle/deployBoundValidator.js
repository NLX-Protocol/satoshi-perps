const { ethers, upgrades, network } = require("hardhat");
const { writeTmpAddresses, sendTxn, verifyUpgradeable, deployContract, contractAt } = require("../shared/helpers");
const { expandDecimals } = require("../../test/shared/utilities");
const tokens = require('../core/tokens')[network.name];

// const VAULT = "0xB3992C9eaE205CC5AD8c95F79131d429287aE1e7" //BTC
// const VAULT = "0x026a7149B3591b9811B5500041ba143a74c71344" //CORE
const VAULT = "0x4204d09EC45e305Ecf06dC872B928e345F664678" //USD

const VAULT_PRICE_FEED = "0x73e38F6B2d2a1A13319110F71cF7EDc75222C6cE"
async function main() {

  // const {
  //   core,
  //   usdc, usdt, usde,
  //   aBTC, solvBTC, coreBTC,
  // } = tokens
  // const usdTokens = [usdc, usdt, usde,]
  // const btcTokens = [aBTC, coreBTC, solvBTC]
  // const pythMaxStalePeriod = 60 * 60 * 24
  // const aproMaxStalePeriod = 60 * 60 * 24

  // const signers = await ethers.getSigners()
  // const wallet = signers[0]
  // const userAddress = wallet.address;
  // console.log("userAddress: ", userAddress);
  // console.log("Deploying AccessControlManager contract...");

  // const accessControlManager = await deployContract("AccessControlManager", []);
  // console.log("AccessControlManager deployed to:", accessControlManager.address);
  // await verifyUpgradeable(accessControlManager.address)



  // const BoundValidator = await ethers.getContractFactory("BoundValidator");

  // const boundValidator = await upgrades.deployProxy(BoundValidator, [accessControlManager.address], {
  //   initializer: 'initialize',
  // });
  // await boundValidator.deployed();

  // console.log("BoundValidator deployed to: " + boundValidator.address);
  // await verifyUpgradeable(boundValidator.address)

  // // Grant access to the specified user
  // // boundValidator
  // await sendTxn(accessControlManager.giveCallPermission(boundValidator.address, "setValidateConfig(ValidateConfig)", userAddress,), "accessControlManager.giveCallPermission(setValidateConfig(ValidateConfig))");



  // console.log(`Access granted for setValidateConfigs to user: ${userAddress}`);


  // const validateConfigs = []
  // const pythTokenConfigs = []
  // const aproTokenConfigs = []
  // const resilientOracleConfigs = []

  // // NATIVE
  // validateConfigs.push({
  //   asset: core.address,
  //   upperBoundRatio: ethers.utils.parseUnits("1.10", 18), // Upper bound - reported price can be up to 10% higher
  //   lowerBoundRatio: ethers.utils.parseUnits("0.90", 18), // Lower bound - reported price can be up to 10% lower
  // })
  // pythTokenConfigs.push({
  //   pythId: core.priceFeed.pyth,
  //   asset: core.address,
  //   maxStalePeriod: pythMaxStalePeriod
  // })
  // aproTokenConfigs.push({
  //   feed: core.priceFeed.apro,
  //   asset: core.address,
  //   maxStalePeriod: aproMaxStalePeriod
  // })

  // // STABLES
  // for (const token of usdTokens) {
  //   validateConfigs.push({
  //     asset: token.address,
  //     upperBoundRatio: ethers.utils.parseUnits("1.02", 18), // Upper bound - reported price can be up to 2% higher
  //     lowerBoundRatio: ethers.utils.parseUnits("0.98", 18), // Lower bound - reported price can be up to 2% lower
  //   })
  //   pythTokenConfigs.push({
  //     pythId: token.priceFeed.pyth,
  //     asset: token.address,
  //     maxStalePeriod: pythMaxStalePeriod
  //   })
  //   aproTokenConfigs.push({
  //     feed: token.priceFeed.apro,
  //     asset: token.address,
  //     maxStalePeriod:aproMaxStalePeriod
  //   })
  // }

  // // BTC
  // for (const token of btcTokens) {
  //   validateConfigs.push({
  //     asset: token.address,
  //     upperBoundRatio: ethers.utils.parseUnits("1.05", 18), // Upper bound - reported price can be up to 5% higher
  //     lowerBoundRatio: ethers.utils.parseUnits("0.95", 18), // Lower bound - reported price can be up to 5% lower
  //   })
  //   pythTokenConfigs.push({
  //     pythId: token.priceFeed.pyth,
  //     asset: token.address,
  //     maxStalePeriod:pythMaxStalePeriod
  //   })
  //   aproTokenConfigs.push({
  //     feed: token.priceFeed.apro,
  //     asset: token.address,
  //     maxStalePeriod:aproMaxStalePeriod
  //   })
  // }




  // // deploy pyth oracle
  // const PythOracle = await ethers.getContractFactory("PythOracle");

  // const pythOracle = await upgrades.deployProxy(PythOracle, ["0x8D254a21b3C86D32F7179855531CE99164721933", accessControlManager.address], {
  //   initializer: 'initialize',
  // });
  // await pythOracle.deployed();

  // console.log("pythOracle deployed to: " + pythOracle.address);
  // await verifyUpgradeable(pythOracle.address)
  // // pythOracle
  // await sendTxn(accessControlManager.giveCallPermission(pythOracle.address, "setTokenConfig(TokenConfig)", userAddress,), "accessControlManager.giveCallPermission(setTokenConfig(TokenConfig))");
  // await sendTxn(accessControlManager.giveCallPermission(pythOracle.address, "setDirectPrice(address,uint256)", userAddress,), "accessControlManager.giveCallPermission(setDirectPrice(address,uint256))");
  // await sendTxn(accessControlManager.giveCallPermission(pythOracle.address, "setUnderlyingPythOracle(address)", userAddress,), "accessControlManager.giveCallPermission(setUnderlyingPythOracle(address))");

  // // deploy APRO oracle
  // const AproOracle = await ethers.getContractFactory("AproOracle");

  // const aproOracle = await upgrades.deployProxy(AproOracle, [accessControlManager.address], {
  //   initializer: 'initialize',
  // });
  // await aproOracle.deployed();

  // console.log("AproOracle deployed to: " + aproOracle.address);
  // await verifyUpgradeable(aproOracle.address)


  // // aproOracle
  // await sendTxn(accessControlManager.giveCallPermission(aproOracle.address, "setTokenConfig(TokenConfig)", userAddress,), "accessControlManager.giveCallPermission(setTokenConfig(TokenConfig))");
  // await sendTxn(accessControlManager.giveCallPermission(aproOracle.address, "setDirectPrice(address,uint256)", userAddress,), "accessControlManager.giveCallPermission(setDirectPrice(address,uint256))");



  // // deploy ResilientOracle 
  // const ResilientOracle = await ethers.getContractFactory("ResilientOracle");

  // const resilientOracle = await upgrades.deployProxy(ResilientOracle, [accessControlManager.address], {
  //   initializer: 'initialize',
  //   constructorArgs: [ethers.constants.AddressZero, ethers.constants.AddressZero, boundValidator.address]
  // });
  // await resilientOracle.deployed();

  // console.log("resilientOracle deployed to: " + resilientOracle.address);
  // await verifyUpgradeable(resilientOracle.address, [ethers.constants.AddressZero, ethers.constants.AddressZero, boundValidator.address])

  // // resilientOracle
  // await sendTxn(accessControlManager.giveCallPermission(resilientOracle.address, "pause()", userAddress,), "accessControlManager.giveCallPermission(pause())");
  // await sendTxn(accessControlManager.giveCallPermission(resilientOracle.address, "unpause()", userAddress,), "accessControlManager.giveCallPermission(unpause())");
  // await sendTxn(accessControlManager.giveCallPermission(resilientOracle.address, "setOracle(address,address,uint8)", userAddress,), "accessControlManager.giveCallPermission(setOracle(address,address,uint8))");
  // await sendTxn(accessControlManager.giveCallPermission(resilientOracle.address, "enableOracle(address,uint8,bool)", userAddress,), "accessControlManager.giveCallPermission(enableOracle(address,uint8,bool))");
  // await sendTxn(accessControlManager.giveCallPermission(resilientOracle.address, "setTokenConfig(TokenConfig)", userAddress,), "accessControlManager.giveCallPermission(setTokenConfig(TokenConfig))");

  // for (const token of [core, ...usdTokens, ...btcTokens]) {
  //   resilientOracleConfigs.push({
  //     asset: token.address,
  //     oracles: [pythOracle.address, aproOracle.address, pythOracle.address],
  //     enableFlagsForOracles: [true, true, true]
  //   })
  // }
  // //  setConfigs
  // await sendTxn(boundValidator.setValidateConfigs(validateConfigs), "boundValidator.setValidateConfig")
  // await sendTxn(aproOracle.setTokenConfigs(aproTokenConfigs), "aproOracle.setTokenConfigs")
  // await sendTxn(pythOracle.setTokenConfigs(pythTokenConfigs), "pythOracle.setTokenConfigs")
  // await sendTxn(resilientOracle.setTokenConfigs(resilientOracleConfigs), "resilientOracle.setTokenConfigs")

  // const vaultPriceFeed = await deployContract("VaultPriceFeed", [])
  // await verifyUpgradeable(vaultPriceFeed.address)

  // await sendTxn(vaultPriceFeed.setMaxStrictPriceDeviation(expandDecimals(1, 28)), "vaultPriceFeed.setMaxStrictPriceDeviation") // 0.05 USD
  // await sendTxn(vaultPriceFeed.setIsAmmEnabled(false), "vaultPriceFeed.setIsAmmEnabled")
  // await sendTxn(vaultPriceFeed.setResilientOracle(resilientOracle.address), "vaultPriceFeed.setResilientOracle")


  // const vault = await contractAt("Vault", VAULT)
  // const vaultTimelock = await contractAt("Timelock", await vault.gov())

  // //set new priceFeed
  // await sendTxn(vaultTimelock.signalSetPriceFeed(VAULT, vaultPriceFeed.address), "vaultTimelock.signalSetPriceFeed")
  // await sendTxn(vaultTimelock.setPriceFeed(VAULT, vaultPriceFeed.address), "vaultTimelock.setPriceFeed")

  // writeTmpAddresses({
  //   boundValidator: boundValidator.address,
  //   pythOracle: pythOracle.address,
  //   aproOracle: aproOracle.address,
  //   resilientOracle: resilientOracle.address,
  //   vaultPriceFeed: vaultPriceFeed.address,
  //   accessControlManager: accessControlManager.address,
  // })

  const vaultPriceFeed = await contractAt("VaultPriceFeed", VAULT_PRICE_FEED)

  const vault = await contractAt("Vault", VAULT)
  const vaultTimelock = await contractAt("Timelock", await vault.gov())

  //set new priceFeed
  await sendTxn(vaultTimelock.signalSetPriceFeed(VAULT, vaultPriceFeed.address), "vaultTimelock.signalSetPriceFeed")
  await sendTxn(vaultTimelock.setPriceFeed(VAULT, vaultPriceFeed.address), "vaultTimelock.setPriceFeed")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
