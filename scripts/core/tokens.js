// price feeds https://docs.chain.link/docs/binance-smart-chain-addresses/
const { expandDecimals } = require("../../test/shared/utilities");

module.exports = {
  "core-testnet": {
    BTC: {
      name: "BTC",
      address: "0xeb6dd80841D43bdD682a1f985bDF7633cac40B67",
      decimals: 18,
      priceFeed: {
        apro: "0x1BF924E71cED920387E7f0E0C545cB969a1f805b",
        pyth: "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43"
      },
      priceDecimals: 8,
      isStrictStable: false,
      minProfitBps: 0,
      tokenWeight: 0,
      maxUsdgAmount: 0,
      maxUsdgAmount: 15 * 1000 * 1000,
      maxLongOpenInterest: 1 * 1000 * 1000,
      maxShortOpenInterest: 1 * 1000 * 1000,
      bufferAmount: 0,
      isStable: false,
      isShortable: true,
    },
    GOLD: {
      name: "GOLD",
      address: "0x4eAcCbF0b28Ef72399eD6A3B3372BeaD15685493",
      decimals: 18,
      priceFeed: {
        pyth: "0x765d2ba906dbc32ca17cc11f5310a89e9ee1f6420508c63861f2f8ba4ee34bb2"
      },
      priceDecimals: 8,
      isStrictStable: false,
      minProfitBps: 0,
      tokenWeight: 0,
      maxUsdgAmount: 0,
      maxLongOpenInterest: 1 * 1000 * 1000,
      maxShortOpenInterest: 1 * 1000 * 1000,
      bufferAmount: 0,
      isStable: false,
      isShortable: true,
    },
    OIL: {
      name: "OIL",
      address: "0x5D056F70fDa5E09Af70D3bEA3De55fc28a2590ea",
      decimals: 18,
      priceFeed: {
        pyth: "0x27f0d5e09a830083e5491795cac9ca521399c8f7fd56240d09484b14e614d57a"
      },
      priceDecimals: 8,
      isStrictStable: false,
      minProfitBps: 0,
      tokenWeight: 0,
      maxUsdgAmount: 0,
      maxLongOpenInterest: 1 * 1000 * 1000,
      maxShortOpenInterest: 1 * 1000 * 1000,
      bufferAmount: 0,
      isStable: false,
      isShortable: true,
    },
    CORE: {
      name: "CORE",
      address: "0xdDc12221B9b1C92CF305935c0319CDd6f78C9da1",
      decimals: 18,
      priceFeed: {
        pyth: "0x9b4503710cc8c53f75c30e6e4fda1a7064680ef2e0ee97acd2e3a7c37b3c830c"
      },
      priceDecimals: 8,
      isStrictStable: false,
      minProfitBps: 0,
      tokenWeight: 0,
      maxUsdgAmount: 0,
      maxLongOpenInterest: 1 * 1000 * 1000,
      maxShortOpenInterest: 1 * 1000 * 1000,
      bufferAmount: 0,
      isStable: false,
      isShortable: true,
    },
    ETH: {
      name: "ETH",
      address: "0x910629F36514ea0B01d274A51B8E4bea7De7Ba26",
      decimals: 18,
      priceFeed: {
        pyth: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace"
      },
      priceDecimals: 8,
      isStrictStable: false,
      minProfitBps: 0,
      tokenWeight: 0,
      maxUsdgAmount: 0,
      maxLongOpenInterest: 1 * 1000 * 1000,
      maxShortOpenInterest: 1 * 1000 * 1000,
      bufferAmount: 0,
      isStable: false,
      isShortable: true,
    },
    SOL: {
      name: "SOL",
      address: "0xd55f692B10132c191EeBbf75d3C0ed749C622170",
      decimals: 18,
      priceFeed: {
        pyth: "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d"
      },
      priceDecimals: 8,
      isStrictStable: false,
      minProfitBps: 0,
      tokenWeight: 0,
      maxUsdgAmount: 0,
      maxLongOpenInterest: 1 * 1000 * 1000,
      maxShortOpenInterest: 1 * 1000 * 1000,
      bufferAmount: 0,
      isStable: false,
      isShortable: true,
    },
    BNB: {
      name: "BNB",
      address: "0xc422c622bD6eb185c5Df636cF2aD4eAa8b6a8e46",
      decimals: 18,
      priceFeed: {
        pyth: "0x2f95862b045670cd22bee3114c39763a4a08beeb663b145d283c31d7d1101c4f"
      },
      priceDecimals: 8,
      isStrictStable: false,
      minProfitBps: 0,
      tokenWeight: 0,
      maxUsdgAmount: 0,
      maxLongOpenInterest: 1 * 1000 * 1000,
      maxShortOpenInterest: 1 * 1000 * 1000,
      bufferAmount: 0,
      isStable: false,
      isShortable: true,
    },
    DOGE: {
      name: "DOGE",
      address: "0x63a8801bAD4C72a87C395d7290cB8c63AEd1c96f",
      decimals: 18,
      priceFeed: {
        pyth: "0xdcef50dd0a4cd2dcc17e45df1676dcb336a11a61c69df7a0299b0150c672d25c"
      },
      priceDecimals: 8,
      isStrictStable: false,
      minProfitBps: 0,
      tokenWeight: 0,
      maxUsdgAmount: 0,
      maxLongOpenInterest: 1 * 1000 * 1000,
      maxShortOpenInterest: 1 * 1000 * 1000,
      bufferAmount: 0,
      isStable: false,
      isShortable: true,
    },
    TRX: {
      name: "TRX",
      address: "0xf84f00d863d641c2A5A95a7638c128Ed27b22F38",
      decimals: 18,
      priceFeed: {
        pyth: "0x67aed5a24fdad045475e7195c98a98aea119c763f272d4523f5bac93a4f33c2b"
      },
      priceDecimals: 8,
      isStrictStable: false,
      minProfitBps: 0,
      tokenWeight: 0,
      maxUsdgAmount: 0,
      maxLongOpenInterest: 1 * 1000 * 1000,
      maxShortOpenInterest: 1 * 1000 * 1000,
      bufferAmount: 0,
      isStable: false,
      isShortable: true,
    },
    SUI: {
      name: "SUI",
      address: "0xb5d7D72dB9aA7b0673902290860C6680d06d12E8",
      decimals: 18,
      priceFeed: {
        pyth: "0x23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744"
      },
      priceDecimals: 8,
      isStrictStable: false,
      minProfitBps: 0,
      tokenWeight: 0,
      maxUsdgAmount: 0,
      maxLongOpenInterest: 1 * 1000 * 1000,
      maxShortOpenInterest: 1 * 1000 * 1000,
      bufferAmount: 0,
      isStable: false,
      isShortable: true,
    },
    AVAX: {
      name: "AVAX",
      address: "0x77F512cf7324f6Aa9Ab21b923A860fEC7F48201F",
      decimals: 18,
      priceFeed: {
        pyth: "0x93da3352f9f1d105fdfe4971cfa80e9dd777bfc5d0f683ebb6e1294b92137bb7"
      },
      priceDecimals: 8,
      isStrictStable: false,
      minProfitBps: 0,
      tokenWeight: 0,
      maxUsdgAmount: 0,
      maxLongOpenInterest: 1 * 1000 * 1000,
      maxShortOpenInterest: 1 * 1000 * 1000,
      bufferAmount: 0,
      isStable: false,
      isShortable: true,
    },
    XRP: {
      name: "XRP",
      address: "0x47a07Df1ac89dfC4DAB0CCe66faCDAfe89248737",
      decimals: 18,
      priceFeed: {
        pyth: "0xec5d399846a9209f3fe5881d70aae9268c94339ff9817e8d18ff19fa05eea1c8"
      },
      priceDecimals: 8,
      isStrictStable: false,
      minProfitBps: 0,
      tokenWeight: 0,
      maxUsdgAmount: 0,
      maxLongOpenInterest: 1 * 1000 * 1000,
      maxShortOpenInterest: 1 * 1000 * 1000,
      bufferAmount: 0,
      isStable: false,
      isShortable: true,
    },
    SHIB: {
      name: "SHIB",
      address: "0xe66A461f41C31298Dc1Ae5aa0DEAEBd321e8d94C",
      decimals: 18,
      priceFeed: {
        pyth: "0xf0d57deca57b3da2fe63a493f4c25925fdfd8edf834b20f93e1f84dbd1504d4a"
      },
      priceDecimals: 8,
      isStrictStable: false,
      minProfitBps: 0,
      tokenWeight: 0,
      maxUsdgAmount: 0,
      maxLongOpenInterest: 1 * 1000 * 1000,
      maxShortOpenInterest: 1 * 1000 * 1000,
      bufferAmount: 0,
      isStable: false,
      isShortable: true,
    },
    BONK: {
      name: "BONK",
      address: "0x4B7397ec234b54B20BD9B17A2ce414F6d3993D6E",
      decimals: 18,
      priceFeed: {
        pyth: "0x72b021217ca3fe68922a19aaf990109cb9d84e9ad004b4d2025ad6f529314419"
      },
      priceDecimals: 8,
      isStrictStable: false,
      minProfitBps: 0,
      tokenWeight: 0,
      maxUsdgAmount: 0,
      maxLongOpenInterest: 1 * 1000 * 1000,
      maxShortOpenInterest: 1 * 1000 * 1000,
      bufferAmount: 0,
      isStable: false,
      isShortable: true,
    },
    FLOKI: {
      name: "FLOKI",
      address: "0x9cA24e66B44eD5a5d46524d2CA9EE62C5Ca924C8",
      decimals: 18,
      priceFeed: {
        pyth: "0x6b1381ce7e874dc5410b197ac8348162c0dd6c0d4c9cd6322672d6c2b1d58293"
      },
      priceDecimals: 8,
      isStrictStable: false,
      minProfitBps: 0,
      tokenWeight: 0,
      maxUsdgAmount: 0,
      maxLongOpenInterest: 1 * 1000 * 1000,
      maxShortOpenInterest: 1 * 1000 * 1000,
      bufferAmount: 0,
      isStable: false,
      isShortable: true,
    },
    ENA: {
      name: "ENA",
      address: "0xe3738209ee5EC3A4d2a973a328A3D737c5134cBc",
      decimals: 18,
      priceFeed: {
        pyth: "0xb7910ba7322db020416fcac28b48c01212fd9cc8fbcbaf7d30477ed8605f6bd4"
      },
      priceDecimals: 8,
      isStrictStable: false,
      minProfitBps: 0,
      tokenWeight: 0,
      maxUsdgAmount: 0,
      maxLongOpenInterest: 1 * 1000 * 1000,
      maxShortOpenInterest: 1 * 1000 * 1000,
      bufferAmount: 0,
      isStable: false,
      isShortable: true,
    },
    LINK: {
      name: "LINK",
      address: "0x37b79D19dF4a4BE7ffa55Aa3A36f383F26e537f9",
      decimals: 18,
      priceFeed: {
        pyth: "0x8ac0c70fff57e9aefdf5edf44b51d62c2d433653cbb2cf5cc06bb115af04d221"
      },
      priceDecimals: 8,
      isStrictStable: false,
      minProfitBps: 0,
      tokenWeight: 0,
      maxUsdgAmount: 0,
      maxLongOpenInterest: 1 * 1000 * 1000,
      maxShortOpenInterest: 1 * 1000 * 1000,
      bufferAmount: 0,
      isStable: false,
      isShortable: true,
    },
    POPCAT: {
      name: "POPCAT",
      address: "0x72Bd1aDfa6aA9fAea4840D98F401CF97AbF73d43",
      decimals: 18,
      priceFeed: {
        pyth: "0xb9312a7ee50e189ef045aa3c7842e099b061bd9bdc99ac645956c3b660dc8cce"
      },
      priceDecimals: 8,
      isStrictStable: false,
      minProfitBps: 0,
      tokenWeight: 0,
      maxUsdgAmount: 0,
      maxLongOpenInterest: 1 * 1000 * 1000,
      maxShortOpenInterest: 1 * 1000 * 1000,
      bufferAmount: 0,
      isStable: false,
      isShortable: true,
    },
    SolvBTC: {
      name: "SolvBTC.core",
      address: "0x912d9B0ab196d1Ad9A23B6cE25F7F06AfaC8755a",
      decimals: 18,
      priceFeed: {
        pyth: "0xf253cf87dc7d5ed5aa14cba5a6e79aee8bcfaef885a0e1b807035a0bbecc36fa"
      },
      priceDecimals: 8,
      isStrictStable: false,
      tokenWeight: 1000,
      minProfitBps: 0,
      maxUsdgAmount: 15 * 1000 * 1000,
      maxLongOpenInterest: 1 * 1000 * 1000,
      maxShortOpenInterest: 1 * 1000 * 1000,
      bufferAmount: 1,
      isStable: false,
      isShortable: true,
    },
    nativeToken: {
      address: "0x8154036681373780a862cB1bD05098D452871305",
      priceFeed: {
        pyth: "0x9b4503710cc8c53f75c30e6e4fda1a7064680ef2e0ee97acd2e3a7c37b3c830c"
      },
      decimals: 18,
    },
  },
  "core-mainnet": {
    BTC: {
      name: "BTC",
      address: "0x86Bf1Ce7D5B26B158E1584770EA8b1605F02d4Cf",
      decimals: 18,
      priceFeed: {
        apro: "0x1BF924E71cED920387E7f0E0C545cB969a1f805b",
        pyth: "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43"
      },
      priceDecimals: 8,
      isStrictStable: false,
      minProfitBps: 0,
      tokenWeight: 0,
      maxUsdgAmount: 0,
      maxLongOpenInterest: 1 * 1000 * 1000,
      maxShortOpenInterest: 1 * 1000 * 1000,
      bufferAmount: 0,
      isStable: false,
      isShortable: true,
    },
    CORE: {
      name: "CORE",
      address: "0xcC6BE48dD8c4BFF2B2515580a6Df3Db0FF06FD65",
      decimals: 18,
      priceFeed: {
        pyth: "0x9b4503710cc8c53f75c30e6e4fda1a7064680ef2e0ee97acd2e3a7c37b3c830c"
      },
      priceDecimals: 8,
      isStrictStable: false,
      minProfitBps: 0,
      tokenWeight: 0,
      maxUsdgAmount: 0,
      maxLongOpenInterest: 1 * 1000 * 1000,
      maxShortOpenInterest: 1 * 1000 * 1000,
      bufferAmount: 0,
      isStable: false,
      isShortable: true,
    },
    GOLD: {
      name: "GOLD",
      address: "0x4eAcCbF0b28Ef72399eD6A3B3372BeaD15685493",
      decimals: 18,
      priceFeed: {
        pyth: "0x765d2ba906dbc32ca17cc11f5310a89e9ee1f6420508c63861f2f8ba4ee34bb2"
      },
      priceDecimals: 8,
      isStrictStable: false,
      minProfitBps: 0,
      tokenWeight: 0,
      maxUsdgAmount: 0,
      maxLongOpenInterest: 1 * 1000 * 1000,
      maxShortOpenInterest: 1 * 1000 * 1000,
      bufferAmount: 0,
      isStable: false,
      isShortable: true,
    },
    OIL: {
      name: "OIL",
      address: "0x5D056F70fDa5E09Af70D3bEA3De55fc28a2590ea",
      decimals: 18,
      priceFeed: {
        pyth: "0x27f0d5e09a830083e5491795cac9ca521399c8f7fd56240d09484b14e614d57a"
      },
      priceDecimals: 8,
      isStrictStable: false,
      minProfitBps: 0,
      tokenWeight: 0,
      maxUsdgAmount: 0,
      maxLongOpenInterest: 1 * 1000 * 1000,
      maxShortOpenInterest: 1 * 1000 * 1000,
      bufferAmount: 0,
      isStable: false,
      isShortable: true,
    },

    ETH: {
      name: "ETH",
      address: "0x3Fe892d953B1010Ca43d2a0f462cA12eC4aC18CD",
      decimals: 18,
      priceFeed: {
        pyth: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace"
      },
      priceDecimals: 8,
      isStrictStable: false,
      minProfitBps: 0,
      tokenWeight: 0,
      maxUsdgAmount: 0,
      maxLongOpenInterest: 1 * 1000 * 1000,
      maxShortOpenInterest: 1 * 1000 * 1000,
      bufferAmount: 0,
      isStable: false,
      isShortable: true,
    },
    SOL: {
      name: "SOL",
      address: "0x8225CD4594c03799178b02150E04Afc57bEafEDC",
      decimals: 18,
      priceFeed: {
        pyth: "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d"
      },
      priceDecimals: 8,
      isStrictStable: false,
      minProfitBps: 0,
      tokenWeight: 0,
      maxUsdgAmount: 0,
      maxLongOpenInterest: 1 * 1000 * 1000,
      maxShortOpenInterest: 1 * 1000 * 1000,
      bufferAmount: 0,
      isStable: false,
      isShortable: true,
    },
    BNB: {
      name: "BNB",
      address: "0xA4dA7A9D0c0Cf669419BD3e161F8EfEd294872Ee",
      decimals: 18,
      priceFeed: {
        pyth: "0x2f95862b045670cd22bee3114c39763a4a08beeb663b145d283c31d7d1101c4f"
      },
      priceDecimals: 8,
      isStrictStable: false,
      minProfitBps: 0,
      tokenWeight: 0,
      maxUsdgAmount: 0,
      maxLongOpenInterest: 1 * 1000 * 1000,
      maxShortOpenInterest: 1 * 1000 * 1000,
      bufferAmount: 0,
      isStable: false,
      isShortable: true,
    },
    DOGE: {
      name: "DOGE",
      address: "0x3037ade187E6bb3a990e6Df45c8c3aDBD01C0240",
      decimals: 18,
      priceFeed: {
        pyth: "0xdcef50dd0a4cd2dcc17e45df1676dcb336a11a61c69df7a0299b0150c672d25c"
      },
      priceDecimals: 8,
      isStrictStable: false,
      minProfitBps: 0,
      tokenWeight: 0,
      maxUsdgAmount: 0,
      maxLongOpenInterest: 1 * 1000 * 1000,
      maxShortOpenInterest: 1 * 1000 * 1000,
      bufferAmount: 0,
      isStable: false,
      isShortable: true,
    },
    TRX: {
      name: "TRX",
      address: "0x3E66c7eDfe68654736A171D91741cF284C7746A5",
      decimals: 18,
      priceFeed: {
        pyth: "0x67aed5a24fdad045475e7195c98a98aea119c763f272d4523f5bac93a4f33c2b"
      },
      priceDecimals: 8,
      isStrictStable: false,
      minProfitBps: 0,
      tokenWeight: 0,
      maxUsdgAmount: 0,
      maxLongOpenInterest: 1 * 1000 * 1000,
      maxShortOpenInterest: 1 * 1000 * 1000,
      bufferAmount: 0,
      isStable: false,
      isShortable: true,
    },
    SUI: {
      name: "SUI",
      address: "0xf5736c9FF7b98BB9DB036Fce2249084DC8C2F34B",
      decimals: 18,
      priceFeed: {
        pyth: "0x23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744"
      },
      priceDecimals: 8,
      isStrictStable: false,
      minProfitBps: 0,
      tokenWeight: 0,
      maxUsdgAmount: 0,
      maxLongOpenInterest: 1 * 1000 * 1000,
      maxShortOpenInterest: 1 * 1000 * 1000,
      bufferAmount: 0,
      isStable: false,
      isShortable: true,
    },
    AVAX: {
      name: "AVAX",
      address: "0xde7E28143b224DA1DbA65A617F87A40281bA51CA",
      decimals: 18,
      priceFeed: {
        pyth: "0x93da3352f9f1d105fdfe4971cfa80e9dd777bfc5d0f683ebb6e1294b92137bb7"
      },
      priceDecimals: 8,
      isStrictStable: false,
      minProfitBps: 0,
      tokenWeight: 0,
      maxUsdgAmount: 0,
      maxLongOpenInterest: 1 * 1000 * 1000,
      maxShortOpenInterest: 1 * 1000 * 1000,
      bufferAmount: 0,
      isStable: false,
      isShortable: true,
    },
    XRP: {
      name: "XRP",
      address: "0xF2f8Cb84Efea05De445ff2E23E698B90e17527dd",
      decimals: 18,
      priceFeed: {
        pyth: "0xec5d399846a9209f3fe5881d70aae9268c94339ff9817e8d18ff19fa05eea1c8"
      },
      priceDecimals: 8,
      isStrictStable: false,
      minProfitBps: 0,
      tokenWeight: 0,
      maxUsdgAmount: 0,
      maxLongOpenInterest: 1 * 1000 * 1000,
      maxShortOpenInterest: 1 * 1000 * 1000,
      bufferAmount: 0,
      isStable: false,
      isShortable: true,
    },
    SHIB: {
      name: "SHIB",
      address: "0x4ee5972C4a84e51D72755f99a2273a5232408740",
      decimals: 18,
      priceFeed: {
        pyth: "0xf0d57deca57b3da2fe63a493f4c25925fdfd8edf834b20f93e1f84dbd1504d4a"
      },
      priceDecimals: 8,
      isStrictStable: false,
      minProfitBps: 0,
      tokenWeight: 0,
      maxUsdgAmount: 0,
      maxLongOpenInterest: 1 * 1000 * 1000,
      maxShortOpenInterest: 1 * 1000 * 1000,
      bufferAmount: 0,
      isStable: false,
      isShortable: true,
    },
    BONK: {
      name: "BONK",
      address: "0x456DFE9e9cFB33A4D07707773ee87Cc9FBf5DDd2",
      decimals: 18,
      priceFeed: {
        pyth: "0x72b021217ca3fe68922a19aaf990109cb9d84e9ad004b4d2025ad6f529314419"
      },
      priceDecimals: 8,
      isStrictStable: false,
      minProfitBps: 0,
      tokenWeight: 0,
      maxUsdgAmount: 0,
      maxLongOpenInterest: 1 * 1000 * 1000,
      maxShortOpenInterest: 1 * 1000 * 1000,
      bufferAmount: 0,
      isStable: false,
      isShortable: true,
    },
    FLOKI: {
      name: "FLOKI",
      address: "0xb083E0E5d15Ac0DC5e8E101dd9079766Ba368261",
      decimals: 18,
      priceFeed: {
        pyth: "0x6b1381ce7e874dc5410b197ac8348162c0dd6c0d4c9cd6322672d6c2b1d58293"
      },
      priceDecimals: 8,
      isStrictStable: false,
      minProfitBps: 0,
      tokenWeight: 0,
      maxUsdgAmount: 0,
      maxLongOpenInterest: 1 * 1000 * 1000,
      maxShortOpenInterest: 1 * 1000 * 1000,
      bufferAmount: 0,
      isStable: false,
      isShortable: true,
    },
    ENA: {
      name: "ENA",
      address: "0xF5e47e72c562DEF62926Ef40c9358840ee827241",
      decimals: 18,
      priceFeed: {
        pyth: "0xb7910ba7322db020416fcac28b48c01212fd9cc8fbcbaf7d30477ed8605f6bd4"
      },
      priceDecimals: 8,
      isStrictStable: false,
      minProfitBps: 0,
      tokenWeight: 0,
      maxUsdgAmount: 0,
      maxLongOpenInterest: 1 * 1000 * 1000,
      maxShortOpenInterest: 1 * 1000 * 1000,
      bufferAmount: 0,
      isStable: false,
      isShortable: true,
    },
    LINK: {
      name: "LINK",
      address: "0xe679565507663B983ceA3252fBA92b47F51BEfdF",
      decimals: 18,
      priceFeed: {
        pyth: "0x8ac0c70fff57e9aefdf5edf44b51d62c2d433653cbb2cf5cc06bb115af04d221"
      },
      priceDecimals: 8,
      isStrictStable: false,
      minProfitBps: 0,
      tokenWeight: 0,
      maxUsdgAmount: 0,
      maxLongOpenInterest: 1 * 1000 * 1000,
      maxShortOpenInterest: 1 * 1000 * 1000,
      bufferAmount: 0,
      isStable: false,
      isShortable: true,
    },
    POPCAT: {
      name: "POPCAT",
      address: "0x207C362e0A93bA1A77DC8a59b25183b8873aa6B4",
      decimals: 18,
      priceFeed: {
        pyth: "0xb9312a7ee50e189ef045aa3c7842e099b061bd9bdc99ac645956c3b660dc8cce"
      },
      priceDecimals: 8,
      isStrictStable: false,
      minProfitBps: 0,
      tokenWeight: 0,
      maxUsdgAmount: 0,
      maxLongOpenInterest: 1 * 1000 * 1000,
      maxShortOpenInterest: 1 * 1000 * 1000,
      bufferAmount: 0,
      isStable: false,
      isShortable: true,
    },
    SolvBTC: {
      name: "SolvBTC.core",
      address: "0x9410e8052Bc661041e5cB27fDf7d9e9e842af2aa",
      decimals: 18,
      priceFeed: {
        pyth: "0xf253cf87dc7d5ed5aa14cba5a6e79aee8bcfaef885a0e1b807035a0bbecc36fa"
      },
      priceDecimals: 8,
      isStrictStable: false,
      tokenWeight: 1000,
      minProfitBps: 0,
      maxUsdgAmount: 15 * 1000 * 1000,
      maxLongOpenInterest: 1 * 1000 * 1000,
      maxShortOpenInterest: 1 * 1000 * 1000,
      bufferAmount: 1,
      isStable: false,
      isShortable: true,
    },
    PumpBTC: {
      name: "PumpBTC",
      address: "0x5a2aa871954ebdf89b1547e75d032598356caad5",
      decimals: 8,
      priceFeed: {
        pyth: "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43"
      },
      priceDecimals: 8,
      isStrictStable: false,
      tokenWeight: 1000,
      minProfitBps: 0,
      maxUsdgAmount: 15 * 1000 * 1000,
      maxLongOpenInterest: 1 * 1000 * 1000,
      maxShortOpenInterest: 1 * 1000 * 1000,
      bufferAmount: 1,
      isStable: false,
      isShortable: true,
    },
    nativeToken: {
      address: "0xCA8c6C9Fb34388b8a4C93cD5d4D20f63B5997FBa",
      priceFeed: {
        pyth: "0x9b4503710cc8c53f75c30e6e4fda1a7064680ef2e0ee97acd2e3a7c37b3c830c"
      },
      decimals: 18,
    },
  },
  bsc: {
    btcPriceFeed: { address: "0x264990fbd0A4796A3E3d8E37C4d5F87a3aCa5Ebf" },
    ethPriceFeed: { address: "0x9ef1B8c0E4F7dc8bF5719Ea496883DC6401d5b2e" },
    bnbPriceFeed: { address: "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE" },
    busdPriceFeed: { address: "0xcBb98864Ef56E9042e7d2efef76141f15731B82f" },
    usdcPriceFeed: { address: "0x51597f405303C4377E36123cBc172b13269EA163" },
    usdtPriceFeed: { address: "0xB97Ad0E74fa7d920791E90258A6E2085088b4320" },
    btc: {
      name: "btc",
      address: "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c",
      decimals: 18,
      priceFeed: "0x264990fbd0A4796A3E3d8E37C4d5F87a3aCa5Ebf",
      priceDecimals: 8,
      isStrictStable: false,
    },
    eth: {
      name: "eth",
      address: "0x2170ed0880ac9a755fd29b2688956bd959f933f8",
      decimals: 18,
      priceFeed: "0x9ef1B8c0E4F7dc8bF5719Ea496883DC6401d5b2e",
      priceDecimals: 8,
      isStrictStable: false,
    },
    bnb: {
      name: "bnb",
      address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
      decimals: 18,
      priceFeed: "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE",
      priceDecimals: 8,
      isStrictStable: false,
    },
    busd: {
      name: "busd",
      address: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
      decimals: 18,
      priceFeed: "0xcBb98864Ef56E9042e7d2efef76141f15731B82f",
      priceDecimals: 8,
      isStrictStable: true,
    },
    usdc: {
      name: "usdc",
      address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
      decimals: 18,
      priceFeed: "0x51597f405303C4377E36123cBc172b13269EA163",
      priceDecimals: 8,
      isStrictStable: true,
    },
    usdt: {
      name: "usdt",
      address: "0x55d398326f99059fF775485246999027B3197955",
      decimals: 18,
      priceFeed: "0xB97Ad0E74fa7d920791E90258A6E2085088b4320",
      priceDecimals: 8,
      isStrictStable: true,
    },
    nativeToken: {
      address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
      decimals: 18,
    },
  },
  testnet: {
    btcPriceFeed: { address: "0x5741306c21795FdCBb9b265Ea0255F499DFe515C" },
    ethPriceFeed: { address: "0x143db3CEEfbdfe5631aDD3E50f7614B6ba708BA7" },
    bnbPriceFeed: { address: "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526" },
    busdPriceFeed: { address: "0x8F460c4F4Fa9F87AeA4f29B4Ee91d1b8e97163BA" },
    usdcPriceFeed: { address: " 0x90c069C4538adAc136E051052E14c1cD799C41B7" },
    usdtPriceFeed: { address: "0xEca2605f0BCF2BA5966372C99837b1F182d3D620" },
    btc: {
      address: "0xb19C12715134bee7c4b1Ca593ee9E430dABe7b56",
      decimals: 18,
    },
    eth: {
      address: "0x1958f7C067226c7C8Ac310Dc994D0cebAbfb2B02",
      decimals: 18,
    },
    bnb: {
      address: "0x612777Eea37a44F7a95E3B101C39e1E2695fa6C2",
      decimals: 18,
    },
    busd: {
      address: "0x3F223C4E5ac67099CB695834b20cCd5E5D5AA9Ef",
      decimals: 18,
    },
    usdc: {
      address: "0x9780881bf45b83ee028c4c1de7e0c168df8e9eef",
      decimals: 18,
    },
    usdt: {
      address: "0x337610d27c682e347c9cd60bd4b3b107c9d34ddd",
      decimals: 18,
    },
    nativeToken: {
      address: "0x612777Eea37a44F7a95E3B101C39e1E2695fa6C2",
      decimals: 18,
    },
  },
  arbitrumTestnet: {
    // https://docs.chain.link/docs/arbitrum-price-feeds/
    btcPriceFeed: { address: "0x0c9973e7a27d00e656B9f153348dA46CaD70d03d" },
    ethPriceFeed: { address: "0x5f0423B1a6935dc5596e7A24d98532b67A0AeFd8" },
    usdtPriceFeed: { address: "0xb1Ac85E779d05C2901812d812210F6dE144b2df0" },
    usdcPriceFeed: { address: "0xb1Ac85E779d05C2901812d812210F6dE144b2df0" }, // this is USDT price feed, chainlink doesn't have one for USDC
    btc: {
      address: "0xab952e6801daB7920B65b8aC918FF0F66a8a0F44",
      decimals: 18,
    },
    eth: {
      address: "0xB47e6A5f8b33b3F17603C83a0535A9dcD7E32681",
      decimals: 18,
    },
    usdc: {
      address: "0xb93cb5F5c6a56e060A5e5A9691229D2a7e2D234A",
      decimals: 18,
    },
    usdt: {
      address: "0xaB7ee1A7D5bc677e3A7ac694f2c156b3fFCaABC1",
      decimals: 18,
    },
    nativeToken: {
      address: "0xB47e6A5f8b33b3F17603C83a0535A9dcD7E32681",
      decimals: 18,
    },
  },
  arbitrum: {
    btc: {
      name: "btc",
      address: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
      decimals: 8,
      priceFeed: "0x6ce185860a4963106506C203335A2910413708e9",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.1 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 21000,
      minProfitBps: 0,
      maxUsdgAmount: 20 * 1000 * 1000,
      bufferAmount: 150,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 36 * 1000 * 1000,
      maxGlobalShortSize: 20 * 1000 * 1000,
      openInterestLimitLong: 20 * 1000 * 1000,
      openInterestLimitShort: 10 * 1000 * 1000,
      maxOpenInterestLong: 20 * 1000 * 1000,
      maxOpenInterestShort: 10 * 1000 * 1000,
      openInterestIncrementLong: 50 * 1000,
      openInterestIncrementShort: 75 * 1000,
      maxLiquidityThresholdLong: 8 * 1000 * 1000,
      maxLiquidityThresholdShort: 5 * 1000 * 1000,
      minLiquidityThresholdLong: 5 * 1000 * 1000,
      minLiquidityThresholdShort: 3 * 1000 * 1000,
    },
    eth: {
      name: "eth",
      address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
      decimals: 18,
      priceFeed: "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.1 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 25000,
      minProfitBps: 0,
      maxUsdgAmount: 28 * 1000 * 1000,
      bufferAmount: 5000,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 88 * 1000 * 1000,
      maxGlobalShortSize: 40 * 1000 * 1000,
      openInterestLimitLong: 20 * 1000 * 1000,
      openInterestLimitShort: 10 * 1000 * 1000,
      maxOpenInterestLong: 20 * 1000 * 1000,
      maxOpenInterestShort: 10 * 1000 * 1000,
      openInterestIncrementLong: 50 * 1000,
      openInterestIncrementShort: 75 * 1000,
      maxLiquidityThresholdLong: 8 * 1000 * 1000,
      maxLiquidityThresholdShort: 5 * 1000 * 1000,
      minLiquidityThresholdLong: 5 * 1000 * 1000,
      minLiquidityThresholdShort: 3 * 1000 * 1000,
    },
    usdce: {
      name: "usdce",
      address: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
      decimals: 6,
      priceFeed: "0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3",
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 8500,
      minProfitBps: 0,
      maxUsdgAmount: 10 * 1000 * 1000,
      bufferAmount: 3 * 1000 * 1000,
      isStable: true,
      isShortable: false,
    },
    usdc: {
      name: "usdc",
      address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
      decimals: 6,
      priceFeed: "0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3",
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 33500,
      minProfitBps: 0,
      maxUsdgAmount: 30 * 1000 * 1000,
      bufferAmount: 15 * 1000 * 1000,
      isStable: true,
      isShortable: false,
    },
    link: {
      name: "link",
      address: "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4",
      decimals: 18,
      priceFeed: "0x86E53CF1B870786351Da77A57575e79CB55812CB",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.1 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 1000,
      minProfitBps: 0,
      maxUsdgAmount: 3.2 * 1000 * 1000,
      bufferAmount: 50_000,
      isStable: false,
      isShortable: true,
      spreadBasisPoints: 0,
      maxGlobalShortSize: 500 * 1000,
      maxGlobalLongSize: 500 * 1000,
      openInterestLimitLong: 500 * 1000,
      openInterestLimitShort: 500 * 1000,
      maxOpenInterestLong: 500 * 1000,
      maxOpenInterestShort: 500 * 1000,
      openInterestIncrementLong: 25 * 1000,
      openInterestIncrementShort: 25 * 1000,
      maxLiquidityThresholdLong: 250 * 1000,
      maxLiquidityThresholdShort: 250 * 1000,
      minLiquidityThresholdLong: 50 * 1000,
      minLiquidityThresholdShort: 50 * 1000,
    },
    uni: {
      name: "uni",
      address: "0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0",
      decimals: 18,
      priceFeed: "0x9C917083fDb403ab5ADbEC26Ee294f6EcAda2720",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.1 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 1000,
      minProfitBps: 0,
      maxUsdgAmount: 4 * 1000 * 1000,
      bufferAmount: 200_000,
      isStable: false,
      isShortable: true,
      spreadBasisPoints: 0,
      maxGlobalShortSize: 500 * 1000,
      maxGlobalLongSize: 500 * 1000,
      openInterestLimitLong: 500 * 1000,
      openInterestLimitShort: 500 * 1000,
      maxOpenInterestLong: 500 * 1000,
      maxOpenInterestShort: 500 * 1000,
      openInterestIncrementLong: 25 * 1000,
      openInterestIncrementShort: 25 * 1000,
      maxLiquidityThresholdLong: 250 * 1000,
      maxLiquidityThresholdShort: 250 * 1000,
      minLiquidityThresholdLong: 50 * 1000,
      minLiquidityThresholdShort: 50 * 1000,
    },
    usdt: {
      name: "usdt",
      address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
      decimals: 6,
      priceFeed: "0x3f3f5dF88dC9F13eac63DF89EC16ef6e7E25DdE7",
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 5000,
      minProfitBps: 0,
      maxUsdgAmount: 10 * 1000 * 1000,
      bufferAmount: 4 * 1000 * 1000,
      isStable: true,
      isShortable: false,
    },
    mim: {
      name: "mim",
      address: "0xFEa7a6a0B346362BF88A9e4A88416B77a57D6c2A",
      decimals: 18,
      priceFeed: "0x87121F6c9A9F6E90E59591E4Cf4804873f54A95b",
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 1,
      minProfitBps: 0,
      maxUsdgAmount: 1,
      bufferAmount: 0,
      isStable: true,
      isShortable: false,
    },
    frax: {
      name: "frax",
      address: "0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F",
      decimals: 18,
      priceFeed: "0x0809E3d38d1B4214958faf06D8b1B1a2b73f2ab8",
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 2000,
      minProfitBps: 0,
      maxUsdgAmount: 12 * 1000 * 1000,
      bufferAmount: 10 * 1000 * 1000,
      isStable: true,
      isShortable: false,
    },
    dai: {
      name: "dai",
      address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
      decimals: 18,
      priceFeed: "0xc5C8E77B397E531B8EC06BFb0048328B30E9eCfB",
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 3000,
      minProfitBps: 0,
      maxUsdgAmount: 6 * 1000 * 1000,
      bufferAmount: 3 * 1000 * 1000,
      isStable: true,
      isShortable: false,
    },
    nativeToken: {
      name: "weth",
      address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
      decimals: 18,
    },
  },
  avax: {
    avax: {
      name: "avax",
      address: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
      decimals: 18,
      priceFeed: "0x0A77230d17318075983913bC2145DB16C7366156",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.1 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 10_000,
      minProfitBps: 0,
      maxUsdgAmount: 5.5 * 1000 * 1000,
      bufferAmount: 30_000,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 1.5 * 1000 * 1000,
      maxGlobalShortSize: 0.8 * 1000 * 1000,
      spreadBasisPoints: 0,
      openInterestLimitLong: 2 * 1000 * 1000,
      openInterestLimitShort: 2 * 1000 * 1000,
      maxOpenInterestLong: 1.5 * 1000 * 1000,
      maxOpenInterestShort: 1.5 * 1000 * 1000,
      openInterestIncrementLong: 10 * 1000,
      openInterestIncrementShort: 10 * 1000,
      maxLiquidityThresholdLong: 200 * 1000,
      maxLiquidityThresholdShort: 200 * 1000,
      minLiquidityThresholdLong: 100 * 1000,
      minLiquidityThresholdShort: 100 * 1000,
    },
    eth: {
      name: "eth",
      address: "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB",
      decimals: 18,
      priceFeed: "0x976B3D034E162d8bD72D6b9C989d545b839003b0",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.1 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 20_000,
      minProfitBps: 0,
      maxUsdgAmount: 10 * 1000 * 1000,
      bufferAmount: 1000,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 8 * 1000 * 1000,
      maxGlobalShortSize: 5.3 * 1000 * 1000,
      openInterestLimitLong: 20 * 1000 * 1000,
      openInterestLimitShort: 20 * 1000 * 1000,
      maxOpenInterestLong: 20 * 1000 * 1000,
      maxOpenInterestShort: 15 * 1000 * 1000,
      openInterestIncrementLong: 50 * 1000,
      openInterestIncrementShort: 25 * 1000,
      maxLiquidityThresholdLong: 5 * 1000 * 1000,
      maxLiquidityThresholdShort: 5 * 1000 * 1000,
      minLiquidityThresholdLong: 2 * 1000 * 1000,
      minLiquidityThresholdShort: 1.5 * 1000 * 1000,
    },
    btcb: {
      name: "btcb",
      address: "0x152b9d0FdC40C096757F570A51E494bd4b943E50",
      decimals: 8,
      priceFeed: "0x2779D32d5166BAaa2B2b658333bA7e6Ec0C65743",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.1 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 20000,
      minProfitBps: 0,
      maxUsdgAmount: 13 * 1000 * 1000,
      bufferAmount: 80,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 8 * 1000 * 1000,
      maxGlobalShortSize: 5.4 * 1000 * 1000,
      openInterestLimitLong: 20 * 1000 * 1000,
      openInterestLimitShort: 20 * 1000 * 1000,
      maxOpenInterestLong: 20 * 1000 * 1000,
      maxOpenInterestShort: 12 * 1000 * 1000,
      openInterestIncrementLong: 50 * 1000,
      openInterestIncrementShort: 25 * 1000,
      maxLiquidityThresholdLong: 5 * 1000 * 1000,
      maxLiquidityThresholdShort: 5 * 1000 * 1000,
      minLiquidityThresholdLong: 2 * 1000 * 1000,
      minLiquidityThresholdShort: 1.5 * 1000 * 1000,
    },
    btc: {
      name: "btc",
      address: "0x50b7545627a5162F82A992c33b87aDc75187B218",
      decimals: 8,
      priceFeed: "0x2779D32d5166BAaa2B2b658333bA7e6Ec0C65743",
      priceDecimals: 8,
      fastPricePrecision: 1000,
      maxCumulativeDeltaDiff: 0.1 * 10 * 1000 * 1000, // 10%
      isStrictStable: false,
      tokenWeight: 3000,
      minProfitBps: 0,
      maxUsdgAmount: 2 * 1000 * 1000,
      bufferAmount: 10,
      isStable: false,
      isShortable: true,
      maxGlobalLongSize: 630 * 1000,
      maxGlobalShortSize: 0,
      openInterestLimitLong: 20 * 1000 * 1000,
      openInterestLimitShort: 1000,
      maxOpenInterestLong: 10 * 1000 * 1000,
      maxOpenInterestShort: 1000,
      openInterestIncrementLong: 200 * 1000,
      openInterestIncrementShort: 10,
      maxLiquidityThresholdLong: 5 * 1000 * 1000,
      maxLiquidityThresholdShort: 500,
      minLiquidityThresholdLong: 250 * 1000,
      minLiquidityThresholdShort: 10,
    },
    mim: {
      name: "mim",
      address: "0x130966628846BFd36ff31a822705796e8cb8C18D",
      decimals: 18,
      priceFeed: "0x54EdAB30a7134A16a54218AE64C73e1DAf48a8Fb",
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 1,
      minProfitBps: 0,
      maxUsdgAmount: 1,
      bufferAmount: 0,
      isStable: true,
      isShortable: false,
    },
    usdc: {
      name: "usdc",
      address: "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
      decimals: 6,
      priceFeed: "0xF096872672F44d6EBA71458D74fe67F9a77a23B9",
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 46_000,
      minProfitBps: 0,
      maxUsdgAmount: 22.5 * 1000 * 1000,
      bufferAmount: 9 * 1000 * 1000,
      isStable: true,
      isShortable: false,
    },
    usdce: {
      name: "usdce",
      address: "0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664",
      decimals: 6,
      priceFeed: "0xF096872672F44d6EBA71458D74fe67F9a77a23B9",
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 1000,
      minProfitBps: 0,
      maxUsdgAmount: 1000 * 1000,
      bufferAmount: 100 * 1000,
      isStable: true,
      isShortable: false,
    },
    nativeToken: {
      name: "wavax",
      address: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
      decimals: 18,
    },
  },
};