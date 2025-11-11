import { test, expect } from '@playwright/test';

// Helper function to start the game
async function startGame(page) {
  await page.goto('/');
  await page.locator('input[type="text"]').fill('Test Player');
  await page.locator('button', { hasText: 'Start Game' }).click();
}

test.describe('Start Screen', () => {
  test('should display welcome screen with all required elements', async ({ page }) => {
    await page.goto('/');
    
    // Verify all start screen elements are present
    await expect(page.locator('h1')).toContainText('Welcome');
    await expect(page.locator('input[type="text"]')).toBeVisible();
    await expect(page.locator('button', { hasText: 'Start Game' })).toBeVisible();
  });

  test('should start game when player enters name and clicks start', async ({ page }) => {
    await startGame(page);
    
    // Verify game screen is displayed
    await expect(page.locator('h1')).toContainText('Amy and Dan');
    await expect(page.locator('text=Attempts:')).toBeVisible();
    await expect(page.locator('text=Game:')).toBeVisible();
  });
});

test.describe('Game Screen - UI Elements', () => {
  test.beforeEach(async ({ page }) => {
    await startGame(page);
  });

  test('should display progress indicator dots', async ({ page }) => {
    const progressDots = page.locator('[aria-label*="Image"]');
    const count = await progressDots.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display skip button in score counter', async ({ page }) => {
    await expect(page.locator('button', { hasText: 'Skip' })).toBeVisible();
  });

  test('should display exit button', async ({ page }) => {
    await expect(page.locator('button', { hasText: 'Exit' })).toBeVisible();
  });

  test('should display game image', async ({ page }) => {
    await expect(page.locator('img[alt*="find Amy and Dan"]')).toBeVisible();
  });
});

test.describe('Game Screen - Removed Elements', () => {
  test.beforeEach(async ({ page }) => {
    await startGame(page);
  });

  test('should not display zoom controls', async ({ page }) => {
    await expect(page.locator('button[aria-label="Zoom in"]')).toBeHidden();
    await expect(page.locator('button[aria-label="Zoom out"]')).toBeHidden();
  });

  test('should not display next image button', async ({ page }) => {
    await expect(page.locator('button', { hasText: 'Next Image' })).toBeHidden();
  });
});

test.describe('Mobile Responsiveness', () => {
  test.beforeEach(async ({ page }) => {
    await startGame(page);
  });

  test('should display all key elements', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=Attempts:')).toBeVisible();
    await expect(page.locator('button', { hasText: 'Skip' })).toBeVisible();
    await expect(page.locator('img[alt*="find Amy and Dan"]')).toBeVisible();
  });

  test('should have proper viewport size', async ({ page }) => {
    const viewport = page.viewportSize();
    expect(viewport).toBeTruthy();
    expect(viewport?.width).toBeGreaterThan(0);
    expect(viewport?.height).toBeGreaterThan(0);
  });
});

