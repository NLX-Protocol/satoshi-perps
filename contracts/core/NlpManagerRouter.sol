// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "../libraries/math/SafeMath.sol";
import "../libraries/token/IERC20.sol";
import "../libraries/token/SafeERC20.sol";
import "../libraries/utils/ReentrancyGuard.sol";
import "../libraries/utils/Address.sol";

import "../tokens/interfaces/IWETH.sol";
import "../core/interfaces/INlpManager.sol";
import "../access/Governable.sol";

contract NlpManagerRouter is ReentrancyGuard, Governable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using Address for address payable;

    address public weth;
    address public nlp;
    address public nlpManager;

    event AddLiquidity(
        address account,
        address token,
        uint256 amount,
        uint256 minUsdg,
        uint256 minNlp,
        uint256 nlpAmount
    );
    event RemoveLiquidity(
        address account,
        address tokenOut,
        uint256 nlpAmount,
        uint256 minOut,
        uint256 amountOut
    );

    receive() external payable {
        require(msg.sender == weth, "NlpManagerRouter: invalid sender");
    }

    constructor(
        address _weth,
        address _nlp,
        address _nlpManager
    ) public {
        weth = _weth;
        nlp = _nlp;
        nlpManager = _nlpManager;
    }

    /**
     * @dev Allows users to add liquidity to the pool using an ERC20 token and receive NLP tokens.
     * @param _token The token used for adding liquidity.
     * @param _amount The amount of the token to add as liquidity.
     * @param _minUsdg The minimum amount of USDG tokens expected.
     * @param _minNlp The minimum amount of NLP tokens expected.
     */
    function addLiquidity(
        address _token,
        uint256 _amount,
        uint256 _minUsdg,
        uint256 _minNlp
    ) external nonReentrant returns (uint256) {
        require(_amount > 0, "NlpManagerRouter: invalid _amount");

        // Transfer the token from the user to the contract
        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);

        // Approve the token to the NlpManager contract
        IERC20(_token).approve(nlpManager, _amount);

        // Add liquidity and receive NLP tokens
        uint256 nlpAmount = INlpManager(nlpManager).addLiquidityForAccount(
            address(this),
            msg.sender,
            _token,
            _amount,
            _minUsdg,
            _minNlp
        );

        emit AddLiquidity(msg.sender, _token, _amount, _minUsdg, _minNlp, nlpAmount);

        return nlpAmount;
    }

    /**
     * @dev Allows users to add liquidity using ETH and receive NLP tokens.
     * @param _minUsdg The minimum amount of USDG tokens expected.
     * @param _minNlp The minimum amount of NLP tokens expected.
     */
    function addLiquidityETH(uint256 _minUsdg, uint256 _minNlp) external payable nonReentrant returns (uint256) {
        require(msg.value > 0, "NlpManagerRouter: invalid msg.value");

        // Deposit ETH and wrap it into WETH
        IWETH(weth).deposit{value: msg.value}();

        // Approve WETH to the NlpManager contract
        IERC20(weth).approve(nlpManager, msg.value);

        // Add liquidity and receive NLP tokens
        uint256 nlpAmount = INlpManager(nlpManager).addLiquidityForAccount(
            address(this),
            msg.sender,
            weth,
            msg.value,
            _minUsdg,
            _minNlp
        );

        emit AddLiquidity(msg.sender, weth, msg.value, _minUsdg, _minNlp, nlpAmount);

        return nlpAmount;
    }

    /**
     * @dev Allows users to remove liquidity and receive the underlying token.
     * @param _tokenOut The token to receive when removing liquidity.
     * @param _nlpAmount The amount of NLP tokens to burn.
     * @param _minOut The minimum amount of the token expected when removing liquidity.
     * @param _receiver The address to receive the output tokens.
     */
    function removeLiquidity(
        address _tokenOut,
        uint256 _nlpAmount,
        uint256 _minOut,
        address _receiver
    ) external nonReentrant returns (uint256) {
        require(_nlpAmount > 0, "NlpManagerRouter: invalid _nlpAmount");

        // Remove liquidity and receive the token
        uint256 amountOut = INlpManager(nlpManager).removeLiquidityForAccount(
            msg.sender,
            _tokenOut,
            _nlpAmount,
            _minOut,
            _receiver
        );

        emit RemoveLiquidity(msg.sender, _tokenOut, _nlpAmount, _minOut, amountOut);

        return amountOut;
    }

    /**
     * @dev Allows users to remove liquidity and receive ETH.
     * @param _nlpAmount The amount of NLP tokens to burn.
     * @param _minOut The minimum amount of ETH expected when removing liquidity.
     * @param _receiver The address to receive the ETH.
     */
    function removeLiquidityETH(
        uint256 _nlpAmount,
        uint256 _minOut,
        address payable _receiver
    ) external nonReentrant returns (uint256) {
        require(_nlpAmount > 0, "NlpManagerRouter: invalid _nlpAmount");

        // Remove liquidity and receive WETH
        uint256 amountOut = INlpManager(nlpManager).removeLiquidityForAccount(
            msg.sender,
            weth,
            _nlpAmount,
            _minOut,
            address(this)
        );

        // Convert WETH to ETH
        IWETH(weth).withdraw(amountOut);

        // Send ETH to the receiver
        _receiver.sendValue(amountOut);

        emit RemoveLiquidity(msg.sender, weth, _nlpAmount, _minOut, amountOut);

        return amountOut;
    }
}
