// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
}

contract HubChatRewards {
    address public constant HUB_TOKEN = 0x58EFDe38eF2B12392BFB3dc4E503493C46636B3E;
    uint256 public constant REWARD_PER_MESSAGE = 1e18;
    uint256 public constant MAX_MESSAGE_LENGTH = 500;
    
    address public owner;
    bool public paused;
    
    string public welcomeMessage = "Welcome to HUB Chat! Earn HUB Ecosystem tokens for messages!";
    string public blacklistMessage = "This address cannot send messages. Contact HUB Chat support.";
    string public appLink = "https://hub-portal-chat.vercel.app/";
    
    struct Message {
        address sender;
        string content;
        uint256 timestamp;
    }
    
    struct UserStats {
        uint256 totalMessages;
        uint256 totalEarned;
        uint256 lastMessageTime;
        bool isBlocked;
    }
    
    mapping(address => UserStats) public userStats;
    mapping(address => bool) public blacklist;
    Message[] private messages;
    
    event MessageSent(address indexed sender, string content, uint256 timestamp, uint256 reward);
    event UserBlocked(address indexed user);
    event UserUnblocked(address indexed user);
    event MessageUpdated(string newMessage);
    event TokensReceived(address indexed from, uint256 amount);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier whenNotPaused() {
        require(!paused, "Contract is currently paused");
        _;
    }
    
    modifier notBlocked() {
        require(!blacklist[msg.sender] && !userStats[msg.sender].isBlocked, blacklistMessage);
        _;
    }

    constructor() {
        owner = msg.sender;
    }
    
    function sendMessage(string calldata _content) external whenNotPaused notBlocked {
        require(bytes(_content).length > 0 && bytes(_content).length <= MAX_MESSAGE_LENGTH, "Invalid message length");
        require(msg.sender == tx.origin, "Contracts cannot send messages");
        require(getContractHUBBalance() >= REWARD_PER_MESSAGE, "Insufficient HUB tokens in contract");
        
        bool success = IERC20(HUB_TOKEN).transfer(msg.sender, REWARD_PER_MESSAGE);
        require(success, "HUB transfer failed");
        
        messages.push(Message(msg.sender, _content, block.timestamp));
        
        userStats[msg.sender].totalMessages++;
        userStats[msg.sender].totalEarned += REWARD_PER_MESSAGE;
        userStats[msg.sender].lastMessageTime = block.timestamp;
        
        emit MessageSent(msg.sender, _content, block.timestamp, REWARD_PER_MESSAGE);
    }
    
    function depositHUBTokens(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        bool success = IERC20(HUB_TOKEN).transferFrom(msg.sender, address(this), amount);
        require(success, "HUB token transfer failed");
        emit TokensReceived(msg.sender, amount);
    }
    
    function onTokenTransfer(address from, uint256 amount, bytes calldata) external returns (bool) {
        require(msg.sender == HUB_TOKEN, "Only HUB token can call this");
        require(amount > 0, "Amount must be greater than 0");
        emit TokensReceived(from, amount);
        return true;
    }
    
    function getUserStats(address user) public view returns (uint256, uint256, uint256) {
        UserStats memory stats = userStats[user];
        return (stats.totalMessages, stats.totalEarned, stats.lastMessageTime);
    }
    
    function getTotalMessageCount() public view returns (uint256) {
        return messages.length;
    }
    
    function getContractHUBBalance() public view returns (uint256) {
        return IERC20(HUB_TOKEN).balanceOf(address(this));
    }
    
    function getHubChatInfo() public view returns (string memory, string memory, uint256, uint256, uint256, uint256) {
        return (
            welcomeMessage,
            appLink,
            REWARD_PER_MESSAGE,
            MAX_MESSAGE_LENGTH,
            messages.length,
            getContractHUBBalance()
        );
    }
    
    function setWelcomeMessage(string memory _newMessage) external onlyOwner {
        welcomeMessage = _newMessage;
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
    
    function pause() external onlyOwner {
        paused = true;
    }
    
    function unpause() external onlyOwner {
        paused = false;
    }
    
    function emergencyWithdrawHUB(address to) external onlyOwner {
        uint256 balance = getContractHUBBalance();
        require(balance > 0, "No tokens to withdraw");
        bool success = IERC20(HUB_TOKEN).transfer(to, balance);
        require(success, "Withdrawal failed");
    }
    
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid owner address");
        owner = newOwner;
    }
    
    receive() external payable {}
}