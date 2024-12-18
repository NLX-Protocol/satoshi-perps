// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract WCORE is ERC20, ReentrancyGuard {
    
    // Events
    event Deposit(address indexed account, uint256 amount);
    event Withdraw(address indexed account, uint256 amount);

    // Custom error for failed transfers
    error TransferFailed(address account, uint256 amount);

    constructor() ERC20("Wrapped SatoshiPerps CORE", "WCORE") {}

    /**
     * @dev Mint WCORE by depositing the native token (e.g., CORE,ETH).
     * Emits a {Deposit} event.
     */
    function deposit() public payable {
        require(msg.value > 0, "Deposit amount must be greater than zero");
        _mint(msg.sender, msg.value);
        emit Deposit(msg.sender, msg.value);
    }

    /**
     * @dev Withdraw the native token by burning WCORE.
     * @param amount The amount to withdraw.
     * Emits a {Withdraw} event.
     */
    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "Withdraw amount must be greater than zero");
        require(balanceOf(msg.sender) >= amount, "Insufficient WCORE balance");
        
        _burn(msg.sender, amount);
        
        (bool success, ) = msg.sender.call{ value: amount }("");
        if (!success) {
            revert TransferFailed(msg.sender, amount);
        }
        
        emit Withdraw(msg.sender, amount);
    }

    /**
     * @dev Fallback function to handle direct Ether transfers.
     * Automatically calls the {deposit} function.
     */
    receive() external payable {
        deposit();
    }
}
