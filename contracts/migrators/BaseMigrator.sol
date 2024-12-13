// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "../access/Governable.sol";
import "../access/interfaces/IGovRequester.sol";

import "../peripherals/interfaces/ITimelock.sol";
import "../peripherals/interfaces/IHandlerTarget.sol";
import "../tokens/interfaces/IMintable.sol";

contract BaseMigrator is IGovRequester {
    address public immutable admin;
    address public immutable stakedGmxTracker;
    address public immutable bonusGmxTracker;
    address public immutable feeGmxTracker;
    address public immutable stakedSlpTracker;
    address public immutable feeSlpTracker;
    address public immutable gmxVester;
    address public immutable slpVester;
    address public immutable esGmx;
    address public immutable bnGmx;
    address public immutable rewardRouter;

    address public expectedGovGrantedCaller;

    modifier onlyAdmin() {
        require(msg.sender == admin, "forbidden");
        _;
    }

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
        address _rewardRouter
    ) public {
        admin = _admin;

        stakedGmxTracker = _stakedGmxTracker;
        bonusGmxTracker = _bonusGmxTracker;
        feeGmxTracker = _feeGmxTracker;
        stakedSlpTracker = _stakedSlpTracker;
        feeSlpTracker = _feeSlpTracker;
        gmxVester = _gmxVester;
        slpVester = _slpVester;
        esGmx = _esGmx;
        bnGmx = _bnGmx;

        rewardRouter = _rewardRouter;
    }

    function migrate() external onlyAdmin {
        address gov = Governable(stakedGmxTracker).gov();
        expectedGovGrantedCaller = gov;

        address[] memory targets = new address[](9);
        targets[0] = stakedGmxTracker;
        targets[1] = bonusGmxTracker;
        targets[2] = feeGmxTracker;
        targets[3] = stakedSlpTracker;
        targets[4] = feeSlpTracker;
        targets[5] = gmxVester;
        targets[6] = slpVester;
        targets[7] = esGmx;
        targets[8] = bnGmx;

        ITimelock(gov).requestGov(targets);
    }

    function afterGovGranted() external override {
        require(msg.sender == expectedGovGrantedCaller, "forbidden");

        _toggleRewardRouter(true);

        _makeExternalCall();

        _toggleRewardRouter(false);

        address mainGov = msg.sender;

        Governable(stakedGmxTracker).setGov(mainGov);
        Governable(bonusGmxTracker).setGov(mainGov);
        Governable(feeGmxTracker).setGov(mainGov);
        Governable(stakedSlpTracker).setGov(mainGov);
        Governable(feeSlpTracker).setGov(mainGov);
        Governable(gmxVester).setGov(mainGov);
        Governable(slpVester).setGov(mainGov);
        Governable(esGmx).setGov(mainGov);
        Governable(bnGmx).setGov(mainGov);

        expectedGovGrantedCaller = address(0);
    }

    function _makeExternalCall() internal virtual {}

    function _toggleRewardRouter(bool isEnabled) internal {
        IHandlerTarget(stakedGmxTracker).setHandler(rewardRouter, isEnabled);
        IHandlerTarget(bonusGmxTracker).setHandler(rewardRouter, isEnabled);
        IHandlerTarget(feeGmxTracker).setHandler(rewardRouter, isEnabled);
        IHandlerTarget(stakedSlpTracker).setHandler(rewardRouter, isEnabled);
        IHandlerTarget(feeSlpTracker).setHandler(rewardRouter, isEnabled);
        IHandlerTarget(gmxVester).setHandler(rewardRouter, isEnabled);
        IHandlerTarget(slpVester).setHandler(rewardRouter, isEnabled);
        IHandlerTarget(esGmx).setHandler(rewardRouter, isEnabled);
        IMintable(bnGmx).setMinter(rewardRouter, isEnabled);
    }
}
