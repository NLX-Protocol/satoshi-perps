// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

interface IResilientOracle {
    /**
     * @notice Updates the TWAP pivot oracle price.
     * @dev This function should always be called before calling getUnderlyingPrice
     * @param vToken vToken address
     */
    function updatePrice(address vToken) external;

    /**
     * @notice Gets the price of the underlying asset for a given vToken.
     * @param vToken vToken address
     * @param maximize Boolean indicating whether to maximize the price (e.g. for borrow calculations)
     * @return price USD price in scaled decimal places.
     */
    function getUnderlyingPrice(address vToken, bool maximize) external view returns (uint256);

    /**
     * @notice Gets the price of the asset.
     * @param asset Asset address
     * @param maximize Boolean indicating whether to maximize the price
     * @return price USD price in scaled decimal places.
     */
    function getPrice(address asset, bool maximize) external view returns (uint256);
}
