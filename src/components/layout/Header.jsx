import { ConnectButton } from '@rainbow-me/rainbowkit';
import HelpTooltip from './HelpTooltip';
import Donation from './Donation';
import CeloHub from './CeloHub';
import { ADMIN_ADDRESSES } from '../../utils/constants';
import { useState, useRef, useEffect } from 'react';
import DailyRewardsModal from '../modals/DailyRewardsModal';
import ReactDOM from 'react-dom';

const Header = ({ 
  currentUser, 
  totalUnreadCount, 
  isMobile = false,
  mobileView = 'public',
  onMobileViewChange,
  onUserStatsClick,
  activeDMChat,
  onShowLeaderboard
}) => {
  const [showDailyRewards, setShowDailyRewards] = useState(false);
  const [showQuickAccessMenu, setShowQuickAccessMenu] = useState(false);
  const quickAccessButtonRef = useRef(null);
  const dropdownRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const isAdmin = currentUser && ADMIN_ADDRESSES.includes(currentUser.walletAddress?.toLowerCase());

  // Stany dla komponentów w dropdown
  const [showHelpTooltip, setShowHelpTooltip] = useState(false);
  const [showCeloHub, setShowCeloHub] = useState(false);
  const [showDonation, setShowDonation] = useState(false);

  useEffect(() => {
    if (showQuickAccessMenu && quickAccessButtonRef.current) {
      const rect = quickAccessButtonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.right + window.scrollX - 192
      });
    }
  }, [showQuickAccessMenu]);

  // Zamknij dropdown kiedy klikniesz poza nim
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
        {/* Actions Section */}
        <button 
          onClick={() => {
            onShowLeaderboard();
            setShowQuickAccessMenu(false);
          }}
          className="w-full px-4 py-3 text-left hover:bg-gray-700/50 transition-colors flex items-center gap-3 text-white"
        >
          <span>🏆</span>
          <span>Leaderboard</span>
        </button>
        
        <button 
          onClick={() => {
            setShowDailyRewards(true);
            setShowQuickAccessMenu(false);
          }}
          className="w-full px-4 py-3 text-left hover:bg-gray-700/50 transition-colors flex items-center gap-3 text-white"
        >
          <span>🎁</span>
          <span>Daily Rewards</span>
        </button>

        {/* Separator */}
        <div className="border-t border-gray-600/50 my-1"></div>

        {/* Resources Section */}
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
          <span>🌐</span>
          <span>Celo Ecosystem</span>
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
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
              <img 
                src="/hublogo.svg" 
                alt="HUB Portal" 
                className="w-4 h-4"
              />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">
                {mobileView === 'public' && 'HUB Chat'}
                {mobileView === 'users' && 'Users'}
                {mobileView === 'private' && (activeDMChat?.user?.nickname || 'Private Chat')}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={onShowLeaderboard}
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-2 rounded-xl hover:scale-105 transition-transform"
              title="Leaderboard"
            >
              🏆
            </button>
            
            <button 
              onClick={() => setShowDailyRewards(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-2 rounded-xl hover:scale-105 transition-transform"
              title="Daily Rewards"
            >
              🎁
            </button>
            <ConnectButton 
              showBalance={false}
              chainStatus="none"
              accountStatus="avatar"
            />
          </div>
        </div>

        {showDailyRewards && (
          <DailyRewardsModal 
            isOpen={showDailyRewards}
            onClose={() => setShowDailyRewards(false)}
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
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
            <img 
              src="/hublogo.svg" 
              alt="HUB Portal" 
              className="w-5 h-5"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              HUB Portal
            </h1>
            <p className="text-gray-400 text-xs">Decentralized Social Chat on Celo</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Quick Access Dropdown Menu */}
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

          {/* Balance and Messages - pozostają na stałe */}
          <span className="h-[42px] px-4 flex items-center bg-gray-700/50 border border-gray-600/50 rounded-xl text-cyan-400">
            💎 HC: {currentUser?.balance || '0'}
          </span>
          <span className="h-[42px] px-4 flex items-center bg-gray-700/50 border border-gray-600/50 rounded-xl text-cyan-400">
            🎯 Left: {currentUser?.remaining || '0'}/10
          </span>
          
          <ConnectButton showBalance={false} />
        </div>
      </div>

      {/* Quick Access Dropdown Portal */}
      <QuickAccessDropdown />

      {/* Renderujemy komponenty ale bez przycisków (showButton={false}) */}
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

      {showDailyRewards && (
        <DailyRewardsModal 
          isOpen={showDailyRewards}
          onClose={() => setShowDailyRewards(false)}
          currentUser={currentUser}
          isMobile={false}
        />
      )}
    </header>
  );
};

export default Header;