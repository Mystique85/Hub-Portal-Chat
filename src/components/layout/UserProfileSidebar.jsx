import { useState, useEffect } from 'react';
import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../../utils/constants';

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

  // Pobierz informacje o subskrypcji
  const { data: subscriptionData } = useReadContract({
    address: CONTRACT_ADDRESSES.base,
    abi: CONTRACT_ABIS.base,
    functionName: 'getSubscriptionInfo',
    args: [currentUser?.walletAddress],
    query: {
      enabled: !!currentUser?.walletAddress,
    }
  });

  // Pobierz pozostałe wiadomości
  const { data: remainingMessagesData } = useReadContract({
    address: CONTRACT_ADDRESSES.base,
    abi: CONTRACT_ABIS.base,
    functionName: 'getRemainingDailyMessages',
    args: [currentUser?.walletAddress],
    query: {
      enabled: !!currentUser?.walletAddress,
    }
  });

  // Pobierz statystyki kontraktu
  const { data: contractStatsData } = useReadContract({
    address: CONTRACT_ADDRESSES.base,
    abi: CONTRACT_ABIS.base,
    functionName: 'getContractStats',
    query: {
      enabled: true,
    }
  });

  useEffect(() => {
    if (subscriptionData) {
      const [tier, expiry, whitelisted, isActive] = subscriptionData;
      setSubscriptionInfo({
        tier: Number(tier),
        expiry: Number(expiry),
        whitelisted,
        isActive
      });
    }
  }, [subscriptionData]);

  useEffect(() => {
    if (remainingMessagesData !== undefined) {
      const remaining = Number(remainingMessagesData);
      setRemainingMessages(remaining);
    }
  }, [remainingMessagesData]);

  useEffect(() => {
    if (contractStatsData) {
      const [totalMessages, hubBalance, usdcBalance] = contractStatsData;
      setContractStats({
        totalMessages: Number(totalMessages),
        hubBalance: Number(hubBalance) / 1e18,
        usdcBalance: Number(usdcBalance) / 1e6
      });
    }
  }, [contractStatsData]);

  useEffect(() => {
    if (currentUser) {
      setLoading(false);
    }
  }, [currentUser]);

  const getTierInfo = () => {
    if (!subscriptionInfo) return { name: 'FREE', color: 'text-gray-400', bg: 'bg-gray-500/20' };
    
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
    if (!subscriptionInfo || !subscriptionInfo.isActive || subscriptionInfo.whitelisted) {
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

  const getMessagesDisplay = () => {
    if (remainingMessages === null) return '...';
    
    if (remainingMessages === 999999 || remainingMessages > 1000) {
      return '∞';
    }
    
    return remainingMessages.toString();
  };

  const getMessagesLabel = () => {
    if (!subscriptionInfo) return 'Messages left';
    
    if (subscriptionInfo.whitelisted) return 'Unlimited messages';
    if (subscriptionInfo.isActive && subscriptionInfo.tier === 2) return 'Unlimited messages';
    if (subscriptionInfo.isActive && subscriptionInfo.tier === 1) return 'Messages left (Basic)';
    
    return 'Messages left (Free)';
  };

  const tierInfo = getTierInfo();

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
          <div className="grid grid-cols-2 gap-3">
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
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${tierInfo.bg} ${tierInfo.color}`}>
          {currentUser?.avatar || '👤'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white font-semibold truncate">{currentUser?.nickname}</div>
          <div className="text-gray-400 text-xs truncate">
            {currentUser?.walletAddress?.slice(0, 6)}...{currentUser?.walletAddress?.slice(-4)}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full ${tierInfo.bg} ${tierInfo.color}`}>
              {tierInfo.icon} {tierInfo.name}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {/* Balance */}
        <div className="bg-gray-700/30 rounded-xl p-3 text-center">
          <div className="text-cyan-400 font-bold text-lg truncate" title={currentUser?.balance || '0'}>
            {currentUser?.balance || '0'}
          </div>
          <div className="text-gray-400 text-xs">$HUB Balance</div>
        </div>

        {/* Messages Left */}
        <div className={`${tierInfo.bg} rounded-xl p-3 text-center`}>
          <div className={`font-bold text-lg ${tierInfo.color}`}>
            {getMessagesDisplay()}
          </div>
          <div className="text-gray-300 text-xs">{getMessagesLabel()}</div>
        </div>

        {/* Subscription Expiry */}
        <div className="bg-gray-700/30 rounded-xl p-3 text-center">
          <div className="text-gray-300 font-bold text-sm truncate">
            {formatExpiry()}
          </div>
          <div className="text-gray-400 text-xs">Subscription</div>
        </div>

        {/* Network */}
        <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-3 text-center">
          <div className="text-blue-400 font-bold text-sm">🌉 BASE</div>
          <div className="text-gray-300 text-xs">Network</div>
        </div>
      </div>

      {/* Contract Stats (Desktop only) */}
      {!isMobile && contractStats && (
        <div className="mb-6 p-3 bg-gray-700/20 rounded-xl">
          <div className="text-gray-400 text-xs mb-2">📊 Contract Stats</div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-white text-sm font-medium">{contractStats.totalMessages}</div>
              <div className="text-gray-500 text-[10px]">Messages</div>
            </div>
            <div>
              <div className="text-cyan-400 text-sm font-medium">{contractStats.hubBalance.toFixed(0)}</div>
              <div className="text-gray-500 text-[10px]">$HUB Pool</div>
            </div>
            <div>
              <div className="text-green-400 text-sm font-medium">{contractStats.usdcBalance.toFixed(0)}</div>
              <div className="text-gray-500 text-[10px]">USDC Pool</div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Subscription Button */}
        {(!subscriptionInfo?.whitelisted && (!subscriptionInfo?.isActive || subscriptionInfo?.tier < 2)) && (
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
          Base Leaderboard
        </button>

        {/* Base Ecosystem */}
        <button 
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-700/40 border border-gray-600/40 rounded-xl text-gray-400 hover:text-white transition-all"
        >
          <span className="text-lg">🌐</span>
          Base Ecosystem Hub
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
          {subscriptionInfo?.whitelisted ? (
            <div className="text-purple-400">👑 Whitelisted - Unlimited Access</div>
          ) : subscriptionInfo?.isActive ? (
            <div className="text-green-400">✅ Active Subscription</div>
          ) : (
            <div className="text-gray-400">🎫 Free Tier - 10 messages/day</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileSidebar;