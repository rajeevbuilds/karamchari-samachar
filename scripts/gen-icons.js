// One-off script to generate PWA icons from a brand-colored SVG monogram.
// Run with: node scripts/gen-icons.js
const sharp = require('sharp');
const path = require('path');

const MAROON = '#7E1F35';

function svg(size, radius) {
  const fontSize = Math.round(size * 0.44);
  return `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${radius}" fill="${MAROON}"/>
  <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle"
    font-family="Georgia, 'Iowan Old Style', serif" font-weight="700"
    font-size="${fontSize}" fill="#F5F1E6">KS</text>
</svg>`;
}

const outDir = path.join(__dirname, '..', 'public', 'icons');

async function run() {
  await sharp(Buffer.from(svg(192, 28))).png().toFile(path.join(outDir, 'icon-192.png'));
  await sharp(Buffer.from(svg(512, 76))).png().toFile(path.join(outDir, 'icon-512.png'));
  await sharp(Buffer.from(svg(180, 0))).png().toFile(path.join(outDir, 'apple-touch-icon.png'));
  console.log('Icons written to', outDir);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
