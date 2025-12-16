import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { sdk } from '@farcaster/miniapp-sdk';

import NetworkBackground from './components/layout/NetworkBackground';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import MobileFooter from './components/layout/MobileFooter';
import LoginHelpTooltip from './components/layout/LoginHelpTooltip';

import PublicChat from './components/chat/PublicChat';
import PrivateChat from './components/chat/PrivateChat';

import NicknameModal from './components/modals/NicknameModal';
import PrivateChatModal from './components/modals/PrivateChatModal';
import ToastNotification from './components/modals/ToastNotification';
import UserProfileModal from './components/modals/UserProfileModal';
import LeaderboardModal from './components/modals/LeaderboardModal';
import BaseLeaderboardModal from './components/modals/BaseLeaderboardModal';
import SubscriptionModal from './components/modals/SubscriptionModal';
import StakingModal from './components/modals/StakingModal';

import { useFirebase } from './hooks/useFirebase';
import { useUsers } from './hooks/useUsers';
import { useChat } from './hooks/useChat';
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
    allUsers, 
    unreadCounts,
    totalUnreadCount,
    markAsRead
  } = useUsers(address, currentUser);

  const {
    activeDMChat,
    setActiveDMChat,
    showDMModal,
    setShowDMModal,
    selectedUser,
    setSelectedUser,
    startPrivateChat,
    confirmPrivateChat,
    closeDMChat,
    isStartingDM,
    isConfirming
  } = useChat(address, currentUser, allUsers);

  const { 
    balance, 
    remaining, 
    getOtherUserBalance, 
    subscriptionInfo
  } = useWeb3(address);

  const { checkAndDistributeRewards } = useSeasons();

  const [privateMessage, setPrivateMessage] = useState('');
  const [nicknameInput, setNicknameInput] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🐶');
  const [toastNotification, setToastNotification] = useState(null);

  useEffect(() => {
    if (showDMModal) {
      setPrivateMessage('');
    }
  }, [showDMModal]);

  const usersWithUnreadMessages = allUsers
    .filter(user => unreadCounts[user.walletAddress] > 0)
    .map(user => ({
      ...user,
      unreadCount: unreadCounts[user.walletAddress]
    }));

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
    if (activeDMChat && isMobile) {
      setMobileView('private');
    }
  }, [activeDMChat, isMobile]);

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

  const openChatFromToast = async (userId) => {
    const user = allUsers.find(u => u.walletAddress === userId);
    if (user) {
      await handleStartPrivateChat(user);
      setToastNotification(null);
    }
  };

  const handleStartPrivateChat = async (user) => {
    await startPrivateChat(user);
    if (isMobile) setMobileView('private');
  };

  const handleCloseDMChat = () => {
    closeDMChat();
    if (isMobile) setMobileView('public');
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
              src="/hublogo.svg" 
              alt="HUB Portal" 
              className="w-12 h-12"
            />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-3">
            HUB Portal
          </h1>
          <p className="text-gray-400 mb-1">Multi-Chain Social Chat</p>
          <p className="text-gray-400 text-sm mb-6">Celo + Base Networks</p>
          
          <div className="flex justify-center mb-6">
            <appkit-button />
          </div>
          
          <div className="mb-4">
            <div className="text-cyan-400 font-semibold text-sm mb-3">🔥 DUAL REWARD SYSTEM</div>
            
            <div className="flex justify-center gap-3 text-xs">
              <div className="bg-gray-700/50 border border-cyan-500/20 rounded-lg p-3 flex-1">
                <div className="text-cyan-300 font-medium mb-1">🌉 BASE</div>
                <div className="text-gray-300">• HUB Token Rewards</div>
                <div className="text-gray-300">• Subscription System</div>
              </div>
              
              <div className="bg-gray-700/50 border border-yellow-500/20 rounded-lg p-3 flex-1">
                <div className="text-yellow-300 font-medium mb-1">📱 CELO</div>
                <div className="text-gray-300">• HC Token Mining</div>
                <div className="text-gray-300">• Daily CELO Rewards</div>
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

      {toastNotification && (
        <ToastNotification 
          notification={toastNotification}
          onOpenChat={openChatFromToast}
          onClose={() => setToastNotification(null)}
        />
      )}

      {isMobile ? (
        <div className="flex flex-col h-screen relative z-10 overflow-hidden">
          <Header
            isMobile={true}
            currentUser={userWithBalance}
            totalUnreadCount={totalUnreadCount}
            mobileView={mobileView}
            onMobileViewChange={setMobileView}
            activeDMChat={activeDMChat}
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
              <PublicChat 
                currentUser={userWithBalance}
                onUpdateLastSeen={updateUserLastSeen}
                onDeleteMessage={deleteMessage}
                onStartPrivateChat={handleStartPrivateChat}
                onViewProfile={handleViewProfile}
                updateUserMessageCount={updateUserMessageCount}
                isMobile={true}
              />
            )}
            
            {mobileView === 'users' && (
              <Sidebar
                isMobile={true}
                currentUser={userWithBalance}
                onlineUsers={onlineUsers}
                allUsers={allUsers}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                totalUnreadCount={totalUnreadCount}
                unreadCounts={unreadCounts}
                onStartPrivateChat={handleStartPrivateChat}
                activeDMChat={activeDMChat}
                onMobileViewChange={setMobileView}
                markAsRead={markAsRead}
                onShowUserProfile={handleShowMyProfile}
              />
            )}
            
            {mobileView === 'private' && activeDMChat && (
              <PrivateChat
                activeDMChat={activeDMChat}
                currentUser={userWithBalance}
                onClose={handleCloseDMChat}
                onMarkAsRead={markAsRead}
                isMobile={true}
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
            totalUnreadCount={totalUnreadCount}
            activeDMChat={activeDMChat}
            usersWithUnreadMessages={usersWithUnreadMessages}
            onStartPrivateChat={handleStartPrivateChat}
            markAsRead={markAsRead}
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
            totalUnreadCount={totalUnreadCount}
            unreadCounts={unreadCounts}
            onStartPrivateChat={startPrivateChat}
            activeDMChat={activeDMChat}
            markAsRead={markAsRead}
            onShowUserProfile={handleShowMyProfile}
          />

          <div className="flex-1 flex flex-col bg-gray-900/50 min-w-0 relative">
            <Header 
              currentUser={userWithBalance}
              totalUnreadCount={totalUnreadCount}
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
              <div className={`${activeDMChat ? 'flex-1' : 'w-full'} min-w-0`}>
                <PublicChat 
                  currentUser={userWithBalance}
                  onUpdateLastSeen={updateUserLastSeen}
                  onDeleteMessage={deleteMessage}
                  onStartPrivateChat={startPrivateChat}
                  onViewProfile={handleViewProfile}
                  updateUserMessageCount={updateUserMessageCount}
                />
              </div>

              {activeDMChat && (
                <PrivateChat
                  activeDMChat={activeDMChat}
                  currentUser={userWithBalance}
                  onClose={closeDMChat}
                  onMarkAsRead={markAsRead}
                />
              )}
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

      {showDMModal && selectedUser && (
        <PrivateChatModal
          selectedUser={selectedUser}
          privateMessage={privateMessage}
          setPrivateMessage={setPrivateMessage}
          onConfirm={() => confirmPrivateChat(privateMessage)}
          onClose={() => {
            setShowDMModal(false);
            setSelectedUser(null);
            setPrivateMessage('');
            if (isMobile) setMobileView('users');
          }}
          isStartingDM={isStartingDM}
          isConfirming={isConfirming}
          isMobile={isMobile}
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
    </div>
  );
}

export default App;