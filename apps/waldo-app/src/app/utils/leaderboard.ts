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
  
  // Sort by score (lower is better - fewer attempts)
  // Then by found images (higher is better)
  leaderboard.sort((a, b) => {
    if (a.score !== b.score) {
      return a.score - b.score;
    }
    return b.foundImages - a.foundImages;
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
