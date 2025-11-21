import { ConnectButton } from '@rainbow-me/rainbowkit';
import HelpTooltip from './HelpTooltip';
import Donation from './Donation';
import CeloHub from './CeloHub';
import { ADMIN_ADDRESSES } from '../../utils/constants';
import { useState } from 'react';
import DailyRewardsModal from '../modals/DailyRewardsModal';

const Header = ({ 
  currentUser, 
  totalUnreadCount, 
  isMobile = false,
  mobileView = 'public',
  onMobileViewChange,
  onUserStatsClick,
  activeDMChat 
}) => {
  const [showDailyRewards, setShowDailyRewards] = useState(false);
  const isAdmin = currentUser && ADMIN_ADDRESSES.includes(currentUser.walletAddress?.toLowerCase());

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
          <HelpTooltip />
          <CeloHub />
          <Donation />
          
          {/* Daily Rewards Button */}
          <button 
            onClick={() => setShowDailyRewards(true)}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-semibold transition-all hover:scale-105 flex items-center gap-2 text-sm"
          >
            🎁 Daily Rewards
          </button>

          <span className="px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-xl text-cyan-400">
            💎 HC: {currentUser?.balance || '0'}
          </span>
          <span className="px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-xl text-cyan-400">
            🎯 Left: {currentUser?.remaining || '0'}/10
          </span>
          <ConnectButton showBalance={false} />
        </div>
      </div>

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