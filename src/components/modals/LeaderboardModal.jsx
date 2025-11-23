import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { getCurrentSeason, getDaysRemaining, isSeasonActive } from '../../utils/seasons';

const LeaderboardModal = ({ isOpen, onClose, currentUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('season');
  const [searchQuery, setSearchQuery] = useState('');
  const [userRank, setUserRank] = useState(null);

  const season = getCurrentSeason();
  const daysRemaining = getDaysRemaining();
  const seasonActive = isSeasonActive();

  useEffect(() => {
    if (!isOpen || !db) return;

    const fieldToOrderBy = timeFilter === 'season' ? 'season1_messages' : 'totalMessages';
    const usersQuery = query(
      collection(db, 'users'), 
      orderBy(fieldToOrderBy, 'desc')
    );

    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setUsers(usersData);
      
      if (currentUser) {
        const rank = usersData.findIndex(user => 
          user.walletAddress === currentUser.walletAddress
        );
        setUserRank(rank >= 0 ? rank + 1 : null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isOpen, currentUser, timeFilter]);

  const getRankBadge = (index) => {
    switch(index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `#${index + 1}`;
    }
  };

  const getCeloReward = (rank) => {
    switch(rank) {
      case 1: return '100 CELO';
      case 2: return '80 CELO';
      case 3: return '60 CELO';
      case 4:
      case 5:
      case 6:
      case 7:
      case 8:
      case 9:
      case 10: return '20 CELO';
      default: return null;
    }
  };

  const getTimeFilterText = () => {
    switch(timeFilter) {
      case 'today': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'season': return season.displayName;
      default: return 'All Time';
    }
  };

  const getMessageCount = (user) => {
    switch(timeFilter) {
      case 'season': return user.season1_messages || 0;
      case 'today': return user.today_messages || 0;
      case 'week': return user.week_messages || 0;
      case 'month': return user.month_messages || 0;
      default: return user.totalMessages || 0;
    }
  };

  const filteredUsers = users.filter(user => 
    user.nickname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.walletAddress?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const topUsers = filteredUsers.slice(0, 10);

  const currentUserInFiltered = filteredUsers.findIndex(user => 
    user.walletAddress === currentUser?.walletAddress
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl w-full max-w-4xl h-[85vh] overflow-hidden flex flex-col">
        <div className="flex-shrink-0">
          <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                🏆 Leaderboard
              </h2>
              <p className="text-gray-400 text-xs mt-1">
                {getTimeFilterText()} - {seasonActive ? `${daysRemaining.fullText} remaining` : 'Season ended'}
              </p>
              {userRank && (
                <p className="text-cyan-400 text-xs mt-1">
                  Your position: <strong>#{userRank}</strong> of {users.length}
                </p>
              )}
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white text-xl p-1 hover:bg-gray-700/50 rounded-xl transition-all"
            >
              ✕
            </button>
          </div>

          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-y border-amber-500/20 p-3">
            <h3 className="text-amber-400 font-bold text-sm mb-2 text-center">🎁 Season 1 Rewards - Top 10</h3>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg p-2 text-center border border-yellow-500/30">
                <div className="text-yellow-400 font-bold">🥇 #1</div>
                <div className="text-yellow-300">HUB Sovereign</div>
                <div className="text-yellow-200 font-bold mt-1">100 CELO</div>
              </div>
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-2 text-center border border-purple-500/30">
                <div className="text-purple-400 font-bold">🥈 #2-3</div>
                <div className="text-purple-300">HUB Ambassador</div>
                <div className="text-purple-200 font-bold mt-1">80-60 CELO</div>
              </div>
              <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg p-2 text-center border border-cyan-500/30">
                <div className="text-cyan-400 font-bold">🥉 #4-10</div>
                <div className="text-cyan-300">HUB Contributor</div>
                <div className="text-cyan-200 font-bold mt-1">20 CELO</div>
              </div>
            </div>
            <p className="text-amber-300 text-xs mt-2 text-center">
              Top 10 users receive exclusive badges + CELO tokens at season end!
            </p>
          </div>

          <div className="flex gap-1 p-3 border-b border-gray-700/30 bg-gray-800/50">
            {['season', 'all', 'today', 'week', 'month'].map(filter => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  timeFilter === filter
                    ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {filter === 'all' && 'All Time'}
                {filter === 'today' && 'Today'}
                {filter === 'week' && 'This Week'}
                {filter === 'month' && 'This Month'}
                {filter === 'season' && 'Current Season'}
              </button>
            ))}
          </div>

          <div className="p-3 border-b border-gray-700/30">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users by nickname or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-2"></div>
                <div className="text-gray-400 text-sm">Loading leaderboard...</div>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-400">
                <div className="text-2xl mb-2">🔍</div>
                <p className="text-sm">No users found</p>
                <p className="text-xs mt-1">Try changing your search query</p>
              </div>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {topUsers.map((user, index) => {
                const globalIndex = users.findIndex(u => u.id === user.id);
                const messageCount = getMessageCount(user);
                const celoReward = getCeloReward(globalIndex + 1);
                return (
                  <div
                    key={user.id}
                    data-user-id={user.walletAddress}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      currentUser?.walletAddress === user.walletAddress
                        ? 'bg-cyan-500/20 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                        : 'bg-gray-700/30 border-gray-600/30 hover:bg-gray-700/50 hover:border-cyan-500/30'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm ${
                      globalIndex < 3 
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                        : 'bg-gray-600 text-gray-300'
                    }`}>
                      {getRankBadge(globalIndex)}
                    </div>

                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-lg">
                      {user.avatar}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-white font-medium text-sm truncate">
                          {user.nickname}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {user.walletAddress?.slice(0, 6)}...{user.walletAddress?.slice(-4)}
                        </div>
                        {currentUser?.walletAddress === user.walletAddress && (
                          <span className="bg-cyan-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                            You
                          </span>
                        )}
                      </div>
                      {celoReward && (
                        <div className="text-green-400 text-[10px] font-bold mt-1">
                          🪙 {celoReward}
                        </div>
                      )}
                    </div>

                    <div className="flex-shrink-0 text-right">
                      <div className={`font-bold text-lg ${
                        messageCount > 0 ? 'text-cyan-400' : 'text-gray-500'
                      }`}>
                        {messageCount}
                      </div>
                      <div className="text-gray-400 text-[10px]">
                        message{messageCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex-shrink-0 p-3 border-t border-gray-700/50 bg-gray-800/30">
          <div className="flex justify-between items-center">
            <div className="text-gray-400 text-xs">
              Showing {topUsers.length} of {filteredUsers.length} users
            </div>
            
            <div className="flex gap-1">
              {currentUserInFiltered >= 10 && (
                <button
                  onClick={() => {
                    const element = document.querySelector(`[data-user-id="${currentUser?.walletAddress}"]`);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }}
                  className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-xs font-medium transition-all"
                >
                  Find My Position
                </button>
              )}
            </div>
          </div>
          
          {filteredUsers.length > 0 && (
            <div className="grid grid-cols-3 gap-3 text-center mt-3 pt-3 border-t border-gray-700/30">
              <div>
                <div className="text-cyan-400 font-bold text-sm">
                  {filteredUsers.length}
                </div>
                <div className="text-gray-400 text-[10px]">Total Users</div>
              </div>
              <div>
                <div className="text-green-400 font-bold text-sm">
                  {filteredUsers.reduce((sum, user) => sum + getMessageCount(user), 0)}
                </div>
                <div className="text-gray-400 text-[10px]">Total Messages</div>
              </div>
              <div>
                <div className="text-purple-400 font-bold text-sm">
                  {getMessageCount(filteredUsers[0]) || 0}
                </div>
                <div className="text-gray-400 text-[10px]">Top Score</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardModal;