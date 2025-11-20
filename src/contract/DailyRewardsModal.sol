/**
 *Submitted for verification at celoscan.io on 2025-11-20
*/

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract HubChatDailyRewards {
    address public owner;
    
    uint256 public constant DAILY_CELO_REWARD = 0.1 ether;
    uint256 public constant CLAIM_COOLDOWN = 24 hours;
    uint256 public constant STREAK_TIMEFRAME = 48 hours;
    
    string public welcomeMessage = "Daily CELO reward claimed! Thank you for using HUB Chat!";
    string public cooldownMessage = "Please wait 24 hours between claims. Stay active in HUB Chat!";
    string public blacklistMessage = "This address cannot claim rewards. Contact HUB Chat support.";
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
        require(address(this).balance >= DAILY_CELO_REWARD, "Insufficient funds");
        
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
        stats.totalEarned += DAILY_CELO_REWARD;
        stats.lastStreakUpdate = block.timestamp;
        
        (bool success, ) = payable(user).call{value: DAILY_CELO_REWARD}("");
        require(success, "Transfer failed");
        
        string memory streakMessage = string(abi.encodePacked(
            welcomeMessage,
            " Current streak: ",
            uint2str(stats.streakCount),
            " days!"
        ));
        
        emit Claimed(user, DAILY_CELO_REWARD, block.timestamp, stats.streakCount, stats.totalClaims, streakMessage);
        emit StreakUpdated(user, stats.streakCount, stats.longestStreak);
    }

    function canClaim(address user) public view returns (bool, string memory) {
        if (blacklist[user] || userStats[user].isBlocked) return (false, blacklistMessage);
        
        UserStats memory stats = userStats[user];
        
        if (stats.lastClaimTime == 0) return (true, "Welcome! Claim your first daily CELO!");
        
        if (block.timestamp >= stats.lastClaimTime + CLAIM_COOLDOWN) {
            string memory message = string(abi.encodePacked(
                "Your daily reward is ready! Current streak: ",
                uint2str(stats.streakCount),
                " days"
            ));
            return (true, message);
        } else {
            return (false, cooldownMessage);
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
        string memory message
    ) {
        UserStats memory stats = userStats[user];
        
        if (blacklist[user] || stats.isBlocked) {
            return (false, stats.lastClaimTime, 0, 0, 0, 0, 0, 0, blacklistMessage);
        }
        
        lastClaim = stats.lastClaimTime;
        nextAvailableClaim = stats.lastClaimTime + CLAIM_COOLDOWN;
        currentStreak = stats.streakCount;
        longestStreak = stats.longestStreak;
        totalClaims = stats.totalClaims;
        totalEarned = stats.totalEarned;
        
        if (stats.lastClaimTime == 0) {
            return (true, 0, 0, 0, 0, 0, 0, 0, "Welcome! Claim your first daily CELO!");
        }
        
        if (block.timestamp >= nextAvailableClaim) {
            message = string(abi.encodePacked(
                "Reward available! Streak: ",
                uint2str(currentStreak),
                " days"
            ));
            return (true, lastClaim, nextAvailableClaim, 0, currentStreak, longestStreak, totalClaims, totalEarned, message);
        } else {
            timeRemaining = nextAvailableClaim - block.timestamp;
            message = string(abi.encodePacked(
                cooldownMessage,
                " Current streak: ",
                uint2str(currentStreak),
                " days"
            ));
            return (false, lastClaim, nextAvailableClaim, timeRemaining, currentStreak, longestStreak, totalClaims, totalEarned, message);
        }
    }
    
    function getStreakInfo(address user) public view returns (
        uint256 currentStreak,
        uint256 longestStreak,
        uint256 totalClaims,
        uint256 lastClaimTime,
        bool isActive
    ) {
        UserStats memory stats = userStats[user];
        currentStreak = stats.streakCount;
        longestStreak = stats.longestStreak;
        totalClaims = stats.totalClaims;
        lastClaimTime = stats.lastClaimTime;
        isActive = (block.timestamp <= stats.lastClaimTime + STREAK_TIMEFRAME);
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
    
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        payable(owner).transfer(balance);
    }
    
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid owner");
        owner = newOwner;
    }

    receive() external payable {}
    
    function deposit() external payable {}

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }
    
    function getHubChatInfo() public view returns (
        string memory message,
        string memory link,
        uint256 rewardAmount,
        uint256 cooldownHours
    ) {
        return (
            "HUB Chat Daily Rewards",
            appLink,
            DAILY_CELO_REWARD,
            CLAIM_COOLDOWN / 1 hours
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