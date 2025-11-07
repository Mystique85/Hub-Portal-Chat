import { useState, useEffect } from 'react';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { CREATOR_ADDRESS, ADMIN_ADDRESSES } from '../utils/constants';

export const useFirebase = (address) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [showNicknameModal, setShowNicknameModal] = useState(false);

  useEffect(() => {
    if (address) {
      checkUserRegistration(address);
    } else {
      setCurrentUser(null);
    }
  }, [address]);

  const checkUserRegistration = async (walletAddress) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', walletAddress.toLowerCase()));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setCurrentUser(userData);
        localStorage.setItem('hub_portal_user_data', JSON.stringify(userData));
        updateUserLastSeen(walletAddress);
      } else {
        setShowNicknameModal(true);
      }
    } catch (error) {
      console.error('Error checking user registration:', error);
      setShowNicknameModal(true);
    }
  };

  const updateUserLastSeen = async (walletAddress) => {
    if (!walletAddress || !db) return;
    try {
      const userRef = doc(db, 'users', walletAddress.toLowerCase());
      await updateDoc(userRef, {
        lastSeen: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating last seen:', error);
    }
  };

  const registerUser = async (nickname, avatar) => {
    if (!address || nickname.length < 3) {
      alert('Nickname must be at least 3 characters long');
      return;
    }

    try {
      const userData = {
        walletAddress: address.toLowerCase(),
        nickname: nickname,
        avatar: avatar,
        avatarType: 'emoji',
        isRegistered: true,
        createdAt: serverTimestamp(),
        lastSeen: serverTimestamp(),
        nicknameLocked: address.toLowerCase() !== CREATOR_ADDRESS.toLowerCase()
      };

      await setDoc(doc(db, 'users', address.toLowerCase()), userData);
      
      setCurrentUser(userData);
      localStorage.setItem('hub_portal_user_data', JSON.stringify(userData));
      setShowNicknameModal(false);
      
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Failed to register user');
    }
  };

  // DODANA FUNKCJA: Usuwanie wiadomości (tylko dla adminów)
  const deleteMessage = async (messageId) => {
    if (!address || !ADMIN_ADDRESSES.includes(address.toLowerCase())) {
      alert('Only admins can delete messages');
      return false;
    }

    try {
      await deleteDoc(doc(db, 'messages', messageId));
      console.log('✅ Message deleted successfully');
      return true;
    } catch (error) {
      console.error('❌ Error deleting message:', error);
      alert('Failed to delete message: ' + error.message);
      return false;
    }
  };

  return {
    currentUser,
    showNicknameModal,
    setShowNicknameModal,
    registerUser,
    updateUserLastSeen,
    deleteMessage // DODANE: funkcja usuwania
  };
};