// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "../libraries/math/SafeMath.sol";
import "../libraries/token/IERC20.sol";
import "../libraries/token/SafeERC20.sol";
import "../libraries/utils/ReentrancyGuard.sol";
import "../libraries/utils/Address.sol";

import "./interfaces/IRewardTracker.sol";
import "../tokens/interfaces/IMintable.sol";
import "../tokens/interfaces/IWETH.sol";
import "../core/interfaces/ISlpManager.sol";
import "../access/Governable.sol";

contract RewardRouter is ReentrancyGuard, Governable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using Address for address payable;

    bool public isInitialized;

    address public weth;

    address public gmx;
    address public esGmx;
    address public bnGmx;

    address public slp; // GMX Liquidity Provider token

    address public stakedGmxTracker;
    address public bonusGmxTracker;
    address public feeGmxTracker;

    address public stakedSlpTracker;
    address public feeSlpTracker;

    address public slpManager;

    event StakeGmx(address account, uint256 amount);
    event UnstakeGmx(address account, uint256 amount);

    event StakeSlp(address account, uint256 amount);
    event UnstakeSlp(address account, uint256 amount);

    receive() external payable {
        require(msg.sender == weth, "Router: invalid sender");
    }

    function initialize(
        address _weth,
        address _gmx,
        address _esGmx,
        address _bnGmx,
        address _slp,
        address _stakedGmxTracker,
        address _bonusGmxTracker,
        address _feeGmxTracker,
        address _feeSlpTracker,
        address _stakedSlpTracker,
        address _slpManager
    ) external onlyGov {
        require(!isInitialized, "RewardRouter: already initialized");
        isInitialized = true;

        weth = _weth;

        gmx = _gmx;
        esGmx = _esGmx;
        bnGmx = _bnGmx;

        slp = _slp;

        stakedGmxTracker = _stakedGmxTracker;
        bonusGmxTracker = _bonusGmxTracker;
        feeGmxTracker = _feeGmxTracker;

        feeSlpTracker = _feeSlpTracker;
        stakedSlpTracker = _stakedSlpTracker;

        slpManager = _slpManager;
    }

    // to help users who accidentally send their tokens to this contract
    function withdrawToken(address _token, address _account, uint256 _amount) external onlyGov {
        IERC20(_token).safeTransfer(_account, _amount);
    }

    function batchStakeGmxForAccount(address[] memory _accounts, uint256[] memory _amounts) external nonReentrant onlyGov {
        address _gmx = gmx;
        for (uint256 i = 0; i < _accounts.length; i++) {
            _stakeGmx(msg.sender, _accounts[i], _gmx, _amounts[i]);
        }
    }

    function stakeGmxForAccount(address _account, uint256 _amount) external nonReentrant onlyGov {
        _stakeGmx(msg.sender, _account, gmx, _amount);
    }

    function stakeGmx(uint256 _amount) external nonReentrant {
        _stakeGmx(msg.sender, msg.sender, gmx, _amount);
    }

    function stakeEsGmx(uint256 _amount) external nonReentrant {
        _stakeGmx(msg.sender, msg.sender, esGmx, _amount);
    }

    function unstakeGmx(uint256 _amount) external nonReentrant {
        _unstakeGmx(msg.sender, gmx, _amount);
    }

    function unstakeEsGmx(uint256 _amount) external nonReentrant {
        _unstakeGmx(msg.sender, esGmx, _amount);
    }

    function mintAndStakeSlp(address _token, uint256 _amount, uint256 _minUsdg, uint256 _minSlp) external nonReentrant returns (uint256) {
        require(_amount > 0, "RewardRouter: invalid _amount");

        address account = msg.sender;
        uint256 slpAmount = ISlpManager(slpManager).addLiquidityForAccount(account, account, _token, _amount, _minUsdg, _minSlp);
        IRewardTracker(feeSlpTracker).stakeForAccount(account, account, slp, slpAmount);
        IRewardTracker(stakedSlpTracker).stakeForAccount(account, account, feeSlpTracker, slpAmount);

        emit StakeSlp(account, slpAmount);

        return slpAmount;
    }

    function mintAndStakeSlpETH(uint256 _minUsdg, uint256 _minSlp) external payable nonReentrant returns (uint256) {
        require(msg.value > 0, "RewardRouter: invalid msg.value");

        IWETH(weth).deposit{value: msg.value}();
        IERC20(weth).approve(slpManager, msg.value);

        address account = msg.sender;
        uint256 slpAmount = ISlpManager(slpManager).addLiquidityForAccount(address(this), account, weth, msg.value, _minUsdg, _minSlp);

        IRewardTracker(feeSlpTracker).stakeForAccount(account, account, slp, slpAmount);
        IRewardTracker(stakedSlpTracker).stakeForAccount(account, account, feeSlpTracker, slpAmount);

        emit StakeSlp(account, slpAmount);

        return slpAmount;
    }

    function unstakeAndRedeemSlp(address _tokenOut, uint256 _slpAmount, uint256 _minOut, address _receiver) external nonReentrant returns (uint256) {
        require(_slpAmount > 0, "RewardRouter: invalid _slpAmount");

        address account = msg.sender;
        IRewardTracker(stakedSlpTracker).unstakeForAccount(account, feeSlpTracker, _slpAmount, account);
        IRewardTracker(feeSlpTracker).unstakeForAccount(account, slp, _slpAmount, account);
        uint256 amountOut = ISlpManager(slpManager).removeLiquidityForAccount(account, _tokenOut, _slpAmount, _minOut, _receiver);

        emit UnstakeSlp(account, _slpAmount);

        return amountOut;
    }

    function unstakeAndRedeemSlpETH(uint256 _slpAmount, uint256 _minOut, address payable _receiver) external nonReentrant returns (uint256) {
        require(_slpAmount > 0, "RewardRouter: invalid _slpAmount");

        address account = msg.sender;
        IRewardTracker(stakedSlpTracker).unstakeForAccount(account, feeSlpTracker, _slpAmount, account);
        IRewardTracker(feeSlpTracker).unstakeForAccount(account, slp, _slpAmount, account);
        uint256 amountOut = ISlpManager(slpManager).removeLiquidityForAccount(account, weth, _slpAmount, _minOut, address(this));

        IWETH(weth).withdraw(amountOut);

        _receiver.sendValue(amountOut);

        emit UnstakeSlp(account, _slpAmount);

        return amountOut;
    }

    function claim() external nonReentrant {
        address account = msg.sender;

        IRewardTracker(feeGmxTracker).claimForAccount(account, account);
        IRewardTracker(feeSlpTracker).claimForAccount(account, account);

        IRewardTracker(stakedGmxTracker).claimForAccount(account, account);
        IRewardTracker(stakedSlpTracker).claimForAccount(account, account);
    }

    function claimEsGmx() external nonReentrant {
        address account = msg.sender;

        IRewardTracker(stakedGmxTracker).claimForAccount(account, account);
        IRewardTracker(stakedSlpTracker).claimForAccount(account, account);
    }

    function claimFees() external nonReentrant {
        address account = msg.sender;

        IRewardTracker(feeGmxTracker).claimForAccount(account, account);
        IRewardTracker(feeSlpTracker).claimForAccount(account, account);
    }

    function compound() external nonReentrant {
        _compound(msg.sender);
    }

    function compoundForAccount(address _account) external nonReentrant onlyGov {
        _compound(_account);
    }

    function batchCompoundForAccounts(address[] memory _accounts) external nonReentrant onlyGov {
        for (uint256 i = 0; i < _accounts.length; i++) {
            _compound(_accounts[i]);
        }
    }

    function _compound(address _account) private {
        _compoundGmx(_account);
        _compoundSlp(_account);
    }

    function _compoundGmx(address _account) private {
        uint256 esGmxAmount = IRewardTracker(stakedGmxTracker).claimForAccount(_account, _account);
        if (esGmxAmount > 0) {
            _stakeGmx(_account, _account, esGmx, esGmxAmount);
        }

        uint256 bnGmxAmount = IRewardTracker(bonusGmxTracker).claimForAccount(_account, _account);
        if (bnGmxAmount > 0) {
            IRewardTracker(feeGmxTracker).stakeForAccount(_account, _account, bnGmx, bnGmxAmount);
        }
    }

    function _compoundSlp(address _account) private {
        uint256 esGmxAmount = IRewardTracker(stakedSlpTracker).claimForAccount(_account, _account);
        if (esGmxAmount > 0) {
            _stakeGmx(_account, _account, esGmx, esGmxAmount);
        }
    }

    function _stakeGmx(address _fundingAccount, address _account, address _token, uint256 _amount) private {
        require(_amount > 0, "RewardRouter: invalid _amount");

        IRewardTracker(stakedGmxTracker).stakeForAccount(_fundingAccount, _account, _token, _amount);
        IRewardTracker(bonusGmxTracker).stakeForAccount(_account, _account, stakedGmxTracker, _amount);
        IRewardTracker(feeGmxTracker).stakeForAccount(_account, _account, bonusGmxTracker, _amount);

        emit StakeGmx(_account, _amount);
    }

    function _unstakeGmx(address _account, address _token, uint256 _amount) private {
        require(_amount > 0, "RewardRouter: invalid _amount");

        uint256 balance = IRewardTracker(stakedGmxTracker).stakedAmounts(_account);

        IRewardTracker(feeGmxTracker).unstakeForAccount(_account, bonusGmxTracker, _amount, _account);
        IRewardTracker(bonusGmxTracker).unstakeForAccount(_account, stakedGmxTracker, _amount, _account);
        IRewardTracker(stakedGmxTracker).unstakeForAccount(_account, _token, _amount, _account);

        uint256 bnGmxAmount = IRewardTracker(bonusGmxTracker).claimForAccount(_account, _account);
        if (bnGmxAmount > 0) {
            IRewardTracker(feeGmxTracker).stakeForAccount(_account, _account, bnGmx, bnGmxAmount);
        }

        uint256 stakedBnGmx = IRewardTracker(feeGmxTracker).depositBalances(_account, bnGmx);
        if (stakedBnGmx > 0) {
            uint256 reductionAmount = stakedBnGmx.mul(_amount).div(balance);
            IRewardTracker(feeGmxTracker).unstakeForAccount(_account, bnGmx, reductionAmount, _account);
            IMintable(bnGmx).burn(_account, reductionAmount);
        }

        emit UnstakeGmx(_account, _amount);
    }
}
