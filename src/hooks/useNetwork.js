import { useAccount } from 'wagmi';
import { NETWORK_CONFIG } from '../utils/constants';

export const useNetwork = () => {
  const { chain } = useAccount();
  
  const getCurrentNetwork = () => {
    if (!chain) return 'celo'; // fallback
    
    if (chain.id === NETWORK_CONFIG.celo.chainId) return 'celo';
    if (chain.id === NETWORK_CONFIG.base.chainId) return 'base';
    
    return 'celo'; // default fallback
  };

  const currentNetwork = getCurrentNetwork();
  const networkConfig = NETWORK_CONFIG[currentNetwork];

  return {
    // Podstawowe informacje o sieci
    currentNetwork,
    networkConfig,
    isCelo: currentNetwork === 'celo',
    isBase: currentNetwork === 'base',
    
    // Informacje o tokenie
    tokenSymbol: networkConfig.symbol,
    networkName: networkConfig.name,
    
    // Flagi funkcjonalności - ZAKTUALIZOWANE
    supportsDailyRewards: currentNetwork === 'celo',
    supportsSeasonSystem: currentNetwork === 'celo',
    supportsSubscriptions: currentNetwork === 'base', // Tylko Base ma subskrypcje
    supportsTokenTransfers: true,
    supportsHUBRewards: true, // Obie sieci nagradzają tokenami
    
    // Informacje o explorerze
    explorerUrl: networkConfig.explorer,
    
    // DODANE: Informacje o subskrypcjach dla Base
    subscriptionConfig: currentNetwork === 'base' ? {
      hasSubscriptions: true,
      tiers: [
        { id: 0, name: 'FREE', dailyLimit: 10, price: 0 },
        { id: 1, name: 'BASIC', dailyLimit: 50, price: 10 },
        { id: 2, name: 'PREMIUM', dailyLimit: 999999, price: 50 }
      ],
      currency: 'USDC',
      duration: '30 days'
    } : null
  };
};