// src/hooks/useUsers.js
import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot,
  where
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const useUsers = (address, currentUser) => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [privateChats, setPrivateChats] = useState([]);

  useEffect(() => {
    if (!address || !db) return;

    // Query dla WSZYSTKICH użytkowników (w kolejności rejestracji)
    const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAllUsers(usersData);
      
      // ONLINE: użytkownicy aktywni w ciągu ostatnich 10 MINUT
      const online = usersData.filter(user => {
        if (!user.lastSeen) return false;
        try {
          const lastSeen = user.lastSeen.toDate();
          const now = new Date();
          const diffInMinutes = (now - lastSeen) / (1000 * 60);
          return diffInMinutes < 10; // 10 MINUT
        } catch (error) {
          console.error('Error checking user online status:', error);
          return false;
        }
      });
      setOnlineUsers(online);
    });

    const privateChatsQuery = query(
      collection(db, 'private_chats'),
      where('participants', 'array-contains', address.toLowerCase())
    );
    
    const unsubscribePrivateChats = onSnapshot(privateChatsQuery, (snapshot) => {
      const chatsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPrivateChats(chatsData);
    });

    return () => {
      unsubscribeUsers();
      unsubscribePrivateChats();
    };
  }, [address]);

  // Calculate unread counts
  useEffect(() => {
    if (!privateChats.length || !address || !allUsers.length) return;

    const newUnreadCounts = {};
    
    privateChats.forEach(chat => {
      const otherParticipant = chat.participants.find(p => p !== address.toLowerCase());
      
      if (otherParticipant) {
        // Tutaj możesz dodać logikę obliczania nieprzeczytanych wiadomości
        newUnreadCounts[otherParticipant] = 0;
      }
    });
    
    setUnreadCounts(newUnreadCounts);
  }, [privateChats, address, allUsers]);

  const totalUnreadCount = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

  return {
    onlineUsers,
    allUsers,
    unreadCounts,
    totalUnreadCount,
    privateChats
  };
};