import { useState } from 'react';
import UserList from '../users/UserList';
import { ADMIN_ADDRESSES } from '../../utils/constants';

const Sidebar = ({
  currentUser,
  onlineUsers,
  allUsers,
  activeTab,
  setActiveTab,
  totalUnreadCount,
  unreadCounts,
  onStartPrivateChat,
  activeDMChat,
  isMobile = false,
  onMobileViewChange,
  markAsRead
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

  const filteredUsers = (activeTab === 'online' ? onlineUsers : allUsers).filter(user =>
    user.nickname?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Użytkownicy z nieprzeczytanymi wiadomościami
  const usersWithUnread = allUsers.filter(user => unreadCounts[user.walletAddress] > 0);

  const admins = allUsers.filter(user => 
    ADMIN_ADDRESSES.includes(user.walletAddress?.toLowerCase())
  ).map(admin => ({
    ...admin,
    isOnline: onlineUsers.some(onlineUser => 
      onlineUser.walletAddress === admin.walletAddress
    )
  }));

  // Funkcja do obsługi kliknięcia użytkownika z notifications dropdown
  const handleNotificationClick = async (user) => {
    // Oznacz wiadomości jako przeczytane w Firebase
    if (markAsRead) {
      await markAsRead(user.walletAddress);
    }
    
    // Otwórz czat prywatny
    onStartPrivateChat(user);
    
    // Zamknij dropdown
    setShowNotificationsDropdown(false);
  };

  if (isMobile) {
    return (
      <div className="h-full flex flex-col bg-gray-900/50">
        <div className="p-4 border-b border-gray-700/50">
          <div className="flex bg-gray-700/50 rounded-xl p-1 border border-gray-600/50 mb-4">
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

          <input
            type="text"
            placeholder="🔍 Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
          />
        </div>

        {admins.length > 0 && (
          <div className="p-4 border-b border-gray-700/50 flex-shrink-0 relative">
            <button
              onClick={() => setShowAdminDropdown(!showAdminDropdown)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-xl text-white hover:bg-purple-500/30 transition-all"
            >
              <div className="flex items-center gap-2">
                <span>👑</span>
                <span>Message Admin</span>
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
                    onClick={() => {
                      onStartPrivateChat(admin);
                      setShowAdminDropdown(false);
                      onMobileViewChange('private');
                    }}
                    className="flex items-center gap-2 p-2 hover:bg-gray-700/50 cursor-pointer transition-all border-b border-gray-700/50 last:border-b-0"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-xs">
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

        <div className="flex-1 overflow-y-auto p-4">
          <UserList
            users={filteredUsers}
            currentUser={currentUser}
            unreadCounts={unreadCounts}
            onlineUsers={onlineUsers}
            onStartPrivateChat={(user) => {
              onStartPrivateChat(user);
              onMobileViewChange('private');
            }}
            activeDMChat={activeDMChat}
            isOnlineList={activeTab === 'online'}
            isMobile={true}
          />
        </div>
      </div>
    );
  }

  // DESKTOP VERSION
  return (
    <div className="w-80 bg-gray-800/50 backdrop-blur-xl border-r border-gray-700/50 flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-gray-700/50 flex-shrink-0">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
            <img 
              src="/hublogo.svg" 
              alt="HUB Portal" 
              className="w-5 h-5"
            />
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            HUB Chat
          </h3>
        </div>
        <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          {onlineUsers.length} online
          {totalUnreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full ml-2 animate-pulse">
              {totalUnreadCount} new
            </span>
          )}
        </div>
      </div>

      <div className="p-4 border-b border-gray-700/50 flex-shrink-0">
        {currentUser && (
          <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-xl border border-gray-600/50">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-xl">
              {currentUser.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-semibold truncate">{currentUser.nickname}</div>
              <div className="text-cyan-400 text-sm">HC: {currentUser.balance || '0'}</div>
              <div className="text-gray-400 text-xs">Rewards: {currentUser.remaining || '0'}/10 left</div>
            </div>
          </div>
        )}
      </div>

      {/* INBOX DROPDOWN - BEZ ZERA, POKAZUJE LICZNIK DOPIERO OD 1 */}
      <div className="p-4 border-b border-gray-700/50 flex-shrink-0 relative">
        <button
          onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
          className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-white transition-all ${
            totalUnreadCount > 0 
              ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 hover:bg-purple-500/30' 
              : 'bg-gray-700/20 border border-gray-600/50 hover:bg-gray-700/30'
          }`}
        >
          <div className="flex items-center gap-2">
            <span>📩</span>
            <span>Inbox</span>
            {totalUnreadCount > 0 && (
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* POKAZUJ LICZNIK TYLKO GDY SĄ NIEPRZECZYTANE WIADOMOŚCI */}
            {totalUnreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse min-w-6 text-center">
                {totalUnreadCount}
              </span>
            )}
            <span className={`text-gray-400 transform transition-transform ${showNotificationsDropdown ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </div>
        </button>

        {/* DROPDOWN CONTENT */}
        {showNotificationsDropdown && (
          <div className="absolute top-full left-4 right-4 mt-1 bg-gray-800 border border-gray-600 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto">
            {usersWithUnread.length > 0 ? (
              usersWithUnread.map(user => (
                <div
                  key={user.walletAddress}
                  onClick={() => handleNotificationClick(user)}
                  className="flex items-center gap-2 p-2 hover:bg-gray-700/50 cursor-pointer transition-all border-b border-gray-700/50 last:border-b-0"
                >
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-xs">
                    {user.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate">
                      {user.nickname}
                    </div>
                    <div className="text-gray-400 text-xs flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse"></div>
                      {unreadCounts[user.walletAddress]} unread
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-400 text-sm">
                No unread messages
              </div>
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
              <span>👑</span>
              <span>Message Admin</span>
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
                  onClick={() => {
                    onStartPrivateChat(admin);
                    setShowAdminDropdown(false);
                  }}
                  className="flex items-center gap-2 p-2 hover:bg-gray-700/50 cursor-pointer transition-all border-b border-gray-700/50 last:border-b-0"
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

      {/* ZAKŁADKI ONLINE/ALL USERS */}
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
          unreadCounts={unreadCounts}
          onlineUsers={onlineUsers}
          onStartPrivateChat={onStartPrivateChat}
          activeDMChat={activeDMChat}
          isOnlineList={activeTab === 'online'}
        />
      </div>

      <div className="p-4 border-t border-gray-700/50 flex-shrink-0">
        <div className="text-center text-gray-400 text-xs">
          Connected as {currentUser?.nickname}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;