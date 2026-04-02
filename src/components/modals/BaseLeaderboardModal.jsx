import { useState, useEffect, useCallback } from 'react';
import { useReadContract, useAccount } from 'wagmi';
import { useNetwork } from '../../hooks/useNetwork';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

// Pełne ABI kontraktu HUBChatRewards
const HUB_CHAT_ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"cooldown","type":"uint256"}],"name":"CooldownUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"utcDay","type":"uint256"}],"name":"DailyLimitReset","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"free","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"basic","type":"uint256"}],"name":"LimitsUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"string","name":"content","type":"string"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"reward","type":"uint256"}],"name":"MessageSent","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"basic","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"premium","type":"uint256"}],"name":"PricesUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"duration","type":"uint256"}],"name":"SubscriptionDurationUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"enum HUBChatRewards.Tier","name":"tier","type":"uint8"},{"indexed":false,"internalType":"uint256","name":"expiry","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"paidAmount","type":"uint256"}],"name":"SubscriptionPurchased","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":false,"internalType":"uint256","name":"amountHUB","type":"uint256"}],"name":"TokensDeposited","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"bool","name":"status","type":"bool"}],"name":"WhitelistUpdated","type":"event"},{"inputs":[],"name":"DEV_ACCOUNT","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"HUB_TOKEN","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MAX_MESSAGE_LENGTH","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"REWARD_PER_MESSAGE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"UNLIMITED_FLAG","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"USDC_TOKEN","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"addToWhitelist","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"basicDailyLimit","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"basicPriceUSDC","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"blacklist","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"blockUser","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"buyBasicSubscription","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"buyPremiumSubscription","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"canSendMessage","outputs":[{"internalType":"bool","name":"canSend","type":"bool"},{"internalType":"string","name":"reason","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"checkWhitelist","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"cooldownSeconds","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"depositHUBTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"emergencyWithdrawHUB","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"forceResetUserLimit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"freeDailyLimit","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getContractStats","outputs":[{"internalType":"uint256","name":"totalMessages","type":"uint256"},{"internalType":"uint256","name":"hubBalance","type":"uint256"},{"internalType":"uint256","name":"usdcBalance","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getCurrentUTCDay","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getNextResetTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getRemainingDailyMessages","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getSubscriptionInfo","outputs":[{"internalType":"enum HUBChatRewards.Tier","name":"tier","type":"uint8"},{"internalType":"uint256","name":"expiry","type":"uint256"},{"internalType":"bool","name":"whitelisted","type":"bool"},{"internalType":"bool","name":"isActive","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getUserBasicStats","outputs":[{"internalType":"uint256","name":"totalMessages","type":"uint256"},{"internalType":"uint256","name":"totalEarned","type":"uint256"},{"internalType":"uint256","name":"lastMessageTime","type":"uint256"},{"internalType":"bool","name":"isBlocked","type":"bool"},{"internalType":"uint256","name":"messagesToday","type":"uint256"},{"internalType":"uint256","name":"lastResetDay","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getUserSubscriptionInfo","outputs":[{"internalType":"uint256","name":"remainingMessages","type":"uint256"},{"internalType":"enum HUBChatRewards.Tier","name":"tier","type":"uint8"},{"internalType":"bool","name":"whitelisted","type":"bool"},{"internalType":"uint256","name":"subscriptionExpiry","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getWhitelistedAddresses","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"paidSubscriptions","outputs":[{"internalType":"uint256","name":"expiry","type":"uint256"},{"internalType":"enum HUBChatRewards.Tier","name":"tier","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"paused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"premiumPriceUSDC","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"removeFromWhitelist","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_content","type":"string"}],"name":"sendMessage","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_seconds","type":"uint256"}],"name":"setCooldown","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_free","type":"uint256"},{"internalType":"uint256","name":"_basic","type":"uint256"}],"name":"setLimits","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_basic","type":"uint256"},{"internalType":"uint256","name":"_premium","type":"uint256"}],"name":"setPrices","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_seconds","type":"uint256"}],"name":"setSubscriptionDuration","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"subscriptionDuration","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"unblockUser","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"unpause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"userStats","outputs":[{"internalType":"uint256","name":"totalMessages","type":"uint256"},{"internalType":"uint256","name":"totalEarned","type":"uint256"},{"internalType":"uint256","name":"lastMessageTime","type":"uint256"},{"internalType":"bool","name":"isBlocked","type":"bool"},{"internalType":"uint256","name":"messagesToday","type":"uint256"},{"internalType":"uint256","name":"lastResetDay","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"whitelist","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"withdrawUSDC","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];

const HUB_CHAT_CONTRACT = "0x8ea3818294887376673e4e64fBd518598e3a2306";

// Utworzenie publicznego klienta z oficjalnym RPC Base Mainnet
const publicClient = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org'),
});

const BaseLeaderboardModal = ({ isOpen, onClose, currentUser, isMobile = false }) => {
  // State dla rankingu
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [leaderboardLastUpdate, setLeaderboardLastUpdate] = useState(null);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [totalMessagesCount, setTotalMessagesCount] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState('');
  const [error, setError] = useState(null);
  
  // State dla timera i użytkownika
  const [timeRemaining, setTimeRemaining] = useState({});
  const [timeUntilEnd, setTimeUntilEnd] = useState({});
  const [userRank, setUserRank] = useState(null);
  const [userMessageCount, setUserMessageCount] = useState(0);
  const [userSubscriptionTier, setUserSubscriptionTier] = useState(null);
  const [userStatus, setUserStatus] = useState({
    hasNFT: false,
    hasEnoughTokens: false,
    hubBalance: 0,
    isEligible: false,
    loading: true
  });
  
  const { isBase } = useNetwork();
  const { address } = useAccount();
  
  // Stałe
  const CACHE_KEY = 'base_leaderboard_cache_v2';
  const CACHE_DURATION = 24 * 60 * 60 * 1000;
  
  // Daty sezonu
  const startDate = new Date('2026-04-01T00:00:00');
  const endDate = new Date('2026-10-31T23:59:59');
  const MIN_TOKENS_REQUIRED = 100;
  const GENESIS_NFT_CONTRACT = "0xdAf7B15f939F6a8faf87d338010867883AAB366a";
  const TOTAL_REWARD_POOL = 20000;
  
  const rewardStructure = {
    1: 5000, 2: 3000, 3: 2000, 4: 1500, 5: 1200,
    6: 1000, 7: 800, 8: 700, 9: 600, 10: 500,
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
  
  // Funkcja do pobierania wszystkich adresów z eventów MessageSent
  const getAllUserAddressesFromEvents = useCallback(async () => {
    try {
      setLoadingProgress('Fetching message events from Base Mainnet via official RPC...');
      
      // Pobierz wszystkie eventy MessageSent z głównej sieci Base
      const events = await publicClient.getContractEvents({
        address: HUB_CHAT_CONTRACT,
        abi: HUB_CHAT_ABI,
        eventName: 'MessageSent',
        fromBlock: 0n,
        toBlock: 'latest',
      });
      
      console.log(`Found ${events.length} total messages on Base Mainnet`);
      
      // Wyciągnij unikalnych senderów
      const uniqueSenders = new Set();
      events.forEach(event => {
        if (event.args && event.args.sender) {
          uniqueSenders.add(event.args.sender);
        }
      });
      
      const userAddresses = Array.from(uniqueSenders);
      console.log(`Found ${userAddresses.length} unique users on Base Mainnet`);
      
      return { userAddresses, totalMessages: events.length };
      
    } catch (err) {
      console.error('Error fetching events from Base Mainnet:', err);
      throw err;
    }
  }, []);
  
  // Funkcja do pobierania statystyk dla listy adresów
  const fetchStatsForUsers = useCallback(async (userAddresses, onProgress) => {
    const results = [];
    const batchSize = 10; // Małe batche dla RPC
    
    for (let i = 0; i < userAddresses.length; i += batchSize) {
      const batch = userAddresses.slice(i, Math.min(i + batchSize, userAddresses.length));
      
      if (onProgress) {
        onProgress(i + batch.length, userAddresses.length);
      }
      
      const batchPromises = batch.map(async (walletAddress) => {
        try {
          const stats = await publicClient.readContract({
            address: HUB_CHAT_CONTRACT,
            abi: HUB_CHAT_ABI,
            functionName: 'getUserBasicStats',
            args: [walletAddress],
          });
          
          return {
            walletAddress: walletAddress,
            totalMessages: Number(stats[0]),
            totalEarned: Number(stats[1]),
            lastMessageTime: Number(stats[2]),
            isBlocked: stats[3],
          };
        } catch (err) {
          console.error(`Error fetching stats for ${walletAddress}:`, err);
          return null;
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      const validResults = batchResults.filter(r => r !== null && r.totalMessages > 0);
      results.push(...validResults);
      
      // Opóźnienie między batchami
      if (i + batchSize < userAddresses.length) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
    
    return results;
  }, []);
  
  // Główna funkcja aktualizacji rankingu
  const updateLeaderboard = useCallback(async (forceRefresh = false) => {
    // Sprawdź cache
    if (!forceRefresh) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const { data, timestamp, totalMessagesCount: cachedMsgCount } = JSON.parse(cached);
          const age = Date.now() - timestamp;
          
          if (age < CACHE_DURATION && data && data.length > 0) {
            console.log('Using cached data from Base Mainnet');
            setLeaderboardData(data);
            setTotalParticipants(data.length);
            setTotalMessagesCount(cachedMsgCount);
            setLeaderboardLastUpdate(new Date(timestamp));
            setError(null);
            return;
          }
        } catch (e) {
          console.error('Cache read error:', e);
        }
      }
    }
    
    setLoadingLeaderboard(true);
    setError(null);
    setLoadingProgress('Starting...');
    
    try {
      // Krok 1: Pobierz wszystkich użytkowników z eventów
      const { userAddresses, totalMessages } = await getAllUserAddressesFromEvents();
      setTotalMessagesCount(totalMessages);
      
      if (userAddresses.length === 0) {
        setLeaderboardData([]);
        setTotalParticipants(0);
        setLoadingLeaderboard(false);
        return;
      }
      
      // Krok 2: Pobierz statystyki dla każdego użytkownika
      setLoadingProgress(`Fetching stats for ${userAddresses.length} users from Base Mainnet...`);
      const usersStats = await fetchStatsForUsers(userAddresses, (processed, total) => {
        setLoadingProgress(`Processing ${processed}/${total} users from Base Mainnet...`);
      });
      
      // Krok 3: Sortuj według liczby wiadomości
      const sorted = usersStats.sort((a, b) => b.totalMessages - a.totalMessages);
      
      // Krok 4: Dodaj ranking
      const withRanking = sorted.map((user, index) => ({
        ...user,
        rank: index + 1
      }));
      
      // Krok 5: Znajdź rangę bieżącego użytkownika
      if (currentUser?.walletAddress || address) {
        const userAddress = (currentUser?.walletAddress || address).toLowerCase();
        const userEntry = withRanking.find(u => u.walletAddress.toLowerCase() === userAddress);
        if (userEntry) {
          setUserRank(userEntry.rank);
        } else {
          setUserRank(null);
        }
      }
      
      // Krok 6: Zapisz w cache
      const cacheData = {
        data: withRanking,
        timestamp: Date.now(),
        totalMessagesCount: totalMessages,
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      
      setLeaderboardData(withRanking);
      setTotalParticipants(withRanking.length);
      setLeaderboardLastUpdate(new Date());
      
      console.log(`Leaderboard updated from Base Mainnet: ${withRanking.length} users`);
      
    } catch (err) {
      console.error('Error updating leaderboard from Base Mainnet:', err);
      setError(err.message);
      
      // Spróbuj użyć starego cache
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const { data, timestamp, totalMessagesCount: cachedMsgCount } = JSON.parse(cached);
          if (data && data.length > 0) {
            setLeaderboardData(data);
            setTotalParticipants(data.length);
            setTotalMessagesCount(cachedMsgCount);
            setLeaderboardLastUpdate(new Date(timestamp));
            setError(null);
          }
        } catch (e) {}
      }
    } finally {
      setLoadingLeaderboard(false);
      setLoadingProgress('');
    }
  }, [getAllUserAddressesFromEvents, fetchStatsForUsers, currentUser, address]);
  
  // Auto-odświeżanie co 24h
  useEffect(() => {
    if (!isOpen || !isBase) return;
    
    updateLeaderboard();
    
    const interval = setInterval(() => {
      updateLeaderboard(true);
    }, CACHE_DURATION);
    
    return () => clearInterval(interval);
  }, [isOpen, isBase, updateLeaderboard]);
  
  // Timer countdown
  useEffect(() => {
    if (!isOpen) return;
    
    const calculateTimeRemaining = () => {
      const now = new Date();
      const startDiff = startDate.getTime() - now.getTime();
      if (startDiff > 0) {
        setTimeRemaining({
          days: Math.floor(startDiff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((startDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((startDiff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((startDiff % (1000 * 60)) / 1000)
        });
        setTimeUntilEnd({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        const endDiff = endDate.getTime() - now.getTime();
        if (endDiff > 0) {
          setTimeUntilEnd({
            days: Math.floor(endDiff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((endDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((endDiff % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((endDiff % (1000 * 60)) / 1000)
          });
        } else {
          setTimeUntilEnd({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        }
      }
    };
    
    calculateTimeRemaining();
    const timer = setInterval(calculateTimeRemaining, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);
  
  // Odczyt statystyk kontraktu przez wagmi
  const { data: contractStats } = useReadContract({
    address: HUB_CHAT_CONTRACT,
    abi: HUB_CHAT_ABI,
    functionName: 'getContractStats',
    query: { enabled: isOpen && isBase },
  });
  
  // Odczyt statystyk użytkownika przez wagmi
  const { data: userStatsData } = useReadContract({
    address: HUB_CHAT_CONTRACT,
    abi: HUB_CHAT_ABI,
    functionName: 'getUserBasicStats',
    args: [currentUser?.walletAddress || address],
    query: { enabled: (isOpen && isBase) && !!(currentUser?.walletAddress || address) },
  });
  
  // Odczyt subskrypcji przez wagmi
  const { data: subscriptionInfo } = useReadContract({
    address: HUB_CHAT_CONTRACT,
    abi: HUB_CHAT_ABI,
    functionName: 'getUserSubscriptionInfo',
    args: [currentUser?.walletAddress || address],
    query: { enabled: (isOpen && isBase) && !!(currentUser?.walletAddress || address) },
  });
  
  // Odczyt NFT przez publicClient (bo to inny kontrakt)
  const [nftBalanceData, setNftBalanceData] = useState(null);
  const [nftLoading, setNftLoading] = useState(false);
  
  useEffect(() => {
    const fetchNFTBalance = async () => {
      if (!currentUser?.walletAddress || !isOpen || !isBase) return;
      
      setNftLoading(true);
      try {
        const balance = await publicClient.readContract({
          address: GENESIS_NFT_CONTRACT,
          abi: NFT_ABI,
          functionName: 'balanceOf',
          args: [currentUser.walletAddress],
        });
        setNftBalanceData(balance);
      } catch (error) {
        console.error("Error fetching NFT balance:", error);
        setNftBalanceData(0n);
      } finally {
        setNftLoading(false);
      }
    };
    
    fetchNFTBalance();
  }, [currentUser?.walletAddress, isOpen, isBase]);
  
  // Aktualizacja message count użytkownika
  useEffect(() => {
    if (userStatsData && Array.isArray(userStatsData) && userStatsData.length > 0) {
      setUserMessageCount(Number(userStatsData[0]));
    }
  }, [userStatsData]);
  
  // Aktualizacja tieru subskrypcji
  useEffect(() => {
    if (subscriptionInfo && Array.isArray(subscriptionInfo) && subscriptionInfo.length > 0) {
      const tier = Number(subscriptionInfo[1]);
      const tierNames = ['None', 'Free', 'Basic', 'Premium'];
      setUserSubscriptionTier(tierNames[tier] || 'None');
    }
  }, [subscriptionInfo]);
  
  // Sprawdzanie statusu użytkownika
  useEffect(() => {
    if (!isOpen || !currentUser || !isBase) return;
    
    const checkEligibility = async () => {
      try {
        setUserStatus(prev => ({ ...prev, loading: true }));
        const hubBalance = parseFloat(currentUser?.balance || '0');
        const hasEnoughTokens = hubBalance >= MIN_TOKENS_REQUIRED;
        let hasNFT = false;
        if (nftBalanceData !== undefined && nftBalanceData !== null) {
          hasNFT = Number(nftBalanceData) > 0;
        }
        const hasActiveSubscription = userSubscriptionTier && userSubscriptionTier !== 'None';
        const isEligible = (hasNFT && hasEnoughTokens) || hasActiveSubscription;
        setUserStatus({
          hasNFT,
          hasEnoughTokens,
          hubBalance,
          isEligible,
          loading: nftLoading
        });
      } catch (error) {
        console.error("Error checking eligibility:", error);
        setUserStatus(prev => ({ ...prev, loading: false }));
      }
    };
    
    checkEligibility();
  }, [isOpen, currentUser, isBase, nftBalanceData, nftLoading, userSubscriptionTier]);
  
  // Funkcje pomocnicze
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  const getRewardForRank = (rank) => {
    if (rank <= 10) return rewardStructure[rank];
    if (rank <= 100) {
      const remainingPool = 3700;
      const positionsFrom11 = rank - 10;
      const weight = (91 - positionsFrom11) / 4095;
      return Math.floor(weight * remainingPool);
    }
    return 0;
  };
  
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
  
  const handleRefresh = () => {
    updateLeaderboard(true);
  };
  
  // Komponenty
  const StatusBadge = ({ condition, text }) => (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
      condition ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
    }`}>
      <span>{condition ? '✅' : '❌'}</span>
      <span>{text}</span>
    </div>
  );
  
  const RewardRow = ({ rank, reward }) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-700/30">
      <div className="flex items-center gap-2">
        <div className={`w-8 text-center font-bold ${
          rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-gray-300' : rank === 3 ? 'text-amber-600' : rank <= 10 ? 'text-cyan-400' : 'text-gray-400'
        }`}>
          #{rank}
        </div>
        <div className="text-sm">{rank === 1 && '🥇 '}{rank === 2 && '🥈 '}{rank === 3 && '🥉 '}Place</div>
      </div>
      <div className="font-bold text-green-400">${reward.toLocaleString()} USDC</div>
    </div>
  );
  
  // Renderowanie gdy nie Base
  if (!isBase && isOpen) {
    return (
      <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 ${isMobile ? 'p-0' : 'p-4'}`}>
        <div className={`bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 w-full ${isMobile ? 'h-full rounded-none p-4 max-w-full' : 'rounded-3xl p-6 max-w-md'}`}>
          <div className="text-center">
            <div className={`${isMobile ? 'text-3xl' : 'text-4xl'} mb-4`}>🌐</div>
            <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-blue-400 mb-4`}>Base Leaderboard</h2>
            <p className="text-gray-300 mb-6">Please switch to Base Mainnet to view the leaderboard.</p>
            <button onClick={onClose} className={`${isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3'} bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-all`}>Close</button>
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
    <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 ${isMobile ? 'p-0' : 'p-4'}`}>
      <div className={`bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 w-full ${isMobile ? 'h-full rounded-none overflow-hidden flex flex-col max-w-full' : 'rounded-3xl max-w-5xl h-[90vh] overflow-hidden flex flex-col'}`}>
        
        {/* Header */}
        <div className="flex-shrink-0">
          <div className={`flex items-center justify-between ${isMobile ? 'p-3' : 'p-4'} border-b border-gray-700/50`}>
            <div className="flex-1">
              <h2 className={`${isMobile ? 'text-base' : 'text-xl'} font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent`}>
                🏆 Base Mainnet Leaderboard - Grand Season 2026
              </h2>
              <p className={`text-gray-400 ${isMobile ? 'text-xs mt-0.5' : 'text-xs mt-1'}`}>
                April 1st - October 31st, 2026 • {totalParticipants} participants • {totalMessagesCount.toLocaleString()} messages
              </p>
              {leaderboardLastUpdate && (
                <p className="text-gray-500 text-[10px] mt-0.5">
                  Last update: {leaderboardLastUpdate.toLocaleString()} • Auto-refresh every 24h
                </p>
              )}
              {error && (
                <p className="text-red-400 text-[10px] mt-0.5">Error: {error}</p>
              )}
            </div>
            <button
              onClick={handleRefresh}
              disabled={loadingLeaderboard}
              className={`${isMobile ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'} bg-cyan-500/20 hover:bg-cyan-500/30 rounded-lg transition-all disabled:opacity-50`}
            >
              {loadingLeaderboard ? '⟳' : '⟳ Refresh'}
            </button>
            <button onClick={onClose} className={`${isMobile ? 'w-8 h-8 text-lg' : 'w-12 h-12 text-xl'} flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-xl transition-all ml-2`}>✕</button>
          </div>
          
          {/* Countdown Banner */}
          <div className={`bg-gradient-to-r ${eventNotStarted ? 'from-blue-500/10 to-purple-500/10 border-blue-500/20' : eventActive ? 'from-green-500/10 to-emerald-500/10 border-green-500/20' : 'from-red-500/10 to-orange-500/10 border-red-500/20'} border-y p-3`}>
            <div className="text-center">
              {eventNotStarted && (
                <>
                  <h3 className="text-blue-400 font-bold text-sm mb-2">⏰ Countdown to Season Start</h3>
                  <div className={`grid grid-cols-4 gap-2 ${isMobile ? 'max-w-xs' : 'max-w-md'} mx-auto`}>
                    <div className="bg-blue-500/20 rounded-lg p-2"><div className={`text-blue-300 font-bold ${isMobile ? 'text-base' : 'text-lg'}`}>{timeRemaining.days || 0}</div><div className="text-blue-200 text-[10px]">Days</div></div>
                    <div className="bg-purple-500/20 rounded-lg p-2"><div className={`text-purple-300 font-bold ${isMobile ? 'text-base' : 'text-lg'}`}>{timeRemaining.hours || 0}</div><div className="text-purple-200 text-[10px]">Hours</div></div>
                    <div className="bg-cyan-500/20 rounded-lg p-2"><div className={`text-cyan-300 font-bold ${isMobile ? 'text-base' : 'text-lg'}`}>{timeRemaining.minutes || 0}</div><div className="text-cyan-200 text-[10px]">Minutes</div></div>
                    <div className="bg-green-500/20 rounded-lg p-2"><div className={`text-green-300 font-bold ${isMobile ? 'text-base' : 'text-lg'}`}>{timeRemaining.seconds || 0}</div><div className="text-green-200 text-[10px]">Seconds</div></div>
                  </div>
                </>
              )}
              {eventActive && (
                <>
                  <h3 className="text-green-400 font-bold text-sm mb-2">🏁 Season in Progress on Base Mainnet!</h3>
                  <div className={`grid grid-cols-4 gap-2 ${isMobile ? 'max-w-xs' : 'max-w-md'} mx-auto`}>
                    <div className="bg-green-500/20 rounded-lg p-2"><div className={`text-green-300 font-bold ${isMobile ? 'text-base' : 'text-lg'}`}>{timeUntilEnd.days || 0}</div><div className="text-green-200 text-[10px]">Days Left</div></div>
                    <div className="bg-emerald-500/20 rounded-lg p-2"><div className={`text-emerald-300 font-bold ${isMobile ? 'text-base' : 'text-lg'}`}>{timeUntilEnd.hours || 0}</div><div className="text-emerald-200 text-[10px]">Hours Left</div></div>
                    <div className="bg-teal-500/20 rounded-lg p-2"><div className={`text-teal-300 font-bold ${isMobile ? 'text-base' : 'text-lg'}`}>{timeUntilEnd.minutes || 0}</div><div className="text-teal-200 text-[10px]">Minutes Left</div></div>
                    <div className="bg-cyan-500/20 rounded-lg p-2"><div className={`text-cyan-300 font-bold ${isMobile ? 'text-base' : 'text-lg'}`}>{timeUntilEnd.seconds || 0}</div><div className="text-cyan-200 text-[10px]">Seconds Left</div></div>
                  </div>
                </>
              )}
              {eventEnded && (
                <h3 className="text-red-400 font-bold text-sm">🏆 Season Ended - Rewards Distribution in Progress</h3>
              )}
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className={`flex-1 overflow-y-auto ${isMobile ? 'p-3' : 'p-4'}`}>
          
          {/* User Status */}
          <div className="bg-gray-700/30 rounded-xl p-4 border border-cyan-500/30 mb-4">
            <h3 className={`text-cyan-400 font-bold ${isMobile ? 'text-sm' : 'text-base'} mb-3 flex items-center gap-2`}>👤 Your Eligibility Status</h3>
            {userStatus.loading ? (
              <div className="text-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500 mx-auto mb-2"></div><div className="text-gray-400 text-sm">Checking...</div></div>
            ) : (
              <div className="space-y-3">
                <div className={`flex ${isMobile ? 'flex-col gap-2' : 'flex-wrap gap-2'}`}>
                  <StatusBadge condition={userStatus.hasNFT} text={userStatus.hasNFT ? "Genesis NFT Owner" : "No Genesis NFT"} />
                  <StatusBadge condition={userStatus.hasEnoughTokens} text={`${userStatus.hubBalance.toFixed(2)} HUB / ${MIN_TOKENS_REQUIRED}`} />
                  {userSubscriptionTier && userSubscriptionTier !== 'None' && (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                      <span>{userSubscriptionTier === 'Premium' ? '💎' : '⭐'}</span>
                      <span>{userSubscriptionTier} Subscription</span>
                    </div>
                  )}
                </div>
                <div className={`text-center p-3 rounded-lg border text-sm ${userStatus.isEligible ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}`}>
                  {userStatus.isEligible ? '🎉 You are ELIGIBLE to compete!' : '⚠️ You are NOT eligible yet'}
                </div>
                {userRank && (
                  <div className="bg-blue-500/10 rounded-lg p-3 text-center border border-blue-500/30">
                    <div className="text-sm text-gray-300">Your Current Rank on Base Mainnet</div>
                    <div className="text-3xl font-bold text-blue-400">#{userRank}</div>
                    <div className="text-sm text-gray-300 mt-1">{userMessageCount.toLocaleString()} total messages</div>
                    {userRank <= 100 && <div className="text-green-400 text-xs mt-2">🏆 You're in top 100! Keep going!</div>}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Leaderboard Table */}
          <div className="bg-gray-700/30 rounded-xl p-4 border border-cyan-500/30 mb-4">
            <h3 className={`text-cyan-400 font-bold ${isMobile ? 'text-sm' : 'text-base'} mb-3 flex items-center gap-2`}>
              <span>🏆</span> Live Ranking - Top 100 on Base Mainnet
            </h3>
            
            {loadingLeaderboard ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-2"></div>
                <div className="text-gray-400 text-sm">{loadingProgress || 'Loading leaderboard from Base Mainnet...'}</div>
                <div className="text-gray-500 text-xs mt-2">First load may take 10-30 seconds</div>
              </div>
            ) : leaderboardData.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">💬</div>
                <p className="text-gray-400">No messages sent yet on Base Mainnet</p>
                <p className="text-xs text-gray-500 mt-2">Be the first to send a message!</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {leaderboardData.slice(0, 100).map((user) => {
                  const reward = getRewardForRank(user.rank);
                  const isCurrentUser = (currentUser?.walletAddress || address)?.toLowerCase() === user.walletAddress.toLowerCase();
                  
                  return (
                    <div
                      key={user.walletAddress}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                        isCurrentUser ? 'bg-cyan-500/20 border border-cyan-500/40' : 'bg-gray-800/50 hover:bg-gray-700/50'
                      }`}
                    >
                      <div className={`w-12 text-center font-bold ${
                        user.rank === 1 ? 'text-yellow-400 text-xl' :
                        user.rank === 2 ? 'text-gray-300 text-lg' :
                        user.rank === 3 ? 'text-amber-600 text-lg' :
                        'text-gray-400'
                      }`}>
                        {user.rank === 1 && '🥇'}
                        {user.rank === 2 && '🥈'}
                        {user.rank === 3 && '🥉'}
                        {user.rank > 3 && `#${user.rank}`}
                      </div>
                      
                      <div className="flex-1">
                        <div className="text-white font-medium">
                          {formatAddress(user.walletAddress)}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs bg-cyan-500 text-white px-2 py-0.5 rounded">You</span>
                          )}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {user.totalMessages.toLocaleString()} messages
                        </div>
                      </div>
                      
                      {reward > 0 && (
                        <div className="text-right">
                          <div className="text-green-400 font-bold">${reward.toLocaleString()} USDC</div>
                          {user.rank <= 10 && <div className="text-yellow-500 text-xs">🏆 Prize</div>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            
            {!loadingLeaderboard && leaderboardData.length > 100 && (
              <p className="text-center text-gray-400 text-xs mt-3">
                Showing top 100 of {leaderboardData.length} participants
              </p>
            )}
          </div>
          
          {/* Prize Breakdown */}
          <div className="bg-gray-700/30 rounded-xl p-4 border border-yellow-500/30 mb-4">
            <h3 className={`text-yellow-400 font-bold ${isMobile ? 'text-sm' : 'text-base'} mb-3 flex items-center gap-2`}>💰 Prize Breakdown</h3>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rank => (
                <RewardRow key={rank} rank={rank} reward={rewardStructure[rank]} />
              ))}
              <div className="pt-2 mt-2 border-t border-gray-700/50">
                <div className="flex items-center justify-between py-1 text-sm text-gray-400">
                  <span>Places 11-100</span>
                  <span>Proportional distribution ($3,700 total)</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* How It Works */}
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-4 border border-blue-500/30">
            <h3 className={`text-blue-400 font-bold ${isMobile ? 'text-sm' : 'text-base'} mb-3 flex items-center gap-2`}>📊 How It Works</h3>
            <p className="text-gray-300 text-sm mb-3">
              Rankings are based on total messages sent on Base Mainnet through the HUB Chat contract. 
              The leaderboard updates every 24 hours. Top 100 participants at the end of the season (October 31st, 2026) will receive USDC rewards!
            </p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-yellow-500/10 rounded p-2 text-center"><div className="text-yellow-400 font-bold">🥇 #1</div><div>$5,000 USDC</div></div>
              <div className="bg-gray-400/10 rounded p-2 text-center"><div className="text-gray-300 font-bold">🥈 #2-3</div><div>$3,000 - $2,000</div></div>
              <div className="bg-cyan-500/10 rounded p-2 text-center"><div className="text-cyan-400 font-bold">🎯 #4-10</div><div>$1,500 - $500</div></div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className={`flex-shrink-0 border-t border-gray-700/50 bg-gray-800/30 ${isMobile ? 'p-2' : 'p-3'}`}>
          <div className={`text-center text-gray-400 ${isMobile ? 'text-[9px]' : 'text-[10px]'}`}>
            <p>Base Mainnet Leaderboard • Grand Season 2026: April 1 - October 31 • $20,000 USDC Total Rewards</p>
            <p className="text-yellow-500/70 mt-1">🏆 Top 10 get MASSIVE rewards! 🏆</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BaseLeaderboardModal;
