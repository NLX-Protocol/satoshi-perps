const { contractAt , sendTxn, callWithRetries } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")

async function main() {
  const vault = await callWithRetries(contractAt, ["Vault", "0x7266488Fb3529a06B62092492B44824c21c47820"])

  await sendTxn(callWithRetries(vault.setFees.bind(vault), [
    10, // taxBasisPoints,
    10, // stableTaxBasisPoints,
    10, // mintBurnFeeBasisPoints,
    10, // swapFeeBasisPoints,
    10, // stableSwapFeeBasisPoints,
    10, // marginFeeBasisPoints,
    expandDecimals(1, 30), // 1 USD, liquidationFeeUsd,
    3600, // 1 hour, minProfitTime,
    true // hasDynamicFees
  ]), "vault.setFees")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
