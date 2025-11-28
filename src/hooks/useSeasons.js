import { useState, useEffect } from 'react';
import { doc, setDoc, getDoc, updateDoc, collection, query, orderBy, limit, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../config/firebase';
import { SEASON_CONFIG, getCurrentSeason, getSeasonBadge } from '../utils/seasons';

export const useSeasons = () => {
  const [currentSeason, setCurrentSeason] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeSeason();
  }, []);

  const initializeSeason = async () => {
    try {
      const season = getCurrentSeason();
      const seasonRef = doc(db, 'seasons', SEASON_CONFIG.currentSeason);
      const seasonDoc = await getDoc(seasonRef);

      if (!seasonDoc.exists()) {
        await setDoc(seasonRef, {
          name: season.name,
          displayName: season.displayName,
          startDate: season.startDate,
          endDate: season.endDate,
          isActive: season.isActive,
          totalParticipants: 0,
          rewardsDistributed: false,
          createdAt: new Date()
        });
        console.log('✅ Season initialized in Firestore');
      }

      setCurrentSeason(season);
    } catch (error) {
      console.error('Error initializing season:', error);
    } finally {
      setLoading(false);
    }
  };

  const distributeSeasonRewards = async () => {
    try {
      const season = getCurrentSeason();
      
      // POPRAWIONE: Używamy season1_messages dla kompatybilności z istniejącymi danymi
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('season1_messages', 'desc'), // Używamy starego pola dla kompatybilności
        limit(10)
      );
      
      const usersSnapshot = await getDocs(usersQuery);
      const topUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const batch = writeBatch(db);
      
      topUsers.forEach((user, index) => {
        const rank = index + 1;
        const badge = getSeasonBadge(rank);
        
        if (badge) {
          const userRef = doc(db, 'users', user.id);
          const userBadges = user.badges || [];
          
          if (!userBadges.includes(badge.badge)) {
            batch.update(userRef, {
              badges: [...userBadges, badge.badge],
              [`${SEASON_CONFIG.currentSeason}_rank`]: rank,
              [`${SEASON_CONFIG.currentSeason}_reward`]: badge.badge
            });
          }
        }
      });

      const seasonRef = doc(db, 'seasons', SEASON_CONFIG.currentSeason);
      batch.update(seasonRef, {
        rewardsDistributed: true,
        distributedAt: new Date()
      });

      await batch.commit();
      console.log('✅ Season rewards distributed to top 10 users');
      
    } catch (error) {
      console.error('Error distributing season rewards:', error);
    }
  };

  const checkAndDistributeRewards = async () => {
    try {
      const season = getCurrentSeason();
      const now = new Date();
      const endDate = new Date(season.endDate);
      
      if (now > endDate) {
        const seasonRef = doc(db, 'seasons', SEASON_CONFIG.currentSeason);
        const seasonDoc = await getDoc(seasonRef);
        
        if (seasonDoc.exists() && !seasonDoc.data().rewardsDistributed) {
          await distributeSeasonRewards();
        }
      }
    } catch (error) {
      console.error('Error checking season rewards:', error);
    }
  };

  const getUserSeasonStats = async (walletAddress) => {
    try {
      if (!walletAddress) return null;
      
      const userRef = doc(db, 'users', walletAddress.toLowerCase());
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          seasonMessages: userData.season1_messages || 0,
          seasonRank: userData.season1_rank || null,
          seasonReward: userData.season1_reward || null,
          badges: userData.badges || []
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user season stats:', error);
      return null;
    }
  };

  return {
    currentSeason,
    loading,
    distributeSeasonRewards,
    checkAndDistributeRewards,
    getUserSeasonStats
  };
};