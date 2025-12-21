import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const useUsers = (address) => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

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

    return () => {
      unsubscribeUsers();
    };
  }, [address]);

  return {
    onlineUsers,
    allUsers
  };
};