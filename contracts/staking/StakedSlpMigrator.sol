// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "../libraries/math/SafeMath.sol";
import "../libraries/token/IERC20.sol";

import "../core/interfaces/ISlpManager.sol";

import "./interfaces/IRewardTracker.sol";
import "./interfaces/IRewardTracker.sol";

import "../access/Governable.sol";

// provide a way to migrate staked SLP tokens by unstaking from the sender
// and staking for the receiver
// meant for a one-time use for a specified sender
// requires the contract to be added as a handler for stakedSlpTracker and feeSlpTracker
contract StakedSlpMigrator is Governable {
    using SafeMath for uint256;

    address public sender;
    address public slp;
    address public stakedSlpTracker;
    address public feeSlpTracker;
    bool public isEnabled = true;

    constructor(
        address _sender,
        address _slp,
        address _stakedSlpTracker,
        address _feeSlpTracker
    ) public {
        sender = _sender;
        slp = _slp;
        stakedSlpTracker = _stakedSlpTracker;
        feeSlpTracker = _feeSlpTracker;
    }

    function disable() external onlyGov {
        isEnabled = false;
    }

    function transfer(address _recipient, uint256 _amount) external onlyGov {
        _transfer(sender, _recipient, _amount);
    }

    function _transfer(address _sender, address _recipient, uint256 _amount) private {
        require(isEnabled, "StakedSlpMigrator: not enabled");
        require(_sender != address(0), "StakedSlpMigrator: transfer from the zero address");
        require(_recipient != address(0), "StakedSlpMigrator: transfer to the zero address");

        IRewardTracker(stakedSlpTracker).unstakeForAccount(_sender, feeSlpTracker, _amount, _sender);
        IRewardTracker(feeSlpTracker).unstakeForAccount(_sender, slp, _amount, _sender);

        IRewardTracker(feeSlpTracker).stakeForAccount(_sender, _recipient, slp, _amount);
        IRewardTracker(stakedSlpTracker).stakeForAccount(_recipient, _recipient, feeSlpTracker, _amount);
    }
}
