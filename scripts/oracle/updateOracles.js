const { ethers, upgrades, network } = require("hardhat");
const { writeTmpAddresses, sendTxn, verifyUpgradeable, deployContract, contractAt } = require("../shared/helpers");
const { expandDecimals } = require("../../test/shared/utilities");
const tokens = require('../core/tokens')[network.name];

const PRICE_FEED_CONTRACT_ADDRESS = "0x8D254a21b3C86D32F7179855531CE99164721933"
const RESILIENT_ORACLE = "0x7AFf3cfBA92BA74DA4DdC4Fc25D3Fd4987147462"
const BOUND_VALIDATOR = "0x3234989E15B309c30a57A86113521AF2d4Aa2712"
const ACCESS_CONTROL_MANAGER = "0x3Fd2076Db5bf8EbD3289d380aa53141444754fb2"
async function main() {

  const {
    BTC, GOLD, OIL, CORE, ETH, SOL, BNB, DOGE, TRX, SUI, AVAX, XRP, SHIB, BONK, FLOKI, ENA, LINK, POPCAT, SolvBTC, nativeToken
  } = tokens
  const tokenArr = [BTC, GOLD, OIL, CORE, ETH, SOL, BNB, DOGE, TRX, SUI, AVAX, XRP, SHIB, BONK, FLOKI, ENA, LINK, POPCAT, SolvBTC, nativeToken]
  const pythMaxStalePeriod = 60 * 60 * 24

  const resilientOracle = await contractAt("ResilientOracle", RESILIENT_ORACLE)
  const boundValidator = await contractAt("BoundValidator", BOUND_VALIDATOR)
  const accessControlManager = await contractAt("AccessControlManager", ACCESS_CONTROL_MANAGER)

  const signers = await ethers.getSigners()
  const wallet = signers[0]
  const userAddress = wallet.address;
  console.log("userAddress: ", userAddress);




  const validateConfigs = []
  const pythTokenConfigs = []
  const resilientOracleConfigs = []

  // BTC
  for (const token of tokenArr) {
    validateConfigs.push({
      asset: token.address,
      upperBoundRatio: ethers.utils.parseUnits("1.10", 18), // Upper bound - reported price can be up to 10% higher
      lowerBoundRatio: ethers.utils.parseUnits("0.90", 18), // Lower bound - reported price can be up to 10% lower
    })
    pythTokenConfigs.push({
      pythId: token.priceFeed.pyth,
      asset: token.address,
      maxStalePeriod: pythMaxStalePeriod
    })
  }





  // deploy new pyth oracle
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






  writeTmpAddresses({
    pythOracle: pythOracle.address,
  })



}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
