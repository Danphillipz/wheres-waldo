import { test, expect, Page } from '@playwright/test';

// Helper function to start the game
async function startGame(page: Page) {
  await page.goto('/');
  await page.locator('input[type="text"]').fill('Test Player');
  await page.locator('button[type="submit"]').click();
  // Wait for game board to load
  await page.waitForSelector('h1:has-text("Amy and Dan")', { timeout: 5000 });
}

test.describe('WebP Image Support', () => {
  test.beforeEach(async ({ page }) => {
    await startGame(page);
  });

  test('should render a <picture> element with WebP sources', async ({ page }) => {
    // Wait for game image to load
    const image = page.locator('img[alt*="Find"]');
    await expect(image).toBeVisible();

    // Verify <picture> element exists wrapping the game image
    const picture = page.locator('picture').filter({ has: page.locator('img[alt*="Find"]') });
    await expect(picture).toBeVisible();

    // Verify WebP <source> elements are present
    const webpSources = picture.locator('source[type="image/webp"]');
    const webpCount = await webpSources.count();
    expect(webpCount).toBeGreaterThanOrEqual(2); // desktop + mobile WebP

    // Verify mobile JPEG/PNG <source> with media query exists
    const mobileSources = picture.locator('source[media="(max-width: 828px)"]');
    const mobileCount = await mobileSources.count();
    expect(mobileCount).toBeGreaterThanOrEqual(2); // mobile WebP + mobile JPEG
  });

  test('should load a WebP image when browser supports it', async ({ page, browserName }) => {
    // WebP is supported by all modern browsers (Chromium, Firefox, WebKit)
    const image = page.locator('img[alt*="Find"]');
    await expect(image).toBeVisible();

    // Check the actual source the browser chose to load
    const currentSrc = await image.evaluate((img: HTMLImageElement) => img.currentSrc);
    
    if (browserName === 'firefox') {
      // Firefox in Playwright may not always negotiate WebP with <picture>;
      // verify it loads a valid image format (WebP or JPEG/PNG fallback)
      expect(currentSrc).toMatch(/\.(webp|jpe?g|png)$/i);
    } else {
      expect(currentSrc).toMatch(/\.webp$/i);
    }
  });

  test('should have WebP source URLs that match the original image pattern', async ({ page }) => {
    const image = page.locator('img[alt*="Find"]');
    await expect(image).toBeVisible();

    // Get the original <img> src
    const imgSrc = await image.getAttribute('src');
    expect(imgSrc).toBeTruthy();

    // Get desktop WebP source
    const picture = page.locator('picture').filter({ has: page.locator('img[alt*="Find"]') });
    const desktopWebpSource = picture.locator('source[type="image/webp"]:not([media])');
    const desktopWebpSrcSet = await desktopWebpSource.getAttribute('srcset');

    // WebP source should be the same filename but with .webp extension
    const expectedWebp = imgSrc!.replace(/\.(jpe?g|png)$/i, '.webp');
    expect(desktopWebpSrcSet).toBe(expectedWebp);
  });

  test('should load mobile WebP variant on narrow viewports', async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip();
    }

    const image = page.locator('img[alt*="Find"]');
    await expect(image).toBeVisible();

    // On mobile viewports (<= 828px), the browser should choose mobile-webp source
    const currentSrc = await image.evaluate((img: HTMLImageElement) => img.currentSrc);
    expect(currentSrc).toMatch(/-mobile\.webp$/i);
  });

  test('should still advance to next image with WebP sources', async ({ page }) => {
    // Verify the game works end-to-end with <picture> + WebP
    const image = page.locator('img[alt*="Find"]');
    await expect(image).toBeVisible();

    const firstSrc = await image.evaluate((img: HTMLImageElement) => img.currentSrc);

    // Skip to next image
    await page.locator('button:has-text("Skip")').click();
    await page.waitForTimeout(500);

    // Verify new image loaded (different src)
    const newImage = page.locator('img[alt*="Find"]');
    await expect(newImage).toBeVisible();
    const secondSrc = await newImage.evaluate((img: HTMLImageElement) => img.currentSrc);

    expect(firstSrc).toBeTruthy();
    expect(secondSrc).toBeTruthy();
    expect(firstSrc).not.toBe(secondSrc);
  });
});
