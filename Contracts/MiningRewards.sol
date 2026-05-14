// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MiningRewards is Ownable {
    struct MiningProfile {
        uint256 totalMined;
        uint256 lastMiningTime;
        uint256 miningRate; // tokens per second
        bool active;
    }

    IERC20 public msraToken;
    mapping(address => MiningProfile) public miners;
    
    uint256 public constant BASE_MINING_RATE = 1e16; // 0.01 MSRA per second

    event MiningStarted(address indexed miner, uint256 rate);
    event MiningClaimed(address indexed miner, uint256 amount);
    event MiningRateUpdated(address indexed miner, uint256 newRate);

    constructor(address _msraToken) {
        msraToken = IERC20(_msraToken);
    }

    // Start mining
    function startMining(address miner, uint256 rate) external onlyOwner {
        require(rate > 0, "Rate must be positive");
        
        miners[miner] = MiningProfile({
            totalMined: 0,
            lastMiningTime: block.timestamp,
            miningRate: rate,
            active: true
        });

        emit MiningStarted(miner, rate);
    }

    // Claim mining rewards
    function claimMiningRewards(address miner) external {
        MiningProfile storage profile = miners[miner];
        require(profile.active, "Mining not active");

        uint256 timeElapsed = block.timestamp - profile.lastMiningTime;
        uint256 reward = (timeElapsed * profile.miningRate) / 1e18;

        require(reward > 0, "No rewards to claim");

        profile.totalMined += reward;
        profile.lastMiningTime = block.timestamp;

        require(msraToken.transferFrom(owner(), miner, reward), "Transfer failed");
        emit MiningClaimed(miner, reward);
    }

    // Get pending rewards
    function getPendingRewards(address miner) external view returns (uint256) {
        MiningProfile storage profile = miners[miner];
        if (!profile.active) return 0;

        uint256 timeElapsed = block.timestamp - profile.lastMiningTime;
        return (timeElapsed * profile.miningRate) / 1e18;
    }

    // Update mining rate (for KYC-verified users)
    function updateMiningRate(address miner, uint256 newRate) external onlyOwner {
        require(miners[miner].active, "Miner not active");
        miners[miner].miningRate = newRate;
        emit MiningRateUpdated(miner, newRate);
    }
}
