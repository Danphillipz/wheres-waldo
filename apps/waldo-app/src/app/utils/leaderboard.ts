export interface LeaderboardEntry {
  name: string;
  score: number;
  foundImages: number;
  timestamp: number;
}

const LEADERBOARD_KEY = 'wheres-waldo-leaderboard';
const MAX_ENTRIES = 10;

export function getLeaderboard(): LeaderboardEntry[] {
  try {
    const stored = localStorage.getItem(LEADERBOARD_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading leaderboard:', error);
  }
  return [];
}

export function addToLeaderboard(entry: Omit<LeaderboardEntry, 'timestamp'>): void {
  const leaderboard = getLeaderboard();
  
  const newEntry: LeaderboardEntry = {
    ...entry,
    timestamp: Date.now(),
  };
  
  leaderboard.push(newEntry);
  
  // Sort by found images (higher is better), then by score (lower is better - fewer attempts)
  leaderboard.sort((a, b) => {
    if (a.foundImages !== b.foundImages) {
      return b.foundImages - a.foundImages; // More found images is better
    }
    return a.score - b.score; // Fewer attempts is better
  });
  
  // Keep only top entries
  const topEntries = leaderboard.slice(0, MAX_ENTRIES);
  
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(topEntries));
  } catch (error) {
    console.error('Error saving leaderboard:', error);
  }
}

export function updateLeaderboardScore(playerName: string, newAttempts: number, newFoundImages: number): void {
  const leaderboard = getLeaderboard();
  
  // Find existing entry for this player
  const existingIndex = leaderboard.findIndex(entry => entry.name === playerName);
  
  if (existingIndex !== -1) {
    // Update existing entry - use best score (most found, fewest attempts)
    const existing = leaderboard[existingIndex];
    const isBetterScore = newFoundImages > existing.foundImages || 
      (newFoundImages === existing.foundImages && newAttempts < existing.score);
    
    if (isBetterScore) {
      leaderboard[existingIndex] = {
        ...existing,
        score: newAttempts,
        foundImages: newFoundImages,
        timestamp: Date.now(),
      };
    }
  } else {
    // Add new entry
    leaderboard.push({
      name: playerName,
      score: newAttempts,
      foundImages: newFoundImages,
      timestamp: Date.now(),
    });
  }
  
  // Sort by found images (higher is better), then by score (lower is better - fewer attempts)
  leaderboard.sort((a, b) => {
    if (a.foundImages !== b.foundImages) {
      return b.foundImages - a.foundImages; // More found images is better
    }
    return a.score - b.score; // Fewer attempts is better
  });
  
  // Keep only top entries
  const topEntries = leaderboard.slice(0, MAX_ENTRIES);
  
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(topEntries));
  } catch (error) {
    console.error('Error saving leaderboard:', error);
  }
}

export function clearLeaderboard(): void {
  try {
    localStorage.removeItem(LEADERBOARD_KEY);
  } catch (error) {
    console.error('Error clearing leaderboard:', error);
  }
}
