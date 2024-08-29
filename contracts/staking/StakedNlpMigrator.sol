// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "../libraries/math/SafeMath.sol";
import "../libraries/token/IERC20.sol";

import "../core/interfaces/INlpManager.sol";

import "./interfaces/IRewardTracker.sol";
import "./interfaces/IRewardTracker.sol";

import "../access/Governable.sol";

// provide a way to migrate staked NLP tokens by unstaking from the sender
// and staking for the receiver
// meant for a one-time use for a specified sender
// requires the contract to be added as a handler for stakedNlpTracker and feeNlpTracker
contract StakedNlpMigrator is Governable {
    using SafeMath for uint256;

    address public sender;
    address public nlp;
    address public stakedNlpTracker;
    address public feeNlpTracker;
    bool public isEnabled = true;

    constructor(
        address _sender,
        address _nlp,
        address _stakedNlpTracker,
        address _feeNlpTracker
    ) public {
        sender = _sender;
        nlp = _nlp;
        stakedNlpTracker = _stakedNlpTracker;
        feeNlpTracker = _feeNlpTracker;
    }

    function disable() external onlyGov {
        isEnabled = false;
    }

    function transfer(address _recipient, uint256 _amount) external onlyGov {
        _transfer(sender, _recipient, _amount);
    }

    function _transfer(address _sender, address _recipient, uint256 _amount) private {
        require(isEnabled, "StakedNlpMigrator: not enabled");
        require(_sender != address(0), "StakedNlpMigrator: transfer from the zero address");
        require(_recipient != address(0), "StakedNlpMigrator: transfer to the zero address");

        IRewardTracker(stakedNlpTracker).unstakeForAccount(_sender, feeNlpTracker, _amount, _sender);
        IRewardTracker(feeNlpTracker).unstakeForAccount(_sender, nlp, _amount, _sender);

        IRewardTracker(feeNlpTracker).stakeForAccount(_sender, _recipient, nlp, _amount);
        IRewardTracker(stakedNlpTracker).stakeForAccount(_recipient, _recipient, feeNlpTracker, _amount);
    }
}
