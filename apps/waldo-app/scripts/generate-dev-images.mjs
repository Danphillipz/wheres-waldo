#!/usr/bin/env node
/**
 * Generate WebP and mobile variants from source images in public/images/.
 * Used for local development so <picture> WebP sources work in the dev server.
 * Production builds use optimize-dist-images.mjs which operates on the dist output.
 */
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MOBILE_MAX_DIMENSION = 828;
const QUALITY = 75;
const WEBP_QUALITY = 72;

async function generateDevImages() {
  const publicImages = path.join(__dirname, '..', 'public', 'images');

  try {
    const files = await fs.readdir(publicImages);
    const sourceFiles = files.filter(f => /\.(jpe?g|png)$/i.test(f) && !f.includes('-mobile'));

    let generated = 0;
    let skipped = 0;

    for (const file of sourceFiles) {
      const filePath = path.join(publicImages, file);
      const ext = path.extname(file);
      const baseName = path.basename(file, ext);

      // Generate desktop WebP
      const webpPath = path.join(publicImages, `${baseName}.webp`);
      try {
        await fs.access(webpPath);
        skipped++;
      } catch (err) {
        if (err.code !== 'ENOENT') throw err;
        const inputBuffer = await fs.readFile(filePath);
        const webpBuffer = await sharp(inputBuffer, { failOnError: false })
          .withMetadata({ orientation: undefined })
          .webp({ quality: WEBP_QUALITY })
          .toBuffer();
        await fs.writeFile(webpPath, webpBuffer);
        generated++;
      }

      // Generate mobile JPEG/PNG
      const mobilePath = path.join(publicImages, `${baseName}-mobile${ext}`);
      try {
        await fs.access(mobilePath);
        skipped++;
      } catch (err) {
        if (err.code !== 'ENOENT') throw err;
        const inputBuffer = await fs.readFile(filePath);
        const metadata = await sharp(inputBuffer, { failOnError: false }).metadata();
        if (metadata.width && metadata.height) {
          const maxDim = Math.max(metadata.width, metadata.height);
          if (maxDim > MOBILE_MAX_DIMENSION) {
            let mobileImage = sharp(inputBuffer, { failOnError: false })
              .withMetadata({ orientation: undefined })
              .resize(MOBILE_MAX_DIMENSION, MOBILE_MAX_DIMENSION, {
                fit: 'inside',
                withoutEnlargement: true,
              });
            if (/\.jpe?g$/i.test(file)) {
              mobileImage = mobileImage.jpeg({ quality: QUALITY });
            } else {
              mobileImage = mobileImage.png({ quality: QUALITY });
            }
            const mobileBuffer = await mobileImage.toBuffer();
            await fs.writeFile(mobilePath, mobileBuffer);
            generated++;
          }
        }
      }

      // Generate mobile WebP
      const mobileWebpPath = path.join(publicImages, `${baseName}-mobile.webp`);
      try {
        await fs.access(mobileWebpPath);
        skipped++;
      } catch (err) {
        if (err.code !== 'ENOENT') throw err;
        const inputBuffer = await fs.readFile(filePath);
        const metadata = await sharp(inputBuffer, { failOnError: false }).metadata();
        if (metadata.width && metadata.height) {
          const maxDim = Math.max(metadata.width, metadata.height);
          if (maxDim > MOBILE_MAX_DIMENSION) {
            const mobileWebpBuffer = await sharp(inputBuffer, { failOnError: false })
              .withMetadata({ orientation: undefined })
              .resize(MOBILE_MAX_DIMENSION, MOBILE_MAX_DIMENSION, {
                fit: 'inside',
                withoutEnlargement: true,
              })
              .webp({ quality: WEBP_QUALITY })
              .toBuffer();
            await fs.writeFile(mobileWebpPath, mobileWebpBuffer);
            generated++;
          }
        }
      }
    }

    if (generated > 0) {
      console.log(`✨ Generated ${generated} image variant(s) for dev (${skipped} already existed)`);
    } else {
      console.log(`✅ All ${skipped} dev image variants already exist`);
    }
  } catch (err) {
    console.error('❌ Error generating dev images:', err.message);
    process.exit(1);
  }
}

generateDevImages();
