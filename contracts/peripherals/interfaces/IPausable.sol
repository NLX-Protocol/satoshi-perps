// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

interface IPausable {
    function pause() external;
    function unpause() external;
    function paused() external view returns (bool);
}
