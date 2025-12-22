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
      }

      setCurrentSeason(season);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const distributeSeasonRewards = async () => {
    try {
      const season = getCurrentSeason();
      
      const usersSnapshot = await getDocs(collection(db, 'users'));
      
      const allUsers = usersSnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          id: doc.id, 
          ...data,
          season1_messages: Number(data.season1_messages) || 0,
          totalMessages: Number(data.totalMessages) || 0,
          badges: data.badges || []
        };
      });
      
      const sortedUsers = [...allUsers].sort((a, b) => {
        return b.season1_messages - a.season1_messages;
      });
      
      const topUsers = sortedUsers.slice(0, 10);
      
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
              [`${SEASON_CONFIG.currentSeason}_reward`]: badge.badge,
              season1_messages: Number(user.season1_messages) || 0
            });
          }
        }
      });

      const seasonRef = doc(db, 'seasons', SEASON_CONFIG.currentSeason);
      batch.update(seasonRef, {
        rewardsDistributed: true,
        distributedAt: new Date(),
        topUsersCount: topUsers.length,
        seasonEndDate: new Date()
      });

      await batch.commit();
      
      return {
        success: true,
        topUsers: topUsers.map((user, index) => ({
          rank: index + 1,
          nickname: user.nickname,
          walletAddress: user.walletAddress,
          messages: user.season1_messages,
          badge: getSeasonBadge(index + 1)?.badge || null
        }))
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
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
        
        if (seasonDoc.exists()) {
          const seasonData = seasonDoc.data();
          
          if (!seasonData.rewardsDistributed) {
            const result = await distributeSeasonRewards();
            return result;
          } else {
            return {
              success: true,
              alreadyDistributed: true
            };
          }
        }
      } else {
        return {
          success: true,
          seasonActive: true
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
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
          seasonMessages: Number(userData.season1_messages) || 0,
          seasonRank: userData.season1_rank || null,
          seasonReward: userData.season1_reward || null,
          badges: userData.badges || [],
          totalMessages: Number(userData.totalMessages) || 0
        };
      }
      
      return null;
    } catch (error) {
      return null;
    }
  };

  const validateUserData = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const issues = [];
      
      usersSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const id = doc.id;
        
        if (data.season1_messages === undefined || 
            data.season1_messages === null ||
            typeof data.season1_messages !== 'number') {
          issues.push({
            userId: id,
            field: 'season1_messages',
            value: data.season1_messages,
            nickname: data.nickname
          });
        }
        
        if (data.totalMessages === undefined || 
            data.totalMessages === null ||
            typeof data.totalMessages !== 'number') {
          issues.push({
            userId: id,
            field: 'totalMessages',
            value: data.totalMessages,
            nickname: data.nickname
          });
        }
      });
      
      return {
        totalUsers: usersSnapshot.docs.length,
        issues: issues,
        hasIssues: issues.length > 0
      };
      
    } catch (error) {
      return null;
    }
  };

  const fixUserData = async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        const updates = {};
        
        if (data.season1_messages === undefined || 
            data.season1_messages === null ||
            typeof data.season1_messages !== 'number') {
          updates.season1_messages = data.totalMessages || 0;
        }
        
        if (data.totalMessages === undefined || 
            data.totalMessages === null ||
            typeof data.totalMessages !== 'number') {
          updates.totalMessages = 0;
        }
        
        if (Object.keys(updates).length > 0) {
          await updateDoc(userRef, updates);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      return false;
    }
  };

  return {
    currentSeason,
    loading,
    distributeSeasonRewards,
    checkAndDistributeRewards,
    getUserSeasonStats,
    validateUserData,
    fixUserData
  };
};