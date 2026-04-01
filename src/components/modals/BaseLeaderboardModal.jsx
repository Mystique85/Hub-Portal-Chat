import { useState, useEffect, useCallback } from 'react';
import { useReadContract, useAccount, usePublicClient } from 'wagmi';
import { useNetwork } from '../../hooks/useNetwork';

// Pełne ABI kontraktu HUBChatRewards
const HUB_CHAT_ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"cooldown","type":"uint256"}],"name":"CooldownUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"utcDay","type":"uint256"}],"name":"DailyLimitReset","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"free","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"basic","type":"uint256"}],"name":"LimitsUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"string","name":"content","type":"string"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"reward","type":"uint256"}],"name":"MessageSent","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"basic","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"premium","type":"uint256"}],"name":"PricesUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"duration","type":"uint256"}],"name":"SubscriptionDurationUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"enum HUBChatRewards.Tier","name":"tier","type":"uint8"},{"indexed":false,"internalType":"uint256","name":"expiry","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"paidAmount","type":"uint256"}],"name":"SubscriptionPurchased","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":false,"internalType":"uint256","name":"amountHUB","type":"uint256"}],"name":"TokensDeposited","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"bool","name":"status","type":"bool"}],"name":"WhitelistUpdated","type":"event"},{"inputs":[],"name":"DEV_ACCOUNT","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"HUB_TOKEN","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MAX_MESSAGE_LENGTH","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"REWARD_PER_MESSAGE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"UNLIMITED_FLAG","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"USDC_TOKEN","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"addToWhitelist","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"basicDailyLimit","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"basicPriceUSDC","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"blacklist","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"blockUser","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"buyBasicSubscription","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"buyPremiumSubscription","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"canSendMessage","outputs":[{"internalType":"bool","name":"canSend","type":"bool"},{"internalType":"string","name":"reason","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"checkWhitelist","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"cooldownSeconds","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"depositHUBTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"emergencyWithdrawHUB","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"forceResetUserLimit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"freeDailyLimit","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getContractStats","outputs":[{"internalType":"uint256","name":"totalMessages","type":"uint256"},{"internalType":"uint256","name":"hubBalance","type":"uint256"},{"internalType":"uint256","name":"usdcBalance","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getCurrentUTCDay","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getNextResetTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getRemainingDailyMessages","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getSubscriptionInfo","outputs":[{"internalType":"enum HUBChatRewards.Tier","name":"tier","type":"uint8"},{"internalType":"uint256","name":"expiry","type":"uint256"},{"internalType":"bool","name":"whitelisted","type":"bool"},{"internalType":"bool","name":"isActive","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getUserBasicStats","outputs":[{"internalType":"uint256","name":"totalMessages","type":"uint256"},{"internalType":"uint256","name":"totalEarned","type":"uint256"},{"internalType":"uint256","name":"lastMessageTime","type":"uint256"},{"internalType":"bool","name":"isBlocked","type":"bool"},{"internalType":"uint256","name":"messagesToday","type":"uint256"},{"internalType":"uint256","name":"lastResetDay","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getUserSubscriptionInfo","outputs":[{"internalType":"uint256","name":"remainingMessages","type":"uint256"},{"internalType":"enum HUBChatRewards.Tier","name":"tier","type":"uint8"},{"internalType":"bool","name":"whitelisted","type":"bool"},{"internalType":"uint256","name":"subscriptionExpiry","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getWhitelistedAddresses","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"paidSubscriptions","outputs":[{"internalType":"uint256","name":"expiry","type":"uint256"},{"internalType":"enum HUBChatRewards.Tier","name":"tier","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"paused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"premiumPriceUSDC","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"removeFromWhitelist","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_content","type":"string"}],"name":"sendMessage","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_seconds","type":"uint256"}],"name":"setCooldown","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_free","type":"uint256"},{"internalType":"uint256","name":"_basic","type":"uint256"}],"name":"setLimits","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_basic","type":"uint256"},{"internalType":"uint256","name":"_premium","type":"uint256"}],"name":"setPrices","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_seconds","type":"uint256"}],"name":"setSubscriptionDuration","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"subscriptionDuration","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"unblockUser","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"unpause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"userStats","outputs":[{"internalType":"uint256","name":"totalMessages","type":"uint256"},{"internalType":"uint256","name":"totalEarned","type":"uint256"},{"internalType":"uint256","name":"lastMessageTime","type":"uint256"},{"internalType":"bool","name":"isBlocked","type":"bool"},{"internalType":"uint256","name":"messagesToday","type":"uint256"},{"internalType":"uint256","name":"lastResetDay","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"whitelist","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"withdrawUSDC","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];

const HUB_CHAT_CONTRACT = "0x8ea3818294887376673e4e64fBd518598e3a2306";

// Base network RPC URL
const BASE_RPC_URL = "https://mainnet.base.org";

const BaseLeaderboardModal = ({ isOpen, onClose, currentUser, isMobile = false }) => {
  const [timeRemaining, setTimeRemaining] = useState({});
  const [timeUntilEnd, setTimeUntilEnd] = useState({});
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [totalMessages, setTotalMessages] = useState(0);
  const [userRank, setUserRank] = useState(null);
  const [userMessageCount, setUserMessageCount] = useState(0);
  const [userSubscriptionTier, setUserSubscriptionTier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rankingLoading, setRankingLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [rankingError, setRankingError] = useState(null);
  const [allUsersStats, setAllUsersStats] = useState([]);
  const [userStatus, setUserStatus] = useState({
    hasNFT: false,
    hasEnoughTokens: false,
    hubBalance: 0,
    isEligible: false,
    loading: true
  });
  
  const { isCelo, isBase } = useNetwork();
  const { address } = useAccount();
  const publicClient = usePublicClient();

  // Nowe daty: 1 kwietnia - 31 października 2026
  const startDate = new Date('2026-04-01T00:00:00');
  const endDate = new Date('2026-10-31T23:59:59');
  const MIN_TOKENS_REQUIRED = 100;
  const GENESIS_NFT_CONTRACT = "0xdAf7B15f939F6a8faf87d338010867883AAB366a";
  const TOTAL_REWARD_POOL = 20000; // $20,000 USDC

  // Struktura nagród - duży nacisk na top 10
  const rewardStructure = {
    1: 5000,   // 1st: $5,000 (25% puli)
    2: 3000,   // 2nd: $3,000 (15% puli)
    3: 2000,   // 3rd: $2,000 (10% puli)
    4: 1500,   // 4th: $1,500 (7.5% puli)
    5: 1200,   // 5th: $1,200 (6% puli)
    6: 1000,   // 6th: $1,000 (5% puli)
    7: 800,    // 7th: $800 (4% puli)
    8: 700,    // 8th: $700 (3.5% puli)
    9: 600,    // 9th: $600 (3% puli)
    10: 500,   // 10th: $500 (2.5% puli)
  };

  const NFT_ABI = [
    {
      "inputs": [{ "name": "owner", "type": "address" }],
      "name": "balanceOf",
      "outputs": [{ "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  // Funkcja do pobierania wszystkich zdarzeń MessageSent od startu wyzwania
  const fetchAllMessagesFromContract = useCallback(async () => {
    if (!isBase || !isOpen || !publicClient) return;
    
    setRankingLoading(true);
    setRankingError(null);
    
    try {
      const startTimestamp = Math.floor(startDate.getTime() / 1000);
      const endTimestamp = Math.floor(endDate.getTime() / 1000);
      
      console.log("Fetching messages from", new Date(startTimestamp * 1000), "to", new Date(endTimestamp * 1000));
      
      // Pobierz wszystkie logi zdarzeń MessageSent z kontraktu
      const logs = await publicClient.getLogs({
        address: HUB_CHAT_CONTRACT,
        event: {
          type: 'event',
          name: 'MessageSent',
          inputs: [
            { indexed: true, name: 'sender', type: 'address' },
            { indexed: false, name: 'content', type: 'string' },
            { indexed: false, name: 'timestamp', type: 'uint256' },
            { indexed: false, name: 'reward', type: 'uint256' }
          ]
        },
        fromBlock: 0n, // Od początku
        toBlock: 'latest',
      });
      
      console.log(`Found ${logs.length} total message events`);
      
      // Filtruj wiadomości po dacie startu
      const filteredMessages = logs.filter(log => {
        const timestamp = Number(log.args.timestamp);
        return timestamp >= startTimestamp && timestamp <= endTimestamp;
      });
      
      console.log(`Filtered to ${filteredMessages.length} messages in challenge period`);
      
      // Agreguj wiadomości per użytkownik
      const userMessageCounts = {};
      
      filteredMessages.forEach(log => {
        const sender = log.args.sender.toLowerCase();
        userMessageCounts[sender] = (userMessageCounts[sender] || 0) + 1;
      });
      
      // Stwórz tablicę rankingową
      const rankingArray = Object.entries(userMessageCounts).map(([address, count]) => ({
        address,
        messageCount: count
      }));
      
      // Sortuj malejąco
      rankingArray.sort((a, b) => b.messageCount - a.messageCount);
      
      setAllUsersStats(rankingArray);
      
      // Znajdź pozycję aktualnego użytkownika
      const currentWallet = (currentUser?.walletAddress || address)?.toLowerCase();
      if (currentWallet) {
        const currentUserIndex = rankingArray.findIndex(
          user => user.address.toLowerCase() === currentWallet
        );
        
        if (currentUserIndex !== -1) {
          setUserRank({
            rank: currentUserIndex + 1,
            messageCount: rankingArray[currentUserIndex].messageCount
          });
          setUserMessageCount(rankingArray[currentUserIndex].messageCount);
        } else {
          // Jeśli użytkownik nie ma wiadomości
          setUserRank({
            rank: rankingArray.length + 1,
            messageCount: 0
          });
          setUserMessageCount(0);
        }
      }
      
      setLastUpdate(new Date());
      
    } catch (error) {
      console.error("Error fetching messages from contract:", error);
      setRankingError(error.message);
      
      // Fallback - użyj danych z kontraktu
      try {
        if (publicClient) {
          const contractStats = await publicClient.readContract({
            address: HUB_CHAT_CONTRACT,
            abi: HUB_CHAT_ABI,
            functionName: 'getContractStats',
          });
          
          if (contractStats && contractStats[0]) {
            setTotalMessages(Number(contractStats[0]));
          }
        }
      } catch (fallbackError) {
        console.error("Fallback error:", fallbackError);
      }
    } finally {
      setRankingLoading(false);
    }
  }, [isBase, isOpen, publicClient, startDate, endDate, currentUser, address]);

  // Odczyt statystyk kontraktu (całkowita liczba wiadomości)
  const { 
    data: contractStats, 
    isLoading: contractStatsLoading,
    error: contractStatsError,
    refetch: refetchContractStats
  } = useReadContract({
    address: HUB_CHAT_CONTRACT,
    abi: HUB_CHAT_ABI,
    functionName: 'getContractStats',
    query: {
      enabled: isOpen && isBase,
      refetchInterval: 24 * 60 * 60 * 1000, // Odświeżanie co 24h
    }
  });

  // Odczyt statystyk bieżącego użytkownika
  const { 
    data: userStatsData, 
    isLoading: userStatsLoading,
    error: userStatsError,
    refetch: refetchUserStats
  } = useReadContract({
    address: HUB_CHAT_CONTRACT,
    abi: HUB_CHAT_ABI,
    functionName: 'getUserBasicStats',
    args: [currentUser?.walletAddress || address],
    query: {
      enabled: (isOpen && isBase) && !!(currentUser?.walletAddress || address),
      refetchInterval: 24 * 60 * 60 * 1000, // Odświeżanie co 24h
    }
  });

  // Odczyt informacji o subskrypcji użytkownika
  const { 
    data: subscriptionInfo, 
    isLoading: subscriptionLoading
  } = useReadContract({
    address: HUB_CHAT_CONTRACT,
    abi: HUB_CHAT_ABI,
    functionName: 'getUserSubscriptionInfo',
    args: [currentUser?.walletAddress || address],
    query: {
      enabled: (isOpen && isBase) && !!(currentUser?.walletAddress || address),
      refetchInterval: 24 * 60 * 60 * 1000, // Odświeżanie co 24h
    }
  });

  // Odczyt NFT
  const { 
    data: nftBalanceData, 
    isLoading: nftLoading,
    error: nftError 
  } = useReadContract({
    address: GENESIS_NFT_CONTRACT,
    abi: NFT_ABI,
    functionName: 'balanceOf',
    args: [currentUser?.walletAddress || address],
    query: {
      enabled: !!currentUser?.walletAddress && isOpen && isBase,
      refetchInterval: 24 * 60 * 60 * 1000, // Odświeżanie co 24h
    }
  });

  // Przetwarzanie statystyk kontraktu
  useEffect(() => {
    if (contractStats && Array.isArray(contractStats) && contractStats.length > 0) {
      setTotalMessages(Number(contractStats[0]));
      setLastUpdate(new Date());
    }
  }, [contractStats]);

  // Przetwarzanie statystyk użytkownika
  useEffect(() => {
    if (userStatsData && Array.isArray(userStatsData) && userStatsData.length > 0) {
      setUserMessageCount(Number(userStatsData[0]));
    }
  }, [userStatsData]);

  // Przetwarzanie informacji o subskrypcji
  useEffect(() => {
    if (subscriptionInfo && Array.isArray(subscriptionInfo) && subscriptionInfo.length > 0) {
      const tier = Number(subscriptionInfo[1]);
      const tierNames = ['None', 'Free', 'Basic', 'Premium'];
      setUserSubscriptionTier(tierNames[tier] || 'None');
    }
  }, [subscriptionInfo]);

  // Sprawdzanie statusu uprawnień
  useEffect(() => {
    if (!isOpen || !currentUser || !isBase) return;

    const checkEligibility = async () => {
      try {
        setUserStatus(prev => ({ ...prev, loading: true }));

        const hubBalance = parseFloat(currentUser?.balance || '0');
        const hasEnoughTokens = hubBalance >= MIN_TOKENS_REQUIRED;

        let hasNFT = false;
        if (nftBalanceData !== undefined) {
          const balance = Number(nftBalanceData);
          hasNFT = balance > 0;
        }

        const hasActiveSubscription = userSubscriptionTier && userSubscriptionTier !== 'None';
        const isEligible = (hasNFT && hasEnoughTokens) || hasActiveSubscription;

        setUserStatus({
          hasNFT,
          hasEnoughTokens,
          hubBalance,
          isEligible,
          loading: nftLoading || subscriptionLoading
        });

      } catch (error) {
        console.error("Error checking eligibility:", error);
        setUserStatus(prev => ({ ...prev, loading: false }));
      }
    };

    checkEligibility();
  }, [isOpen, currentUser, isBase, nftBalanceData, nftLoading, userSubscriptionTier, subscriptionLoading]);

  // Timer do odliczania do startu i końca
  useEffect(() => {
    if (!isOpen) return;

    const calculateTimeRemaining = () => {
      const now = new Date();
      
      // Odliczanie do startu
      const startDiff = startDate.getTime() - now.getTime();
      if (startDiff > 0) {
        const days = Math.floor(startDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((startDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((startDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((startDiff % (1000 * 60)) / 1000);
        setTimeRemaining({ days, hours, minutes, seconds });
      } else {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        
        // Odliczanie do końca (jeśli event już się zaczął)
        const endDiff = endDate.getTime() - now.getTime();
        if (endDiff > 0) {
          const days = Math.floor(endDiff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((endDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((endDiff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((endDiff % (1000 * 60)) / 1000);
          setTimeUntilEnd({ days, hours, minutes, seconds });
        } else {
          setTimeUntilEnd({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        }
      }
    };

    calculateTimeRemaining();
    const timer = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  // Pobieranie danych rankingu
  useEffect(() => {
    if (isOpen && isBase && publicClient) {
      fetchAllMessagesFromContract();
      
      // Odświeżaj co 30 minut
      const interval = setInterval(fetchAllMessagesFromContract, 30 * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [isOpen, isBase, publicClient, fetchAllMessagesFromContract]);

  // Sprawdzanie ładowania
  useEffect(() => {
    const isLoading = contractStatsLoading || userStatsLoading || rankingLoading;
    setLoading(isLoading);
  }, [contractStatsLoading, userStatsLoading, rankingLoading]);

  // Funkcja do formatowania adresu
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Funkcja do formatowania czasu
  const formatTimeAgo = (date) => {
    if (!date) return 'Never';
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  // Funkcja do pobierania nagrody za miejsce
  const getRewardForRank = (rank) => {
    if (rank <= 10) {
      return rewardStructure[rank];
    } else if (rank <= 100) {
      const remainingPool = 3700;
      const positionsFrom11 = rank - 10;
      const totalPositions = 90;
      const weight = (91 - positionsFrom11) / 4095;
      return Math.floor(weight * remainingPool);
    }
    return 0;
  };

  // Sprawdzenie czy event jest aktywny
  const isEventActive = () => {
    const now = new Date();
    return now >= startDate && now <= endDate;
  };

  const isEventNotStarted = () => {
    const now = new Date();
    return now < startDate;
  };

  const isEventEnded = () => {
    const now = new Date();
    return now > endDate;
  };

  // Komponent statusu
  const StatusBadge = ({ condition, text }) => (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
      condition 
        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
        : 'bg-red-500/20 text-red-400 border border-red-500/30'
    }`}>
      <span>{condition ? '✅' : '❌'}</span>
      <span>{text}</span>
    </div>
  );

  // Komponent nagrody
  const RewardRow = ({ rank, reward }) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-700/30">
      <div className="flex items-center gap-2">
        <div className={`w-8 text-center font-bold ${
          rank === 1 ? 'text-yellow-400' :
          rank === 2 ? 'text-gray-300' :
          rank === 3 ? 'text-amber-600' :
          rank <= 10 ? 'text-cyan-400' : 'text-gray-400'
        }`}>
          #{rank}
        </div>
        <div className="text-sm">
          {rank === 1 && '🥇 '}
          {rank === 2 && '🥈 '}
          {rank === 3 && '🥉 '}
          Place
        </div>
      </div>
      <div className="font-bold text-green-400">
        ${reward.toLocaleString()} USDC
      </div>
    </div>
  );

  // Komponent tabeli rankingu
  const RankingTable = () => {
    if (rankingLoading) {
      return (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
          <p className="text-gray-400">Loading ranking data...</p>
          <p className="text-gray-500 text-xs mt-2">Fetching messages from contract...</p>
        </div>
      );
    }
    
    if (rankingError) {
      return (
        <div className="text-center py-8 text-red-400">
          <p>Error loading ranking: {rankingError}</p>
          <button 
            onClick={fetchAllMessagesFromContract}
            className="mt-3 px-4 py-2 bg-blue-500 rounded-lg text-sm hover:bg-blue-600 transition-all"
          >
            Retry
          </button>
        </div>
      );
    }
    
    if (allUsersStats.length === 0) {
      return (
        <div className="text-center py-8 text-gray-400">
          <div className="text-4xl mb-3">💬</div>
          <p>No messages sent yet in the challenge period.</p>
          <p className="text-xs mt-2">Be the first to send a message and start competing!</p>
        </div>
      );
    }
    
    const top100 = allUsersStats.slice(0, 100);
    
    return (
      <div className="space-y-2">
        <div className={`bg-gray-700/30 rounded-xl p-3 border border-blue-500/30 mb-4 ${isMobile ? 'text-xs' : 'text-sm'}`}>
          <div className="grid grid-cols-12 gap-2 font-bold text-gray-300">
            <div className="col-span-2 text-center">#</div>
            <div className="col-span-7">User</div>
            <div className="col-span-3 text-right">Messages</div>
          </div>
        </div>
        
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {top100.map((user, index) => {
            const rank = index + 1;
            const currentWallet = (currentUser?.walletAddress || address)?.toLowerCase();
            const isCurrentUser = currentWallet && user.address.toLowerCase() === currentWallet;
            
            return (
              <div 
                key={user.address}
                className={`bg-gray-700/30 rounded-xl p-3 border transition-all ${
                  isCurrentUser 
                    ? 'border-yellow-500 bg-yellow-500/10 shadow-lg shadow-yellow-500/10' 
                    : 'border-gray-700/50 hover:border-gray-600'
                } ${isMobile ? 'text-xs' : 'text-sm'}`}
              >
                <div className="grid grid-cols-12 gap-2 items-center">
                  <div className={`col-span-2 text-center font-bold ${
                    rank === 1 ? 'text-yellow-400' :
                    rank === 2 ? 'text-gray-300' :
                    rank === 3 ? 'text-amber-600' :
                    rank <= 10 ? 'text-cyan-400' : 'text-gray-400'
                  }`}>
                    {rank === 1 && '🥇 '}
                    {rank === 2 && '🥈 '}
                    {rank === 3 && '🥉 '}
                    #{rank}
                  </div>
                  <div className="col-span-7 truncate font-mono">
                    {formatAddress(user.address)}
                    {isCurrentUser && (
                      <span className="ml-2 text-xs text-yellow-400 font-normal">(You)</span>
                    )}
                  </div>
                  <div className="col-span-3 text-right font-mono font-bold text-blue-400">
                    {user.messageCount.toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {userRank && userRank.rank > 100 && (
          <div className="mt-4 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/30 text-center">
            <p className="text-yellow-400 text-sm font-semibold">
              Your current rank: #{userRank.rank}
            </p>
            <p className="text-2xl font-bold text-yellow-400 mt-1">
              {userRank.messageCount.toLocaleString()} messages
            </p>
            <p className="text-gray-400 text-xs mt-2">
              Need {allUsersStats[99]?.messageCount - userRank.messageCount || 1} more messages to enter Top 100!
            </p>
            <p className="text-green-400 text-xs mt-1">
              🚀 Keep messaging to climb the ranks!
            </p>
          </div>
        )}
        
        {userRank && userRank.rank <= 100 && (
          <div className="mt-4 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/30 text-center">
            <p className="text-green-400 text-sm font-semibold">
              🎉 You're in the TOP 100! 🎉
            </p>
            <p className="text-2xl font-bold text-green-400 mt-1">
              #{userRank.rank} with {userRank.messageCount.toLocaleString()} messages
            </p>
            <p className="text-yellow-400 text-xs mt-2">
              Estimated reward: ${getRewardForRank(userRank.rank).toLocaleString()} USDC
            </p>
          </div>
        )}
        
        <div className="text-center text-xs text-gray-500 mt-3">
          Total participants: {allUsersStats.length} • Showing top 100
        </div>
      </div>
    );
  };

  if (!isBase && isOpen) {
    return (
      <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 ${
        isMobile ? 'p-0' : 'p-4'
      }`}>
        <div className={`bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 w-full ${
          isMobile 
            ? 'h-full rounded-none p-4 max-w-full' 
            : 'rounded-3xl p-6 max-w-md'
        }`}>
          <div className="text-center">
            <div className={`${isMobile ? 'text-3xl' : 'text-4xl'} mb-4`}>🌐</div>
            <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-blue-400 mb-4`}>
              Base Leaderboard
            </h2>
            <p className="text-gray-300 mb-6">
              Please switch to Base network to view the leaderboard and compete for $20,000 USDC rewards!
            </p>
            <button 
              onClick={onClose}
              className={`${isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3'} bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-all`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isOpen) return null;

  const eventActive = isEventActive();
  const eventNotStarted = isEventNotStarted();
  const eventEnded = isEventEnded();

  return (
    <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 ${
      isMobile ? 'p-0' : 'p-4'
    }`}>
      <div className={`bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 w-full ${
        isMobile 
          ? 'h-full rounded-none overflow-hidden flex flex-col max-w-full' 
          : 'rounded-3xl max-w-5xl h-[90vh] overflow-hidden flex flex-col'
      }`}>
        {/* Nagłówek */}
        <div className="flex-shrink-0">
          <div className={`flex items-center justify-between ${isMobile ? 'p-3' : 'p-4'} border-b border-gray-700/50`}>
            <div>
              <h2 className={`${isMobile ? 'text-base' : 'text-xl'} font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent`}>
                🏆 Base Leaderboard - Grand Season 2026
              </h2>
              <p className={`text-gray-400 ${isMobile ? 'text-xs mt-0.5' : 'text-xs mt-1'}`}>
                April 1st - October 31st, 2026 • 7 Months of Competition
              </p>
            </div>
            <button 
              onClick={onClose}
              className={`${isMobile ? 'w-8 h-8 text-lg' : 'w-12 h-12 text-xl'} flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-xl transition-all p-2`}
            >
              ✕
            </button>
          </div>

          {/* Countdown / Status Banner */}
          <div className={`bg-gradient-to-r ${
            eventNotStarted ? 'from-blue-500/10 to-purple-500/10 border-blue-500/20' :
            eventActive ? 'from-green-500/10 to-emerald-500/10 border-green-500/20' :
            'from-red-500/10 to-orange-500/10 border-red-500/20'
          } border-y p-3`}>
            <div className="text-center">
              {eventNotStarted && (
                <>
                  <h3 className="text-blue-400 font-bold text-sm mb-2">⏰ Countdown to Season Start</h3>
                  <div className={`grid grid-cols-4 gap-2 ${isMobile ? 'max-w-xs' : 'max-w-md'} mx-auto`}>
                    <div className="bg-blue-500/20 rounded-lg p-2 border border-blue-500/30">
                      <div className={`text-blue-300 font-bold ${isMobile ? 'text-base' : 'text-lg'}`}>{timeRemaining.days || 0}</div>
                      <div className="text-blue-200 text-[10px]">Days</div>
                    </div>
                    <div className="bg-purple-500/20 rounded-lg p-2 border border-purple-500/30">
                      <div className={`text-purple-300 font-bold ${isMobile ? 'text-base' : 'text-lg'}`}>{timeRemaining.hours || 0}</div>
                      <div className="text-purple-200 text-[10px]">Hours</div>
                    </div>
                    <div className="bg-cyan-500/20 rounded-lg p-2 border border-cyan-500/30">
                      <div className={`text-cyan-300 font-bold ${isMobile ? 'text-base' : 'text-lg'}`}>{timeRemaining.minutes || 0}</div>
                      <div className="text-cyan-200 text-[10px]">Minutes</div>
                    </div>
                    <div className="bg-green-500/20 rounded-lg p-2 border border-green-500/30">
                      <div className={`text-green-300 font-bold ${isMobile ? 'text-base' : 'text-lg'}`}>{timeRemaining.seconds || 0}</div>
                      <div className="text-green-200 text-[10px]">Seconds</div>
                    </div>
                  </div>
                  <p className="text-blue-300 text-xs mt-2">Get ready! The competition starts soon!</p>
                </>
              )}
              
              {eventActive && (
                <>
                  <h3 className="text-green-400 font-bold text-sm mb-2">🏁 Season in Progress!</h3>
                  <div className={`grid grid-cols-4 gap-2 ${isMobile ? 'max-w-xs' : 'max-w-md'} mx-auto`}>
                    <div className="bg-green-500/20 rounded-lg p-2 border border-green-500/30">
                      <div className={`text-green-300 font-bold ${isMobile ? 'text-base' : 'text-lg'}`}>{timeUntilEnd.days || 0}</div>
                      <div className="text-green-200 text-[10px]">Days Left</div>
                    </div>
                    <div className="bg-emerald-500/20 rounded-lg p-2 border border-emerald-500/30">
                      <div className={`text-emerald-300 font-bold ${isMobile ? 'text-base' : 'text-lg'}`}>{timeUntilEnd.hours || 0}</div>
                      <div className="text-emerald-200 text-[10px]">Hours Left</div>
                    </div>
                    <div className="bg-teal-500/20 rounded-lg p-2 border border-teal-500/30">
                      <div className={`text-teal-300 font-bold ${isMobile ? 'text-base' : 'text-lg'}`}>{timeUntilEnd.minutes || 0}</div>
                      <div className="text-teal-200 text-[10px]">Minutes Left</div>
                    </div>
                    <div className="bg-cyan-500/20 rounded-lg p-2 border border-cyan-500/30">
                      <div className={`text-cyan-300 font-bold ${isMobile ? 'text-base' : 'text-lg'}`}>{timeUntilEnd.seconds || 0}</div>
                      <div className="text-cyan-200 text-[10px]">Seconds Left</div>
                    </div>
                  </div>
                  <p className="text-green-300 text-xs mt-2">🚀 Keep messaging! Every message counts toward your rank!</p>
                </>
              )}
              
              {eventEnded && (
                <>
                  <h3 className="text-red-400 font-bold text-sm mb-2">🏆 Season Ended</h3>
                  <div className="text-center">
                    <div className="text-red-300 text-sm">Thank you for participating!</div>
                    <div className="text-yellow-400 text-xs mt-1">Rewards distribution in progress...</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Główna zawartość */}
        <div className={`flex-1 overflow-y-auto ${isMobile ? 'p-3' : 'p-4'}`}>
          <div className={isMobile ? '' : 'p-4'}>
            {/* Status użytkownika */}
            <div className="bg-gray-700/30 rounded-xl p-4 border border-cyan-500/30 mb-4">
              <h3 className={`text-cyan-400 font-bold ${isMobile ? 'text-sm' : 'text-base'} mb-3 flex items-center gap-2`}>
                <span>👤</span> Your Eligibility Status
              </h3>
              
              {userStatus.loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500 mx-auto mb-2"></div>
                  <div className="text-gray-400 text-sm">Checking your eligibility...</div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className={`flex ${isMobile ? 'flex-col gap-2' : 'flex-wrap gap-2'}`}>
                    <StatusBadge 
                      condition={userStatus.hasNFT} 
                      text={userStatus.hasNFT ? "Genesis NFT Owner" : "No Genesis NFT"} 
                    />
                    <StatusBadge 
                      condition={userStatus.hasEnoughTokens} 
                      text={`${userStatus.hubBalance.toFixed(2)} HUB / ${MIN_TOKENS_REQUIRED} Required`} 
                    />
                    {userSubscriptionTier && userSubscriptionTier !== 'None' && (
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        <span>{userSubscriptionTier === 'Premium' ? '💎' : '⭐'}</span>
                        <span>{userSubscriptionTier} Subscription</span>
                      </div>
                    )}
                  </div>
                  
                  <div className={`text-center p-3 rounded-lg border text-sm ${
                    userStatus.isEligible 
                      ? 'bg-green-500/10 text-green-400 border-green-500/30' 
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>
                    <div className="font-bold">
                      {userStatus.isEligible ? '🎉 You are ELIGIBLE to compete!' : '⚠️ You are NOT eligible yet'}
                    </div>
                    {!userStatus.isEligible && (
                      <div className="text-xs mt-1">
                        {!userStatus.hasNFT && !userStatus.hasEnoughTokens && !userSubscriptionTier && `Get Genesis NFT + ${MIN_TOKENS_REQUIRED} HUB tokens, or buy a subscription`}
                        {!userStatus.hasNFT && userStatus.hasEnoughTokens && !userSubscriptionTier && 'Get Genesis NFT or buy a subscription to qualify'}
                        {userStatus.hasNFT && !userStatus.hasEnoughTokens && !userSubscriptionTier && `Need ${(MIN_TOKENS_REQUIRED - userStatus.hubBalance).toFixed(2)} more HUB tokens or buy a subscription`}
                      </div>
                    )}
                  </div>

                  {userStatus.isEligible && userMessageCount > 0 && (
                    <div className="bg-blue-500/10 rounded-lg p-3 text-center border border-blue-500/30">
                      <div className="text-sm text-gray-300">Your Stats</div>
                      <div className="text-2xl font-bold text-blue-400">{userMessageCount.toLocaleString()}</div>
                      <div className="text-sm text-gray-300 mt-1">total messages sent</div>
                      {userSubscriptionTier && userSubscriptionTier !== 'None' && (
                        <div className="text-xs text-purple-400 mt-2">
                          {userSubscriptionTier === 'Premium' ? '💎' : '⭐'} Active {userSubscriptionTier} subscription - increased daily limits!
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Statystyki */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-3 text-center border border-purple-500/30">
                <div className="text-2xl mb-1">💬</div>
                <div className="text-xl font-bold text-purple-400">{totalMessages.toLocaleString()}</div>
                <div className="text-xs text-gray-400">Total Messages</div>
              </div>
              <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl p-3 text-center border border-yellow-500/30">
                <div className="text-2xl mb-1">💰</div>
                <div className="text-xl font-bold text-yellow-400">${TOTAL_REWARD_POOL.toLocaleString()}</div>
                <div className="text-xs text-gray-400">Total USDC Pool</div>
              </div>
            </div>

            {/* Informacja o aktualizacji */}
            {lastUpdate && (
              <div className="text-center text-xs text-gray-500 mb-3">
                Last updated: {formatTimeAgo(lastUpdate)} • Rankings update every 30 minutes
              </div>
            )}

            {/* Nagłówek nagród */}
            <div className="mb-4">
              <div className="text-center mb-3">
                <div className={`${isMobile ? 'text-2xl' : 'text-3xl'} mb-2`}>🏆</div>
                <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-white mb-1`}>
                  Reward Distribution
                </h2>
                <p className="text-gray-400 text-sm">Top 100 participants share ${TOTAL_REWARD_POOL.toLocaleString()} USDC</p>
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm py-2 px-4 font-bold rounded-xl inline-block mt-2">
                  🎯 Top 10 get MASSIVE rewards! 🎯
                </div>
              </div>
            </div>

            {/* Tabela nagród */}
            <div className="bg-gray-700/30 rounded-xl p-4 border border-yellow-500/30 mb-4">
              <h3 className={`text-yellow-400 font-bold ${isMobile ? 'text-sm' : 'text-base'} mb-3 flex items-center gap-2`}>
                <span>💰</span> Prize Breakdown
              </h3>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rank => (
                  <RewardRow key={rank} rank={rank} reward={rewardStructure[rank]} />
                ))}
                <div className="pt-2 mt-2 border-t border-gray-700/50">
                  <div className="flex items-center justify-between py-1 text-sm text-gray-400">
                    <span>Places 11-100</span>
                    <span>Proportional distribution (total $3,700)</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 text-center">
                    Higher rank = higher reward • All participants in top 100 receive USDC rewards!
                  </div>
                </div>
              </div>
            </div>

            {/* LIVE RANKING */}
            <div className="bg-gray-700/30 rounded-xl p-4 border border-blue-500/30 mb-4">
              <h3 className={`text-blue-400 font-bold ${isMobile ? 'text-sm' : 'text-base'} mb-3 flex items-center gap-2`}>
                <span>📊</span> Live Rankings
                {!rankingLoading && allUsersStats.length > 0 && (
                  <span className="text-xs text-green-400 ml-2">
                    {allUsersStats.length} participants
                  </span>
                )}
              </h3>
              
              <RankingTable />
              
              {eventActive && !rankingLoading && allUsersStats.length > 0 && (
                <div className="text-center text-xs text-green-400 mt-3">
                  ✅ Messages are being counted from April 1st, 2026!
                </div>
              )}
            </div>

            {/* Informacje o sezonie */}
            <div className="bg-gray-700/30 rounded-xl p-4 border border-purple-500/30">
              <h3 className={`text-purple-400 font-bold ${isMobile ? 'text-sm' : 'text-base'} mb-3 flex items-center gap-2`}>
                <span>📅</span> Grand Season 2026 Details
              </h3>
              <ul className={`space-y-2 text-gray-300 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span><strong>Season Duration:</strong> April 1st - October 31st, 2026 (7 months)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span><strong>Network:</strong> Base Mainnet</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span><strong>Scoring:</strong> Total messages sent via HUB Chat contract</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span><strong>Eligibility:</strong> Genesis NFT + 100 HUB tokens OR Active Subscription</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span><strong>Total Prize Pool:</strong> $20,000 USDC</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span><strong>Rewards:</strong> Top 100 participants receive USDC rewards</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span><strong>Data Update:</strong> Rankings update every 30 minutes</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`flex-shrink-0 border-t border-gray-700/50 bg-gray-800/30 ${
          isMobile ? 'p-2' : 'p-3'
        }`}>
          <div className={`text-center text-gray-400 ${isMobile ? 'text-[9px]' : 'text-[10px]'}`}>
            <p>Base Network Leaderboard • Grand Season 2026: April 1 - October 31 • $20,000 USDC Total Rewards</p>
            <p className={isMobile ? 'mt-0.5' : 'mt-1'}>Data updated every 30 minutes • Rankings based on verified message count from HUB Chat contract</p>
            <p className="text-yellow-500/70 mt-1">🏆 Top 10 get MASSIVE rewards! 🏆</p>
            {userStatsError && (
              <p className="text-red-400 mt-1 text-[8px]">Error loading message data. Please ensure you're connected to Base network.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BaseLeaderboardModal;
