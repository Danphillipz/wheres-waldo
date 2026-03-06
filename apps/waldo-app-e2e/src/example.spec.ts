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

test.describe('Start Screen', () => {
  test('should display welcome screen with all required elements', async ({ page }) => {
    await page.goto('/');
    
    // Verify all start screen elements are present
    await expect(page.locator('h1')).toContainText("Where's");
    await expect(page.locator('input[type="text"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    // Button should be disabled when no name is entered
    await expect(page.locator('button[type="submit"]')).toBeDisabled();
  });

  test('should enable start button when name is entered', async ({ page }) => {
    await page.goto('/');
    
    // Button should be disabled initially
    await expect(page.locator('button[type="submit"]')).toBeDisabled();
    
    // Enter a name
    await page.locator('input[type="text"]').fill('Test Player');
    
    // Button should now be enabled
    await expect(page.locator('button[type="submit"]')).toBeEnabled();
  });

  test('should start game when player enters name and clicks start', async ({ page }) => {
    await startGame(page);
    
    // Verify game screen is displayed
    await expect(page.locator('h1')).toContainText('Amy and Dan');
    await expect(page.locator('text=Game:')).toBeVisible();
  });

  test('should have collapsible "How to Play?" section', async ({ page }) => {
    await page.goto('/');
    
    // Verify "How to Play?" button is visible
    const howToPlayButton = page.locator('button:has-text("How to Play?")');
    await expect(howToPlayButton).toBeVisible();
    
    // Instructions should not be visible initially (collapsed)
    const instructions = page.locator('ol li:has-text("hiding")');
    await expect(instructions).not.toBeVisible();
    
    // Click to expand
    await howToPlayButton.click();
    await expect(instructions).toBeVisible();
    
    // Click to collapse
    await howToPlayButton.click();
    await expect(instructions).not.toBeVisible();
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

  test('should display skip button', async ({ page }) => {
    await expect(page.locator('button', { hasText: 'Skip' })).toBeVisible();
  });

  test('should display exit button', async ({ page }) => {
    await expect(page.locator('button', { hasText: 'Exit' })).toBeVisible();
  });

  test('should display game image', async ({ page }) => {
    // Images have specific characters to find (Amy or Dan)
    const image = page.locator('img[alt*="Find"]');
    await expect(image).toBeVisible();
  });

  test('should display difficulty indicator', async ({ page }) => {
    const difficulty = page.locator('text=/Difficulty:/');
    await expect(difficulty).toBeVisible();
  });

  test('should display lives as Waldo avatars', async ({ page }) => {
    // Look for the attempts remaining container
    const livesContainer = page.locator('[class*="attemptsRemaining"]');
    await expect(livesContainer).toBeVisible();
  });

  test('should display game counter (e.g., "1 of 4")', async ({ page }) => {
    const gameCounter = page.locator('text=/\\d+ of \\d+/');
    await expect(gameCounter).toBeVisible();
  });
});

test.describe('Toolbar Container Alignment', () => {
  test.beforeEach(async ({ page }) => {
    await startGame(page);
  });

  test('should have all toolbar containers with equal heights', async ({ page }) => {
    // Get all main toolbar containers
    const difficultyContainer = page.locator('[class*="difficultyIndicator"]').first();
    const livesContainer = page.locator('[class*="attemptsRemaining"]').first();
    const scoreContainer = page.locator('[class*="scoreItem"]').first();

    // Verify all are visible
    await expect(difficultyContainer).toBeVisible();
    await expect(livesContainer).toBeVisible();
    await expect(scoreContainer).toBeVisible();

    // Get bounding boxes
    const diffBox = await difficultyContainer.boundingBox();
    const livesBox = await livesContainer.boundingBox();
    const scoreBox = await scoreContainer.boundingBox();

    // All should have heights (tolerance of 2px for rounding)
    expect(diffBox?.height).toBeGreaterThan(0);
    expect(livesBox?.height).toBeGreaterThan(0);
    expect(scoreBox?.height).toBeGreaterThan(0);

    // Heights should be equal (within tolerance)
    if (diffBox && livesBox && scoreBox) {
      expect(Math.abs(diffBox.height - livesBox.height)).toBeLessThanOrEqual(2);
      expect(Math.abs(diffBox.height - scoreBox.height)).toBeLessThanOrEqual(2);
    }
  });
});

test.describe('Touch Gesture Handling', () => {
  test.beforeEach(async ({ page }) => {
    await startGame(page);
  });

  test('should handle image clicks/taps', async ({ page }) => {
    const image = page.locator('img[alt*="Find"]');
    await expect(image).toBeVisible();
    
    // Click on the image (force: true needed because CSS transforms can intercept pointer events)
    await image.click({ position: { x: 50, y: 50 }, force: true });
    
    // Should not throw any errors
    // Note: We can't easily verify attempt counter without knowing exact Waldo location
  });

  test('should allow mouse wheel zoom', async ({ page, browserName, isMobile }) => {
    // Skip for mobile browsers — mobile WebKit (including iPad Mini) doesn't support mouse.wheel()
    if (isMobile || (browserName === 'webkit' && page.viewportSize()?.width && page.viewportSize()!.width <= 768)) {
      test.skip();
    }

    const imageContainer = page.locator('img[alt*="Find"]').locator('..');
    await expect(imageContainer).toBeVisible();

    // Mouse wheel should not cause errors
    await imageContainer.hover();
    await page.mouse.wheel(0, -100);
    
    // Page should still be functional
    await expect(page.locator('h1')).toBeVisible();
  });
});

test.describe('Mobile Responsiveness', () => {
  test.beforeEach(async ({ page }) => {
    await startGame(page);
  });

  test('should display all key elements on mobile', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=Game:')).toBeVisible();
    await expect(page.locator('button', { hasText: 'Skip' })).toBeVisible();
    
    // Images have specific characters to find (Amy or Dan)
    const image = page.locator('img[alt*="Find"]');
    await expect(image).toBeVisible();
  });

  test('should have toolbar fully visible', async ({ page }) => {
    // Get toolbar element
    const toolbar = page.locator('[class*="toolbar"]').first();
    await expect(toolbar).toBeVisible();

    // Toolbar should be within viewport
    const toolbarBox = await toolbar.boundingBox();
    const viewport = page.viewportSize();
    
    if (toolbarBox && viewport) {
      // Toolbar top should be >= 0 (not cut off at top)
      expect(toolbarBox.y).toBeGreaterThanOrEqual(0);
      // Toolbar should fit within viewport height
      expect(toolbarBox.y + toolbarBox.height).toBeLessThanOrEqual(viewport.height);
    }
  });

  test('should have proper viewport size', async ({ page }) => {
    const viewport = page.viewportSize();
    expect(viewport).toBeTruthy();
    expect(viewport?.width).toBeGreaterThan(0);
    expect(viewport?.height).toBeGreaterThan(0);
  });

  test('should have reduced gap between toolbar and image', async ({ page }) => {
    const toolbar = page.locator('[class*="toolbar"]').first();
    const imageContainer = page.locator('img[alt*="Find"]').locator('..');
    
    const toolbarBox = await toolbar.boundingBox();
    const imageBox = await imageContainer.boundingBox();
    
    if (toolbarBox && imageBox) {
      // Gap includes zoom controls between toolbar and image — keep it compact
      // but allow enough room for touch-friendly controls on mobile viewports
      const gap = imageBox.y - (toolbarBox.y + toolbarBox.height);
      expect(gap).toBeLessThan(100);
    }
  });
});

test.describe('Game Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await startGame(page);
  });

  test('should allow skipping an image', async ({ page }) => {
    const skipButton = page.locator('button', { hasText: 'Skip' });
    const initialGameCounter = await page.locator('text=/\\d+ of \\d+/').textContent();
    
    await skipButton.click();
    
    // Wait for modal or game progression
    await page.waitForTimeout(500);
    
    // Game should still be active or advanced
    await expect(page.locator('h1')).toContainText('Amy and Dan');
  });

  test('should allow exiting the game', async ({ page }) => {
    const exitButton = page.locator('button', { hasText: 'Exit' });
    
    await exitButton.click();
    
    // Should return to start screen
    await expect(page.locator('h1')).toContainText("Where's");
    await expect(page.locator('input[type="text"]')).toBeVisible();
  });
});

test.describe('Cross-Browser Compatibility', () => {
  test('should work on all browsers', async ({ page, browserName }) => {
    await page.goto('/');
    
    // Verify page loads
    await expect(page.locator('h1')).toBeVisible();
    
    // Start game
    await page.locator('input[type="text"]').fill(`Test-${browserName}`);
    await page.locator('button[type="submit"]').click();
    
    // Verify game starts
    await expect(page.locator('h1')).toContainText('Amy and Dan');
    await expect(page.locator('img[alt*="Find"]')).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/');
    
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    expect(await h1.count()).toBe(1);
  });

  test('should have accessible buttons', async ({ page }) => {
    await startGame(page);
    
    const skipButton = page.locator('button', { hasText: 'Skip' });
    const exitButton = page.locator('button', { hasText: 'Exit' });
    
    await expect(skipButton).toHaveAttribute('aria-label', /skip/i);
    await expect(exitButton).toHaveAttribute('aria-label', /exit/i);
  });
});

test.describe('Device-Specific Tests', () => {
  test('should handle mobile viewport (iPhone)', async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip();
    }

    await page.goto('/');
    const viewport = page.viewportSize();
    
    // Verify mobile viewport (iPad Mini is exactly 768px, phones are narrower)
    expect(viewport?.width).toBeLessThanOrEqual(768);
    
    // All UI elements should still be accessible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should handle desktop viewport', async ({ page, isMobile }) => {
    if (isMobile) {
      test.skip();
    }

    await page.goto('/');
    const viewport = page.viewportSize();
    
    // Verify desktop viewport
    expect(viewport?.width).toBeGreaterThanOrEqual(1024);
    
    // All UI elements should be visible
    await expect(page.locator('h1')).toBeVisible();
  });
});

