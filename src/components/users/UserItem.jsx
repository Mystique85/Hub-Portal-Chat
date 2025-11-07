import { ADMIN_ADDRESSES } from '../../utils/constants';

const UserItem = ({ 
  user, 
  currentUser, 
  unreadCounts, 
  onlineUsers, 
  onStartPrivateChat,
  isActive,
  showOnlineStatus = true
}) => {
  const unreadCount = unreadCounts[user.walletAddress] || 0;
  const isOnline = onlineUsers.some(onlineUser => 
    onlineUser.walletAddress === user.walletAddress
  );
  const isCurrentUser = user.walletAddress === currentUser?.walletAddress?.toLowerCase();
  const isAdmin = ADMIN_ADDRESSES.includes(user.walletAddress?.toLowerCase());

  return (
    <div 
      className={`relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border group ${
        isActive
          ? 'bg-cyan-500/20 border-cyan-500/50' 
          : 'border-gray-600/50 hover:bg-gray-700/50 hover:border-cyan-500/30'
      } flex-shrink-0`}
      onClick={() => onStartPrivateChat(user)}
    >
      {/* User Avatar */}
      <div className="relative">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-base shadow-lg ${
          unreadCount > 0 ? 'animate-pulse' : ''
        }`}>
          {user.avatar}
        </div>
        {showOnlineStatus && isOnline && (
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-800 animate-pulse"></div>
        )}
      </div>
      
      {/* User Info */}
      <div className="flex-1 min-w-0">
        <div className="text-white font-medium truncate flex items-center gap-2">
          {user.nickname}
          {isAdmin && (
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
              ADMIN
            </span>
          )}
          {isCurrentUser && <span className="text-cyan-400 text-xs">(You)</span>}
          {showOnlineStatus && isOnline && !isCurrentUser && (
            <span className="text-green-400 text-xs">🟢</span>
          )}
        </div>
        <div className="text-gray-400 text-xs truncate">
          {user.walletAddress.slice(0, 8)}...{user.walletAddress.slice(-6)}
        </div>
      </div>
      
      {/* Unread Count */}
      {unreadCount > 0 && (
        <div className="flex items-center">
          <div className="relative">
            <div className="bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-bounce">
              {unreadCount}
            </div>
            <div className="absolute inset-0 bg-red-400 rounded-full animate-ping"></div>
          </div>
        </div>
      )}
      
      {/* Online Status Dot */}
      {!unreadCount && showOnlineStatus && isOnline && (
        <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0 animate-pulse"></div>
      )}
    </div>
  );
};

export default UserItem;