import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { getCurrentSeason, getSeasonBadge } from '../../utils/seasons';
import SendHCModal from './SendHCModal';
import { useNetwork } from '../../hooks/useNetwork';

const UserProfileModal = ({ user, onClose, getOtherUserBalance, currentUser }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [userBalance, setUserBalance] = useState('0');
  const [loading, setLoading] = useState(true);
  const [showSendModal, setShowSendModal] = useState(false);
  const [seasonStats, setSeasonStats] = useState(null);

  const { isCelo, isBase, tokenSymbol, currentNetwork } = useNetwork();
  const season = getCurrentSeason();

  useEffect(() => {
    const loadProfileData = async () => {
      if (!user || !user.walletAddress) return;
      
      setLoading(true);
      try {
        const userDoc = await getDoc(doc(db, 'users', user.walletAddress.toLowerCase()));
        const firestoreProfile = userDoc.exists() ? userDoc.data() : null;
        
        let balance = '0';
        
        // ✅ POPRAWIONE: Dla Base używaj currentUser.balance (tak jak w Sidebar)
        if (isBase && currentUser && user.walletAddress === currentUser.walletAddress) {
          balance = currentUser.balance || '0';
        } else if (getOtherUserBalance) {
          // Dla Celo lub innych użytkowników używaj getOtherUserBalance
          balance = await getOtherUserBalance(user.walletAddress);
        }
        
        setUserProfile(firestoreProfile);
        setUserBalance(balance);
        
        if (firestoreProfile && isCelo) {
          setSeasonStats({
            seasonMessages: firestoreProfile.season1_messages || 0,
            seasonRank: firestoreProfile.season1_rank || null,
            seasonReward: firestoreProfile.season1_reward || null,
            badges: firestoreProfile.badges || []
          });
        }
        
      } catch (error) {
        console.error('Error loading user profile:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadProfileData();
  }, [user, getOtherUserBalance, isCelo, isBase, currentUser]);

  const getBadgeColor = (badgeType) => {
    switch(badgeType) {
      case 'legendary': return 'from-yellow-400 to-orange-500';
      case 'epic': return 'from-purple-500 to-pink-500';
      case 'rare': return 'from-cyan-500 to-blue-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  if (!user) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 max-w-sm w-full">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4">
              User Profile
            </h2>
            
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-3xl">
                {user.avatar}
              </div>
              <div className="text-left">
                <div className="text-white font-semibold text-xl">{user.nickname}</div>
                <div className="text-gray-400 text-sm mt-1">
                  {user.walletAddress?.slice(0, 8)}...{user.walletAddress?.slice(-6)}
                </div>
                {/* DODANE: Wskaźnik czy to twój profil */}
                {currentUser && user.walletAddress === currentUser.walletAddress && (
                  <div className="text-cyan-400 text-xs mt-1">(Your Profile)</div>
                )}
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto"></div>
              <div className="text-gray-400 mt-2">Loading profile...</div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-4 text-center">
                <div className="text-cyan-400 font-bold text-3xl mb-2">
                  {userBalance}
                </div>
                <div className="text-cyan-300 text-sm">{tokenSymbol} Tokens</div>
                {/* DODANE: Informacja o źródle balance */}
                <div className="text-cyan-500 text-xs mt-1">
                  {isBase && currentUser && user.walletAddress === currentUser.walletAddress 
                    ? "Live balance from wallet" 
                    : "Balance from network"}
                </div>
              </div>
              
              <div className="bg-gray-700/50 rounded-xl p-3 text-center">
                <div className="text-green-400 font-bold text-lg">
                  {userProfile?.totalMessages || '0'}
                </div>
                <div className="text-gray-400 text-xs">Total Messages</div>
              </div>

              {isCelo && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-700/50 rounded-xl p-3 text-center">
                      <div className="text-purple-400 font-bold text-lg">
                        {seasonStats?.seasonMessages || '0'}
                      </div>
                      <div className="text-gray-400 text-xs">{season.displayName}</div>
                    </div>
                    <div className="bg-gray-700/50 rounded-xl p-3 text-center">
                      <div className="text-amber-400 font-bold text-lg">
                        {seasonStats?.seasonRank || '-'}
                      </div>
                      <div className="text-gray-400 text-xs">Season Rank</div>
                    </div>
                  </div>

                  <div className="bg-gray-700/50 rounded-xl p-3 text-center">
                    <div className="text-blue-400 font-bold text-lg">
                      {userProfile?.createdAt ? 
                        new Date(userProfile.createdAt.toDate()).toLocaleDateString() : 
                        'Unknown'
                      }
                    </div>
                    <div className="text-gray-400 text-xs">Joined</div>
                  </div>

                  {seasonStats?.badges && seasonStats.badges.length > 0 && (
                    <div className="bg-gray-700/30 rounded-2xl p-4">
                      <h3 className="text-white font-semibold text-sm mb-3 text-center">Season Badges</h3>
                      <div className="space-y-2">
                        {seasonStats.badges.map((badge, index) => {
                          const badgeInfo = Object.values(season.rewards).find(r => r.badge === badge);
                          return (
                            <div
                              key={index}
                              className={`bg-gradient-to-r ${getBadgeColor(badgeInfo?.type)} text-white rounded-xl p-3 text-center text-sm font-medium`}
                            >
                              {badge}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* USUNIĘTA SEKCJA: Unlimited HUB Rewards */}
              
              <div className="flex gap-3">
                <button 
                  onClick={onClose}
                  className="flex-1 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-gray-400 hover:text-white transition-all"
                >
                  Close
                </button>
                <button 
                  onClick={() => setShowSendModal(true)}
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all"
                >
                  Send {tokenSymbol}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showSendModal && (
        <SendHCModal 
          user={user}
          currentUser={currentUser}
          onClose={() => setShowSendModal(false)}
          getOtherUserBalance={getOtherUserBalance}
        />
      )}
    </>
  );
};

export default UserProfileModal;