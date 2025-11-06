// src/components/layout/Sidebar.jsx
import { ConnectButton } from '@rainbow-me/rainbowkit';
import UserList from '../users/UserList';

const Sidebar = ({
  currentUser,
  onlineUsers,
  allUsers,
  activeTab,
  setActiveTab,
  totalUnreadCount,
  unreadCounts,
  onStartPrivateChat,
  activeDMChat
}) => {
  return (
    <div className="w-80 bg-gray-800/50 backdrop-blur-xl border-r border-gray-700/50 flex flex-col h-full overflow-hidden">
      {/* Header */}
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

      {/* Current User Info */}
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
              {totalUnreadCount > 0 && (
                <div className="text-green-400 text-xs animate-pulse">
                  📩 {totalUnreadCount} unread messages
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tabs - FINALNA WERSJA */}
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
            🟢 Online ({onlineUsers.length})
          </button>
          <button 
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'all' 
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('all')}
          >
            👥 All Users ({allUsers.length})
          </button>
        </div>
      </div>

      {/* User List - FINALNA WERSJA */}
      <div className="flex-1 overflow-hidden flex flex-col p-4">
        <h4 className="text-gray-400 text-sm font-semibold mb-3 flex-shrink-0">
          {activeTab === 'online' 
            ? `🟢 Online Now (${onlineUsers.length})` 
            : `👥 All Registered Users (${allUsers.length})`
          }
        </h4>
        
        <UserList
          users={activeTab === 'online' ? onlineUsers : allUsers}
          currentUser={currentUser}
          unreadCounts={unreadCounts}
          onlineUsers={onlineUsers}
          onStartPrivateChat={onStartPrivateChat}
          activeDMChat={activeDMChat}
          isOnlineList={activeTab === 'online'} // Nowy prop!
        />
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700/50 flex-shrink-0 space-y-3">
        <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-xl border border-gray-600/50">
          <span className="text-gray-400 text-sm">Daily Rewards:</span>
          <strong className="text-cyan-400">{currentUser?.remaining || '0'}/10</strong>
        </div>
        
        <div className="flex justify-center">
          <ConnectButton showBalance={false} />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;