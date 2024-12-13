// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "../libraries/math/SafeMath.sol";
import "../libraries/token/IERC20.sol";
import "../libraries/token/SafeERC20.sol";
import "../libraries/utils/ReentrancyGuard.sol";
import "../libraries/utils/Address.sol";

import "../tokens/interfaces/IWETH.sol";
import "../core/interfaces/ISlpManager.sol";
import "../access/Governable.sol";

contract SlpManagerRouter is ReentrancyGuard, Governable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using Address for address payable;

    address public weth;
    address public slp;
    address public slpManager;

    event AddLiquidity(
        address account,
        address token,
        uint256 amount,
        uint256 minUsdg,
        uint256 minSlp,
        uint256 slpAmount
    );
    event RemoveLiquidity(
        address account,
        address tokenOut,
        uint256 slpAmount,
        uint256 minOut,
        uint256 amountOut
    );

    receive() external payable {
        require(msg.sender == weth, "SlpManagerRouter: invalid sender");
    }

    constructor(
        address _weth,
        address _slp,
        address _slpManager
    ) public {
        weth = _weth;
        slp = _slp;
        slpManager = _slpManager;
    }

    /**
     * @dev Allows users to add liquidity to the pool using an ERC20 token and receive SLP tokens.
     * @param _token The token used for adding liquidity.
     * @param _amount The amount of the token to add as liquidity.
     * @param _minUsdg The minimum amount of USDG tokens expected.
     * @param _minSlp The minimum amount of SLP tokens expected.
     */
    function addLiquidity(
        address _token,
        uint256 _amount,
        uint256 _minUsdg,
        uint256 _minSlp
    ) external nonReentrant returns (uint256) {
        require(_amount > 0, "SlpManagerRouter: invalid _amount");

        // Transfer the token from the user to the contract
        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);

        // Approve the token to the SlpManager contract
        IERC20(_token).approve(slpManager, _amount);

        // Add liquidity and receive SLP tokens
        uint256 slpAmount = ISlpManager(slpManager).addLiquidityForAccount(
            address(this),
            msg.sender,
            _token,
            _amount,
            _minUsdg,
            _minSlp
        );

        emit AddLiquidity(msg.sender, _token, _amount, _minUsdg, _minSlp, slpAmount);

        return slpAmount;
    }

    /**
     * @dev Allows users to add liquidity using ETH and receive SLP tokens.
     * @param _minUsdg The minimum amount of USDG tokens expected.
     * @param _minSlp The minimum amount of SLP tokens expected.
     */
    function addLiquidityETH(uint256 _minUsdg, uint256 _minSlp) external payable nonReentrant returns (uint256) {
        require(msg.value > 0, "SlpManagerRouter: invalid msg.value");

        // Deposit ETH and wrap it into WETH
        IWETH(weth).deposit{value: msg.value}();

        // Approve WETH to the SlpManager contract
        IERC20(weth).approve(slpManager, msg.value);

        // Add liquidity and receive SLP tokens
        uint256 slpAmount = ISlpManager(slpManager).addLiquidityForAccount(
            address(this),
            msg.sender,
            weth,
            msg.value,
            _minUsdg,
            _minSlp
        );

        emit AddLiquidity(msg.sender, weth, msg.value, _minUsdg, _minSlp, slpAmount);

        return slpAmount;
    }

    /**
     * @dev Allows users to remove liquidity and receive the underlying token.
     * @param _tokenOut The token to receive when removing liquidity.
     * @param _slpAmount The amount of SLP tokens to burn.
     * @param _minOut The minimum amount of the token expected when removing liquidity.
     * @param _receiver The address to receive the output tokens.
     */
    function removeLiquidity(
        address _tokenOut,
        uint256 _slpAmount,
        uint256 _minOut,
        address _receiver
    ) external nonReentrant returns (uint256) {
        require(_slpAmount > 0, "SlpManagerRouter: invalid _slpAmount");

        // Remove liquidity and receive the token
        uint256 amountOut = ISlpManager(slpManager).removeLiquidityForAccount(
            msg.sender,
            _tokenOut,
            _slpAmount,
            _minOut,
            _receiver
        );

        emit RemoveLiquidity(msg.sender, _tokenOut, _slpAmount, _minOut, amountOut);

        return amountOut;
    }

    /**
     * @dev Allows users to remove liquidity and receive ETH.
     * @param _slpAmount The amount of SLP tokens to burn.
     * @param _minOut The minimum amount of ETH expected when removing liquidity.
     * @param _receiver The address to receive the ETH.
     */
    function removeLiquidityETH(
        uint256 _slpAmount,
        uint256 _minOut,
        address payable _receiver
    ) external nonReentrant returns (uint256) {
        require(_slpAmount > 0, "SlpManagerRouter: invalid _slpAmount");

        // Remove liquidity and receive WETH
        uint256 amountOut = ISlpManager(slpManager).removeLiquidityForAccount(
            msg.sender,
            weth,
            _slpAmount,
            _minOut,
            address(this)
        );

        // Convert WETH to ETH
        IWETH(weth).withdraw(amountOut);

        // Send ETH to the receiver
        _receiver.sendValue(amountOut);

        emit RemoveLiquidity(msg.sender, weth, _slpAmount, _minOut, amountOut);

        return amountOut;
    }
}
