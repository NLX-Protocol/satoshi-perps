// SPDX-License-Identifier: BSD-3-Clause
pragma solidity 0.8.25;


import "./interfaces/OracleInterface.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/**
 * @title AproOracle
 * @author Venus
 * @notice This oracle fetches prices of assets from the Apro oracle.
 */
contract AproOracle is OracleInterface {

    /// @notice Exponent scale (decimal precision) of prices
    uint256 public constant PRICE_PRECISION = 10 ** 30;

    struct TokenConfig {
        /// @notice Underlying token address, which can't be a null address
        /// @notice Used to check if a token is supported
        /// @notice 0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB address for native tokens
        ///         (e.g BNB for BNB chain, ETH for Ethereum network)
        address asset;
        /// @notice Apro feed address
        address feed;
        /// @notice Price expiration period of this asset
        uint256 maxStalePeriod;
    }

    /// @notice Contract governor address
    address public gov;

    /// @notice Manually set an override price, useful under extenuating conditions such as price feed failure
    mapping(address => uint256) public prices;

    /// @notice Token config by assets
    mapping(address => TokenConfig) public tokenConfigs;

    /// @notice Emit when a token config is added
    event TokenConfigAdded(address indexed asset, address feed, uint256 maxStalePeriod);

    error Unauthorized();

    modifier notNullAddress(address someone) {
        if (someone == address(0)) revert("can't be zero address");
        _;
    }


    constructor() {
       gov = msg.sender;
    }

    modifier onlyGov() {
        if (msg.sender != gov) revert Unauthorized();
        _;
    }

    function setGov(address newGov) external onlyGov notNullAddress(newGov) {
        gov = newGov;
    }
    
    /**
     * @notice Add multiple token configs at the same time
     * @param tokenConfigs_ config array
     * @custom:access Only Governance
     * @custom:error Zero length error thrown, if length of the array in parameter is 0
     */
    function setTokenConfigs(TokenConfig[] memory tokenConfigs_) external onlyGov {
        if (tokenConfigs_.length == 0) revert("length can't be 0");
        uint256 numTokenConfigs = tokenConfigs_.length;
        for (uint256 i; i < numTokenConfigs; ) {
            setTokenConfig(tokenConfigs_[i]);
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @notice Add single token config. asset & feed cannot be null addresses and maxStalePeriod must be positive
     * @param tokenConfig Token config struct
     * @custom:access Only Governance
     * @custom:error NotNullAddress error is thrown if asset address is null
     * @custom:error NotNullAddress error is thrown if token feed address is null
     * @custom:error Range error is thrown if maxStale period of token is not greater than zero
     * @custom:event Emits TokenConfigAdded event on successfully setting of the token config
     */
    function setTokenConfig(
        TokenConfig memory tokenConfig
    ) public notNullAddress(tokenConfig.asset) notNullAddress(tokenConfig.feed) onlyGov {

        if (tokenConfig.maxStalePeriod == 0) revert("stale period can't be zero");
        tokenConfigs[tokenConfig.asset] = tokenConfig;
        emit TokenConfigAdded(tokenConfig.asset, tokenConfig.feed, tokenConfig.maxStalePeriod);
    }

    /**
     * @notice Gets the price of a asset from the Apro oracle
     * @param asset Address of the asset
     * @return Price in USD from Apro or a manually set price for the asset
     */
    function getPrice(address asset) public view virtual returns (uint256) {
        return _getPriceInternal(asset);
    }

    /**
     * @notice Gets the Apro price for a given asset
     * @param asset address of the asset
     * @return price Asset price in USD or a manually set price of the asset
     */
    function _getPriceInternal(address asset) internal view returns (uint256 price) {
        uint256 tokenPrice = prices[asset];
        if (tokenPrice != 0) {
            price = tokenPrice;
        } else {
            price = _getAproPrice(asset);
        }

        return price;
    }

    /**
     * @notice Get the Apro price for an asset, revert if token config doesn't exist
     * @dev The precision of the price feed is used to ensure the returned price has 30 decimals of precision
     * @param asset Address of the asset
     * @return price Price in USD, with 30 decimals of precision
     * @custom:error NotNullAddress error is thrown if the asset address is null
     * @custom:error Price error is thrown if the Apro price of asset is not greater than zero
     * @custom:error Timing error is thrown if current timestamp is less than the last updatedAt timestamp
     * @custom:error Timing error is thrown if time difference between current time and last updated time
     * is greater than maxStalePeriod
     */
    function _getAproPrice(
        address asset
    ) private view notNullAddress(tokenConfigs[asset].asset) returns (uint256) {
        TokenConfig memory tokenConfig = tokenConfigs[asset];
        AggregatorV3Interface feed = AggregatorV3Interface(tokenConfig.feed);

        // note: maxStalePeriod cannot be 0
        uint256 maxStalePeriod = tokenConfig.maxStalePeriod;

        // Apro USD-denominated feeds store answers at 8 decimals, mostly
        uint256 _priceDecimals = feed.decimals();

        (, int256 answer, , uint256 updatedAt, ) = feed.latestRoundData();
        if (answer <= 0) revert("Apro price must be positive");
        if (block.timestamp < updatedAt) revert("updatedAt exceeds block time");

        uint256 deltaTime;
        unchecked {
            deltaTime = block.timestamp - updatedAt;
        }

        if (deltaTime > maxStalePeriod) revert("Apro price expired");

        return uint256(answer) * PRICE_PRECISION / (10 ** _priceDecimals);
    }
}
