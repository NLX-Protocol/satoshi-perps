pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract WCORE is ERC20 {


    constructor() ERC20("Wrapped NLX CORE", "WCORE") {}

    error TransferFailed(address account, uint256 amount);

    // @dev mint WNT by depositing the native token
    function deposit() public payable {
        _mint(msg.sender, msg.value);
    }

    // @dev withdraw the native token by burning WNT
    // @param amount the amount to withdraw
    function withdraw(uint256 amount) external {
        _burn(msg.sender, amount);
        (bool success, ) = msg.sender.call{ value: amount }("");
        if (!success) {
            revert TransferFailed(msg.sender, amount);
        }
    }

    receive() external payable {
        deposit();
    }
}