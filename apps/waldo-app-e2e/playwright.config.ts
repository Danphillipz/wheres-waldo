import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';

// For CI, you may want to set BASE_URL to the deployed application.
const baseURL = process.env['BASE_URL'] || 'http://localhost:4300';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src' }),
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
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
  },
  projects: [
    // Desktop browsers
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

    // Top 5 mobile device emulations across categories:
    // 1. iPhone 15 Pro - latest flagship iOS (Safari/WebKit)
    {
      name: 'Mobile Safari - iPhone 15 Pro',
      use: {
        ...devices['iPhone 15 Pro'],
      },
      testMatch: /.*\.spec\.ts/,
    },
    // 2. iPhone 14 Pro Max - large-screen iOS (Safari/WebKit)
    {
      name: 'Mobile Safari - iPhone 14 Pro Max',
      use: {
        ...devices['iPhone 14 Pro Max'],
      },
      testMatch: /.*\.spec\.ts/,
    },
    // 3. Pixel 7 - flagship Android (Chrome/Chromium)
    {
      name: 'Mobile Chrome - Pixel 7',
      use: {
        ...devices['Pixel 7'],
      },
      testMatch: /.*\.spec\.ts/,
    },
    // 4. Samsung Galaxy S24 - popular Android (Chrome/Chromium)
    {
      name: 'Mobile Chrome - Galaxy S24',
      use: {
        ...devices['Galaxy S24'],
      },
      testMatch: /.*\.spec\.ts/,
    },
    // 5. iPad Mini - tablet viewport (Safari/WebKit)
    {
      name: 'Tablet Safari - iPad Mini',
      use: {
        ...devices['iPad Mini'],
      },
      testMatch: /.*\.spec\.ts/,
    },
  ],
});
