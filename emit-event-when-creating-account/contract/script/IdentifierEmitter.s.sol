// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {IdentifierEmitter} from "../src/IdentifierEmitter.sol";

contract IdentifierEmitterScript is Script {
    IdentifierEmitter public emitter;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        emitter = new IdentifierEmitter();
        console.log("IdentifierEmitter deployed at:", address(emitter));

        vm.stopBroadcast();
    }
}

