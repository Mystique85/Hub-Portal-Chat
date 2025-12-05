import HelpTooltip from './HelpTooltip';
import Donation from './Donation';
import CeloHub from './CeloHub';
import { ADMIN_ADDRESSES } from '../../utils/constants';
import { useState, useRef, useEffect } from 'react';
import DailyRewardsModal from '../modals/DailyRewardsModal';
import DailyRewardsModalBase from '../modals/DailyRewardsModalBase';
import ReactDOM from 'react-dom';
import { useNetwork } from '../../hooks/useNetwork';
import { useSwitchChain } from 'wagmi';
import { base, celo } from '@reown/appkit/networks';

const Header = ({ 
  currentUser, 
  totalUnreadCount, 
  isMobile = false,
  mobileView = 'public',
  onMobileViewChange,
  onUserStatsClick,
  activeDMChat,
  onShowLeaderboard,
  onShowBaseLeaderboard,
  onShowSubscriptionModal
}) => {
  const [showDailyRewards, setShowDailyRewards] = useState(false);
  const [showDailyRewardsBase, setShowDailyRewardsBase] = useState(false);
  const [showQuickAccessMenu, setShowQuickAccessMenu] = useState(false);
  const [showNFTInfo, setShowNFTInfo] = useState(false);
  const quickAccessButtonRef = useRef(null);
  const dropdownRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const isAdmin = currentUser && ADMIN_ADDRESSES.includes(currentUser.walletAddress?.toLowerCase());

  const { isCelo, isBase, tokenSymbol, networkName, supportsDailyRewards, supportsSeasonSystem } = useNetwork();
  
  const { switchChain } = useSwitchChain();

  const [showHelpTooltip, setShowHelpTooltip] = useState(false);
  const [showCeloHub, setShowCeloHub] = useState(false);
  const [showDonation, setShowDonation] = useState(false);

  const handleSwitchNetwork = async () => {
    try {
      if (isCelo) {
        await switchChain({ chainId: base.id });
      } else if (isBase) {
        await switchChain({ chainId: celo.id });
      }
    } catch (error) {
      console.error('Error switching network:', error);
    }
  };

  useEffect(() => {
    if (showQuickAccessMenu && quickAccessButtonRef.current) {
      const rect = quickAccessButtonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.right + window.scrollX - 192
      });
    }
  }, [showQuickAccessMenu]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          quickAccessButtonRef.current && !quickAccessButtonRef.current.contains(event.target)) {
        setShowQuickAccessMenu(false);
      }
    };

    if (showQuickAccessMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showQuickAccessMenu]);

  const handleMintNFT = () => {
    setShowNFTInfo(true);
  };

  const handleProceedToMint = () => {
    window.open('https://opensea.io/collection/hub-ecosystem-genesis-nft', '_blank', 'noopener,noreferrer');
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
          top: dropdownPosition.top,
          left: dropdownPosition.left
        }}
      >
        {(supportsDailyRewards || isBase) && (
          <button 
            onClick={() => {
              if (isCelo) {
                setShowDailyRewards(true);
              } else if (isBase) {
                setShowDailyRewardsBase(true);
              }
              setShowQuickAccessMenu(false);
            }}
            className="w-full px-4 py-3 text-left hover:bg-gray-700/50 transition-colors flex items-center gap-3 text-white"
          >
            <span>🎁</span>
            <span>Daily Rewards</span>
          </button>
        )}

        {(supportsDailyRewards || isBase) && (
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
          <span>💫</span>
          <span>{networkName} Ecosystem</span>
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

  if (isMobile) {
    return (
      <header className="bg-gray-800/90 backdrop-blur-xl border-b border-gray-700/50 p-3 flex-shrink-0 safe-area-top">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <img 
              src="/hublogo.svg" 
              alt="HUB Portal" 
              className="w-6 h-6 flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h1 className="text-sm font-bold text-white truncate">
                {mobileView === 'public' && 'HUB Chat'}
                {mobileView === 'users' && 'Users'}
                {mobileView === 'private' && (activeDMChat?.user?.nickname?.slice(0, 12) || 'Chat')}
              </h1>
              <div className="text-cyan-400 text-[10px]">
                {networkName} • {tokenSymbol}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1 flex-shrink-0">
            <button 
              onClick={handleSwitchNetwork}
              className="bg-gradient-to-r from-gray-700 to-gray-800 text-white p-1.5 rounded-lg hover:scale-105 transition-transform text-xs border border-gray-600"
              title={`Switch to ${isCelo ? 'Base' : 'Celo'}`}
            >
              🌐
            </button>
            
            {(supportsSeasonSystem || isBase) && (
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
            
            {(supportsDailyRewards || isBase) && (
              <button 
                onClick={() => {
                  if (isCelo) {
                    setShowDailyRewards(true);
                  } else if (isBase) {
                    setShowDailyRewardsBase(true);
                  }
                }}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-1.5 rounded-lg hover:scale-105 transition-transform text-xs"
                title="Daily Rewards"
              >
                🎁
              </button>
            )}
            <appkit-button balance="hide" />
          </div>
        </div>

        {showDailyRewards && isCelo && (
          <DailyRewardsModal 
            isOpen={showDailyRewards}
            onClose={() => setShowDailyRewards(false)}
            currentUser={currentUser}
            isMobile={true}
          />
        )}

        {showDailyRewardsBase && isBase && (
          <DailyRewardsModalBase 
            isOpen={showDailyRewardsBase}
            onClose={() => setShowDailyRewardsBase(false)}
            currentUser={currentUser}
            isMobile={true}
          />
        )}
      </header>
    );
  }

  return (
    <header className="bg-gray-800/50 backdrop-blur-xl border-b border-gray-700/50 p-8 flex-shrink-0">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <img 
              src="/hublogo.svg" 
              alt="HUB Portal" 
              className="w-8 h-8"
            />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                HUB Portal
              </h1>
              <div className="text-cyan-400 text-sm">
                {networkName} Network • Earn {tokenSymbol} Tokens
              </div>
            </div>
          </div>

          <button
            onClick={handleMintNFT}
            className="h-[42px] px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all flex items-center justify-center animate-pulse shadow-lg shadow-purple-500/25 hover:scale-105"
          >
            Mint Genesis NFT
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Base Leaderboard - widoczny tylko na Base */}
          {isBase && (
            <button 
              onClick={onShowBaseLeaderboard}
              className="h-[42px] px-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-semibold transition-all flex items-center gap-2 text-sm shadow-lg shadow-blue-500/25 hover:scale-105"
            >
              <span>🏆</span>
              <span>Base Leaderboard</span>
            </button>
          )}

          {/* Celo Leaderboard - widoczny tylko na Celo */}
          {isCelo && supportsSeasonSystem && (
            <button 
              onClick={onShowLeaderboard}
              className="h-[42px] px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-semibold transition-all flex items-center gap-2 text-sm shadow-lg shadow-amber-500/25 hover:scale-105"
            >
              <span>🏆</span>
              <span>Celo Leaderboard</span>
            </button>
          )}

          {/* Quick Access */}
          <div className="relative">
            <button 
              ref={quickAccessButtonRef}
              onClick={() => setShowQuickAccessMenu(!showQuickAccessMenu)}
              className="h-[42px] px-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl font-semibold transition-all flex items-center gap-2 text-sm shadow-lg shadow-cyan-500/25"
            >
              <span>📊</span>
              <span>Quick Access</span>
              <span className={`transition-transform duration-200 ${showQuickAccessMenu ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
          </div>

          {/* PRZEŁĄCZNIK SIECI - Z IKONĄ 🌐 */}
          <button 
            onClick={handleSwitchNetwork}
            className="h-[42px] px-4 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl font-semibold transition-all flex items-center gap-2 text-sm border border-gray-600 hover:border-gray-500 shadow-lg hover:scale-105 group"
            title={`Switch to ${isCelo ? 'Base' : 'Celo'} network`}
          >
            <span className="text-lg">🌐</span>
            <span className="text-white font-medium">
              Switch to {isCelo ? 'Base' : 'Celo'}
            </span>
          </button>
          
          <appkit-button />
        </div>
      </div>

      <QuickAccessDropdown />

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

      {showDailyRewards && isCelo && (
        <DailyRewardsModal 
          isOpen={showDailyRewards}
          onClose={() => setShowDailyRewards(false)}
          currentUser={currentUser}
          isMobile={false}
        />
      )}

      {showDailyRewardsBase && isBase && (
        <DailyRewardsModalBase 
          isOpen={showDailyRewardsBase}
          onClose={() => setShowDailyRewardsBase(false)}
          currentUser={currentUser}
          isMobile={false}
        />
      )}
    </header>
  );
};

export default Header;