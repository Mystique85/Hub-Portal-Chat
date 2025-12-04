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
  const { currentNetwork, isCelo, isBase, networkConfig } = useNetwork();
  const { chain } = useAccount();

  // ABI dla tokenów ERC20
  const ERC20_ABI = [
    {
      "constant": true,
      "inputs": [{"name": "_owner", "type": "address"}],
      "name": "balanceOf",
      "outputs": [{"name": "balance", "type": "uint256"}],
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {"name": "_owner", "type": "address"},
        {"name": "_spender", "type": "address"}
      ],
      "name": "allowance",
      "outputs": [{"name": "", "type": "uint256"}],
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {"name": "_spender", "type": "address"},
        {"name": "_value", "type": "uint256"}
      ],
      "name": "approve",
      "outputs": [{"name": "", "type": "bool"}],
      "type": "function"
    }
  ];

  // Pobierz balans HUB tokena
  const { data: balanceData } = useReadContract({
    address: HUB_TOKEN_ADDRESS[currentNetwork],
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address],
    query: {
      enabled: !!address && chain?.id === networkConfig.chainId,
    }
  });

  // DLA CELO: Pozostałe nagrody
  const { data: remainingData } = useReadContract({
    address: CONTRACT_ADDRESSES.celo,
    abi: CONTRACT_ABIS.celo,
    functionName: 'remainingRewards',
    args: [address],
    query: {
      enabled: !!address && isCelo,
    }
  });

  // DLA BASE: Informacje o subskrypcji
  const { data: subscriptionData } = useReadContract({
    address: CONTRACT_ADDRESSES.base,
    abi: CONTRACT_ABIS.base,
    functionName: 'getSubscriptionInfo',
    args: [address],
    query: {
      enabled: !!address && isBase,
    }
  });

  // DLA BASE: Pozostałe dzienne wiadomości
  const { data: remainingMessagesData } = useReadContract({
    address: CONTRACT_ADDRESSES.base,
    abi: CONTRACT_ABIS.base,
    functionName: 'getRemainingDailyMessages',
    args: [address],
    query: {
      enabled: !!address && isBase,
    }
  });

  // DLA BASE: Statystyki użytkownika
  const { data: userBasicStatsData } = useReadContract({
    address: CONTRACT_ADDRESSES.base,
    abi: CONTRACT_ABIS.base,
    functionName: 'getUserBasicStats',
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
      // Na Base użyjemy remainingMessages jako indicator
      if (remainingMessagesData !== undefined) {
        const remainingMsgs = Number(remainingMessagesData);
        if (remainingMsgs === 999999 || remainingMsgs > 1000) {
          setRemaining('∞');
        } else {
          setRemaining(remainingMsgs.toString());
        }
      }
    }
  }, [remainingData, remainingMessagesData, isCelo, isBase]);

  useEffect(() => {
    if (subscriptionData && isBase) {
      const [tier, expiry, whitelisted, isActive] = subscriptionData;
      setSubscriptionInfo({
        tier: Number(tier),
        expiry: Number(expiry),
        whitelisted,
        isActive
      });
    }
  }, [subscriptionData, isBase]);

  useEffect(() => {
    if (userBasicStatsData && isBase) {
      const [totalMessages, totalEarned, lastMessageTime, isBlocked, messagesToday, lastResetDay] = userBasicStatsData;
      setUserStats({
        totalMessages: Number(totalMessages),
        totalEarned: Number(totalEarned) / 1e18, // Konwersja z wei
        lastMessageTime: Number(lastMessageTime),
        isBlocked,
        messagesToday: Number(messagesToday),
        lastResetDay: Number(lastResetDay)
      });
    }
  }, [userBasicStatsData, isBase]);

  const fetchBalanceForNetwork = async (userAddress, network) => {
    try {
      const providerUrls = {
        celo: import.meta.env.VITE_CELO_MAINNET_RPC_URL || 'https://forno.celo.org',
        base: import.meta.env.VITE_BASE_MAINNET_RPC_URL || 'https://mainnet.base.org'
      };
      
      const providerUrl = providerUrls[network];
      
      if (!providerUrl) {
        return '0';
      }

      const contractAddresses = {
        celo: HUB_TOKEN_ADDRESS.celo,
        base: HUB_TOKEN_ADDRESS.base
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
      return { celo: '0', base: '0' };
    }
    
    const results = { celo: '0', base: '0' };
    
    try {
      if (targetNetwork === 'celo' || targetNetwork === 'base') {
        const balance = await fetchBalanceForNetwork(userAddress, targetNetwork);
        results[targetNetwork] = balance;
        return results;
      }
      
      const [celoBalance, baseBalance] = await Promise.all([
        fetchBalanceForNetwork(userAddress, 'celo'),
        fetchBalanceForNetwork(userAddress, 'base')
      ]);
      
      results.celo = celoBalance;
      results.base = baseBalance;
      
    } catch (error) {
      console.error('Error getting other user balance:', error);
    }
    
    return results;
  };

  // Funkcja do sprawdzenia czy można wysłać wiadomość
  const checkCanSendMessage = async () => {
    if (!address || !isBase) return { canSend: false, reason: 'Not on Base network' };
    
    try {
      const { data: canSendData } = await useReadContract({
        address: CONTRACT_ADDRESSES.base,
        abi: CONTRACT_ABIS.base,
        functionName: 'canSendMessage',
        args: [address],
      });
      
      if (canSendData) {
        const [canSend, reason] = canSendData;
        return { canSend, reason };
      }
      
      return { canSend: false, reason: 'Unknown error' };
    } catch (error) {
      console.error('Error checking can send message:', error);
      return { canSend: false, reason: 'Contract error' };
    }
  };

  // Funkcja do sprawdzenia allowance USDC
  const checkUSDCAllowance = async () => {
    if (!address || !isBase) return '0';
    
    try {
      const { data: allowanceData } = await useReadContract({
        address: USDC_TOKEN_ADDRESS.base,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [address, CONTRACT_ADDRESSES.base],
      });
      
      if (allowanceData) {
        return Number(allowanceData) / 1e6; // USDC ma 6 decimal places
      }
      
      return '0';
    } catch (error) {
      console.error('Error checking USDC allowance:', error);
      return '0';
    }
  };

  // Funkcja do pobrania cen subskrypcji
  const getSubscriptionPrices = async () => {
    if (!isBase) return { basic: 0, premium: 0 };
    
    try {
      const [basicPriceResult, premiumPriceResult] = await Promise.all([
        useReadContract({
          address: CONTRACT_ADDRESSES.base,
          abi: CONTRACT_ABIS.base,
          functionName: 'basicPriceUSDC',
        }),
        useReadContract({
          address: CONTRACT_ADDRESSES.base,
          abi: CONTRACT_ABIS.base,
          functionName: 'premiumPriceUSDC',
        })
      ]);
      
      const basicPrice = basicPriceResult.data ? Number(basicPriceResult.data) / 1e6 : 10;
      const premiumPrice = premiumPriceResult.data ? Number(premiumPriceResult.data) / 1e6 : 50;
      
      return { basic: basicPrice, premium: premiumPrice };
    } catch (error) {
      console.error('Error getting subscription prices:', error);
      return { basic: 10, premium: 50 };
    }
  };

  return {
    // Balanse i podstawowe info
    balance,
    remaining,
    subscriptionInfo,
    userStats,
    
    // Informacje o sieci
    currentNetwork,
    tokenSymbol: networkConfig.symbol,
    networkName: networkConfig.name,
    isCelo,
    isBase,
    
    // Flagi funkcjonalności
    supportsDailyRewards: isCelo,
    supportsSeasonSystem: isCelo,
    supportsSubscriptions: isBase,
    supportsTokenTransfers: true,
    
    // Funkcje pomocnicze
    getOtherUserBalance,
    fetchBalanceForNetwork,
    checkCanSendMessage,
    checkUSDCAllowance,
    getSubscriptionPrices,
    
    // Info o sieci dla UI
    explorerUrl: networkConfig.explorer
  };
};