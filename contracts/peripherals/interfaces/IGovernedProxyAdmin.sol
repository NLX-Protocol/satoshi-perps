// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

interface IGovernedProxyAdmin {
    function setGov(address _gov) external;
    function setUpgradeAdmin(address _admin, bool _enabled) external;
    function setUpgradesEnabled(bool _enabled) external;
}