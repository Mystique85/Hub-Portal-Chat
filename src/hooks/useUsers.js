import { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot,
  where,
  doc,
  getDoc,
  setDoc,
  Timestamp,
  getDocs
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const useUsers = (address) => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [privateChats, setPrivateChats] = useState([]);
  const [readStatus, setReadStatus] = useState({});
  
  const listenersRef = useRef({});

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
      const readStatusDoc = await getDoc(doc(db, 'user_read_status', address.toLowerCase()));
      if (readStatusDoc.exists()) {
        setReadStatus(readStatusDoc.data().readStatus || {});
      }
    };
    
    loadReadStatus();

    return () => {
      unsubscribeUsers();
      unsubscribePrivateChats();
      Object.values(listenersRef.current).forEach(unsubscribe => unsubscribe());
    };
  }, [address]);

  useEffect(() => {
    if (!privateChats.length || !address || !db) return;

    let isActive = true;

    const checkUnreadMessages = async () => {
      if (!isActive) return;
      
      const newUnreadCounts = {};
      
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentChats = privateChats.filter(chat => {
        const lastMsg = chat.lastMessage?.toDate?.() || new Date(chat.createdAt?.toDate?.() || 0);
        return lastMsg > weekAgo;
      });
      
      const promises = recentChats.map(async (chat) => {
        const otherParticipant = chat.participants.find(p => p !== address.toLowerCase());
        if (!otherParticipant) return null;

        const twentyFourHoursAgo = Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000));
        
        const messagesQuery = query(
          collection(db, 'private_chats', chat.id, 'messages'),
          where('timestamp', '>', twentyFourHoursAgo),
          orderBy('timestamp', 'desc')
        );
        
        const snapshot = await getDocs(messagesQuery);
        const messages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        const chatReadStatus = readStatus[chat.id];
        const lastReadTimestamp = chatReadStatus?.lastReadTimestamp;
        
        const unread = messages.filter(msg => {
          if (msg.sender === address.toLowerCase()) return false;
          
          let messageDate;
          if (msg.timestamp?.toDate) {
            messageDate = msg.timestamp.toDate();
          } else if (msg.timestamp) {
            messageDate = new Date(msg.timestamp);
          } else {
            messageDate = new Date();
          }
          
          let lastReadDate = null;
          if (lastReadTimestamp?.toDate) {
            lastReadDate = lastReadTimestamp.toDate();
          } else if (lastReadTimestamp?.seconds) {
            lastReadDate = new Date(lastReadTimestamp.seconds * 1000);
          } else if (lastReadTimestamp) {
            lastReadDate = new Date(lastReadTimestamp);
          }
          
          return !lastReadDate || messageDate > lastReadDate;
        }).length;
        
        return { otherParticipant, unread };
      });

      const results = await Promise.all(promises);
      
      results.forEach(result => {
        if (result) {
          newUnreadCounts[result.otherParticipant] = result.unread;
        }
      });
      
      if (isActive) {
        setUnreadCounts(newUnreadCounts);
      }
    };

    checkUnreadMessages();
    
    const intervalId = setInterval(checkUnreadMessages, 30000);
    
    const veryRecentChats = privateChats.filter(chat => {
      const lastMsg = chat.lastMessage?.toDate?.() || new Date();
      const minutesSinceLastMsg = (Date.now() - lastMsg.getTime()) / (1000 * 60);
      return minutesSinceLastMsg < 5;
    });
    
    const limitedChats = veryRecentChats.slice(0, 5);
    
    limitedChats.forEach(chat => {
      const otherParticipant = chat.participants.find(p => p !== address.toLowerCase());
      if (!otherParticipant) return;
      
      const messagesQuery = query(
        collection(db, 'private_chats', chat.id, 'messages'),
        orderBy('timestamp', 'desc'),
        where('timestamp', '>', Timestamp.fromDate(new Date(Date.now() - 30 * 60 * 1000)))
      );
      
      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        const chatReadStatus = readStatus[chat.id];
        const lastReadTimestamp = chatReadStatus?.lastReadTimestamp;
        
        const unread = messages.filter(msg => {
          if (msg.sender === address.toLowerCase()) return false;
          
          let messageDate;
          if (msg.timestamp?.toDate) {
            messageDate = msg.timestamp.toDate();
          } else if (msg.timestamp) {
            messageDate = new Date(msg.timestamp);
          } else {
            messageDate = new Date();
          }
          
          let lastReadDate = null;
          if (lastReadTimestamp?.toDate) {
            lastReadDate = lastReadTimestamp.toDate();
          } else if (lastReadTimestamp?.seconds) {
            lastReadDate = new Date(lastReadTimestamp.seconds * 1000);
          } else if (lastReadTimestamp) {
            lastReadDate = new Date(lastReadTimestamp);
          }
          
          return !lastReadDate || messageDate > lastReadDate;
        }).length;
        
        setUnreadCounts(prev => ({
          ...prev, 
          [otherParticipant]: unread
        }));
      });
      
      listenersRef.current[chat.id] = unsubscribe;
    });

    return () => {
      isActive = false;
      clearInterval(intervalId);
      limitedChats.forEach(chat => {
        if (listenersRef.current[chat.id]) {
          listenersRef.current[chat.id]();
          delete listenersRef.current[chat.id];
        }
      });
    };
  }, [privateChats, address, readStatus]);

  const markAsRead = async (userAddress) => {
    if (!address || !userAddress) return;
    
    const chat = privateChats.find(chat => 
      chat.participants.includes(userAddress.toLowerCase())
    );
    
    if (!chat) return;
    
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