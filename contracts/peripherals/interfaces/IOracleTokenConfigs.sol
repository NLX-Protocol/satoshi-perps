// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;

interface IOracleTokenConfigsChainlink {

    struct TokenConfig {
        address asset;
        address feed;
        uint256 maxStalePeriod;
    }

    function setTokenConfigs(
        TokenConfig[] memory _tokenConfigs
    ) external;


}

interface IOracleTokenConfigsPyth {

    struct TokenConfig {
        bytes32 pythId;
        address asset;
        uint64 maxStalePeriod;
    }

    function setTokenConfigs(
        TokenConfig[] memory _tokenConfigs
    ) external;
}