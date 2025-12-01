import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { getCurrentSeason, getSeasonBadge } from '../../utils/seasons';
import SendHCModal from './SendHCModal';
import { useNetwork } from '../../hooks/useNetwork';

const UserProfileModal = ({ user, onClose, getOtherUserBalance, currentUser }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [celoBalance, setCeloBalance] = useState('0');
  const [baseBalance, setBaseBalance] = useState('0');
  const [loading, setLoading] = useState(true);
  const [showSendModal, setShowSendModal] = useState(false);
  const [seasonStats, setSeasonStats] = useState(null);
  const [networkStatus, setNetworkStatus] = useState({
    celo: 'loading',
    base: 'loading'
  });

  const { isCelo, isBase, tokenSymbol } = useNetwork();
  const season = getCurrentSeason();

  // Funkcja do formatowania dużych liczb
  const formatLargeNumber = (num) => {
    if (!num || num === '0') return '0';
    
    const number = parseFloat(num);
    if (isNaN(number)) return '0';
    
    // Dla bardzo dużych liczb używamy skrótów
    if (number >= 1000000) {
      return (number / 1000000).toFixed(2) + 'M';
    }
    if (number >= 1000) {
      return (number / 1000).toFixed(2) + 'K';
    }
    
    // Dla liczb z dużą ilością miejsc po przecinku
    if (number.toString().includes('.') && number.toString().split('.')[1].length > 4) {
      return number.toFixed(4);
    }
    
    return number.toString();
  };

  useEffect(() => {
    const loadProfileData = async () => {
      if (!user || !user.walletAddress) return;
      
      setLoading(true);
      setNetworkStatus({ celo: 'loading', base: 'loading' });
      
      try {
        const userDoc = await getDoc(doc(db, 'users', user.walletAddress.toLowerCase()));
        const firestoreProfile = userDoc.exists() ? userDoc.data() : null;
        setUserProfile(firestoreProfile);
        
        if (getOtherUserBalance) {
          if (currentUser && user.walletAddress === currentUser.walletAddress) {
            if (isCelo) {
              setCeloBalance(currentUser.balance || '0');
              setNetworkStatus(prev => ({ ...prev, celo: 'live' }));
            } else if (isBase) {
              setBaseBalance(currentUser.balance || '0');
              setNetworkStatus(prev => ({ ...prev, base: 'live' }));
            }
            
            try {
              const balances = await getOtherUserBalance(user.walletAddress);
              if (isCelo) {
                setBaseBalance(balances.base || '0');
                setNetworkStatus(prev => ({ ...prev, base: 'fetched' }));
              } else if (isBase) {
                setCeloBalance(balances.celo || '0');
                setNetworkStatus(prev => ({ ...prev, celo: 'fetched' }));
              }
            } catch (error) {
              if (isCelo) setBaseBalance('0');
              if (isBase) setCeloBalance('0');
            }
          } else {
            try {
              const balances = await getOtherUserBalance(user.walletAddress);
              setCeloBalance(balances.celo || '0');
              setBaseBalance(balances.base || '0');
              setNetworkStatus({
                celo: balances.celo !== '0' ? 'fetched' : 'zero',
                base: balances.base !== '0' ? 'fetched' : 'zero'
              });
            } catch (error) {
              setCeloBalance('0');
              setBaseBalance('0');
              setNetworkStatus({ celo: 'error', base: 'error' });
            }
          }
        }
        
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

  const getNetworkStatusText = (network, status) => {
    if (network === 'celo' && isCelo) return 'Live';
    if (network === 'base' && isBase) return 'Live';
    
    switch(status) {
      case 'live': return 'Live';
      case 'fetched': return 'Network';
      case 'zero': return 'Empty';
      case 'error': return 'Error';
      default: return '...';
    }
  };

  if (!user) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-5 max-w-sm w-full">
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-3">
              User Profile
            </h2>
            
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-2xl">
                {user.avatar}
              </div>
              <div className="text-left">
                <div className="text-white font-semibold text-lg">{user.nickname}</div>
                <div className="text-gray-400 text-xs mt-0.5">
                  {user.walletAddress?.slice(0, 6)}...{user.walletAddress?.slice(-4)}
                </div>
                {currentUser && user.walletAddress === currentUser.walletAddress && (
                  <div className="text-cyan-400 text-[10px] mt-0.5">(Your Profile)</div>
                )}
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-cyan-500 mx-auto"></div>
              <div className="text-gray-400 text-sm mt-2">Loading profile...</div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* IMPROVED DUAL BALANCE SECTION */}
              <div className="space-y-3">
                <div className="text-gray-400 text-xs text-center">Token Balance</div>
                
                <div className="grid grid-cols-2 gap-2">
                  {/* Base Network - $HUB */}
                  <div className={`bg-blue-500/10 border rounded-xl p-3 text-center ${
                    isBase ? 'border-blue-500/40' : 'border-blue-500/20'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1">
                        <span className="text-blue-400 text-xs">🌉</span>
                        <span className="text-blue-300 text-[10px]">Base</span>
                      </div>
                      <div className={`text-[9px] px-1 py-0.5 rounded ${
                        networkStatus.base === 'live' ? 'bg-blue-500/30 text-blue-300' :
                        networkStatus.base === 'fetched' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-gray-700/50 text-gray-400'
                      }`}>
                        {getNetworkStatusText('base', networkStatus.base)}
                      </div>
                    </div>
                    <div className="text-blue-400 font-bold text-lg truncate" title={baseBalance}>
                      {formatLargeNumber(baseBalance)}
                    </div>
                    <div className="text-blue-300 text-[10px]">$HUB Token</div>
                    {parseFloat(baseBalance) >= 1000 && (
                      <div className="text-blue-500/70 text-[8px] mt-0.5 truncate" title={baseBalance}>
                        ({baseBalance})
                      </div>
                    )}
                  </div>
                  
                  {/* Celo Network - $HC */}
                  <div className={`bg-amber-500/10 border rounded-xl p-3 text-center ${
                    isCelo ? 'border-amber-500/40' : 'border-amber-500/20'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1">
                        <span className="text-amber-400 text-xs">📱</span>
                        <span className="text-amber-300 text-[10px]">Celo</span>
                      </div>
                      <div className={`text-[9px] px-1 py-0.5 rounded ${
                        networkStatus.celo === 'live' ? 'bg-amber-500/30 text-amber-300' :
                        networkStatus.celo === 'fetched' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-gray-700/50 text-gray-400'
                      }`}>
                        {getNetworkStatusText('celo', networkStatus.celo)}
                      </div>
                    </div>
                    <div className="text-amber-400 font-bold text-lg truncate" title={celoBalance}>
                      {formatLargeNumber(celoBalance)}
                    </div>
                    <div className="text-amber-300 text-[10px]">$HC Token</div>
                    {parseFloat(celoBalance) >= 1000 && (
                      <div className="text-amber-500/70 text-[8px] mt-0.5 truncate" title={celoBalance}>
                        ({celoBalance})
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Total Messages */}
              <div className="bg-gray-700/40 rounded-lg p-3 text-center">
                <div className="text-green-400 font-bold text-base">
                  {userProfile?.totalMessages || '0'}
                </div>
                <div className="text-gray-400 text-[10px]">Total Messages</div>
              </div>

              {/* Celo-specific stats */}
              {isCelo && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-700/40 rounded-lg p-2 text-center">
                      <div className="text-purple-400 font-bold text-sm">
                        {seasonStats?.seasonMessages || '0'}
                      </div>
                      <div className="text-gray-400 text-[9px]">{season.displayName}</div>
                    </div>
                    <div className="bg-gray-700/40 rounded-lg p-2 text-center">
                      <div className="text-amber-400 font-bold text-sm">
                        {seasonStats?.seasonRank || '-'}
                      </div>
                      <div className="text-gray-400 text-[9px]">Rank</div>
                    </div>
                  </div>

                  <div className="bg-gray-700/40 rounded-lg p-2 text-center">
                    <div className="text-blue-400 font-bold text-sm">
                      {userProfile?.createdAt ? 
                        new Date(userProfile.createdAt.toDate()).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        }) : 
                        'Unknown'
                      }
                    </div>
                    <div className="text-gray-400 text-[9px]">Joined</div>
                  </div>

                  {seasonStats?.badges && seasonStats.badges.length > 0 && (
                    <div className="bg-gray-700/30 rounded-xl p-3">
                      <h3 className="text-white font-semibold text-xs mb-2 text-center">Season Badges</h3>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {seasonStats.badges.slice(0, 3).map((badge, index) => {
                          const badgeInfo = Object.values(season.rewards).find(r => r.badge === badge);
                          return (
                            <div
                              key={index}
                              className={`bg-gradient-to-r ${getBadgeColor(badgeInfo?.type)} text-white rounded-lg px-2 py-1 text-[10px] font-medium`}
                            >
                              {badge.length > 10 ? badge.substring(0, 8) + '...' : badge}
                            </div>
                          );
                        })}
                        {seasonStats.badges.length > 3 && (
                          <div className="text-gray-400 text-[10px] px-2 py-1">
                            +{seasonStats.badges.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Buttons */}
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-gray-700/40 border border-gray-600/40 rounded-lg text-gray-400 hover:text-white transition-all text-sm"
                >
                  Close
                </button>
                <button 
                  onClick={() => setShowSendModal(true)}
                  disabled={!currentUser || user.walletAddress === currentUser.walletAddress}
                  className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed"
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