// src/hooks/useUsers.js
import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot,
  where,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const useUsers = (address, currentUser) => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [privateChats, setPrivateChats] = useState([]);
  const [messageListeners, setMessageListeners] = useState({});
  const [readStatus, setReadStatus] = useState({});

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

    // Załaduj read status z Firestore
    const loadReadStatus = async () => {
      try {
        const readStatusDoc = await getDoc(doc(db, 'user_read_status', address.toLowerCase()));
        if (readStatusDoc.exists()) {
          setReadStatus(readStatusDoc.data().readStatus || {});
        }
      } catch (error) {
        console.error('Error loading read status:', error);
      }
    };
    
    loadReadStatus();

    return () => {
      unsubscribeUsers();
      unsubscribePrivateChats();
      // Cleanup message listeners
      Object.values(messageListeners).forEach(unsubscribe => unsubscribe());
    };
  }, [address]);

  // Calculate unread counts - POPRAWIONA WERSJA Z PERSISTENT STATUS
  useEffect(() => {
    if (!privateChats.length || !address || !db) return;

    const newUnreadCounts = {};
    const newMessageListeners = {};
    
    privateChats.forEach(chat => {
      const otherParticipant = chat.participants.find(p => p !== address.toLowerCase());
      
      if (otherParticipant) {
        // Subskrybuj do wiadomości w tym chacie
        const messagesQuery = query(
          collection(db, 'private_chats', chat.id, 'messages'),
          orderBy('timestamp', 'desc')
        );
        
        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
          const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          // Pobierz ostatni przeczytany timestamp dla tego chatu
          const chatReadStatus = readStatus[chat.id];
          const lastReadTimestamp = chatReadStatus?.lastReadTimestamp;
          
          // Licz nieprzeczytane wiadomości (tylko te po ostatnim przeczytaniu)
          const unread = messages.filter(msg => {
            // Wiadomość od innego użytkownika
            const isFromOtherUser = msg.sender !== address.toLowerCase();
            
            // Konwersja timestampa wiadomości do Date
            let messageDate;
            if (msg.timestamp && typeof msg.timestamp.toDate === 'function') {
              messageDate = msg.timestamp.toDate();
            } else if (msg.timestamp) {
              messageDate = new Date(msg.timestamp);
            } else {
              messageDate = new Date(); // fallback
            }
            
            // Konwersja lastReadTimestamp do Date
            let lastReadDate = null;
            if (lastReadTimestamp) {
              if (typeof lastReadTimestamp.toDate === 'function') {
                lastReadDate = lastReadTimestamp.toDate();
              } else if (lastReadTimestamp.seconds) {
                // Jeśli to obiekt Firestore Timestamp z seconds i nanoseconds
                lastReadDate = new Date(lastReadTimestamp.seconds * 1000);
              } else {
                lastReadDate = new Date(lastReadTimestamp);
              }
            }
            
            // Wiadomość jest nieprzeczytana jeśli nie ma lastReadDate lub jest nowsza
            const isUnread = !lastReadDate || messageDate > lastReadDate;
            
            return isFromOtherUser && isUnread;
          }).length;
          
          setUnreadCounts(prev => ({
            ...prev, 
            [otherParticipant]: unread
          }));
        });
        
        newMessageListeners[chat.id] = unsubscribe;
      }
    });
    
    setMessageListeners(prev => ({
      ...prev,
      ...newMessageListeners
    }));

    return () => {
      Object.values(newMessageListeners).forEach(unsubscribe => unsubscribe());
    };
  }, [privateChats, address, readStatus]);

  // Funkcja do oznaczania wiadomości jako przeczytane (PERSISTENT)
  const markAsRead = async (userAddress) => {
    if (!address || !userAddress) return;
    
    // Znajdź chat z tym użytkownikiem
    const chat = privateChats.find(chat => 
      chat.participants.includes(userAddress.toLowerCase())
    );
    
    if (!chat) return;
    
    try {
      // Użyj normalnego Date zamiast serverTimestamp() dla read status
      const now = new Date();
      
      // Zaktualizuj read status w Firestore
      const readStatusRef = doc(db, 'user_read_status', address.toLowerCase());
      await setDoc(readStatusRef, {
        userId: address.toLowerCase(),
        readStatus: {
          ...readStatus,
          [chat.id]: {
            lastReadTimestamp: now.toISOString(), // Zapisujemy jako string ISO
            lastReadAt: now.toISOString()
          }
        }
      }, { merge: true });
      
      // Zaktualizuj stan lokalny
      setReadStatus(prev => ({
        ...prev,
        [chat.id]: {
          lastReadTimestamp: now.toISOString(),
          lastReadAt: now.toISOString()
        }
      }));
      
      // Resetuj licznik lokalnie
      setUnreadCounts(prev => ({
        ...prev,
        [userAddress.toLowerCase()]: 0
      }));
      
      console.log(`📨 Oznaczono wiadomości od ${userAddress} jako przeczytane`);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const totalUnreadCount = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

  return {
    onlineUsers,
    allUsers,
    unreadCounts,
    totalUnreadCount,
    privateChats,
    markAsRead
  };
};