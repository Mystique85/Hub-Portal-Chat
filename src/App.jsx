import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

// Layout Components
import NetworkBackground from './components/layout/NetworkBackground';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import LoginHelpTooltip from './components/layout/LoginHelpTooltip';

// Chat Components
import PublicChat from './components/chat/PublicChat';
import PrivateChat from './components/chat/PrivateChat';

// Modal Components
import NicknameModal from './components/modals/NicknameModal';
import PrivateChatModal from './components/modals/PrivateChatModal';
import ToastNotification from './components/modals/ToastNotification';

// Hooks
import { useFirebase } from './hooks/useFirebase';
import { useUsers } from './hooks/useUsers';
import { useChat } from './hooks/useChat';
import { useWeb3 } from './hooks/useWeb3';

// Utils
import { AVAILABLE_AVATARS } from './utils/constants';

function App() {
  const { isConnected, address } = useAccount();
  
  // Custom Hooks
  const { 
    currentUser, 
    showNicknameModal, 
    setShowNicknameModal,
    registerUser,
    updateUserLastSeen,
    deleteMessage // DODANE: funkcja usuwania wiadomości
  } = useFirebase(address);

  const { 
    onlineUsers, 
    allUsers, 
    unreadCounts,
    totalUnreadCount,
    markAsRead // DODANE: funkcja oznaczania jako przeczytane
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

  // Local State
  const [activeTab, setActiveTab] = useState('online');
  const [privateMessage, setPrivateMessage] = useState('');
  const [nicknameInput, setNicknameInput] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🐶');
  const [toastNotification, setToastNotification] = useState(null);

  // Update user data with balance
  const userWithBalance = currentUser ? {
    ...currentUser,
    balance,
    remaining
  } : null;

  const openChatFromToast = async (userId) => {
    const user = allUsers.find(u => u.walletAddress === userId);
    if (user) {
      await startPrivateChat(user);
      setToastNotification(null);
    }
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
          
          {/* Connect Button - teraz sam */}
          <div className="flex justify-center mb-8">
            <ConnectButton />
          </div>
          
          {/* Feature boxes - ZASTĄPIONY 🌍 Celo Network z ❓ Quick Start */}
          <div className="flex justify-center gap-4 flex-wrap mt-8">
            <span className="px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-xl text-gray-300 text-sm">
              💎 Earn HC Tokens
            </span>
            <span className="px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-xl text-gray-300 text-sm">
              🔒 Private Messages
            </span>
            {/* ZASTĄPIONE: 🌍 Celo Network -> ❓ Quick Start */}
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
      
      {/* Toast Notifications */}
      {toastNotification && (
        <ToastNotification 
          notification={toastNotification}
          onOpenChat={openChatFromToast}
          onClose={() => setToastNotification(null)}
        />
      )}

      <div className="flex h-screen relative z-10">
        {/* Sidebar */}
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

        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-gray-900/50 min-w-0">
          <Header 
            currentUser={userWithBalance}
            totalUnreadCount={totalUnreadCount}
          />
          
          <PublicChat 
            currentUser={userWithBalance}
            onUpdateLastSeen={updateUserLastSeen}
            onDeleteMessage={deleteMessage} // DODANE: przekazanie funkcji usuwania
          />
        </div>

        {/* Private Chat Panel */}
        {activeDMChat && (
          <PrivateChat
            activeDMChat={activeDMChat}
            currentUser={userWithBalance}
            onClose={closeDMChat}
            onMarkAsRead={markAsRead} // DODANE: przekazanie funkcji oznaczania jako przeczytane
          />
        )}
      </div>

      {/* Modals */}
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