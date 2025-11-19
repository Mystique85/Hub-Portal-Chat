import React from 'react';

const MobileFooter = ({ 
  mobileView, 
  onMobileViewChange, 
  totalUnreadCount,
  activeDMChat 
}) => {
  const navItems = [
    { key: 'public', icon: '💬', label: 'Chat' },
    { key: 'users', icon: '👥', label: 'Users' },
    { key: 'private', icon: '✉️', label: 'Priv', badge: totalUnreadCount },
    { key: 'me', icon: '👤', label: 'My Profile' }
  ];

  return (
    <footer className="bg-gray-800/90 backdrop-blur-xl border-t border-gray-700/50 p-1 flex-shrink-0 safe-area-bottom">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => onMobileViewChange(item.key)}
            disabled={item.key === 'private' && !activeDMChat}
            className={`flex flex-col items-center p-1 rounded-xl transition-all min-w-14 touch-manipulation active:scale-95 relative ${
              mobileView === item.key 
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                : 'text-gray-400 hover:text-white'
            } ${item.key === 'private' && !activeDMChat ? 'opacity-50' : ''}`}
          >
            <span className="text-base mb-0.5 relative">
              {item.icon}
              {item.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center text-[10px] font-bold">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </span>
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </footer>
  );
};

export default MobileFooter;