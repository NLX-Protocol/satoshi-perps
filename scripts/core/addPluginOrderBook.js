const { contractAt , sendTxn, callWithRetries, readTmpAddresses} = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")

async function main() {
  const addresses = readTmpAddresses()

  const router = await callWithRetries(contractAt, ["Router", addresses.routerBTC])
  const vault = await contractAt("Vault", addresses.vaultBTC);
  const timelock  = await contractAt("Timelock", await vault.gov())

  console.log('timelock ', timelock.address);

  await sendTxn(callWithRetries(router.addPlugin.bind(router), [
    addresses.orderBookBTC
  ]), "router.addPlugin")

  await sendTxn(timelock.setContractHandler(addresses.orderBookBTC, addresses.vaultBTC), "timelock.setContractHandler")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
