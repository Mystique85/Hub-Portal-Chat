import { useState, useEffect } from 'react';
import { useReadContract } from 'wagmi';
import { useNetwork } from './useNetwork';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../utils/constants';

export const useWeb3 = (address) => {
  const [balance, setBalance] = useState('0');
  const [remaining, setRemaining] = useState('0');
  const { currentNetwork, isCelo, networkConfig } = useNetwork();

  // DODANE: Adres tokena HUB na Base
  const HUB_TOKEN_ADDRESS_BASE = "0x58EFDe38eF2B12392BFB3dc4E503493C46636B3E";

  // DODANE: Standardowe ABI ERC-20 dla funkcji balanceOf
  const ERC20_ABI = [
    {
      "constant": true,
      "inputs": [{"name": "_owner", "type": "address"}],
      "name": "balanceOf",
      "outputs": [{"name": "balance", "type": "uint256"}],
      "type": "function"
    }
  ];

  // POPRAWIONE: Używaj tokena HUB na Base, kontraktu chat na Celo
  const { data: balanceData } = useReadContract({
    address: isCelo ? CONTRACT_ADDRESSES.celo : HUB_TOKEN_ADDRESS_BASE,
    abi: isCelo ? CONTRACT_ABIS.celo : ERC20_ABI,
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
    functionName: isCelo ? 'remainingRewards' : 'getContractHUBBalance',
    args: isCelo ? [address] : [],
    query: {
      enabled: !!address && isCelo, // Tylko dla Celo
    }
  });

  useEffect(() => {
    if (balanceData) {
      const balanceNumber = Number(balanceData) / 1e18;
      setBalance(balanceNumber.toString());
      console.log(`💰 Balance updated: ${balanceNumber} ${networkConfig.symbol} on ${currentNetwork}`);
    }
  }, [balanceData, currentNetwork, networkConfig.symbol]);

  useEffect(() => {
    if (isCelo && remainingData) {
      // Celo: pokaż remaining rewards
      setRemaining(remainingData.toString());
      console.log(`🎯 Remaining rewards on Celo: ${remainingData.toString()}`);
    } else if (isCelo) {
      // Celo: domyślnie 0
      setRemaining('0');
    } else {
      // Base: zawsze "unlimited" (kontrakt bez limitów)
      setRemaining('unlimited');
      console.log('🎯 Base network: unlimited rewards');
    }
  }, [remainingData, isCelo]);

  // POPRAWIONA FUNKCJA: Pobierz balance dowolnego użytkownika (działa dla obu sieci)
  const getOtherUserBalance = async (userAddress) => {
    if (!userAddress) return '0';
    
    try {
      // Używamy bezpośrednio fetch do kontraktu zamiast hooka
      const providerUrl = currentNetwork === 'celo' 
        ? import.meta.env.VITE_CELO_MAINNET_RPC_URL
        : import.meta.env.VITE_BASE_MAINNET_RPC_URL;
      
      if (!providerUrl) {
        console.error('RPC URL not configured for network:', currentNetwork);
        return '0';
      }

      // Określ który kontrakt użyć - token HUB na Base, kontrakt chat na Celo
      const contractAddress = isCelo ? CONTRACT_ADDRESSES.celo : HUB_TOKEN_ADDRESS_BASE;

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
            to: contractAddress,
            data: `0x70a08231000000000000000000000000${userAddress.slice(2)}` // balanceOf signature
          }, 'latest'],
          id: 1
        })
      });
      
      const data = await response.json();
      
      if (data.result && data.result !== '0x') {
        const balanceHex = data.result;
        const balanceWei = BigInt(balanceHex);
        const balanceFormatted = (Number(balanceWei) / 1e18).toString();
        console.log(`👤 Other user balance (${userAddress}): ${balanceFormatted} ${networkConfig.symbol}`);
        return balanceFormatted;
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