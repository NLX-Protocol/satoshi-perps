// SPDX-License-Identifier: MIT
pragma solidity 0.8.25;

import "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";
import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

contract GovernedProxyAdmin is  ProxyAdmin {
    address public gov;
    bool public upgradesEnabled;
    mapping(address => bool) public upgradeAdmins;

    event SetGov(address oldGov, address newGov);
    event SetUpgradeAdmin(address admin, bool enabled);
    event SetUpgradesEnabled(bool enabled);

    error Unauthorized();
    error UpgradesDisabled();
    error ZeroAddress();

    constructor() {
        gov = msg.sender;
        upgradeAdmins[msg.sender] = true;
        upgradesEnabled = true;
    }

    modifier onlyGov() {
        if (msg.sender != gov) revert Unauthorized();
        _;
    }

    modifier onlyUpgradeAdmin() {
        if (!upgradeAdmins[msg.sender]) revert Unauthorized();
        _;
    }

    modifier whenUpgradesEnabled() {
        if (!upgradesEnabled) revert UpgradesDisabled();
        _;
    }

    function setGov(address _gov) external  onlyGov {
        if (_gov == address(0)) revert ZeroAddress();
        emit SetGov(gov, _gov);
        gov = _gov;
    }

    function setUpgradeAdmin(address _admin, bool _enabled) external  onlyGov {
        if (_admin == address(0)) revert ZeroAddress();
        upgradeAdmins[_admin] = _enabled;
        emit SetUpgradeAdmin(_admin, _enabled);
    }

    function setUpgradesEnabled(bool _enabled) external  onlyGov {
        upgradesEnabled = _enabled;
        emit SetUpgradesEnabled(_enabled);
    }

    function upgrade(ITransparentUpgradeableProxy proxy, address implementation) 
        public 
        virtual 
        override 
        onlyUpgradeAdmin 
        whenUpgradesEnabled 
    {
        super.upgrade(proxy, implementation);
    }

    function upgradeAndCall(
        ITransparentUpgradeableProxy proxy,
        address implementation,
        bytes memory data
    ) public payable virtual override onlyUpgradeAdmin whenUpgradesEnabled {
        super.upgradeAndCall(proxy, implementation, data);
    }
}