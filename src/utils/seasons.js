export const SEASON_CONFIG = {
  currentSeason: 'season1',
  seasons: {
    season1: {
      name: "Season 1",
      displayName: "HUB Chat Season 1",
      startDate: new Date('2025-11-23T00:00:00Z'),
      endDate: new Date('2026-02-22T23:59:59Z'),
      isActive: true,
      rewards: {
        1: { badge: "HUB Sovereign", type: "legendary" },
        2: { badge: "HUB Ambassador", type: "epic" },
        3: { badge: "HUB Ambassador", type: "epic" },
        4: { badge: "HUB Contributor", type: "rare" },
        5: { badge: "HUB Contributor", type: "rare" },
        6: { badge: "HUB Contributor", type: "rare" },
        7: { badge: "HUB Contributor", type: "rare" },
        8: { badge: "HUB Contributor", type: "rare" },
        9: { badge: "HUB Contributor", type: "rare" },
        10: { badge: "HUB Contributor", type: "rare" }
      }
    }
  }
};

export const getCurrentSeason = () => {
  return SEASON_CONFIG.seasons[SEASON_CONFIG.currentSeason];
};

export const getDaysRemaining = () => {
  const season = getCurrentSeason();
  const now = new Date();
  const end = new Date(season.endDate);
  const diffTime = end - now;
  
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
  
  return {
    days: Math.max(0, diffDays),
    hours: Math.max(0, diffHours),
    minutes: Math.max(0, diffMinutes),
    fullText: `${Math.max(0, diffDays)}d ${Math.max(0, diffHours)}h ${Math.max(0, diffMinutes)}m`
  };
};

export const isSeasonActive = () => {
  const season = getCurrentSeason();
  const now = new Date();
  return now >= season.startDate && now <= season.endDate;
};

export const getSeasonBadge = (rank) => {
  const season = getCurrentSeason();
  return season.rewards[rank] || null;
};