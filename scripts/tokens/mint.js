const {readTmpAddresses, contractAt, callWithRetries} = require("../shared/helpers")
const {expandDecimals} = require("../../test/shared/utilities")

async function main() {
  const account = (await ethers.getSigners())[0]
  const addresses = readTmpAddresses()

  const tokenAddress = addresses["SolvBTC.CORE"];
  const amount = expandDecimals(100000, 18)
  console.log(`Minting ${amount} of tokens ${tokenAddress}`)
  const tokenContract = await contractAt("FaucetToken", tokenAddress)
  await callWithRetries(tokenContract.mint.bind(tokenContract), [account.address, amount])
}

main()
