// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;


interface IPyth {
    function getPrice(bytes32 id) external view returns (int64 price, uint64 conf, int32 expo, uint publishTime);
    function getPriceNoOlderThan(bytes32 id, uint age) external view returns (int64 price, uint64 conf, int32 expo, uint publishTime);
    function updatePriceFeeds(bytes[] calldata updateData) external payable;
    function updatePriceFeedsIfNecessary(bytes[] calldata updateData, uint minCount) external payable;
    function getPriceUnsafe(bytes32 id) external view returns (int64 price, uint64 conf, int32 expo, uint publishTime);
}


contract PythWrapper {
    IPyth public pythOracle;

    // Constructor that sets the Pyth oracle contract address
    constructor(address _pythOracleAddress) {
        require(_pythOracleAddress != address(0), "Invalid Pyth Oracle address");
        pythOracle = IPyth(_pythOracleAddress);
    }

    
    function getPrice(bytes32 pythId) external view returns (int64 price, uint64 conf, int32 expo, uint publishTime) {
        return pythOracle.getPrice(pythId);
    }

    
    function getPriceNoOlderThan(bytes32 pythId, uint maxAge) external view returns (int64 price, uint64 conf, int32 expo, uint publishTime) {
        return pythOracle.getPriceNoOlderThan(pythId, maxAge);
    }

    /**
     * @notice Update the price feeds on-chain
     * @param updateData The calldata required to update the feeds
     */
    function updatePriceFeeds(bytes[] calldata updateData) external payable {
        pythOracle.updatePriceFeeds{value: msg.value}(updateData);
    }

    /**
     * @notice Update the price feeds if necessary with a minimum number of required updates
     * @param updateData The calldata required to update the feeds
     * @param minCount The minimum number of updates required
     */
    function updatePriceFeedsIfNecessary(bytes[] calldata updateData, uint minCount) external payable {
        pythOracle.updatePriceFeedsIfNecessary{value: msg.value}(updateData, minCount);
    }

    function getPriceUnsafe(bytes32 pythId) external view returns (int64 price, uint64 conf, int32 expo, uint publishTime) {
        return pythOracle.getPriceUnsafe(pythId);
    }

 
}
