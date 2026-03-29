export interface AttemptEntry {
  name: string;
  score: number;
  foundImages: number;
  totalImages: number;
  hintsUsed?: number;
  timestamp: number;
}

const ATTEMPT_HISTORY_KEY = 'wheres-waldo-attempt-history';
const MAX_ENTRIES = 20;

export function getAttemptHistory(): AttemptEntry[] {
  try {
    const stored = localStorage.getItem(ATTEMPT_HISTORY_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading attempt history:', error);
  }
  return [];
}

export function addAttempt(entry: Omit<AttemptEntry, 'timestamp'>): void {
  const history = getAttemptHistory();

  const newEntry: AttemptEntry = {
    ...entry,
    timestamp: Date.now(),
  };

  // Add newest entry at the beginning
  history.unshift(newEntry);

  // Keep only the most recent entries
  const trimmed = history.slice(0, MAX_ENTRIES);

  try {
    localStorage.setItem(ATTEMPT_HISTORY_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Error saving attempt history:', error);
  }
}

export function clearAttemptHistory(): void {
  try {
    localStorage.removeItem(ATTEMPT_HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing attempt history:', error);
  }
}

export function getBestAttempt(playerName: string): AttemptEntry | null {
  const history = getAttemptHistory();
  const playerAttempts = history.filter(
    (entry) => entry.name === playerName
  );

  if (playerAttempts.length === 0) return null;

  // Best = most found images, then fewest misses
  return playerAttempts.reduce((best, current) => {
    if (current.foundImages > best.foundImages) return current;
    if (
      current.foundImages === best.foundImages &&
      current.score < best.score
    )
      return current;
    return best;
  });
}
