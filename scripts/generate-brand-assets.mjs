/**
 * Generator Aset Logo & Ikon Resmi Fernando Capital (setara scripts/generate_brand_assets.py di Treasury Flow)
 * - Logo Utama (Light Mode di atas Warm Ivory #F4F0E7): Midnight Navy #101B2C (public/logo-navy.png & public/logo.png)
 * - Logo Alternatif (Dark Mode di atas Midnight Navy #101B2C): Champagne Gold #C3A477 (public/logo-gold.png)
 * - App Icons & Favicon: Champagne Gold #C3A477 di atas badge Midnight Navy #101B2C
 */
import sharp from "sharp";
import fs from "fs";

const INPUT_LOGO =
  "C:/Users/vinho/.gemini/antigravity/brain/d65485d6-3bb3-4a03-850c-4b2bb28199f4/.user_uploaded/media_1795360934513_abcafddd.png";

async function generateBrandAssets() {
  const { data, info } = await sharp(INPUT_LOGO).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  console.log("Source logo dimensions:", width, "x", height, "channels:", channels);

  let minX = width;
  let maxX = 0;
  let minY = height;
  let maxY = 0;

  const navyBuf = Buffer.alloc(width * height * 4);
  const goldBuf = Buffer.alloc(width * height * 4);

  // Midnight Navy: #101B2C -> R=16, G=27, B=44
  // Champagne Gold: #C3A477 -> R=195, G=164, B=119
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const outIdx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const srcAlpha = channels === 4 ? data[idx + 3] : 255;

      const lum = Math.round(((r + g + b) / 3) * (srcAlpha / 255));
      const alpha = lum <= 12 ? 0 : lum >= 245 ? 255 : lum;

      if (alpha > 15) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }

      // Logo Utama: Midnight Navy #101B2C
      navyBuf[outIdx] = 16;
      navyBuf[outIdx + 1] = 27;
      navyBuf[outIdx + 2] = 44;
      navyBuf[outIdx + 3] = alpha;

      // Logo Alternatif: Champagne Gold #C3A477
      goldBuf[outIdx] = 195;
      goldBuf[outIdx + 1] = 164;
      goldBuf[outIdx + 2] = 119;
      goldBuf[outIdx + 3] = alpha;
    }
  }

  const pad = 12;
  const cropLeft = Math.max(0, minX - pad);
  const cropTop = Math.max(0, minY - pad);
  const cropWidth = Math.min(width - cropLeft, maxX - minX + 1 + pad * 2);
  const cropHeight = Math.min(height - cropTop, maxY - minY + 1 + pad * 2);

  const croppedNavy = await sharp(navyBuf, { raw: { width, height, channels: 4 } })
    .extract({ left: cropLeft, top: cropTop, width: cropWidth, height: cropHeight })
    .png()
    .toBuffer();

  const croppedGold = await sharp(goldBuf, { raw: { width, height, channels: 4 } })
    .extract({ left: cropLeft, top: cropTop, width: cropWidth, height: cropHeight })
    .png()
    .toBuffer();

  fs.writeFileSync("public/logo-navy.png", croppedNavy);
  fs.writeFileSync("public/logo.png", croppedNavy);
  fs.writeFileSync("public/logo-gold.png", croppedGold);
  console.log(`Saved public/logo-navy.png, public/logo.png, public/logo-gold.png (${cropWidth}x${cropHeight})`);

  async function makeAppIcon(size, outPath) {
    const innerWidth = Math.round(size * 0.78);
    const resizedGoldCrest = await sharp(croppedGold)
      .resize({ width: innerWidth, height: innerWidth, fit: "inside" })
      .toBuffer();

    const radius = Math.round(size * 0.22);
    const bgSvg = Buffer.from(
      `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">` +
        `<rect width="${size}" height="${size}" rx="${radius}" fill="#101B2C"/>` +
        `<rect x="2" y="2" width="${size - 4}" height="${size - 4}" rx="${Math.max(4, radius - 2)}" fill="none" stroke="#C3A477" stroke-opacity="0.35" stroke-width="4"/>` +
        `</svg>`
    );

    await sharp(bgSvg)
      .composite([{ input: resizedGoldCrest, gravity: "center" }])
      .png()
      .toFile(outPath);
    console.log(`Saved app icon: ${outPath} (${size}x${size})`);
  }

  await makeAppIcon(512, "public/icon-512.png");
  await makeAppIcon(192, "public/icon-192.png");
  await makeAppIcon(512, "src/app/icon.png");
  await makeAppIcon(180, "src/app/apple-icon.png");

  const png64 = await sharp("src/app/icon.png").resize(64, 64).png().toBuffer();
  const icoHeader = Buffer.alloc(22);
  icoHeader.writeUInt16LE(0, 0);
  icoHeader.writeUInt16LE(1, 2);
  icoHeader.writeUInt16LE(1, 4);
  icoHeader.writeUInt8(64, 6);
  icoHeader.writeUInt8(64, 7);
  icoHeader.writeUInt8(0, 8);
  icoHeader.writeUInt8(0, 9);
  icoHeader.writeUInt16LE(1, 10);
  icoHeader.writeUInt16LE(32, 12);
  icoHeader.writeUInt32LE(png64.length, 14);
  icoHeader.writeUInt32LE(22, 18);
  fs.writeFileSync("src/app/favicon.ico", Buffer.concat([icoHeader, png64]));
  console.log("Saved src/app/favicon.ico (64x64 ICO)");
}

generateBrandAssets().catch(console.error);
