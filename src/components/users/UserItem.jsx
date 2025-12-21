import { ADMIN_ADDRESSES } from '../../utils/constants';

const UserItem = ({ 
  user, 
  currentUser, 
  onlineUsers, 
  showOnlineStatus = true,
  isMobile = false
}) => {
  const isOnline = onlineUsers.some(onlineUser => 
    onlineUser.walletAddress === user.walletAddress
  );
  const isCurrentUser = user.walletAddress === currentUser?.walletAddress?.toLowerCase();
  const isAdmin = ADMIN_ADDRESSES.includes(user.walletAddress?.toLowerCase());

  return (
    <div 
      className={`relative flex items-center gap-3 transition-all border group flex-shrink-0 ${
        isMobile 
          ? 'p-2 rounded-lg' 
          : 'p-3 rounded-xl'
      } border-gray-600/50`}
    >
      {/* User Avatar */}
      <div className="relative">
        <div className={`rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg ${
          isMobile
            ? 'w-8 h-8 text-sm'
            : 'w-10 h-10 text-base'
        }`}>
          {user.avatar}
        </div>
        {showOnlineStatus && isOnline && (
          <div className={`absolute border-2 border-gray-800 bg-green-400 rounded-full animate-pulse ${
            isMobile
              ? '-bottom-0.5 -right-0.5 w-2 h-2'
              : '-bottom-1 -right-1 w-3 h-3'
          }`}></div>
        )}
      </div>
      
      {/* User Info */}
      <div className="flex-1 min-w-0">
        <div className={`text-white font-medium truncate flex items-center gap-1 ${
          isMobile ? 'text-xs' : 'text-sm'
        }`}>
          {user.nickname}
          {isAdmin && (
            <span className={`bg-gradient-to-r from-purple-500 to-pink-500 text-white px-1 py-0.5 rounded-full font-medium ${
              isMobile ? 'text-[8px]' : 'text-[10px]'
            }`}>
              ADMIN
            </span>
          )}
          {isCurrentUser && <span className={`text-cyan-400 ${
            isMobile ? 'text-[10px]' : 'text-xs'
          }`}>(You)</span>}
          {showOnlineStatus && isOnline && !isCurrentUser && (
            <span className={`text-green-400 ${
              isMobile ? 'text-[10px]' : 'text-xs'
            }`}>🟢</span>
          )}
        </div>
        <div className={`text-gray-400 truncate ${
          isMobile ? 'text-[10px]' : 'text-xs'
        }`}>
          {user.walletAddress.slice(0, 8)}...{user.walletAddress.slice(-6)}
        </div>
      </div>
      
      {/* Online Status Dot */}
      {showOnlineStatus && isOnline && (
        <div className={`bg-green-400 rounded-full flex-shrink-0 animate-pulse ${
          isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'
        }`}></div>
      )}
    </div>
  );
};

export default UserItem;