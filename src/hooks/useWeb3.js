import { useState, useEffect } from 'react';
import { useReadContract, useAccount } from 'wagmi';
import { useNetwork } from './useNetwork';
import { 
  CONTRACT_ADDRESSES, 
  CONTRACT_ABIS,
  HUB_TOKEN_ADDRESS,
  USDC_TOKEN_ADDRESS 
} from '../utils/constants';

export const useWeb3 = (address) => {
  const [balance, setBalance] = useState('0');
  const [remaining, setRemaining] = useState('0');
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const { currentNetwork, isCelo, isBase, isLinea, networkConfig } = useNetwork();
  const { chain } = useAccount();

  const ERC20_ABI = [
    {
      "constant": true,
      "inputs": [{"name": "_owner", "type": "address"}],
      "name": "balanceOf",
      "outputs": [{"name": "balance", "type": "uint256"}],
      "type": "function"
    }
  ];

  const { data: balanceData } = useReadContract({
    address: HUB_TOKEN_ADDRESS[currentNetwork],
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address],
    query: {
      enabled: !!address && chain?.id === networkConfig.chainId,
    }
  });

  const { data: remainingData } = useReadContract({
    address: CONTRACT_ADDRESSES.celo,
    abi: CONTRACT_ABIS.celo,
    functionName: 'remainingRewards',
    args: [address],
    query: {
      enabled: !!address && isCelo,
    }
  });

  const { data: lineaRemainingData } = useReadContract({
    address: CONTRACT_ADDRESSES.linea,
    abi: CONTRACT_ABIS.linea,
    functionName: 'remainingRewards',
    args: [address],
    query: {
      enabled: !!address && isLinea,
    }
  });

  const { data: userSubscriptionInfoData } = useReadContract({
    address: CONTRACT_ADDRESSES.base,
    abi: CONTRACT_ABIS.base,
    functionName: 'getUserSubscriptionInfo',
    args: [address],
    query: {
      enabled: !!address && isBase,
    }
  });

  const { data: userBasicStatsData } = useReadContract({
    address: CONTRACT_ADDRESSES.base,
    abi: CONTRACT_ABIS.base,
    functionName: 'getUserBasicStats',
    args: [address],
    query: {
      enabled: !!address && isBase,
    }
  });

  const { data: lineaBasicStatsData } = useReadContract({
    address: CONTRACT_ADDRESSES.linea,
    abi: CONTRACT_ABIS.linea,
    functionName: 'getUserBasicStats',
    args: [address],
    query: {
      enabled: !!address && isLinea,
    }
  });

  const { data: simpleSubscriptionData } = useReadContract({
    address: CONTRACT_ADDRESSES.base,
    abi: CONTRACT_ABIS.base,
    functionName: 'getSubscriptionInfo',
    args: [address],
    query: {
      enabled: !!address && isBase,
    }
  });

  useEffect(() => {
    if (balanceData) {
      const balanceNumber = Number(balanceData) / 1e18;
      setBalance(balanceNumber.toFixed(2));
    }
  }, [balanceData]);

  useEffect(() => {
    if (isCelo && remainingData) {
      setRemaining(remainingData.toString());
    } else if (isCelo) {
      setRemaining('0');
    } else if (isBase) {
      if (userSubscriptionInfoData) {
        const remainingMsgs = Number(userSubscriptionInfoData[0]);
        if (remainingMsgs === 999999 || remainingMsgs > 1000) {
          setRemaining('∞');
        } else {
          setRemaining(remainingMsgs.toString());
        }
      }
    } else if (isLinea && lineaRemainingData) {
      setRemaining(lineaRemainingData.toString());
    } else if (isLinea) {
      setRemaining('0');
    }
  }, [remainingData, lineaRemainingData, userSubscriptionInfoData, isCelo, isBase, isLinea]);

  useEffect(() => {
    if (isBase && address) {
      let completeSubscriptionInfo = {
        tier: 0,
        expiry: 0,
        whitelisted: false,
        isActive: false,
        remainingMessages: 0,
        messagesToday: 0,
        lastResetDay: 0
      };

      if (userSubscriptionInfoData && Array.isArray(userSubscriptionInfoData)) {
        const [remainingMessages, tier, whitelisted, subscriptionExpiry] = userSubscriptionInfoData;
        
        completeSubscriptionInfo = {
          ...completeSubscriptionInfo,
          remainingMessages: Number(remainingMessages),
          tier: Number(tier),
          whitelisted: whitelisted,
          expiry: Number(subscriptionExpiry),
          isActive: whitelisted || (Number(subscriptionExpiry) > Math.floor(Date.now() / 1000))
        };
      }

      if (userBasicStatsData && Array.isArray(userBasicStatsData) && userBasicStatsData.length >= 6) {
        const [totalMessages, totalEarned, lastMessageTime, isBlocked, messagesToday, lastResetDay] = userBasicStatsData;
        
        completeSubscriptionInfo = {
          ...completeSubscriptionInfo,
          messagesToday: Number(messagesToday),
          lastResetDay: Number(lastResetDay)
        };

        setUserStats({
          totalMessages: Number(totalMessages),
          totalEarned: Number(totalEarned) / 1e18,
          lastMessageTime: Number(lastMessageTime),
          isBlocked,
          messagesToday: Number(messagesToday),
          lastResetDay: Number(lastResetDay)
        });
      }

      if (simpleSubscriptionData && Array.isArray(simpleSubscriptionData) && simpleSubscriptionData.length >= 4) {
        const [tier, expiry, whitelisted, isActive] = simpleSubscriptionData;
        
        if (!completeSubscriptionInfo.tier) {
          completeSubscriptionInfo.tier = Number(tier);
        }
        if (!completeSubscriptionInfo.expiry) {
          completeSubscriptionInfo.expiry = Number(expiry);
        }
        if (!completeSubscriptionInfo.whitelisted) {
          completeSubscriptionInfo.whitelisted = whitelisted;
        }
        if (!completeSubscriptionInfo.isActive) {
          completeSubscriptionInfo.isActive = isActive || (Number(expiry) > Math.floor(Date.now() / 1000));
        }
      }

      setSubscriptionInfo(completeSubscriptionInfo);
    } else if (isLinea && address && lineaBasicStatsData) {
      if (Array.isArray(lineaBasicStatsData) && lineaBasicStatsData.length >= 6) {
        const [totalMessages, totalEarned, lastMessageTime, isBlocked, messagesToday, lastResetDay] = lineaBasicStatsData;
        
        setUserStats({
          totalMessages: Number(totalMessages),
          totalEarned: Number(totalEarned) / 1e18,
          lastMessageTime: Number(lastMessageTime),
          isBlocked,
          messagesToday: Number(messagesToday),
          lastResetDay: Number(lastResetDay)
        });

        const lineaSubscriptionInfo = {
          tier: 0,
          expiry: 0,
          whitelisted: false,
          isActive: true,
          remainingMessages: Number(lineaRemainingData) || 0,
          messagesToday: Number(messagesToday),
          lastResetDay: Number(lastResetDay)
        };
        
        setSubscriptionInfo(lineaSubscriptionInfo);
      }
    }
  }, [userSubscriptionInfoData, userBasicStatsData, lineaBasicStatsData, simpleSubscriptionData, lineaRemainingData, isBase, isLinea, address]);

  const fetchBalanceForNetwork = async (userAddress, network) => {
    try {
      const providerUrls = {
        celo: import.meta.env.VITE_CELO_MAINNET_RPC_URL || 'https://forno.celo.org',
        base: import.meta.env.VITE_BASE_MAINNET_RPC_URL || 'https://mainnet.base.org',
        linea: import.meta.env.VITE_LINEA_MAINNET_RPC_URL || 'https://rpc.linea.build'
      };
      
      const providerUrl = providerUrls[network];
      
      if (!providerUrl) {
        return '0';
      }

      const contractAddresses = {
        celo: HUB_TOKEN_ADDRESS.celo,
        base: HUB_TOKEN_ADDRESS.base,
        linea: HUB_TOKEN_ADDRESS.linea
      };
      
      const contractAddress = contractAddresses[network];
      
      if (!userAddress || !userAddress.startsWith('0x') || userAddress.length !== 42) {
        return '0';
      }

      const dataParam = `0x70a08231000000000000000000000000${userAddress.slice(2).toLowerCase()}`;

      const response = await fetch(providerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{
            to: contractAddress,
            data: dataParam
          }, 'latest'],
          id: Date.now()
        })
      });
      
      const data = await response.json();
      
      if (data.result && data.result !== '0x') {
        const balanceHex = data.result;
        const balanceWei = BigInt(balanceHex);
        const balanceFormatted = (Number(balanceWei) / 1e18).toFixed(2);
        return balanceFormatted;
      }
      
      return '0';
    } catch (error) {
      console.error(`Error fetching balance for ${network}:`, error);
      return '0';
    }
  };

  const getOtherUserBalance = async (userAddress, targetNetwork = null) => {
    if (!userAddress) {
      return { celo: '0', base: '0', linea: '0' };
    }
    
    const results = { celo: '0', base: '0', linea: '0' };
    
    try {
      if (targetNetwork === 'celo' || targetNetwork === 'base' || targetNetwork === 'linea') {
        const balance = await fetchBalanceForNetwork(userAddress, targetNetwork);
        results[targetNetwork] = balance;
        return results;
      }
      
      const [celoBalance, baseBalance, lineaBalance] = await Promise.all([
        fetchBalanceForNetwork(userAddress, 'celo'),
        fetchBalanceForNetwork(userAddress, 'base'),
        fetchBalanceForNetwork(userAddress, 'linea')
      ]);
      
      results.celo = celoBalance;
      results.base = baseBalance;
      results.linea = lineaBalance;
      
    } catch (error) {
      console.error('Error getting other user balance:', error);
    }
    
    return results;
  };

  return {
    balance,
    remaining,
    subscriptionInfo,
    userStats,
    currentNetwork,
    tokenSymbol: networkConfig.symbol,
    networkName: networkConfig.name,
    isCelo,
    isBase,
    isLinea,
    supportsDailyRewards: isCelo || isLinea,
    supportsSeasonSystem: isCelo,
    supportsSubscriptions: isBase,
    supportsTokenTransfers: true,
    getOtherUserBalance,
    fetchBalanceForNetwork,
    explorerUrl: networkConfig.explorer
  };
};