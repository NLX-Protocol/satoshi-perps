// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "../core/interfaces/IVault.sol";
import "../core/interfaces/IVaultPriceFeed.sol";
import "../core/interfaces/IBasePositionManager.sol";

contract VaultReader {
    function getVaultTokenInfoV3(
        address _vault,
        address _positionManager,
        address _weth,
        uint256 _usdgAmount,
        address[] memory _tokens
    ) public view returns (uint256[] memory) {
        uint256 propsLength = 14;

        IVault vault = IVault(_vault);
        IVaultPriceFeed priceFeed = IVaultPriceFeed(vault.priceFeed());
        IBasePositionManager positionManager = IBasePositionManager(
            _positionManager
        );

        uint256[] memory amounts = new uint256[](_tokens.length * propsLength);
        for (uint256 i = 0; i < _tokens.length; i++) {
            address token = _tokens[i];
            if (token == address(0)) {
                token = _weth;
            }

            amounts[i * propsLength] = vault.poolAmounts(token);
            amounts[i * propsLength + 1] = vault.reservedAmounts(token);
            amounts[i * propsLength + 2] = vault.usdgAmounts(token);
            amounts[i * propsLength + 3] = vault.getRedemptionAmount(
                token,
                _usdgAmount
            );
            amounts[i * propsLength + 4] = vault.tokenWeights(token);
            amounts[i * propsLength + 5] = vault.bufferAmounts(token);
            amounts[i * propsLength + 6] = vault.maxUsdgAmounts(token);
            amounts[i * propsLength + 7] = vault.globalShortSizes(token);
            amounts[i * propsLength + 8] = positionManager.maxGlobalShortSizes(
                token
            );
            amounts[i * propsLength + 9] = vault.getMinPrice(token);
            amounts[i * propsLength + 10] = vault.getMaxPrice(token);
            amounts[i * propsLength + 11] = vault.guaranteedUsd(token);
            amounts[i * propsLength + 12] = priceFeed.getPrimaryPrice(
                token,
                false
            );
            amounts[i * propsLength + 13] = priceFeed.getPrimaryPrice(
                token,
                true
            );
        }

        return amounts;
    }

    function getMaxGlobalSizes(
        address _positionManager,
        address _token
    ) public view returns (uint256[] memory) {
        return _getMaxGlobalSizes(_positionManager, _token);
    }

    function getMaxGlobalSizesForTokens(
        address _positionManager,
        address _weth,
        address[] memory _tokens
    ) public view returns (uint256[] memory) {
        uint256 propsLength = 2;
        uint256[] memory sizes = new uint256[](_tokens.length * propsLength);

        IBasePositionManager positionManager = IBasePositionManager(
            _positionManager
        );

        for (uint256 i = 0; i < _tokens.length; i++) {
            address token = _tokens[i];
            if (token == address(0)) {
                token = _weth;
            }
            sizes[i * propsLength] = positionManager.maxGlobalShortSizes(token);
            sizes[i * propsLength + 1] = positionManager.maxGlobalLongSizes(
                token
            );
        }

        return sizes;
    }

    function _getMaxGlobalSizes(
        address _positionManager,
        address _token
    ) internal view returns (uint256[] memory) {
        uint256[] memory tokenInfo = new uint256[](2);

        IBasePositionManager positionManager = IBasePositionManager(
            _positionManager
        );

        tokenInfo[0] = positionManager.maxGlobalShortSizes(_token);
        tokenInfo[1] = positionManager.maxGlobalLongSizes(_token);

        return tokenInfo;
    }

    function getVaultTokenInfoV4(
        address _vault,
        address _weth,
        uint256 _usdgAmount,
        address[] memory _tokens
    ) public view returns (uint256[] memory) {
        uint256 propsLength = 16;

        IVault vault = IVault(_vault);
        IVaultPriceFeed priceFeed = IVaultPriceFeed(vault.priceFeed());

        uint256[] memory amounts = new uint256[](_tokens.length * propsLength);
        for (uint256 i = 0; i < _tokens.length; i++) {
            address token = _tokens[i];

            if (token == address(0)) {
                token = _weth;
            }

            amounts[i * propsLength] = vault.poolAmounts(token);
            amounts[i * propsLength + 1] = vault.reservedAmounts(token);
            amounts[i * propsLength + 2] = vault.usdgAmounts(token);
            amounts[i * propsLength + 3] = vault.getRedemptionAmount(
                token,
                _usdgAmount
            );
            amounts[i * propsLength + 4] = vault.tokenWeights(token);
            amounts[i * propsLength + 5] = vault.bufferAmounts(token);
            amounts[i * propsLength + 6] = vault.maxUsdgAmounts(token);
            amounts[i * propsLength + 7] = vault.globalShortSizes(token);
            // amounts[i * propsLength + 8] = maxGlobalSizes[0];
            // amounts[i * propsLength + 9] = maxGlobalSizes[1];
            amounts[i * propsLength + 10] = vault.getMinPrice(token);
            amounts[i * propsLength + 11] = vault.getMaxPrice(token);
            amounts[i * propsLength + 12] = vault.guaranteedUsd(token);
            amounts[i * propsLength + 13] = priceFeed.getPrimaryPrice(
                token,
                false
            );
            amounts[i * propsLength + 14] = priceFeed.getPrimaryPrice(
                token,
                true
            );
            amounts[i * propsLength + 15] = vault.whitelistedTokens(token) ? 1 : 0;
        }

        return amounts;
    }
}
