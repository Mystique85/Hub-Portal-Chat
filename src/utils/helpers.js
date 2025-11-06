// src/utils/helpers.js

// Format wallet address for display
export const formatWalletAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
};

// Check if user is online (last seen within 5 minutes)
export const isUserOnline = (lastSeen) => {
  if (!lastSeen) return false;
  const lastSeenDate = lastSeen.toDate();
  const now = new Date();
  return (now - lastSeenDate) < 5 * 60 * 1000; // 5 minutes
};

// Generate unique ID for temporary messages
export const generateTempId = () => {
  return `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Format timestamp for display
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'Just now';
  
  if (timestamp.toDate) {
    return timestamp.toDate().toLocaleTimeString();
  }
  
  if (timestamp instanceof Date) {
    return timestamp.toLocaleTimeString();
  }
  
  return 'Just now';
};

// Validate nickname
export const validateNickname = (nickname) => {
  if (!nickname || nickname.length < 3) {
    return 'Nickname must be at least 3 characters long';
  }
  
  if (nickname.length > 20) {
    return 'Nickname must be less than 20 characters';
  }
  
  // Basic character validation (alphanumeric and some special chars)
  const validChars = /^[a-zA-Z0-9_\-\. ]+$/;
  if (!validChars.test(nickname)) {
    return 'Nickname can only contain letters, numbers, spaces, and these special characters: _ - .';
  }
  
  return null; // No error
};

// Calculate total unread count from unreadCounts object
export const calculateTotalUnread = (unreadCounts) => {
  if (!unreadCounts) return 0;
  return Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);
};

// Create chat ID from two wallet addresses
export const createChatId = (address1, address2) => {
  const addresses = [address1.toLowerCase(), address2.toLowerCase()].sort();
  return addresses.join('_');
};

// Extract other participant from chat
export const getOtherParticipant = (chat, currentUserAddress) => {
  if (!chat || !chat.participants) return null;
  
  return chat.participants.find(
    participant => participant !== currentUserAddress.toLowerCase()
  );
};