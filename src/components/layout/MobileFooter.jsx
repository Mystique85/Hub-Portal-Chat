import React, { useState } from 'react';

const MobileFooter = ({ 
  mobileView, 
  onMobileViewChange, 
  totalUnreadCount,
  activeDMChat,
  usersWithUnreadMessages,
  onStartPrivateChat,
  markAsRead
}) => {
  const [showInboxDropdown, setShowInboxDropdown] = useState(false);

  const handlePrivateClick = () => {
    if (activeDMChat) {
      onMobileViewChange('private');
      setShowInboxDropdown(false);
    } else if (totalUnreadCount > 0 && usersWithUnreadMessages?.length > 0) {
      setShowInboxDropdown(!showInboxDropdown);
    } else {
      onMobileViewChange('users');
      setTimeout(() => {
        alert("💬 Select a user to start a private chat");
      }, 300);
    }
  };

  const handleUserClick = async (user) => {
    if (markAsRead) {
      await markAsRead(user.walletAddress);
    }
    
    if (onStartPrivateChat) {
      await onStartPrivateChat(user);
    }
    
    onMobileViewChange('private');
    setShowInboxDropdown(false);
  };

  const navItems = [
    { key: 'public', icon: '💬', label: 'Chat' },
    { key: 'users', icon: '👥', label: 'Users' },
    { 
      key: 'private', 
      icon: '✉️', 
      label: 'Priv', 
      badge: totalUnreadCount,
      hasDropdown: totalUnreadCount > 0
    },
    { key: 'me', icon: '👤', label: 'My Profile' }
  ];

  return (
    <footer className="bg-gray-800/90 backdrop-blur-xl border-t border-gray-700/50 p-1 flex-shrink-0 safe-area-bottom relative">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={item.key === 'private' ? handlePrivateClick : () => onMobileViewChange(item.key)}
            className={`flex flex-col items-center p-1 rounded-xl transition-all min-w-14 touch-manipulation active:scale-95 relative ${
              mobileView === item.key || (item.key === 'private' && showInboxDropdown)
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="text-base mb-0.5 relative">
              {item.icon}
              {item.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center text-[10px] font-bold animate-pulse">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </span>
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      {showInboxDropdown && usersWithUnreadMessages && usersWithUnreadMessages.length > 0 && (
        <div className="absolute bottom-full left-0 right-0 mb-2 mx-4 bg-gray-800/95 backdrop-blur-xl border border-gray-600/50 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto">
          <div className="p-2 border-b border-gray-700/50">
            <div className="flex justify-between items-center">
              <span className="text-white text-sm font-semibold">📬 Unread Messages</span>
              <button 
                onClick={() => setShowInboxDropdown(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="text-gray-400 text-xs mt-1">
              {totalUnreadCount} unread message{totalUnreadCount !== 1 ? 's' : ''}
            </div>
          </div>
          
          <div className="divide-y divide-gray-700/50">
            {usersWithUnreadMessages.map((user) => (
              <div
                key={user.walletAddress}
                onClick={() => handleUserClick(user)}
                className="flex items-center gap-3 p-3 hover:bg-gray-700/50 active:bg-gray-700 cursor-pointer transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-lg">
                  {user.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium text-sm truncate">
                    {user.nickname}
                  </div>
                  <div className="text-gray-400 text-xs flex items-center gap-2 mt-0.5">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span>{user.unreadCount || 1} unread</span>
                  </div>
                </div>
                <div className="text-cyan-400 text-lg">→</div>
              </div>
            ))}
          </div>
          
          <div className="p-2 border-t border-gray-700/50 text-center">
            <div className="text-gray-400 text-xs">
              Tap to open chat
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default MobileFooter;