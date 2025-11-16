#!/usr/bin/env node
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MAX_DIMENSION = 3840;
const QUALITY = 80;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function processImage(filePath, originalSize) {
  try {
    // Read to buffer first to avoid file locking
    const inputBuffer = await fs.readFile(filePath);
    // Disable auto-rotation by not rotating based on EXIF orientation
    const image = sharp(inputBuffer, { failOnError: false });
    // Remove any rotation by stripping metadata
    image.withMetadata({ orientation: undefined });
    const metadata = await image.metadata();
    
    if (!metadata.width || !metadata.height) {
      console.log(`  ⚠ Skipping ${path.basename(filePath)} - no dimensions`);
      return;
    }
    
    const maxDimension = Math.max(metadata.width, metadata.height);
    let processedImage = image;
    let wasResized = false;
    
    // Resize if needed
    if (maxDimension > MAX_DIMENSION) {
      wasResized = true;
      processedImage = processedImage.resize(MAX_DIMENSION, MAX_DIMENSION, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }
    
    // Always apply compression to all images
    const fileName = path.basename(filePath);
    if (/\.jpe?g$/i.test(fileName)) {
      processedImage = processedImage.jpeg({ quality: QUALITY });
    } else if (/\.png$/i.test(fileName)) {
      processedImage = processedImage.png({ quality: QUALITY });
    }
    
    // Process to buffer
    const optimized = await processedImage.toBuffer();
    
    // Write atomically by writing to temp file then renaming
    const tempPath = `${filePath}.tmp`;
    await fs.writeFile(tempPath, optimized);
    await fs.rename(tempPath, filePath);
    
    const newSize = optimized.length;
    const savedPercent = Math.round(((originalSize - newSize) / originalSize) * 100);
    const savedKB = Math.round((originalSize - newSize) / 1024);
    
    const resizeInfo = wasResized ? ` (resized from ${metadata.width}x${metadata.height})` : '';
    console.log(`  ✓ ${fileName}: ${Math.round(originalSize/1024)}KB → ${Math.round(newSize/1024)}KB (${savedPercent >= 0 ? 'saved' : 'added'} ${Math.abs(savedPercent)}%, ${Math.abs(savedKB)}KB)${resizeInfo}`);
  } catch (err) {
    console.error(`  ❌ Error processing ${path.basename(filePath)}:`, err.message);
  }
}

async function optimizeImages() {
  // The build outputs to dist/apps/waldo-app, not apps/waldo-app/dist
  const distImages = path.join(__dirname, '..', '..', '..', 'dist', 'apps', 'waldo-app', 'images');
  
  try {
    // Give Windows time to release file handles from the build process
    console.log('\n⏳ Waiting for build to complete...');
    await sleep(1000);
    
    const files = await fs.readdir(distImages);
    const imageFiles = files.filter(f => /\.(jpe?g|png)$/i.test(f));
    
    console.log(`\n📐 Optimizing ${imageFiles.length} images in dist folder...\n`);
    
    let totalOriginalSize = 0;
    let totalNewSize = 0;
    
    for (const file of imageFiles) {
      const filePath = path.join(distImages, file);
      const stats = await fs.stat(filePath);
      const originalSize = stats.size;
      totalOriginalSize += originalSize;
      
      await processImage(filePath, originalSize);
      
      // Get new size
      const newStats = await fs.stat(filePath);
      totalNewSize += newStats.size;
    }
    
    const totalSavedPercent = Math.round(((totalOriginalSize - totalNewSize) / totalOriginalSize) * 100);
    const totalSavedKB = Math.round((totalOriginalSize - totalNewSize) / 1024);
    
    console.log(`\n💰 Total savings: ${totalSavedKB}KB / ${Math.round(totalOriginalSize/1024)}KB ≈ ${totalSavedPercent}%`);
    console.log('✨ All images optimized!\n');
  } catch (err) {
    console.error('❌ Error in image optimizer:', err.message);
    process.exit(1);
  }
}

optimizeImages();
