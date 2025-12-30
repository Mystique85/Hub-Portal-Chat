import HelpTooltip from './HelpTooltip';
import Donation from './Donation';
import CeloHub from './CeloHub';
import { ADMIN_ADDRESSES, NETWORK_DETAILS } from '../../utils/constants';
import { useState, useRef, useEffect } from 'react';
import DailyRewardsModal from '../modals/DailyRewardsModal';
import DailyRewardsModalBase from '../modals/DailyRewardsModalBase';
import DailyGMLinea from '../modals/DailyGMLinea';
import DailyGMPolygon from '../modals/DailyGMPolygon';
import DailyGMSoneium from '../modals/DailyGMSoneium';
import ReactDOM from 'react-dom';
import { useNetwork } from '../../hooks/useNetwork';
import { useSwitchChain } from 'wagmi';
import { base, celo, linea, polygon } from '@reown/appkit/networks';

const Header = ({ 
  currentUser, 
  isMobile = false,
  mobileView = 'public',
  onMobileViewChange,
  onShowLeaderboard,
  onShowBaseLeaderboard,
  onShowSubscriptionModal,
  onShowStakingModal
}) => {
  const [showDailyStreak, setShowDailyStreak] = useState(false);
  const [showDailyStreakBase, setShowDailyStreakBase] = useState(false);
  const [showDailyStreakLinea, setShowDailyStreakLinea] = useState(false);
  const [showDailyStreakPolygon, setShowDailyStreakPolygon] = useState(false);
  const [showDailyStreakSoneium, setShowDailyStreakSoneium] = useState(false);
  const [showQuickAccessMenu, setShowQuickAccessMenu] = useState(false);
  const [showNFTInfo, setShowNFTInfo] = useState(false);
  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false);
  
  const quickAccessButtonRef = useRef(null);
  const networkButtonRef = useRef(null);
  const dropdownRef = useRef(null);
  const networkDropdownRef = useRef(null);
  
  const [quickAccessPosition, setQuickAccessPosition] = useState({ top: 0, left: 0 });
  const [networkDropdownPosition, setNetworkDropdownPosition] = useState({ top: 0, left: 0 });
  
  const isAdmin = currentUser && ADMIN_ADDRESSES.includes(currentUser.walletAddress?.toLowerCase());

  const { 
    isCelo, 
    isBase, 
    isLinea,
    isPolygon,
    isSoneium,
    tokenSymbol, 
    networkName, 
    networkIcon,
    networkDetails,
    supportsDailyRewards 
  } = useNetwork();
  
  const { switchChain } = useSwitchChain();

  const [showHelpTooltip, setShowHelpTooltip] = useState(false);
  const [showCeloHub, setShowCeloHub] = useState(false);
  const [showDonation, setShowDonation] = useState(false);

  useEffect(() => {
    if (showQuickAccessMenu && quickAccessButtonRef.current) {
      const rect = quickAccessButtonRef.current.getBoundingClientRect();
      setQuickAccessPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.right + window.scrollX - 192
      });
    }
  }, [showQuickAccessMenu]);

  useEffect(() => {
    if (showNetworkDropdown && networkButtonRef.current) {
      const rect = networkButtonRef.current.getBoundingClientRect();
      setNetworkDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX
      });
    }
  }, [showNetworkDropdown]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          quickAccessButtonRef.current && !quickAccessButtonRef.current.contains(event.target)) {
        setShowQuickAccessMenu(false);
      }
      
      if (networkDropdownRef.current && !networkDropdownRef.current.contains(event.target) &&
          networkButtonRef.current && !networkButtonRef.current.contains(event.target)) {
        setShowNetworkDropdown(false);
      }
    };

    if (showQuickAccessMenu || showNetworkDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showQuickAccessMenu, showNetworkDropdown]);

  const handleSwitchNetwork = async (targetNetwork) => {
    try {
      setShowNetworkDropdown(false);
      
      if (targetNetwork === 'celo') {
        await switchChain({ chainId: 42220 });
      } else if (targetNetwork === 'base') {
        await switchChain({ chainId: 8453 });
      } else if (targetNetwork === 'linea') {
        await switchChain({ chainId: 59144 });
      } else if (targetNetwork === 'polygon') {
        await switchChain({ chainId: 137 });
      } else if (targetNetwork === 'soneium') {
        await switchChain({ chainId: 1868 });
      }
    } catch (error) {
      console.error('Error switching network:', error);
    }
  };

  const handleMintNFT = () => {
    setShowNFTInfo(true);
  };

  const handleProceedToMint = () => {
    window.open('https://opensea.io/collection/hub-ecosystem-genesis-nft/overview', '_blank', 'noopener,noreferrer');
    setShowNFTInfo(false);
  };

  const NFTInfoModal = () => {
    if (!showNFTInfo) return null;

    const modalContent = (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[99999] p-4">
        <div className="bg-gray-800/95 border border-gray-600/50 rounded-2xl shadow-2xl max-w-md w-full p-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">🎨</span>
            </div>
            
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-3">
              HUB Genesis NFT
            </h2>
            
            <div className="mb-4">
              <span className="inline-block bg-red-500/20 border border-red-400/50 text-red-300 px-3 py-1 rounded-full text-sm font-semibold">
                ⚡ Only 1000 Genesis NFTs Available
              </span>
            </div>
            
            <div className="text-gray-300 text-left space-y-3 mb-6">
              <p className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">🔄</span>
                <span><strong>Only tradable NFT</strong> in our ecosystem - secondary market trading is <strong>live</strong></span>
              </p>
              
              <p className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">✨</span>
                <span><strong>Genesis holders receive:</strong></span>
              </p>
              
              <p className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">💰</span>
                <span><strong>20,000 HUB tokens</strong> on the Base network</span>
              </p>
              
              <p className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">🚀</span>
                <span><strong>10x airdrop multiplier</strong> for active early users</span>
              </p>

              <p className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">🎯</span>
                <span><strong>Exclusive Discord Role</strong> with special permissions</span>
              </p>

              <p className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">📝</span>
                <span><strong>Limit: maximum of 10 Genesis NFTs per wallet</strong></span>
              </p>

              <div className="mt-4 p-3 bg-purple-500/10 border border-purple-400/30 rounded-lg">
                <p className="text-purple-300 text-sm font-semibold text-center">
                  Genesis is the foundation of our economy and the highest level of access within the HUB ecosystem.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowNFTInfo(false)}
                className="flex-1 h-12 px-4 bg-gray-600 hover:bg-gray-500 text-white rounded-xl font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleProceedToMint}
                className="flex-1 h-12 px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                <span>Mint on OpenSea</span>
                <span>🚀</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );

    return ReactDOM.createPortal(modalContent, document.body);
  };

  const QuickAccessDropdown = () => {
    if (!showQuickAccessMenu) return null;

    const dropdownContent = (
      <div 
        ref={dropdownRef}
        className="fixed bg-gray-800/95 backdrop-blur-xl border border-gray-600/50 rounded-xl shadow-2xl z-[99999] py-2 w-48"
        style={{
          top: quickAccessPosition.top,
          left: quickAccessPosition.left
        }}
      >
        {isBase && (
          <button 
            onClick={() => {
              onShowStakingModal();
              setShowQuickAccessMenu(false);
            }}
            className="w-full px-4 py-3 text-left hover:bg-gray-700/50 transition-colors flex items-center gap-3 text-white"
          >
            <span>💰</span>
            <span>Stake HUB</span>
          </button>
        )}

        {supportsDailyRewards && (
          <button 
            onClick={() => {
              if (isCelo) {
                setShowDailyStreak(true);
              } else if (isBase) {
                setShowDailyStreakBase(true);
              } else if (isLinea) {
                setShowDailyStreakLinea(true);
              } else if (isPolygon) {
                setShowDailyStreakPolygon(true);
              } else if (isSoneium) {
                setShowDailyStreakSoneium(true);
              }
              setShowQuickAccessMenu(false);
            }}
            className="w-full px-4 py-3 text-left hover:bg-gray-700/50 transition-colors flex items-center gap-3 text-white"
          >
            <span>🔥</span>
            <span>Daily Streak</span>
          </button>
        )}

        {supportsDailyRewards && (
          <div className="border-t border-gray-600/50 my-1"></div>
        )}

        <button 
          onClick={() => {
            setShowHelpTooltip(true);
            setShowQuickAccessMenu(false);
          }}
          className="w-full px-4 py-3 text-left hover:bg-gray-700/50 transition-colors flex items-center gap-3 text-white"
        >
          <span>❓</span>
          <span>Quick Guide</span>
        </button>
        
        <button 
          onClick={() => {
            setShowCeloHub(true);
            setShowQuickAccessMenu(false);
          }}
          className="w-full px-4 py-3 text-left hover:bg-gray-700/50 transition-colors flex items-center gap-3 text-white"
        >
          <span>🔗</span>
          <span>Official Link</span>
        </button>
        
        <button 
          onClick={() => {
            setShowDonation(true);
            setShowQuickAccessMenu(false);
          }}
          className="w-full px-4 py-3 text-left hover:bg-gray-700/50 transition-colors flex items-center gap-3 text-white"
        >
          <span>💝</span>
          <span>Support Project</span>
        </button>
      </div>
    );

    return ReactDOM.createPortal(dropdownContent, document.body);
  };

  const NetworkDropdown = () => {
    if (!showNetworkDropdown) return null;

    const networks = [
      {
        id: 'celo',
        name: 'Celo',
        icon: '/Celo.logo.jpg',
        symbol: 'HC',
        color: 'text-yellow-400',
        border: 'border-yellow-500/30',
        bg: 'bg-yellow-500/10',
        isCurrent: isCelo
      },
      {
        id: 'base',
        name: 'Base',
        icon: '/Base.logo.jpg',
        symbol: 'HUB',
        color: 'text-blue-400',
        border: 'border-blue-500/30',
        bg: 'bg-blue-500/10',
        isCurrent: isBase
      },
      {
        id: 'linea',
        name: 'Linea',
        icon: '/Linea.logo.png',
        symbol: 'LPX',
        color: 'text-cyan-400',
        border: 'border-cyan-500/30',
        bg: 'bg-cyan-500/10',
        isCurrent: isLinea
      },
      {
        id: 'polygon',
        name: 'Polygon',
        icon: '/Polygon.logo.jpg',
        symbol: 'MSG',
        color: 'text-purple-400',
        border: 'border-purple-500/30',
        bg: 'bg-purple-500/10',
        isCurrent: isPolygon
      },
      {
        id: 'soneium',
        name: 'Soneium',
        icon: '/Soneium.logo.jpg',
        symbol: 'LUM',
        color: 'text-pink-400',
        border: 'border-pink-500/30',
        bg: 'bg-pink-500/10',
        isCurrent: isSoneium
      }
    ];

    const dropdownContent = (
      <div 
        ref={networkDropdownRef}
        className="fixed bg-gray-800/95 backdrop-blur-xl border border-gray-600/50 rounded-xl shadow-2xl z-[99999] py-2 w-56"
        style={{
          top: networkDropdownPosition.top,
          left: networkDropdownPosition.left
        }}
      >
        <div className="px-4 py-3 border-b border-gray-600/50">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Select Network
          </div>
          <div className="text-xs text-gray-500 mt-0.5">Switch blockchain network</div>
        </div>
        
        {networks.map((network) => (
          <button 
            key={network.id}
            onClick={() => handleSwitchNetwork(network.id)}
            className={`w-full px-3 py-2.5 text-left hover:bg-gray-700/50 transition-colors flex items-center gap-2 group ${
              network.isCurrent ? 'bg-gray-700/30' : ''
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${network.bg} ${network.border} border overflow-hidden flex-shrink-0`}>
              <img 
                src={network.icon} 
                alt={network.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `<span class="text-base ${network.color}">${
                    network.id === 'celo' ? '📱' :
                    network.id === 'base' ? '🌉' :
                    network.id === 'linea' ? '🚀' :
                    network.id === 'polygon' ? '🔶' :
                    network.id === 'soneium' ? '🌟' : '🌐'
                  }</span>`;
                }}
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`font-medium text-sm ${network.color}`}>{network.name}</span>
                {network.isCurrent && (
                  <div className="px-1.5 py-0.5 bg-green-500/20 border border-green-500/30 rounded text-[10px] text-green-400 flex-shrink-0">
                    Active
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-400 truncate">
                {network.symbol} token rewards
              </div>
            </div>
            
            <div className={`opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ${network.color}`}>
              <span className="text-sm">→</span>
            </div>
          </button>
        ))}
        
        <div className="px-3 py-2 border-t border-gray-600/50 mt-1">
          <div className="text-xs text-gray-500 flex items-start gap-1.5">
            <span className="text-cyan-400 text-xs mt-0.5">💡</span>
            <span>Each network offers different rewards and features</span>
          </div>
        </div>
      </div>
    );

    return ReactDOM.createPortal(dropdownContent, document.body);
  };

  const renderNetworkLogo = () => {
    if (isCelo) {
      return (
        <img 
          src="/Celo.logo.jpg" 
          alt="Celo" 
          className="w-5 h-5 object-cover rounded"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = `<span class="text-lg">📱</span>`;
          }}
        />
      );
    }
    if (isBase) {
      return (
        <img 
          src="/Base.logo.jpg" 
          alt="Base" 
          className="w-5 h-5 object-cover rounded"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = `<span class="text-lg">🌉</span>`;
          }}
        />
      );
    }
    if (isLinea) {
      return (
        <img 
          src="/Linea.logo.png" 
          alt="Linea" 
          className="w-5 h-5 object-cover rounded"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = `<span class="text-lg">🚀</span>`;
          }}
        />
      );
    }
    if (isPolygon) {
      return (
        <img 
          src="/Polygon.logo.jpg" 
          alt="Polygon" 
          className="w-5 h-5 object-cover rounded"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = `<span class="text-lg">🔶</span>`;
          }}
        />
      );
    }
    if (isSoneium) {
      return (
        <img 
          src="/Soneium.logo.jpg" 
          alt="Soneium" 
          className="w-5 h-5 object-cover rounded"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = `<span class="text-lg">🌟</span>`;
          }}
        />
      );
    }
    return <span className="text-lg">🌐</span>;
  };

  if (isMobile) {
    return (
      <header className="bg-gray-800/90 backdrop-blur-xl border-b border-gray-700/50 p-3 flex-shrink-0 safe-area-top">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <img 
              src="/HUB.logo.png" 
              alt="HUB Portal" 
              className="w-6 h-6 flex-shrink-0"
              onError={(e) => {
                e.target.src = '/hublogo.svg';
              }}
            />
            <div className="min-w-0 flex-1">
              <h1 className="text-sm font-bold text-white truncate">
                {mobileView === 'public' && 'HUB Chat'}
                {mobileView === 'users' && 'Users'}
                {mobileView === 'private' && 'Chat'}
              </h1>
              <div className={`${networkDetails.textColor} text-[10px] flex items-center gap-1`}>
                <span>{networkName} • {tokenSymbol}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1 flex-shrink-0">
            <div className="relative">
              <button 
                ref={networkButtonRef}
                onClick={() => setShowNetworkDropdown(!showNetworkDropdown)}
                className={`bg-gradient-to-r ${networkDetails.bgGradient} text-white p-1.5 rounded-lg hover:scale-105 transition-transform text-xs border ${networkDetails.borderColor}`}
                title="Select Network"
              >
                {renderNetworkLogo()}
              </button>
            </div>
            
            {isBase && (
              <button 
                onClick={onShowStakingModal}
                className="bg-gradient-to-r from-emerald-500 to-green-500 text-white p-1.5 rounded-lg hover:scale-105 transition-transform text-xs"
                title="Stake HUB"
              >
                💰
              </button>
            )}
            
            {(isCelo || isBase) && (
              <button 
                onClick={() => {
                  if (isCelo) {
                    onShowLeaderboard();
                  } else if (isBase) {
                    onShowBaseLeaderboard();
                  }
                }}
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-1.5 rounded-lg hover:scale-105 transition-transform text-xs"
                title="Leaderboard"
              >
                🏆
              </button>
            )}
            
            {supportsDailyRewards && (
              <button 
                onClick={() => {
                  if (isCelo) {
                    setShowDailyStreak(true);
                  } else if (isBase) {
                    setShowDailyStreakBase(true);
                  } else if (isLinea) {
                    setShowDailyStreakLinea(true);
                  } else if (isPolygon) {
                    setShowDailyStreakPolygon(true);
                  } else if (isSoneium) {
                    setShowDailyStreakSoneium(true);
                  }
                }}
                className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-1.5 rounded-lg hover:scale-105 transition-transform text-xs"
                title="Daily Streak"
              >
                🔥
              </button>
            )}
            <appkit-button balance="hide" />
          </div>
        </div>

        <NetworkDropdown />

        {showDailyStreak && isCelo && (
          <DailyRewardsModal 
            isOpen={showDailyStreak}
            onClose={() => setShowDailyStreak(false)}
            currentUser={currentUser}
            isMobile={true}
          />
        )}

        {showDailyStreakBase && isBase && (
          <DailyRewardsModalBase 
            isOpen={showDailyStreakBase}
            onClose={() => setShowDailyStreakBase(false)}
            currentUser={currentUser}
            isMobile={true}
          />
        )}

        {showDailyStreakLinea && isLinea && (
          <DailyGMLinea 
            isOpen={showDailyStreakLinea}
            onClose={() => setShowDailyStreakLinea(false)}
            currentUser={currentUser}
            isMobile={true}
          />
        )}

        {showDailyStreakPolygon && isPolygon && (
          <DailyGMPolygon 
            isOpen={showDailyStreakPolygon}
            onClose={() => setShowDailyStreakPolygon(false)}
            currentUser={currentUser}
            isMobile={true}
          />
        )}

        {showDailyStreakSoneium && isSoneium && (
          <DailyGMSoneium 
            isOpen={showDailyStreakSoneium}
            onClose={() => setShowDailyStreakSoneium(false)}
            currentUser={currentUser}
            isMobile={true}
          />
        )}
      </header>
    );
  }

  return (
    <header className="bg-gray-800/50 backdrop-blur-xl border-b border-gray-700/50 p-6 flex-shrink-0">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <img 
              src="/HUB.logo.png" 
              alt="HUB Portal" 
              className="w-8 h-8"
              onError={(e) => {
                e.target.src = '/hublogo.svg';
              }}
            />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              HUB Portal
            </h1>
          </div>

          <div className="h-6 w-px bg-gray-600/50"></div>
          
          <div className={`${networkDetails.textColor} text-sm font-medium`}>
            {networkName} Network • Earn {tokenSymbol} Tokens
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleMintNFT}
            className="h-[36px] px-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-semibold transition-all flex items-center justify-center animate-pulse shadow-lg shadow-purple-500/25 hover:scale-105 text-sm"
          >
            Mint Genesis NFT
          </button>

          {isBase && (
            <button 
              onClick={onShowBaseLeaderboard}
              className="h-[36px] px-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-semibold transition-all flex items-center gap-2 text-sm shadow-lg shadow-blue-500/25 hover:scale-105"
            >
              <span>🏆</span>
              <span>Base Leaderboard</span>
            </button>
          )}

          {isCelo && (
            <button 
              onClick={onShowLeaderboard}
              className="h-[36px] px-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg font-semibold transition-all flex items-center gap-2 text-sm shadow-lg shadow-amber-500/25 hover:scale-105"
            >
              <span>🏆</span>
              <span>Celo Leaderboard</span>
            </button>
          )}

          <div className="relative">
            <button 
              ref={quickAccessButtonRef}
              onClick={() => setShowQuickAccessMenu(!showQuickAccessMenu)}
              className="h-[36px] px-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-semibold transition-all flex items-center gap-2 text-sm shadow-lg shadow-cyan-500/25"
            >
              <span>📊</span>
              <span>Quick Access</span>
              <span className={`transition-transform duration-200 ${showQuickAccessMenu ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
          </div>

          <div className="relative">
            <button 
              ref={networkButtonRef}
              onClick={() => setShowNetworkDropdown(!showNetworkDropdown)}
              className={`h-[36px] px-3 bg-gradient-to-r ${networkDetails.bgGradient} hover:opacity-90 text-white rounded-lg font-semibold transition-all flex items-center gap-2 text-sm border ${networkDetails.borderColor} shadow-lg hover:scale-105 group`}
              title="Select Network"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                {renderNetworkLogo()}
              </div>
              <span className="text-white font-medium">
                {networkName}
              </span>
              <span className={`transition-transform duration-200 ${showNetworkDropdown ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
          </div>
          
          <appkit-button />
        </div>
      </div>

      <QuickAccessDropdown />
      <NetworkDropdown />

      <NFTInfoModal />

      <HelpTooltip 
        isMobile={false} 
        showButton={false}
        isOpen={showHelpTooltip}
        onClose={() => setShowHelpTooltip(false)}
      />
      
      <CeloHub 
        isMobile={false} 
        showButton={false}
        isOpen={showCeloHub}
        onClose={() => setShowCeloHub(false)}
      />
      
      <Donation 
        isMobile={false} 
        showButton={false}
        isOpen={showDonation}
        onClose={() => setShowDonation(false)}
      />

      {showDailyStreak && isCelo && (
        <DailyRewardsModal 
          isOpen={showDailyStreak}
          onClose={() => setShowDailyStreak(false)}
          currentUser={currentUser}
          isMobile={false}
        />
      )}

      {showDailyStreakBase && isBase && (
        <DailyRewardsModalBase 
            isOpen={showDailyStreakBase}
            onClose={() => setShowDailyStreakBase(false)}
            currentUser={currentUser}
            isMobile={false}
          />
        )}

        {showDailyStreakLinea && isLinea && (
          <DailyGMLinea 
            isOpen={showDailyStreakLinea}
            onClose={() => setShowDailyStreakLinea(false)}
            currentUser={currentUser}
            isMobile={false}
          />
        )}

        {showDailyStreakPolygon && isPolygon && (
          <DailyGMPolygon 
            isOpen={showDailyStreakPolygon}
            onClose={() => setShowDailyStreakPolygon(false)}
            currentUser={currentUser}
            isMobile={false}
          />
        )}

        {showDailyStreakSoneium && isSoneium && (
          <DailyGMSoneium 
            isOpen={showDailyStreakSoneium}
            onClose={() => setShowDailyStreakSoneium(false)}
            currentUser={currentUser}
            isMobile={false}
          />
        )}
      </header>
    );
  };

  export default Header;