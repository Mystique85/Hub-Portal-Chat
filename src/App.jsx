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

import { useFirebase } from './hooks/useFirebase';
import { useUsers } from './hooks/useUsers';
import { useWeb3 } from './hooks/useWeb3';
import { useSeasons } from './hooks/useSeasons';
import { useNetwork } from './hooks/useNetwork';

import { AVAILABLE_AVATARS } from './utils/constants';

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
  
  const [activeChat, setActiveChat] = useState('public');
  
  const { isCelo, isBase, tokenSymbol, networkName, supportsDailyRewards, supportsSeasonSystem } = useNetwork();
  
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
          <p className="text-gray-400 text-sm mb-6">Celo • Base • Linea Networks</p>
          
          <div className="flex justify-center mb-6">
            <appkit-button />
          </div>
          
          <div className="mb-4">
            <div className="text-cyan-400 font-semibold text-sm mb-3">🔥 TRIPLE REWARD SYSTEM</div>
            
            <div className="flex justify-center gap-3 text-xs">
              <div className="bg-gray-700/50 border border-cyan-500/20 rounded-lg p-3 flex-1">
                <div className="text-cyan-300 font-medium mb-1">🌉 BASE</div>
                <div className="text-gray-300">• HUB Token Rewards</div>
                <div className="text-gray-300">• Subscription System</div>
                <div className="text-gray-300">• Staking</div>
              </div>
              
              <div className="bg-gray-700/50 border border-yellow-500/20 rounded-lg p-3 flex-1">
                <div className="text-yellow-300 font-medium mb-1">📱 CELO</div>
                <div className="text-gray-300">• HC Token Mining</div>
                <div className="text-gray-300">• Daily CELO Rewards</div>
                <div className="text-gray-300">• Season System</div>
              </div>

              <div className="bg-gray-700/50 border border-cyan-500/20 rounded-lg p-3 flex-1">
                <div className="text-cyan-300 font-medium mb-1">🚀 LINEA</div>
                <div className="text-gray-300">• LINA Token Rewards</div>
                <div className="text-gray-300">• Daily ETH Rewards</div>
                <div className="text-gray-300">• Coming Soon!</div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
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
    </div>
  );
}

export default App;