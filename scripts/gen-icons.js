// One-off script to generate the site icons from the brand logo
// (public/brand/logo.webp). Run with: node scripts/gen-icons.js
//
// The logo is wide, so for the large icons (home screen, PWA) it is trimmed of
// its empty margin and fitted whole inside a square on white. For the tiny tab
// icons that would leave it small, so they use a square crop of the round
// emblem instead (the ends of the name banner are cut off, which is fine at
// 16-48 px) and the building, figures and tricolour ring fill the icon.
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const root = path.join(__dirname, '..');
const logo = path.join(root, 'public', 'brand', 'logo.webp');
const iconsDir = path.join(root, 'public', 'icons');
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };

async function emblem(size) {
  const crop = await sharp(logo).extract({ left: 238, top: 0, width: 1060, height: 1024 }).toBuffer();
  const fitted = await sharp(crop).resize(size, size, { fit: 'fill' }).toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: WHITE } })
    .composite([{ input: fitted }])
    .png()
    .toBuffer();
}

async function square(size, padding) {
  const inner = size - padding * 2;
  const trimmed = await sharp(logo).trim().toBuffer();
  const fitted = await sharp(trimmed)
    .resize(inner, inner, { fit: 'inside', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: WHITE } })
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
  out('icon-512.png', await square(512, 24));
  out('icon-192.png', await square(192, 10));
  out('apple-touch-icon.png', await square(180, 10));
  out('icon-48.png', await emblem(48));
  out('icon-32.png', await emblem(32));
  fs.writeFileSync(
    path.join(root, 'public', 'favicon.ico'),
    ico([
      { size: 48, data: await emblem(48) },
      { size: 32, data: await emblem(32) },
      { size: 16, data: await emblem(16) },
    ])
  );
  console.log('Icons written to', iconsDir, 'and public/favicon.ico');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
