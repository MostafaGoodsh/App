// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract MsrCryptoToken is ERC20, Ownable, ERC20Burnable {
    // KYC Status Mapping
    mapping(address => bool) public kycVerified;
    
    // Mining rewards tracking
    mapping(address => uint256) public miningRewards;
    
    // Events
    event KYCVerified(address indexed user);
    event MiningRewardClaimed(address indexed user, uint256 amount);
    event BurnedForLiquidity(address indexed burner, uint256 amount);

    constructor() ERC20("MS-RA Crypto", "MSRA") {
        // Initial supply: 1 billion tokens
        _mint(msg.sender, 1_000_000_000 * 10 ** decimals());
    }

    // Verify KYC for user
    function verifyKYC(address user) external onlyOwner {
        kycVerified[user] = true;
        emit KYCVerified(user);
    }

    // Claim mining rewards (only for KYC verified users)
    function claimMiningReward(uint256 amount) external {
        require(kycVerified[msg.sender], "KYC verification required");
        require(miningRewards[msg.sender] >= amount, "Insufficient mining rewards");
        
        miningRewards[msg.sender] -= amount;
        _mint(msg.sender, amount);
        emit MiningRewardClaimed(msg.sender, amount);
    }

    // Burn tokens for liquidity
    function burnForLiquidity(uint256 amount) external {
        _burn(msg.sender, amount);
        emit BurnedForLiquidity(msg.sender, amount);
    }

    // Transfer override with KYC check
    function transfer(address to, uint256 amount) public override returns (bool) {
        if (amount > 1000 * 10 ** decimals()) {
            require(kycVerified[msg.sender], "Large transfers require KYC verification");
        }
        return super.transfer(to, amount);
    }

    // Get user info
    function getUserInfo(address user) external view returns (bool verified, uint256 rewards, uint256 balance) {
        return (kycVerified[user], miningRewards[user], balanceOf(user));
    }
}
