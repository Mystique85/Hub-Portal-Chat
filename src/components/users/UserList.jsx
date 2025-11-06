// src/components/users/UserList.jsx
import UserItem from './UserItem';

const UserList = ({ 
  users, 
  currentUser, 
  unreadCounts, 
  onlineUsers, 
  onStartPrivateChat,
  activeDMChat,
  isOnlineList = false // Nowy prop do rozróżnienia list
}) => {
  // NIE FILTRUJ użytkowników - pokazuj WSZYSTKICH
  // Dla obu zakładek pokazujemy wszystkich użytkowników
  const displayedUsers = users;

  if (displayedUsers.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <div className="text-4xl mb-2">
            {isOnlineList ? "🟢" : "👥"}
          </div>
          <p>
            {isOnlineList 
              ? "No users online" 
              : "No users found"}
          </p>
          {isOnlineList && (
            <p className="text-sm text-gray-500 mt-2">
              You're the only one here
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto space-y-2">
      {displayedUsers.map(user => (
        <UserItem
          key={user.walletAddress}
          user={user}
          currentUser={currentUser}
          unreadCounts={unreadCounts}
          onlineUsers={onlineUsers}
          onStartPrivateChat={onStartPrivateChat}
          isActive={activeDMChat?.user?.walletAddress === user.walletAddress}
          showOnlineStatus={isOnlineList} // Pokazuj status online tylko w zakładce online
        />
      ))}
    </div>
  );
};

export default UserList;