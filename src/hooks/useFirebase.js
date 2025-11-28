import { useState, useEffect } from 'react';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp,
  collection,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { CREATOR_ADDRESS, ADMIN_ADDRESSES } from '../utils/constants';
import { getCurrentSeason, isSeasonActive } from '../utils/seasons';
import { useNetwork } from '../hooks/useNetwork';

export const useFirebase = (address) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  
  // DODANE: Wykrywanie sieci
  const { isCelo, isBase, currentNetwork } = useNetwork();

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

  const updateUserMessageCount = async (walletAddress) => {
    if (!walletAddress || !db) return;
    
    try {
      const userRef = doc(db, 'users', walletAddress.toLowerCase());
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const currentCount = userDoc.data().totalMessages || 0;
        const season1Count = userDoc.data().season1_messages || 0;
        
        // DODANE: Aktualizuj odpowiednie pola w zależności od sieci
        const updates = {
          totalMessages: currentCount + 1,
          lastSeen: serverTimestamp(),
          lastMessageAt: serverTimestamp()
        };
        
        // DODANE: TYLKO na Celo aktualizuj licznik sezonu
        if (isSeasonActive() && isCelo) {
          updates.season1_messages = season1Count + 1;
          console.log(`✅ Zaktualizowano season1_messages dla ${walletAddress} na Celo`);
        }
        
        // DODANE: Aktualizuj licznik dla aktualnej sieci (dla statystyk)
        updates[`${currentNetwork}_messages`] = (userDoc.data()[`${currentNetwork}_messages`] || 0) + 1;
        
        await updateDoc(userRef, updates);
        
        console.log(`✅ Zaktualizowano licznik wiadomości dla ${walletAddress} na sieci ${currentNetwork}`);
      }
    } catch (error) {
      console.error('Error updating user message count:', error);
    }
  };

  // DODANE: Funkcja do migracji danych - PRZYWRACA season1_messages
  const migrateUserMessageCounts = async () => {
    if (!db) return;
    
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      for (const user of users) {
        // Policz wszystkie wiadomości użytkownika (dla kompatybilności)
        const allMessagesQuery = query(
          collection(db, 'messages'), 
          where('walletAddress', '==', user.walletAddress?.toLowerCase())
        );
        const allMessagesSnapshot = await getDocs(allMessagesQuery);
        const totalMessageCount = allMessagesSnapshot.size;
        
        // PRZYWRÓĆ season1_messages z totalMessages
        await updateDoc(doc(db, 'users', user.id), {
          season1_messages: user.totalMessages || totalMessageCount || 0
        });
        
        console.log(`✅ Zaktualizowano użytkownika ${user.nickname}: season1_messages = ${user.totalMessages || totalMessageCount}`);
      }
      
      console.log('✅ Migracja season1_messages zakończona');
    } catch (error) {
      console.error('Error migrating message counts:', error);
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
        nicknameLocked: address.toLowerCase() !== CREATOR_ADDRESS.toLowerCase(),
        totalMessages: 0,
        celo_messages: 0,
        base_messages: 0,
        season1_messages: 0, // ZACHOWUJEMY dla kompatybilności z rankingiem Celo
        badges: []
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
    deleteMessage,
    updateUserMessageCount,
    migrateUserMessageCounts
  };
};