import { LeaderboardEntry } from './leaderboard';

/**
 * Cloud Leaderboard Service
 * 
 * This utility provides a framework for cloud-based leaderboard persistence
 * across devices. To enable cross-device leaderboard:
 * 
 * 1. Set up a backend API with the following endpoints:
 *    - GET /api/leaderboard - Returns array of LeaderboardEntry
 *    - POST /api/leaderboard - Adds new entry (body: LeaderboardEntry)
 *    - PUT /api/leaderboard - Updates full leaderboard (body: LeaderboardEntry[])
 * 
 * 2. Call enableCloudLeaderboard() with your API endpoint at app startup
 * 
 * 3. Replace getLeaderboard/updateLeaderboardScore calls with cloud versions
 * 
 * Recommended backend solutions:
 * - Firebase Realtime Database (https://firebase.google.com/)
 * - Supabase (https://supabase.com/)
 * - AWS DynamoDB + API Gateway
 * - Simple Express.js API with MongoDB
 * - Vercel/Netlify Serverless Functions
 */

// Configuration for cloud-based leaderboard
const CLOUD_LEADERBOARD_KEY = 'wheres-waldo-cloud-leaderboard';
const CLOUD_SYNC_TIMESTAMP_KEY = 'wheres-waldo-cloud-sync-timestamp';
const SYNC_INTERVAL_MS = 30000; // Sync every 30 seconds
const MAX_ENTRIES = 10;

interface CloudLeaderboardConfig {
  apiEndpoint?: string;
  enabled: boolean;
}

const config: CloudLeaderboardConfig = {
  // Set to false by default - requires backend setup
  enabled: false,
  // Example: apiEndpoint: 'https://your-api.com/api/leaderboard'
};

/**
 * Enable cloud leaderboard with a backend API endpoint
 * @param apiEndpoint The URL of your leaderboard API endpoint
 * 
 * @example
 * // In your app initialization (e.g., main.tsx or App.tsx):
 * enableCloudLeaderboard('https://your-api.com/api/leaderboard');
 */
export function enableCloudLeaderboard(apiEndpoint: string): void {
  config.enabled = true;
  config.apiEndpoint = apiEndpoint;
  console.log('Cloud leaderboard enabled with endpoint:', apiEndpoint);
}

/**
 * Check if cloud leaderboard is enabled
 */
export function isCloudLeaderboardEnabled(): boolean {
  return config.enabled && !!config.apiEndpoint;
}

/**
 * Get leaderboard from cloud storage
 * Falls back to localStorage if cloud is unavailable
 */
export async function getCloudLeaderboard(): Promise<LeaderboardEntry[]> {
  // Try to get from localStorage first for fast loading
  const localData = getLocalCloudCache();
  
  // If cloud is not enabled, return local data
  if (!config.enabled || !config.apiEndpoint) {
    return localData;
  }

  // Check if we should sync (not too frequent)
  const lastSync = getLastSyncTimestamp();
  const now = Date.now();
  
  if (now - lastSync < SYNC_INTERVAL_MS && localData.length > 0) {
    // Use cached data if it's recent
    return localData;
  }

  try {
    // Fetch from cloud
    const response = await fetch(config.apiEndpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn('Cloud leaderboard fetch failed, using local cache');
      return localData;
    }

    const cloudData: LeaderboardEntry[] = await response.json();
    
    // Update local cache
    setLocalCloudCache(cloudData);
    setLastSyncTimestamp(now);
    
    return cloudData;
  } catch (error) {
    console.error('Error fetching cloud leaderboard:', error);
    return localData;
  }
}

/**
 * Update leaderboard score in cloud
 */
export async function updateCloudLeaderboardScore(
  playerName: string,
  newAttempts: number,
  newFoundImages: number
): Promise<void> {
  const leaderboard = await getCloudLeaderboard();
  
  // Find existing entry for this player
  const existingIndex = leaderboard.findIndex((entry) => entry.name === playerName);
  
  let updatedData: LeaderboardEntry[];
  
  if (existingIndex !== -1) {
    // Update existing entry
    const existing = leaderboard[existingIndex];
    const isBetterScore =
      newFoundImages > existing.foundImages ||
      (newFoundImages === existing.foundImages && newAttempts < existing.score);
    
    if (isBetterScore) {
      leaderboard[existingIndex] = {
        ...existing,
        score: newAttempts,
        foundImages: newFoundImages,
        timestamp: Date.now(),
      };
    }
    
    updatedData = sortAndTrimLeaderboard(leaderboard);
  } else {
    // Add new entry
    const newEntry: LeaderboardEntry = {
      name: playerName,
      score: newAttempts,
      foundImages: newFoundImages,
      timestamp: Date.now(),
    };
    
    updatedData = mergeLeaderboardEntry(leaderboard, newEntry);
  }
  
  // Update local cache immediately for optimistic update
  setLocalCloudCache(updatedData);

  // If cloud is not enabled, stop here (local-only mode)
  if (!config.enabled || !config.apiEndpoint) {
    return;
  }

  try {
    // Send update to cloud
    await fetch(config.apiEndpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    });
    
    setLastSyncTimestamp(Date.now());
  } catch (error) {
    console.error('Error updating cloud leaderboard:', error);
    // Local cache is already updated, so we can continue
  }
}

// Helper functions

function getLocalCloudCache(): LeaderboardEntry[] {
  try {
    const stored = localStorage.getItem(CLOUD_LEADERBOARD_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading cloud cache:', error);
  }
  return [];
}

function setLocalCloudCache(data: LeaderboardEntry[]): void {
  try {
    localStorage.setItem(CLOUD_LEADERBOARD_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving cloud cache:', error);
  }
}

function getLastSyncTimestamp(): number {
  try {
    const stored = localStorage.getItem(CLOUD_SYNC_TIMESTAMP_KEY);
    if (stored) {
      return parseInt(stored, 10);
    }
  } catch (error) {
    console.error('Error loading sync timestamp:', error);
  }
  return 0;
}

function setLastSyncTimestamp(timestamp: number): void {
  try {
    localStorage.setItem(CLOUD_SYNC_TIMESTAMP_KEY, timestamp.toString());
  } catch (error) {
    console.error('Error saving sync timestamp:', error);
  }
}

function mergeLeaderboardEntry(
  leaderboard: LeaderboardEntry[],
  newEntry: LeaderboardEntry
): LeaderboardEntry[] {
  const updated = [...leaderboard, newEntry];
  return sortAndTrimLeaderboard(updated);
}

function sortAndTrimLeaderboard(leaderboard: LeaderboardEntry[]): LeaderboardEntry[] {
  // Sort by found images (higher is better), then by score (lower is better - fewer attempts)
  const sorted = leaderboard.sort((a, b) => {
    if (a.foundImages !== b.foundImages) {
      return b.foundImages - a.foundImages; // More found images is better
    }
    return a.score - b.score; // Fewer attempts is better
  });
  
  // Keep only top entries
  return sorted.slice(0, MAX_ENTRIES);
}

