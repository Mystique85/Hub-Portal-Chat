// src/components/users/UserList.jsx
import UserItem from './UserItem';

const UserList = ({ 
  users, 
  currentUser, 
  unreadCounts, 
  onlineUsers, 
  onStartPrivateChat,
  activeDMChat,
  isOnlineList = false, // Nowy prop do rozróżnienia list
  isMobile = false // DODAJEMY PROP DLA MOBILE
}) => {
  // NIE FILTRUJ użytkowników - pokazuj WSZYSTKICH
  // Dla obu zakładek pokazujemy wszystkich użytkowników
  const displayedUsers = users;

  if (displayedUsers.length === 0) {
    return (
      <div className={`flex-1 flex items-center justify-center text-gray-400 ${
        isMobile ? 'p-2' : 'p-4'
      }`}>
        <div className="text-center">
          <div className={`mb-2 ${
            isMobile ? 'text-2xl' : 'text-4xl'
          }`}>
            {isOnlineList ? "🟢" : "👥"}
          </div>
          <p className={isMobile ? 'text-xs' : 'text-sm'}>
            {isOnlineList 
              ? "No users online" 
              : "No users found"}
          </p>
          {isOnlineList && (
            <p className={`mt-1 ${
              isMobile ? 'text-[10px] text-gray-500' : 'text-sm text-gray-500'
            }`}>
              You're the only one here
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 overflow-y-auto ${
      isMobile ? 'space-y-1.5' : 'space-y-2'
    }`}>
      {displayedUsers.map(user => (
        <UserItem
          key={user.walletAddress}
          user={user}
          currentUser={currentUser}
          unreadCounts={unreadCounts}
          onlineUsers={onlineUsers}
          onStartPrivateChat={onStartPrivateChat}
          isActive={activeDMChat?.user?.walletAddress === user.walletAddress}
          showOnlineStatus={isOnlineList}
          isMobile={isMobile} // PRZEKAZUJEMY DO UserItem
        />
      ))}
    </div>
  );
};

export default UserList;