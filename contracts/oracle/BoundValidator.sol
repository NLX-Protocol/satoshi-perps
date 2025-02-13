// SPDX-License-Identifier: BSD-3-Clause
pragma solidity 0.8.25;

import "./interfaces/OracleInterface.sol";

/**
 * @title BoundValidator
 * @author Venus
 * @notice The BoundValidator contract is used to validate prices fetched from two different sources.
 * Each asset has an upper and lower bound ratio set in the config. In order for a price to be valid
 * it must fall within this range of the validator price.
 */
contract BoundValidator is BoundValidatorInterface {
    struct ValidateConfig {
        /// @notice asset address
        address asset;
        /// @notice Upper bound of deviation between reported price and anchor price,
        /// beyond which the reported price will be invalidated
        uint256 upperBoundRatio;
        /// @notice Lower bound of deviation between reported price and anchor price,
        /// below which the reported price will be invalidated
        uint256 lowerBoundRatio;
    }
    
    /// @notice Contract governor address
    address public gov;

    /// @notice validation configs by asset
    mapping(address => ValidateConfig) public validateConfigs;

    /// @notice Emit this event when new validation configs are added
    event ValidateConfigAdded(address indexed asset, uint256 indexed upperBound, uint256 indexed lowerBound);

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
     * @notice Add multiple validation configs at the same time
     * @param configs Array of validation configs
     * @custom:access Only Governance
     * @custom:error Zero length error is thrown if length of the config array is 0
     * @custom:event Emits ValidateConfigAdded for each validation config that is successfully set
     */
    function setValidateConfigs(ValidateConfig[] memory configs) external onlyGov {
        uint256 length = configs.length;
        if (length == 0) revert("invalid validate config length");
        for (uint256 i; i < length; ) {
            setValidateConfig(configs[i]);
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @notice Add a single validation config
     * @param config Validation config struct
     * @custom:access Only Governance
     * @custom:error Null address error is thrown if asset address is null
     * @custom:error Range error thrown if bound ratio is not positive
     * @custom:error Range error thrown if lower bound is greater than or equal to upper bound
     * @custom:event Emits ValidateConfigAdded when a validation config is successfully set
     */
    function setValidateConfig(ValidateConfig memory config) public onlyGov {

        if (config.asset == address(0)) revert("asset can't be zero address");
        if (config.upperBoundRatio == 0 || config.lowerBoundRatio == 0) revert("bound must be positive");
        if (config.upperBoundRatio <= config.lowerBoundRatio) revert("upper bound must be higher than lowner bound");
        validateConfigs[config.asset] = config;
        emit ValidateConfigAdded(config.asset, config.upperBoundRatio, config.lowerBoundRatio);
    }

    /**
     * @notice Test reported asset price against anchor price
     * @param asset asset address
     * @param reportedPrice The price to be tested
     * @custom:error Missing error thrown if asset config is not set
     * @custom:error Price error thrown if anchor price is not valid
     */
    function validatePriceWithAnchorPrice(
        address asset,
        uint256 reportedPrice,
        uint256 anchorPrice
    ) public view virtual override returns (bool) {
        if (validateConfigs[asset].upperBoundRatio == 0) revert("validation config not exist");
        if (anchorPrice == 0) revert("anchor price is not valid");
        return _isWithinAnchor(asset, reportedPrice, anchorPrice);
    }

    /**
     * @notice Test whether the reported price is within the valid bounds
     * @param asset Asset address
     * @param reportedPrice The price to be tested
     * @param anchorPrice The reported price must be within the the valid bounds of this price
     */
    function _isWithinAnchor(address asset, uint256 reportedPrice, uint256 anchorPrice) private view returns (bool) {
        if (reportedPrice != 0) {
            // we need to multiply anchorPrice by 1e18 to make the ratio 18 decimals
            uint256 anchorRatio = (anchorPrice * 1e18) / reportedPrice;
            uint256 upperBoundAnchorRatio = validateConfigs[asset].upperBoundRatio;
            uint256 lowerBoundAnchorRatio = validateConfigs[asset].lowerBoundRatio;
            return anchorRatio <= upperBoundAnchorRatio && anchorRatio >= lowerBoundAnchorRatio;
        }
        return false;
    }

}
