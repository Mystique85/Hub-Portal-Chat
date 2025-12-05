import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { getCurrentSeason, getSeasonBadge } from '../../utils/seasons';
import SendHCModal from './SendHCModal';
import { useNetwork } from '../../hooks/useNetwork';
import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../../utils/constants';

const UserProfileModal = ({ 
  user, 
  onClose, 
  getOtherUserBalance, 
  currentUser,
  onOpenSubscription
}) => {
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
  const [dailyUsage, setDailyUsage] = useState({
    used: 0,
    limit: 10,
    percentage: 0,
    tier: 'FREE'
  });

  const { isCelo, isBase, tokenSymbol } = useNetwork();
  const season = getCurrentSeason();
  
  const isCurrentUserProfile = currentUser?.walletAddress?.toLowerCase() === user?.walletAddress?.toLowerCase();

  const { data: externalBasicStatsData, refetch: refetchExternalStats } = useReadContract({
    address: CONTRACT_ADDRESSES.base,
    abi: CONTRACT_ABIS.base,
    functionName: 'getUserBasicStats',
    args: [user?.walletAddress],
    query: {
      enabled: !!user?.walletAddress && isBase && !isCurrentUserProfile,
    }
  });

  const { data: externalSubscriptionData, refetch: refetchExternalSubscription } = useReadContract({
    address: CONTRACT_ADDRESSES.base,
    abi: CONTRACT_ABIS.base,
    functionName: 'getUserSubscriptionInfo',
    args: [user?.walletAddress],
    query: {
      enabled: !!user?.walletAddress && isBase && !isCurrentUserProfile,
    }
  });

  const calculateDailyUsage = (subscriptionInfo, userStats, isExternalUser = false) => {
    let tier = 0;
    let whitelisted = false;
    let isActive = false;
    let messagesToday = 0;
    
    if (!isExternalUser && subscriptionInfo) {
      tier = subscriptionInfo.tier || 0;
      whitelisted = subscriptionInfo.whitelisted || false;
      isActive = subscriptionInfo.isActive || false;
      messagesToday = subscriptionInfo.messagesToday || 0;
    }
    
    if (isExternalUser) {
      if (externalSubscriptionData && Array.isArray(externalSubscriptionData)) {
        const [remainingMessages, tierFromContract, whitelistedFromContract, subscriptionExpiry] = externalSubscriptionData;
        tier = Number(tierFromContract);
        whitelisted = whitelistedFromContract;
        isActive = whitelistedFromContract || (Number(subscriptionExpiry) > Math.floor(Date.now() / 1000));
      }
      
      if (externalBasicStatsData && Array.isArray(externalBasicStatsData) && externalBasicStatsData.length >= 6) {
        messagesToday = Number(externalBasicStatsData[4]);
      }
    }
    
    let limit = 10;
    let currentTier = 'FREE';
    
    if (whitelisted) {
      limit = Infinity;
      currentTier = 'WHITELIST';
    } else if (isActive) {
      switch(tier) {
        case 1:
          limit = 50;
          currentTier = 'BASIC';
          break;
        case 2:
          limit = Infinity;
          currentTier = 'PREMIUM';
          break;
        default:
          limit = 10;
          currentTier = 'FREE';
      }
    }

    const used = messagesToday;
    const percentage = limit === Infinity ? 0 : Math.min(100, (used / limit) * 100);

    return {
      used,
      limit: limit === Infinity ? '∞' : limit,
      percentage,
      tier: currentTier
    };
  };

  const formatLargeNumber = (num) => {
    if (!num || num === '0') return '0';
    
    const number = parseFloat(num);
    if (isNaN(number)) return '0';
    
    if (number >= 1000000) {
      return (number / 1000000).toFixed(2) + 'M';
    }
    if (number >= 1000) {
      return (number / 1000).toFixed(2) + 'K';
    }
    
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
        
        if (isCurrentUserProfile && isBase && currentUser?.subscriptionInfo) {
          const usage = calculateDailyUsage(currentUser.subscriptionInfo, null, false);
          setDailyUsage(usage);
        }
        
        if (!isCurrentUserProfile && isBase) {
          refetchExternalStats();
          refetchExternalSubscription();
        }
        
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
  }, [user, getOtherUserBalance, isCelo, isBase, currentUser, isCurrentUserProfile]);

  useEffect(() => {
    if (!isCurrentUserProfile && isBase && (externalBasicStatsData || externalSubscriptionData)) {
      const usage = calculateDailyUsage(null, null, true);
      setDailyUsage(usage);
    }
  }, [externalBasicStatsData, externalSubscriptionData, isCurrentUserProfile, isBase]);

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

  const renderSubscriptionInfo = () => {
    if (!isBase) return null;

    const subscriptionInfo = isCurrentUserProfile ? currentUser?.subscriptionInfo : null;
    
    const getTierDisplay = () => {
      if (!isCurrentUserProfile && externalSubscriptionData) {
        if (Array.isArray(externalSubscriptionData) && externalSubscriptionData.length >= 4) {
          const [remainingMessages, tier, whitelisted, subscriptionExpiry] = externalSubscriptionData;
          
          if (whitelisted) {
            return { name: 'WHITELIST', color: 'text-purple-400', icon: '👑' };
          }
          
          const isActive = whitelisted || (Number(subscriptionExpiry) > Math.floor(Date.now() / 1000));
          
          if (isActive) {
            switch(Number(tier)) {
              case 1: return { name: 'BASIC', color: 'text-cyan-400', icon: '⭐' };
              case 2: return { name: 'PREMIUM', color: 'text-yellow-400', icon: '✨' };
              default: return { name: 'FREE', color: 'text-gray-400', icon: '🎫' };
            }
          }
        }
        return { name: 'FREE', color: 'text-gray-400', icon: '🎫' };
      }
      
      if (!subscriptionInfo) {
        return { name: 'FREE', color: 'text-gray-400', icon: '🎫' };
      }
      
      const { tier, whitelisted, isActive } = subscriptionInfo;
      
      if (whitelisted) {
        return { name: 'WHITELIST', color: 'text-purple-400', icon: '👑' };
      }
      
      if (!isActive) {
        return { name: 'FREE', color: 'text-gray-400', icon: '🎫' };
      }
      
      switch(tier) {
        case 1: return { name: 'BASIC', color: 'text-cyan-400', icon: '⭐' };
        case 2: return { name: 'PREMIUM', color: 'text-yellow-400', icon: '✨' };
        default: return { name: 'FREE', color: 'text-gray-400', icon: '🎫' };
      }
    };

    const tierInfo = getTierDisplay();

    return (
      <div className="mt-4 p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
        <div className="text-center mb-2">
          <div className="text-cyan-400 font-bold text-xs mb-0.5">BASE SUBSCRIPTION</div>
          <div className="text-gray-400 text-[9px]">
            {isCurrentUserProfile 
              ? 'Manage your daily message limit' 
              : 'User subscription status'}
          </div>
        </div>
        
        <div className="mb-3 p-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-300 text-xs font-medium">Daily Usage</span>
            <span className="text-cyan-400 text-xs font-bold">
              {dailyUsage.used} / {dailyUsage.limit}
              {isCurrentUserProfile && ' (You)'}
            </span>
          </div>
          
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-1">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${
                dailyUsage.percentage >= 90 ? 'bg-red-500' :
                dailyUsage.percentage >= 75 ? 'bg-yellow-500' :
                'bg-green-500'
              }`}
              style={{ width: `${Math.min(dailyUsage.percentage, 100)}%` }}
            />
          </div>
          
          <div className="flex justify-between text-[10px]">
            <span className={`font-medium ${
              dailyUsage.percentage >= 90 ? 'text-red-400' :
              dailyUsage.percentage >= 75 ? 'text-yellow-400' :
              'text-green-400'
            }`}>
              {dailyUsage.percentage >= 90 ? 'Almost full!' :
               dailyUsage.percentage >= 75 ? 'Getting busy' :
               'Good to go'}
            </span>
            <span className="text-gray-400">
              {dailyUsage.limit === '∞' ? 'Unlimited' : `${dailyUsage.percentage.toFixed(0)}%`}
            </span>
          </div>
        </div>
        
        <div className={`mb-2 p-2 rounded-lg border ${tierInfo.color.replace('text', 'border')}/30 ${tierInfo.color.replace('text', 'bg')}/10`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-sm">{tierInfo.icon}</span>
              <span className={`font-bold ${tierInfo.color} text-xs`}>{tierInfo.name}</span>
            </div>
            <span className={`text-[10px] ${
              tierInfo.name === 'WHITELIST' ? 'text-purple-400' :
              tierInfo.name === 'PREMIUM' ? 'text-yellow-400' :
              tierInfo.name === 'BASIC' ? 'text-cyan-400' :
              'text-gray-400'
            }`}>
              {tierInfo.name === 'WHITELIST' ? '👑 Special' :
               tierInfo.name === 'PREMIUM' ? '✨ Premium' :
               tierInfo.name === 'BASIC' ? '⭐ Basic' : '🎫 Free'}
            </span>
          </div>
          
          <div className="text-gray-300 text-[10px] mt-1">
            {tierInfo.name === 'WHITELIST' ? 'Whitelisted user' : 
             tierInfo.name === 'PREMIUM' ? 'Unlimited messages' :
             tierInfo.name === 'BASIC' ? '50 messages/day' : '10 messages/day (free)'}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="bg-gray-800/50 rounded p-1.5 text-center">
            <div className="text-cyan-400 font-bold text-xs">
              {dailyUsage.limit === '∞' ? '∞' : dailyUsage.limit}
            </div>
            <div className="text-gray-400 text-[8px]">Messages/day</div>
          </div>
          
          <div className="bg-gray-800/50 rounded p-1.5 text-center">
            <div className="text-green-400 font-bold text-xs">1 HUB</div>
            <div className="text-gray-400 text-[8px]">Reward/message</div>
          </div>
        </div>
        
        {isCurrentUserProfile && !subscriptionInfo?.whitelisted && (
          <button
            onClick={() => {
              if (onOpenSubscription) {
                onOpenSubscription();
                onClose();
              }
            }}
            className={`w-full mt-2 py-2.5 ${
              dailyUsage.percentage >= 90 ? 'bg-gradient-to-r from-red-500 to-orange-500' :
              'bg-gradient-to-r from-cyan-500 to-blue-500'
            } text-white font-semibold rounded-lg hover:opacity-90 transition-all text-sm`}
          >
            <span className="text-lg mr-1">🎫</span>
            {subscriptionInfo?.isActive ? 'Upgrade Subscription' : 'Get Subscription'}
            {dailyUsage.percentage >= 90 && ' (Recommended)'}
          </button>
        )}
      </div>
    );
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
                {isCurrentUserProfile && (
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
              <div className="space-y-3">
                <div className="text-gray-400 text-xs text-center">Token Balance</div>
                
                <div className="grid grid-cols-2 gap-2">
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
              
              <div className="bg-gray-700/40 rounded-lg p-3 text-center">
                <div className="text-green-400 font-bold text-base">
                  {userProfile?.totalMessages || '0'}
                </div>
                <div className="text-gray-400 text-[10px]">Total Messages</div>
              </div>

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

              {isBase && renderSubscriptionInfo()}

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