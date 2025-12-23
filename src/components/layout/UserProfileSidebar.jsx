import { useState, useEffect } from 'react';
import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../../utils/constants';
import { useNetwork } from '../../hooks/useNetwork';

const UserProfileSidebar = ({ 
  currentUser,
  isMobile = false,
  onShowSubscriptionModal,
  onShowLeaderboard,
  onShowBaseLeaderboard
}) => {
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [remainingMessages, setRemainingMessages] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contractStats, setContractStats] = useState(null);
  const [dailyUsage, setDailyUsage] = useState({ 
    used: 0, 
    limit: 10, 
    percentage: 0, 
    messagesToday: 0,
    isLoading: true 
  });

  const network = useNetwork();
  const { currentNetwork, isCelo, isBase, isLinea } = network;

  console.log('Current Network:', currentNetwork);
  console.log('User wallet:', currentUser?.walletAddress);

  // Hooki tylko dla Base
  const { 
    data: subscriptionData, 
    isLoading: subscriptionLoading,
    error: subscriptionError 
  } = useReadContract({
    address: CONTRACT_ADDRESSES.base,
    abi: CONTRACT_ABIS.base,
    functionName: 'getSubscriptionInfo',
    args: [currentUser?.walletAddress],
    query: {
      enabled: !!currentUser?.walletAddress && currentNetwork === 'base',
    }
  });

  const { 
    data: remainingMessagesData, 
    isLoading: remainingLoading,
    error: remainingError 
  } = useReadContract({
    address: CONTRACT_ADDRESSES.base,
    abi: CONTRACT_ABIS.base,
    functionName: 'getRemainingDailyMessages',
    args: [currentUser?.walletAddress],
    query: {
      enabled: !!currentUser?.walletAddress && currentNetwork === 'base',
    }
  });

  const { 
    data: contractStatsData,
    isLoading: statsLoading 
  } = useReadContract({
    address: CONTRACT_ADDRESSES.base,
    abi: CONTRACT_ABIS.base,
    functionName: 'getContractStats',
    query: {
      enabled: currentNetwork === 'base',
    }
  });

  // Hook dla Celo - funkcja remainingRewards zwraca LICZBĘ wiadomości które można jeszcze wysłać dzisiaj
  const { 
    data: celoUserStats, 
    isLoading: celoLoading,
    error: celoError 
  } = useReadContract({
    address: CONTRACT_ADDRESSES.celo,
    abi: CONTRACT_ABIS.celo,
    functionName: 'remainingRewards',
    args: [currentUser?.walletAddress],
    query: {
      enabled: !!currentUser?.walletAddress && currentNetwork === 'celo',
    }
  });

  console.log('Celo stats:', {
    data: celoUserStats,
    loading: celoLoading,
    error: celoError,
    enabled: !!currentUser?.walletAddress && currentNetwork === 'celo'
  });

  // Hook dla Linea - getUserStats zwraca tablicę [totalMessages, totalEarned, lastMessageTime, isBlocked, messagesToday, lastResetDay]
  const { 
    data: lineaUserStats, 
    isLoading: lineaLoading,
    error: lineaError 
  } = useReadContract({
    address: CONTRACT_ADDRESSES.linea,
    abi: CONTRACT_ABIS.linea,
    functionName: 'getUserStats',
    args: [currentUser?.walletAddress],
    query: {
      enabled: !!currentUser?.walletAddress && currentNetwork === 'linea',
    }
  });

  console.log('Linea stats:', {
    data: lineaUserStats,
    loading: lineaLoading,
    error: lineaError,
    enabled: !!currentUser?.walletAddress && currentNetwork === 'linea'
  });

  useEffect(() => {
    console.log('Subscription Data changed:', subscriptionData);
    if (subscriptionData && currentNetwork === 'base') {
      const [tier, expiry, whitelisted, isActive] = subscriptionData;
      setSubscriptionInfo({
        tier: Number(tier),
        expiry: Number(expiry),
        whitelisted,
        isActive
      });
    }
  }, [subscriptionData, currentNetwork]);

  useEffect(() => {
    console.log('Remaining Messages Data changed:', remainingMessagesData);
    if (remainingMessagesData !== undefined && currentNetwork === 'base') {
      const remaining = Number(remainingMessagesData);
      setRemainingMessages(remaining);
      
      let limit = 10;
      let used = 0;
      let messagesToday = 0;
      
      if (subscriptionInfo) {
        const { tier, whitelisted, isActive } = subscriptionInfo;
        
        if (whitelisted) {
          limit = Infinity;
          messagesToday = 0;
        } else if (isActive) {
          switch(tier) {
            case 1:
              limit = 50;
              messagesToday = 50 - remaining;
              break;
            case 2:
              limit = Infinity;
              messagesToday = 0;
              break;
            default:
              limit = 10;
              messagesToday = 10 - remaining;
          }
        } else {
          messagesToday = 10 - remaining;
        }
      } else {
        messagesToday = 10 - remaining;
      }
      
      used = Math.max(0, messagesToday);
      const percentage = limit === Infinity ? 0 : Math.min(100, (used / limit) * 100);
      
      setDailyUsage({
        used,
        limit: limit === Infinity ? '∞' : limit,
        percentage,
        messagesToday: used,
        isLoading: false
      });
    }
  }, [remainingMessagesData, subscriptionInfo, currentNetwork]);

  useEffect(() => {
    console.log('Celo User Stats changed:', celoUserStats);
    if (celoUserStats !== undefined && currentNetwork === 'celo') {
      const remaining = Number(celoUserStats);
      console.log('Celo - Remaining messages:', remaining);
      
      // Dla Celo: remaining to liczba wiadomości które MOŻNA jeszcze wysłać dzisiaj (0-10)
      const used = Math.max(0, 10 - remaining); // Użyte = 10 - pozostałe
      const percentage = Math.min(100, (used / 10) * 100);
      
      console.log('Celo - Daily Usage:', {
        used,
        limit: 10,
        percentage,
        remaining
      });
      
      setDailyUsage({
        used,
        limit: 10,
        percentage,
        messagesToday: used,
        isLoading: false
      });
      
      // Resetuj dane z innych sieci
      setSubscriptionInfo(null);
      setRemainingMessages(null);
      setContractStats(null);
    }
  }, [celoUserStats, currentNetwork]);

  useEffect(() => {
    console.log('Linea User Stats changed:', lineaUserStats);
    if (lineaUserStats && currentNetwork === 'linea') {
      // Linea: getUserStats zwraca [totalMessages, totalEarned, lastMessageTime, isBlocked, messagesToday, lastResetDay]
      const messagesToday = lineaUserStats[4] ? Number(lineaUserStats[4]) : 0;
      console.log('Linea - Messages today:', messagesToday);
      
      const used = messagesToday;
      const limit = 100; // Linea ma 100 wiadomości dziennie
      const percentage = Math.min(100, (used / limit) * 100);
      
      console.log('Linea - Daily Usage:', {
        used,
        limit,
        percentage,
        messagesToday: used
      });
      
      setDailyUsage({
        used,
        limit,
        percentage,
        messagesToday: used,
        isLoading: false
      });
      
      // Resetuj dane z innych sieci
      setSubscriptionInfo(null);
      setRemainingMessages(null);
      setContractStats(null);
    }
  }, [lineaUserStats, currentNetwork]);

  useEffect(() => {
    if (contractStatsData && currentNetwork === 'base') {
      const [totalMessages, hubBalance, usdcBalance] = contractStatsData;
      setContractStats({
        totalMessages: Number(totalMessages),
        hubBalance: Number(hubBalance) / 1e18,
        usdcBalance: Number(usdcBalance) / 1e6
      });
    }
  }, [contractStatsData, currentNetwork]);

  useEffect(() => {
    if (currentUser && currentNetwork) {
      console.log('Setting loading to false');
      setLoading(false);
    }
  }, [currentUser, currentNetwork]);

  // Resetuj daily usage gdy zmienia się sieć
  useEffect(() => {
    console.log('Network changed to:', currentNetwork);
    setDailyUsage({ 
      used: 0, 
      limit: currentNetwork === 'celo' ? 10 : currentNetwork === 'linea' ? 100 : 10, 
      percentage: 0, 
      messagesToday: 0,
      isLoading: true 
    });
  }, [currentNetwork]);

  const getTierInfo = () => {
    if (!subscriptionInfo || currentNetwork !== 'base') {
      return { 
        name: currentNetwork === 'celo' ? 'CELO' : currentNetwork === 'linea' ? 'LINEA' : 'FREE', 
        color: currentNetwork === 'celo' ? 'text-yellow-400' : 
               currentNetwork === 'linea' ? 'text-cyan-400' : 'text-gray-400', 
        bg: currentNetwork === 'celo' ? 'bg-yellow-500/20' : 
            currentNetwork === 'linea' ? 'bg-cyan-500/20' : 'bg-gray-500/20',
        icon: currentNetwork === 'celo' ? '📱' : 
              currentNetwork === 'linea' ? '🚀' : '🎫'
      };
    }
    
    const tier = subscriptionInfo.tier;
    const isActive = subscriptionInfo.isActive;
    const isWhitelisted = subscriptionInfo.whitelisted;
    
    if (isWhitelisted) {
      return { 
        name: 'WHITELIST', 
        color: 'text-purple-400', 
        bg: 'bg-purple-500/20',
        icon: '👑'
      };
    }
    
    if (!isActive) {
      return { 
        name: 'FREE', 
        color: 'text-gray-400', 
        bg: 'bg-gray-500/20',
        icon: '🎫'
      };
    }
    
    switch(tier) {
      case 1:
        return { 
          name: 'BASIC', 
          color: 'text-cyan-400', 
          bg: 'bg-cyan-500/20',
          icon: '⭐'
        };
      case 2:
        return { 
          name: 'PREMIUM', 
          color: 'text-yellow-400', 
          bg: 'bg-yellow-500/20',
          icon: '✨'
        };
      default:
        return { 
          name: 'FREE', 
          color: 'text-gray-400', 
          bg: 'bg-gray-500/20',
          icon: '🎫'
        };
    }
  };

  const formatExpiry = () => {
    if (!subscriptionInfo || !subscriptionInfo.isActive || subscriptionInfo.whitelisted || currentNetwork !== 'base') {
      return 'Not subscribed';
    }
    
    const expiry = subscriptionInfo.expiry;
    if (expiry === 0) return 'Never';
    
    const now = Math.floor(Date.now() / 1000);
    const timeLeft = expiry - now;
    
    if (timeLeft <= 0) return 'Expired';
    
    const days = Math.floor(timeLeft / (24 * 3600));
    const hours = Math.floor((timeLeft % (24 * 3600)) / 3600);
    
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h left`;
    
    const minutes = Math.floor((timeLeft % 3600) / 60);
    return `${minutes}m left`;
  };

  const getDailyLimitText = () => {
    if (currentNetwork === 'celo') return '10 messages/day';
    if (currentNetwork === 'base') {
      if (!subscriptionInfo) return '10 messages/day (Free)';
      if (subscriptionInfo.whitelisted) return 'Unlimited messages (Whitelist)';
      if (subscriptionInfo.isActive) {
        switch(subscriptionInfo.tier) {
          case 1: return '50 messages/day (Basic)';
          case 2: return 'Unlimited messages (Premium)';
          default: return '10 messages/day (Free)';
        }
      }
      return '10 messages/day (Free)';
    }
    if (currentNetwork === 'linea') return '100 messages/day';
    return 'Daily Limit';
  };

  const getNetworkIcon = () => {
    if (currentNetwork === 'celo') return '📱';
    if (currentNetwork === 'base') return '🌉';
    if (currentNetwork === 'linea') return '🚀';
    return '🔗';
  };

  const getNetworkName = () => {
    if (currentNetwork === 'celo') return 'Celo';
    if (currentNetwork === 'base') return 'Base';
    if (currentNetwork === 'linea') return 'Linea';
    return 'Network';
  };

  const getNetworkColor = () => {
    if (currentNetwork === 'celo') return { text: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30' };
    if (currentNetwork === 'base') return { text: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30' };
    if (currentNetwork === 'linea') return { text: 'text-cyan-400', bg: 'bg-cyan-500/20', border: 'border-cyan-500/30' };
    return { text: 'text-cyan-400', bg: 'bg-cyan-500/20', border: 'border-cyan-500/30' };
  };

  const tierInfo = getTierInfo();
  const networkColor = getNetworkColor();

  if (!currentNetwork) {
    return (
      <div className={`${isMobile ? 'p-4' : 'p-6'} bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl`}>
        <div className="text-center py-4">
          <div className="text-gray-400 text-lg mb-2">🔗</div>
          <div className="text-gray-300 text-sm mb-1">Network Not Detected</div>
          <div className="text-gray-400 text-xs">Please connect your wallet</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`${isMobile ? 'p-4' : 'p-6'} bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl`}>
        <div className="animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gray-700 rounded-xl"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
              <div className="h-3 bg-gray-700 rounded w-32"></div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="h-16 bg-gray-700 rounded-xl"></div>
            <div className="h-16 bg-gray-700 rounded-xl"></div>
            <div className="h-16 bg-gray-700 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isMobile ? 'p-4' : 'p-6'} bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl`}>
      {/* User Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${networkColor.bg} ${networkColor.text}`}>
          {currentUser?.avatar || '👤'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white font-semibold truncate">{currentUser?.nickname}</div>
          <div className="text-gray-400 text-xs truncate">
            {currentUser?.walletAddress?.slice(0, 6)}...{currentUser?.walletAddress?.slice(-4)}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full ${networkColor.bg} ${networkColor.text}`}>
              {getNetworkIcon()} {getNetworkName()}
              {currentNetwork === 'base' && subscriptionInfo && ` • ${tierInfo.name}`}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid - Salda tokenów */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {/* HUB Balance */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 text-center">
          <div className="text-blue-400 font-bold text-lg truncate" title={currentUser?.baseBalance || '0'}>
            {currentUser?.baseBalance || '0'}
          </div>
          <div className="text-blue-300 text-xs">$HUB</div>
          <div className="text-gray-400 text-[10px]">Base</div>
        </div>

        {/* HC Balance */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-center">
          <div className="text-amber-400 font-bold text-lg truncate" title={currentUser?.celoBalance || '0'}>
            {currentUser?.celoBalance || '0'}
          </div>
          <div className="text-amber-300 text-xs">$HC</div>
          <div className="text-gray-400 text-[10px]">Celo</div>
        </div>

        {/* LPX Balance */}
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-3 text-center">
          <div className="text-cyan-400 font-bold text-lg truncate" title={currentUser?.lineaBalance || '0'}>
            {currentUser?.lineaBalance || '0'}
          </div>
          <div className="text-cyan-300 text-xs">$LPX</div>
          <div className="text-gray-400 text-[10px]">Linea</div>
        </div>
      </div>

      {/* Daily Usage Section - dla wszystkich sieci */}
      <div className="mb-6">
        <div className="text-center mb-3">
          <h3 className={`text-sm font-bold ${networkColor.text}`}>
            {getNetworkIcon()} {getNetworkName()} - Daily Usage
          </h3>
          <p className="text-gray-400 text-xs">{getDailyLimitText()}</p>
        </div>

        <div className="bg-gray-700/30 rounded-xl p-4">
          {dailyUsage.isLoading ? (
            <div className="text-center py-2">
              <div className="animate-spin rounded-full border-b-2 border-cyan-500 h-5 w-5 mx-auto"></div>
              <div className="text-gray-400 text-xs mt-2">Loading daily usage...</div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300 text-sm font-medium">Messages Today</span>
                <span className={`font-bold ${networkColor.text}`}>
                  {dailyUsage.used} / {dailyUsage.limit}
                </span>
              </div>
              
              <div className="w-full h-2.5 bg-gray-600 rounded-full overflow-hidden mb-2">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    dailyUsage.percentage >= 90 ? 'bg-red-500' :
                    dailyUsage.percentage >= 75 ? 'bg-yellow-500' :
                    currentNetwork === 'celo' ? 'bg-yellow-500' :
                    currentNetwork === 'base' ? 'bg-blue-500' :
                    currentNetwork === 'linea' ? 'bg-cyan-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(dailyUsage.percentage, 100)}%` }}
                />
              </div>
              
              <div className="flex justify-between">
                <span className={`text-xs font-medium ${
                  dailyUsage.percentage >= 90 ? 'text-red-400' :
                  dailyUsage.percentage >= 75 ? 'text-yellow-400' :
                  'text-green-400'
                }`}>
                  {dailyUsage.percentage >= 90 ? 'Almost full!' :
                   dailyUsage.percentage >= 75 ? 'Getting busy' :
                   'Good to go'}
                </span>
                <span className="text-gray-400 text-xs">
                  {dailyUsage.limit === '∞' ? 'Unlimited' : `${dailyUsage.percentage.toFixed(0)}%`}
                </span>
              </div>

              {/* Network Info */}
              <div className={`mt-3 pt-3 border-t border-gray-600/30 text-center text-[10px] ${networkColor.text} opacity-70`}>
                {currentNetwork === 'celo' && '📱 Celo - 10 messages daily • Earn $HC tokens'}
                {currentNetwork === 'base' && '🌉 Base - Subscription based • Earn $HUB tokens'}
                {currentNetwork === 'linea' && '🚀 Linea - 100 messages daily • Earn $LPX tokens'}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Subscription Info - TYLKO dla Base */}
      {currentNetwork === 'base' && subscriptionInfo && (
        <div className="mb-6">
          <div className="text-center mb-2">
            <h4 className="text-cyan-400 text-xs font-bold">BASE SUBSCRIPTION</h4>
            <p className="text-gray-400 text-[10px]">Manage your daily message limit</p>
          </div>
          
          <div className={`mb-2 p-2 rounded-lg border ${
            subscriptionInfo.whitelisted ? 'border-purple-500/30 bg-purple-500/10' :
            subscriptionInfo.isActive && subscriptionInfo.tier === 2 ? 'border-yellow-500/30 bg-yellow-500/10' :
            subscriptionInfo.isActive && subscriptionInfo.tier === 1 ? 'border-cyan-500/30 bg-cyan-500/10' :
            'border-gray-500/30 bg-gray-500/10'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-sm">
                  {subscriptionInfo.whitelisted ? '👑' :
                   subscriptionInfo.tier === 2 ? '✨' :
                   subscriptionInfo.tier === 1 ? '⭐' : '🎫'}
                </span>
                <span className={`font-bold text-xs ${
                  subscriptionInfo.whitelisted ? 'text-purple-400' :
                  subscriptionInfo.tier === 2 ? 'text-yellow-400' :
                  subscriptionInfo.tier === 1 ? 'text-cyan-400' :
                  'text-gray-400'
                }`}>
                  {subscriptionInfo.whitelisted ? 'WHITELIST' :
                   subscriptionInfo.tier === 2 ? 'PREMIUM' :
                   subscriptionInfo.tier === 1 ? 'BASIC' : 'FREE'}
                </span>
              </div>
              <span className="text-gray-300 text-[10px]">
                {subscriptionInfo.whitelisted ? '👑 Special' :
                 subscriptionInfo.tier === 2 ? '✨ Premium' :
                 subscriptionInfo.tier === 1 ? '⭐ Basic' : '🎫 Free'}
              </span>
            </div>
            
            <div className="text-gray-300 text-[10px] mt-0.5">
              {subscriptionInfo.whitelisted ? 'Whitelisted user' : 
               subscriptionInfo.tier === 2 ? 'Unlimited messages' :
               subscriptionInfo.tier === 1 ? '50 messages/day' : '10 messages/day (free)'}
            </div>
          </div>
          
          {/* Subscription Expiry */}
          {subscriptionInfo.isActive && !subscriptionInfo.whitelisted && (
            <div className="mb-3 p-2 bg-gray-800/50 rounded-lg text-center">
              <div className="text-gray-300 font-bold text-sm">
                {formatExpiry()}
              </div>
              <div className="text-gray-400 text-[10px]">Subscription Expiry</div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-2">
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
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Subscription Button - TYLKO dla Base */}
        {currentNetwork === 'base' && (!subscriptionInfo?.whitelisted && (!subscriptionInfo?.isActive || subscriptionInfo?.tier < 2)) && (
          <button 
            onClick={onShowSubscriptionModal}
            className={`w-full flex items-center justify-center gap-2 py-2.5 text-white font-medium rounded-xl transition-all ${
              subscriptionInfo?.isActive && subscriptionInfo?.tier === 1
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600'
                : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600'
            }`}
          >
            <span className="text-lg">🎫</span>
            {subscriptionInfo?.isActive 
              ? 'Upgrade to Premium' 
              : 'Get Subscription'
            }
          </button>
        )}

        {/* Leaderboard Button */}
        <button 
          onClick={onShowBaseLeaderboard}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-700/40 border border-gray-600/40 rounded-xl text-gray-400 hover:text-white transition-all"
        >
          <span className="text-lg">🏆</span>
          {currentNetwork === 'celo' ? 'Celo' : currentNetwork === 'base' ? 'Base' : 'Linea'} Leaderboard
        </button>

        {/* Quick Guide */}
        <button 
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-700/40 border border-gray-600/40 rounded-xl text-gray-400 hover:text-white transition-all"
        >
          <span className="text-lg">❓</span>
          Quick Guide
        </button>
      </div>

      {/* Status Info */}
      <div className="mt-6 pt-4 border-t border-gray-700/50">
        <div className="text-gray-500 text-xs text-center">
          {currentNetwork === 'base' && subscriptionInfo?.whitelisted ? (
            <div className="text-purple-400">👑 Whitelisted - Unlimited Access</div>
          ) : currentNetwork === 'base' && subscriptionInfo?.isActive ? (
            <div className="text-green-400">✅ Active Subscription</div>
          ) : currentNetwork === 'celo' ? (
            <div className="text-yellow-400">📱 Celo - 10 messages/day • Earn $HC tokens</div>
          ) : currentNetwork === 'linea' ? (
            <div className="text-cyan-400">🚀 Linea - 100 messages/day • Earn $LPX tokens</div>
          ) : currentNetwork === 'base' ? (
            <div className="text-gray-400">🎫 Free Tier - 10 messages/day • Earn $HUB tokens</div>
          ) : (
            <div className="text-cyan-400">💬 Public Chat - All Networks</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileSidebar;