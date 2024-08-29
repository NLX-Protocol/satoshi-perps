// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "../libraries/math/SafeMath.sol";
import "../libraries/token/IERC20.sol";

import "../core/interfaces/INlpManager.sol";

import "./interfaces/IRewardTracker.sol";
import "./interfaces/IRewardTracker.sol";

// provide a way to transfer staked NLP tokens by unstaking from the sender
// and staking for the receiver
// tests in RewardRouterV2.js
contract StakedNlp {
    using SafeMath for uint256;

    string public constant name = "StakedNlp";
    string public constant symbol = "sNLP";
    uint8 public constant decimals = 18;

    address public nlp;
    INlpManager public nlpManager;
    address public stakedNlpTracker;
    address public feeNlpTracker;

    mapping (address => mapping (address => uint256)) public allowances;

    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(
        address _nlp,
        INlpManager _nlpManager,
        address _stakedNlpTracker,
        address _feeNlpTracker
    ) public {
        nlp = _nlp;
        nlpManager = _nlpManager;
        stakedNlpTracker = _stakedNlpTracker;
        feeNlpTracker = _feeNlpTracker;
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
        uint256 nextAllowance = allowances[_sender][msg.sender].sub(_amount, "StakedNlp: transfer amount exceeds allowance");
        _approve(_sender, msg.sender, nextAllowance);
        _transfer(_sender, _recipient, _amount);
        return true;
    }

    function balanceOf(address _account) external view returns (uint256) {
        return IRewardTracker(feeNlpTracker).depositBalances(_account, nlp);
    }

    function totalSupply() external view returns (uint256) {
        return IERC20(stakedNlpTracker).totalSupply();
    }

    function _approve(address _owner, address _spender, uint256 _amount) private {
        require(_owner != address(0), "StakedNlp: approve from the zero address");
        require(_spender != address(0), "StakedNlp: approve to the zero address");

        allowances[_owner][_spender] = _amount;

        emit Approval(_owner, _spender, _amount);
    }

    function _transfer(address _sender, address _recipient, uint256 _amount) private {
        require(_sender != address(0), "StakedNlp: transfer from the zero address");
        require(_recipient != address(0), "StakedNlp: transfer to the zero address");

        require(
            nlpManager.lastAddedAt(_sender).add(nlpManager.cooldownDuration()) <= block.timestamp,
            "StakedNlp: cooldown duration not yet passed"
        );

        IRewardTracker(stakedNlpTracker).unstakeForAccount(_sender, feeNlpTracker, _amount, _sender);
        IRewardTracker(feeNlpTracker).unstakeForAccount(_sender, nlp, _amount, _sender);

        IRewardTracker(feeNlpTracker).stakeForAccount(_sender, _recipient, nlp, _amount);
        IRewardTracker(stakedNlpTracker).stakeForAccount(_recipient, _recipient, feeNlpTracker, _amount);
    }
}
