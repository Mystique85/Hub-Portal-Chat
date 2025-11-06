// src/hooks/useReactions.js
import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  onSnapshot,
  arrayUnion,
  arrayRemove,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const useReactions = (messageId, currentUser) => {
  const [reactions, setReactions] = useState({});
  const [loading, setLoading] = useState(false);

  // Nasłuchuj zmian w reakcjach dla tego message
  useEffect(() => {
    if (!messageId || !db) return;

    const reactionsRef = collection(db, 'messages', messageId, 'reactions');
    const unsubscribe = onSnapshot(reactionsRef, (snapshot) => {
      const reactionsData = {};
      snapshot.docs.forEach(doc => {
        reactionsData[doc.id] = doc.data();
      });
      setReactions(reactionsData);
    });

    return () => unsubscribe();
  }, [messageId]);

  // Dodaj/usuń reakcję
  const toggleReaction = async (emoji) => {
    if (!currentUser || !messageId || !db) return;

    setLoading(true);
    try {
      const reactionRef = doc(db, 'messages', messageId, 'reactions', emoji);
      const reactionDoc = await getDoc(reactionRef);

      if (reactionDoc.exists()) {
        const reactionData = reactionDoc.data();
        
        // Sprawdź czy użytkownik już zareagował
        if (reactionData.users && reactionData.users.includes(currentUser.walletAddress)) {
          // Usuń reakcję
          if (reactionData.count === 1) {
            // Usuń cały dokument jeśli to ostatnia reakcja
            await setDoc(reactionRef, { 
              count: 0,
              users: [],
              lastUpdated: serverTimestamp()
            });
          } else {
            // Zmniejsz licznik i usuń użytkownika
            await updateDoc(reactionRef, {
              count: reactionData.count - 1,
              users: arrayRemove(currentUser.walletAddress),
              lastUpdated: serverTimestamp()
            });
          }
        } else {
          // Dodaj reakcję
          await updateDoc(reactionRef, {
            count: (reactionData.count || 0) + 1,
            users: arrayUnion(currentUser.walletAddress),
            lastUpdated: serverTimestamp()
          });
        }
      } else {
        // Tworzy nową reakcję
        await setDoc(reactionRef, {
          emoji: emoji,
          count: 1,
          users: [currentUser.walletAddress],
          lastUpdated: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error toggling reaction:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sprawdź czy użytkownik zareagował danym emoji
  const hasUserReacted = (emoji) => {
    if (!currentUser || !reactions[emoji] || !reactions[emoji].users) return false;
    return reactions[emoji].users.includes(currentUser.walletAddress);
  };

  return {
    reactions,
    toggleReaction,
    hasUserReacted,
    loading
  };
};