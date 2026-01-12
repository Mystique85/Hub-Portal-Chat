import { useState } from 'react';
import UserList from '../users/UserList';
import { ADMIN_ADDRESSES } from '../../utils/constants';
import { useNetwork } from '../../hooks/useNetwork';

const Sidebar = ({
  currentUser,
  onlineUsers,
  allUsers,
  activeTab,
  setActiveTab,
  markAsRead,
  onShowUserProfile,
  activeChat = 'public',
  onChatChange,
  isMobile = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  const [showChannelsDropdown, setShowChannelsDropdown] = useState(false);

  const { isCelo, isBase, tokenSymbol } = useNetwork();

  const filteredUsers = (activeTab === 'online' ? onlineUsers : allUsers).filter(user =>
    user.nickname?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const admins = allUsers.filter(user => 
    ADMIN_ADDRESSES.includes(user.walletAddress?.toLowerCase())
  ).map(admin => ({
    ...admin,
    isOnline: onlineUsers.some(onlineUser => 
      onlineUser.walletAddress === admin.walletAddress
    )
  }));

  const getSubscriptionBadge = () => {
    if (!currentUser?.subscriptionInfo) return null;
    
    const { tier, whitelisted, isActive } = currentUser.subscriptionInfo;
    
    if (whitelisted) {
      return (
        <span className="ml-1 text-purple-300 text-xs font-medium">
          👑 WHITE
        </span>
      );
    }
    
    if (isActive) {
      if (tier === 2) {
        return (
          <span className="ml-1 text-yellow-300 text-xs font-medium">
            ✨ PREM
          </span>
        );
      }
      if (tier === 1) {
        return (
          <span className="ml-1 text-cyan-300 text-xs font-medium">
            ⭐ BASIC
          </span>
        );
      }
    }
    
    return (
      <span className="ml-1 text-gray-300 text-xs font-medium">
        FREE
      </span>
    );
  };

  if (isMobile) {
    return (
      <div className="h-full flex flex-col bg-gray-900/50">
        <div className="p-2 border-b border-gray-700/50 flex-shrink-0 text-center">
          <div className="flex items-center justify-center gap-1 text-gray-400 text-xs">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
            {onlineUsers.length} online • {allUsers.length} total
          </div>
        </div>

        <div className="p-2 border-b border-gray-700/50 flex-shrink-0">
          <h3 className="text-gray-400 text-xs font-semibold mb-1 px-0.5">
            Channels
          </h3>
          <div className="space-y-1">
            <button 
              onClick={() => onChatChange('public')}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-all ${
                activeChat === 'public' 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/30 border border-transparent hover:border-cyan-500/20'
              }`}
            >
              <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                activeChat === 'public' 
                  ? 'bg-cyan-500/30 text-cyan-300' 
                  : 'bg-gray-700/50 text-gray-400'
              }`}>
                <span className="text-sm">💬</span>
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium">Public Chat</div>
                <div className="text-[10px] text-gray-500">All networks • Everyone</div>
              </div>
              {activeChat === 'public' && (
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
              )}
            </button>
            
            <button 
              onClick={() => onChatChange('say-hello')}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-all ${
                activeChat === 'say-hello' 
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/30 border border-transparent hover:border-green-500/20'
              }`}
            >
              <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                activeChat === 'say-hello' 
                  ? 'bg-green-500/30 text-green-300' 
                  : 'bg-gray-700/50 text-gray-400'
              }`}>
                <span className="text-sm">👋</span>
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium">Say Hello</div>
                <div className="text-[10px] text-gray-500">All networks • Welcome</div>
              </div>
              {activeChat === 'say-hello' && (
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
              )}
            </button>
            
            <button 
              onClick={() => onChatChange('memes')}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-all ${
                activeChat === 'memes' 
                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/30 border border-transparent hover:border-orange-500/20'
              }`}
            >
              <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                activeChat === 'memes' 
                  ? 'bg-orange-500/30 text-orange-300' 
                  : 'bg-gray-700/50 text-gray-400'
              }`}>
                <span className="text-sm">🎭</span>
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium">Memes</div>
                <div className="text-[10px] text-gray-500">All networks • Share images</div>
              </div>
              {activeChat === 'memes' && (
                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse"></div>
              )}
            </button>
            
            {isBase && (
              <button 
                onClick={() => onChatChange('base-airdrop')}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-all ${
                  activeChat === 'base-airdrop' 
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/30 border border-transparent hover:border-blue-500/20'
                }`}
              >
                <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                  activeChat === 'base-airdrop' 
                    ? 'bg-blue-500/30 text-blue-300' 
                    : 'bg-gray-700/50 text-gray-400'
                }`}>
                  <span className="text-sm">🎁</span>
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium">Airdrops & New Projects</div>
                  <div className="text-[10px] text-gray-500">Base network only</div>
                </div>
                {activeChat === 'base-airdrop' && (
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="p-2 border-b border-gray-700/50 flex-shrink-0">
          <div className="flex bg-gray-700/50 rounded-md p-0.5 border border-gray-600/50 mb-1">
            <button 
              className={`flex-1 py-1 px-1.5 rounded text-xs font-medium transition-all ${
                activeTab === 'online' 
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-sm' 
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('online')}
            >
              🟢 Online
            </button>
            <button 
              className={`flex-1 py-1 px-1.5 rounded text-xs font-medium transition-all ${
                activeTab === 'all' 
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-sm' 
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('all')}
            >
              👥 All Users
            </button>
          </div>

          <h4 className="text-gray-400 text-xs font-semibold px-0.5">
            {activeTab === 'online' 
              ? `🟢 Online Now (${filteredUsers.length})` 
              : `👥 All Users (${filteredUsers.length})`
            }
          </h4>
        </div>

        <div className="p-2 border-b border-gray-700/50 flex-shrink-0">
          <input
            type="text"
            placeholder="🔍 Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-2 py-1 bg-gray-700/50 border border-gray-600/50 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-xs"
          />
        </div>

        {admins.length > 0 && (
          <div className="p-2 border-b border-gray-700/50 flex-shrink-0 relative">
            <button
              onClick={() => setShowAdminDropdown(!showAdminDropdown)}
              className="w-full flex items-center justify-between gap-1 px-2 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-md text-white hover:bg-purple-500/30 transition-all text-xs"
            >
              <div className="flex items-center gap-1">
                <span>👑</span>
                <span>Contact Admin</span>
              </div>
              <span className={`transform transition-transform text-[10px] ${showAdminDropdown ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>

            {showAdminDropdown && (
              <div className="absolute top-full left-2 right-2 mt-0.5 bg-gray-800 border border-gray-600 rounded-md shadow-md z-20 max-h-32 overflow-y-auto">
                {admins.map(admin => (
                  <div
                    key={admin.walletAddress}
                    className="flex items-center gap-1.5 p-1.5 border-b border-gray-700/50 last:border-b-0"
                  >
                    <div className="w-5 h-5 rounded bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-[10px]">
                      {admin.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-xs font-medium truncate flex items-center gap-0.5">
                        {admin.nickname}
                        <span className="text-purple-400 text-[10px] font-medium">
                          Admin
                        </span>
                      </div>
                      <div className="text-gray-400 text-[10px] flex items-center gap-0.5">
                        {admin.isOnline ? (
                          <>
                            <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
                            Online
                          </>
                        ) : (
                          <>
                            <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                            Offline
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <UserList
            users={filteredUsers}
            currentUser={currentUser}
            onlineUsers={onlineUsers}
            isOnlineList={activeTab === 'online'}
            isMobile={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-gray-800/50 backdrop-blur-xl border-r border-gray-700/50 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-gray-700/50 flex-shrink-0">
        {currentUser && (
          <div 
            className="bg-gray-700/30 rounded-xl border border-gray-600/50 p-3 hover:bg-gray-700/40 hover:border-cyan-500/30 transition-all cursor-pointer group"
            onClick={onShowUserProfile}
            title="Click to view your profile"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-lg group-hover:scale-105 transition-transform">
                  {currentUser.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold text-sm truncate flex items-center">
                    {currentUser.nickname}
                    {getSubscriptionBadge()}
                  </div>
                  <div className="text-cyan-400 text-xs">{tokenSymbol}: {currentUser.balance || '0'}</div>
                </div>
              </div>
            </div>
            
            <div className="text-center text-gray-400 text-[10px]">
              {isBase && currentUser?.subscriptionInfo && (
                <div>
                  <span>
                    {currentUser.subscriptionInfo.whitelisted ? '👑 Whitelisted' : 
                     currentUser.subscriptionInfo.tier === 2 ? '✨ Premium' :
                     currentUser.subscriptionInfo.tier === 1 ? '⭐ Basic' : '🎫 Free'}
                  </span>
                  <span className="text-gray-500 mx-1">•</span>
                  <span className="text-cyan-300">Click to view profile</span>
                </div>
              )}
              {!isBase && !isCelo && (
                <div className="text-cyan-300">Click to view profile</div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-b border-gray-700/50 flex-shrink-0 relative">
        <button
          onClick={() => setShowChannelsDropdown(!showChannelsDropdown)}
          className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-white transition-all ${
            showChannelsDropdown
              ? 'bg-cyan-500/20 border border-cyan-500/30'
              : 'bg-gray-700/20 border border-gray-600/50 hover:bg-gray-700/30'
          }`}
        >
          <div className="flex items-center gap-2">
            <span>💬</span>
            <span className="font-medium">Channels</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-xs">
              {activeChat === 'public' ? 'Public Chat' : 
               activeChat === 'say-hello' ? 'Say Hello' : 
               activeChat === 'memes' ? 'Memes' :
               'Airdrops & New Projects'}
            </span>
            <span className={`transform transition-transform ${showChannelsDropdown ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </div>
        </button>

        {showChannelsDropdown && (
          <div className="absolute top-full left-4 right-4 mt-1 bg-gray-800 border border-gray-600 rounded-xl shadow-lg z-30 max-h-64 overflow-y-auto">
            <button
              onClick={() => {
                onChatChange('public');
                setShowChannelsDropdown(false);
              }}
              className={`w-full flex items-center gap-3 p-3 text-left transition-all border-b border-gray-700/50 hover:bg-gray-700/50 ${
                activeChat === 'public'
                  ? 'bg-cyan-500/20 text-cyan-300'
                  : 'text-gray-300'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                activeChat === 'public'
                  ? 'bg-cyan-500/30 text-cyan-300'
                  : 'bg-gray-700/50 text-gray-400'
              }`}>
                <span className="text-xl">💬</span>
              </div>
              <div className="flex-1">
                <div className="font-medium">Public Chat</div>
                <div className="text-xs text-gray-400">All networks • Everyone</div>
              </div>
              {activeChat === 'public' && (
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              )}
            </button>

            <button
              onClick={() => {
                onChatChange('say-hello');
                setShowChannelsDropdown(false);
              }}
              className={`w-full flex items-center gap-3 p-3 text-left transition-all border-b border-gray-700/50 hover:bg-gray-700/50 ${
                activeChat === 'say-hello'
                  ? 'bg-green-500/20 text-green-300'
                  : 'text-gray-300'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                activeChat === 'say-hello'
                  ? 'bg-green-500/30 text-green-300'
                  : 'bg-gray-700/50 text-gray-400'
              }`}>
                <span className="text-xl">👋</span>
              </div>
              <div className="flex-1">
                <div className="font-medium">Say Hello</div>
                <div className="text-xs text-gray-400">All networks • Welcome channel</div>
              </div>
              {activeChat === 'say-hello' && (
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              )}
            </button>

            <button
              onClick={() => {
                onChatChange('memes');
                setShowChannelsDropdown(false);
              }}
              className={`w-full flex items-center gap-3 p-3 text-left transition-all border-b border-gray-700/50 hover:bg-gray-700/50 ${
                activeChat === 'memes'
                  ? 'bg-orange-500/20 text-orange-300'
                  : 'text-gray-300'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                activeChat === 'memes'
                  ? 'bg-orange-500/30 text-orange-300'
                  : 'bg-gray-700/50 text-gray-400'
              }`}>
                <span className="text-xl">🎭</span>
              </div>
              <div className="flex-1">
                <div className="font-medium">Memes</div>
                <div className="text-xs text-gray-400">All networks • Share images</div>
              </div>
              {activeChat === 'memes' && (
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
              )}
            </button>

            {isBase && (
              <button
                onClick={() => {
                  onChatChange('base-airdrop');
                  setShowChannelsDropdown(false);
                }}
                className={`w-full flex items-center gap-3 p-3 text-left transition-all hover:bg-gray-700/50 ${
                  activeChat === 'base-airdrop'
                    ? 'bg-blue-500/20 text-blue-300'
                    : 'text-gray-300'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  activeChat === 'base-airdrop'
                    ? 'bg-blue-500/30 text-blue-300'
                    : 'bg-gray-700/50 text-gray-400'
                }`}>
                  <span className="text-xl">🎁</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium">Airdrops & New Projects</div>
                  <div className="text-xs text-gray-400">Base network only</div>
                </div>
                {activeChat === 'base-airdrop' && (
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {admins.length > 0 && (
        <div className="p-4 border-b border-gray-700/50 flex-shrink-0 relative">
          <button
            onClick={() => setShowAdminDropdown(!showAdminDropdown)}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-xl text-white hover:bg-purple-500/30 transition-all"
          >
            <div className="flex items-center gap-2">
              <span>👨‍💼</span>
              <span>Contact Admin</span>
            </div>
            <span className={`transform transition-transform ${showAdminDropdown ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>

          {showAdminDropdown && (
            <div className="absolute top-full left-4 right-4 mt-1 bg-gray-800 border border-gray-600 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto">
              {admins.map(admin => (
                <div
                  key={admin.walletAddress}
                  className="flex items-center gap-2 p-2 border-b border-gray-700/50 last:border-b-0"
                >
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-xs">
                    {admin.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate flex items-center gap-1">
                      {admin.nickname}
                      <span className="text-purple-400 text-xs font-medium">
                        Admin
                      </span>
                    </div>
                    <div className="text-gray-400 text-xs flex items-center gap-1">
                      {admin.isOnline ? (
                        <>
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                          Online
                        </>
                      ) : (
                        <>
                          <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
                          Offline
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="p-4 border-b border-gray-700/50 flex-shrink-0">
        <div className="flex bg-gray-700/50 rounded-xl p-1 border border-gray-600/50">
          <button 
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'online' 
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('online')}
            >
            🟢 Online
          </button>
          <button 
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'all' 
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('all')}
          >
            👥 All Users
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col p-4">
        <div className="mb-3 flex-shrink-0">
          <input
            type="text"
            placeholder="🔍 Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <h4 className="text-gray-400 text-sm font-semibold mb-3 flex-shrink-0">
          {activeTab === 'online' 
            ? `🟢 Online Now (${filteredUsers.length})` 
            : `👥 All Registered Users (${filteredUsers.length})`
          }
        </h4>
        
        <UserList
          users={filteredUsers}
          currentUser={currentUser}
          onlineUsers={onlineUsers}
          isOnlineList={activeTab === 'online'}
        />
      </div>

      <div className="p-4 border-t border-gray-700/50 flex-shrink-0">
        <div className="text-center text-gray-400 text-xs flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>{onlineUsers.length} online</span>
          <span className="text-gray-500">•</span>
          <span>
            {activeChat === 'public' ? '💬 Public Chat' : 
             activeChat === 'say-hello' ? '👋 Say Hello' : 
             activeChat === 'memes' ? '🎭 Memes' :
             '🎁 Airdrops & New Projects'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;