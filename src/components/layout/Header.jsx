// Header.jsx
import { ConnectButton } from '@rainbow-me/rainbowkit';
import HelpTooltip from './HelpTooltip';
import Donation from './Donation';
import CeloHub from './CeloHub';
import { ADMIN_ADDRESSES } from '../../utils/constants';

const Header = ({ 
  currentUser, 
  totalUnreadCount, 
  isMobile = false,
  mobileView = 'public',
  onMobileViewChange,
  onUserStatsClick,
  activeDMChat 
}) => {
  const isAdmin = currentUser && ADMIN_ADDRESSES.includes(currentUser.walletAddress?.toLowerCase());

  if (isMobile) {
    return (
      <div className="flex flex-col">
        <header className="bg-gray-800/80 backdrop-blur-xl border-b border-gray-700/50 p-3 flex-shrink-0">
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
                onClick={onUserStatsClick}
                className="w-10 h-10 rounded-xl bg-gray-700/50 flex items-center justify-center hover:bg-gray-700 active:bg-gray-600 active:scale-95 transition-all duration-150 touch-manipulation"
              >
                <span className="text-base">👤</span>
              </button>
              <ConnectButton showBalance={false} />
            </div>
          </div>
        </header>

        <nav className="bg-gray-800/80 backdrop-blur-xl border-t border-gray-700/50 p-2 flex-shrink-0">
          <div className="flex justify-around">
            <button
              onClick={() => onMobileViewChange('public')}
              className={`flex flex-col items-center p-2 rounded-xl transition-all min-w-16 ${
                mobileView === 'public' 
                  ? 'bg-cyan-500/20 text-cyan-400' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="text-sm">💬</span>
              <span className="text-xs mt-1">Chat</span>
            </button>
            
            <button
              onClick={() => onMobileViewChange('users')}
              className={`flex flex-col items-center p-2 rounded-xl transition-all min-w-16 ${
                mobileView === 'users' 
                  ? 'bg-cyan-500/20 text-cyan-400' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="text-sm">👥</span>
              <span className="text-xs mt-1">Users</span>
            </button>
            
            <button
              onClick={() => onMobileViewChange('private')}
              className={`flex flex-col items-center p-2 rounded-xl transition-all min-w-16 relative ${
                mobileView === 'private' 
                  ? 'bg-cyan-500/20 text-cyan-400' 
                  : 'text-gray-400 hover:text-white'
              } ${!activeDMChat ? 'opacity-50' : ''}`}
              disabled={!activeDMChat}
            >
              <span className="text-sm">🔒</span>
              <span className="text-xs mt-1">Private</span>
              {totalUnreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center text-[10px]">
                  {totalUnreadCount}
                </span>
              )}
            </button>
          </div>
        </nav>
      </div>
    );
  }

  return (
    <header className="bg-gray-800/50 backdrop-blur-xl border-b border-gray-700/50 p-6 flex-shrink-0">
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
          {/* ✅ POKAZUJ TYLKO NA DESKTOP - UKRYJ NA MOBILE */}
          {!isMobile && (
            <>
              <HelpTooltip />
              <CeloHub />
              <Donation />
            </>
          )}
          
          <span className="px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-xl text-cyan-400">
            💎 HC: {currentUser?.balance || '0'}
          </span>
          <span className="px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-xl text-cyan-400">
            🎯 Left: {currentUser?.remaining || '0'}/10
          </span>
          {totalUnreadCount > 0 && (
            <span className="px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 animate-pulse">
              📩 {totalUnreadCount} unread
            </span>
          )}
          <ConnectButton showBalance={false} />
        </div>
      </div>
    </header>
  );
};

export default Header;