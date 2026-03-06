import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';

// For CI, you may want to set BASE_URL to the deployed application.
const baseURL = process.env['BASE_URL'] || 'http://localhost:4300';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src' }),
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  timeout: 30_000,
  /* Run tests within each file in parallel — safe because every test navigates to
     "/" independently and uses its own isolated browser context (no shared state). */
  fullyParallel: true,
  /* In CI (GitHub Actions ubuntu-latest = 4 vCPUs) use 4 workers to run projects
     concurrently.  Locally, default to 50% of available cores. */
  workers: process.env.CI ? 4 : undefined,
  use: {
    baseURL,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },
  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npx nx run @wheres-waldo/waldo-app:preview',
    url: 'http://localhost:4300',
    reuseExistingServer: true,
    cwd: workspaceRoot,
    timeout: 120_000,
  },
  projects: [
    // Desktop browser — runs all test files
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Top 5 mobile device emulations across categories.
    // Mobile projects only run the example.spec.ts (core UI/responsive) and
    // webp-support.spec.ts tests to keep total execution time manageable.
    // 1. iPhone 15 Pro - latest flagship iOS (Safari/WebKit)
    {
      name: 'Mobile Safari - iPhone 15 Pro',
      use: {
        ...devices['iPhone 15 Pro'],
      },
      testMatch: /\b(example|webp-support)\.spec\.ts$/,
    },
    // 2. iPhone 14 Pro Max - large-screen iOS (Safari/WebKit)
    {
      name: 'Mobile Safari - iPhone 14 Pro Max',
      use: {
        ...devices['iPhone 14 Pro Max'],
      },
      testMatch: /\b(example|webp-support)\.spec\.ts$/,
    },
    // 3. Pixel 7 - flagship Android (Chrome/Chromium)
    {
      name: 'Mobile Chrome - Pixel 7',
      use: {
        ...devices['Pixel 7'],
      },
      testMatch: /\b(example|webp-support)\.spec\.ts$/,
    },
    // 4. Samsung Galaxy S24 - popular Android (Chrome/Chromium)
    {
      name: 'Mobile Chrome - Galaxy S24',
      use: {
        ...devices['Galaxy S24'],
      },
      testMatch: /\b(example|webp-support)\.spec\.ts$/,
    },
    // 5. iPad Mini - tablet viewport (Safari/WebKit)
    {
      name: 'Tablet Safari - iPad Mini',
      use: {
        ...devices['iPad Mini'],
      },
      testMatch: /\b(example|webp-support)\.spec\.ts$/,
    },
  ],
});
