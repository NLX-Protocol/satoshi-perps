// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

interface IRewardRouterV2 {
    function feeNlpTracker() external view returns (address);
    function stakedNlpTracker() external view returns (address);
}
