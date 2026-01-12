import React, { useState } from 'react';
import { useNetwork } from '../../hooks/useNetwork';

const MobileFooter = ({ 
  mobileView, 
  onMobileViewChange, 
  // DODANE: Props dla przełączania kanałów
  activeChat = 'public',
  onChatChange
}) => {
  const [showChannelsDropdown, setShowChannelsDropdown] = useState(false);
  
  const { isBase } = useNetwork();

  const handleChannelSelect = (channel) => {
    onChatChange(channel);
    setShowChannelsDropdown(false);
    // Jeśli nie jesteśmy w public view, przełącz na public aby zobaczyć chat
    if (mobileView !== 'public') {
      onMobileViewChange('public');
    }
  };

  const navItems = [
    { key: 'channels', icon: '📢', label: 'Channels' },
    { key: 'public', icon: '💬', label: 'Chat' },
    { key: 'users', icon: '👥', label: 'Users' },
    { key: 'me', icon: '👤', label: 'My Profile' }
  ];

  return (
    <footer className="bg-gray-800/90 backdrop-blur-xl border-t border-gray-700/50 p-1 flex-shrink-0 safe-area-bottom relative">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => {
              if (item.key === 'channels') {
                setShowChannelsDropdown(!showChannelsDropdown);
              } else {
                onMobileViewChange(item.key);
                setShowChannelsDropdown(false);
              }
            }}
            className={`flex flex-col items-center p-1 rounded-xl transition-all min-w-14 touch-manipulation active:scale-95 relative ${
              mobileView === item.key || 
              (item.key === 'channels' && showChannelsDropdown)
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="text-base mb-0.5 relative">
              {item.icon}
            </span>
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      {/* DROPDOWN KANAŁÓW */}
      {showChannelsDropdown && (
        <div className="absolute bottom-full left-0 right-0 mb-2 mx-4 bg-gray-800/95 backdrop-blur-xl border border-gray-600/50 rounded-xl shadow-2xl z-50">
          <div className="p-3 border-b border-gray-700/50">
            <div className="flex justify-between items-center">
              <span className="text-white text-sm font-semibold">📢 Select Channel</span>
              <button 
                onClick={() => setShowChannelsDropdown(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="text-gray-400 text-xs mt-1">
              Switch between chat channels
            </div>
          </div>
          
          <div className="divide-y divide-gray-700/50">
            {/* PUBLIC CHAT */}
            <div
              onClick={() => handleChannelSelect('public')}
              className={`flex items-center gap-3 p-4 transition-all ${
                activeChat === 'public' 
                  ? 'bg-cyan-500/10 border-l-4 border-cyan-500' 
                  : 'hover:bg-gray-700/50 active:bg-gray-700'
              } cursor-pointer`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                activeChat === 'public' 
                  ? 'bg-cyan-500/30 text-cyan-300' 
                  : 'bg-gray-700/70 text-gray-300'
              }`}>
                <span>💬</span>
              </div>
              <div className="flex-1">
                <div className="text-white font-medium text-sm">
                  General Chat
                </div>
                <div className="text-gray-400 text-xs mt-0.5">
                  All networks • Everyone
                </div>
              </div>
              {activeChat === 'public' && (
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              )}
            </div>
            
            {/* SAY HELLO CHANNEL */}
            <div
              onClick={() => handleChannelSelect('say-hello')}
              className={`flex items-center gap-3 p-4 transition-all ${
                activeChat === 'say-hello' 
                  ? 'bg-green-500/10 border-l-4 border-green-500' 
                  : 'hover:bg-gray-700/50 active:bg-gray-700'
              } cursor-pointer`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                activeChat === 'say-hello' 
                  ? 'bg-green-500/30 text-green-300' 
                  : 'bg-gray-700/70 text-gray-300'
              }`}>
                <span>👋</span>
              </div>
              <div className="flex-1">
                <div className="text-white font-medium text-sm">
                  Say Hello
                </div>
                <div className="text-gray-400 text-xs mt-0.5">
                  All networks • Welcome
                </div>
              </div>
              {activeChat === 'say-hello' && (
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              )}
            </div>
            
            {/* MEMES CHANNEL */}
            <div
              onClick={() => handleChannelSelect('memes')}
              className={`flex items-center gap-3 p-4 transition-all ${
                activeChat === 'memes' 
                  ? 'bg-orange-500/10 border-l-4 border-orange-500' 
                  : 'hover:bg-gray-700/50 active:bg-gray-700'
              } cursor-pointer`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                activeChat === 'memes' 
                  ? 'bg-orange-500/30 text-orange-300' 
                  : 'bg-gray-700/70 text-gray-300'
              }`}>
                <span>🎭</span>
              </div>
              <div className="flex-1">
                <div className="text-white font-medium text-sm">
                  Memes
                </div>
                <div className="text-gray-400 text-xs mt-0.5">
                  All networks • Share images
                </div>
              </div>
              {activeChat === 'memes' && (
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
              )}
            </div>
            
            {/* BASE AIRDROP CHANNEL */}
            {isBase && (
              <div
                onClick={() => handleChannelSelect('base-airdrop')}
                className={`flex items-center gap-3 p-4 transition-all ${
                  activeChat === 'base-airdrop' 
                    ? 'bg-blue-500/10 border-l-4 border-blue-500' 
                    : 'hover:bg-gray-700/50 active:bg-gray-700'
                } cursor-pointer`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                  activeChat === 'base-airdrop' 
                    ? 'bg-blue-500/30 text-blue-300' 
                    : 'bg-gray-700/70 text-gray-300'
                }`}>
                  <span>🎁</span>
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium text-sm">
                    Airdrops & New Projects
                  </div>
                  <div className="text-gray-400 text-xs mt-0.5">
                    Base network only
                  </div>
                </div>
                {activeChat === 'base-airdrop' && (
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                )}
              </div>
            )}
          </div>
          
          <div className="p-3 border-t border-gray-700/50 text-center">
            <div className="text-gray-400 text-xs">
              Currently in: {
                activeChat === 'public' ? '💬 General' :
                activeChat === 'say-hello' ? '👋 Say Hello' :
                activeChat === 'memes' ? '🎭 Memes' :
                '🎁 Base Airdrop'
              }
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default MobileFooter;