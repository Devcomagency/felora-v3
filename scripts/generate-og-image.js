/**
 * Script pour générer une image OpenGraph statique
 * Utilise sharp pour créer une image 1200x630 optimisée pour WhatsApp
 */

const sharp = require('sharp');
const path = require('path');

async function generateOGImage() {
  const width = 1200;
  const height = 630;

  // Créer un SVG avec le design Felora
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#FF6B9D;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#B794F6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#4FD1C7;stop-opacity:1" />
        </linearGradient>
      </defs>

      <!-- Background gradient -->
      <rect width="${width}" height="${height}" fill="url(#gradient)"/>

      <!-- Main content -->
      <g>
        <!-- FELORA text -->
        <text
          x="600"
          y="260"
          font-family="system-ui, -apple-system, sans-serif"
          font-size="120"
          font-weight="900"
          fill="white"
          text-anchor="middle"
          letter-spacing="-3"
        >FELORA</text>

        <!-- Subtitle -->
        <text
          x="600"
          y="340"
          font-family="system-ui, -apple-system, sans-serif"
          font-size="36"
          font-weight="500"
          fill="rgba(255,255,255,0.95)"
          text-anchor="middle"
        >Plateforme Premium — Rencontres d'exception</text>

        <!-- Features -->
        <g transform="translate(200, 420)">
          <!-- Verified badge -->
          <rect x="0" y="0" width="220" height="60" rx="12" fill="rgba(255,255,255,0.2)"/>
          <text
            x="110"
            y="40"
            font-family="system-ui, -apple-system, sans-serif"
            font-size="24"
            font-weight="600"
            fill="white"
            text-anchor="middle"
          >✓ Profils Vérifiés</text>

          <!-- Secure badge -->
          <rect x="250" y="0" width="180" height="60" rx="12" fill="rgba(255,255,255,0.2)"/>
          <text
            x="340"
            y="40"
            font-family="system-ui, -apple-system, sans-serif"
            font-size="24"
            font-weight="600"
            fill="white"
            text-anchor="middle"
          >✓ Sécurisé</text>

          <!-- Premium badge -->
          <rect x="460" y="0" width="170" height="60" rx="12" fill="rgba(255,255,255,0.2)"/>
          <text
            x="545"
            y="40"
            font-family="system-ui, -apple-system, sans-serif"
            font-size="24"
            font-weight="600"
            fill="white"
            text-anchor="middle"
          >✓ Premium</text>
        </g>
      </g>
    </svg>
  `;

  // Générer l'image PNG
  await sharp(Buffer.from(svg))
    .png({ quality: 95, compressionLevel: 9 })
    .toFile(path.join(__dirname, '../public/og-image.png'));

  console.log('✅ Image OpenGraph générée : public/og-image.png');

  // Générer aussi un favicon
  await sharp(Buffer.from(`
    <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#FF6B9D;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#B794F6;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="102" fill="url(#iconGradient)"/>
      <text
        x="256"
        y="380"
        font-family="system-ui, -apple-system, sans-serif"
        font-size="280"
        font-weight="900"
        fill="white"
        text-anchor="middle"
        letter-spacing="-10"
      >F</text>
    </svg>
  `))
    .png({ quality: 95 })
    .toFile(path.join(__dirname, '../public/icon-512.png'));

  console.log('✅ Icône générée : public/icon-512.png');

  // Générer aussi une version 192x192
  await sharp(Buffer.from(`
    <svg width="192" height="192" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="iconGradient192" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#FF6B9D;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#B794F6;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="192" height="192" rx="38" fill="url(#iconGradient192)"/>
      <text
        x="96"
        y="142"
        font-family="system-ui, -apple-system, sans-serif"
        font-size="105"
        font-weight="900"
        fill="white"
        text-anchor="middle"
        letter-spacing="-4"
      >F</text>
    </svg>
  `))
    .png({ quality: 95 })
    .toFile(path.join(__dirname, '../public/icon-192.png'));

  console.log('✅ Icône 192x192 générée : public/icon-192.png');

  // Apple touch icon
  await sharp(Buffer.from(`
    <svg width="180" height="180" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="appleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#FF6B9D;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#B794F6;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="180" height="180" rx="36" fill="url(#appleGradient)"/>
      <text
        x="90"
        y="133"
        font-family="system-ui, -apple-system, sans-serif"
        font-size="98"
        font-weight="900"
        fill="white"
        text-anchor="middle"
        letter-spacing="-3"
      >F</text>
    </svg>
  `))
    .png({ quality: 95 })
    .toFile(path.join(__dirname, '../public/apple-touch-icon.png'));

  console.log('✅ Apple touch icon générée : public/apple-touch-icon.png');

  // Favicon 32x32
  await sharp(Buffer.from(`
    <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="favicon32" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#FF6B9D;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#B794F6;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="6" fill="url(#favicon32)"/>
      <text
        x="16"
        y="24"
        font-family="system-ui, -apple-system, sans-serif"
        font-size="18"
        font-weight="900"
        fill="white"
        text-anchor="middle"
      >F</text>
    </svg>
  `))
    .png({ quality: 95 })
    .toFile(path.join(__dirname, '../public/favicon-32x32.png'));

  console.log('✅ Favicon 32x32 générée : public/favicon-32x32.png');
}

generateOGImage().catch(console.error);
