import {
  getAttemptHistory,
  addAttempt,
  clearAttemptHistory,
  getBestAttempt,
  AttemptEntry,
} from './attemptHistory';

// Mock localStorage with a simple store object
let store: Record<string, string> = {};
const localStorageMock = {
  getItem: jest.fn((key: string) => store[key] ?? null),
  setItem: jest.fn((key: string, value: string) => {
    store[key] = value;
  }),
  removeItem: jest.fn((key: string) => {
    delete store[key];
  }),
  clear: jest.fn(() => {
    store = {};
  }),
};

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

const STORAGE_KEY = 'wheres-waldo-attempt-history';

describe('attemptHistory', () => {
  beforeEach(() => {
    store = {};
    jest.clearAllMocks();
  });

  describe('getAttemptHistory', () => {
    it('should return empty array when no history exists', () => {
      expect(getAttemptHistory()).toEqual([]);
    });

    it('should return stored history', () => {
      const entries: AttemptEntry[] = [
        { name: 'Player1', score: 10, foundImages: 5, totalImages: 10, timestamp: 1000 },
      ];
      store[STORAGE_KEY] = JSON.stringify(entries);
      expect(getAttemptHistory()).toEqual(entries);
    });

    it('should return empty array on parse error', () => {
      store[STORAGE_KEY] = 'invalid-json';
      expect(getAttemptHistory()).toEqual([]);
    });
  });

  describe('addAttempt', () => {
    it('should add a new attempt entry', () => {
      addAttempt({ name: 'Player1', score: 8, foundImages: 4, totalImages: 10 });
      const history = JSON.parse(store[STORAGE_KEY]);
      expect(history).toHaveLength(1);
      expect(history[0].name).toBe('Player1');
      expect(history[0].score).toBe(8);
      expect(history[0].foundImages).toBe(4);
      expect(history[0].totalImages).toBe(10);
      expect(history[0].timestamp).toBeDefined();
    });

    it('should add newest entry at the beginning', () => {
      const existing: AttemptEntry[] = [
        { name: 'Player1', score: 10, foundImages: 5, totalImages: 10, timestamp: 1000 },
      ];
      store[STORAGE_KEY] = JSON.stringify(existing);

      addAttempt({ name: 'Player1', score: 6, foundImages: 7, totalImages: 10 });
      const history = JSON.parse(store[STORAGE_KEY]);
      expect(history).toHaveLength(2);
      expect(history[0].score).toBe(6); // Newest first
      expect(history[1].score).toBe(10);
    });

    it('should keep only 20 entries', () => {
      const existing: AttemptEntry[] = Array.from({ length: 20 }, (_, i) => ({
        name: 'Player1',
        score: i,
        foundImages: 5,
        totalImages: 10,
        timestamp: i * 1000,
      }));
      store[STORAGE_KEY] = JSON.stringify(existing);

      addAttempt({ name: 'Player1', score: 99, foundImages: 10, totalImages: 10 });
      const history = JSON.parse(store[STORAGE_KEY]);
      expect(history).toHaveLength(20);
      expect(history[0].score).toBe(99); // Newest entry
    });
  });

  describe('clearAttemptHistory', () => {
    it('should remove history from localStorage', () => {
      clearAttemptHistory();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
    });
  });

  describe('getBestAttempt', () => {
    it('should return null when no attempts exist', () => {
      expect(getBestAttempt('Player1')).toBeNull();
    });

    it('should return the best attempt for a player', () => {
      const entries: AttemptEntry[] = [
        { name: 'Player1', score: 12, foundImages: 5, totalImages: 10, timestamp: 1000 },
        { name: 'Player1', score: 8, foundImages: 7, totalImages: 10, timestamp: 2000 },
        { name: 'Player1', score: 10, foundImages: 7, totalImages: 10, timestamp: 3000 },
        { name: 'Player2', score: 3, foundImages: 10, totalImages: 10, timestamp: 4000 },
      ];
      store[STORAGE_KEY] = JSON.stringify(entries);

      const best = getBestAttempt('Player1');
      expect(best).toBeDefined();
      expect(best!.foundImages).toBe(7);
      expect(best!.score).toBe(8); // Fewer misses is better when foundImages are equal
    });

    it('should return null for unknown player', () => {
      const entries: AttemptEntry[] = [
        { name: 'Player1', score: 10, foundImages: 5, totalImages: 10, timestamp: 1000 },
      ];
      store[STORAGE_KEY] = JSON.stringify(entries);
      expect(getBestAttempt('Unknown')).toBeNull();
    });
  });
});
