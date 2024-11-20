const { expandDecimals } = require("../../test/shared/utilities");
const { deployContract, contractAt, writeTmpAddresses } = require("../shared/helpers")


// BTC
const VAULT_READER = "0x22237B9AC346fdBA4F3310A818044c6005117427"
// const VAULT_READER = "0xa2B0b61a62BBb2BEBe5d1Bdf2b43DA56d5d0f5B9"
// const VAULT_READER = "0x8c0Ad8C009A4001B2bA306AA9Ac1A954c819FA7C"

const VAULT = "0xB3992C9eaE205CC5AD8c95F79131d429287aE1e7";
const WCORE = "0x0B4501d4e506956c648908F306717608f7625831";
const POSITION_MANAGER = "0x239ad5c1D15DAe0f8163bC178c7921Bf5a1759cc"; //position router
// const POSITION_MANAGER = "0x239ad5c1D15DAe0f8163bC178c7921Bf5a1759cc";
const USDG_AMOUNT = expandDecimals(1, 30)
const TOKENS = [
    // "0x9D14040c235ff8a8B59d9C4deE7dcdb49B515EC8",//ABTC
    // "0xE8E8371405538DAb7BA7f063eD16C00CeE026468", //CORETBC
    "0xef317386be450E6Cb6e191E38B819508c4D5e820" //SOLVBTC
]
async function main() {

    const vaultReader = await contractAt("VaultReader", VAULT_READER)


    try {
        // console.log({
        //     VAULT,
        //     WCORE,
        //     POSITION_MANAGER,
        //     USDG_AMOUNT,
        //     TOKENS,
        // });
        // console.log(
        //         VAULT,
        //         WCORE,
        //         POSITION_MANAGER,
        //         USDG_AMOUNT,
        //         TOKENS,
        //     );
        // const res = await vaultReader.getVaultTokenInfoV3(
        //     VAULT,
        //     WCORE,
        //     POSITION_MANAGER,
        //     USDG_AMOUNT,
        //     TOKENS,
        // )
        // const res = await vaultReader.getVaultTokenInfoV4(
        //     VAULT,
        //     WCORE,
        //     POSITION_MANAGER,
        //     USDG_AMOUNT,
        //     TOKENS,
        // )
        // const res = await vaultReader.getVaultTokenInfoV4(
        //     "0xB3992C9eaE205CC5AD8c95F79131d429287aE1e7",
        //     "0x0B4501d4e506956c648908F306717608f7625831",
        //     expandDecimals(1, 18),
        //     [
        //         "0x0000000000000000000000000000000000000000",
        //         "0x0B4501d4e506956c648908F306717608f7625831",
        //         "0xE8E8371405538DAb7BA7f063eD16C00CeE026468",
        //         "0x9D14040c235ff8a8B59d9C4deE7dcdb49B515EC8",
        //         "0xef317386be450E6Cb6e191E38B819508c4D5e820",
        //         "0x076027C99628cf7e142f506627125De31561764f",
        //         "0xe297A83fbB19d7884E5B96047113e256C5b266EB",
        //         "0x73A2b01bE81Eb0A753bEF9480E8CE013019ae366"
        //     ],
        // )
        // const res1 = await vaultReader.getMaxGlobalSizes(
        //     POSITION_MANAGER,
        //     "0x0B4501d4e506956c648908F306717608f7625831",
        //     [
        //         "0x0000000000000000000000000000000000000000",
        //         "0x0B4501d4e506956c648908F306717608f7625831",
        //         "0xE8E8371405538DAb7BA7f063eD16C00CeE026468",
        //         "0x9D14040c235ff8a8B59d9C4deE7dcdb49B515EC8",
        //         "0xef317386be450E6Cb6e191E38B819508c4D5e820",
        //         "0x076027C99628cf7e142f506627125De31561764f",
        //         "0xe297A83fbB19d7884E5B96047113e256C5b266EB",
        //         "0x73A2b01bE81Eb0A753bEF9480E8CE013019ae366"
        //     ],
        // )
        
        const res2 = await vaultReader.getMaxGlobalSizesForTokens(
            POSITION_MANAGER,
            "0x0B4501d4e506956c648908F306717608f7625831",
            [
                "0x9D14040c235ff8a8B59d9C4deE7dcdb49B515EC8".toLowerCase(),
                "0xE8E8371405538DAb7BA7f063eD16C00CeE026468".toLowerCase(),
                "0xef317386be450E6Cb6e191E38B819508c4D5e820".toLowerCase(),
            ],
        )

        console.log({  res2 });
    } catch (error) {
        console.log(error);
    }
}

main()