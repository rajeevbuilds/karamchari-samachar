// One-off script to generate the site icons from the brand logo
// (public/brand/logo.webp, a round logo on a transparent square).
// Run with: node scripts/gen-icons.js
//
// The 16-48 px tab icons keep the transparent corners so the round logo shows
// as a circle. The home-screen icons (180, 192, 512 px) sit on white, because
// phones fill transparent areas with black or a theme colour.
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const root = path.join(__dirname, '..');
const logo = path.join(root, 'public', 'brand', 'logo.webp');
const iconsDir = path.join(root, 'public', 'icons');
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };
const CLEAR = { r: 0, g: 0, b: 0, alpha: 0 };

async function icon(size, padding, background) {
  const inner = size - padding * 2;
  const fitted = await sharp(logo).resize(inner, inner, { fit: 'inside', background: CLEAR }).toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: fitted, gravity: 'centre' }])
    .png()
    .toBuffer();
}

// A .ico file that holds PNG images (supported by every current browser).
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + images.length * 16;
  const entries = images.map(({ size, data }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    return e;
  });
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

async function run() {
  const out = (name, buf) => fs.writeFileSync(path.join(iconsDir, name), buf);
  out('icon-512.png', await icon(512, 16, WHITE));
  out('icon-192.png', await icon(192, 6, WHITE));
  out('apple-touch-icon.png', await icon(180, 6, WHITE));
  out('icon-48.png', await icon(48, 0, CLEAR));
  out('icon-32.png', await icon(32, 0, CLEAR));
  fs.writeFileSync(
    path.join(root, 'public', 'favicon.ico'),
    ico([
      { size: 48, data: await icon(48, 0, CLEAR) },
      { size: 32, data: await icon(32, 0, CLEAR) },
      { size: 16, data: await icon(16, 0, CLEAR) },
    ])
  );
  console.log('Icons written to', iconsDir, 'and public/favicon.ico');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
