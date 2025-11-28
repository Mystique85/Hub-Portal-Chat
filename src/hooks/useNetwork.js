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
    
    // Flagi funkcjonalności
    supportsDailyRewards: currentNetwork === 'celo',
    supportsSeasonSystem: currentNetwork === 'celo',
    supportsTokenTransfers: true, // Obie sieci wspierają wysyłanie tokenów
    
    // Informacje o explorerze
    explorerUrl: networkConfig.explorer
  };
};