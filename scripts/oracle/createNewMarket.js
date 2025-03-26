const { ethers, network } = require("hardhat");
const { expandDecimals } = require("../../test/shared/utilities");
const tokens = require('../core/tokens')[network.name];

const VAULT = "0x736Cad071Fdb5ce7B17F35bB22f68Ad53F55C207" //BTC
const VAULT_TIMELOCK = "0x1c50FE94FAEB9443bc40eB02aFf4Df9f83C84F92"
// const VAULT_PRICE_FEED = "0x0eE402630B89A38325dcEAf3c0cF9cac933142D8"
const BOUND_VALIDATOR = "0x47794688e555F03F64cd0b4A65fFcec7C7387cA2"
const PYTH_ORACLE_ADAPTER = "0xAd1d1355be077B06D82fEA75eF3b9941EdE96958"
const RESILIENT_ORACLE = "0x3e9b6c48A388e5d580e6D65bB2896D60b606CDaD"



async function main() {
    const {
         Solv, Kaito
    } = tokens
    const tokenArr = [  Solv, Kaito]
    // const pythMaxStalePeriod = 60 * 60 * 24 // 24 hours
    const pythMaxStalePeriod = 60 * 60 // 1 hour




    const validateConfigs = []
    const pythTokenConfigs = []
    const resilientOracleConfigs = []
    const vaultWhitelistConfigs = []

    // BTC
    for (const token of tokenArr) {
        validateConfigs.push({
            boundValidator: BOUND_VALIDATOR,
            tokenName: token.name,
            function: 'setValidateConfig',
            asset: token.address,
            upperBoundRatio: ethers.utils.parseUnits("1.05", 18), // Upper bound - reported price can be up to 5% higher
            lowerBoundRatio: ethers.utils.parseUnits("0.95", 18), // Lower bound - reported price can be up to 5% lower
        })
        pythTokenConfigs.push({
            pythOracleAdapter: PYTH_ORACLE_ADAPTER,
            tokenName: token.name,
            function: "setTokenConfig",
            pythId: token.priceFeed.pyth,
            asset: token.address,
            maxStalePeriod: pythMaxStalePeriod
        })
        resilientOracleConfigs.push({
            resilientOracle: RESILIENT_ORACLE,
            tokenName: token.name,
            function: "setTokenConfig",
            asset: token.address,
            oracles: [PYTH_ORACLE_ADAPTER, ethers.constants.AddressZero, ethers.constants.AddressZero].toString(),
            enableFlagsForOracles: [true, false, false].toString()
        })

        vaultWhitelistConfigs.push({
            timelock: VAULT_TIMELOCK,
            tokenName: token.name,
            function: "setVaultTokenConfig",
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


    console.log("whitelist token in the vault timelock after updating the pyth prices");
    console.log("call setTokenConfigsPyth");
    console.log("----------");
    console.log("---------");
    console.log("--------");
    console.log("-------");
    console.log("------");
    console.log("-----");
    console.log("----");
    console.log("--");
    console.log("-");
    

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


// npx hardhat run scripts/oracle/createNewMarket.js --network core-mainnet