import { test, expect } from '@playwright/test';

test.describe('Where\'s Waldo App', () => {
  test('should show the start screen with title and input', async ({ page }) => {
    await page.goto('/');
    
    // Check for the welcome heading
    const heading = page.locator('h1');
    await expect(heading).toContainText('Welcome');
    
    // Check for player name input
    const input = page.locator('input[type="text"]');
    await expect(input).toBeVisible();
    
    // Check for start button
    const startButton = page.locator('button', { hasText: 'Start Game' });
    await expect(startButton).toBeVisible();
  });

  test('should start game when player enters name and clicks start', async ({ page }) => {
    await page.goto('/');
    
    // Enter player name
    await page.locator('input[type="text"]').fill('Test Player');
    
    // Click start button
    await page.locator('button', { hasText: 'Start Game' }).click();
    
    // Should show game title
    await expect(page.locator('h1')).toContainText('Amy and Dan');
    
    // Should show attempts and game counter
    await expect(page.locator('text=Attempts:')).toBeVisible();
    await expect(page.locator('text=Game:')).toBeVisible();
  });

  test('should display progress indicator dots', async ({ page }) => {
    await page.goto('/');
    
    // Start the game
    await page.locator('input[type="text"]').fill('Test Player');
    await page.locator('button', { hasText: 'Start Game' }).click();
    
    // Check for progress dots (should have multiple dots based on number of images)
    const progressDots = page.locator('[aria-label*="Image"]');
    const count = await progressDots.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have skip button in score counter', async ({ page }) => {
    await page.goto('/');
    
    // Start the game
    await page.locator('input[type="text"]').fill('Test Player');
    await page.locator('button', { hasText: 'Start Game' }).click();
    
    // Check for skip button
    const skipButton = page.locator('button', { hasText: 'Skip' });
    await expect(skipButton).toBeVisible();
  });

  test('should have exit button', async ({ page }) => {
    await page.goto('/');
    
    // Start the game
    await page.locator('input[type="text"]').fill('Test Player');
    await page.locator('button', { hasText: 'Start Game' }).click();
    
    // Check for exit button
    const exitButton = page.locator('button', { hasText: 'Exit' });
    await expect(exitButton).toBeVisible();
  });

  test('should show game image', async ({ page }) => {
    await page.goto('/');
    
    // Start the game
    await page.locator('input[type="text"]').fill('Test Player');
    await page.locator('button', { hasText: 'Start Game' }).click();
    
    // Check that an image is displayed
    const gameImage = page.locator('img[alt*="find Amy and Dan"]');
    await expect(gameImage).toBeVisible();
  });

  test('should not have zoom controls visible', async ({ page }) => {
    await page.goto('/');
    
    // Start the game
    await page.locator('input[type="text"]').fill('Test Player');
    await page.locator('button', { hasText: 'Start Game' }).click();
    
    // Check that zoom buttons are not present
    const zoomInButton = page.locator('button[aria-label="Zoom in"]');
    await expect(zoomInButton).toBeHidden();
    
    const zoomOutButton = page.locator('button[aria-label="Zoom out"]');
    await expect(zoomOutButton).toBeHidden();
  });

  test('should not have next image button visible', async ({ page }) => {
    await page.goto('/');
    
    // Start the game
    await page.locator('input[type="text"]').fill('Test Player');
    await page.locator('button', { hasText: 'Start Game' }).click();
    
    // Check that next button is not present
    const nextButton = page.locator('button', { hasText: 'Next Image' });
    await expect(nextButton).toBeHidden();
  });

  test('should be mobile-friendly with proper viewport', async ({ page, isMobile }) => {
    await page.goto('/');
    
    // Start the game
    await page.locator('input[type="text"]').fill('Test Player');
    await page.locator('button', { hasText: 'Start Game' }).click();
    
    // Check that key elements are visible on mobile
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=Attempts:')).toBeVisible();
    await expect(page.locator('button', { hasText: 'Skip' })).toBeVisible();
    
    // Check that the game image is visible
    const gameImage = page.locator('img[alt*="find Amy and Dan"]');
    await expect(gameImage).toBeVisible();
    
    // Verify the viewport is properly sized for mobile
    const viewport = page.viewportSize();
    expect(viewport).toBeTruthy();
    
    // Only check mobile viewport width if running on a mobile device
    if (isMobile && viewport) {
      expect(viewport.width).toBeLessThanOrEqual(500);
    }
  });
});

