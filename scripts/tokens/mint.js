const { readTmpAddresses, contractAt, callWithRetries } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")

async function main() {
	const account = (await ethers.getSigners())[0]
	const {BTC, ETH, USDC, USDT} = readTmpAddresses()

	// for (const tokenAddress of [BTC, USDC, USDT]) {
  const  tokenAddress = '0xcAb0eB0D421e3A614FE5a7fbEE694954988A04B4';
		const amount = expandDecimals(100000, 18)
		console.log(`Minting ${amount} of tokens ${tokenAddress}`)
		const tokenContract = await contractAt("FaucetToken", tokenAddress)
		await callWithRetries(tokenContract.mint.bind(tokenContract), [account.address, amount])
	/*}*/
}

main()
