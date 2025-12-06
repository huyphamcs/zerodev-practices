// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract IdentifierEmitter {
    event IdentifierEmitted(bytes id, address indexed kernel);

    /// @notice Emits an identifier event with the caller as the kernel
    /// @param id The identifier bytes to emit
    function emitIdentifier(bytes calldata id) external {
        emit IdentifierEmitted(id, msg.sender);
    }

    /// @notice Emits an identifier event with a specified kernel address
    /// @param id The identifier bytes to emit
    /// @param kernel The kernel address to associate with this identifier
    function emitIdentifierFor(bytes calldata id, address kernel) external {
        emit IdentifierEmitted(id, kernel);
    }
}

