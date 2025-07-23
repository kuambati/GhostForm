// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract GhostForm {
    struct GhostWallet {
        address user;
        uint256 expiryTime;
        bool used;
        uint256 createdAt;
    }

    mapping(address => GhostWallet) public ghostWallets;

    event GhostWalletCreated(address user, uint256 expiryTime);
    event MessagePosted(address user, string message);
    event GhostWalletDestroyed(address user);

    function createGhostWallet(uint256 lifespanInMinutes) external {
        require(ghostWallets[msg.sender].user == address(0), "Already has a ghost wallet");

        uint256 expiry = block.timestamp + (lifespanInMinutes * 1 minutes);
          ghostWallets[msg.sender] = GhostWallet({
        user: msg.sender,
        expiryTime: expiry,
        used: false,
        createdAt: block.timestamp
    });

        emit GhostWalletCreated(msg.sender, expiry);
    }

    function postMessage(string calldata message) external {
        GhostWallet storage gw = ghostWallets[msg.sender];
        require(gw.user != address(0), "No ghost wallet");
        require(block.timestamp <= gw.expiryTime, "Ghost wallet expired");
        require(!gw.used, "One-time wallet already used");

        gw.used = true;

        emit MessagePosted(msg.sender, message);
    }
    function getCreatedAt() external view returns (uint256) {
        return ghostWallets[msg.sender].createdAt;
    }


    function selfDestruct() external {
        GhostWallet storage gw = ghostWallets[msg.sender];
        require(gw.user != address(0), "No ghost wallet");

        delete ghostWallets[msg.sender];

        emit GhostWalletDestroyed(msg.sender);
    }

    // View helper
    function timeLeft() external view returns (uint256) {
        if (ghostWallets[msg.sender].expiryTime > block.timestamp) {
            return ghostWallets[msg.sender].expiryTime - block.timestamp;
        } else {
            return 0;
        }
    }
}
