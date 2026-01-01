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
  onOpenSubscription,
  isMobile = false
}) => {
  const [userProfile, setUserProfile] = useState(null);
  const [celoBalance, setCeloBalance] = useState('0');
  const [baseBalance, setBaseBalance] = useState('0');
  const [lineaBalance, setLineaBalance] = useState('0');
  const [polygonBalance, setPolygonBalance] = useState('0');
  const [soneiumBalance, setSoneiumBalance] = useState('0');
  const [arbitrumBalance, setArbitrumBalance] = useState('0');
  const [loading, setLoading] = useState(true);
  const [showSendModal, setShowSendModal] = useState(false);
  const [seasonStats, setSeasonStats] = useState(null);
  const [networkStatus, setNetworkStatus] = useState({
    celo: 'loading',
    base: 'loading',
    linea: 'loading',
    polygon: 'loading',
    soneium: 'loading',
    arbitrum: 'loading'
  });
  const [dailyUsage, setDailyUsage] = useState({
    used: 0,
    limit: 10,
    percentage: 0,
    tier: 'FREE'
  });
  
  const [hasStakeBadge, setHasStakeBadge] = useState(false);
  const [stakeBadgeInfo, setStakeBadgeInfo] = useState(null);

  const network = useNetwork();
  const { currentNetwork, isCelo, isBase, isLinea, isPolygon, isSoneium, isArbitrum, tokenSymbol } = network;
  const season = getCurrentSeason();
  
  const isCurrentUserProfile = currentUser?.walletAddress?.toLowerCase() === user?.walletAddress?.toLowerCase();

  const { data: externalBasicStatsData, refetch: refetchExternalStats } = useReadContract({
    address: CONTRACT_ADDRESSES.base,
    abi: CONTRACT_ABIS.base,
    functionName: 'getUserBasicStats',
    args: [user?.walletAddress],
    query: {
      enabled: !!user?.walletAddress && currentNetwork === 'base' && !isCurrentUserProfile,
    }
  });

  const { data: externalSubscriptionData, refetch: refetchExternalSubscription } = useReadContract({
    address: CONTRACT_ADDRESSES.base,
    abi: CONTRACT_ABIS.base,
    functionName: 'getUserSubscriptionInfo',
    args: [user?.walletAddress],
    query: {
      enabled: !!user?.walletAddress && currentNetwork === 'base' && !isCurrentUserProfile,
    }
  });

  const { data: soneiumUserStatsData } = useReadContract({
    address: CONTRACT_ADDRESSES.soneium,
    abi: CONTRACT_ABIS.soneium,
    functionName: 'getUserStats',
    args: [user?.walletAddress],
    query: {
      enabled: !!user?.walletAddress && isSoneium,
    }
  });

  const { data: soneiumRemainingData } = useReadContract({
    address: CONTRACT_ADDRESSES.soneium,
    abi: CONTRACT_ABIS.soneium,
    functionName: 'remainingRewards',
    args: [user?.walletAddress],
    query: {
      enabled: !!user?.walletAddress && isSoneium,
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

  const checkStakeBadge = (walletAddress) => {
    if (!walletAddress) return null;
    
    const claimedBadges = JSON.parse(localStorage.getItem('hub_stake_badges') || '{}');
    const userBadges = claimedBadges[walletAddress.toLowerCase()];
    
    if (!userBadges || !userBadges.tiers) return null;
    
    let highestTier = null;
    const tiersOrder = { 'gold': 3, 'silver': 2, 'bronze': 1 };
    
    Object.keys(userBadges.tiers).forEach(tier => {
      if (userBadges.tiers[tier]) {
        if (!highestTier || (tiersOrder[tier] > tiersOrder[highestTier])) {
          highestTier = tier;
        }
      }
    });
    
    return {
      ...userBadges,
      highestTier: highestTier
    };
  };

  const renderBadgeOnly = () => {
    if (!hasStakeBadge || !stakeBadgeInfo?.highestTier) return null;
    
    const tier = stakeBadgeInfo.highestTier;
    const tierConfigs = {
      'bronze': { medal: '🥉', color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/20' },
      'silver': { medal: '🥈', color: 'text-gray-300', bgColor: 'bg-gray-500/10', borderColor: 'border-gray-500/20' },
      'gold': { medal: '🥇', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/20' }
    };
    
    const config = tierConfigs[tier];
    if (!config) return null;
    
    return (
      <div className={`mt-2 p-3 ${config.bgColor} border ${config.borderColor} rounded-lg flex items-center justify-center gap-2`}>
        <span className={`text-2xl ${config.color}`}>{config.medal}</span>
      </div>
    );
  };

  useEffect(() => {
    const loadProfileData = async () => {
      if (!user || !user.walletAddress) return;
      
      setLoading(true);
      setNetworkStatus({ celo: 'loading', base: 'loading', linea: 'loading', polygon: 'loading', soneium: 'loading', arbitrum: 'loading' });
      
      try {
        const userDoc = await getDoc(doc(db, 'users', user.walletAddress.toLowerCase()));
        const firestoreProfile = userDoc.exists() ? userDoc.data() : null;
        setUserProfile(firestoreProfile);
        
        const badgeInfo = checkStakeBadge(user.walletAddress);
        if (badgeInfo && badgeInfo.highestTier) {
          setHasStakeBadge(true);
          setStakeBadgeInfo(badgeInfo);
        }
        
        if (isCurrentUserProfile && currentNetwork === 'base' && currentUser?.subscriptionInfo) {
          const usage = calculateDailyUsage(currentUser.subscriptionInfo, null, false);
          setDailyUsage(usage);
        }
        
        if (!isCurrentUserProfile && currentNetwork === 'base') {
          refetchExternalStats();
          refetchExternalSubscription();
        }
        
        if (getOtherUserBalance) {
          if (currentUser && user.walletAddress === currentUser.walletAddress) {
            if (currentNetwork === 'celo') {
              setCeloBalance(currentUser.balance || '0');
              setNetworkStatus(prev => ({ ...prev, celo: 'live' }));
            } else if (currentNetwork === 'base') {
              setBaseBalance(currentUser.balance || '0');
              setNetworkStatus(prev => ({ ...prev, base: 'live' }));
            } else if (currentNetwork === 'linea') {
              setLineaBalance(currentUser.balance || '0');
              setNetworkStatus(prev => ({ ...prev, linea: 'live' }));
            } else if (currentNetwork === 'polygon') {
              setPolygonBalance(currentUser.balance || '0');
              setNetworkStatus(prev => ({ ...prev, polygon: 'live' }));
            } else if (currentNetwork === 'soneium') {
              setSoneiumBalance(currentUser.balance || '0');
              setNetworkStatus(prev => ({ ...prev, soneium: 'live' }));
            } else if (currentNetwork === 'arbitrum') {
              setArbitrumBalance(currentUser.balance || '0');
              setNetworkStatus(prev => ({ ...prev, arbitrum: 'live' }));
            }
            
            try {
              const balances = await getOtherUserBalance(user.walletAddress);
              if (currentNetwork === 'celo') {
                setBaseBalance(balances.base || '0');
                setLineaBalance(balances.linea || '0');
                setPolygonBalance(balances.polygon || '0');
                setSoneiumBalance(balances.soneium || '0');
                setArbitrumBalance(balances.arbitrum || '0');
                setNetworkStatus(prev => ({ 
                  ...prev, 
                  base: 'fetched',
                  linea: 'fetched',
                  polygon: 'fetched',
                  soneium: 'fetched',
                  arbitrum: 'fetched'
                }));
              } else if (currentNetwork === 'base') {
                setCeloBalance(balances.celo || '0');
                setLineaBalance(balances.linea || '0');
                setPolygonBalance(balances.polygon || '0');
                setSoneiumBalance(balances.soneium || '0');
                setArbitrumBalance(balances.arbitrum || '0');
                setNetworkStatus(prev => ({ 
                  ...prev, 
                  celo: 'fetched',
                  linea: 'fetched',
                  polygon: 'fetched',
                  soneium: 'fetched',
                  arbitrum: 'fetched'
                }));
              } else if (currentNetwork === 'linea') {
                setBaseBalance(balances.base || '0');
                setCeloBalance(balances.celo || '0');
                setPolygonBalance(balances.polygon || '0');
                setSoneiumBalance(balances.soneium || '0');
                setArbitrumBalance(balances.arbitrum || '0');
                setNetworkStatus(prev => ({ 
                  ...prev, 
                  base: 'fetched',
                  celo: 'fetched',
                  polygon: 'fetched',
                  soneium: 'fetched',
                  arbitrum: 'fetched'
                }));
              } else if (currentNetwork === 'polygon') {
                setBaseBalance(balances.base || '0');
                setCeloBalance(balances.celo || '0');
                setLineaBalance(balances.linea || '0');
                setSoneiumBalance(balances.soneium || '0');
                setArbitrumBalance(balances.arbitrum || '0');
                setNetworkStatus(prev => ({ 
                  ...prev, 
                  base: 'fetched',
                  celo: 'fetched',
                  linea: 'fetched',
                  soneium: 'fetched',
                  arbitrum: 'fetched'
                }));
              } else if (currentNetwork === 'soneium') {
                setBaseBalance(balances.base || '0');
                setCeloBalance(balances.celo || '0');
                setLineaBalance(balances.linea || '0');
                setPolygonBalance(balances.polygon || '0');
                setArbitrumBalance(balances.arbitrum || '0');
                setNetworkStatus(prev => ({ 
                  ...prev, 
                  base: 'fetched',
                  celo: 'fetched',
                  linea: 'fetched',
                  polygon: 'fetched',
                  arbitrum: 'fetched'
                }));
              } else if (currentNetwork === 'arbitrum') {
                setBaseBalance(balances.base || '0');
                setCeloBalance(balances.celo || '0');
                setLineaBalance(balances.linea || '0');
                setPolygonBalance(balances.polygon || '0');
                setSoneiumBalance(balances.soneium || '0');
                setNetworkStatus(prev => ({ 
                  ...prev, 
                  base: 'fetched',
                  celo: 'fetched',
                  linea: 'fetched',
                  polygon: 'fetched',
                  soneium: 'fetched'
                }));
              }
            } catch (error) {
              if (currentNetwork === 'celo') {
                setBaseBalance('0');
                setLineaBalance('0');
                setPolygonBalance('0');
                setSoneiumBalance('0');
                setArbitrumBalance('0');
              } else if (currentNetwork === 'base') {
                setCeloBalance('0');
                setLineaBalance('0');
                setPolygonBalance('0');
                setSoneiumBalance('0');
                setArbitrumBalance('0');
              } else if (currentNetwork === 'linea') {
                setBaseBalance('0');
                setCeloBalance('0');
                setPolygonBalance('0');
                setSoneiumBalance('0');
                setArbitrumBalance('0');
              } else if (currentNetwork === 'polygon') {
                setBaseBalance('0');
                setCeloBalance('0');
                setLineaBalance('0');
                setSoneiumBalance('0');
                setArbitrumBalance('0');
              } else if (currentNetwork === 'soneium') {
                setBaseBalance('0');
                setCeloBalance('0');
                setLineaBalance('0');
                setPolygonBalance('0');
                setArbitrumBalance('0');
              } else if (currentNetwork === 'arbitrum') {
                setBaseBalance('0');
                setCeloBalance('0');
                setLineaBalance('0');
                setPolygonBalance('0');
                setSoneiumBalance('0');
              }
            }
          } else {
            try {
              const balances = await getOtherUserBalance(user.walletAddress);
              setCeloBalance(balances.celo || '0');
              setBaseBalance(balances.base || '0');
              setLineaBalance(balances.linea || '0');
              setPolygonBalance(balances.polygon || '0');
              setSoneiumBalance(balances.soneium || '0');
              setArbitrumBalance(balances.arbitrum || '0');
              setNetworkStatus({
                celo: balances.celo !== '0' ? 'fetched' : 'zero',
                base: balances.base !== '0' ? 'fetched' : 'zero',
                linea: balances.linea !== '0' ? 'fetched' : 'zero',
                polygon: balances.polygon !== '0' ? 'fetched' : 'zero',
                soneium: balances.soneium !== '0' ? 'fetched' : 'zero',
                arbitrum: balances.arbitrum !== '0' ? 'fetched' : 'zero'
              });
            } catch (error) {
              setCeloBalance('0');
              setBaseBalance('0');
              setLineaBalance('0');
              setPolygonBalance('0');
              setSoneiumBalance('0');
              setArbitrumBalance('0');
              setNetworkStatus({ celo: 'error', base: 'error', linea: 'error', polygon: 'error', soneium: 'error', arbitrum: 'error' });
            }
          }
        }
        
        if (firestoreProfile && currentNetwork === 'celo') {
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
  }, [user, getOtherUserBalance, currentNetwork, currentUser, isCurrentUserProfile]);

  useEffect(() => {
    if (!isCurrentUserProfile && currentNetwork === 'base' && (externalBasicStatsData || externalSubscriptionData)) {
      const usage = calculateDailyUsage(null, null, true);
      setDailyUsage(usage);
    }
  }, [externalBasicStatsData, externalSubscriptionData, isCurrentUserProfile, currentNetwork]);

  const getBadgeColor = (badgeType) => {
    switch(badgeType) {
      case 'legendary': return 'from-yellow-400 to-orange-500';
      case 'epic': return 'from-purple-500 to-pink-500';
      case 'rare': return 'from-cyan-500 to-blue-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getNetworkStatusText = (network, status) => {
    if (network === 'celo' && currentNetwork === 'celo') return 'Live';
    if (network === 'base' && currentNetwork === 'base') return 'Live';
    if (network === 'linea' && currentNetwork === 'linea') return 'Live';
    if (network === 'polygon' && currentNetwork === 'polygon') return 'Live';
    if (network === 'soneium' && currentNetwork === 'soneium') return 'Live';
    if (network === 'arbitrum' && currentNetwork === 'arbitrum') return 'Live';
    
    switch(status) {
      case 'live': return 'Live';
      case 'fetched': return 'Network';
      case 'zero': return 'Empty';
      case 'error': return 'Error';
      default: return '...';
    }
  };

  const renderSubscriptionInfo = () => {
    if (currentNetwork !== 'base') return null;

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
      <div className={`mt-4 p-3 bg-gray-700/30 rounded-lg border border-gray-600/30 ${
        isMobile ? 'p-2.5' : ''
      }`}>
        <div className="text-center mb-2">
          <div className={`text-cyan-400 font-bold ${
            isMobile ? 'text-[10px] mb-0.5' : 'text-xs mb-0.5'
          }`}>BASE SUBSCRIPTION</div>
          <div className={`text-gray-400 ${
            isMobile ? 'text-[8px]' : 'text-[9px]'
          }`}>
            {isCurrentUserProfile 
              ? 'Manage your daily message limit' 
              : 'User subscription status'}
          </div>
        </div>
        
        <div className="mb-3 p-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
          <div className="flex justify-between items-center mb-1">
            <span className={`text-gray-300 font-medium ${
              isMobile ? 'text-[10px]' : 'text-xs'
            }`}>Daily Usage</span>
            <span className={`text-cyan-400 font-bold ${
              isMobile ? 'text-[10px]' : 'text-xs'
            }`}>
              {dailyUsage.used} / {dailyUsage.limit}
              {isCurrentUserProfile && ' (You)'}
            </span>
          </div>
          
          <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden mb-1">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${
                dailyUsage.percentage >= 90 ? 'bg-red-500' :
                dailyUsage.percentage >= 75 ? 'bg-yellow-500' :
                'bg-green-500'
              }`}
              style={{ width: `${Math.min(dailyUsage.percentage, 100)}%` }}
            />
          </div>
          
          <div className="flex justify-between">
            <span className={`font-medium ${
              dailyUsage.percentage >= 90 ? 'text-red-400' :
              dailyUsage.percentage >= 75 ? 'text-yellow-400' :
              'text-green-400'
            } ${isMobile ? 'text-[9px]' : 'text-[10px]'}`}>
              {dailyUsage.percentage >= 90 ? 'Almost full!' :
               dailyUsage.percentage >= 75 ? 'Getting busy' :
               'Good to go'}
            </span>
            <span className={`text-gray-400 ${isMobile ? 'text-[9px]' : 'text-[10px]'}`}>
              {dailyUsage.limit === '∞' ? 'Unlimited' : `${dailyUsage.percentage.toFixed(0)}%`}
            </span>
          </div>
        </div>
        
        <div className={`mb-2 p-2 rounded-lg border ${tierInfo.color.replace('text', 'border')}/30 ${tierInfo.color.replace('text', 'bg')}/10`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className={`${isMobile ? 'text-xs' : 'text-sm'}`}>{tierInfo.icon}</span>
              <span className={`font-bold ${tierInfo.color} ${
                isMobile ? 'text-xs' : 'text-xs'
              }`}>{tierInfo.name}</span>
            </div>
            <span className={`${
              tierInfo.name === 'WHITELIST' ? 'text-purple-400' :
              tierInfo.name === 'PREMIUM' ? 'text-yellow-400' :
              tierInfo.name === 'BASIC' ? 'text-cyan-400' :
              'text-gray-400'
            } ${isMobile ? 'text-[9px]' : 'text-[10px]'}`}>
              {tierInfo.name === 'WHITELIST' ? '👑 Special' :
               tierInfo.name === 'PREMIUM' ? '✨ Premium' :
               tierInfo.name === 'BASIC' ? '⭐ Basic' : '🎫 Free'}
            </span>
          </div>
          
          <div className={`text-gray-300 mt-0.5 ${
            isMobile ? 'text-[9px]' : 'text-[10px]'
          }`}>
            {tierInfo.name === 'WHITELIST' ? 'Whitelisted user' : 
             tierInfo.name === 'PREMIUM' ? 'Unlimited messages' :
             tierInfo.name === 'BASIC' ? '50 messages/day' : '10 messages/day (free)'}
          </div>
        </div>
        
        <div className={`grid grid-cols-2 gap-2 mb-2 ${
          isMobile ? 'gap-1.5' : 'gap-2'
        }`}>
          <div className="bg-gray-800/50 rounded p-1.5 text-center">
            <div className={`text-cyan-400 font-bold ${
              isMobile ? 'text-xs' : 'text-xs'
            }`}>
              {dailyUsage.limit === '∞' ? '∞' : dailyUsage.limit}
            </div>
            <div className={`text-gray-400 ${
              isMobile ? 'text-[8px]' : 'text-[8px]'
            }`}>Messages/day</div>
          </div>
          
          <div className="bg-gray-800/50 rounded p-1.5 text-center">
            <div className={`text-green-400 font-bold ${
              isMobile ? 'text-xs' : 'text-xs'
            }`}>1 HUB</div>
            <div className={`text-gray-400 ${
              isMobile ? 'text-[8px]' : 'text-[8px]'
            }`}>Reward/message</div>
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
            className={`w-full mt-2 py-2 ${
              dailyUsage.percentage >= 90 ? 'bg-gradient-to-r from-red-500 to-orange-500' :
              'bg-gradient-to-r from-cyan-500 to-blue-500'
            } text-white font-semibold rounded-lg hover:opacity-90 transition-all ${
              isMobile ? 'text-xs' : 'text-sm'
            }`}
          >
            <span className={`${isMobile ? 'text-base' : 'text-lg'} mr-1`}>🎫</span>
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
      <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 ${
        isMobile ? 'p-2' : 'p-4'
      }`}>
        <div className={`bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 w-full ${
          isMobile 
            ? 'rounded-xl p-3 max-w-sm' 
            : 'rounded-3xl p-5 max-w-sm'
        }`}>
          <div className="text-center mb-3">
            <h2 className={`font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2 ${
              isMobile ? 'text-lg' : 'text-xl'
            }`}>
              User Profile
            </h2>
            
            <div className={`flex items-center justify-center gap-3 mb-3 ${
              isMobile ? 'mb-3' : 'mb-4'
            }`}>
              <div className={`rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center ${
                isMobile 
                  ? 'w-12 h-12 text-lg'
                  : 'w-16 h-16 text-2xl'
              }`}>
                {user.avatar}
              </div>
              <div className="text-left">
                <div className={`text-white font-semibold ${
                  isMobile ? 'text-base' : 'text-lg'
                }`}>{user.nickname}</div>
                <div className={`text-gray-400 mt-0.5 ${
                  isMobile ? 'text-[10px]' : 'text-xs'
                }`}>
                  {user.walletAddress?.slice(0, 6)}...{user.walletAddress?.slice(-4)}
                </div>
                {isCurrentUserProfile && (
                  <div className={`text-cyan-400 mt-0.5 ${
                    isMobile ? 'text-[9px]' : 'text-[10px]'
                  }`}>(Your Profile)</div>
                )}
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-4">
              <div className={`animate-spin rounded-full border-b-2 border-cyan-500 mx-auto ${
                isMobile ? 'h-5 w-5' : 'h-7 w-7'
              }`}></div>
              <div className={`text-gray-400 mt-1.5 ${
                isMobile ? 'text-xs' : 'text-sm'
              }`}>Loading profile...</div>
            </div>
          ) : (
            <div className={`space-y-3 ${isMobile ? 'space-y-3' : 'space-y-4'}`}>
              <div className="space-y-2">
                <div className={`text-gray-400 text-center ${
                  isMobile ? 'text-[10px]' : 'text-xs'
                }`}>Token Balance</div>
                
                <div className="grid grid-cols-2 gap-2">
                  {/* HUB Balance - Base */}
                  <div className={`bg-blue-500/10 border rounded-xl p-2 text-center ${
                    currentNetwork === 'base' ? 'border-blue-500/40' : 'border-blue-500/20'
                  }`}>
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1">
                        <img 
                          src="/Base.logo.jpg" 
                          alt="Base" 
                          className="w-4 h-4 object-cover rounded"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `<span class="text-blue-400">🌉</span>`;
                          }}
                        />
                        <span className={`text-blue-300 ${
                          isMobile ? 'text-[9px]' : 'text-[10px]'
                        }`}>Base</span>
                      </div>
                      <div className={`px-0.5 py-0.5 rounded ${
                        networkStatus.base === 'live' ? 'bg-blue-500/30 text-blue-300' :
                        networkStatus.base === 'fetched' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-gray-700/50 text-gray-400'
                      } ${isMobile ? 'text-[8px]' : 'text-[9px]'}`}>
                        {getNetworkStatusText('base', networkStatus.base)}
                      </div>
                    </div>
                    <div className={`text-blue-400 font-bold truncate ${
                      isMobile ? 'text-sm' : 'text-base'
                    }`} title={baseBalance}>
                      {formatLargeNumber(baseBalance)}
                    </div>
                    <div className={`text-blue-300 ${
                      isMobile ? 'text-[9px]' : 'text-[10px]'
                    }`}>$HUB</div>
                  </div>
                  
                  {/* HC Balance - Celo */}
                  <div className={`bg-amber-500/10 border rounded-xl p-2 text-center ${
                    currentNetwork === 'celo' ? 'border-amber-500/40' : 'border-amber-500/20'
                  }`}>
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1">
                        <img 
                          src="/Celo.logo.jpg" 
                          alt="Celo" 
                          className="w-4 h-4 object-cover rounded"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `<span class="text-amber-400">📱</span>`;
                          }}
                        />
                        <span className={`text-amber-300 ${
                          isMobile ? 'text-[9px]' : 'text-[10px]'
                        }`}>Celo</span>
                      </div>
                      <div className={`px-0.5 py-0.5 rounded ${
                        networkStatus.celo === 'live' ? 'bg-amber-500/30 text-amber-300' :
                        networkStatus.celo === 'fetched' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-gray-700/50 text-gray-400'
                      } ${isMobile ? 'text-[8px]' : 'text-[9px]'}`}>
                        {getNetworkStatusText('celo', networkStatus.celo)}
                      </div>
                    </div>
                    <div className={`text-amber-400 font-bold truncate ${
                      isMobile ? 'text-sm' : 'text-base'
                    }`} title={celoBalance}>
                      {formatLargeNumber(celoBalance)}
                    </div>
                    <div className={`text-amber-300 ${
                      isMobile ? 'text-[9px]' : 'text-[10px]'
                    }`}>$HC</div>
                  </div>
                  
                  {/* LPX Balance - Linea */}
                  <div className={`bg-cyan-500/10 border rounded-xl p-2 text-center ${
                    currentNetwork === 'linea' ? 'border-cyan-500/40' : 'border-cyan-500/20'
                  }`}>
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1">
                        <img 
                          src="/Linea.logo.png" 
                          alt="Linea" 
                          className="w-4 h-4 object-cover rounded"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `<span class="text-cyan-400">🚀</span>`;
                          }}
                        />
                        <span className={`text-cyan-300 ${
                          isMobile ? 'text-[9px]' : 'text-[10px]'
                        }`}>Linea</span>
                      </div>
                      <div className={`px-0.5 py-0.5 rounded ${
                        networkStatus.linea === 'live' ? 'bg-cyan-500/30 text-cyan-300' :
                        networkStatus.linea === 'fetched' ? 'bg-cyan-500/20 text-cyan-400' :
                        'bg-gray-700/50 text-gray-400'
                      } ${isMobile ? 'text-[8px]' : 'text-[9px]'}`}>
                        {getNetworkStatusText('linea', networkStatus.linea)}
                      </div>
                    </div>
                    <div className={`text-cyan-400 font-bold truncate ${
                      isMobile ? 'text-sm' : 'text-base'
                    }`} title={lineaBalance}>
                      {formatLargeNumber(lineaBalance)}
                    </div>
                    <div className={`text-cyan-300 ${
                      isMobile ? 'text-[9px]' : 'text-[10px]'
                    }`}>$LPX</div>
                  </div>
                  
                  {/* MSG Balance - Polygon */}
                  <div className={`bg-purple-500/10 border rounded-xl p-2 text-center ${
                    currentNetwork === 'polygon' ? 'border-purple-500/40' : 'border-purple-500/20'
                  }`}>
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1">
                        <img 
                          src="/Polygon.logo.jpg" 
                          alt="Polygon" 
                          className="w-4 h-4 object-cover rounded"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `<span class="text-purple-400">🔶</span>`;
                          }}
                        />
                        <span className={`text-purple-300 ${
                          isMobile ? 'text-[9px]' : 'text-[10px]'
                        }`}>Polygon</span>
                      </div>
                      <div className={`px-0.5 py-0.5 rounded ${
                        networkStatus.polygon === 'live' ? 'bg-purple-500/30 text-purple-300' :
                        networkStatus.polygon === 'fetched' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-gray-700/50 text-gray-400'
                      } ${isMobile ? 'text-[8px]' : 'text-[9px]'}`}>
                        {getNetworkStatusText('polygon', networkStatus.polygon)}
                      </div>
                    </div>
                    <div className={`text-purple-400 font-bold truncate ${
                      isMobile ? 'text-sm' : 'text-base'
                    }`} title={polygonBalance}>
                      {formatLargeNumber(polygonBalance)}
                    </div>
                    <div className={`text-purple-300 ${
                      isMobile ? 'text-[9px]' : 'text-[10px]'
                    }`}>$MSG</div>
                  </div>
                  
                  {/* LUM Balance - Soneium */}
                  <div className={`bg-pink-500/10 border rounded-xl p-2 text-center ${
                    currentNetwork === 'soneium' ? 'border-pink-500/40' : 'border-pink-500/20'
                  }`}>
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1">
                        <img 
                          src="/Soneium.logo.jpg" 
                          alt="Soneium" 
                          className="w-4 h-4 object-cover rounded"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `<span class="text-pink-400">🌟</span>`;
                          }}
                        />
                        <span className={`text-pink-300 ${
                          isMobile ? 'text-[9px]' : 'text-[10px]'
                        }`}>Soneium</span>
                      </div>
                      <div className={`px-0.5 py-0.5 rounded ${
                        networkStatus.soneium === 'live' ? 'bg-pink-500/30 text-pink-300' :
                        networkStatus.soneium === 'fetched' ? 'bg-pink-500/20 text-pink-400' :
                        'bg-gray-700/50 text-gray-400'
                      } ${isMobile ? 'text-[8px]' : 'text-[9px]'}`}>
                        {getNetworkStatusText('soneium', networkStatus.soneium)}
                      </div>
                    </div>
                    <div className={`text-pink-400 font-bold truncate ${
                      isMobile ? 'text-sm' : 'text-base'
                    }`} title={soneiumBalance}>
                      {formatLargeNumber(soneiumBalance)}
                    </div>
                    <div className={`text-pink-300 ${
                      isMobile ? 'text-[9px]' : 'text-[10px]'
                    }`}>$LUM</div>
                  </div>
                  
                  {/* PORTAL Balance - Arbitrum */}
                  <div className={`bg-blue-600/10 border rounded-xl p-2 text-center ${
                    currentNetwork === 'arbitrum' ? 'border-blue-600/40' : 'border-blue-600/20'
                  }`}>
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1">
                        <img 
                          src="/Arbitrum.logo.jpg" 
                          alt="Arbitrum" 
                          className="w-4 h-4 object-cover rounded"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `<span class="text-blue-500">⚡</span>`;
                          }}
                        />
                        <span className={`text-blue-400 ${
                          isMobile ? 'text-[9px]' : 'text-[10px]'
                        }`}>Arbitrum</span>
                      </div>
                      <div className={`px-0.5 py-0.5 rounded ${
                        networkStatus.arbitrum === 'live' ? 'bg-blue-600/30 text-blue-400' :
                        networkStatus.arbitrum === 'fetched' ? 'bg-blue-600/20 text-blue-500' :
                        'bg-gray-700/50 text-gray-400'
                      } ${isMobile ? 'text-[8px]' : 'text-[9px]'}`}>
                        {getNetworkStatusText('arbitrum', networkStatus.arbitrum)}
                      </div>
                    </div>
                    <div className={`text-blue-500 font-bold truncate ${
                      isMobile ? 'text-sm' : 'text-base'
                    }`} title={arbitrumBalance}>
                      {formatLargeNumber(arbitrumBalance)}
                    </div>
                    <div className={`text-blue-400 ${
                      isMobile ? 'text-[9px]' : 'text-[10px]'
                    }`}>$ARBX</div>
                  </div>
                </div>
              </div>
              
              <div className={`bg-gray-700/40 rounded-lg p-2 text-center ${
                isMobile ? 'p-2' : 'p-3'
              }`}>
                <div className={`text-green-400 font-bold ${
                  isMobile ? 'text-sm' : 'text-base'
                }`}>
                  {userProfile?.totalMessages || '0'}
                </div>
                <div className={`text-gray-400 ${
                  isMobile ? 'text-[9px]' : 'text-[10px]'
                }`}>Total Messages</div>
              </div>

              {renderBadgeOnly()}

              {currentNetwork === 'celo' && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-700/40 rounded-lg p-1.5 text-center">
                      <div className={`text-purple-400 font-bold ${
                        isMobile ? 'text-xs' : 'text-sm'
                      }`}>
                        {seasonStats?.seasonMessages || '0'}
                      </div>
                      <div className={`text-gray-400 ${
                        isMobile ? 'text-[8px]' : 'text-[9px]'
                      }`}>{season.displayName}</div>
                    </div>
                    <div className="bg-gray-700/40 rounded-lg p-1.5 text-center">
                      <div className={`text-amber-400 font-bold ${
                        isMobile ? 'text-xs' : 'text-sm'
                      }`}>
                        {seasonStats?.seasonRank || '-'}
                      </div>
                      <div className={`text-gray-400 ${
                        isMobile ? 'text-[8px]' : 'text-[9px]'
                      }`}>Rank</div>
                    </div>
                  </div>

                  <div className="bg-gray-700/40 rounded-lg p-1.5 text-center">
                    <div className={`text-blue-400 font-bold ${
                      isMobile ? 'text-xs' : 'text-sm'
                    }`}>
                      {userProfile?.createdAt ? 
                        new Date(userProfile.createdAt.toDate()).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        }) : 
                        'Unknown'
                      }
                    </div>
                    <div className={`text-gray-400 ${
                      isMobile ? 'text-[8px]' : 'text-[9px]'
                    }`}>Joined</div>
                  </div>

                  {seasonStats?.badges && seasonStats.badges.length > 0 && (
                    <div className="bg-gray-700/30 rounded-lg p-2">
                      <h3 className={`text-white font-semibold mb-1.5 text-center ${
                        isMobile ? 'text-[10px]' : 'text-xs'
                      }`}>Season Badges</h3>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {seasonStats.badges.slice(0, 3).map((badge, index) => {
                          const badgeInfo = Object.values(season.rewards).find(r => r.badge === badge);
                          return (
                            <div
                              key={index}
                              className={`bg-gradient-to-r ${getBadgeColor(badgeInfo?.type)} text-white rounded px-1.5 py-0.5 font-medium ${
                                isMobile ? 'text-[9px]' : 'text-[10px]'
                              }`}
                            >
                              {badge.length > 10 ? badge.substring(0, 8) + '...' : badge}
                            </div>
                          );
                        })}
                        {seasonStats.badges.length > 3 && (
                          <div className={`text-gray-400 px-1.5 py-0.5 ${
                            isMobile ? 'text-[9px]' : 'text-[10px]'
                          }`}>
                            +{seasonStats.badges.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {currentNetwork === 'base' && renderSubscriptionInfo()}

              <div className={`flex gap-2 pt-1 ${
                isMobile ? 'pt-1' : 'pt-2'
              }`}>
                <button 
                  onClick={onClose}
                  className={`flex-1 bg-gray-700/40 border border-gray-600/40 rounded-lg text-gray-400 hover:text-white transition-all ${
                    isMobile ? 'py-2 text-xs' : 'py-2.5 text-sm'
                  }`}
                >
                  Close
                </button>
                <button 
                  onClick={() => setShowSendModal(true)}
                  disabled={!currentUser || user.walletAddress === currentUser.walletAddress}
                  className={`flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                    isMobile ? 'py-2 text-xs' : 'py-2.5 text-sm'
                  }`}
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
          isMobile={isMobile}
        />
      )}
    </>
  );
};

export default UserProfileModal;