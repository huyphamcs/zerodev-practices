// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {IdentifierEmitter} from "../src/IdentifierEmitter.sol";

contract IdentifierEmitterTest is Test {
    IdentifierEmitter public emitter;

    event IdentifierEmitted(bytes id, address indexed kernel);

    function setUp() public {
        emitter = new IdentifierEmitter();
    }

    function test_EmitIdentifier() public {
        bytes memory testId = hex"cafeface";
        
        vm.expectEmit(true, true, false, true);
        emit IdentifierEmitted(testId, address(this));
        
        emitter.emitIdentifier(testId);
    }

    function test_EmitIdentifierFor() public {
        bytes memory testId = hex"deadbeef";
        address kernel = address(0x1234);
        
        vm.expectEmit(true, true, false, true);
        emit IdentifierEmitted(testId, kernel);
        
        emitter.emitIdentifierFor(testId, kernel);
    }

    function testFuzz_EmitIdentifier(bytes calldata id) public {
        vm.expectEmit(true, true, false, true);
        emit IdentifierEmitted(id, address(this));
        
        emitter.emitIdentifier(id);
    }
}

