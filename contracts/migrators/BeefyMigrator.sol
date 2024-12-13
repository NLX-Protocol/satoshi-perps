// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "./BaseMigrator.sol";
import "./BeefyTimelockCaller.sol";

contract BeefyMigrator is BaseMigrator {

    address public immutable beefyTimelockCaller;

    constructor(
        address _admin,
        address _stakedGmxTracker,
        address _bonusGmxTracker,
        address _feeGmxTracker,
        address _stakedSlpTracker,
        address _feeSlpTracker,
        address _gmxVester,
        address _slpVester,
        address _esGmx,
        address _bnGmx,
        address _rewardRouter,
        address _beefyTimelockCaller
    ) public BaseMigrator(
        _admin,
        _stakedGmxTracker,
        _bonusGmxTracker,
        _feeGmxTracker,
        _stakedSlpTracker,
        _feeSlpTracker,
        _gmxVester,
        _slpVester,
        _esGmx,
        _bnGmx,
        _rewardRouter
    ) {
        beefyTimelockCaller = _beefyTimelockCaller;
    }

    function _makeExternalCall() internal override {
        BeefyTimelockCaller(beefyTimelockCaller).executeProposals();
    }
}
