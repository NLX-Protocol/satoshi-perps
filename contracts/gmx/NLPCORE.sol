// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "../tokens/MintableBaseToken.sol";

contract NLPCORE is MintableBaseToken {
    constructor() public MintableBaseToken("NLX LP", "NLP-CORE", 0) {
    }

    function id() external pure returns (string memory _name) {
        return "NLP-CORE";
    }
}
