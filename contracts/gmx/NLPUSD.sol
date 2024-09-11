// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "../tokens/MintableBaseToken.sol";

contract NLPUSD is MintableBaseToken {
    constructor() public MintableBaseToken("NLX LP", "NLP-USD", 0) {
    }

    function id() external pure returns (string memory _name) {
        return "NLP-USD";
    }
}
