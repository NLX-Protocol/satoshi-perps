const { ethers, upgrades, network } = require("hardhat");
const { writeTmpAddresses, sendTxn, verifyUpgradeable, readTmpAddresses, deployContract, contractAt } = require("../shared/helpers");
const { expandDecimals } = require("../../test/shared/utilities");
const tokens = require('../core/tokens')[network.name];

//pyth contract address
//const PRICE_FEED_CONTRACT_ADDRESS = "0x8D254a21b3C86D32F7179855531CE99164721933" //testnet
const PRICE_FEED_CONTRACT_ADDRESS = "0x2880aB155794e7179c9eE2e38200202908C17B43" //testnet2
//const PRICE_FEED_CONTRACT_ADDRESS = "0xA2aa501b19aff244D90cc15a4Cf739D2725B5729" //mainnet

async function main() {
  const addresses = readTmpAddresses()

  const {
    BTC, CORE, ETH, SOL, BNB, DOGE, TRX, SUI, AVAX, XRP, SHIB, BONK, FLOKI, ENA, LINK, POPCAT, TRUMP, BERA, VIRTUAL, APT, SOLV, KAITO, SolvBTC, WCORE, USDT
  } = tokens
  const tokenArr = [BTC, CORE, ETH, SOL, BNB, DOGE, TRX, SUI, AVAX, XRP, SHIB, BONK, FLOKI, ENA, LINK, POPCAT, TRUMP, BERA, VIRTUAL, APT, SOLV, KAITO, SolvBTC, WCORE, USDT]

  const pythMaxStalePeriod = 60 * 60 // 1 hour

  const vaultPriceFeed = await contractAt("VaultPriceFeed", addresses.vaultPriceFeedBTC)
  const vault = await contractAt("Vault", addresses.vaultBTC)

  const signers = await ethers.getSigners()
  const wallet = signers[0]
  const userAddress = wallet.address;
  console.log("userAddress: ", userAddress);


  const boundValidator = await deployContract("BoundValidator", []);
  console.log("BoundValidator deployed to: " + boundValidator.address);

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
  const pythOracle = await deployContract("PythOracle", [PRICE_FEED_CONTRACT_ADDRESS]);
  console.log("pythOracle deployed to: " + pythOracle.address);

  // deploy ResilientOracle
  const resilientOracle = await deployContract("ResilientOracle", [boundValidator.address]);
  console.log("resilientOracle deployed to: " + resilientOracle.address);

  // resilientOracle
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
  await sendTxn(vaultPriceFeed.setResilientOracle(resilientOracle.address), "vaultPriceFeed.setResilientOracle")
  await sendTxn(vault.setPriceFeed(vaultPriceFeed.address), "vault.setPriceFeed")

  writeTmpAddresses({
    boundValidator: boundValidator.address,
    pythOracle: pythOracle.address,
    resilientOracle: resilientOracle.address,
  })
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })


// npx hardhat run scripts/oracle/deployResilientOracle.js --network core-testnet
