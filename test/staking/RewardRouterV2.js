const { expect, use } = require("chai")
const { solidity } = require("ethereum-waffle")
const { deployContract } = require("../shared/fixtures")
const { expandDecimals, getBlockTime, increaseTime, mineBlock, reportGasUsed, print, newWallet } = require("../shared/utilities")
const { toChainlinkPrice } = require("../shared/chainlink")
const { toUsd, toNormalizedPrice } = require("../shared/units")
const { initVault, getBnbConfig, getBtcConfig, getDaiConfig } = require("../core/Vault/helpers")

use(solidity)

describe("RewardRouterV2", function () {
  const provider = waffle.provider
  const [wallet, user0, user1, user2, user3, user4, tokenManager] = provider.getWallets()

  const vestingDuration = 365 * 24 * 60 * 60

  let timelock

  let vault
  let nlpManager
  let nlp
  let usdg
  let router
  let vaultPriceFeed
  let bnb
  let bnbPriceFeed
  let btc
  let btcPriceFeed
  let eth
  let ethPriceFeed
  let dai
  let daiPriceFeed
  let busd
  let busdPriceFeed

  let gmx
  let esGmx
  let bnGmx

  let stakedGmxTracker
  let stakedGmxDistributor
  let bonusGmxTracker
  let bonusGmxDistributor
  let feeGmxTracker
  let feeGmxDistributor

  let feeNlpTracker
  let feeNlpDistributor
  let stakedNlpTracker
  let stakedNlpDistributor

  let gmxVester
  let nlpVester

  let govToken

  let rewardRouter

  beforeEach(async () => {
    bnb = await deployContract("Token", [])
    bnbPriceFeed = await deployContract("PriceFeed", [])

    btc = await deployContract("Token", [])
    btcPriceFeed = await deployContract("PriceFeed", [])

    eth = await deployContract("Token", [])
    ethPriceFeed = await deployContract("PriceFeed", [])

    dai = await deployContract("Token", [])
    daiPriceFeed = await deployContract("PriceFeed", [])

    busd = await deployContract("Token", [])
    busdPriceFeed = await deployContract("PriceFeed", [])

    vault = await deployContract("Vault", [])
    usdg = await deployContract("USDG", [vault.address])
    router = await deployContract("Router", [vault.address, usdg.address, bnb.address])
    vaultPriceFeed = await deployContract("VaultPriceFeed", [])
    nlp = await deployContract("NLP", [])

    await initVault(vault, router, usdg, vaultPriceFeed)
    nlpManager = await deployContract("NlpManager", [vault.address, usdg.address, nlp.address, ethers.constants.AddressZero, 24 * 60 * 60])

    timelock = await deployContract("Timelock", [
      wallet.address, // _admin
      10, // _buffer
      tokenManager.address, // _tokenManager
      tokenManager.address, // _mintReceiver
      nlpManager.address, // _nlpManager
      nlpManager.address, // _prevNlpManager
      user0.address, // _rewardRouter
      expandDecimals(1000000, 18), // _maxTokenSupply
      10, // marginFeeBasisPoints
      100 // maxMarginFeeBasisPoints
    ])

    await vaultPriceFeed.setTokenConfig(bnb.address, bnbPriceFeed.address, 8, false)
    await vaultPriceFeed.setTokenConfig(btc.address, btcPriceFeed.address, 8, false)
    await vaultPriceFeed.setTokenConfig(eth.address, ethPriceFeed.address, 8, false)
    await vaultPriceFeed.setTokenConfig(dai.address, daiPriceFeed.address, 8, false)

    await daiPriceFeed.setLatestAnswer(toChainlinkPrice(1))
    await vault.setTokenConfig(...getDaiConfig(dai, daiPriceFeed))

    await btcPriceFeed.setLatestAnswer(toChainlinkPrice(60000))
    await vault.setTokenConfig(...getBtcConfig(btc, btcPriceFeed))

    await bnbPriceFeed.setLatestAnswer(toChainlinkPrice(300))
    await vault.setTokenConfig(...getBnbConfig(bnb, bnbPriceFeed))

    await nlp.setInPrivateTransferMode(true)
    await nlp.setMinter(nlpManager.address, true)
    await nlpManager.setInPrivateMode(true)

    gmx = await deployContract("GMX", []);
    esGmx = await deployContract("EsGMX", []);
    bnGmx = await deployContract("MintableBaseToken", ["Bonus GMX", "bnGMX", 0]);

    // GMX
    stakedGmxTracker = await deployContract("RewardTracker", ["Staked GMX", "sGMX"])
    stakedGmxDistributor = await deployContract("RewardDistributor", [esGmx.address, stakedGmxTracker.address])
    await stakedGmxTracker.initialize([gmx.address, esGmx.address], stakedGmxDistributor.address)
    await stakedGmxDistributor.updateLastDistributionTime()

    bonusGmxTracker = await deployContract("RewardTracker", ["Staked + Bonus GMX", "sbGMX"])
    bonusGmxDistributor = await deployContract("BonusDistributor", [bnGmx.address, bonusGmxTracker.address])
    await bonusGmxTracker.initialize([stakedGmxTracker.address], bonusGmxDistributor.address)
    await bonusGmxDistributor.updateLastDistributionTime()

    feeGmxTracker = await deployContract("RewardTracker", ["Staked + Bonus + Fee GMX", "sbfGMX"])
    feeGmxDistributor = await deployContract("RewardDistributor", [eth.address, feeGmxTracker.address])
    await feeGmxTracker.initialize([bonusGmxTracker.address, bnGmx.address], feeGmxDistributor.address)
    await feeGmxDistributor.updateLastDistributionTime()

    // NLP
    feeNlpTracker = await deployContract("RewardTracker", ["Fee NLP", "fNLP"])
    feeNlpDistributor = await deployContract("RewardDistributor", [eth.address, feeNlpTracker.address])
    await feeNlpTracker.initialize([nlp.address], feeNlpDistributor.address)
    await feeNlpDistributor.updateLastDistributionTime()

    stakedNlpTracker = await deployContract("RewardTracker", ["Fee + Staked NLP", "fsNLP"])
    stakedNlpDistributor = await deployContract("RewardDistributor", [esGmx.address, stakedNlpTracker.address])
    await stakedNlpTracker.initialize([feeNlpTracker.address], stakedNlpDistributor.address)
    await stakedNlpDistributor.updateLastDistributionTime()

    gmxVester = await deployContract("Vester", [
      "Vested GMX", // _name
      "vGMX", // _symbol
      vestingDuration, // _vestingDuration
      esGmx.address, // _esToken
      feeGmxTracker.address, // _pairToken
      gmx.address, // _claimableToken
      stakedGmxTracker.address, // _rewardTracker
    ])

    nlpVester = await deployContract("Vester", [
      "Vested NLP", // _name
      "vNLP", // _symbol
      vestingDuration, // _vestingDuration
      esGmx.address, // _esToken
      stakedNlpTracker.address, // _pairToken
      gmx.address, // _claimableToken
      stakedNlpTracker.address, // _rewardTracker
    ])

    await stakedGmxTracker.setInPrivateTransferMode(true)
    await stakedGmxTracker.setInPrivateStakingMode(true)
    await bonusGmxTracker.setInPrivateTransferMode(true)
    await bonusGmxTracker.setInPrivateStakingMode(true)
    await bonusGmxTracker.setInPrivateClaimingMode(true)
    await feeGmxTracker.setInPrivateTransferMode(true)
    await feeGmxTracker.setInPrivateStakingMode(true)

    await feeNlpTracker.setInPrivateTransferMode(true)
    await feeNlpTracker.setInPrivateStakingMode(true)
    await stakedNlpTracker.setInPrivateTransferMode(true)
    await stakedNlpTracker.setInPrivateStakingMode(true)

    await esGmx.setInPrivateTransferMode(true)
    await bnGmx.setInPrivateTransferMode(true)

    govToken = await deployContract("MintableBaseToken", ["GOV", "GOV", 0])

    rewardRouter = await deployContract("RewardRouterV2", [])
    await rewardRouter.initialize(
      bnb.address,
      gmx.address,
      esGmx.address,
      bnGmx.address,
      nlp.address,
      stakedGmxTracker.address,
      bonusGmxTracker.address,
      feeGmxTracker.address,
      feeNlpTracker.address,
      stakedNlpTracker.address,
      nlpManager.address,
      gmxVester.address,
      nlpVester.address,
      govToken.address
    )

    // allow bonusGmxTracker to stake stakedGmxTracker
    await stakedGmxTracker.setHandler(bonusGmxTracker.address, true)
    // allow bonusGmxTracker to stake feeGmxTracker
    await bonusGmxTracker.setHandler(feeGmxTracker.address, true)
    await bonusGmxDistributor.setBonusMultiplier(10000)
    // allow feeGmxTracker to stake bnGmx
    await bnGmx.setHandler(feeGmxTracker.address, true)

    // allow stakedNlpTracker to stake feeNlpTracker
    await feeNlpTracker.setHandler(stakedNlpTracker.address, true)
    // allow feeNlpTracker to stake Nlp
    await nlp.setHandler(feeNlpTracker.address, true)

    // mint esGmx for distributors
    await esGmx.setMinter(wallet.address, true)
    await esGmx.mint(stakedGmxDistributor.address, expandDecimals(50000, 18))
    await stakedGmxDistributor.setTokensPerInterval("20667989410000000") // 0.02066798941 esGmx per second
    await esGmx.mint(stakedNlpDistributor.address, expandDecimals(50000, 18))
    await stakedNlpDistributor.setTokensPerInterval("20667989410000000") // 0.02066798941 esGmx per second

    // mint bnGmx for distributor
    await bnGmx.setMinter(wallet.address, true)
    await bnGmx.mint(bonusGmxDistributor.address, expandDecimals(1500, 18))

    await esGmx.setHandler(tokenManager.address, true)
    await gmxVester.setHandler(wallet.address, true)

    await esGmx.setHandler(rewardRouter.address, true)
    await esGmx.setHandler(stakedGmxDistributor.address, true)
    await esGmx.setHandler(stakedNlpDistributor.address, true)
    await esGmx.setHandler(stakedGmxTracker.address, true)
    await esGmx.setHandler(stakedNlpTracker.address, true)
    await esGmx.setHandler(gmxVester.address, true)
    await esGmx.setHandler(nlpVester.address, true)

    await bnGmx.setHandler(bonusGmxDistributor.address, true)
    await bnGmx.setHandler(bonusGmxTracker.address, true)

    await nlpManager.setHandler(rewardRouter.address, true)
    await stakedGmxTracker.setHandler(rewardRouter.address, true)
    await bonusGmxTracker.setHandler(rewardRouter.address, true)
    await feeGmxTracker.setHandler(rewardRouter.address, true)
    await feeNlpTracker.setHandler(rewardRouter.address, true)
    await stakedNlpTracker.setHandler(rewardRouter.address, true)

    await bnGmx.setMinter(rewardRouter.address, true)
    await esGmx.setMinter(gmxVester.address, true)
    await esGmx.setMinter(nlpVester.address, true)

    await gmxVester.setHandler(rewardRouter.address, true)
    await nlpVester.setHandler(rewardRouter.address, true)

    await feeGmxTracker.setHandler(gmxVester.address, true)
    await stakedNlpTracker.setHandler(nlpVester.address, true)

    await nlpManager.setGov(timelock.address)
    await stakedGmxTracker.setGov(timelock.address)
    await bonusGmxTracker.setGov(timelock.address)
    await feeGmxTracker.setGov(timelock.address)
    await feeNlpTracker.setGov(timelock.address)
    await stakedNlpTracker.setGov(timelock.address)
    await stakedGmxDistributor.setGov(timelock.address)
    await stakedNlpDistributor.setGov(timelock.address)
    await esGmx.setGov(timelock.address)
    await bnGmx.setGov(timelock.address)
    await gmxVester.setGov(timelock.address)
    await nlpVester.setGov(timelock.address)

    await rewardRouter.setMaxBoostBasisPoints(20_000)
  })

  it("inits", async () => {
    expect(await rewardRouter.isInitialized()).eq(true)

    expect(await rewardRouter.weth()).eq(bnb.address)
    expect(await rewardRouter.gmx()).eq(gmx.address)
    expect(await rewardRouter.esGmx()).eq(esGmx.address)
    expect(await rewardRouter.bnGmx()).eq(bnGmx.address)

    expect(await rewardRouter.nlp()).eq(nlp.address)

    expect(await rewardRouter.stakedGmxTracker()).eq(stakedGmxTracker.address)
    expect(await rewardRouter.bonusGmxTracker()).eq(bonusGmxTracker.address)
    expect(await rewardRouter.feeGmxTracker()).eq(feeGmxTracker.address)

    expect(await rewardRouter.feeNlpTracker()).eq(feeNlpTracker.address)
    expect(await rewardRouter.stakedNlpTracker()).eq(stakedNlpTracker.address)

    expect(await rewardRouter.nlpManager()).eq(nlpManager.address)

    expect(await rewardRouter.gmxVester()).eq(gmxVester.address)
    expect(await rewardRouter.nlpVester()).eq(nlpVester.address)

    await expect(rewardRouter.initialize(
      bnb.address,
      gmx.address,
      esGmx.address,
      bnGmx.address,
      nlp.address,
      stakedGmxTracker.address,
      bonusGmxTracker.address,
      feeGmxTracker.address,
      feeNlpTracker.address,
      stakedNlpTracker.address,
      nlpManager.address,
      gmxVester.address,
      nlpVester.address,
      govToken.address
    )).to.be.revertedWith("already initialized")
  })

  it("setMaxBoostBasisPoints", async () => {
    expect(await rewardRouter.maxBoostBasisPoints()).eq(20_000)
    await expect(rewardRouter.connect(user0).setMaxBoostBasisPoints(50_000))
      .to.be.revertedWith("Governable: forbidden")

    await rewardRouter.connect(wallet).setMaxBoostBasisPoints(50_000)
    expect(await rewardRouter.maxBoostBasisPoints()).eq(50_000)
  })

  it("setInStrictTransferMode", async () => {
    expect(await rewardRouter.inStrictTransferMode()).eq(false)
    await expect(rewardRouter.connect(user0).setInStrictTransferMode(true))
      .to.be.revertedWith("Governable: forbidden")

    await rewardRouter.connect(wallet).setInStrictTransferMode(true)
    expect(await rewardRouter.inStrictTransferMode()).eq(true)
  })

  it("setVotingPowerType", async () => {
    expect(await rewardRouter.votingPowerType()).eq(0)
    await expect(rewardRouter.connect(user0).setVotingPowerType(2))
      .to.be.revertedWith("Governable: forbidden")

    await rewardRouter.connect(wallet).setVotingPowerType(2)
    expect(await rewardRouter.votingPowerType()).eq(2)
  })

  it("stakeGmxForAccount, stakeGmx, stakeEsGmx, unstakeGmx, unstakeEsGmx, claimEsGmx, claimFees, compound, batchCompoundForAccounts", async () => {
    await eth.mint(feeGmxDistributor.address, expandDecimals(100, 18))
    await feeGmxDistributor.setTokensPerInterval("41335970000000") // 0.00004133597 ETH per second

    await gmx.setMinter(wallet.address, true)
    await gmx.mint(user0.address, expandDecimals(1500, 18))
    expect(await gmx.balanceOf(user0.address)).eq(expandDecimals(1500, 18))

    await gmx.connect(user0).approve(stakedGmxTracker.address, expandDecimals(1000, 18))
    await expect(rewardRouter.connect(user0).stakeGmxForAccount(user1.address, expandDecimals(1000, 18)))
      .to.be.revertedWith("Governable: forbidden")

    await rewardRouter.setGov(user0.address)
    await rewardRouter.connect(user0).stakeGmxForAccount(user1.address, expandDecimals(800, 18))
    expect(await gmx.balanceOf(user0.address)).eq(expandDecimals(700, 18))

    await gmx.mint(user1.address, expandDecimals(200, 18))
    expect(await gmx.balanceOf(user1.address)).eq(expandDecimals(200, 18))
    await gmx.connect(user1).approve(stakedGmxTracker.address, expandDecimals(200, 18))
    await rewardRouter.connect(user1).stakeGmx(expandDecimals(200, 18))
    expect(await gmx.balanceOf(user1.address)).eq(0)

    expect(await stakedGmxTracker.stakedAmounts(user0.address)).eq(0)
    expect(await stakedGmxTracker.depositBalances(user0.address, gmx.address)).eq(0)
    expect(await stakedGmxTracker.stakedAmounts(user1.address)).eq(expandDecimals(1000, 18))
    expect(await stakedGmxTracker.depositBalances(user1.address, gmx.address)).eq(expandDecimals(1000, 18))

    expect(await bonusGmxTracker.stakedAmounts(user0.address)).eq(0)
    expect(await bonusGmxTracker.depositBalances(user0.address, stakedGmxTracker.address)).eq(0)
    expect(await bonusGmxTracker.stakedAmounts(user1.address)).eq(expandDecimals(1000, 18))
    expect(await bonusGmxTracker.depositBalances(user1.address, stakedGmxTracker.address)).eq(expandDecimals(1000, 18))

    expect(await feeGmxTracker.stakedAmounts(user0.address)).eq(0)
    expect(await feeGmxTracker.depositBalances(user0.address, bonusGmxTracker.address)).eq(0)
    expect(await feeGmxTracker.stakedAmounts(user1.address)).eq(expandDecimals(1000, 18))
    expect(await feeGmxTracker.depositBalances(user1.address, bonusGmxTracker.address)).eq(expandDecimals(1000, 18))

    await increaseTime(provider, 24 * 60 * 60)
    await mineBlock(provider)

    expect(await stakedGmxTracker.claimable(user0.address)).eq(0)
    expect(await stakedGmxTracker.claimable(user1.address)).gt(expandDecimals(1785, 18)) // 50000 / 28 => ~1785
    expect(await stakedGmxTracker.claimable(user1.address)).lt(expandDecimals(1786, 18))

    expect(await bonusGmxTracker.claimable(user0.address)).eq(0)
    expect(await bonusGmxTracker.claimable(user1.address)).gt("2730000000000000000") // 2.73, 1000 / 365 => ~2.74
    expect(await bonusGmxTracker.claimable(user1.address)).lt("2750000000000000000") // 2.75

    expect(await feeGmxTracker.claimable(user0.address)).eq(0)
    expect(await feeGmxTracker.claimable(user1.address)).gt("3560000000000000000") // 3.56, 100 / 28 => ~3.57
    expect(await feeGmxTracker.claimable(user1.address)).lt("3580000000000000000") // 3.58

    await timelock.signalMint(esGmx.address, tokenManager.address, expandDecimals(500, 18))
    await increaseTime(provider, 20)
    await mineBlock(provider)

    await timelock.processMint(esGmx.address, tokenManager.address, expandDecimals(500, 18))
    await esGmx.connect(tokenManager).transferFrom(tokenManager.address, user2.address, expandDecimals(500, 18))
    await rewardRouter.connect(user2).stakeEsGmx(expandDecimals(500, 18))

    expect(await stakedGmxTracker.stakedAmounts(user0.address)).eq(0)
    expect(await stakedGmxTracker.depositBalances(user0.address, gmx.address)).eq(0)
    expect(await stakedGmxTracker.stakedAmounts(user1.address)).eq(expandDecimals(1000, 18))
    expect(await stakedGmxTracker.depositBalances(user1.address, gmx.address)).eq(expandDecimals(1000, 18))
    expect(await stakedGmxTracker.stakedAmounts(user2.address)).eq(expandDecimals(500, 18))
    expect(await stakedGmxTracker.depositBalances(user2.address, esGmx.address)).eq(expandDecimals(500, 18))

    expect(await bonusGmxTracker.stakedAmounts(user0.address)).eq(0)
    expect(await bonusGmxTracker.depositBalances(user0.address, stakedGmxTracker.address)).eq(0)
    expect(await bonusGmxTracker.stakedAmounts(user1.address)).eq(expandDecimals(1000, 18))
    expect(await bonusGmxTracker.depositBalances(user1.address, stakedGmxTracker.address)).eq(expandDecimals(1000, 18))
    expect(await bonusGmxTracker.stakedAmounts(user2.address)).eq(expandDecimals(500, 18))
    expect(await bonusGmxTracker.depositBalances(user2.address, stakedGmxTracker.address)).eq(expandDecimals(500, 18))

    expect(await feeGmxTracker.stakedAmounts(user0.address)).eq(0)
    expect(await feeGmxTracker.depositBalances(user0.address, bonusGmxTracker.address)).eq(0)
    expect(await feeGmxTracker.stakedAmounts(user1.address)).eq(expandDecimals(1000, 18))
    expect(await feeGmxTracker.depositBalances(user1.address, bonusGmxTracker.address)).eq(expandDecimals(1000, 18))
    expect(await feeGmxTracker.stakedAmounts(user2.address)).eq(expandDecimals(500, 18))
    expect(await feeGmxTracker.depositBalances(user2.address, bonusGmxTracker.address)).eq(expandDecimals(500, 18))

    await increaseTime(provider, 24 * 60 * 60)
    await mineBlock(provider)

    expect(await stakedGmxTracker.claimable(user0.address)).eq(0)
    expect(await stakedGmxTracker.claimable(user1.address)).gt(expandDecimals(1785 + 1190, 18))
    expect(await stakedGmxTracker.claimable(user1.address)).lt(expandDecimals(1786 + 1191, 18))
    expect(await stakedGmxTracker.claimable(user2.address)).gt(expandDecimals(595, 18))
    expect(await stakedGmxTracker.claimable(user2.address)).lt(expandDecimals(596, 18))

    expect(await bonusGmxTracker.claimable(user0.address)).eq(0)
    expect(await bonusGmxTracker.claimable(user1.address)).gt("5470000000000000000") // 5.47, 1000 / 365 * 2 => ~5.48
    expect(await bonusGmxTracker.claimable(user1.address)).lt("5490000000000000000")
    expect(await bonusGmxTracker.claimable(user2.address)).gt("1360000000000000000") // 1.36, 500 / 365 => ~1.37
    expect(await bonusGmxTracker.claimable(user2.address)).lt("1380000000000000000")

    expect(await feeGmxTracker.claimable(user0.address)).eq(0)
    expect(await feeGmxTracker.claimable(user1.address)).gt("5940000000000000000") // 5.94, 3.57 + 100 / 28 / 3 * 2 => ~5.95
    expect(await feeGmxTracker.claimable(user1.address)).lt("5960000000000000000")
    expect(await feeGmxTracker.claimable(user2.address)).gt("1180000000000000000") // 1.18, 100 / 28 / 3 => ~1.19
    expect(await feeGmxTracker.claimable(user2.address)).lt("1200000000000000000")

    expect(await esGmx.balanceOf(user1.address)).eq(0)
    await rewardRouter.connect(user1).claimEsGmx()
    expect(await esGmx.balanceOf(user1.address)).gt(expandDecimals(1785 + 1190, 18))
    expect(await esGmx.balanceOf(user1.address)).lt(expandDecimals(1786 + 1191, 18))

    expect(await eth.balanceOf(user1.address)).eq(0)
    await rewardRouter.connect(user1).claimFees()
    expect(await eth.balanceOf(user1.address)).gt("5940000000000000000")
    expect(await eth.balanceOf(user1.address)).lt("5960000000000000000")

    expect(await esGmx.balanceOf(user2.address)).eq(0)
    await rewardRouter.connect(user2).claimEsGmx()
    expect(await esGmx.balanceOf(user2.address)).gt(expandDecimals(595, 18))
    expect(await esGmx.balanceOf(user2.address)).lt(expandDecimals(596, 18))

    expect(await eth.balanceOf(user2.address)).eq(0)
    await rewardRouter.connect(user2).claimFees()
    expect(await eth.balanceOf(user2.address)).gt("1180000000000000000")
    expect(await eth.balanceOf(user2.address)).lt("1200000000000000000")

    await increaseTime(provider, 24 * 60 * 60)
    await mineBlock(provider)

    const tx0 = await rewardRouter.connect(user1).compound()
    await reportGasUsed(provider, tx0, "compound gas used")

    await increaseTime(provider, 24 * 60 * 60)
    await mineBlock(provider)

    const tx1 = await rewardRouter.connect(user0).batchCompoundForAccounts([user1.address, user2.address])
    await reportGasUsed(provider, tx1, "batchCompoundForAccounts gas used")

    expect(await stakedGmxTracker.stakedAmounts(user1.address)).gt(expandDecimals(3643, 18))
    expect(await stakedGmxTracker.stakedAmounts(user1.address)).lt(expandDecimals(3645, 18))
    expect(await stakedGmxTracker.depositBalances(user1.address, gmx.address)).eq(expandDecimals(1000, 18))
    expect(await stakedGmxTracker.depositBalances(user1.address, esGmx.address)).gt(expandDecimals(2643, 18))
    expect(await stakedGmxTracker.depositBalances(user1.address, esGmx.address)).lt(expandDecimals(2645, 18))

    expect(await bonusGmxTracker.stakedAmounts(user1.address)).gt(expandDecimals(3643, 18))
    expect(await bonusGmxTracker.stakedAmounts(user1.address)).lt(expandDecimals(3645, 18))

    expect(await feeGmxTracker.stakedAmounts(user1.address)).gt(expandDecimals(3657, 18))
    expect(await feeGmxTracker.stakedAmounts(user1.address)).lt(expandDecimals(3659, 18))
    expect(await feeGmxTracker.depositBalances(user1.address, bonusGmxTracker.address)).gt(expandDecimals(3643, 18))
    expect(await feeGmxTracker.depositBalances(user1.address, bonusGmxTracker.address)).lt(expandDecimals(3645, 18))
    expect(await feeGmxTracker.depositBalances(user1.address, bnGmx.address)).gt("14100000000000000000") // 14.1
    expect(await feeGmxTracker.depositBalances(user1.address, bnGmx.address)).lt("14300000000000000000") // 14.3

    expect(await gmx.balanceOf(user1.address)).eq(0)
    await rewardRouter.connect(user1).unstakeGmx(expandDecimals(300, 18))
    expect(await gmx.balanceOf(user1.address)).eq(expandDecimals(300, 18))

    expect(await stakedGmxTracker.stakedAmounts(user1.address)).gt(expandDecimals(3343, 18))
    expect(await stakedGmxTracker.stakedAmounts(user1.address)).lt(expandDecimals(3345, 18))
    expect(await stakedGmxTracker.depositBalances(user1.address, gmx.address)).eq(expandDecimals(700, 18))
    expect(await stakedGmxTracker.depositBalances(user1.address, esGmx.address)).gt(expandDecimals(2643, 18))
    expect(await stakedGmxTracker.depositBalances(user1.address, esGmx.address)).lt(expandDecimals(2645, 18))

    expect(await bonusGmxTracker.stakedAmounts(user1.address)).gt(expandDecimals(3343, 18))
    expect(await bonusGmxTracker.stakedAmounts(user1.address)).lt(expandDecimals(3345, 18))

    expect(await feeGmxTracker.stakedAmounts(user1.address)).gt(expandDecimals(3357, 18))
    expect(await feeGmxTracker.stakedAmounts(user1.address)).lt(expandDecimals(3359, 18))
    expect(await feeGmxTracker.depositBalances(user1.address, bonusGmxTracker.address)).gt(expandDecimals(3343, 18))
    expect(await feeGmxTracker.depositBalances(user1.address, bonusGmxTracker.address)).lt(expandDecimals(3345, 18))
    expect(await feeGmxTracker.depositBalances(user1.address, bnGmx.address)).gt("13000000000000000000") // 13
    expect(await feeGmxTracker.depositBalances(user1.address, bnGmx.address)).lt("13100000000000000000") // 13.1

    const esGmxBalance1 = await esGmx.balanceOf(user1.address)
    const esGmxUnstakeBalance1 = await stakedGmxTracker.depositBalances(user1.address, esGmx.address)
    await rewardRouter.connect(user1).unstakeEsGmx(esGmxUnstakeBalance1)
    expect(await esGmx.balanceOf(user1.address)).eq(esGmxBalance1.add(esGmxUnstakeBalance1))

    expect(await stakedGmxTracker.stakedAmounts(user1.address)).eq(expandDecimals(700, 18))
    expect(await stakedGmxTracker.depositBalances(user1.address, gmx.address)).eq(expandDecimals(700, 18))
    expect(await stakedGmxTracker.depositBalances(user1.address, esGmx.address)).eq(0)

    expect(await bonusGmxTracker.stakedAmounts(user1.address)).eq(expandDecimals(700, 18))

    expect(await feeGmxTracker.stakedAmounts(user1.address)).gt(expandDecimals(702, 18))
    expect(await feeGmxTracker.stakedAmounts(user1.address)).lt(expandDecimals(703, 18))
    expect(await feeGmxTracker.depositBalances(user1.address, bonusGmxTracker.address)).eq(expandDecimals(700, 18))
    expect(await feeGmxTracker.depositBalances(user1.address, bnGmx.address)).gt("2720000000000000000") // 2.72
    expect(await feeGmxTracker.depositBalances(user1.address, bnGmx.address)).lt("2740000000000000000") // 2.74

    await expect(rewardRouter.connect(user1).unstakeEsGmx(expandDecimals(1, 18)))
      .to.be.revertedWith("RewardTracker: _amount exceeds depositBalance")
  })

  it("mintAndStakeNlp, unstakeAndRedeemNlp, compound, batchCompoundForAccounts", async () => {
    await eth.mint(feeNlpDistributor.address, expandDecimals(100, 18))
    await feeNlpDistributor.setTokensPerInterval("41335970000000") // 0.00004133597 ETH per second

    await bnb.mint(user1.address, expandDecimals(1, 18))
    await bnb.connect(user1).approve(nlpManager.address, expandDecimals(1, 18))
    const tx0 = await rewardRouter.connect(user1).mintAndStakeNlp(
      bnb.address,
      expandDecimals(1, 18),
      expandDecimals(299, 18),
      expandDecimals(299, 18)
    )
    await reportGasUsed(provider, tx0, "mintAndStakeNlp gas used")

    expect(await feeNlpTracker.stakedAmounts(user1.address)).eq(expandDecimals(2991, 17))
    expect(await feeNlpTracker.depositBalances(user1.address, nlp.address)).eq(expandDecimals(2991, 17))

    expect(await stakedNlpTracker.stakedAmounts(user1.address)).eq(expandDecimals(2991, 17))
    expect(await stakedNlpTracker.depositBalances(user1.address, feeNlpTracker.address)).eq(expandDecimals(2991, 17))

    await bnb.mint(user1.address, expandDecimals(2, 18))
    await bnb.connect(user1).approve(nlpManager.address, expandDecimals(2, 18))
    await rewardRouter.connect(user1).mintAndStakeNlp(
      bnb.address,
      expandDecimals(2, 18),
      expandDecimals(299, 18),
      expandDecimals(299, 18)
    )

    await increaseTime(provider, 24 * 60 * 60 + 1)
    await mineBlock(provider)

    expect(await feeNlpTracker.claimable(user1.address)).gt("3560000000000000000") // 3.56, 100 / 28 => ~3.57
    expect(await feeNlpTracker.claimable(user1.address)).lt("3580000000000000000") // 3.58

    expect(await stakedNlpTracker.claimable(user1.address)).gt(expandDecimals(1785, 18)) // 50000 / 28 => ~1785
    expect(await stakedNlpTracker.claimable(user1.address)).lt(expandDecimals(1786, 18))

    await bnb.mint(user2.address, expandDecimals(1, 18))
    await bnb.connect(user2).approve(nlpManager.address, expandDecimals(1, 18))
    await rewardRouter.connect(user2).mintAndStakeNlp(
      bnb.address,
      expandDecimals(1, 18),
      expandDecimals(299, 18),
      expandDecimals(299, 18)
    )

    await expect(rewardRouter.connect(user2).unstakeAndRedeemNlp(
      bnb.address,
      expandDecimals(299, 18),
      "990000000000000000", // 0.99
      user2.address
    )).to.be.revertedWith("NlpManager: cooldown duration not yet passed")

    expect(await feeNlpTracker.stakedAmounts(user1.address)).eq("897300000000000000000") // 897.3
    expect(await stakedNlpTracker.stakedAmounts(user1.address)).eq("897300000000000000000")
    expect(await bnb.balanceOf(user1.address)).eq(0)

    const tx1 = await rewardRouter.connect(user1).unstakeAndRedeemNlp(
      bnb.address,
      expandDecimals(299, 18),
      "990000000000000000", // 0.99
      user1.address
    )
    await reportGasUsed(provider, tx1, "unstakeAndRedeemNlp gas used")

    expect(await feeNlpTracker.stakedAmounts(user1.address)).eq("598300000000000000000") // 598.3
    expect(await stakedNlpTracker.stakedAmounts(user1.address)).eq("598300000000000000000")
    expect(await bnb.balanceOf(user1.address)).eq("993676666666666666") // ~0.99

    await increaseTime(provider, 24 * 60 * 60)
    await mineBlock(provider)

    expect(await feeNlpTracker.claimable(user1.address)).gt("5940000000000000000") // 5.94, 3.57 + 100 / 28 / 3 * 2 => ~5.95
    expect(await feeNlpTracker.claimable(user1.address)).lt("5960000000000000000")
    expect(await feeNlpTracker.claimable(user2.address)).gt("1180000000000000000") // 1.18, 100 / 28 / 3 => ~1.19
    expect(await feeNlpTracker.claimable(user2.address)).lt("1200000000000000000")

    expect(await stakedNlpTracker.claimable(user1.address)).gt(expandDecimals(1785 + 1190, 18))
    expect(await stakedNlpTracker.claimable(user1.address)).lt(expandDecimals(1786 + 1191, 18))
    expect(await stakedNlpTracker.claimable(user2.address)).gt(expandDecimals(595, 18))
    expect(await stakedNlpTracker.claimable(user2.address)).lt(expandDecimals(596, 18))

    expect(await esGmx.balanceOf(user1.address)).eq(0)
    await rewardRouter.connect(user1).claimEsGmx()
    expect(await esGmx.balanceOf(user1.address)).gt(expandDecimals(1785 + 1190, 18))
    expect(await esGmx.balanceOf(user1.address)).lt(expandDecimals(1786 + 1191, 18))

    expect(await eth.balanceOf(user1.address)).eq(0)
    await rewardRouter.connect(user1).claimFees()
    expect(await eth.balanceOf(user1.address)).gt("5940000000000000000")
    expect(await eth.balanceOf(user1.address)).lt("5960000000000000000")

    expect(await esGmx.balanceOf(user2.address)).eq(0)
    await rewardRouter.connect(user2).claimEsGmx()
    expect(await esGmx.balanceOf(user2.address)).gt(expandDecimals(595, 18))
    expect(await esGmx.balanceOf(user2.address)).lt(expandDecimals(596, 18))

    expect(await eth.balanceOf(user2.address)).eq(0)
    await rewardRouter.connect(user2).claimFees()
    expect(await eth.balanceOf(user2.address)).gt("1180000000000000000")
    expect(await eth.balanceOf(user2.address)).lt("1200000000000000000")

    await increaseTime(provider, 24 * 60 * 60)
    await mineBlock(provider)

    const tx2 = await rewardRouter.connect(user1).compound()
    await reportGasUsed(provider, tx2, "compound gas used")

    await increaseTime(provider, 24 * 60 * 60)
    await mineBlock(provider)

    const tx3 = await rewardRouter.batchCompoundForAccounts([user1.address, user2.address])
    await reportGasUsed(provider, tx1, "batchCompoundForAccounts gas used")

    expect(await stakedGmxTracker.stakedAmounts(user1.address)).gt(expandDecimals(4165, 18))
    expect(await stakedGmxTracker.stakedAmounts(user1.address)).lt(expandDecimals(4167, 18))
    expect(await stakedGmxTracker.depositBalances(user1.address, gmx.address)).eq(0)
    expect(await stakedGmxTracker.depositBalances(user1.address, esGmx.address)).gt(expandDecimals(4165, 18))
    expect(await stakedGmxTracker.depositBalances(user1.address, esGmx.address)).lt(expandDecimals(4167, 18))

    expect(await bonusGmxTracker.stakedAmounts(user1.address)).gt(expandDecimals(4165, 18))
    expect(await bonusGmxTracker.stakedAmounts(user1.address)).lt(expandDecimals(4167, 18))

    expect(await feeGmxTracker.stakedAmounts(user1.address)).gt(expandDecimals(4179, 18))
    expect(await feeGmxTracker.stakedAmounts(user1.address)).lt(expandDecimals(4180, 18))
    expect(await feeGmxTracker.depositBalances(user1.address, bonusGmxTracker.address)).gt(expandDecimals(4165, 18))
    expect(await feeGmxTracker.depositBalances(user1.address, bonusGmxTracker.address)).lt(expandDecimals(4167, 18))
    expect(await feeGmxTracker.depositBalances(user1.address, bnGmx.address)).gt("12900000000000000000") // 12.9
    expect(await feeGmxTracker.depositBalances(user1.address, bnGmx.address)).lt("13100000000000000000") // 13.1

    expect(await feeNlpTracker.stakedAmounts(user1.address)).eq("598300000000000000000") // 598.3
    expect(await stakedNlpTracker.stakedAmounts(user1.address)).eq("598300000000000000000")
    expect(await bnb.balanceOf(user1.address)).eq("993676666666666666") // ~0.99
  })

  it("mintAndStakeNlpETH, unstakeAndRedeemNlpETH", async () => {
    const receiver0 = newWallet()
    await expect(rewardRouter.connect(user0).mintAndStakeNlpETH(expandDecimals(300, 18), expandDecimals(300, 18), { value: 0 }))
      .to.be.revertedWith("invalid msg.value")

    await expect(rewardRouter.connect(user0).mintAndStakeNlpETH(expandDecimals(300, 18), expandDecimals(300, 18), { value: expandDecimals(1, 18) }))
      .to.be.revertedWith("NlpManager: insufficient USDG output")

    await expect(rewardRouter.connect(user0).mintAndStakeNlpETH(expandDecimals(299, 18), expandDecimals(300, 18), { value: expandDecimals(1, 18) }))
      .to.be.revertedWith("NlpManager: insufficient NLP output")

    expect(await bnb.balanceOf(user0.address)).eq(0)
    expect(await bnb.balanceOf(vault.address)).eq(0)
    expect(await bnb.totalSupply()).eq(0)
    expect(await provider.getBalance(bnb.address)).eq(0)
    expect(await stakedNlpTracker.balanceOf(user0.address)).eq(0)

    await rewardRouter.connect(user0).mintAndStakeNlpETH(expandDecimals(299, 18), expandDecimals(299, 18), { value: expandDecimals(1, 18) })

    expect(await bnb.balanceOf(user0.address)).eq(0)
    expect(await bnb.balanceOf(vault.address)).eq(expandDecimals(1, 18))
    expect(await provider.getBalance(bnb.address)).eq(expandDecimals(1, 18))
    expect(await bnb.totalSupply()).eq(expandDecimals(1, 18))
    expect(await stakedNlpTracker.balanceOf(user0.address)).eq("299100000000000000000") // 299.1

    await expect(rewardRouter.connect(user0).unstakeAndRedeemNlpETH(expandDecimals(300, 18), expandDecimals(1, 18), receiver0.address))
      .to.be.revertedWith("RewardTracker: _amount exceeds stakedAmount")

    await expect(rewardRouter.connect(user0).unstakeAndRedeemNlpETH("299100000000000000000", expandDecimals(1, 18), receiver0.address))
      .to.be.revertedWith("NlpManager: cooldown duration not yet passed")

    await increaseTime(provider, 24 * 60 * 60 + 10)

    await expect(rewardRouter.connect(user0).unstakeAndRedeemNlpETH("299100000000000000000", expandDecimals(1, 18), receiver0.address))
      .to.be.revertedWith("NlpManager: insufficient output")

    await rewardRouter.connect(user0).unstakeAndRedeemNlpETH("299100000000000000000", "990000000000000000", receiver0.address)
    expect(await provider.getBalance(receiver0.address)).eq("994009000000000000") // 0.994009
    expect(await bnb.balanceOf(vault.address)).eq("5991000000000000") // 0.005991
    expect(await provider.getBalance(bnb.address)).eq("5991000000000000")
    expect(await bnb.totalSupply()).eq("5991000000000000")
  })

  it("gmx: signalTransfer, acceptTransfer", async () =>{
    await rewardRouter.setVotingPowerType(2)
    await govToken.setMinter(rewardRouter.address, true)

    await gmx.setMinter(wallet.address, true)
    await gmx.mint(user1.address, expandDecimals(200, 18))
    expect(await gmx.balanceOf(user1.address)).eq(expandDecimals(200, 18))
    await gmx.connect(user1).approve(stakedGmxTracker.address, expandDecimals(200, 18))
    await rewardRouter.connect(user1).stakeGmx(expandDecimals(200, 18))
    expect(await gmx.balanceOf(user1.address)).eq(0)

    await gmx.mint(user2.address, expandDecimals(200, 18))
    expect(await gmx.balanceOf(user2.address)).eq(expandDecimals(200, 18))
    await gmx.connect(user2).approve(stakedGmxTracker.address, expandDecimals(400, 18))
    await rewardRouter.connect(user2).stakeGmx(expandDecimals(200, 18))
    expect(await gmx.balanceOf(user2.address)).eq(0)

    await rewardRouter.connect(user2).signalTransfer(user1.address)

    await increaseTime(provider, 24 * 60 * 60)
    await mineBlock(provider)

    await rewardRouter.connect(user2).signalTransfer(user1.address)
    await rewardRouter.connect(user1).claim()

    await expect(rewardRouter.connect(user2).signalTransfer(user1.address))
      .to.be.revertedWith("stakedGmxTracker.averageStakedAmounts > 0")

    await rewardRouter.connect(user2).signalTransfer(user3.address)

    await expect(rewardRouter.connect(user3).acceptTransfer(user1.address))
      .to.be.revertedWith("transfer not signalled")

    await gmxVester.setBonusRewards(user2.address, expandDecimals(100, 18))

    expect(await stakedGmxTracker.depositBalances(user2.address, gmx.address)).eq(expandDecimals(200, 18))
    expect(await stakedGmxTracker.depositBalances(user2.address, esGmx.address)).eq(0)
    expect(await feeGmxTracker.depositBalances(user2.address, bnGmx.address)).eq(0)
    expect(await stakedGmxTracker.depositBalances(user3.address, gmx.address)).eq(0)
    expect(await stakedGmxTracker.depositBalances(user3.address, esGmx.address)).eq(0)
    expect(await feeGmxTracker.depositBalances(user3.address, bnGmx.address)).eq(0)
    expect(await gmxVester.transferredAverageStakedAmounts(user3.address)).eq(0)
    expect(await gmxVester.transferredCumulativeRewards(user3.address)).eq(0)
    expect(await gmxVester.bonusRewards(user2.address)).eq(expandDecimals(100, 18))
    expect(await gmxVester.bonusRewards(user3.address)).eq(0)
    expect(await gmxVester.getCombinedAverageStakedAmount(user2.address)).eq(0)
    expect(await gmxVester.getCombinedAverageStakedAmount(user3.address)).eq(0)
    expect(await gmxVester.getMaxVestableAmount(user2.address)).eq(expandDecimals(100, 18))
    expect(await gmxVester.getMaxVestableAmount(user3.address)).eq(0)
    expect(await gmxVester.getPairAmount(user2.address, expandDecimals(892, 18))).eq(0)
    expect(await gmxVester.getPairAmount(user3.address, expandDecimals(892, 18))).eq(0)

    expect(await govToken.balanceOf(user2.address)).eq(expandDecimals(200, 18))
    expect(await govToken.balanceOf(user3.address)).eq(0)
    await rewardRouter.connect(user3).acceptTransfer(user2.address)
    expect(await govToken.balanceOf(user2.address)).eq(0)
    expect(await govToken.balanceOf(user3.address)).gt(expandDecimals(1093, 18))
    expect(await govToken.balanceOf(user3.address)).lt(expandDecimals(1094, 18))

    expect(await stakedGmxTracker.depositBalances(user2.address, gmx.address)).eq(0)
    expect(await stakedGmxTracker.depositBalances(user2.address, esGmx.address)).eq(0)
    expect(await feeGmxTracker.depositBalances(user2.address, bnGmx.address)).eq(0)
    expect(await stakedGmxTracker.depositBalances(user3.address, gmx.address)).eq(expandDecimals(200, 18))
    expect(await stakedGmxTracker.depositBalances(user3.address, esGmx.address)).gt(expandDecimals(892, 18))
    expect(await stakedGmxTracker.depositBalances(user3.address, esGmx.address)).lt(expandDecimals(893, 18))
    expect(await feeGmxTracker.depositBalances(user3.address, bnGmx.address)).gt("547000000000000000") // 0.547
    expect(await feeGmxTracker.depositBalances(user3.address, bnGmx.address)).lt("549000000000000000") // 0.548
    expect(await gmxVester.transferredAverageStakedAmounts(user3.address)).eq(expandDecimals(200, 18))
    expect(await gmxVester.transferredCumulativeRewards(user3.address)).gt(expandDecimals(892, 18))
    expect(await gmxVester.transferredCumulativeRewards(user3.address)).lt(expandDecimals(893, 18))
    expect(await gmxVester.bonusRewards(user2.address)).eq(0)
    expect(await gmxVester.bonusRewards(user3.address)).eq(expandDecimals(100, 18))
    expect(await gmxVester.getCombinedAverageStakedAmount(user2.address)).eq(expandDecimals(200, 18))
    expect(await gmxVester.getCombinedAverageStakedAmount(user3.address)).eq(expandDecimals(200, 18))
    expect(await gmxVester.getMaxVestableAmount(user2.address)).eq(0)
    expect(await gmxVester.getMaxVestableAmount(user3.address)).gt(expandDecimals(992, 18))
    expect(await gmxVester.getMaxVestableAmount(user3.address)).lt(expandDecimals(993, 18))
    expect(await gmxVester.getPairAmount(user2.address, expandDecimals(992, 18))).eq(0)
    expect(await gmxVester.getPairAmount(user3.address, expandDecimals(992, 18))).gt(expandDecimals(199, 18))
    expect(await gmxVester.getPairAmount(user3.address, expandDecimals(992, 18))).lt(expandDecimals(200, 18))

    await gmx.connect(user3).approve(stakedGmxTracker.address, expandDecimals(400, 18))
    await rewardRouter.connect(user3).signalTransfer(user4.address)

    expect(await govToken.balanceOf(user3.address)).gt(expandDecimals(1093, 18))
    expect(await govToken.balanceOf(user3.address)).lt(expandDecimals(1094, 18))
    expect(await govToken.balanceOf(user4.address)).eq(0)
    await rewardRouter.connect(user4).acceptTransfer(user3.address)
    expect(await govToken.balanceOf(user3.address)).eq(0)
    expect(await govToken.balanceOf(user4.address)).gt(expandDecimals(1093, 18))
    expect(await govToken.balanceOf(user4.address)).lt(expandDecimals(1094, 18))

    expect(await stakedGmxTracker.depositBalances(user3.address, gmx.address)).eq(0)
    expect(await stakedGmxTracker.depositBalances(user3.address, esGmx.address)).eq(0)
    expect(await feeGmxTracker.depositBalances(user3.address, bnGmx.address)).eq(0)
    expect(await stakedGmxTracker.depositBalances(user4.address, gmx.address)).eq(expandDecimals(200, 18))
    expect(await stakedGmxTracker.depositBalances(user4.address, esGmx.address)).gt(expandDecimals(892, 18))
    expect(await stakedGmxTracker.depositBalances(user4.address, esGmx.address)).lt(expandDecimals(894, 18))
    expect(await feeGmxTracker.depositBalances(user4.address, bnGmx.address)).gt("547000000000000000") // 0.547
    expect(await feeGmxTracker.depositBalances(user4.address, bnGmx.address)).lt("549000000000000000") // 0.548
    expect(await gmxVester.transferredAverageStakedAmounts(user4.address)).gt(expandDecimals(200, 18))
    expect(await gmxVester.transferredAverageStakedAmounts(user4.address)).lt(expandDecimals(201, 18))
    expect(await gmxVester.transferredCumulativeRewards(user4.address)).gt(expandDecimals(892, 18))
    expect(await gmxVester.transferredCumulativeRewards(user4.address)).lt(expandDecimals(894, 18))
    expect(await gmxVester.bonusRewards(user3.address)).eq(0)
    expect(await gmxVester.bonusRewards(user4.address)).eq(expandDecimals(100, 18))
    expect(await stakedGmxTracker.averageStakedAmounts(user3.address)).gt(expandDecimals(1092, 18))
    expect(await stakedGmxTracker.averageStakedAmounts(user3.address)).lt(expandDecimals(1094, 18))
    expect(await gmxVester.transferredAverageStakedAmounts(user3.address)).eq(0)
    expect(await gmxVester.getCombinedAverageStakedAmount(user3.address)).gt(expandDecimals(1092, 18))
    expect(await gmxVester.getCombinedAverageStakedAmount(user3.address)).lt(expandDecimals(1094, 18))
    expect(await gmxVester.getCombinedAverageStakedAmount(user4.address)).gt(expandDecimals(200, 18))
    expect(await gmxVester.getCombinedAverageStakedAmount(user4.address)).lt(expandDecimals(201, 18))
    expect(await gmxVester.getMaxVestableAmount(user3.address)).eq(0)
    expect(await gmxVester.getMaxVestableAmount(user4.address)).gt(expandDecimals(992, 18))
    expect(await gmxVester.getMaxVestableAmount(user4.address)).lt(expandDecimals(993, 18))
    expect(await gmxVester.getPairAmount(user3.address, expandDecimals(992, 18))).eq(0)
    expect(await gmxVester.getPairAmount(user4.address, expandDecimals(992, 18))).gt(expandDecimals(199, 18))
    expect(await gmxVester.getPairAmount(user4.address, expandDecimals(992, 18))).lt(expandDecimals(200, 18))

    await expect(rewardRouter.connect(user4).acceptTransfer(user3.address))
      .to.be.revertedWith("transfer not signalled")
  })

  it("gmx, nlp: signalTransfer, acceptTransfer", async () =>{
    await gmx.setMinter(wallet.address, true)
    await gmx.mint(gmxVester.address, expandDecimals(10000, 18))
    await gmx.mint(nlpVester.address, expandDecimals(10000, 18))
    await eth.mint(feeNlpDistributor.address, expandDecimals(100, 18))
    await feeNlpDistributor.setTokensPerInterval("41335970000000") // 0.00004133597 ETH per second

    await bnb.mint(user1.address, expandDecimals(1, 18))
    await bnb.connect(user1).approve(nlpManager.address, expandDecimals(1, 18))
    await rewardRouter.connect(user1).mintAndStakeNlp(
      bnb.address,
      expandDecimals(1, 18),
      expandDecimals(299, 18),
      expandDecimals(299, 18)
    )

    await bnb.mint(user2.address, expandDecimals(1, 18))
    await bnb.connect(user2).approve(nlpManager.address, expandDecimals(1, 18))
    await rewardRouter.connect(user2).mintAndStakeNlp(
      bnb.address,
      expandDecimals(1, 18),
      expandDecimals(299, 18),
      expandDecimals(299, 18)
    )

    await gmx.mint(user1.address, expandDecimals(200, 18))
    expect(await gmx.balanceOf(user1.address)).eq(expandDecimals(200, 18))
    await gmx.connect(user1).approve(stakedGmxTracker.address, expandDecimals(200, 18))
    await rewardRouter.connect(user1).stakeGmx(expandDecimals(200, 18))
    expect(await gmx.balanceOf(user1.address)).eq(0)

    await gmx.mint(user2.address, expandDecimals(200, 18))
    expect(await gmx.balanceOf(user2.address)).eq(expandDecimals(200, 18))
    await gmx.connect(user2).approve(stakedGmxTracker.address, expandDecimals(400, 18))
    await rewardRouter.connect(user2).stakeGmx(expandDecimals(200, 18))
    expect(await gmx.balanceOf(user2.address)).eq(0)

    expect(await feeGmxTracker.stakedAmounts(user2.address)).eq(expandDecimals(200, 18))

    await rewardRouter.setInStrictTransferMode(true)
    await expect(rewardRouter.connect(user2).signalTransfer(user1.address))
      .to.be.revertedWith("insufficient allowance")

    await feeGmxTracker.connect(user2).approve(user1.address, expandDecimals(150, 18))

    await expect(rewardRouter.connect(user2).signalTransfer(user1.address))
      .to.be.revertedWith("insufficient allowance")

    await feeGmxTracker.connect(user2).approve(user1.address, expandDecimals(2000, 18))

    await rewardRouter.connect(user2).signalTransfer(user1.address)

    await increaseTime(provider, 24 * 60 * 60)
    await mineBlock(provider)

    await rewardRouter.connect(user2).signalTransfer(user1.address)
    await rewardRouter.connect(user1).compound()

    await expect(rewardRouter.connect(user2).signalTransfer(user1.address))
      .to.be.revertedWith("stakedGmxTracker.averageStakedAmounts > 0")

    await feeGmxTracker.connect(user2).approve(user3.address, expandDecimals(2000, 18))

    await rewardRouter.connect(user2).signalTransfer(user3.address)

    await expect(rewardRouter.connect(user3).acceptTransfer(user1.address))
      .to.be.revertedWith("transfer not signalled")

    await gmxVester.setBonusRewards(user2.address, expandDecimals(100, 18))

    expect(await stakedGmxTracker.depositBalances(user2.address, gmx.address)).eq(expandDecimals(200, 18))
    expect(await stakedGmxTracker.depositBalances(user2.address, esGmx.address)).eq(0)
    expect(await stakedGmxTracker.depositBalances(user3.address, gmx.address)).eq(0)
    expect(await stakedGmxTracker.depositBalances(user3.address, esGmx.address)).eq(0)

    expect(await feeGmxTracker.depositBalances(user2.address, bnGmx.address)).eq(0)
    expect(await feeGmxTracker.depositBalances(user3.address, bnGmx.address)).eq(0)

    expect(await feeNlpTracker.depositBalances(user2.address, nlp.address)).eq("299100000000000000000") // 299.1
    expect(await feeNlpTracker.depositBalances(user3.address, nlp.address)).eq(0)

    expect(await stakedNlpTracker.depositBalances(user2.address, feeNlpTracker.address)).eq("299100000000000000000") // 299.1
    expect(await stakedNlpTracker.depositBalances(user3.address, feeNlpTracker.address)).eq(0)

    expect(await gmxVester.transferredAverageStakedAmounts(user3.address)).eq(0)
    expect(await gmxVester.transferredCumulativeRewards(user3.address)).eq(0)
    expect(await gmxVester.bonusRewards(user2.address)).eq(expandDecimals(100, 18))
    expect(await gmxVester.bonusRewards(user3.address)).eq(0)
    expect(await gmxVester.getCombinedAverageStakedAmount(user2.address)).eq(0)
    expect(await gmxVester.getCombinedAverageStakedAmount(user3.address)).eq(0)
    expect(await gmxVester.getMaxVestableAmount(user2.address)).eq(expandDecimals(100, 18))
    expect(await gmxVester.getMaxVestableAmount(user3.address)).eq(0)
    expect(await gmxVester.getPairAmount(user2.address, expandDecimals(892, 18))).eq(0)
    expect(await gmxVester.getPairAmount(user3.address, expandDecimals(892, 18))).eq(0)

    await rewardRouter.connect(user3).acceptTransfer(user2.address)

    expect(await stakedGmxTracker.depositBalances(user2.address, gmx.address)).eq(0)
    expect(await stakedGmxTracker.depositBalances(user2.address, esGmx.address)).eq(0)
    expect(await stakedGmxTracker.depositBalances(user3.address, gmx.address)).eq(expandDecimals(200, 18))
    expect(await stakedGmxTracker.depositBalances(user3.address, esGmx.address)).gt(expandDecimals(1786, 18))
    expect(await stakedGmxTracker.depositBalances(user3.address, esGmx.address)).lt(expandDecimals(1787, 18))

    expect(await feeGmxTracker.depositBalances(user2.address, bnGmx.address)).eq(0)
    expect(await feeGmxTracker.depositBalances(user3.address, bnGmx.address)).gt("547000000000000000") // 0.547
    expect(await feeGmxTracker.depositBalances(user3.address, bnGmx.address)).lt("549000000000000000") // 0.548

    expect(await feeNlpTracker.depositBalances(user2.address, nlp.address)).eq(0)
    expect(await feeNlpTracker.depositBalances(user3.address, nlp.address)).eq("299100000000000000000") // 299.1

    expect(await stakedNlpTracker.depositBalances(user2.address, feeNlpTracker.address)).eq(0)
    expect(await stakedNlpTracker.depositBalances(user3.address, feeNlpTracker.address)).eq("299100000000000000000") // 299.1

    expect(await gmxVester.transferredAverageStakedAmounts(user3.address)).eq(expandDecimals(200, 18))
    expect(await gmxVester.transferredCumulativeRewards(user3.address)).gt(expandDecimals(892, 18))
    expect(await gmxVester.transferredCumulativeRewards(user3.address)).lt(expandDecimals(893, 18))
    expect(await gmxVester.bonusRewards(user2.address)).eq(0)
    expect(await gmxVester.bonusRewards(user3.address)).eq(expandDecimals(100, 18))
    expect(await gmxVester.getCombinedAverageStakedAmount(user2.address)).eq(expandDecimals(200, 18))
    expect(await gmxVester.getCombinedAverageStakedAmount(user3.address)).eq(expandDecimals(200, 18))
    expect(await gmxVester.getMaxVestableAmount(user2.address)).eq(0)
    expect(await gmxVester.getMaxVestableAmount(user3.address)).gt(expandDecimals(992, 18))
    expect(await gmxVester.getMaxVestableAmount(user3.address)).lt(expandDecimals(993, 18))
    expect(await gmxVester.getPairAmount(user2.address, expandDecimals(992, 18))).eq(0)
    expect(await gmxVester.getPairAmount(user3.address, expandDecimals(992, 18))).gt(expandDecimals(199, 18))
    expect(await gmxVester.getPairAmount(user3.address, expandDecimals(992, 18))).lt(expandDecimals(200, 18))
    expect(await gmxVester.getPairAmount(user1.address, expandDecimals(892, 18))).gt(expandDecimals(199, 18))
    expect(await gmxVester.getPairAmount(user1.address, expandDecimals(892, 18))).lt(expandDecimals(200, 18))

    await rewardRouter.connect(user1).compound()

    await expect(rewardRouter.connect(user3).acceptTransfer(user1.address))
      .to.be.revertedWith("transfer not signalled")

    await increaseTime(provider, 24 * 60 * 60)
    await mineBlock(provider)

    await rewardRouter.connect(user1).claim()
    await rewardRouter.connect(user2).claim()
    await rewardRouter.connect(user3).claim()

    expect(await gmxVester.getCombinedAverageStakedAmount(user1.address)).gt(expandDecimals(1092, 18))
    expect(await gmxVester.getCombinedAverageStakedAmount(user1.address)).lt(expandDecimals(1094, 18))
    expect(await gmxVester.getCombinedAverageStakedAmount(user3.address)).gt(expandDecimals(1092, 18))
    expect(await gmxVester.getCombinedAverageStakedAmount(user3.address)).lt(expandDecimals(1094, 18))

    expect(await gmxVester.getMaxVestableAmount(user2.address)).eq(0)
    expect(await gmxVester.getMaxVestableAmount(user3.address)).gt(expandDecimals(1885, 18))
    expect(await gmxVester.getMaxVestableAmount(user3.address)).lt(expandDecimals(1887, 18))
    expect(await gmxVester.getMaxVestableAmount(user1.address)).gt(expandDecimals(1785, 18))
    expect(await gmxVester.getMaxVestableAmount(user1.address)).lt(expandDecimals(1787, 18))

    expect(await gmxVester.getPairAmount(user2.address, expandDecimals(992, 18))).eq(0)
    expect(await gmxVester.getPairAmount(user3.address, expandDecimals(1885, 18))).gt(expandDecimals(1092, 18))
    expect(await gmxVester.getPairAmount(user3.address, expandDecimals(1885, 18))).lt(expandDecimals(1094, 18))
    expect(await gmxVester.getPairAmount(user1.address, expandDecimals(1785, 18))).gt(expandDecimals(1092, 18))
    expect(await gmxVester.getPairAmount(user1.address, expandDecimals(1785, 18))).lt(expandDecimals(1094, 18))

    await rewardRouter.connect(user1).compound()
    await rewardRouter.connect(user3).compound()

    expect(await feeGmxTracker.balanceOf(user1.address)).gt(expandDecimals(1992, 18))
    expect(await feeGmxTracker.balanceOf(user1.address)).lt(expandDecimals(1993, 18))

    await gmxVester.connect(user1).deposit(expandDecimals(1785, 18))

    expect(await feeGmxTracker.balanceOf(user1.address)).gt(expandDecimals(1991 - 1092, 18)) // 899
    expect(await feeGmxTracker.balanceOf(user1.address)).lt(expandDecimals(1993 - 1092, 18)) // 901

    expect(await feeGmxTracker.depositBalances(user1.address, bnGmx.address)).gt(expandDecimals(4, 18))
    expect(await feeGmxTracker.depositBalances(user1.address, bnGmx.address)).lt(expandDecimals(6, 18))

    await rewardRouter.connect(user1).unstakeGmx(expandDecimals(200, 18))
    await expect(rewardRouter.connect(user1).unstakeEsGmx(expandDecimals(699, 18)))
      .to.be.revertedWith("RewardTracker: burn amount exceeds balance")

    await rewardRouter.connect(user1).unstakeEsGmx(expandDecimals(599, 18))

    await increaseTime(provider, 24 * 60 * 60)
    await mineBlock(provider)

    expect(await feeGmxTracker.balanceOf(user1.address)).gt(expandDecimals(97, 18))
    expect(await feeGmxTracker.balanceOf(user1.address)).lt(expandDecimals(99, 18))

    expect(await esGmx.balanceOf(user1.address)).gt(expandDecimals(599, 18))
    expect(await esGmx.balanceOf(user1.address)).lt(expandDecimals(601, 18))

    expect(await gmx.balanceOf(user1.address)).eq(expandDecimals(200, 18))

    await gmxVester.connect(user1).withdraw()

    expect(await feeGmxTracker.balanceOf(user1.address)).gt(expandDecimals(1190, 18)) // 1190 - 98 => 1092
    expect(await feeGmxTracker.balanceOf(user1.address)).lt(expandDecimals(1191, 18))

    expect(await esGmx.balanceOf(user1.address)).gt(expandDecimals(2378, 18))
    expect(await esGmx.balanceOf(user1.address)).lt(expandDecimals(2380, 18))

    expect(await gmx.balanceOf(user1.address)).gt(expandDecimals(204, 18))
    expect(await gmx.balanceOf(user1.address)).lt(expandDecimals(206, 18))

    expect(await nlpVester.getMaxVestableAmount(user3.address)).gt(expandDecimals(1785, 18))
    expect(await nlpVester.getMaxVestableAmount(user3.address)).lt(expandDecimals(1787, 18))

    expect(await nlpVester.getPairAmount(user3.address, expandDecimals(1785, 18))).gt(expandDecimals(298, 18))
    expect(await nlpVester.getPairAmount(user3.address, expandDecimals(1785, 18))).lt(expandDecimals(300, 18))

    expect(await stakedNlpTracker.balanceOf(user3.address)).eq("299100000000000000000")

    expect(await esGmx.balanceOf(user3.address)).gt(expandDecimals(1785, 18))
    expect(await esGmx.balanceOf(user3.address)).lt(expandDecimals(1787, 18))

    expect(await gmx.balanceOf(user3.address)).eq(0)

    await nlpVester.connect(user3).deposit(expandDecimals(1785, 18))

    expect(await stakedNlpTracker.balanceOf(user3.address)).gt(0)
    expect(await stakedNlpTracker.balanceOf(user3.address)).lt(expandDecimals(1, 18))

    expect(await esGmx.balanceOf(user3.address)).gt(0)
    expect(await esGmx.balanceOf(user3.address)).lt(expandDecimals(1, 18))

    expect(await gmx.balanceOf(user3.address)).eq(0)

    await expect(rewardRouter.connect(user3).unstakeAndRedeemNlp(
      bnb.address,
      expandDecimals(1, 18),
      0,
      user3.address
    )).to.be.revertedWith("RewardTracker: burn amount exceeds balance")

    await increaseTime(provider, 24 * 60 * 60)
    await mineBlock(provider)

    await nlpVester.connect(user3).withdraw()

    expect(await stakedNlpTracker.balanceOf(user3.address)).eq("299100000000000000000")

    expect(await esGmx.balanceOf(user3.address)).gt(expandDecimals(1785 - 5, 18))
    expect(await esGmx.balanceOf(user3.address)).lt(expandDecimals(1787 - 5, 18))

    expect(await gmx.balanceOf(user3.address)).gt(expandDecimals(4, 18))
    expect(await gmx.balanceOf(user3.address)).lt(expandDecimals(6, 18))

    expect(await feeGmxTracker.balanceOf(user1.address)).gt(expandDecimals(1190, 18))
    expect(await feeGmxTracker.balanceOf(user1.address)).lt(expandDecimals(1191, 18))

    expect(await esGmx.balanceOf(user1.address)).gt(expandDecimals(2379, 18))
    expect(await esGmx.balanceOf(user1.address)).lt(expandDecimals(2381, 18))

    expect(await gmx.balanceOf(user1.address)).gt(expandDecimals(204, 18))
    expect(await gmx.balanceOf(user1.address)).lt(expandDecimals(206, 18))

    await gmxVester.connect(user1).deposit(expandDecimals(365 * 2, 18))

    expect(await feeGmxTracker.balanceOf(user1.address)).gt(expandDecimals(743, 18)) // 1190 - 743 => 447
    expect(await feeGmxTracker.balanceOf(user1.address)).lt(expandDecimals(754, 18))

    expect(await gmxVester.claimable(user1.address)).eq(0)

    await increaseTime(provider, 48 * 60 * 60)
    await mineBlock(provider)

    expect(await gmxVester.claimable(user1.address)).gt("3900000000000000000") // 3.9
    expect(await gmxVester.claimable(user1.address)).lt("4100000000000000000") // 4.1

    await gmxVester.connect(user1).deposit(expandDecimals(365, 18))

    expect(await feeGmxTracker.balanceOf(user1.address)).gt(expandDecimals(522, 18)) // 743 - 522 => 221
    expect(await feeGmxTracker.balanceOf(user1.address)).lt(expandDecimals(524, 18))

    await increaseTime(provider, 48 * 60 * 60)
    await mineBlock(provider)

    expect(await gmxVester.claimable(user1.address)).gt("9900000000000000000") // 9.9
    expect(await gmxVester.claimable(user1.address)).lt("10100000000000000000") // 10.1

    expect(await gmx.balanceOf(user1.address)).gt(expandDecimals(204, 18))
    expect(await gmx.balanceOf(user1.address)).lt(expandDecimals(206, 18))

    await gmxVester.connect(user1).claim()

    expect(await gmx.balanceOf(user1.address)).gt(expandDecimals(214, 18))
    expect(await gmx.balanceOf(user1.address)).lt(expandDecimals(216, 18))

    await gmxVester.connect(user1).deposit(expandDecimals(365, 18))
    expect(await gmxVester.balanceOf(user1.address)).gt(expandDecimals(1449, 18)) // 365 * 4 => 1460, 1460 - 10 => 1450
    expect(await gmxVester.balanceOf(user1.address)).lt(expandDecimals(1451, 18))
    expect(await gmxVester.getVestedAmount(user1.address)).eq(expandDecimals(1460, 18))

    expect(await feeGmxTracker.balanceOf(user1.address)).gt(expandDecimals(303, 18)) // 522 - 303 => 219
    expect(await feeGmxTracker.balanceOf(user1.address)).lt(expandDecimals(304, 18))

    await increaseTime(provider, 48 * 60 * 60)
    await mineBlock(provider)

    expect(await gmxVester.claimable(user1.address)).gt("7900000000000000000") // 7.9
    expect(await gmxVester.claimable(user1.address)).lt("8100000000000000000") // 8.1

    await gmxVester.connect(user1).withdraw()

    expect(await feeGmxTracker.balanceOf(user1.address)).gt(expandDecimals(1190, 18))
    expect(await feeGmxTracker.balanceOf(user1.address)).lt(expandDecimals(1191, 18))

    expect(await gmx.balanceOf(user1.address)).gt(expandDecimals(222, 18))
    expect(await gmx.balanceOf(user1.address)).lt(expandDecimals(224, 18))

    expect(await esGmx.balanceOf(user1.address)).gt(expandDecimals(2360, 18))
    expect(await esGmx.balanceOf(user1.address)).lt(expandDecimals(2362, 18))

    await gmxVester.connect(user1).deposit(expandDecimals(365, 18))

    await increaseTime(provider, 500 * 24 * 60 * 60)
    await mineBlock(provider)

    expect(await gmxVester.claimable(user1.address)).eq(expandDecimals(365, 18))

    await gmxVester.connect(user1).withdraw()

    expect(await gmx.balanceOf(user1.address)).gt(expandDecimals(222 + 365, 18))
    expect(await gmx.balanceOf(user1.address)).lt(expandDecimals(224 + 365, 18))

    expect(await esGmx.balanceOf(user1.address)).gt(expandDecimals(2360 - 365, 18))
    expect(await esGmx.balanceOf(user1.address)).lt(expandDecimals(2362 - 365, 18))

    expect(await gmxVester.transferredAverageStakedAmounts(user2.address)).eq(0)
    expect(await gmxVester.transferredAverageStakedAmounts(user3.address)).eq(expandDecimals(200, 18))
    expect(await stakedGmxTracker.cumulativeRewards(user2.address)).gt(expandDecimals(892, 18))
    expect(await stakedGmxTracker.cumulativeRewards(user2.address)).lt(expandDecimals(893, 18))
    expect(await stakedGmxTracker.cumulativeRewards(user3.address)).gt(expandDecimals(892, 18))
    expect(await stakedGmxTracker.cumulativeRewards(user3.address)).lt(expandDecimals(893, 18))
    expect(await gmxVester.transferredCumulativeRewards(user3.address)).gt(expandDecimals(892, 18))
    expect(await gmxVester.transferredCumulativeRewards(user3.address)).lt(expandDecimals(893, 18))
    expect(await gmxVester.bonusRewards(user2.address)).eq(0)
    expect(await gmxVester.bonusRewards(user3.address)).eq(expandDecimals(100, 18))
    expect(await gmxVester.getCombinedAverageStakedAmount(user2.address)).eq(expandDecimals(200, 18))
    expect(await gmxVester.getCombinedAverageStakedAmount(user3.address)).gt(expandDecimals(1092, 18))
    expect(await gmxVester.getCombinedAverageStakedAmount(user3.address)).lt(expandDecimals(1093, 18))
    expect(await gmxVester.getMaxVestableAmount(user2.address)).eq(0)
    expect(await gmxVester.getMaxVestableAmount(user3.address)).gt(expandDecimals(1884, 18))
    expect(await gmxVester.getMaxVestableAmount(user3.address)).lt(expandDecimals(1886, 18))
    expect(await gmxVester.getPairAmount(user2.address, expandDecimals(992, 18))).eq(0)
    expect(await gmxVester.getPairAmount(user3.address, expandDecimals(992, 18))).gt(expandDecimals(574, 18))
    expect(await gmxVester.getPairAmount(user3.address, expandDecimals(992, 18))).lt(expandDecimals(575, 18))
    expect(await gmxVester.getPairAmount(user1.address, expandDecimals(892, 18))).gt(expandDecimals(545, 18))
    expect(await gmxVester.getPairAmount(user1.address, expandDecimals(892, 18))).lt(expandDecimals(546, 18))

    const esGmxBatchSender = await deployContract("EsGmxBatchSender", [esGmx.address])

    await timelock.signalSetHandler(esGmx.address, esGmxBatchSender.address, true)
    await timelock.signalSetHandler(gmxVester.address, esGmxBatchSender.address, true)
    await timelock.signalSetHandler(nlpVester.address, esGmxBatchSender.address, true)
    await timelock.signalMint(esGmx.address, wallet.address, expandDecimals(1000, 18))

    await increaseTime(provider, 20)
    await mineBlock(provider)

    await timelock.setHandler(esGmx.address, esGmxBatchSender.address, true)
    await timelock.setHandler(gmxVester.address, esGmxBatchSender.address, true)
    await timelock.setHandler(nlpVester.address, esGmxBatchSender.address, true)
    await timelock.processMint(esGmx.address, wallet.address, expandDecimals(1000, 18))

    await esGmxBatchSender.connect(wallet).send(
      gmxVester.address,
      4,
      [user2.address, user3.address],
      [expandDecimals(100, 18), expandDecimals(200, 18)]
    )

    expect(await gmxVester.transferredAverageStakedAmounts(user2.address)).gt(expandDecimals(37651, 18))
    expect(await gmxVester.transferredAverageStakedAmounts(user2.address)).lt(expandDecimals(37653, 18))
    expect(await gmxVester.transferredAverageStakedAmounts(user3.address)).gt(expandDecimals(12810, 18))
    expect(await gmxVester.transferredAverageStakedAmounts(user3.address)).lt(expandDecimals(12811, 18))
    expect(await gmxVester.transferredCumulativeRewards(user2.address)).eq(expandDecimals(100, 18))
    expect(await gmxVester.transferredCumulativeRewards(user3.address)).gt(expandDecimals(892 + 200, 18))
    expect(await gmxVester.transferredCumulativeRewards(user3.address)).lt(expandDecimals(893 + 200, 18))
    expect(await gmxVester.bonusRewards(user2.address)).eq(0)
    expect(await gmxVester.bonusRewards(user3.address)).eq(expandDecimals(100, 18))
    expect(await gmxVester.getCombinedAverageStakedAmount(user2.address)).gt(expandDecimals(3971, 18))
    expect(await gmxVester.getCombinedAverageStakedAmount(user2.address)).lt(expandDecimals(3972, 18))
    expect(await gmxVester.getCombinedAverageStakedAmount(user3.address)).gt(expandDecimals(7943, 18))
    expect(await gmxVester.getCombinedAverageStakedAmount(user3.address)).lt(expandDecimals(7944, 18))
    expect(await gmxVester.getMaxVestableAmount(user2.address)).eq(expandDecimals(100, 18))
    expect(await gmxVester.getMaxVestableAmount(user3.address)).gt(expandDecimals(1884 + 200, 18))
    expect(await gmxVester.getMaxVestableAmount(user3.address)).lt(expandDecimals(1886 + 200, 18))
    expect(await gmxVester.getPairAmount(user2.address, expandDecimals(100, 18))).gt(expandDecimals(3971, 18))
    expect(await gmxVester.getPairAmount(user2.address, expandDecimals(100, 18))).lt(expandDecimals(3972, 18))
    expect(await gmxVester.getPairAmount(user3.address, expandDecimals(1884 + 200, 18))).gt(expandDecimals(7936, 18))
    expect(await gmxVester.getPairAmount(user3.address, expandDecimals(1884 + 200, 18))).lt(expandDecimals(7937, 18))

    expect(await nlpVester.transferredAverageStakedAmounts(user4.address)).eq(0)
    expect(await nlpVester.transferredCumulativeRewards(user4.address)).eq(0)
    expect(await nlpVester.bonusRewards(user4.address)).eq(0)
    expect(await nlpVester.getCombinedAverageStakedAmount(user4.address)).eq(0)
    expect(await nlpVester.getMaxVestableAmount(user4.address)).eq(0)
    expect(await nlpVester.getPairAmount(user4.address, expandDecimals(10, 18))).eq(0)

    await esGmxBatchSender.connect(wallet).send(
      nlpVester.address,
      320,
      [user4.address],
      [expandDecimals(10, 18)]
    )

    expect(await nlpVester.transferredAverageStakedAmounts(user4.address)).eq(expandDecimals(3200, 18))
    expect(await nlpVester.transferredCumulativeRewards(user4.address)).eq(expandDecimals(10, 18))
    expect(await nlpVester.bonusRewards(user4.address)).eq(0)
    expect(await nlpVester.getCombinedAverageStakedAmount(user4.address)).eq(expandDecimals(3200, 18))
    expect(await nlpVester.getMaxVestableAmount(user4.address)).eq(expandDecimals(10, 18))
    expect(await nlpVester.getPairAmount(user4.address, expandDecimals(10, 18))).eq(expandDecimals(3200, 18))

    await esGmxBatchSender.connect(wallet).send(
      nlpVester.address,
      320,
      [user4.address],
      [expandDecimals(10, 18)]
    )

    expect(await nlpVester.transferredAverageStakedAmounts(user4.address)).eq(expandDecimals(6400, 18))
    expect(await nlpVester.transferredCumulativeRewards(user4.address)).eq(expandDecimals(20, 18))
    expect(await nlpVester.bonusRewards(user4.address)).eq(0)
    expect(await nlpVester.getCombinedAverageStakedAmount(user4.address)).eq(expandDecimals(6400, 18))
    expect(await nlpVester.getMaxVestableAmount(user4.address)).eq(expandDecimals(20, 18))
    expect(await nlpVester.getPairAmount(user4.address, expandDecimals(10, 18))).eq(expandDecimals(3200, 18))
  })

  it("handleRewards", async () => {
    const timelockV2 = wallet

    // use new rewardRouter, use eth for weth
    const rewardRouterV2 = await deployContract("RewardRouterV2", [])
    await rewardRouterV2.initialize(
      eth.address,
      gmx.address,
      esGmx.address,
      bnGmx.address,
      nlp.address,
      stakedGmxTracker.address,
      bonusGmxTracker.address,
      feeGmxTracker.address,
      feeNlpTracker.address,
      stakedNlpTracker.address,
      nlpManager.address,
      gmxVester.address,
      nlpVester.address,
      govToken.address
    )

    await rewardRouterV2.setMaxBoostBasisPoints(20_000)

    await timelock.signalSetGov(nlpManager.address, timelockV2.address)
    await timelock.signalSetGov(stakedGmxTracker.address, timelockV2.address)
    await timelock.signalSetGov(bonusGmxTracker.address, timelockV2.address)
    await timelock.signalSetGov(feeGmxTracker.address, timelockV2.address)
    await timelock.signalSetGov(feeNlpTracker.address, timelockV2.address)
    await timelock.signalSetGov(stakedNlpTracker.address, timelockV2.address)
    await timelock.signalSetGov(stakedGmxDistributor.address, timelockV2.address)
    await timelock.signalSetGov(stakedNlpDistributor.address, timelockV2.address)
    await timelock.signalSetGov(esGmx.address, timelockV2.address)
    await timelock.signalSetGov(bnGmx.address, timelockV2.address)
    await timelock.signalSetGov(gmxVester.address, timelockV2.address)
    await timelock.signalSetGov(nlpVester.address, timelockV2.address)

    await increaseTime(provider, 20)
    await mineBlock(provider)

    await timelock.connect(timelockV2).setGov(nlpManager.address)
    await timelock.connect(timelockV2).setGov(stakedGmxTracker.address)
    await timelock.connect(timelockV2).setGov(bonusGmxTracker.address)
    await timelock.connect(timelockV2).setGov(feeGmxTracker.address)
    await timelock.connect(timelockV2).setGov(feeNlpTracker.address)
    await timelock.connect(timelockV2).setGov(stakedNlpTracker.address)
    await timelock.connect(timelockV2).setGov(stakedGmxDistributor.address)
    await timelock.connect(timelockV2).setGov(stakedNlpDistributor.address)
    await timelock.connect(timelockV2).setGov(esGmx.address)
    await timelock.connect(timelockV2).setGov(bnGmx.address)
    await timelock.connect(timelockV2).setGov(gmxVester.address)
    await timelock.connect(timelockV2).setGov(nlpVester.address)

    await esGmx.setHandler(rewardRouterV2.address, true)
    await esGmx.setHandler(stakedGmxDistributor.address, true)
    await esGmx.setHandler(stakedNlpDistributor.address, true)
    await esGmx.setHandler(stakedGmxTracker.address, true)
    await esGmx.setHandler(stakedNlpTracker.address, true)
    await esGmx.setHandler(gmxVester.address, true)
    await esGmx.setHandler(nlpVester.address, true)

    await nlpManager.setHandler(rewardRouterV2.address, true)
    await stakedGmxTracker.setHandler(rewardRouterV2.address, true)
    await bonusGmxTracker.setHandler(rewardRouterV2.address, true)
    await feeGmxTracker.setHandler(rewardRouterV2.address, true)
    await feeNlpTracker.setHandler(rewardRouterV2.address, true)
    await stakedNlpTracker.setHandler(rewardRouterV2.address, true)

    await esGmx.setHandler(rewardRouterV2.address, true)
    await bnGmx.setMinter(rewardRouterV2.address, true)
    await esGmx.setMinter(gmxVester.address, true)
    await esGmx.setMinter(nlpVester.address, true)

    await gmxVester.setHandler(rewardRouterV2.address, true)
    await nlpVester.setHandler(rewardRouterV2.address, true)

    await feeGmxTracker.setHandler(gmxVester.address, true)
    await stakedNlpTracker.setHandler(nlpVester.address, true)

    await eth.deposit({ value: expandDecimals(10, 18) })

    await gmx.setMinter(wallet.address, true)
    await gmx.mint(gmxVester.address, expandDecimals(10000, 18))
    await gmx.mint(nlpVester.address, expandDecimals(10000, 18))

    await eth.mint(feeNlpDistributor.address, expandDecimals(50, 18))
    await feeNlpDistributor.setTokensPerInterval("41335970000000") // 0.00004133597 ETH per second

    await eth.mint(feeGmxDistributor.address, expandDecimals(50, 18))
    await feeGmxDistributor.setTokensPerInterval("41335970000000") // 0.00004133597 ETH per second

    await bnb.mint(user1.address, expandDecimals(1, 18))
    await bnb.connect(user1).approve(nlpManager.address, expandDecimals(1, 18))
    await rewardRouterV2.connect(user1).mintAndStakeNlp(
      bnb.address,
      expandDecimals(1, 18),
      expandDecimals(299, 18),
      expandDecimals(299, 18)
    )

    await gmx.mint(user1.address, expandDecimals(200, 18))
    expect(await gmx.balanceOf(user1.address)).eq(expandDecimals(200, 18))
    await gmx.connect(user1).approve(stakedGmxTracker.address, expandDecimals(200, 18))
    await rewardRouterV2.connect(user1).stakeGmx(expandDecimals(200, 18))
    expect(await gmx.balanceOf(user1.address)).eq(0)

    await increaseTime(provider, 24 * 60 * 60)
    await mineBlock(provider)

    expect(await gmx.balanceOf(user1.address)).eq(0)
    expect(await esGmx.balanceOf(user1.address)).eq(0)
    expect(await bnGmx.balanceOf(user1.address)).eq(0)
    expect(await nlp.balanceOf(user1.address)).eq(0)
    expect(await eth.balanceOf(user1.address)).eq(0)

    expect(await stakedGmxTracker.depositBalances(user1.address, gmx.address)).eq(expandDecimals(200, 18))
    expect(await stakedGmxTracker.depositBalances(user1.address, esGmx.address)).eq(0)
    expect(await feeGmxTracker.depositBalances(user1.address, bnGmx.address)).eq(0)

    await rewardRouterV2.connect(user1).handleRewards(
      true, // _shouldClaimGmx
      true, // _shouldStakeGmx
      true, // _shouldClaimEsGmx
      true, // _shouldStakeEsGmx
      true, // _shouldStakeMultiplierPoints
      true, // _shouldClaimWeth
      false // _shouldConvertWethToEth
    )

    expect(await gmx.balanceOf(user1.address)).eq(0)
    expect(await esGmx.balanceOf(user1.address)).eq(0)
    expect(await bnGmx.balanceOf(user1.address)).eq(0)
    expect(await nlp.balanceOf(user1.address)).eq(0)
    expect(await eth.balanceOf(user1.address)).gt(expandDecimals(7, 18))
    expect(await eth.balanceOf(user1.address)).lt(expandDecimals(8, 18))

    expect(await stakedGmxTracker.depositBalances(user1.address, gmx.address)).eq(expandDecimals(200, 18))
    expect(await stakedGmxTracker.depositBalances(user1.address, esGmx.address)).gt(expandDecimals(3571, 18))
    expect(await stakedGmxTracker.depositBalances(user1.address, esGmx.address)).lt(expandDecimals(3572, 18))
    expect(await feeGmxTracker.depositBalances(user1.address, bnGmx.address)).gt("540000000000000000") // 0.54
    expect(await feeGmxTracker.depositBalances(user1.address, bnGmx.address)).lt("560000000000000000") // 0.56

    await increaseTime(provider, 24 * 60 * 60)
    await mineBlock(provider)

    const ethBalance0 = await provider.getBalance(user1.address)

    await rewardRouterV2.connect(user1).handleRewards(
      false, // _shouldClaimGmx
      false, // _shouldStakeGmx
      false, // _shouldClaimEsGmx
      false, // _shouldStakeEsGmx
      false, // _shouldStakeMultiplierPoints
      true, // _shouldClaimWeth
      true // _shouldConvertWethToEth
    )

    const ethBalance1 = await provider.getBalance(user1.address)

    expect(await ethBalance1.sub(ethBalance0)).gt(expandDecimals(7, 18))
    expect(await ethBalance1.sub(ethBalance0)).lt(expandDecimals(8, 18))
    expect(await gmx.balanceOf(user1.address)).eq(0)
    expect(await esGmx.balanceOf(user1.address)).eq(0)
    expect(await bnGmx.balanceOf(user1.address)).eq(0)
    expect(await nlp.balanceOf(user1.address)).eq(0)
    expect(await eth.balanceOf(user1.address)).gt(expandDecimals(7, 18))
    expect(await eth.balanceOf(user1.address)).lt(expandDecimals(8, 18))

    expect(await stakedGmxTracker.depositBalances(user1.address, gmx.address)).eq(expandDecimals(200, 18))
    expect(await stakedGmxTracker.depositBalances(user1.address, esGmx.address)).gt(expandDecimals(3571, 18))
    expect(await stakedGmxTracker.depositBalances(user1.address, esGmx.address)).lt(expandDecimals(3572, 18))
    expect(await feeGmxTracker.depositBalances(user1.address, bnGmx.address)).gt("540000000000000000") // 0.54
    expect(await feeGmxTracker.depositBalances(user1.address, bnGmx.address)).lt("560000000000000000") // 0.56

    await rewardRouterV2.connect(user1).handleRewards(
      false, // _shouldClaimGmx
      false, // _shouldStakeGmx
      true, // _shouldClaimEsGmx
      false, // _shouldStakeEsGmx
      false, // _shouldStakeMultiplierPoints
      false, // _shouldClaimWeth
      false // _shouldConvertWethToEth
    )

    expect(await ethBalance1.sub(ethBalance0)).gt(expandDecimals(7, 18))
    expect(await ethBalance1.sub(ethBalance0)).lt(expandDecimals(8, 18))
    expect(await gmx.balanceOf(user1.address)).eq(0)
    expect(await esGmx.balanceOf(user1.address)).gt(expandDecimals(3571, 18))
    expect(await esGmx.balanceOf(user1.address)).lt(expandDecimals(3572, 18))
    expect(await bnGmx.balanceOf(user1.address)).eq(0)
    expect(await nlp.balanceOf(user1.address)).eq(0)
    expect(await eth.balanceOf(user1.address)).gt(expandDecimals(7, 18))
    expect(await eth.balanceOf(user1.address)).lt(expandDecimals(8, 18))

    expect(await stakedGmxTracker.depositBalances(user1.address, gmx.address)).eq(expandDecimals(200, 18))
    expect(await stakedGmxTracker.depositBalances(user1.address, esGmx.address)).gt(expandDecimals(3571, 18))
    expect(await stakedGmxTracker.depositBalances(user1.address, esGmx.address)).lt(expandDecimals(3572, 18))
    expect(await feeGmxTracker.depositBalances(user1.address, bnGmx.address)).gt("540000000000000000") // 0.54
    expect(await feeGmxTracker.depositBalances(user1.address, bnGmx.address)).lt("560000000000000000") // 0.56

    await gmxVester.connect(user1).deposit(expandDecimals(365, 18))
    await nlpVester.connect(user1).deposit(expandDecimals(365 * 2, 18))

    expect(await ethBalance1.sub(ethBalance0)).gt(expandDecimals(7, 18))
    expect(await ethBalance1.sub(ethBalance0)).lt(expandDecimals(8, 18))
    expect(await gmx.balanceOf(user1.address)).eq(0)
    expect(await esGmx.balanceOf(user1.address)).gt(expandDecimals(3571 - 365 * 3, 18))
    expect(await esGmx.balanceOf(user1.address)).lt(expandDecimals(3572 - 365 * 3, 18))
    expect(await bnGmx.balanceOf(user1.address)).eq(0)
    expect(await nlp.balanceOf(user1.address)).eq(0)
    expect(await eth.balanceOf(user1.address)).gt(expandDecimals(7, 18))
    expect(await eth.balanceOf(user1.address)).lt(expandDecimals(8, 18))

    expect(await stakedGmxTracker.depositBalances(user1.address, gmx.address)).eq(expandDecimals(200, 18))
    expect(await stakedGmxTracker.depositBalances(user1.address, esGmx.address)).gt(expandDecimals(3571, 18))
    expect(await stakedGmxTracker.depositBalances(user1.address, esGmx.address)).lt(expandDecimals(3572, 18))
    expect(await feeGmxTracker.depositBalances(user1.address, bnGmx.address)).gt("540000000000000000") // 0.54
    expect(await feeGmxTracker.depositBalances(user1.address, bnGmx.address)).lt("560000000000000000") // 0.56

    await increaseTime(provider, 24 * 60 * 60)
    await mineBlock(provider)

    await rewardRouterV2.connect(user1).handleRewards(
      true, // _shouldClaimGmx
      false, // _shouldStakeGmx
      false, // _shouldClaimEsGmx
      false, // _shouldStakeEsGmx
      false, // _shouldStakeMultiplierPoints
      false, // _shouldClaimWeth
      false // _shouldConvertWethToEth
    )

    expect(await ethBalance1.sub(ethBalance0)).gt(expandDecimals(7, 18))
    expect(await ethBalance1.sub(ethBalance0)).lt(expandDecimals(8, 18))
    expect(await gmx.balanceOf(user1.address)).gt("2900000000000000000") // 2.9
    expect(await gmx.balanceOf(user1.address)).lt("3100000000000000000") // 3.1
    expect(await esGmx.balanceOf(user1.address)).gt(expandDecimals(3571 - 365 * 3, 18))
    expect(await esGmx.balanceOf(user1.address)).lt(expandDecimals(3572 - 365 * 3, 18))
    expect(await bnGmx.balanceOf(user1.address)).eq(0)
    expect(await nlp.balanceOf(user1.address)).eq(0)
    expect(await eth.balanceOf(user1.address)).gt(expandDecimals(7, 18))
    expect(await eth.balanceOf(user1.address)).lt(expandDecimals(8, 18))

    expect(await stakedGmxTracker.depositBalances(user1.address, gmx.address)).eq(expandDecimals(200, 18))
    expect(await stakedGmxTracker.depositBalances(user1.address, esGmx.address)).gt(expandDecimals(3571, 18))
    expect(await stakedGmxTracker.depositBalances(user1.address, esGmx.address)).lt(expandDecimals(3572, 18))
    expect(await feeGmxTracker.depositBalances(user1.address, bnGmx.address)).gt("540000000000000000") // 0.54
    expect(await feeGmxTracker.depositBalances(user1.address, bnGmx.address)).lt("560000000000000000") // 0.56
  })

  it("StakedNlp", async () => {
    await eth.mint(feeNlpDistributor.address, expandDecimals(100, 18))
    await feeNlpDistributor.setTokensPerInterval("41335970000000") // 0.00004133597 ETH per second

    await bnb.mint(user1.address, expandDecimals(1, 18))
    await bnb.connect(user1).approve(nlpManager.address, expandDecimals(1, 18))
    await rewardRouter.connect(user1).mintAndStakeNlp(
      bnb.address,
      expandDecimals(1, 18),
      expandDecimals(299, 18),
      expandDecimals(299, 18)
    )

    expect(await feeNlpTracker.stakedAmounts(user1.address)).eq(expandDecimals(2991, 17))
    expect(await feeNlpTracker.depositBalances(user1.address, nlp.address)).eq(expandDecimals(2991, 17))

    expect(await stakedNlpTracker.stakedAmounts(user1.address)).eq(expandDecimals(2991, 17))
    expect(await stakedNlpTracker.depositBalances(user1.address, feeNlpTracker.address)).eq(expandDecimals(2991, 17))

    const stakedNlp = await deployContract("StakedNlp", [nlp.address, nlpManager.address, stakedNlpTracker.address, feeNlpTracker.address])

    await expect(stakedNlp.connect(user2).transferFrom(user1.address, user3.address, expandDecimals(2991, 17)))
      .to.be.revertedWith("StakedNlp: transfer amount exceeds allowance")

    await stakedNlp.connect(user1).approve(user2.address, expandDecimals(2991, 17))

    await expect(stakedNlp.connect(user2).transferFrom(user1.address, user3.address, expandDecimals(2991, 17)))
      .to.be.revertedWith("StakedNlp: cooldown duration not yet passed")

    await increaseTime(provider, 24 * 60 * 60 + 10)
    await mineBlock(provider)

    await expect(stakedNlp.connect(user2).transferFrom(user1.address, user3.address, expandDecimals(2991, 17)))
      .to.be.revertedWith("RewardTracker: forbidden")

    await timelock.signalSetHandler(stakedNlpTracker.address, stakedNlp.address, true)
    await increaseTime(provider, 20)
    await mineBlock(provider)
    await timelock.setHandler(stakedNlpTracker.address, stakedNlp.address, true)

    await expect(stakedNlp.connect(user2).transferFrom(user1.address, user3.address, expandDecimals(2991, 17)))
      .to.be.revertedWith("RewardTracker: forbidden")

    await timelock.signalSetHandler(feeNlpTracker.address, stakedNlp.address, true)
    await increaseTime(provider, 20)
    await mineBlock(provider)
    await timelock.setHandler(feeNlpTracker.address, stakedNlp.address, true)

    expect(await feeNlpTracker.stakedAmounts(user1.address)).eq(expandDecimals(2991, 17))
    expect(await feeNlpTracker.depositBalances(user1.address, nlp.address)).eq(expandDecimals(2991, 17))

    expect(await stakedNlpTracker.stakedAmounts(user1.address)).eq(expandDecimals(2991, 17))
    expect(await stakedNlpTracker.depositBalances(user1.address, feeNlpTracker.address)).eq(expandDecimals(2991, 17))

    expect(await feeNlpTracker.stakedAmounts(user3.address)).eq(0)
    expect(await feeNlpTracker.depositBalances(user3.address, nlp.address)).eq(0)

    expect(await stakedNlpTracker.stakedAmounts(user3.address)).eq(0)
    expect(await stakedNlpTracker.depositBalances(user3.address, feeNlpTracker.address)).eq(0)

    await stakedNlp.connect(user2).transferFrom(user1.address, user3. address, expandDecimals(2991, 17))

    expect(await feeNlpTracker.stakedAmounts(user1.address)).eq(0)
    expect(await feeNlpTracker.depositBalances(user1.address, nlp.address)).eq(0)

    expect(await stakedNlpTracker.stakedAmounts(user1.address)).eq(0)
    expect(await stakedNlpTracker.depositBalances(user1.address, feeNlpTracker.address)).eq(0)

    expect(await feeNlpTracker.stakedAmounts(user3.address)).eq(expandDecimals(2991, 17))
    expect(await feeNlpTracker.depositBalances(user3.address, nlp.address)).eq(expandDecimals(2991, 17))

    expect(await stakedNlpTracker.stakedAmounts(user3.address)).eq(expandDecimals(2991, 17))
    expect(await stakedNlpTracker.depositBalances(user3.address, feeNlpTracker.address)).eq(expandDecimals(2991, 17))

    await expect(stakedNlp.connect(user2).transferFrom(user3.address, user1.address, expandDecimals(3000, 17)))
      .to.be.revertedWith("StakedNlp: transfer amount exceeds allowance")

    await stakedNlp.connect(user3).approve(user2.address, expandDecimals(3000, 17))

    await expect(stakedNlp.connect(user2).transferFrom(user3.address, user1.address, expandDecimals(3000, 17)))
      .to.be.revertedWith("RewardTracker: _amount exceeds stakedAmount")

    await stakedNlp.connect(user2).transferFrom(user3.address, user1.address, expandDecimals(1000, 17))

    expect(await feeNlpTracker.stakedAmounts(user1.address)).eq(expandDecimals(1000, 17))
    expect(await feeNlpTracker.depositBalances(user1.address, nlp.address)).eq(expandDecimals(1000, 17))

    expect(await stakedNlpTracker.stakedAmounts(user1.address)).eq(expandDecimals(1000, 17))
    expect(await stakedNlpTracker.depositBalances(user1.address, feeNlpTracker.address)).eq(expandDecimals(1000, 17))

    expect(await feeNlpTracker.stakedAmounts(user3.address)).eq(expandDecimals(1991, 17))
    expect(await feeNlpTracker.depositBalances(user3.address, nlp.address)).eq(expandDecimals(1991, 17))

    expect(await stakedNlpTracker.stakedAmounts(user3.address)).eq(expandDecimals(1991, 17))
    expect(await stakedNlpTracker.depositBalances(user3.address, feeNlpTracker.address)).eq(expandDecimals(1991, 17))

    await stakedNlp.connect(user3).transfer(user1.address, expandDecimals(1500, 17))

    expect(await feeNlpTracker.stakedAmounts(user1.address)).eq(expandDecimals(2500, 17))
    expect(await feeNlpTracker.depositBalances(user1.address, nlp.address)).eq(expandDecimals(2500, 17))

    expect(await stakedNlpTracker.stakedAmounts(user1.address)).eq(expandDecimals(2500, 17))
    expect(await stakedNlpTracker.depositBalances(user1.address, feeNlpTracker.address)).eq(expandDecimals(2500, 17))

    expect(await feeNlpTracker.stakedAmounts(user3.address)).eq(expandDecimals(491, 17))
    expect(await feeNlpTracker.depositBalances(user3.address, nlp.address)).eq(expandDecimals(491, 17))

    expect(await stakedNlpTracker.stakedAmounts(user3.address)).eq(expandDecimals(491, 17))
    expect(await stakedNlpTracker.depositBalances(user3.address, feeNlpTracker.address)).eq(expandDecimals(491, 17))

    await expect(stakedNlp.connect(user3).transfer(user1.address, expandDecimals(492, 17)))
      .to.be.revertedWith("RewardTracker: _amount exceeds stakedAmount")

    expect(await bnb.balanceOf(user1.address)).eq(0)

    await rewardRouter.connect(user1).unstakeAndRedeemNlp(
      bnb.address,
      expandDecimals(2500, 17),
      "830000000000000000", // 0.83
      user1.address
    )

    expect(await bnb.balanceOf(user1.address)).eq("830833333333333333")

    await usdg.addVault(nlpManager.address)

    expect(await bnb.balanceOf(user3.address)).eq("0")

    await rewardRouter.connect(user3).unstakeAndRedeemNlp(
      bnb.address,
      expandDecimals(491, 17),
      "160000000000000000", // 0.16
      user3.address
    )

    expect(await bnb.balanceOf(user3.address)).eq("163175666666666666")
  })

  it("FeeNlp", async () => {
    await eth.mint(feeNlpDistributor.address, expandDecimals(100, 18))
    await feeNlpDistributor.setTokensPerInterval("41335970000000") // 0.00004133597 ETH per second

    await bnb.mint(user1.address, expandDecimals(1, 18))
    await bnb.connect(user1).approve(nlpManager.address, expandDecimals(1, 18))
    await rewardRouter.connect(user1).mintAndStakeNlp(
      bnb.address,
      expandDecimals(1, 18),
      expandDecimals(299, 18),
      expandDecimals(299, 18)
    )

    expect(await feeNlpTracker.stakedAmounts(user1.address)).eq(expandDecimals(2991, 17))
    expect(await feeNlpTracker.depositBalances(user1.address, nlp.address)).eq(expandDecimals(2991, 17))

    expect(await stakedNlpTracker.stakedAmounts(user1.address)).eq(expandDecimals(2991, 17))
    expect(await stakedNlpTracker.depositBalances(user1.address, feeNlpTracker.address)).eq(expandDecimals(2991, 17))

    const nlpBalance = await deployContract("NlpBalance", [nlpManager.address, stakedNlpTracker.address])

    await expect(nlpBalance.connect(user2).transferFrom(user1.address, user3.address, expandDecimals(2991, 17)))
      .to.be.revertedWith("NlpBalance: transfer amount exceeds allowance")

    await nlpBalance.connect(user1).approve(user2.address, expandDecimals(2991, 17))

    await expect(nlpBalance.connect(user2).transferFrom(user1.address, user3.address, expandDecimals(2991, 17)))
      .to.be.revertedWith("NlpBalance: cooldown duration not yet passed")

    await increaseTime(provider, 24 * 60 * 60 + 10)
    await mineBlock(provider)

    await expect(nlpBalance.connect(user2).transferFrom(user1.address, user3.address, expandDecimals(2991, 17)))
      .to.be.revertedWith("RewardTracker: transfer amount exceeds allowance")

    await timelock.signalSetHandler(stakedNlpTracker.address, nlpBalance.address, true)
    await increaseTime(provider, 20)
    await mineBlock(provider)
    await timelock.setHandler(stakedNlpTracker.address, nlpBalance.address, true)

    expect(await feeNlpTracker.stakedAmounts(user1.address)).eq(expandDecimals(2991, 17))
    expect(await feeNlpTracker.depositBalances(user1.address, nlp.address)).eq(expandDecimals(2991, 17))

    expect(await stakedNlpTracker.stakedAmounts(user1.address)).eq(expandDecimals(2991, 17))
    expect(await stakedNlpTracker.depositBalances(user1.address, feeNlpTracker.address)).eq(expandDecimals(2991, 17))
    expect(await stakedNlpTracker.balanceOf(user1.address)).eq(expandDecimals(2991, 17))

    expect(await feeNlpTracker.stakedAmounts(user3.address)).eq(0)
    expect(await feeNlpTracker.depositBalances(user3.address, nlp.address)).eq(0)

    expect(await stakedNlpTracker.stakedAmounts(user3.address)).eq(0)
    expect(await stakedNlpTracker.depositBalances(user3.address, feeNlpTracker.address)).eq(0)
    expect(await stakedNlpTracker.balanceOf(user3.address)).eq(0)

    await nlpBalance.connect(user2).transferFrom(user1.address, user3.address, expandDecimals(2991, 17))

    expect(await feeNlpTracker.stakedAmounts(user1.address)).eq(expandDecimals(2991, 17))
    expect(await feeNlpTracker.depositBalances(user1.address, nlp.address)).eq(expandDecimals(2991, 17))

    expect(await stakedNlpTracker.stakedAmounts(user1.address)).eq(expandDecimals(2991, 17))
    expect(await stakedNlpTracker.depositBalances(user1.address, feeNlpTracker.address)).eq(expandDecimals(2991, 17))
    expect(await stakedNlpTracker.balanceOf(user1.address)).eq(0)

    expect(await feeNlpTracker.stakedAmounts(user3.address)).eq(0)
    expect(await feeNlpTracker.depositBalances(user3.address, nlp.address)).eq(0)

    expect(await stakedNlpTracker.stakedAmounts(user3.address)).eq(0)
    expect(await stakedNlpTracker.depositBalances(user3.address, feeNlpTracker.address)).eq(0)
    expect(await stakedNlpTracker.balanceOf(user3.address)).eq(expandDecimals(2991, 17))

    await expect(rewardRouter.connect(user1).unstakeAndRedeemNlp(
      bnb.address,
      expandDecimals(2991, 17),
      "0",
      user1.address
    )).to.be.revertedWith("RewardTracker: burn amount exceeds balance")

    await nlpBalance.connect(user3).approve(user2.address, expandDecimals(3000, 17))

    await expect(nlpBalance.connect(user2).transferFrom(user3.address, user1.address, expandDecimals(2992, 17)))
      .to.be.revertedWith("RewardTracker: transfer amount exceeds balance")

    await nlpBalance.connect(user2).transferFrom(user3.address, user1.address, expandDecimals(2991, 17))

    expect(await bnb.balanceOf(user1.address)).eq(0)

    await rewardRouter.connect(user1).unstakeAndRedeemNlp(
      bnb.address,
      expandDecimals(2991, 17),
      "0",
      user1.address
    )

    expect(await bnb.balanceOf(user1.address)).eq("994009000000000000")
  })

  it("syncs voting power", async () => {
    await gmx.setMinter(wallet.address, true)
    await gmx.mint(user1.address, expandDecimals(100, 18))
    await esGmx.mint(user1.address, expandDecimals(25, 18))
    await bnGmx.mint(user1.address, expandDecimals(1000, 18))
    await govToken.setMinter(rewardRouter.address, true)

    expect(await gmx.balanceOf(user1.address)).eq(expandDecimals(100, 18))
    await gmx.connect(user1).approve(stakedGmxTracker.address, expandDecimals(1000, 18))
    await rewardRouter.connect(user1).stakeGmx(expandDecimals(100, 18))
    expect(await gmx.balanceOf(user1.address)).eq(0)

    expect(await esGmx.balanceOf(user1.address)).eq(expandDecimals(25, 18))
    await rewardRouter.connect(user1).stakeEsGmx(expandDecimals(25, 18))
    expect(await esGmx.balanceOf(user1.address)).eq(0)

    expect(await feeGmxTracker.stakedAmounts(user1.address)).eq(expandDecimals(125, 18))

    expect(await govToken.balanceOf(user1.address)).eq(0)

    await rewardRouter.setVotingPowerType(1)

    await gmx.mint(user1.address, expandDecimals(1, 18))
    await rewardRouter.connect(user1).stakeGmx(expandDecimals(1, 18))

    expect(await feeGmxTracker.stakedAmounts(user1.address)).eq(expandDecimals(126, 18))
    expect(await govToken.balanceOf(user1.address)).eq(expandDecimals(126, 18))

    await rewardRouter.connect(user1).handleRewards(
      false, // _shouldClaimGmx
      false, // _shouldStakeGmx
      false, // _shouldClaimEsGmx
      false, // _shouldStakeEsGmx
      true, // _shouldStakeMultiplierPoints
      false, // _shouldClaimWeth
      false // _shouldConvertWethToEth
    )

    expect(await feeGmxTracker.stakedAmounts(user1.address)).eq(expandDecimals(378, 18))
    expect(await govToken.balanceOf(user1.address)).eq(expandDecimals(126, 18))

    await rewardRouter.setVotingPowerType(2)

    await rewardRouter.connect(user1).handleRewards(
      false, // _shouldClaimGmx
      false, // _shouldStakeGmx
      false, // _shouldClaimEsGmx
      false, // _shouldStakeEsGmx
      true, // _shouldStakeMultiplierPoints
      false, // _shouldClaimWeth
      false // _shouldConvertWethToEth
    )

    expect(await feeGmxTracker.stakedAmounts(user1.address)).eq(expandDecimals(378, 18))
    expect(await govToken.balanceOf(user1.address)).eq(expandDecimals(378, 18))
  })

  it("caps stakeable bnGMX", async () => {
    await gmx.setMinter(wallet.address, true)
    await gmx.mint(user1.address, expandDecimals(100, 18))
    await esGmx.mint(user1.address, expandDecimals(25, 18))
    await bnGmx.mint(user1.address, expandDecimals(1000, 18))

    expect(await gmx.balanceOf(user1.address)).eq(expandDecimals(100, 18))
    await gmx.connect(user1).approve(stakedGmxTracker.address, expandDecimals(100, 18))
    await rewardRouter.connect(user1).stakeGmx(expandDecimals(100, 18))
    expect(await gmx.balanceOf(user1.address)).eq(0)

    expect(await esGmx.balanceOf(user1.address)).eq(expandDecimals(25, 18))
    await rewardRouter.connect(user1).stakeEsGmx(expandDecimals(25, 18))
    expect(await esGmx.balanceOf(user1.address)).eq(0)

    expect(await feeGmxTracker.stakedAmounts(user1.address)).eq(expandDecimals(125, 18))

    expect(await bnGmx.balanceOf(user1.address)).eq(expandDecimals(1000, 18))
    await rewardRouter.connect(user1).handleRewards(
      false, // _shouldClaimGmx
      false, // _shouldStakeGmx
      false, // _shouldClaimEsGmx
      false, // _shouldStakeEsGmx
      true, // _shouldStakeMultiplierPoints
      false, // _shouldClaimWeth
      false // _shouldConvertWethToEth
    )
    expect(await bnGmx.balanceOf(user1.address)).gt(expandDecimals(749, 18))
    expect(await bnGmx.balanceOf(user1.address)).lt(expandDecimals(751, 18))

    expect(await feeGmxTracker.stakedAmounts(user1.address)).gt(expandDecimals(125 + 249, 18))
    expect(await feeGmxTracker.stakedAmounts(user1.address)).lt(expandDecimals(125 + 251, 18))
  })

  it("caps stakeable bnGMX while vesting is active", async () => {
    await gmx.setMinter(wallet.address, true)
    await gmx.mint(user1.address, expandDecimals(100, 18))
    await esGmx.mint(user1.address, expandDecimals(25, 18))
    await bnGmx.mint(user1.address, expandDecimals(1000, 18))

    expect(await gmx.balanceOf(user1.address)).eq(expandDecimals(100, 18))
    await gmx.connect(user1).approve(stakedGmxTracker.address, expandDecimals(100, 18))
    await rewardRouter.connect(user1).stakeGmx(expandDecimals(100, 18))
    expect(await gmx.balanceOf(user1.address)).eq(0)

    expect(await esGmx.balanceOf(user1.address)).eq(expandDecimals(25, 18))
    await rewardRouter.connect(user1).stakeEsGmx(expandDecimals(25, 18))
    expect(await esGmx.balanceOf(user1.address)).eq(0)

    expect(await feeGmxTracker.stakedAmounts(user1.address)).eq(expandDecimals(125, 18))

    expect(await bnGmx.balanceOf(user1.address)).eq(expandDecimals(1000, 18))
    await rewardRouter.setMaxBoostBasisPoints(100_000)

    await rewardRouter.connect(user1).handleRewards(
      false, // _shouldClaimGmx
      false, // _shouldStakeGmx
      false, // _shouldClaimEsGmx
      false, // _shouldStakeEsGmx
      true, // _shouldStakeMultiplierPoints
      false, // _shouldClaimWeth
      false // _shouldConvertWethToEth
    )

    expect(await bnGmx.balanceOf(user1.address)).eq(0)
    expect(await feeGmxTracker.stakedAmounts(user1.address)).closeTo(expandDecimals(1125, 18), expandDecimals(1, 18))
    expect(await feeGmxTracker.depositBalances(user1.address, bnGmx.address)).closeTo(expandDecimals(1000, 18), expandDecimals(1, 18))

    await gmxVester.setTransferredAverageStakedAmounts(user1.address, expandDecimals(1120, 18))
    await gmxVester.setTransferredCumulativeRewards(user1.address, expandDecimals(50, 18))

    await esGmx.mint(user1.address, expandDecimals(50, 18))

    expect(await gmxVester.balanceOf(user1.address)).eq(0)
    expect(await feeGmxTracker.balanceOf(user1.address)).closeTo(expandDecimals(1125, 18), expandDecimals(1, 18))

    await gmxVester.connect(user1).deposit(expandDecimals(50, 18))
    expect(await gmxVester.balanceOf(user1.address)).eq(expandDecimals(50, 18))
    expect(await gmxVester.pairAmounts(user1.address)).closeTo(expandDecimals(1120, 18), expandDecimals(1, 18))
    expect(await feeGmxTracker.balanceOf(user1.address)).closeTo(expandDecimals(5, 18), expandDecimals(1, 18))

    await rewardRouter.setMaxBoostBasisPoints(20_000)
    await expect(rewardRouter.batchCompoundForAccounts([user1.address])).to.be.revertedWith("RewardTracker: burn amount exceeds balance")

    const vesterCap = await deployContract("VesterCap", [
      gmxVester.address,
      stakedGmxTracker.address,
      bonusGmxTracker.address,
      feeGmxTracker.address,
      bnGmx.address,
      esGmx.address,
      20_000,
      25
    ])

    await timelock.signalSetHandler(feeGmxTracker.address, vesterCap.address, true);
    await timelock.signalSetHandler(gmxVester.address, vesterCap.address, true);
    await timelock.signalSetMinter(esGmx.address, vesterCap.address, true);

    await increaseTime(provider, 10)
    await mineBlock(provider)

    await timelock.setHandler(feeGmxTracker.address, vesterCap.address, true);
    await timelock.setHandler(gmxVester.address, vesterCap.address, true);
    await timelock.setMinter(esGmx.address, vesterCap.address, true);

    await expect(vesterCap.connect(user1).updateBnGmxForAccounts([user1.address])).to.be.revertedWith("Governable: forbidden")

    expect(await bnGmx.balanceOf(user1.address)).eq(0)
    expect(await esGmx.balanceOf(user1.address)).eq(0)
    expect(await gmxVester.bonusRewards(user1.address)).eq(0)

    await vesterCap.updateBnGmxForAccounts([user1.address])

    expect(await bnGmx.balanceOf(user1.address)).closeTo(expandDecimals(750, 18), expandDecimals(1, 18))
    expect(await esGmx.balanceOf(user1.address)).closeTo(expandDecimals(40, 18), expandDecimals(1, 18))
    expect(await gmxVester.bonusRewards(user1.address)).closeTo(expandDecimals(40, 18), expandDecimals(1, 18))

    expect(await gmxVester.balanceOf(user1.address)).eq(expandDecimals(50, 18))
    expect(await gmxVester.pairAmounts(user1.address)).closeTo(expandDecimals(1120, 18), expandDecimals(1, 18))
    expect(await feeGmxTracker.balanceOf(user1.address)).closeTo(expandDecimals(1, 18), expandDecimals(1, 18))
    expect(await feeGmxTracker.stakedAmounts(user1.address)).closeTo(expandDecimals(376, 18), expandDecimals(1, 18))
    expect(await feeGmxTracker.depositBalances(user1.address, bnGmx.address)).closeTo(expandDecimals(251, 18), expandDecimals(1, 18))

    // due to the transfer out of feeGmxTracker tokens from the vester
    // the vester will not have sufficient feeGmxTracker balance to
    // complete the withdrawal for user1
    // to allow the withdrawal, deposit feeGmxTracker tokens to the
    // vester using user2
    await gmx.mint(user2.address, expandDecimals(1000, 18))
    await gmx.connect(user2).approve(stakedGmxTracker.address, expandDecimals(1000, 18))
    await rewardRouter.connect(user2).stakeGmx(expandDecimals(1000, 18))

    await esGmx.mint(user2.address, expandDecimals(1, 18))

    await gmxVester.setTransferredAverageStakedAmounts(user2.address, expandDecimals(1000, 18))
    await gmxVester.setTransferredCumulativeRewards(user2.address, expandDecimals(1, 18))
    await gmxVester.connect(user2).deposit(expandDecimals(1, 18))

    await gmx.mint(gmxVester.address, expandDecimals(25, 18))

    // check that calling updateBnGmxForAccounts for the same account does not re-mint esGMX
    await vesterCap.updateBnGmxForAccounts([user1.address])
    expect(await esGmx.balanceOf(user1.address)).closeTo(expandDecimals(40, 18), expandDecimals(1, 18))

    await gmxVester.connect(user1).withdraw()

    expect(await gmxVester.balanceOf(user1.address)).eq(0)
    expect(await gmxVester.pairAmounts(user1.address)).eq(0)
    expect(await feeGmxTracker.balanceOf(user1.address)).closeTo(expandDecimals(1120, 18), expandDecimals(1, 18))
    expect(await feeGmxTracker.stakedAmounts(user1.address)).eq(expandDecimals(375, 18))
    expect(await feeGmxTracker.depositBalances(user1.address, bnGmx.address)).eq(expandDecimals(250, 18))

    await expect(vesterCap.connect(user0).syncFeeGmxTrackerBalance(user1.address)).to.be.revertedWith("Governable: forbidden")

    await vesterCap.syncFeeGmxTrackerBalance(user1.address)

    expect(await feeGmxTracker.balanceOf(user1.address)).eq(expandDecimals(375, 18))
    expect(await feeGmxTracker.stakedAmounts(user1.address)).eq(expandDecimals(375, 18))
    expect(await feeGmxTracker.depositBalances(user1.address, bnGmx.address)).eq(expandDecimals(250, 18))
  })

  it("allows migration", async () => {
    const rewardRouterV2 = await deployContract("RewardRouterV2", [])
    await rewardRouterV2.initialize(
      eth.address,
      gmx.address,
      esGmx.address,
      bnGmx.address,
      nlp.address,
      stakedGmxTracker.address,
      bonusGmxTracker.address,
      feeGmxTracker.address,
      feeNlpTracker.address,
      stakedNlpTracker.address,
      nlpManager.address,
      gmxVester.address,
      nlpVester.address,
      govToken.address
    )

    const timelockCaller = await deployContract("BeefyTimelockCaller", [])
    const migrator = await deployContract("BeefyMigrator", [
      wallet.address,
      stakedGmxTracker.address,
      bonusGmxTracker.address,
      feeGmxTracker.address,
      stakedNlpTracker.address,
      feeNlpTracker.address,
      gmxVester.address,
      nlpVester.address,
      esGmx.address,
      bnGmx.address,
      rewardRouterV2.address,
      timelockCaller.address
    ])
    await timelockCaller.initialize(1, migrator.address)

    await expect(migrator.migrate()).to.be.revertedWith("forbidden")

    await timelock.signalSetGovRequester(migrator.address, true)

    await increaseTime(provider, 24 * 60 * 60)
    await mineBlock(provider)

    await timelock.setGovRequester(migrator.address, true)

    expect(await stakedGmxTracker.gov()).eq(timelock.address)
    expect(await bonusGmxTracker.gov()).eq(timelock.address)
    expect(await feeGmxTracker.gov()).eq(timelock.address)
    expect(await stakedNlpTracker.gov()).eq(timelock.address)
    expect(await feeNlpTracker.gov()).eq(timelock.address)
    expect(await gmxVester.gov()).eq(timelock.address)
    expect(await nlpVester.gov()).eq(timelock.address)
    expect(await esGmx.gov()).eq(timelock.address)
    expect(await bnGmx.gov()).eq(timelock.address)

    await migrator.migrate()

    expect(await stakedGmxTracker.gov()).eq(timelock.address)
    expect(await bonusGmxTracker.gov()).eq(timelock.address)
    expect(await feeGmxTracker.gov()).eq(timelock.address)
    expect(await stakedNlpTracker.gov()).eq(timelock.address)
    expect(await feeNlpTracker.gov()).eq(timelock.address)
    expect(await gmxVester.gov()).eq(timelock.address)
    expect(await nlpVester.gov()).eq(timelock.address)
    expect(await esGmx.gov()).eq(timelock.address)
    expect(await bnGmx.gov()).eq(timelock.address)

    const mockGovRequester = await deployContract("MockGovRequester", [])
    await timelock.signalSetGovRequester(mockGovRequester.address, true)

    await increaseTime(provider, 24 * 60 * 60)
    await mineBlock(provider)

    await timelock.setGovRequester(mockGovRequester.address, true)

    await expect(mockGovRequester.migrate(timelock.address, [stakedGmxTracker.address]))
      .to.be.revertedWith("gov != this")
  })
})
