import { useState, useEffect } from 'react';
import { useReadContract } from 'wagmi';
import { useNetwork } from './useNetwork';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../utils/constants';

export const useWeb3 = (address) => {
  const [balance, setBalance] = useState('0');
  const [remaining, setRemaining] = useState('0');
  const { currentNetwork, isCelo, networkConfig } = useNetwork();

  // DODANE: Warunkowe wywołania w zależności od sieci
  const { data: balanceData } = useReadContract({
    address: CONTRACT_ADDRESSES[currentNetwork],
    abi: CONTRACT_ABIS[currentNetwork],
    functionName: 'balanceOf',
    args: [address],
    query: {
      enabled: !!address,
    }
  });

  // DODANE: remainingRewards tylko dla Celo, dla Base zawsze "unlimited"
  const { data: remainingData } = useReadContract({
    address: CONTRACT_ADDRESSES[currentNetwork],
    abi: CONTRACT_ABIS[currentNetwork],
    functionName: isCelo ? 'remainingRewards' : 'getContractHUBBalance', // fallback dla Base
    args: isCelo ? [address] : [],
    query: {
      enabled: !!address && isCelo, // Tylko dla Celo
    }
  });

  useEffect(() => {
    if (balanceData) {
      setBalance((Number(balanceData) / 1e18).toString());
    }
  }, [balanceData]);

  useEffect(() => {
    if (isCelo && remainingData) {
      // Celo: pokaż remaining rewards
      setRemaining(remainingData.toString());
    } else if (isCelo) {
      // Celo: domyślnie 0
      setRemaining('0');
    } else {
      // Base: zawsze "unlimited" (kontrakt bez limitów)
      setRemaining('unlimited');
    }
  }, [remainingData, isCelo]);

  // POPRAWIONA FUNKCJA: Pobierz balance dowolnego użytkownika (działa dla obu sieci)
  const getOtherUserBalance = async (userAddress) => {
    if (!userAddress) return '0';
    
    try {
      // Używamy bezpośrednio fetch do kontraktu zamiast hooka
      // DODANE: Różne RPC URLs dla różnych sieci
      const providerUrl = currentNetwork === 'celo' 
        ? import.meta.env.VITE_CELO_MAINNET_RPC_URL
        : import.meta.env.VITE_BASE_MAINNET_RPC_URL;
      
      if (!providerUrl) {
        console.error('RPC URL not configured for network:', currentNetwork);
        return '0';
      }

      // Proste wywołanie JSON-RPC do kontraktu
      const response = await fetch(providerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{
            to: CONTRACT_ADDRESSES[currentNetwork],
            data: `0x70a08231000000000000000000000000${userAddress.slice(2)}` // balanceOf signature
          }, 'latest'],
          id: 1
        })
      });
      
      const data = await response.json();
      
      if (data.result && data.result !== '0x') {
        const balanceHex = data.result;
        const balanceWei = BigInt(balanceHex);
        return (Number(balanceWei) / 1e18).toString();
      }
      
      return '0';
    } catch (error) {
      console.error('Error getting other user balance:', error);
      return '0';
    }
  };

  return {
    balance,
    remaining,
    getOtherUserBalance,
    // DODANE: Informacje o sieci
    currentNetwork,
    tokenSymbol: networkConfig.symbol,
    isCelo,
    isBase: !isCelo
  };
};