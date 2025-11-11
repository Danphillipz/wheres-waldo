// Mock __BASE_URL__ for Jest tests
// @ts-expect-error - __BASE_URL__ is defined by Vite, not available in Jest
globalThis.__BASE_URL__ = '/';
