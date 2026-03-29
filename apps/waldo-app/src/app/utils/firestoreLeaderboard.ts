import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  Unsubscribe,
} from 'firebase/firestore';
import { getDb } from '../firebase';

export interface LeaderboardEntry {
  name: string;
  firstName: string;
  lastName: string;
  score: number;
  foundImages: number;
  totalImages: number;
  hintsUsed: number;
  timestamp: number;
}

const COLLECTION_NAME = 'leaderboard';

function toDocId(firstName: string, lastName: string): string {
  return `${firstName.trim().toLowerCase()}-${lastName.trim().toLowerCase()}`;
}

function leaderboardQuery() {
  const db = getDb();
  if (!db) return null;
  // Single orderBy avoids requiring a composite Firestore index.
  // Secondary sort (score asc, hintsUsed asc) is applied client-side in snapshotToEntries.
  return query(
    collection(db, COLLECTION_NAME),
    orderBy('foundImages', 'desc'),
    limit(50)
  );
}

function snapshotToEntries(
  snapshot: { docs: Array<{ data: () => Record<string, unknown> }> }
): LeaderboardEntry[] {
  const entries = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      name: data['name'] as string,
      score: data['score'] as number,
      foundImages: data['foundImages'] as number,
      totalImages: data['totalImages'] as number,
      hintsUsed: data['hintsUsed'] as number,
      timestamp: data['timestamp'] as number,
    };
  });
  // Secondary sort: fewer misses is better, then fewer hints used
  return entries.sort((a, b) => {
    if (b.foundImages !== a.foundImages) return b.foundImages - a.foundImages;
    if (a.score !== b.score) return a.score - b.score;
    return a.hintsUsed - b.hintsUsed;
  });
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const q = leaderboardQuery();
    if (!q) return [];
    const snapshot = await getDocs(q);
    return snapshotToEntries(snapshot);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}

/**
 * Save or update a player's progress. Creates the entry if it doesn't exist,
 * or updates it only when the new progress is strictly better than the existing
 * entry. "Better" means more found images, or the same found images with fewer
 * misses. This allows returning players to improve their score while preventing
 * a new game from overwriting a previous better result.
 * @returns Object indicating save success. Returns false if database unavailable,
 *          write fails, or the existing entry is already equal or better.
 */
export async function saveProgress(
  entry: Omit<LeaderboardEntry, 'timestamp'>
): Promise<{ success: boolean }> {
  try {
    const db = getDb();
    if (!db) return { success: false };

    const docId = toDocId(entry.firstName, entry.lastName);
    const docRef = doc(db, COLLECTION_NAME, docId);

    const existing = await getDoc(docRef);
    if (existing.exists()) {
      const data = existing.data();
      const existingFound = data['foundImages'] as number;
      const existingScore = data['score'] as number;

      // Only overwrite if new progress is strictly better:
      // more found images, or same found images with fewer misses
      if (existingFound > entry.foundImages) {
        return { success: false };
      }
      if (existingFound === entry.foundImages && existingScore <= entry.score) {
        return { success: false };
      }
    }

    const newEntry: LeaderboardEntry = {
      ...entry,
      timestamp: Date.now(),
    };

    await setDoc(docRef, newEntry);
    return { success: true };
  } catch (error) {
    console.error('Error saving progress:', error);
    return { success: false };
  }
}

export async function hasPlayerSubmitted(firstName: string, lastName: string): Promise<boolean> {
  try {
    const db = getDb();
    if (!db) return false;

    const docRef = doc(db, COLLECTION_NAME, toDocId(firstName, lastName));
    const snapshot = await getDoc(docRef);
    return snapshot.exists();
  } catch (error) {
    console.error('Error checking player submission:', error);
    return false;
  }
}

export function subscribeToLeaderboard(
  callback: (entries: LeaderboardEntry[]) => void
): Unsubscribe | null {
  try {
    const q = leaderboardQuery();
    if (!q) return null;
    return onSnapshot(
      q,
      (snapshot) => callback(snapshotToEntries(snapshot)),
      (error) => {
        console.error('Leaderboard subscription error:', error);
        callback([]);
      }
    );
  } catch (error) {
    console.error('Error subscribing to leaderboard:', error);
    return null;
  }
}
