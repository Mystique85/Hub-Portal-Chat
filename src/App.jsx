// App.js
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

import NetworkBackground from './components/layout/NetworkBackground';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import LoginHelpTooltip from './components/layout/LoginHelpTooltip';

import PublicChat from './components/chat/PublicChat';
import PrivateChat from './components/chat/PrivateChat';

import NicknameModal from './components/modals/NicknameModal';
import PrivateChatModal from './components/modals/PrivateChatModal';
import ToastNotification from './components/modals/ToastNotification';

import { useFirebase } from './hooks/useFirebase';
import { useUsers } from './hooks/useUsers';
import { useChat } from './hooks/useChat';
import { useWeb3 } from './hooks/useWeb3';

import { AVAILABLE_AVATARS } from './utils/constants';

function App() {
  const { isConnected, address } = useAccount();
  const [isMobile, setIsMobile] = useState(false);
  const [mobileView, setMobileView] = useState('public');
  const [showUserStats, setShowUserStats] = useState(false);
  const [activeTab, setActiveTab] = useState('online');
  
  const { 
    currentUser, 
    showNicknameModal, 
    setShowNicknameModal,
    registerUser,
    updateUserLastSeen,
    deleteMessage
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
    isStartingDM
  } = useChat(address, currentUser, allUsers);

  const { balance, remaining } = useWeb3(address);

  const [privateMessage, setPrivateMessage] = useState('');
  const [nicknameInput, setNicknameInput] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🐶');
  const [toastNotification, setToastNotification] = useState(null);

  const userWithBalance = currentUser ? {
    ...currentUser,
    balance,
    remaining
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

  const openChatFromToast = async (userId) => {
    const user = allUsers.find(u => u.walletAddress === userId);
    if (user) {
      await startPrivateChat(user);
      setToastNotification(null);
      if (isMobile) setMobileView('private');
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

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4 relative">
        <NetworkBackground />
        
        <div className="text-center bg-gray-800/70 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-12 max-w-md w-full relative z-10">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center">
            <img 
              src="/hublogo.svg" 
              alt="HUB Portal" 
              className="w-12 h-12"
            />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4">
            HUB Portal
          </h1>
          <p className="text-gray-400 text-lg mb-8">Decentralized Social Chat on Celo</p>
          
          <div className="flex justify-center mb-8">
            <ConnectButton />
          </div>
          
          <div className="flex justify-center gap-4 flex-wrap mt-8">
            <span className="px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-xl text-gray-300 text-sm">
              💎 Earn HC Tokens
            </span>
            <span className="px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-xl text-gray-300 text-sm">
              🔒 Private Messages
            </span>
            <LoginHelpTooltip />
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-center z-10">
          <div className="flex items-center gap-4 bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl px-6 py-3">
            <img 
              src="/hublogo.svg" 
              alt="HUB Ecosystem" 
              className="w-6 h-6"
            />
            <div className="text-left">
              <p className="text-gray-400 text-xs font-light">
                © 2025 HUB Ecosystem. All rights reserved.
              </p>
              <p className="text-gray-500 text-xs">
                Project by <span className="text-cyan-400 font-medium">@Mysticpol</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white overflow-hidden">
      <NetworkBackground />
      
      {toastNotification && (
        <ToastNotification 
          notification={toastNotification}
          onOpenChat={openChatFromToast}
          onClose={() => setToastNotification(null)}
        />
      )}

      {isMobile ? (
        <div className="flex flex-col h-screen relative z-10">
          <Header
            isMobile={true}
            currentUser={userWithBalance}
            totalUnreadCount={totalUnreadCount}
            mobileView={mobileView}
            onMobileViewChange={setMobileView}
            onUserStatsClick={() => setShowUserStats(true)}
            activeDMChat={activeDMChat}
          />
          
          <div className="flex-1 overflow-auto bg-gray-900/50">
            {mobileView === 'public' && (
              <PublicChat 
                currentUser={userWithBalance}
                onUpdateLastSeen={updateUserLastSeen}
                onDeleteMessage={deleteMessage}
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
          </div>

          {showUserStats && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-gray-800 border-2 border-cyan-500/40 rounded-2xl w-full max-w-sm">
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                  <h3 className="text-lg font-bold text-cyan-400">My Profile</h3>
                  <button 
                    onClick={() => setShowUserStats(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-xl">
                      {currentUser?.avatar}
                    </div>
                    <div>
                      <div className="text-white font-semibold">{currentUser?.nickname}</div>
                      <div className="text-gray-400 text-sm">{address?.slice(0, 8)}...{address?.slice(-6)}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-700/50 rounded-xl p-3 text-center">
                      <div className="text-cyan-400 font-bold">{balance || '0'}</div>
                      <div className="text-gray-400 text-xs">HC Balance</div>
                    </div>
                    <div className="bg-gray-700/50 rounded-xl p-3 text-center">
                      <div className="text-cyan-400 font-bold">{remaining || '0'}/10</div>
                      <div className="text-gray-400 text-xs">Rewards Left</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <button className="w-full flex items-center gap-2 p-3 bg-gray-700/50 rounded-xl hover:bg-gray-700 transition-all">
                      💝 Support Project
                    </button>
                    <button className="w-full flex items-center gap-2 p-3 bg-gray-700/50 rounded-xl hover:bg-gray-700 transition-all">
                      🌐 Celo Ecosystem Hub
                    </button>
                    <button className="w-full flex items-center gap-2 p-3 bg-gray-700/50 rounded-xl hover:bg-gray-700 transition-all">
                      ❓ Quick Guide
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
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
          />

          <div className="flex-1 flex flex-col bg-gray-900/50 min-w-0">
            <Header 
              currentUser={userWithBalance}
              totalUnreadCount={totalUnreadCount}
            />
            
            <PublicChat 
              currentUser={userWithBalance}
              onUpdateLastSeen={updateUserLastSeen}
              onDeleteMessage={deleteMessage}
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
          }}
          isStartingDM={isStartingDM}
        />
      )}
    </div>
  );
}

export default App;