// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "../libraries/math/SafeMath.sol";
import "../libraries/token/IERC20.sol";

import "../core/interfaces/ISlpManager.sol";

import "./interfaces/IRewardTracker.sol";
import "./interfaces/IRewardTracker.sol";

// provide a way to transfer staked SLP tokens by unstaking from the sender
// and staking for the receiver
// tests in RewardRouterV2.js
contract StakedSlp {
    using SafeMath for uint256;

    string public constant name = "StakedSlp";
    string public constant symbol = "sSLP";
    uint8 public constant decimals = 18;

    address public slp;
    ISlpManager public slpManager;
    address public stakedSlpTracker;
    address public feeSlpTracker;

    mapping (address => mapping (address => uint256)) public allowances;

    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(
        address _slp,
        ISlpManager _slpManager,
        address _stakedSlpTracker,
        address _feeSlpTracker
    ) public {
        slp = _slp;
        slpManager = _slpManager;
        stakedSlpTracker = _stakedSlpTracker;
        feeSlpTracker = _feeSlpTracker;
    }

    function allowance(address _owner, address _spender) external view returns (uint256) {
        return allowances[_owner][_spender];
    }

    function approve(address _spender, uint256 _amount) external returns (bool) {
        _approve(msg.sender, _spender, _amount);
        return true;
    }

    function transfer(address _recipient, uint256 _amount) external returns (bool) {
        _transfer(msg.sender, _recipient, _amount);
        return true;
    }

    function transferFrom(address _sender, address _recipient, uint256 _amount) external returns (bool) {
        uint256 nextAllowance = allowances[_sender][msg.sender].sub(_amount, "StakedSlp: transfer amount exceeds allowance");
        _approve(_sender, msg.sender, nextAllowance);
        _transfer(_sender, _recipient, _amount);
        return true;
    }

    function balanceOf(address _account) external view returns (uint256) {
        return IRewardTracker(feeSlpTracker).depositBalances(_account, slp);
    }

    function totalSupply() external view returns (uint256) {
        return IERC20(stakedSlpTracker).totalSupply();
    }

    function _approve(address _owner, address _spender, uint256 _amount) private {
        require(_owner != address(0), "StakedSlp: approve from the zero address");
        require(_spender != address(0), "StakedSlp: approve to the zero address");

        allowances[_owner][_spender] = _amount;

        emit Approval(_owner, _spender, _amount);
    }

    function _transfer(address _sender, address _recipient, uint256 _amount) private {
        require(_sender != address(0), "StakedSlp: transfer from the zero address");
        require(_recipient != address(0), "StakedSlp: transfer to the zero address");

        require(
            slpManager.lastAddedAt(_sender).add(slpManager.cooldownDuration()) <= block.timestamp,
            "StakedSlp: cooldown duration not yet passed"
        );

        IRewardTracker(stakedSlpTracker).unstakeForAccount(_sender, feeSlpTracker, _amount, _sender);
        IRewardTracker(feeSlpTracker).unstakeForAccount(_sender, slp, _amount, _sender);

        IRewardTracker(feeSlpTracker).stakeForAccount(_sender, _recipient, slp, _amount);
        IRewardTracker(stakedSlpTracker).stakeForAccount(_recipient, _recipient, feeSlpTracker, _amount);
    }
}
