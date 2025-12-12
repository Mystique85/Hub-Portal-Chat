import { useState, useEffect, useMemo, useCallback } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useReadContracts } from 'wagmi';
import { useNetwork } from './useNetwork';
import { parseEther, formatEther } from 'viem';

const STAKING_CONTRACT_ADDRESS = '0xd4ca2b40cEAEC7006Fa38c3Bb07ceD449b9bF7DB';

const STAKING_ABI = [
  {"inputs":[],"stateMutability":"nonpayable","type":"constructor"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Funded","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"string","name":"eventType","type":"string"},{"indexed":false,"internalType":"bytes","name":"data","type":"bytes"}],"name":"HUBPortalChatEvent","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint8","name":"tier","type":"uint8"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"PendingClaimed","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint8","name":"tier","type":"uint8"},{"indexed":false,"internalType":"uint256","name":"stakeId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RewardClaimed","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint8","name":"tier","type":"uint8"},{"indexed":false,"internalType":"uint256","name":"stakeId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"start","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"finish","type":"uint256"}],"name":"StakeCreated","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint8","name":"tier","type":"uint8"},{"indexed":false,"internalType":"uint256","name":"stakeId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"reward","type":"uint256"}],"name":"Unstaked","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"string","name":"action","type":"string"},{"indexed":false,"internalType":"uint8","name":"tier","type":"uint8"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"UserAction","type":"event"},
  {"inputs":[],"name":"APR_12M","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"APR_3M","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"APR_6M","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"BPS","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"HUB","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"MIN_STAKE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"MONTH","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"availableRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint8","name":"tierId","type":"uint8"}],"name":"claimAllRewardsForTier","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint8","name":"tierId","type":"uint8"}],"name":"claimPending","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"stakeIndex","type":"uint256"},{"internalType":"uint8","name":"tierId","type":"uint8"}],"name":"claimReward","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint8","name":"tierId","type":"uint8"}],"name":"claimable","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"string","name":"eventType","type":"string"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"emitPortalChatEvent","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"fundRewards","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getActiveStakeAmounts","outputs":[{"internalType":"uint256","name":"amount3m","type":"uint256"},{"internalType":"uint256","name":"amount6m","type":"uint256"},{"internalType":"uint256","name":"amount12m","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"getAllStakers","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getHUBPortalUserData","outputs":[{"internalType":"uint256","name":"totalStakedHUB","type":"uint256"},{"internalType":"uint256","name":"totalEarnedHUB","type":"uint256"},{"internalType":"uint256","name":"availableToClaim","type":"uint256"},{"internalType":"bool","name":"hasAnyActiveStake","type":"bool"},{"internalType":"uint256[3]","name":"tierStatus","type":"uint256[3]"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"getHUBTokenAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"pure","type":"function"},
  {"inputs":[],"name":"getPoolInfo","outputs":[{"internalType":"uint256","name":"totalStakedAmount","type":"uint256"},{"internalType":"uint256","name":"availableRewardAmount","type":"uint256"},{"internalType":"uint256","name":"totalRewardsPaid","type":"uint256"},{"internalType":"uint256","name":"stakersCount","type":"uint256"},{"internalType":"uint256","name":"contractBalance","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint8","name":"tierId","type":"uint8"}],"name":"getTierInfo","outputs":[{"internalType":"uint256","name":"aprBps","type":"uint256"},{"internalType":"uint256","name":"durationMonths","type":"uint256"}],"stateMutability":"pure","type":"function"},
  {"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getUserStakeCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"stakeIndex","type":"uint256"}],"name":"getUserStakeDetails","outputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint8","name":"tierId","type":"uint8"},{"internalType":"uint256","name":"start","type":"uint256"},{"internalType":"uint256","name":"finish","type":"uint256"},{"internalType":"uint256","name":"lastClaim","type":"uint256"},{"internalType":"bool","name":"active","type":"bool"},{"internalType":"uint256","name":"currentReward","type":"uint256"},{"internalType":"uint256","name":"timeLeft","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getUserStakeSummary","outputs":[{"internalType":"uint256","name":"totalStakedAmount","type":"uint256"},{"internalType":"uint256","name":"totalRewards","type":"uint256"},{"internalType":"uint256","name":"totalPending","type":"uint256"},{"internalType":"uint256","name":"activeTiers","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getUserStakes","outputs":[{"internalType":"uint256","name":"staked3M","type":"uint256"},{"internalType":"uint256","name":"rewards3M","type":"uint256"},{"internalType":"uint256","name":"timeLeft3M","type":"uint256"},{"internalType":"uint256","name":"staked6M","type":"uint256"},{"internalType":"uint256","name":"rewards6M","type":"uint256"},{"internalType":"uint256","name":"timeLeft6M","type":"uint256"},{"internalType":"uint256","name":"staked12M","type":"uint256"},{"internalType":"uint256","name":"rewards12M","type":"uint256"},{"internalType":"uint256","name":"timeLeft12M","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint8","name":"tierId","type":"uint8"}],"name":"getUserStakesForTier","outputs":[{"internalType":"uint256[]","name":"stakeIndexes","type":"uint256[]"},{"internalType":"uint256[]","name":"amounts","type":"uint256[]"},{"internalType":"uint256[]","name":"starts","type":"uint256[]"},{"internalType":"uint256[]","name":"finishes","type":"uint256[]"},{"internalType":"uint256[]","name":"currentRewards","type":"uint256[]"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"hasEverStaked","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"isStaking","outputs":[{"internalType":"bool","name":"active3m","type":"bool"},{"internalType":"bool","name":"active6m","type":"bool"},{"internalType":"bool","name":"active12m","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"pendingRewards12M","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"pendingRewards3M","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"pendingRewards6M","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint8","name":"tierId","type":"uint8"}],"name":"stake","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"totalRewardsDistributed","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"totalStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"totalStakers","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"stakeIndex","type":"uint256"},{"internalType":"uint8","name":"tierId","type":"uint8"}],"name":"unstake","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"userStakes","outputs":[{"components":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"start","type":"uint256"},{"internalType":"uint256","name":"lastClaim","type":"uint256"},{"internalType":"uint256","name":"finish","type":"uint256"},{"internalType":"bool","name":"active","type":"bool"}],"internalType":"struct HUBPortalStakingMultiTier.StakeInfo","name":"stake","type":"tuple"},{"internalType":"uint8","name":"tierId","type":"uint8"},{"internalType":"uint256","name":"stakeId","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint8","name":"","type":"uint8"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"userTierStakes","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
];

export const useStaking = (address) => {
  const { isBase } = useNetwork();
  const [stakingData, setStakingData] = useState(null);
  const [userStakes, setUserStakes] = useState(null);
  const [userStakesList, setUserStakesList] = useState([]);
  const [loadingUserStakesList, setLoadingUserStakesList] = useState(false);
  
  // Nowe stany dla badge
  const [badgeEligibility, setBadgeEligibility] = useState({ 
    isEligible: false, 
    eligibleStake: null 
  });
  const [userBadgeInfo, setUserBadgeInfo] = useState(null);

  // Queries
  const poolInfoQuery = useMemo(() => ({
    address: STAKING_CONTRACT_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'getPoolInfo',
    query: {
      enabled: !!address && isBase,
      staleTime: 30000,
      refetchInterval: 30000,
    }
  }), [address, isBase]);

  const userStakesQuery = useMemo(() => ({
    address: STAKING_CONTRACT_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'getUserStakes',
    args: [address],
    query: {
      enabled: !!address && isBase,
      staleTime: 30000,
      refetchInterval: 30000,
    }
  }), [address, isBase]);

  const userStakeCountQuery = useMemo(() => ({
    address: STAKING_CONTRACT_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'getUserStakeCount',
    args: [address],
    query: {
      enabled: !!address && isBase,
      staleTime: 30000,
    }
  }), [address, isBase]);

  // Read contracts
  const { 
    data: poolInfo, 
    refetch: refetchPoolInfo,
    isLoading: loadingPoolInfo,
    error: poolInfoError 
  } = useReadContract(poolInfoQuery);

  const { 
    data: userStakesData, 
    refetch: refetchUserStakes,
    isLoading: loadingUserStakes,
    error: userStakesError 
  } = useReadContract(userStakesQuery);

  const { 
    data: userStakeCount,
    refetch: refetchStakeCount
  } = useReadContract(userStakeCountQuery);

  // Use useReadContracts for fetching stakes for all tiers
  const tier1StakesQuery = useMemo(() => ({
    address: STAKING_CONTRACT_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'getUserStakesForTier',
    args: [address, 1],
    query: {
      enabled: !!address && isBase,
      staleTime: 30000,
    }
  }), [address, isBase]);

  const tier2StakesQuery = useMemo(() => ({
    address: STAKING_CONTRACT_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'getUserStakesForTier',
    args: [address, 2],
    query: {
      enabled: !!address && isBase,
      staleTime: 30000,
    }
  }), [address, isBase]);

  const tier3StakesQuery = useMemo(() => ({
    address: STAKING_CONTRACT_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'getUserStakesForTier',
    args: [address, 3],
    query: {
      enabled: !!address && isBase,
      staleTime: 30000,
    }
  }), [address, isBase]);

  const { 
    data: tier1StakesData,
    refetch: refetchTier1Stakes
  } = useReadContract(tier1StakesQuery);

  const { 
    data: tier2StakesData,
    refetch: refetchTier2Stakes
  } = useReadContract(tier2StakesQuery);

  const { 
    data: tier3StakesData,
    refetch: refetchTier3Stakes
  } = useReadContract(tier3StakesQuery);

  const { writeContract, isPending, data: hash, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const { data: apr3M } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'APR_3M',
    query: { enabled: isBase, staleTime: 60000 }
  });

  const { data: apr6M } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'APR_6M',
    query: { enabled: isBase, staleTime: 60000 }
  });

  const { data: apr12M } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'APR_12M',
    query: { enabled: isBase, staleTime: 60000 }
  });

  const { data: minStake } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'MIN_STAKE',
    query: { enabled: isBase, staleTime: 60000 }
  });

  // Funkcja do sprawdzania kwalifikacji do badge
  const checkBadgeEligibility = useCallback(() => {
    if (!userStakesList || !address) {
      return { isEligible: false, eligibleStake: null };
    }
    
    // Szukaj aktywnego stake 12m (tierId = 3) z min. 50k HUB
    const eligibleStake = userStakesList.find(stake => 
      stake.tierId === 3 && // 12 miesięcy
      stake.active &&
      parseFloat(stake.amount) >= 50000
    );
    
    const isEligible = !!eligibleStake;
    return { isEligible, eligibleStake };
  }, [userStakesList, address]);

  // Funkcja do claimowania badge
  const claimStakeBadge = useCallback(async () => {
    if (!address) {
      throw new Error('No wallet connected');
    }
    
    const { isEligible, eligibleStake } = checkBadgeEligibility();
    if (!isEligible || !eligibleStake) {
      throw new Error('Not eligible for Stake Badge');
    }
    
    // Zapisz w localStorage
    const badgeData = {
      walletAddress: address,
      claimedAt: new Date().toISOString(),
      stakeIndex: eligibleStake.index,
      stakeAmount: eligibleStake.amount,
      stakeDuration: '12 months',
      badgeType: 'stake_holder_50k',
      stakeStart: eligibleStake.start,
      stakeFinish: eligibleStake.finish
    };
    
    // Zapisz do localStorage
    const existingBadges = JSON.parse(localStorage.getItem('hub_stake_badges') || '{}');
    existingBadges[address.toLowerCase()] = badgeData;
    localStorage.setItem('hub_stake_badges', JSON.stringify(existingBadges));
    
    // Aktualizuj stan
    setUserBadgeInfo(badgeData);
    
    return badgeData;
  }, [address, checkBadgeEligibility]);

  // Funkcja do sprawdzenia czy użytkownik już ma badge
  const getUserBadgeInfo = useCallback(() => {
    if (!address) return null;
    
    const claimedBadges = JSON.parse(localStorage.getItem('hub_stake_badges') || '{}');
    return claimedBadges[address.toLowerCase()] || null;
  }, [address]);

  // Process pool info
  useEffect(() => {
    if (poolInfo && Array.isArray(poolInfo)) {
      const data = {
        totalStaked: formatEther(poolInfo[0]),
        availableRewards: formatEther(poolInfo[1]),
        totalRewardsPaid: formatEther(poolInfo[2]),
        stakersCount: Number(poolInfo[3]),
        contractBalance: formatEther(poolInfo[4])
      };
      setStakingData(data);
    }
  }, [poolInfo]);

  // Process user stakes summary
  useEffect(() => {
    if (userStakesData && Array.isArray(userStakesData)) {
      const data = {
        staked3M: formatEther(userStakesData[0]),
        rewards3M: formatEther(userStakesData[1]),
        timeLeft3M: Number(userStakesData[2]),
        staked6M: formatEther(userStakesData[3]),
        rewards6M: formatEther(userStakesData[4]),
        timeLeft6M: Number(userStakesData[5]),
        staked12M: formatEther(userStakesData[6]),
        rewards12M: formatEther(userStakesData[7]),
        timeLeft12M: Number(userStakesData[8])
      };
      setUserStakes(data);
    }
  }, [userStakesData]);

  // Process stakes for each tier
  useEffect(() => {
    const processTierStakes = (tierId, tierData) => {
      if (!tierData || !Array.isArray(tierData) || tierData.length !== 5) {
        return [];
      }

      const [stakeIndexes, amounts, starts, finishes, currentRewards] = tierData;
      const stakes = [];

      for (let i = 0; i < stakeIndexes.length; i++) {
        const currentTime = Math.floor(Date.now() / 1000);
        const timeLeft = Math.max(0, Number(finishes[i]) - currentTime);

        stakes.push({
          index: Number(stakeIndexes[i]),
          tierId: tierId,
          amount: formatEther(amounts[i]),
          start: Number(starts[i]),
          finish: Number(finishes[i]),
          currentReward: formatEther(currentRewards[i]),
          active: timeLeft > 0,
          timeLeft: timeLeft,
          lastClaim: Number(starts[i])
        });
      }

      return stakes;
    };

    const allStakes = [
      ...processTierStakes(1, tier1StakesData),
      ...processTierStakes(2, tier2StakesData),
      ...processTierStakes(3, tier3StakesData)
    ];

    // Sort by start time (newest first)
    allStakes.sort((a, b) => b.start - a.start);
    
    setUserStakesList(allStakes);
    setLoadingUserStakesList(false);
  }, [tier1StakesData, tier2StakesData, tier3StakesData]);

  // Aktualizacja kwalifikacji do badge i sprawdzenie czy już ma badge
  useEffect(() => {
    if (address) {
      const eligibility = checkBadgeEligibility();
      setBadgeEligibility(eligibility);
      
      // Sprawdź czy użytkownik już claimnął badge
      const badgeInfo = getUserBadgeInfo();
      setUserBadgeInfo(badgeInfo);
    } else {
      setBadgeEligibility({ isEligible: false, eligibleStake: null });
      setUserBadgeInfo(null);
    }
  }, [address, userStakesList, checkBadgeEligibility, getUserBadgeInfo]);

  // Auto-refetch stakes when address or base changes
  useEffect(() => {
    if (address && isBase) {
      setLoadingUserStakesList(true);
    } else {
      setUserStakesList([]);
      setBadgeEligibility({ isEligible: false, eligibleStake: null });
      setUserBadgeInfo(null);
    }
  }, [address, isBase]);

  // Write functions
  const stakeTokens = useCallback(async (amount, tierId) => {
    if (!address || !isBase) {
      console.error('Cannot stake: no address or not on Base');
      return;
    }
    
    try {
      writeContract({
        address: STAKING_CONTRACT_ADDRESS,
        abi: STAKING_ABI,
        functionName: 'stake',
        args: [parseEther(amount.toString()), tierId]
      });
    } catch (error) {
      console.error('Staking error:', error);
      throw error;
    }
  }, [address, isBase, writeContract]);

  const claimReward = useCallback(async (stakeIndex, tierId) => {
    if (!address || !isBase) {
      console.error('Cannot claim: no address or not on Base');
      return;
    }
    
    try {
      writeContract({
        address: STAKING_CONTRACT_ADDRESS,
        abi: STAKING_ABI,
        functionName: 'claimReward',
        args: [stakeIndex, tierId]
      });
    } catch (error) {
      console.error('Claim error:', error);
      throw error;
    }
  }, [address, isBase, writeContract]);

  const claimAllRewardsForTier = useCallback(async (tierId) => {
    if (!address || !isBase) {
      console.error('Cannot claim all: no address or not on Base');
      return;
    }
    
    try {
      writeContract({
        address: STAKING_CONTRACT_ADDRESS,
        abi: STAKING_ABI,
        functionName: 'claimAllRewardsForTier',
        args: [tierId]
      });
    } catch (error) {
      console.error('Claim all error:', error);
      throw error;
    }
  }, [address, isBase, writeContract]);

  const claimPending = useCallback(async (tierId) => {
    if (!address || !isBase) {
      console.error('Cannot claim pending: no address or not on Base');
      return;
    }
    
    try {
      writeContract({
        address: STAKING_CONTRACT_ADDRESS,
        abi: STAKING_ABI,
        functionName: 'claimPending',
        args: [tierId]
      });
    } catch (error) {
      console.error('Claim pending error:', error);
      throw error;
    }
  }, [address, isBase, writeContract]);

  const unstakeTokens = useCallback(async (stakeIndex, tierId) => {
    if (!address || !isBase) {
      console.error('Cannot unstake: no address or not on Base');
      return;
    }
    
    try {
      writeContract({
        address: STAKING_CONTRACT_ADDRESS,
        abi: STAKING_ABI,
        functionName: 'unstake',
        args: [stakeIndex, tierId]
      });
    } catch (error) {
      console.error('Unstake error:', error);
      throw error;
    }
  }, [address, isBase, writeContract]);

  const fundPool = useCallback(async (amount) => {
    if (!address || !isBase) {
      console.error('Cannot fund: no address or not on Base');
      return;
    }
    
    try {
      writeContract({
        address: STAKING_CONTRACT_ADDRESS,
        abi: STAKING_ABI,
        functionName: 'fundRewards',
        args: [parseEther(amount.toString())]
      });
    } catch (error) {
      console.error('Fund pool error:', error);
      throw error;
    }
  }, [address, isBase, writeContract]);

  // Refetch all data
  const refetchAll = useCallback(() => {
    refetchPoolInfo();
    refetchUserStakes();
    refetchStakeCount();
    refetchTier1Stakes();
    refetchTier2Stakes();
    refetchTier3Stakes();
    
    // Odśwież również dane badge
    if (address) {
      const badgeInfo = getUserBadgeInfo();
      setUserBadgeInfo(badgeInfo);
    }
  }, [
    refetchPoolInfo, 
    refetchUserStakes, 
    refetchStakeCount,
    refetchTier1Stakes,
    refetchTier2Stakes,
    refetchTier3Stakes,
    address,
    getUserBadgeInfo
  ]);

  return {
    // Original data
    stakingData,
    userStakes,
    userStakesList,
    loadingUserStakesList,
    aprs: {
      apr3M: apr3M ? Number(apr3M) / 100 : 3,
      apr6M: apr6M ? Number(apr6M) / 100 : 5,
      apr12M: apr12M ? Number(apr12M) / 100 : 9
    },
    minStake: minStake ? formatEther(minStake) : '1',
    
    // Loading states
    loading: loadingPoolInfo || loadingUserStakes || loadingUserStakesList,
    isPending,
    isConfirming,
    isSuccess,
    
    // Errors
    poolInfoError,
    userStakesError,
    writeError,
    
    // Write functions
    stakeTokens,
    claimReward,
    claimAllRewardsForTier,
    claimPending,
    unstakeTokens,
    fundPool,
    refetchAll,
    
    // Badge related
    badgeEligibility,        // { isEligible: bool, eligibleStake: object }
    userBadgeInfo,           // Dane claimniętego badge
    claimStakeBadge,         // Funkcja do claimowania badge
    getUserBadgeInfo,        // Funkcja pobierająca informacje o badge
    checkBadgeEligibility,   // Funkcja sprawdzająca kwalifikację
    
    // Other
    contractAddress: STAKING_CONTRACT_ADDRESS,
    isBase,
    hasStaking: isBase
  };
};