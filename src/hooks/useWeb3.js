import { useState, useEffect } from 'react';
import { useReadContract } from 'wagmi';
import { useNetwork } from './useNetwork';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../utils/constants';

export const useWeb3 = (address) => {
  const [balance, setBalance] = useState('0');
  const [remaining, setRemaining] = useState('0');
  const { currentNetwork, isCelo, networkConfig } = useNetwork();

  const HUB_TOKEN_ADDRESS_BASE = "0x58EFDe38eF2B12392BFB3dc4E503493C46636B3E";
  const HUB_TOKEN_ADDRESS_CELO = CONTRACT_ADDRESSES.celo;

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
    address: isCelo ? HUB_TOKEN_ADDRESS_CELO : HUB_TOKEN_ADDRESS_BASE,
    abi: ERC20_ABI,
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
  }, [balanceData]);

  useEffect(() => {
    if (isCelo && remainingData) {
      setRemaining(remainingData.toString());
    } else if (isCelo) {
      setRemaining('0');
    } else {
      setRemaining('unlimited');
    }
  }, [remainingData, isCelo]);

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
        celo: HUB_TOKEN_ADDRESS_CELO,
        base: HUB_TOKEN_ADDRESS_BASE
      };
      
      const contractAddress = contractAddresses[network];
      
      if (!userAddress.startsWith('0x') || userAddress.length !== 42) {
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
        const balanceFormatted = (Number(balanceWei) / 1e18).toString();
        return balanceFormatted;
      }
      
      return '0';
    } catch (error) {
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
      // Silent fail
    }
    
    return results;
  };

  return {
    balance,
    remaining,
    getOtherUserBalance,
    fetchBalanceForNetwork,
    currentNetwork,
    tokenSymbol: networkConfig.symbol,
    isCelo,
    isBase: !isCelo
  };
};