// src/hooks/useChat.js
import { useState } from 'react';
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
import { useWriteContract } from 'wagmi';
import { db } from '../config/firebase';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../utils/constants';

export const useChat = (address, currentUser, allUsers) => {
  const [activeDMChat, setActiveDMChat] = useState(null);
  const [showDMModal, setShowDMModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isStartingDM, setIsStartingDM] = useState(false);
  
  const { writeContract } = useWriteContract();

  const startPrivateChat = async (user) => {
    const chatId = [address.toLowerCase(), user.walletAddress.toLowerCase()].sort().join('_');
    
    try {
      const chatDoc = await getDoc(doc(db, 'private_chats', chatId));
      
      if (chatDoc.exists()) {
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
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'sendMessage',
        args: [`[PRIVATE] ${privateMessage}`],
      });
      
      const chatId = [address.toLowerCase(), selectedUser.walletAddress.toLowerCase()].sort().join('_');
      
      await setDoc(doc(db, 'private_chats', chatId), {
        participants: [address.toLowerCase(), selectedUser.walletAddress.toLowerCase()],
        participantNames: {
          [address.toLowerCase()]: currentUser.nickname,
          [selectedUser.walletAddress.toLowerCase()]: selectedUser.nickname
        },
        participantAvatars: {
          [address.toLowerCase()]: currentUser.avatar,
          [selectedUser.walletAddress.toLowerCase()]: selectedUser.avatar
        },
        createdAt: serverTimestamp(),
        lastMessage: serverTimestamp(),
        lastMessageContent: privateMessage,
        paidBy: address.toLowerCase()
      });

      await addDoc(collection(db, 'private_chats', chatId, 'messages'), {
        content: privateMessage,
        sender: address.toLowerCase(),
        senderNickname: currentUser.nickname,
        senderAvatar: currentUser.avatar,
        timestamp: serverTimestamp(),
        isFirstMessage: true
      });

      setActiveDMChat({
        id: chatId,
        user: selectedUser,
        participantNames: {
          [address.toLowerCase()]: currentUser.nickname,
          [selectedUser.walletAddress.toLowerCase()]: selectedUser.nickname
        },
        participantAvatars: {
          [address.toLowerCase()]: currentUser.avatar,
          [selectedUser.walletAddress.toLowerCase()]: selectedUser.avatar
        }
      });

      setShowDMModal(false);
      setSelectedUser(null);
      
    } catch (error) {
      console.error('Failed to start private chat:', error);
      alert('Failed to start private chat: ' + error.message);
    } finally {
      setIsStartingDM(false);
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
    startPrivateChat,
    confirmPrivateChat,
    closeDMChat
  };
};