const { deployContract, contractAt, sendTxn, callWithRetries, writeTmpAddresses } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const { toChainlinkPrice } = require("../../test/shared/chainlink")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');
const tokens = require('./tokens')[network];

// // ---------- BTC ----------
// const VAULT_ADDRESS = "0xB3992C9eaE205CC5AD8c95F79131d429287aE1e7"
// const VAULT_PRICE_FEED_ADDRESS = "0x7d47e535E620566fa7ba716D1B41E380d5dd2904"
// const NLP_MANAGER_ADDRESS = "0xbCb9573a247921a4F3fa3BcF210354E4561f967C"
// const REFERRAL_STORAGE_ADDRESS = "0x918699b3E3Ac04aAd93fe9cC6352C94893c3f495"
// const POSITION_ROUTER_ADDRESS = "0x239ad5c1D15DAe0f8163bC178c7921Bf5a1759cc"
// const { aBTC, coreBTC, solvBTC } = tokens
// const tokenArr = [aBTC, coreBTC, solvBTC]

// // ---------- USD ----------
// const VAULT_ADDRESS = "0x4204d09EC45e305Ecf06dC872B928e345F664678"
// const VAULT_PRICE_FEED_ADDRESS = "0x94823c97c127E0e5617f5182d3FdcBBF3F9E56C5"
// const NLP_MANAGER_ADDRESS = "0x16aCa8b0547566eA9b2aa7a232871D5D5C8160a6"
// const REFERRAL_STORAGE_ADDRESS = "0xb114DA215ad61076A1Ada04901C2F4ca69b1b4e4"
// const POSITION_ROUTER_ADDRESS = "0xE450D1514f20E2f67dc4E0124ab146d19ee97334"
// const { usdt, usdc, usde } = tokens
// const tokenArr = [usdt, usdc, usde]

// ---------- CORE ----------
const VAULT_ADDRESS = "0x026a7149B3591b9811B5500041ba143a74c71344"
const VAULT_PRICE_FEED_ADDRESS = "0xa0aD95c8145e5eE58aB4Bb5484Fa041703Fb62C0"
const REFERRAL_STORAGE_ADDRESS = "0x6C156d171b5E7523590770b320541B9dF5305e08"
const NLP_MANAGER_ADDRESS = "0xa0aD95c8145e5eE58aB4Bb5484Fa041703Fb62C0"
const POSITION_ROUTER_ADDRESS = "0xc152FA8fc1191eD0F294488C26A4bED4e06d974C"
const { core, } = tokens
const tokenArr = [core,]

async function main() {
  // const wallet = (await ethers.getSigners())[0]

  const vault = await contractAt("Vault", VAULT_ADDRESS)
  const vaultTimelock = await contractAt("Timelock", await vault.gov())

  // // const oldVaultTimelock = await contractAt("Timelock", await vault.gov())
  // // change gov
  // const newVaultTimelock = await deployContract("Timelock", [
  //   wallet.address, // admin
  //   0, // buffer
  //   wallet.address, // tokenManager
  //   wallet.address, // mintReceiver
  //   NLP_MANAGER_ADDRESS, // nlpManager
  //   NLP_MANAGER_ADDRESS, // prevNlpManager
  //   wallet.address, // rewardRouter
  //   expandDecimals(100_000_000, 18), // maxTokenSupply
  //   50, // marginFeeBasisPoints 0.5%
  //   500, // maxMarginFeeBasisPoints 5%
  // ])

  // // change gov vault
  // await sendTxn(oldVaultTimelock.signalSetGov(vault.address, newVaultTimelock.address), "oldVaultTimelock.signalSetGov")
  // await sendTxn(newVaultTimelock.acceptGov(vault.address,), "newVaultTimelock.acceptGov")

  // // change referralStorage vault
  // await sendTxn(oldVaultTimelock.signalSetGov(REFERRAL_STORAGE_ADDRESS, newVaultTimelock.address), "oldVaultTimelock.signalSetGov")
  // await sendTxn(newVaultTimelock.acceptGov(REFERRAL_STORAGE_ADDRESS,), "newVaultTimelock.acceptGov")

  // // change positionRouter vault
  // await sendTxn(oldVaultTimelock.signalSetGov(POSITION_ROUTER_ADDRESS, newVaultTimelock.address), "oldVaultTimelock.signalSetGov")
  // await sendTxn(newVaultTimelock.acceptGov(POSITION_ROUTER_ADDRESS,), "newVaultTimelock.acceptGov")


  // const addresses = {
  //   vaultTimelockCore: newVaultTimelock.address,
  // }
  // writeTmpAddresses(addresses)

  const vaultPriceFeed = await contractAt("VaultPriceFeed", VAULT_PRICE_FEED_ADDRESS)
  const vaultPriceFeedTimeLock = await contractAt("PriceFeedTimelock", await vaultPriceFeed.gov())

  for (const token of tokenArr) {
    await sendTxn(vaultPriceFeedTimeLock.signalPriceFeedSetTokenConfig(
      vaultPriceFeed.address, //_vaultPriceFeed
      token.address, // _token
      token.priceFeed, // _priceFeed
      token.priceDecimals, // _priceDecimals
      token.isStrictStable // _isStrictStable
    ), `vaultPriceFeedTimeLock.signalPriceFeedSetTokenConfig(${token.name})${vaultPriceFeed.address} ${token.address} ${token.priceFeed}`)

    await sendTxn(vaultPriceFeedTimeLock.priceFeedSetTokenConfig(
      vaultPriceFeed.address, //_vaultPriceFeed
      token.address, // _token
      token.priceFeed, // _priceFeed
      token.priceDecimals, // _priceDecimals
      token.isStrictStable // _isStrictStable
    ), `vaultPriceFeedTimeLock.priceFeedSetTokenConfig(${token.name})${vaultPriceFeed.address} ${token.address} ${token.priceFeed}`)


    await sendTxn(vaultTimelock.setVaultTokenConfig(
      vault.address, // _vault
      token.address, // _token
      token.decimals, // _tokenDecimals
      token.tokenWeight, // _tokenWeight
      token.minProfitBps, // _minProfitBps
      expandDecimals(token.maxUsdgAmount, 30), // _maxUsdgAmount
      token.isStable, // _isStable
      token.isShortable // _isShortable
    ), `vault.setTokenConfig(${token.name}) ${token.address}`)

  }


}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
