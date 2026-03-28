// Mock __BASE_URL__ for Jest tests
// @ts-expect-error - __BASE_URL__ is defined by Vite, not available in Jest
globalThis.__BASE_URL__ = '/';

// Mock firebase so tests don't need real Firebase config
jest.mock('./app/firebase', () => ({
  getDb: jest.fn(() => null),
}));
