// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "../tokens/MintableBaseToken.sol";

contract NLPBTC is MintableBaseToken {
    constructor() public MintableBaseToken("NLX LP", "NLP-BTC", 0) {
    }

    function id() external pure returns (string memory _name) {
        return "NLP-BTC";
    }
}
