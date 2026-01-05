import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { sdk } from '@farcaster/miniapp-sdk';

import NetworkBackground from './components/layout/NetworkBackground';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import MobileFooter from './components/layout/MobileFooter';
import LoginHelpTooltip from './components/layout/LoginHelpTooltip';

import PublicChat from './components/chat/PublicChat';
import BaseAirdropChat from './components/chat/BaseAirdropChat';

import NicknameModal from './components/modals/NicknameModal';
import UserProfileModal from './components/modals/UserProfileModal';
import LeaderboardModal from './components/modals/LeaderboardModal';
import BaseLeaderboardModal from './components/modals/BaseLeaderboardModal';
import SubscriptionModal from './components/modals/SubscriptionModal';
import StakingModal from './components/modals/StakingModal';
import DailyGMLinea from './components/modals/DailyGMLinea';
import DailyGMPolygon from './components/modals/DailyGMPolygon';
import DailyGMSoneium from './components/modals/DailyGMSoneium';
import DailyGMArbitrum from './components/modals/DailyGMArbitrum';

import { useFirebase } from './hooks/useFirebase';
import { useUsers } from './hooks/useUsers';
import { useWeb3 } from './hooks/useWeb3';
import { useSeasons } from './hooks/useSeasons';
import { useNetwork } from './hooks/useNetwork';

import { AVAILABLE_AVATARS } from './utils/constants';

// Tablica z informacjami o sieciach (zaktualizowano Monad)
const NETWORKS = [
  {
    id: 'base',
    name: 'BASE',
    logo: '/Base.logo.jpg',
    fallbackEmoji: '🌉',
    color: 'blue'
  },
  {
    id: 'celo',
    name: 'CELO',
    logo: '/Celo.logo.jpg',
    fallbackEmoji: '📱',
    color: 'yellow'
  },
  {
    id: 'linea',
    name: 'LINEA',
    logo: '/Linea.logo.png',
    fallbackEmoji: '🚀',
    color: 'cyan'
  },
  {
    id: 'polygon',
    name: 'POLYGON',
    logo: '/Polygon.logo.jpg',
    fallbackEmoji: '🔶',
    color: 'purple'
  },
  {
    id: 'soneium',
    name: 'SONEIUM',
    logo: '/Soneium.logo.jpg',
    fallbackEmoji: '🌟',
    color: 'pink'
  },
  {
    id: 'arbitrum',
    name: 'ARBITRUM',
    logo: '/Arbitrum.logo.jpg',
    fallbackEmoji: '⚡',
    color: 'blue'
  },
  {
    id: 'monad',
    name: 'MONAD',
    logo: '/Monad.logo.jpg',
    fallbackEmoji: '🌀', // Zmieniono na 🌀 dla Monad
    color: 'monad' // Zmieniono z 'red' na 'monad'
  }
];

function App() {
  const { isConnected, address } = useAccount();
  const [isMobile, setIsMobile] = useState(false);
  const [mobileView, setMobileView] = useState('public');
  const [activeTab, setActiveTab] = useState('online');
  const [selectedProfileUser, setSelectedProfileUser] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showBaseLeaderboard, setShowBaseLeaderboard] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showStakingModal, setShowStakingModal] = useState(false);
  const [showDailyStreakLinea, setShowDailyStreakLinea] = useState(false);
  const [showDailyStreakPolygon, setShowDailyStreakPolygon] = useState(false);
  const [showDailyStreakSoneium, setShowDailyStreakSoneium] = useState(false);
  const [showDailyStreakMonad, setShowDailyStreakMonad] = useState(false);
  
  const [activeChat, setActiveChat] = useState('public');
  
  const { isCelo, isBase, isLinea, isPolygon, isSoneium, isArbitrum, isMonad, tokenSymbol, networkName, supportsDailyRewards, supportsSeasonSystem } = useNetwork();
  
  useEffect(() => {
    (async () => {
      try {
        await sdk.actions.ready();
      } catch (error) {}
    })();
  }, []);

  const { 
    currentUser, 
    showNicknameModal, 
    setShowNicknameModal,
    registerUser,
    updateUserLastSeen,
    deleteMessage,
    updateUserMessageCount
  } = useFirebase(address);

  const { 
    onlineUsers, 
    allUsers
  } = useUsers(address);

  const { 
    balance, 
    remaining, 
    getOtherUserBalance, 
    subscriptionInfo
  } = useWeb3(address);

  const { checkAndDistributeRewards } = useSeasons();

  const [nicknameInput, setNicknameInput] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🐶');

  useEffect(() => {
    if (isCelo && activeChat === 'base-airdrop') {
      setActiveChat('public');
    }
  }, [isCelo, activeChat]);

  const userWithBalance = currentUser ? {
    ...currentUser,
    balance,
    remaining,
    subscriptionInfo,
    tokenSymbol,
    networkName,
    supportsDailyRewards,
    supportsSeasonSystem
  } : null;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isCelo) {
      checkAndDistributeRewards();
    }
  }, [isCelo]);

  const handleShowStakingModal = () => {
    setShowStakingModal(true);
  };

  const handleCloseStakingModal = () => {
    setShowStakingModal(false);
  };

  const handleViewProfile = (user) => {
    setSelectedProfileUser(user);
  };

  const handleShowMyProfile = () => {
    if (currentUser) {
      setSelectedProfileUser({
        walletAddress: currentUser.walletAddress,
        nickname: currentUser.nickname || 'Anonymous',
        avatar: currentUser.avatar || '👤'
      });
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4 relative">
        <NetworkBackground />
        
        <div className="text-center bg-gray-800/70 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 sm:p-8 md:p-10 max-w-md w-full relative z-10 mx-4">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center">
            <img 
              src="/HUB.logo.png" 
              alt="HUB Portal" 
              className="w-12 h-12"
            />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-3">
            HUB Portal
          </h1>
          <p className="text-gray-400 mb-1">Multi-Chain Social Chat</p>
          
          <div className="flex justify-center mb-6">
            <appkit-button />
          </div>
          
          <div className="mb-4">
            <div className="text-cyan-400 font-semibold text-sm mb-3">🚀 QUAD ECOSYSTEM</div>
            
            {/* Zmodyfikowany kontener sieci */}
            <div className="flex flex-wrap justify-center gap-2">
              {NETWORKS.map((network) => (
                <div 
                  key={network.id}
                  className={`
                    bg-gray-700/50 border rounded-lg p-2 flex items-center justify-center gap-2 min-w-[100px]
                    ${network.color === 'blue' ? 'border-blue-500/20' : ''}
                    ${network.color === 'yellow' ? 'border-yellow-500/20' : ''}
                    ${network.color === 'cyan' ? 'border-cyan-500/20' : ''}
                    ${network.color === 'purple' ? 'border-purple-500/20' : ''}
                    ${network.color === 'pink' ? 'border-pink-500/20' : ''}
                    ${network.color === 'monad' ? 'border-[#836EF9]/20' : ''} {/* Zmieniono dla Monad */}
                  `}
                >
                  <div className="flex items-center gap-1">
                    <img 
                      src={network.logo} 
                      alt={network.name} 
                      className="w-5 h-5 object-cover rounded"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const fallbackSpan = document.createElement('span');
                        fallbackSpan.className = `
                          text-sm
                          ${network.color === 'blue' ? 'text-blue-400' : ''}
                          ${network.color === 'yellow' ? 'text-yellow-400' : ''}
                          ${network.color === 'cyan' ? 'text-cyan-400' : ''}
                          ${network.color === 'purple' ? 'text-purple-400' : ''}
                          ${network.color === 'pink' ? 'text-pink-400' : ''}
                          ${network.color === 'monad' ? 'text-[#836EF9]' : ''} {/* Zmieniono dla Monad */}
                        `;
                        fallbackSpan.textContent = network.fallbackEmoji;
                        e.target.parentElement.appendChild(fallbackSpan);
                      }}
                    />
                    <div className={`
                      font-medium text-xs
                      ${network.color === 'blue' ? 'text-blue-300' : ''}
                      ${network.color === 'yellow' ? 'text-yellow-300' : ''}
                      ${network.color === 'cyan' ? 'text-cyan-300' : ''}
                      ${network.color === 'purple' ? 'text-purple-300' : ''}
                      ${network.color === 'pink' ? 'text-pink-300' : ''}
                      ${network.color === 'monad' ? 'text-[#836EF9]' : ''} {/* Zmieniono dla Monad */}
                    `}>
                      {network.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Dodatkowy tekst informacyjny */}
            <div className="mt-4 text-xs text-gray-400">
              <p>Each network offers unique features:</p>
              <p>Token Mining • Daily Rewards • and more!</p>
            </div>
          </div>

          <div className="flex justify-center mt-4">
            <LoginHelpTooltip />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white overflow-hidden">
      <NetworkBackground />
      
      {showLeaderboard && isCelo && (
        <LeaderboardModal 
          isOpen={showLeaderboard}
          onClose={() => setShowLeaderboard(false)}
          currentUser={userWithBalance}
          isMobile={isMobile}
        />
      )}

      {showBaseLeaderboard && isBase && (
        <BaseLeaderboardModal 
          isOpen={showBaseLeaderboard}
          onClose={() => setShowBaseLeaderboard(false)}
          currentUser={userWithBalance}
          isMobile={isMobile}
        />
      )}

      {showSubscriptionModal && (
        <SubscriptionModal
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
          currentUser={userWithBalance}
          subscriptionInfo={subscriptionInfo}
        />
      )}

      {showStakingModal && isBase && (
        <StakingModal
          isOpen={showStakingModal}
          onClose={handleCloseStakingModal}
          currentUser={userWithBalance}
          isMobile={isMobile}
        />
      )}

      {isMobile ? (
        <div className="flex flex-col h-screen relative z-10 overflow-hidden">
          <Header
            isMobile={true}
            currentUser={userWithBalance}
            mobileView={mobileView}
            onMobileViewChange={setMobileView}
            onShowLeaderboard={() => {
              if (isCelo) {
                setShowLeaderboard(true);
              }
            }}
            onShowBaseLeaderboard={() => {
              if (isBase) {
                setShowBaseLeaderboard(true);
              }
            }}
            onShowSubscriptionModal={() => {
              if (isBase) {
                setShowSubscriptionModal(true);
              }
            }}
            onShowStakingModal={handleShowStakingModal}
          />
          
          <div className="flex-1 min-h-0 bg-gray-900/50 overflow-hidden">
            {mobileView === 'public' && (
              <>
                {activeChat === 'public' && (
                  <PublicChat 
                    currentUser={userWithBalance}
                    onUpdateLastSeen={updateUserLastSeen}
                    onDeleteMessage={deleteMessage}
                    onViewProfile={handleViewProfile}
                    updateUserMessageCount={updateUserMessageCount}
                    isMobile={true}
                  />
                )}
                
                {activeChat === 'base-airdrop' && isBase && (
                  <BaseAirdropChat 
                    currentUser={userWithBalance}
                    onUpdateLastSeen={updateUserLastSeen}
                    onDeleteMessage={deleteMessage}
                    onViewProfile={handleViewProfile}
                    updateUserMessageCount={updateUserMessageCount}
                    isMobile={true}
                  />
                )}
              </>
            )}
            
            {mobileView === 'users' && (
              <Sidebar
                isMobile={true}
                currentUser={userWithBalance}
                onlineUsers={onlineUsers}
                allUsers={allUsers}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onShowUserProfile={handleShowMyProfile}
              />
            )}

            {mobileView === 'me' && currentUser && (
              <div className="h-full overflow-y-auto p-4">
                <UserProfileModal 
                  user={{
                    walletAddress: currentUser.walletAddress,
                    nickname: currentUser.nickname || 'Anonymous',
                    avatar: currentUser.avatar || '👤'
                  }}
                  onClose={() => setMobileView('public')}
                  getOtherUserBalance={getOtherUserBalance}
                  currentUser={userWithBalance}
                  onOpenSubscription={() => {
                    if (isBase) {
                      setShowSubscriptionModal(true);
                      setMobileView('public');
                    }
                  }}
                  isMobile={true}
                />
              </div>
            )}
          </div>

          <MobileFooter
            mobileView={mobileView}
            onMobileViewChange={setMobileView}
            activeChat={activeChat}
            onChatChange={setActiveChat}
          />
        </div>
      ) : (
        <div className="flex h-screen relative z-10">
          <Sidebar
            currentUser={userWithBalance}
            onlineUsers={onlineUsers}
            allUsers={allUsers}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onShowUserProfile={handleShowMyProfile}
            activeChat={activeChat}
            onChatChange={setActiveChat}
          />

          <div className="flex-1 flex flex-col bg-gray-900/50 min-w-0 relative">
            <Header 
              currentUser={userWithBalance}
              onShowLeaderboard={() => {
                if (isCelo) {
                  setShowLeaderboard(true);
                }
              }}
              onShowBaseLeaderboard={() => {
                if (isBase) {
                  setShowBaseLeaderboard(true);
                }
              }}
              onShowSubscriptionModal={() => {
                if (isBase) {
                  setShowSubscriptionModal(true);
                }
              }}
              onShowStakingModal={handleShowStakingModal}
            />
            
            <div className="flex-1 flex min-h-0">
              <div className="w-full min-w-0">
                {activeChat === 'public' && (
                  <PublicChat 
                    currentUser={userWithBalance}
                    onUpdateLastSeen={updateUserLastSeen}
                    onDeleteMessage={deleteMessage}
                    onViewProfile={handleViewProfile}
                    updateUserMessageCount={updateUserMessageCount}
                  />
                )}
                
                {activeChat === 'base-airdrop' && isBase && (
                  <BaseAirdropChat 
                    currentUser={userWithBalance}
                    onUpdateLastSeen={updateUserLastSeen}
                    onDeleteMessage={deleteMessage}
                    onViewProfile={handleViewProfile}
                    updateUserMessageCount={updateUserMessageCount}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showNicknameModal && (
        <NicknameModal
          currentUser={currentUser}
          nicknameInput={nicknameInput}
          setNicknameInput={setNicknameInput}
          selectedAvatar={selectedAvatar}
          setSelectedAvatar={setSelectedAvatar}
          onRegister={() => registerUser(nicknameInput, selectedAvatar)}
          onClose={() => setShowNicknameModal(false)}
          availableAvatars={AVAILABLE_AVATARS}
        />
      )}

      {selectedProfileUser && (
        <UserProfileModal 
          user={selectedProfileUser}
          onClose={() => setSelectedProfileUser(null)}
          getOtherUserBalance={getOtherUserBalance}
          currentUser={userWithBalance}
          onOpenSubscription={() => setShowSubscriptionModal(true)}
          isMobile={isMobile}
        />
      )}

      {showDailyStreakLinea && (
        <DailyGMLinea 
          isOpen={showDailyStreakLinea}
          onClose={() => setShowDailyStreakLinea(false)}
          currentUser={userWithBalance}
          isMobile={isMobile}
        />
      )}

      {showDailyStreakPolygon && (
        <DailyGMPolygon 
          isOpen={showDailyStreakPolygon}
          onClose={() => setShowDailyStreakPolygon(false)}
          currentUser={userWithBalance}
          isMobile={isMobile}
        />
      )}

      {showDailyStreakSoneium && (
        <DailyGMSoneium 
          isOpen={showDailyStreakSoneium}
          onClose={() => setShowDailyStreakSoneium(false)}
          currentUser={userWithBalance}
          isMobile={isMobile}
        />
      )}

      {showDailyStreakMonad && (
        <DailyGMMonad 
          isOpen={showDailyStreakMonad}
          onClose={() => setShowDailyStreakMonad(false)}
          currentUser={userWithBalance}
          isMobile={isMobile}
        />
      )}
    </div>
  );
}

export default App;