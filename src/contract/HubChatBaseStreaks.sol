/**
 *Submitted for verification at basescan.org on 2025-11-29
*/

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract HubChatBaseStreaks {
    address public owner;
    
    uint256 public constant DAILY_USDC_REWARD = 10 * 10**6;
    uint256 public constant CLAIM_COOLDOWN = 24 hours;
    uint256 public constant STREAK_TIMEFRAME = 48 hours;
    uint256 public constant MIN_HUB_REQUIRED = 10 * 10**18;
    
    address public constant USDC_ADDRESS = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
    address public constant HUB_TOKEN_ADDRESS = 0x58EFDe38eF2B12392BFB3dc4E503493C46636B3E;
    
    string public welcomeMessage = "Daily USDC reward claimed! Thank you for using HUB Chat!";
    string public cooldownMessage = "Please wait 24 hours between claims. Stay active in HUB Chat!";
    string public blacklistMessage = "This address cannot claim rewards. Contact HUB Chat support.";
    string public insufficientHubMessage = "You need at least 10 HUB tokens to claim USDC reward, but your streak is saved!";
    string public streakSavedMessage = "Streak saved! Get 10 HUB tokens to claim USDC rewards.";
    string public appLink = "https://hub-portal-chat.vercel.app/";
    
    struct UserStats {
        uint256 lastClaimTime;
        uint256 streakCount;
        uint256 totalClaims;
        uint256 totalEarned;
        uint256 longestStreak;
        uint256 lastStreakUpdate;
        bool isBlocked;
    }
    
    mapping(address => UserStats) public userStats;
    mapping(address => bool) public blacklist;
    
    event Claimed(
        address indexed user,
        uint256 amount,
        uint256 timestamp,
        uint256 newStreak,
        uint256 totalClaims,
        string message
    );
    event StreakUpdated(address indexed user, uint256 newStreak, uint256 longestStreak);
    event StreakSaved(address indexed user, uint256 newStreak, string message);
    event UserBlocked(address indexed user);
    event UserUnblocked(address indexed user);
    event MessageUpdated(string newMessage);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    modifier notBlacklisted() {
        require(!blacklist[msg.sender] && !userStats[msg.sender].isBlocked, blacklistMessage);
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function claim() external notBlacklisted {
        address user = msg.sender;
        UserStats storage stats = userStats[user];
        
        require(block.timestamp >= stats.lastClaimTime + CLAIM_COOLDOWN, cooldownMessage);
        
        if (stats.lastClaimTime == 0) {
            stats.streakCount = 1;
        } else {
            if (block.timestamp <= stats.lastClaimTime + STREAK_TIMEFRAME) {
                stats.streakCount += 1;
            } else {
                stats.streakCount = 1;
            }
        }
        
        if (stats.streakCount > stats.longestStreak) {
            stats.longestStreak = stats.streakCount;
        }
        
        stats.lastClaimTime = block.timestamp;
        stats.totalClaims += 1;
        stats.lastStreakUpdate = block.timestamp;
        
        uint256 hubBalance = IERC20(HUB_TOKEN_ADDRESS).balanceOf(user);
        bool canClaimUSDC = hubBalance >= MIN_HUB_REQUIRED;
        
        if (canClaimUSDC) {
            uint256 contractUSDCBalance = IERC20(USDC_ADDRESS).balanceOf(address(this));
            require(contractUSDCBalance >= DAILY_USDC_REWARD, "Insufficient USDC funds in contract");
            
            stats.totalEarned += DAILY_USDC_REWARD;
            
            bool success = IERC20(USDC_ADDRESS).transfer(user, DAILY_USDC_REWARD);
            require(success, "USDC transfer failed");
            
            string memory streakMessage = string(abi.encodePacked(
                welcomeMessage,
                " Current streak: ",
                uint2str(stats.streakCount),
                " days!"
            ));
            
            emit Claimed(user, DAILY_USDC_REWARD, block.timestamp, stats.streakCount, stats.totalClaims, streakMessage);
        } else {
            emit StreakSaved(user, stats.streakCount, streakSavedMessage);
        }
        
        emit StreakUpdated(user, stats.streakCount, stats.longestStreak);
    }

    function canClaim(address user) public view returns (bool, string memory) {
        if (blacklist[user] || userStats[user].isBlocked) return (false, blacklistMessage);
        
        UserStats memory stats = userStats[user];
        uint256 hubBalance = IERC20(HUB_TOKEN_ADDRESS).balanceOf(user);
        bool hasEnoughHUB = hubBalance >= MIN_HUB_REQUIRED;
        
        if (stats.lastClaimTime == 0) {
            if (hasEnoughHUB) {
                return (true, "Welcome! Claim your first daily USDC!");
            } else {
                return (true, "Welcome! Claim to start your streak. Get 10 HUB tokens to earn USDC!");
            }
        }
        
        if (block.timestamp >= stats.lastClaimTime + CLAIM_COOLDOWN) {
            if (hasEnoughHUB) {
                string memory message = string(abi.encodePacked(
                    "Your daily reward is ready! Current streak: ",
                    uint2str(stats.streakCount),
                    " days"
                ));
                return (true, message);
            } else {
                string memory message = string(abi.encodePacked(
                    "Claim to maintain streak! Current streak: ",
                    uint2str(stats.streakCount),
                    " days. Get 10 HUB tokens to earn USDC!"
                ));
                return (true, message);
            }
        } else {
            if (hasEnoughHUB) {
                return (false, cooldownMessage);
            } else {
                string memory message = string(abi.encodePacked(
                    cooldownMessage,
                    " Current streak: ",
                    uint2str(stats.streakCount),
                    " days. Get 10 HUB tokens to earn USDC!"
                ));
                return (false, message);
            }
        }
    }
    
    function getUserStats(address user) public view returns (
        bool canClaimNow,
        uint256 lastClaim,
        uint256 nextAvailableClaim,
        uint256 timeRemaining,
        uint256 currentStreak,
        uint256 longestStreak,
        uint256 totalClaims,
        uint256 totalEarned,
        string memory message,
        bool hasEnoughHUB
    ) {
        UserStats memory stats = userStats[user];
        uint256 hubBalance = IERC20(HUB_TOKEN_ADDRESS).balanceOf(user);
        hasEnoughHUB = hubBalance >= MIN_HUB_REQUIRED;
        
        if (blacklist[user] || stats.isBlocked) {
            return (false, stats.lastClaimTime, 0, 0, 0, 0, 0, 0, blacklistMessage, hasEnoughHUB);
        }
        
        lastClaim = stats.lastClaimTime;
        nextAvailableClaim = stats.lastClaimTime + CLAIM_COOLDOWN;
        currentStreak = stats.streakCount;
        longestStreak = stats.longestStreak;
        totalClaims = stats.totalClaims;
        totalEarned = stats.totalEarned;
        
        if (stats.lastClaimTime == 0) {
            if (hasEnoughHUB) {
                return (true, 0, 0, 0, 0, 0, 0, 0, "Welcome! Claim your first daily USDC!", hasEnoughHUB);
            } else {
                return (true, 0, 0, 0, 0, 0, 0, 0, "Welcome! Claim to start your streak. Get 10 HUB tokens to earn USDC!", hasEnoughHUB);
            }
        }
        
        if (block.timestamp >= nextAvailableClaim) {
            if (hasEnoughHUB) {
                message = string(abi.encodePacked(
                    "Reward available! Streak: ",
                    uint2str(currentStreak),
                    " days"
                ));
            } else {
                message = string(abi.encodePacked(
                    "Claim to maintain streak: ",
                    uint2str(currentStreak),
                    " days. Get 10 HUB tokens to earn USDC!"
                ));
            }
            return (true, lastClaim, nextAvailableClaim, 0, currentStreak, longestStreak, totalClaims, totalEarned, message, hasEnoughHUB);
        } else {
            timeRemaining = nextAvailableClaim - block.timestamp;
            if (hasEnoughHUB) {
                message = string(abi.encodePacked(
                    cooldownMessage,
                    " Current streak: ",
                    uint2str(currentStreak),
                    " days"
                ));
            } else {
                message = string(abi.encodePacked(
                    cooldownMessage,
                    " Current streak: ",
                    uint2str(currentStreak),
                    " days. Get 10 HUB tokens to earn USDC!"
                ));
            }
            return (false, lastClaim, nextAvailableClaim, timeRemaining, currentStreak, longestStreak, totalClaims, totalEarned, message, hasEnoughHUB);
        }
    }
    
    function getStreakInfo(address user) public view returns (
        uint256 currentStreak,
        uint256 longestStreak,
        uint256 totalClaims,
        uint256 lastClaimTime,
        bool isActive,
        bool hasEnoughHUB
    ) {
        UserStats memory stats = userStats[user];
        currentStreak = stats.streakCount;
        longestStreak = stats.longestStreak;
        totalClaims = stats.totalClaims;
        lastClaimTime = stats.lastClaimTime;
        isActive = (block.timestamp <= stats.lastClaimTime + STREAK_TIMEFRAME);
        hasEnoughHUB = IERC20(HUB_TOKEN_ADDRESS).balanceOf(user) >= MIN_HUB_REQUIRED;
    }

    function setWelcomeMessage(string memory _newMessage) external onlyOwner {
        welcomeMessage = _newMessage;
        emit MessageUpdated(_newMessage);
    }
    
    function setCooldownMessage(string memory _newMessage) external onlyOwner {
        cooldownMessage = _newMessage;
        emit MessageUpdated(_newMessage);
    }
    
    function setBlacklistMessage(string memory _newMessage) external onlyOwner {
        blacklistMessage = _newMessage;
        emit MessageUpdated(_newMessage);
    }
    
    function setAppLink(string memory _newLink) external onlyOwner {
        appLink = _newLink;
    }
    
    function blockUser(address user) external onlyOwner {
        blacklist[user] = true;
        userStats[user].isBlocked = true;
        emit UserBlocked(user);
    }
    
    function unblockUser(address user) external onlyOwner {
        blacklist[user] = false;
        userStats[user].isBlocked = false;
        emit UserUnblocked(user);
    }
    
    function emergencyWithdrawUSDC() external onlyOwner {
        uint256 balance = IERC20(USDC_ADDRESS).balanceOf(address(this));
        require(balance > 0, "No USDC to withdraw");
        IERC20(USDC_ADDRESS).transfer(owner, balance);
    }
    
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid owner");
        owner = newOwner;
    }

    function getContractBalance() public view returns (uint256) {
        return IERC20(USDC_ADDRESS).balanceOf(address(this));
    }
    
    function getHubBalance(address user) public view returns (uint256) {
        return IERC20(HUB_TOKEN_ADDRESS).balanceOf(user);
    }
    
    function getHubChatInfo() public view returns (
        string memory message,
        string memory link,
        uint256 rewardAmount,
        uint256 cooldownHours,
        uint256 minHubRequired
    ) {
        return (
            "HUB Chat Daily Rewards - Base",
            appLink,
            DAILY_USDC_REWARD,
            CLAIM_COOLDOWN / 1 hours,
            MIN_HUB_REQUIRED
        );
    }

    function uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) return "0";
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - (_i / 10) * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
}