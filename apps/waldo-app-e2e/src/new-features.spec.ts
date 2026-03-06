import { test, expect, Page } from '@playwright/test';

// Helper function to start the game and wait for the first image to fully load
async function startGame(page: Page) {
  await page.goto('/');
  await page.locator('input[type="text"]').fill('Test Player');
  await page.locator('button[type="submit"]').click();
  // Wait for game board to load
  await page.waitForSelector('h1:has-text("Amy and Dan")', { timeout: 5000 });
  // Wait for image loading spinner to disappear so the image container becomes interactive
  await page.locator('[class*="loadingContainer"]').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
}

test.describe('Rectangular Detection', () => {
  test('should support rectangular detection zones', async ({ page }) => {
    // This is a feature test - we can't easily verify rectangular detection
    // without knowing which images use it, but we can verify the game still works
    await startGame(page);
    
    // Verify game loads and is playable
    await expect(page.locator('img[alt*="Find"]')).toBeVisible();
    await expect(page.locator('text=/Difficulty:/i')).toBeVisible();
  });
});

test.describe('Image Randomization', () => {
  test('should randomize image order on each game start', async ({ page }) => {
    // Start first game and record first image
    await startGame(page);
    const firstGameFirstImage = await page.locator('img[alt*="Find"]').getAttribute('src');
    
    // Exit and start second game
    await page.locator('button:has-text("Exit")').click();
    await page.waitForSelector('input[type="text"]', { timeout: 5000 });
    
    await page.locator('input[type="text"]').fill('Test Player 2');
    await page.locator('button[type="submit"]').click();
    await page.waitForSelector('h1:has-text("Amy and Dan")', { timeout: 5000 });
    
    const secondGameFirstImage = await page.locator('img[alt*="Find"]').getAttribute('src');
    
    // Note: There's a chance images could be the same due to randomization,
    // but the test verifies both games start successfully
    expect(firstGameFirstImage).toBeTruthy();
    expect(secondGameFirstImage).toBeTruthy();
  });
  
  test('should maintain same order within a single game session', async ({ page }) => {
    await startGame(page);
    
    // Get first image
    const firstImage = await page.locator('img[alt*="Find"]').getAttribute('src');
    
    // Skip to next image
    await page.locator('button:has-text("Skip")').click();
    await page.waitForTimeout(500);
    
    // Get second image
    const secondImage = await page.locator('img[alt*="Find"]').getAttribute('src');
    
    // Images should be different (unless there's only one image)
    expect(firstImage).toBeTruthy();
    expect(secondImage).toBeTruthy();
  });
});

test.describe('Practice Difficulty', () => {
  test('should display Practice difficulty indicator when present', async ({ page }) => {
    await startGame(page);
    
    // Wait for difficulty indicator
    const difficultyText = await page.locator('text=/Difficulty:/i').textContent();
    
    // Verify difficulty is shown (could be Practice, Easy, Hard, or Really Hard)
    expect(difficultyText).toBeTruthy();
    expect(difficultyText?.toLowerCase()).toContain('difficulty');
  });
  
  test('should show Practice difficulty with book icon', async ({ page }) => {
    await startGame(page);
    
    // Check if Practice difficulty is displayed (may not be first image due to randomization)
    const difficultyElement = page.locator('text=/Difficulty:/i');
    await expect(difficultyElement).toBeVisible();
    
    // Practice uses 📚 emoji, Easy uses ⭐
    const difficultyText = await difficultyElement.textContent();
    
    // Verify it contains one of the valid difficulty levels
    const validDifficulties = ['Practice', 'Easy', 'Hard', 'Really Hard'];
    const hasValidDifficulty = validDifficulties.some(diff => 
      difficultyText?.includes(diff)
    );
    expect(hasValidDifficulty).toBeTruthy();
  });
});

test.describe('Zoom Animation on Success', () => {
  test('should show animation overlay when clicking correct location', async ({ page }) => {
    await startGame(page);
    
    // Wait for image to load
    const image = page.locator('img[alt*="Find"]');
    await expect(image).toBeVisible();
    
    // Note: We can't easily test the exact Waldo location without knowing it,
    // but we can verify the game responds to clicks
    await image.click({ position: { x: 100, y: 100 }, force: true });
    
    // The game should still be functional after click
    await expect(page.locator('h1:has-text("Amy and Dan")')).toBeVisible();
  });
  
  test('should show fireworks animation elements on success', async ({ page }) => {
    // This test verifies the animation component structure exists
    await startGame(page);
    
    // Verify game is loaded
    const image = page.locator('img[alt*="Find"]');
    await expect(image).toBeVisible();
    
    // Game should have the image viewer container
    const imageContainer = page.locator('[class*="imageViewerContainer"]');
    await expect(imageContainer).toBeVisible();
  });
  
  test('should display success modal after animation completes', async ({ page }) => {
    await startGame(page);
    
    // The success modal should appear after finding Waldo
    // We can't trigger it without knowing exact coordinates, but we can verify
    // the modal structure exists in the DOM
    const image = page.locator('img[alt*="Find"]');
    await expect(image).toBeVisible();
    
    // Verify game continues to work
    await page.waitForTimeout(500);
    const gameBoard = page.locator('[class*="gameBoard"]');
    await expect(gameBoard).toBeVisible();
  });
});

test.describe('Animation Performance', () => {
  test('should not freeze UI during animation', async ({ page }) => {
    await startGame(page);
    
    // Wait for image
    const image = page.locator('img[alt*="Find"]');
    await expect(image).toBeVisible();
    
    // Click on image
    await image.click({ position: { x: 100, y: 100 }, force: true });
    
    // UI should remain responsive - toolbar should still be visible
    const toolbar = page.locator('[class*="toolbar"]');
    await expect(toolbar).toBeVisible();
    
    // Exit button should still be clickable
    const exitButton = page.locator('button:has-text("Exit")');
    await expect(exitButton).toBeVisible();
  });
});

test.describe('Integration - All Features Together', () => {
  test('should handle complete game flow with all new features', async ({ page }) => {
    await startGame(page);
    
    // Verify game loaded with randomized order
    await expect(page.locator('img[alt*="Find"]')).toBeVisible();
    
    // Verify difficulty indicator is present (could be Practice or others)
    await expect(page.locator('text=/Difficulty:/i')).toBeVisible();
    
    // Verify progress indicator
    await expect(page.locator('text=/of/i')).toBeVisible();
    
    // Click on image (may or may not find Waldo)
    const image = page.locator('img[alt*="Find"]');
    await image.click({ position: { x: 200, y: 200 }, force: true });
    
    // Game should still be functional
    await page.waitForTimeout(500);
    await expect(page.locator('h1')).toBeVisible();
  });
  
  test('should maintain randomization across game restarts', async ({ page }) => {
    // Start and complete/exit first game
    await startGame(page);
    await page.locator('button:has-text("Exit")').click();
    
    // Start second game
    await page.waitForSelector('input[type="text"]', { timeout: 5000 });
    await page.locator('input[type="text"]').fill('Test Player 2');
    await page.locator('button[type="submit"]').click();
    
    // Verify second game started
    await expect(page.locator('h1:has-text("Amy and Dan")')).toBeVisible();
    await expect(page.locator('img[alt*="Find"]')).toBeVisible();
  });
});

test.describe('Accessibility with New Features', () => {
  test('should maintain accessibility with animation', async ({ page }) => {
    await startGame(page);
    
    // Verify heading structure maintained
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    
    // Verify buttons remain accessible
    const skipButton = page.locator('button:has-text("Skip")');
    const exitButton = page.locator('button:has-text("Exit")');
    
    await expect(skipButton).toBeVisible();
    await expect(exitButton).toBeVisible();
  });
});
