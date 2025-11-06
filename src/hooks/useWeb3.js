// src/hooks/useWeb3.js
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

  return {
    balance,
    remaining
  };
};