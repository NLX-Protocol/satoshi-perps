const { ethers, network } = require("hardhat");
const { expandDecimals } = require("../../test/shared/utilities");
const { contractAt, sendTxn, readTmpAddresses} = require("../shared/helpers");
const tokens = require('../core/tokens')[network.name];

async function main() {
    const addresses = readTmpAddresses()

  const {
    WCORE, BTC, CORE, ETH, SOL, BNB, DOGE, TRX, SUI, AVAX, XRP, SHIB, BONK, FLOKI, ENA, LINK, POPCAT, TRUMP, BERA, VIRTUAL, APT, SOLV, KAITO
  } = tokens
  const tokenArr = [WCORE, BTC, CORE, ETH, SOL, BNB, DOGE, TRX, SUI, AVAX, XRP, SHIB, BONK, FLOKI, ENA, LINK, POPCAT, TRUMP, BERA, VIRTUAL, APT, SOLV, KAITO]
  //const tokenArr = [WCORE]

    /*const {
      VIRTUAL
    } = tokens
    const tokenArr = [VIRTUAL]*/
    const pythMaxStalePeriod = 60 * 60 // 1 hour


    const validateConfigs = []
    const pythTokenConfigs = []
    const resilientOracleConfigs = []
    const vaultWhitelistConfigs = []

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
        resilientOracleConfigs.push({
            asset: token.address,
            oracles: [addresses.pythOracle, ethers.constants.AddressZero, ethers.constants.AddressZero],
            enableFlagsForOracles: [true, false, false]
        })

        vaultWhitelistConfigs.push({
            vault: addresses.vaultBTC,
            token: token.address,
            tokenDecimals: token.decimals,
            tokenWeight: token.tokenWeight,
            minProfitBps: token.minProfitBps,
            maxUsdgAmount: expandDecimals(token.maxUsdgAmount, 30),
            maxLongOiAmount: expandDecimals(token.maxLongOpenInterest, 30),
            maxShortOiAmount: expandDecimals(token.maxShortOpenInterest, 30),
            isStable: token.isStable,
            isShortable: token.isShortable,
        })
    }

    console.log({
        validateConfigs,
        pythTokenConfigs,
        resilientOracleConfigs,
    });

    //  setConfigs
    const boundValidator = await contractAt("BoundValidator", addresses.boundValidator)
    const pythOracle = await contractAt("PythOracle", addresses.pythOracle)
    const resilientOracle = await contractAt("ResilientOracle", addresses.resilientOracle)
    const timelock = await contractAt("Timelock", addresses.vaultTimelockBTC)

    await sendTxn(boundValidator.setValidateConfigs(validateConfigs), "boundValidator.setValidateConfig")
    await sendTxn(pythOracle.setTokenConfigs(pythTokenConfigs), "pythOracle.setTokenConfigs")
    await sendTxn(resilientOracle.setTokenConfigs(resilientOracleConfigs), "resilientOracle.setTokenConfigs")

    console.log("whitelist token in the vault timelock after updating the pyth prices");
    console.log("call setVaultTokenConfig");
    console.log("----------");
    console.log("---------");
    console.log("--------");
    console.log("-------");
    console.log("------");
    console.log("-----");
    console.log("----");
    console.log("--");
    console.log("-");

    for (const config of vaultWhitelistConfigs) {

        await sendTxn(timelock.setVaultTokenConfig(
            config.vault,
            config.token,
            config.tokenDecimals,
            config.tokenWeight,
            config.minProfitBps,
            config.maxUsdgAmount,
            config.maxLongOiAmount,
            config.maxShortOiAmount,
            config.isStable,
            config.isShortable
        ), "timelock.setVaultTokenConfig")
    }

    console.log({
        vaultWhitelistConfigs
    });

}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })


// npx hardhat run scripts/oracle/createNewMarketTestnet.js --network core-mainnet
