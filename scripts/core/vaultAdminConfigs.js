const { getFrameSigner, deployContract, contractAt, sendTxn, readTmpAddresses, writeTmpAddresses } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const { toUsd } = require("../../test/shared/units")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')[network];



const VAULT = "0x736Cad071Fdb5ce7B17F35bB22f68Ad53F55C207" //BTC

async function main() {

  const {
    BTC, CORE, ETH, SOL, BNB, DOGE, TRX, SUI, AVAX, XRP, SHIB, BONK, FLOKI, ENA, LINK, POPCAT, SolvBTC
  } = tokens


  const tokenArr = [BTC, CORE, ETH, SOL, BNB, DOGE, TRX, SUI, AVAX, XRP, SHIB, BONK, FLOKI, ENA, LINK, POPCAT, SolvBTC]



  const vault = await contractAt("Vault", VAULT)




  const timelock = await contractAt("Timelock", await vault.gov())

  // setFundingRate
  await sendTxn(timelock.setFundingRate(vault.address, 60 * 60, 172, 172), "timelock.setFundingRate")

  // setFees
  await sendTxn(timelock.setFees(
    vault.address, // _vault
    10, // _taxBasisPoints
    5, // _stableTaxBasisPoints
    7, // _mintBurnFeeBasisPoints
    20, // _swapFeeBasisPoints
    1, // _stableSwapFeeBasisPoints
    50, // _marginFeeBasisPoints
    toUsd(5), // _liquidationFeeUsd
    45 * 60, // _minProfitTime
    false // _hasDynamicFees
  ), "timelock.setFees")

  // await sendTxn(timelock.setVaultTokenConfig(
  //   vault.address, // _vault
  //   token.address, // _token
  //   token.decimals, // _tokenDecimals
  //   token.tokenWeight, // _tokenWeight
  //   token.minProfitBps, // _minProfitBps
  //   expandDecimals(token.maxUsdgAmount, 30), // _maxUsdgAmount
  //   expandDecimals(token.maxLongOpenInterest, 30), // _maxLongOpenInterest
  //   expandDecimals(token.maxShortOpenInterest, 30), // _maxShortOpenInterest
  //   token.isStable, // _isStable
  //   token.isShortable // _isShortable
  // ), `timelock.setTokenConfig(${token.name}) ${token.address}`)

  for (const token of tokenArr) {
    await sendTxn(timelock.setVaultTokenConfig(
      vault.address, // _vault
      token.address, // _token
      token.decimals, // _tokenDecimals
      token.tokenWeight, // _tokenWeight
      token.minProfitBps, // _minProfitBps
      expandDecimals(token.maxUsdgAmount, 30), // _maxUsdgAmount
      expandDecimals(token.maxLongOpenInterest, 30), // _maxLongOpenInterest
      expandDecimals(token.maxShortOpenInterest, 30), // _maxShortOpenInterest
      token.isStable, // _isStable
      token.isShortable // _isShortable
    ), `timelock.setTokenConfig(${token.name}) ${token.address}`)
  }


}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
//  npx hardhat run scripts/core/vaultAdminConfigs.js --network core-testnet