const { ethers, network } = require("hardhat");
const { expandDecimals } = require("../../test/shared/utilities");
const { contractAt, sendTxn } = require("../shared/helpers");
const tokens = require('../core/tokens')[network.name];

const VAULT = "0x683fb89cf3C1009f43517A61138703C4f2e8DF95" //BTC
const VAULT_TIMELOCK = "0x44cd56A0Ac2414daaBa9e29c05B4809D4Ee2c31D"
// const VAULT_PRICE_FEED = "0x0eE402630B89A38325dcEAf3c0cF9cac933142D8"
const BOUND_VALIDATOR = "0x0E931b0bDe54BA8Ca6116d0bBBf1e9b4DD19f84C"
const PYTH_ORACLE_ADAPTER = "0xE464C02889DfE75B81635bcE6bec3B0aFC007bA8"
const RESILIENT_ORACLE = "0x90c4aD8572B6f4FCD461F822925F4875B270Fe19"



async function main() {
    const {
        USDT, USDC, nativeToken
    } = tokens
    const tokenArr = [USDT, USDC, nativeToken]
    // const pythMaxStalePeriod = 60 * 60 * 24 // 24 hours
    const pythMaxStalePeriod = 60 * 60 // 1 hour




    const validateConfigs = []
    const pythTokenConfigs = []
    const resilientOracleConfigs = []
    const vaultWhitelistConfigs = []

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
        resilientOracleConfigs.push({
            asset: token.address,
            oracles: [PYTH_ORACLE_ADAPTER, ethers.constants.AddressZero, ethers.constants.AddressZero],
            enableFlagsForOracles: [true, false, false]
        })

        vaultWhitelistConfigs.push({
            vault: VAULT,
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
    const boundValidator = await contractAt("BoundValidator", BOUND_VALIDATOR)
    const pythOracle = await contractAt("PythOracle", PYTH_ORACLE_ADAPTER)
    const resilientOracle = await contractAt("ResilientOracle", RESILIENT_ORACLE)
    const timelock = await contractAt("Timelock", VAULT_TIMELOCK)

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