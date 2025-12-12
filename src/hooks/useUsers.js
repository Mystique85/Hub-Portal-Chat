import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot,
  where,
  doc,
  getDoc,
  setDoc
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

    const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAllUsers(usersData);
      
      const online = usersData.filter(user => {
        if (!user.lastSeen) return false;
        try {
          const lastSeen = user.lastSeen.toDate();
          const now = new Date();
          const diffInMinutes = (now - lastSeen) / (1000 * 60);
          return diffInMinutes < 45;
        } catch (error) {
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

    const loadReadStatus = async () => {
      try {
        const readStatusDoc = await getDoc(doc(db, 'user_read_status', address.toLowerCase()));
        if (readStatusDoc.exists()) {
          setReadStatus(readStatusDoc.data().readStatus || {});
        }
      } catch (error) {}
    };
    
    loadReadStatus();

    return () => {
      unsubscribeUsers();
      unsubscribePrivateChats();
      Object.values(messageListeners).forEach(unsubscribe => unsubscribe());
    };
  }, [address]);

  useEffect(() => {
    if (!privateChats.length || !address || !db) return;

    const newUnreadCounts = {};
    const newMessageListeners = {};
    
    privateChats.forEach(chat => {
      const otherParticipant = chat.participants.find(p => p !== address.toLowerCase());
      
      if (otherParticipant) {
        const messagesQuery = query(
          collection(db, 'private_chats', chat.id, 'messages'),
          orderBy('timestamp', 'desc')
        );
        
        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
          const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          const chatReadStatus = readStatus[chat.id];
          const lastReadTimestamp = chatReadStatus?.lastReadTimestamp;
          
          const unread = messages.filter(msg => {
            const isFromOtherUser = msg.sender !== address.toLowerCase();
            
            let messageDate;
            if (msg.timestamp && typeof msg.timestamp.toDate === 'function') {
              messageDate = msg.timestamp.toDate();
            } else if (msg.timestamp) {
              messageDate = new Date(msg.timestamp);
            } else {
              messageDate = new Date();
            }
            
            let lastReadDate = null;
            if (lastReadTimestamp) {
              if (typeof lastReadTimestamp.toDate === 'function') {
                lastReadDate = lastReadTimestamp.toDate();
              } else if (lastReadTimestamp.seconds) {
                lastReadDate = new Date(lastReadTimestamp.seconds * 1000);
              } else {
                lastReadDate = new Date(lastReadTimestamp);
              }
            }
            
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

  const markAsRead = async (userAddress) => {
    if (!address || !userAddress) return;
    
    const chat = privateChats.find(chat => 
      chat.participants.includes(userAddress.toLowerCase())
    );
    
    if (!chat) return;
    
    try {
      const now = new Date();
      
      const readStatusRef = doc(db, 'user_read_status', address.toLowerCase());
      await setDoc(readStatusRef, {
        userId: address.toLowerCase(),
        readStatus: {
          ...readStatus,
          [chat.id]: {
            lastReadTimestamp: now.toISOString(),
            lastReadAt: now.toISOString()
          }
        }
      }, { merge: true });
      
      setReadStatus(prev => ({
        ...prev,
        [chat.id]: {
          lastReadTimestamp: now.toISOString(),
          lastReadAt: now.toISOString()
        }
      }));
      
      setUnreadCounts(prev => ({
        ...prev,
        [userAddress.toLowerCase()]: 0
      }));
    } catch (error) {}
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