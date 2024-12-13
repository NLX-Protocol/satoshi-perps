// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "../tokens/MintableBaseToken.sol";

contract SLPCORE is MintableBaseToken {
    constructor() public MintableBaseToken("Satoshi Perps LP", "SLP-CORE", 0) {
    }

    function id() external pure returns (string memory _name) {
        return "SLP-CORE";
    }
}
