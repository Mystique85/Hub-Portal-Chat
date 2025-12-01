import { useState, useEffect } from 'react';
import { useReadContract } from 'wagmi';
import { useNetwork } from './useNetwork';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../utils/constants';

export const useWeb3 = (address) => {
  const [balance, setBalance] = useState('0');
  const [remaining, setRemaining] = useState('0');
  const { currentNetwork, isCelo, networkConfig } = useNetwork();

  const HUB_TOKEN_ADDRESS_BASE = "0x58EFDe38eF2B12392BFB3dc4E503493C46636B3E";

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
    address: isCelo ? CONTRACT_ADDRESSES.celo : HUB_TOKEN_ADDRESS_BASE,
    abi: isCelo ? CONTRACT_ABIS.celo : ERC20_ABI,
    functionName: 'balanceOf',
    args: [address],
    query: {
      enabled: !!address,
    }
  });

  const { data: remainingData } = useReadContract({
    address: CONTRACT_ADDRESSES[currentNetwork],
    abi: CONTRACT_ABIS[currentNetwork],
    functionName: isCelo ? 'remainingRewards' : 'getContractHUBBalance',
    args: isCelo ? [address] : [],
    query: {
      enabled: !!address && isCelo,
    }
  });

  useEffect(() => {
    if (balanceData) {
      const balanceNumber = Number(balanceData) / 1e18;
      setBalance(balanceNumber.toString());
    }
  }, [balanceData, currentNetwork, networkConfig.symbol]);

  useEffect(() => {
    if (isCelo && remainingData) {
      setRemaining(remainingData.toString());
    } else if (isCelo) {
      setRemaining('0');
    } else {
      setRemaining('unlimited');
    }
  }, [remainingData, isCelo]);

  const getOtherUserBalance = async (userAddress) => {
    if (!userAddress) return '0';
    
    try {
      const providerUrl = currentNetwork === 'celo' 
        ? import.meta.env.VITE_CELO_MAINNET_RPC_URL
        : import.meta.env.VITE_BASE_MAINNET_RPC_URL;
      
      if (!providerUrl) {
        return '0';
      }

      const contractAddress = isCelo ? CONTRACT_ADDRESSES.celo : HUB_TOKEN_ADDRESS_BASE;

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
            data: `0x70a08231000000000000000000000000${userAddress.slice(2)}`
          }, 'latest'],
          id: 1
        })
      });
      
      const data = await response.json();
      
      if (data.result && data.result !== '0x') {
        const balanceHex = data.result;
        const balanceWei = BigInt(balanceHex);
        const balanceFormatted = (Number(balanceWei) / 1e18).toString();
        return balanceFormatted;
      }
      
      return '0';
    } catch (error) {
      return '0';
    }
  };

  return {
    balance,
    remaining,
    getOtherUserBalance,
    currentNetwork,
    tokenSymbol: networkConfig.symbol,
    isCelo,
    isBase: !isCelo
  };
};