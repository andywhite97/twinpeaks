#!/usr/bin/env node

/**
 * Image Compression Script for Twinpeaks
 *
 * USAGE:
 *   node scripts/compress-images.js
 *
 * This script compresses all JPG and PNG images in public/img
 * Output goes to public/img-optimized/
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const sourceDir = path.join(__dirname, '../public/img');
const outputDir = path.join(__dirname, '../public/img-optimized');

console.log('🖼️  Image Compression Script\n');
console.log('═══════════════════════════════════════\n');

// Check if ImageMagick is installed
console.log('Checking for ImageMagick...');
try {
  execSync('magick --version', { stdio: 'ignore' });
  console.log('✅ ImageMagick found\n');
} catch {
  console.log('❌ ImageMagick not found');
  console.log('   Install with: choco install imagemagick\n');
  process.exit(1);
}

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`📁 Created output directory: ${outputDir}\n`);
}

// Recursively compress images
function compressImages(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Recursively process subdirectories
      compressImages(filePath);
    } else if (file.match(/\.(jpg|jpeg|png)$/i)) {
      const relPath = path.relative(sourceDir, filePath);
      const outPath = path.join(outputDir, relPath);
      const outDir = path.dirname(outPath);

      // Create subdirectory if needed
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }

      console.log(`📦 Compressing: ${relPath}`);

      try {
        // Compress with ImageMagick
        // Quality 85 is excellent for web (minimal visual loss)
        if (file.match(/\.png$/i)) {
          // PNG: use quality 85-90
          execSync(
            `magick convert "${filePath}" -quality 90 -strip "${outPath}"`,
            { stdio: 'ignore' }
          );
        } else {
          // JPG: use quality 85
          execSync(
            `magick convert "${filePath}" -quality 85 -strip -interlace Plane "${outPath}"`,
            { stdio: 'ignore' }
          );
        }

        // Calculate savings
        const origSize = fs.statSync(filePath).size / 1024;
        const newSize = fs.statSync(outPath).size / 1024;
        const savings = ((1 - newSize / origSize) * 100).toFixed(1);

        console.log(`   ✅ ${origSize.toFixed(1)}KB → ${newSize.toFixed(1)}KB (saved ${savings}%)\n`);
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
      }
    }
  });
}

console.log('Starting compression...\n');
console.log('═══════════════════════════════════════\n');

const startTime = Date.now();

try {
  compressImages(sourceDir);

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log('═══════════════════════════════════════');
  console.log(`✅ Compression complete! (${duration}s)\n`);
  console.log(`📂 Output directory: ${outputDir}\n`);
  console.log('NEXT STEPS:');
  console.log('1. Review compressed images in img-optimized/');
  console.log('2. If satisfied, backup original public/img/');
  console.log('3. Copy compressed images to public/img/');
  console.log('4. Test website performance\n');
} catch (error) {
  console.error(`❌ Error: ${error.message}`);
  process.exit(1);
}
