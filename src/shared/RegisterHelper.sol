// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Vm} from "forge-std/Vm.sol";
import "forge-std/StdJson.sol";

interface IRegister {
    struct NetworkDetails {
        uint64  chainSelector;
        address routerAddress;
        address linkAddress;
        address wrappedNativeAddress;
        address ccipBnMAddress;
        address ccipLnMAddress;
        address rmnProxyAddress;
        address registryModuleOwnerCustomAddress;
        address tokenAdminRegistryAddress;
    }
    function setNetworkDetails(uint256 chainId, NetworkDetails memory networkDetails) external;
}

library RegisterHelper {
    
    function seedRegister(Vm vm, address registerAdr) internal {
        IRegister i_register = IRegister(registerAdr);
        string memory jsonPath = string.concat(vm.projectRoot(), "/src/shared/input/networkDetails.json");
        string memory json = vm.readFile(jsonPath);
        string[] memory keys = vm.parseJsonKeys(json, "");

        for (uint256 i = 0; i < keys.length; i++) {
            uint256 chainId = vm.parseUint(keys[i]);
            string memory base = string.concat('["', keys[i], '"]');

            uint64 chainSelector = uint64(vm.parseUint(stdJson.readString(json, string.concat(base, ".chainSelector"))));
            address router       = stdJson.readAddress(json, string.concat(base, ".routerAddress"));
            address link         = stdJson.readAddress(json, string.concat(base, ".linkAddress"));
            address wrapped      = stdJson.readAddress(json, string.concat(base, ".wrappedNativeAddress"));
            address ccipBnM      = stdJson.readAddress(json, string.concat(base, ".ccipBnMAddress"));
            address ccipLnM      = stdJson.readAddress(json, string.concat(base, ".ccipLnMAddress"));
            address rmnProxy     = stdJson.readAddress(json, string.concat(base, ".rmnProxyAddress"));
            address regOwner     = stdJson.readAddress(json, string.concat(base, ".registryModuleOwnerCustomAddress"));
            address tokenAdmin   = stdJson.readAddress(json, string.concat(base, ".tokenAdminRegistryAddress"));

            i_register.setNetworkDetails(
                chainId,
                IRegister.NetworkDetails({
                    chainSelector: chainSelector,
                    routerAddress: router,
                    linkAddress: link,
                    wrappedNativeAddress: wrapped,
                    ccipBnMAddress: ccipBnM,
                    ccipLnMAddress: ccipLnM,
                    rmnProxyAddress: rmnProxy,
                    registryModuleOwnerCustomAddress: regOwner,
                    tokenAdminRegistryAddress: tokenAdmin
                })
            );
        }
    }
}
