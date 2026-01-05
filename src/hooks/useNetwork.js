import { useAccount } from 'wagmi';
import { NETWORK_CONFIG, NETWORK_DETAILS } from '../utils/constants';

export const useNetwork = () => {
  const { chain } = useAccount();
  
  const getCurrentNetwork = () => {
    if (!chain || !chain.id) return 'celo';
    
    if (chain.id === NETWORK_CONFIG.celo.chainId) return 'celo';
    if (chain.id === NETWORK_CONFIG.base.chainId) return 'base';
    if (chain.id === NETWORK_CONFIG.linea.chainId) return 'linea';
    if (chain.id === NETWORK_CONFIG.polygon.chainId) return 'polygon';
    if (chain.id === NETWORK_CONFIG.soneium.chainId) return 'soneium';
    if (chain.id === NETWORK_CONFIG.arbitrum.chainId) return 'arbitrum';
    if (chain.id === NETWORK_CONFIG.monad.chainId) return 'monad';
    
    return 'celo';
  };

  const currentNetwork = getCurrentNetwork();
  const networkConfig = NETWORK_CONFIG[currentNetwork];
  const networkDetails = NETWORK_DETAILS[currentNetwork];

  return {
    currentNetwork,
    networkConfig,
    networkDetails,
    isCelo: currentNetwork === 'celo',
    isBase: currentNetwork === 'base',
    isLinea: currentNetwork === 'linea',
    isPolygon: currentNetwork === 'polygon',
    isSoneium: currentNetwork === 'soneium',
    isArbitrum: currentNetwork === 'arbitrum',
    isMonad: currentNetwork === 'monad',
    tokenSymbol: networkConfig.symbol,
    networkName: networkConfig.name,
    networkIcon: networkDetails.icon,
    supportsDailyRewards: currentNetwork === 'celo' || currentNetwork === 'linea' || currentNetwork === 'base' || currentNetwork === 'polygon' || currentNetwork === 'soneium' || currentNetwork === 'arbitrum' || currentNetwork === 'monad',
    supportsSeasonSystem: currentNetwork === 'celo',
    supportsSubscriptions: currentNetwork === 'base',
    supportsTokenTransfers: true,
    supportsHUBRewards: true,
    explorerUrl: networkConfig.explorer,
    subscriptionConfig: currentNetwork === 'base' ? {
      hasSubscriptions: true,
      tiers: [
        { id: 0, name: 'FREE', dailyLimit: 10, price: 0 },
        { id: 1, name: 'BASIC', dailyLimit: 50, price: 10 },
        { id: 2, name: 'PREMIUM', dailyLimit: 999999, price: 50 }
      ],
      currency: 'USDC',
      duration: '30 days'
    } : null,
    isNetworkAvailable: (network) => {
      const availableNetworks = ['celo', 'base', 'linea', 'polygon', 'soneium', 'arbitrum', 'monad'];
      return availableNetworks.includes(network);
    }
  };
};