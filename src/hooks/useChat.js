// src/hooks/useChat.js
import { useState, useEffect } from 'react';
import { 
  doc, 
  getDoc, 
  setDoc,
  collection,
  addDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useNetwork } from './useNetwork';
import { db } from '../config/firebase';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../utils/constants';

export const useChat = (address, currentUser, allUsers) => {
  const [activeDMChat, setActiveDMChat] = useState(null);
  const [showDMModal, setShowDMModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isStartingDM, setIsStartingDM] = useState(false);
  const [pendingFirstMessage, setPendingFirstMessage] = useState(null);
  
  const { writeContract, data: transactionHash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: transactionHash,
  });
  
  const { currentNetwork, isCelo } = useNetwork();

  // Obsługa potwierdzenia transakcji dla pierwszej wiadomości
  useEffect(() => {
    if (isConfirmed && pendingFirstMessage && selectedUser) {
      // Transakcja potwierdzona - teraz tworzymy chat
      createPrivateChatAfterConfirmation(pendingFirstMessage);
      setPendingFirstMessage(null);
    }
  }, [isConfirmed, pendingFirstMessage, selectedUser]);

  const startPrivateChat = async (user) => {
    const chatId = [address.toLowerCase(), user.walletAddress.toLowerCase()].sort().join('_');
    
    try {
      const chatDoc = await getDoc(doc(db, 'private_chats', chatId));
      
      if (chatDoc.exists()) {
        // Chat już istnieje - otwórz go bez transakcji
        setActiveDMChat({
          id: chatId,
          user: user,
          participantNames: {
            [address.toLowerCase()]: currentUser.nickname,
            [user.walletAddress.toLowerCase()]: user.nickname
          },
          participantAvatars: {
            [address.toLowerCase()]: currentUser.avatar,
            [user.walletAddress.toLowerCase()]: user.avatar
          }
        });
        setShowDMModal(false);
      } else {
        // Nowy chat - pokaż modal (pierwsza wiadomość wymaga transakcji)
        setSelectedUser(user);
        setShowDMModal(true);
      }
    } catch (error) {
      console.error('Error checking chat status:', error);
      setSelectedUser(user);
      setShowDMModal(true);
    }
  };

  const confirmPrivateChat = async (privateMessage) => {
    if (!selectedUser || !privateMessage.trim()) return;
    
    setIsStartingDM(true);
    
    try {
      // ZAPISZ dane wiadomości
      setPendingFirstMessage({
        content: privateMessage,
        selectedUser: selectedUser
      });
      
      // Wyślij transakcję na łańcuchu (tylko pierwsza wiadomość)
      writeContract({
        address: CONTRACT_ADDRESSES[currentNetwork],
        abi: CONTRACT_ABIS[currentNetwork],
        functionName: 'sendMessage',
        args: [`[PRIVATE] ${privateMessage}`],
      });
      
      // NIE dodawaj jeszcze nic do Firestore!
      // Czekamy na isConfirmed w useEffect
      
    } catch (error) {
      console.error('Failed to start private chat:', error);
      alert('Failed to start private chat: ' + error.message);
      setIsStartingDM(false);
      setPendingFirstMessage(null);
    }
  };

  const createPrivateChatAfterConfirmation = async (messageData) => {
    try {
      const { content, selectedUser: user } = messageData;
      
      if (!user || !currentUser || !address) return;
      
      const chatId = [address.toLowerCase(), user.walletAddress.toLowerCase()].sort().join('_');
      
      // Teraz dopiero tworzymy chat w Firestore (po potwierdzeniu transakcji)
      await setDoc(doc(db, 'private_chats', chatId), {
        participants: [address.toLowerCase(), user.walletAddress.toLowerCase()],
        participantNames: {
          [address.toLowerCase()]: currentUser.nickname,
          [user.walletAddress.toLowerCase()]: user.nickname
        },
        participantAvatars: {
          [address.toLowerCase()]: currentUser.avatar,
          [user.walletAddress.toLowerCase()]: user.avatar
        },
        createdAt: serverTimestamp(),
        lastMessage: serverTimestamp(),
        lastMessageContent: content,
        paidBy: address.toLowerCase(),
        network: currentNetwork,
        transactionHash: transactionHash // Zapisz hash transakcji
      });

      // Dodaj pierwszą wiadomość
      await addDoc(collection(db, 'private_chats', chatId, 'messages'), {
        content: content,
        sender: address.toLowerCase(),
        senderNickname: currentUser.nickname,
        senderAvatar: currentUser.avatar,
        timestamp: serverTimestamp(),
        isFirstMessage: true,
        network: currentNetwork,
        transactionHash: transactionHash
      });

      // Ustaw aktywny chat
      setActiveDMChat({
        id: chatId,
        user: user,
        participantNames: {
          [address.toLowerCase()]: currentUser.nickname,
          [user.walletAddress.toLowerCase()]: user.nickname
        },
        participantAvatars: {
          [address.toLowerCase()]: currentUser.avatar,
          [user.walletAddress.toLowerCase()]: user.avatar
        }
      });

      // Zamknij modal
      setShowDMModal(false);
      setSelectedUser(null);
      setIsStartingDM(false);
      
      console.log('✅ Private chat created after transaction confirmation');
      
    } catch (error) {
      console.error('Failed to create chat after transaction:', error);
      alert('Chat creation failed after transaction');
      setIsStartingDM(false);
      setShowDMModal(false);
      setSelectedUser(null);
    }
  };

  const closeDMChat = () => {
    setActiveDMChat(null);
  };

  return {
    activeDMChat,
    setActiveDMChat,
    showDMModal,
    setShowDMModal,
    selectedUser,
    setSelectedUser,
    isStartingDM,
    isConfirming,
    startPrivateChat,
    confirmPrivateChat,
    closeDMChat
  };
};