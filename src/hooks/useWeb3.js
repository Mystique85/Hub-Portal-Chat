import { useState, useEffect } from 'react';
import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../utils/constants';

export const useWeb3 = (address) => {
  const [balance, setBalance] = useState('0');
  const [remaining, setRemaining] = useState('0');

  const { data: balanceData } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'balanceOf',
    args: [address],
    query: {
      enabled: !!address,
    }
  });

  const { data: remainingData } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'remainingRewards',
    args: [address],
    query: {
      enabled: !!address,
    }
  });

  useEffect(() => {
    if (balanceData) {
      setBalance((Number(balanceData) / 1e18).toString());
    }
  }, [balanceData]);

  useEffect(() => {
    if (remainingData) {
      setRemaining(remainingData.toString());
    }
  }, [remainingData]);

  // POPRAWIONA FUNKCJA: Pobierz balance dowolnego użytkownika
  const getOtherUserBalance = async (userAddress) => {
    if (!userAddress) return '0';
    
    try {
      // Używamy bezpośrednio fetch do kontraktu zamiast hooka
      const providerUrl = import.meta.env.VITE_CELO_MAINNET_RPC_URL;
      
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
            to: CONTRACT_ADDRESS,
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
    getOtherUserBalance
  };
};