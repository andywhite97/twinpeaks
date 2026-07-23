#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// This is a setup guide for image compression automation
// Choose one of the methods below based on your preference

const methods = `
# IMAGE COMPRESSION - AUTOMATED SETUP

## METHOD 1: Simple NPM Script (Recommended for Angular)

1. Install image compression packages:
   cd c:\\Users\\djand\\Projects\\Twinpeaks\\front
   npm install --save-dev imagemin@8.0.0 imagemin-jpeg-recompress@7.0.0 imagemin-pngquant@10.0.0 imagemin-webp@7.0.0

2. Create compress script (scripts/compress-images.js):
   - Run: node scripts/compress-images.js
   - Outputs to: public/img-optimized/

3. Add to package.json scripts:
   "compress-images": "node scripts/compress-images.js"

4. Run whenever needed:
   npm run compress-images

---

## METHOD 2: ImageMagick (Fastest, System-wide)

1. Install ImageMagick:
   choco install imagemagick

2. Compress all JPGs in a folder:
   cd c:\\Users\\djand\\Projects\\Twinpeaks\\front\\public\\img\\headers
   for %f in (*.jpg) do @magick convert "%f" -quality 85 -strip "%f"

3. Convert to WebP:
   for %f in (*.jpg) do @magick convert "%f" -quality 85 "%f:r.webp"

---

## METHOD 3: FFmpeg (Best for Video/Multiple Formats)

1. Install FFmpeg:
   choco install ffmpeg

2. Convert to WebP:
   cd c:\\Users\\djand\\Projects\\Twinpeaks\\front\\public\\img
   for /r . %f in (*.jpg) do @ffmpeg -i "%f" -q:v 80 "%f:r.webp" -y

3. Or convert to AVIF (modern browsers):
   ffmpeg -i image.jpg -c:v libaom-av1 -crf 30 image.avif

---

## METHOD 4: Online Tool (No Installation)

1. Visit: https://tinypng.com/
2. Drag & drop images
3. Download compressed versions
4. Replace originals

---

## QUICK START - CHOOSE ONE:

### Option A: TinyPNG (Easiest for beginners)
- No setup required
- Drag & drop
- Best for small batches (< 50 images)
- Free: 20 images/month

### Option B: ImageMagick (Fastest for large batches)
- One-time install
- Command line
- Process 100+ images in seconds
- Best for automated workflows

### Option C: Node.js Script (Best for Angular CI/CD)
- Integrates with build process
- Can automate in GitHub Actions
- Part of your project
- Consistent results

---

## RECOMMENDED: Use ImageMagick

Why?
1. Fastest batch processing
2. One command compresses folder
3. Can convert formats
4. Already used in web dev
5. Works on Windows/Mac/Linux

Install:
  choco install imagemagick

Test it works:
  magick --version

Quick compress:
  cd c:\\Users\\djand\\Projects\\Twinpeaks\\front\\public\\img\\backgrounds
  magick mogrify -quality 85 *.jpg

That's it! Your JPGs are now compressed to 85% quality.
`;

console.log(methods);

// Detect system and available tools
console.log('\n\n═══════════════════════════════════════');
console.log('SYSTEM DETECTION');
console.log('═══════════════════════════════════════\n');

const { execSync } = require('child_process');

function checkTool(tool) {
  try {
    execSync(`where ${tool}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

const tools = {
  'ImageMagick': 'magick',
  'FFmpeg': 'ffmpeg',
  'Node.js': 'node'
};

console.log('Available tools on your system:\n');
Object.entries(tools).forEach(([name, cmd]) => {
  const available = checkTool(cmd);
  console.log(`  ${available ? '✅' : '❌'} ${name}`);
});

console.log('\n\n═══════════════════════════════════════');
console.log('NEXT STEPS');
console.log('═══════════════════════════════════════\n');
console.log('1. Choose a method above');
console.log('2. Follow the installation steps');
console.log('3. Run the compression command');
console.log('4. Verify results');
console.log('5. Replace original images or deploy new ones\n');
