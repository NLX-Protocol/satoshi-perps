// price feeds https://docs.chain.link/docs/binance-smart-chain-addresses/
const { expandDecimals } = require("../../test/shared/utilities");

module.exports = {
  "core-testnet": {
    btcPriceFeed: { address: "0x1BF924E71cED920387E7f0E0C545cB969a1f805b" },
    corePriceFeed: { address: "0x1BF924E71cED920387E7f0E0C545cB969a1f805b" },

    // -------------------- USDT, USDC, USDE --------------------
    usdt: {
      name: "usdt",
      address: "0xe297A83fbB19d7884E5B96047113e256C5b266EB",
      decimals: 6,
      priceFeed: { 
        apro: "0x16abbf7f777236374A82398534B8aAFcCACDb921", 
        pyth: "0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b"
       },
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 1000,
      minProfitBps: 0,
      maxUsdgAmount: 5 * 1000 * 1000,
      bufferAmount: 1000,
      isStable: true,
      isShortable: true,
    },
    usdc: {
      name: "usdc",
      address: "0x076027C99628cf7e142f506627125De31561764f",
      decimals: 6,
      priceFeed: { 
        apro: "0x16abbf7f777236374A82398534B8aAFcCACDb921", 
        pyth: "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a"
       },
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 1000,
      minProfitBps: 0,
      maxUsdgAmount: 5 * 1000 * 1000,
      bufferAmount: 1000,
      isStable: true,
      isShortable: true,
    },
    usde: {
      name: "usde",
      address: "0x73A2b01bE81Eb0A753bEF9480E8CE013019ae366",
      decimals: 6,
      priceFeed: { 
        apro: "0x16abbf7f777236374A82398534B8aAFcCACDb921", 
        pyth: "0x6ec879b1e9963de5ee97e9c8710b742d6228252a5e2ca12d4ae81d7fe5ee8c5d"
       },
      priceDecimals: 8,
      isStrictStable: true,
      tokenWeight: 1000,
      minProfitBps: 0,
      maxUsdgAmount: 5 * 1000 * 1000,
      bufferAmount: 1000,
      isStable: true,
      isShortable: true,
    },

    // -------------------- aBTC, solvBTC, coreBTC --------------------
    aBTC: {
      name: "aBTC",
      address: "0x9D14040c235ff8a8B59d9C4deE7dcdb49B515EC8",
      decimals: 18,
      priceFeed: { 
        apro: "0x1BF924E71cED920387E7f0E0C545cB969a1f805b", 
        pyth: "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43"
       },
      priceDecimals: 8,
      isStrictStable: false,
      tokenWeight: 1000,
      minProfitBps: 0,
      maxUsdgAmount: 5 * 1000 * 1000,
      bufferAmount: 1,
      isStable: false,
      isShortable: true,
    },
    solvBTC: {
      name: "solvBTC",
      address: "0xef317386be450E6Cb6e191E38B819508c4D5e820",
      decimals: 18,
      priceFeed: { 
        apro: "0x1BF924E71cED920387E7f0E0C545cB969a1f805b", 
        pyth: "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43"
       },
      priceDecimals: 8,
      isStrictStable: false,
      tokenWeight: 1000,
      minProfitBps: 0,
      maxUsdgAmount: 5 * 1000 * 1000,
      bufferAmount: 1,
      isStable: false,
      isShortable: true,
    },
    coreBTC: {
      name: "coreBTC",
      address: "0xE8E8371405538DAb7BA7f063eD16C00CeE026468",
      decimals: 8,
      priceFeed: { 
        apro: "0x1BF924E71cED920387E7f0E0C545cB969a1f805b", 
        pyth: "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43"
       },
      priceDecimals: 8,
      isStrictStable: false,
      tokenWeight: 1000,
      minProfitBps: 0,
      maxUsdgAmount: 15 * 1000 * 1000,
      bufferAmount: 1,
      isStable: false,
      isShortable: true,
    },

    core: {
      name: "core",
      address: "0x0B4501d4e506956c648908F306717608f7625831",
      decimals: 18,
      priceFeed: { 
        apro: "0x485C4e2efB14a5f601B0401a8464129FB2f9502b", 
        pyth: "0x9b4503710cc8c53f75c30e6e4fda1a7064680ef2e0ee97acd2e3a7c37b3c830c"
       },
      priceDecimals: 8,
      isStrictStable: false,
      tokenWeight: 1000,
      minProfitBps: 0,
      maxUsdgAmount: 10 * 1000 * 1000,
      bufferAmount: 1000,
      isStable: false,
      isShortable: true,
    },
    nativeToken: {
      address: "0x0B4501d4e506956c648908F306717608f7625831",
      priceFeed: { 
        apro: "0x485C4e2efB14a5f601B0401a8464129FB2f9502b", 
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
