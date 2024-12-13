const { ethers, upgrades, network } = require("hardhat");
const { writeTmpAddresses, sendTxn, verifyUpgradeable, deployContract, contractAt } = require("../shared/helpers");
const { expandDecimals } = require("../../test/shared/utilities");
const tokens = require('../core/tokens')[network.name];

const VAULT = "0xadFfd30C98181d5D647EaF0a969421f0f73d9028" //BTC
const VAULT_PRICE_FEED = "0xfD38B765A6dC05C42f8B369f421Ce6E9663ebF7D"
const PRICE_FEED_CONTRACT_ADDRESS = "0x8D254a21b3C86D32F7179855531CE99164721933"

async function main() {

  const {
    BTC, GOLD, OIL, CORE, ETH, SOL, BNB, DOGE, TRX, SUI, AVAX, XRP, SHIB, BONK, FLOKI, ENA, LINK, POPCAT, SolvBTC
  } = tokens
  const tokenArr = [BTC, GOLD, OIL, CORE, ETH, SOL, BNB, DOGE, TRX, SUI, AVAX, XRP, SHIB, BONK, FLOKI, ENA, LINK, POPCAT, SolvBTC]
  const pythMaxStalePeriod = 60 * 60 * 24

  const vaultPriceFeed = await contractAt("VaultPriceFeed", VAULT_PRICE_FEED)
  const vault = await contractAt("Vault", VAULT)


 

  const signers = await ethers.getSigners()
  const wallet = signers[0]
  const userAddress = wallet.address;
  console.log("userAddress: ", userAddress);
  console.log("Deploying AccessControlManager contract...");

  const accessControlManager = await deployContract("AccessControlManager", []);
  console.log("AccessControlManager deployed to:", accessControlManager.address);
  await verifyUpgradeable(accessControlManager.address)



  const BoundValidator = await ethers.getContractFactory("BoundValidator");

  const boundValidator = await upgrades.deployProxy(BoundValidator, [accessControlManager.address], {
    initializer: 'initialize',
  });
  await boundValidator.deployed();

  console.log("BoundValidator deployed to: " + boundValidator.address);
  await verifyUpgradeable(boundValidator.address)

  // Grant access to the specified user
  // boundValidator
  await sendTxn(accessControlManager.giveCallPermission(boundValidator.address, "setValidateConfig(ValidateConfig)", userAddress,), "accessControlManager.giveCallPermission(setValidateConfig(ValidateConfig))");



  console.log(`Access granted for setValidateConfigs to user: ${userAddress}`);

  const validateConfigs = []
  const pythTokenConfigs = []
  const resilientOracleConfigs = []

  // BTC
  for (const token of tokenArr) {
    validateConfigs.push({
      asset: token.address,
      upperBoundRatio: ethers.utils.parseUnits("1.05", 18), // Upper bound - reported price can be up to 5% higher
      lowerBoundRatio: ethers.utils.parseUnits("0.95", 18), // Lower bound - reported price can be up to 5% lower
    })
    pythTokenConfigs.push({
      pythId: token.priceFeed.pyth,
      asset: token.address,
      maxStalePeriod: pythMaxStalePeriod
    })
  }





  // deploy pyth oracle
  const PythOracle = await ethers.getContractFactory("PythOracle");

  const pythOracle = await upgrades.deployProxy(PythOracle, [PRICE_FEED_CONTRACT_ADDRESS, accessControlManager.address], {
    initializer: 'initialize',
  });
  await pythOracle.deployed();

  console.log("pythOracle deployed to: " + pythOracle.address);
  await verifyUpgradeable(pythOracle.address)

  // pythOracle
  await sendTxn(accessControlManager.giveCallPermission(pythOracle.address, "setTokenConfig(TokenConfig)", userAddress,), "accessControlManager.giveCallPermission(setTokenConfig(TokenConfig))");
  await sendTxn(accessControlManager.giveCallPermission(pythOracle.address, "setDirectPrice(address,uint256)", userAddress,), "accessControlManager.giveCallPermission(setDirectPrice(address,uint256))");
  await sendTxn(accessControlManager.giveCallPermission(pythOracle.address, "setUnderlyingPythOracle(address)", userAddress,), "accessControlManager.giveCallPermission(setUnderlyingPythOracle(address))");


  // deploy ResilientOracle 
  const ResilientOracle = await ethers.getContractFactory("ResilientOracle");

  const resilientOracle = await upgrades.deployProxy(ResilientOracle, [accessControlManager.address], {
    initializer: 'initialize',
    constructorArgs: [ethers.constants.AddressZero, ethers.constants.AddressZero, boundValidator.address]
  });
  await resilientOracle.deployed();

  console.log("resilientOracle deployed to: " + resilientOracle.address);
  await verifyUpgradeable(resilientOracle.address, [ethers.constants.AddressZero, ethers.constants.AddressZero, boundValidator.address])

  // resilientOracle
  await sendTxn(accessControlManager.giveCallPermission(resilientOracle.address, "pause()", userAddress,), "accessControlManager.giveCallPermission(pause())");
  await sendTxn(accessControlManager.giveCallPermission(resilientOracle.address, "unpause()", userAddress,), "accessControlManager.giveCallPermission(unpause())");
  await sendTxn(accessControlManager.giveCallPermission(resilientOracle.address, "setOracle(address,address,uint8)", userAddress,), "accessControlManager.giveCallPermission(setOracle(address,address,uint8))");
  await sendTxn(accessControlManager.giveCallPermission(resilientOracle.address, "enableOracle(address,uint8,bool)", userAddress,), "accessControlManager.giveCallPermission(enableOracle(address,uint8,bool))");
  await sendTxn(accessControlManager.giveCallPermission(resilientOracle.address, "setTokenConfig(TokenConfig)", userAddress,), "accessControlManager.giveCallPermission(setTokenConfig(TokenConfig))");

  for (const token of tokenArr) {
    resilientOracleConfigs.push({
      asset: token.address,
      oracles: [pythOracle.address, ethers.constants.AddressZero, ethers.constants.AddressZero,],
      enableFlagsForOracles: [true, false, false]
    })
  }
  //  setConfigs
  await sendTxn(boundValidator.setValidateConfigs(validateConfigs), "boundValidator.setValidateConfig")
  await sendTxn(pythOracle.setTokenConfigs(pythTokenConfigs), "pythOracle.setTokenConfigs")
  await sendTxn(resilientOracle.setTokenConfigs(resilientOracleConfigs), "resilientOracle.setTokenConfigs")



  await sendTxn(vaultPriceFeed.setMaxStrictPriceDeviation(expandDecimals(5, 28)), "vaultPriceFeed.setMaxStrictPriceDeviation") // 0.01 USD
  await sendTxn(vaultPriceFeed.setIsAmmEnabled(false), "vaultPriceFeed.setIsAmmEnabled")
  await sendTxn(vaultPriceFeed.setResilientOracle(resilientOracle.address), "vaultPriceFeed.setResilientOracle")


  // set price feed 
  await sendTxn(vault.setPriceFeed(vaultPriceFeed.address), "vault.setPriceFeed")





  writeTmpAddresses({
    boundValidator: boundValidator.address,
    pythOracle: pythOracle.address,
    resilientOracle: resilientOracle.address,
    accessControlManager: accessControlManager.address,
  })



}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
