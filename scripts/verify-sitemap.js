#!/usr/bin/env node

/**
 * Script de vérification du sitemap
 * Vérifie que toutes les URLs utilisent le bon domaine
 */

const https = require('https');
const http = require('http');

const PRODUCTION_DOMAIN = 'https://felora.ch';
const ALLOWED_DOMAINS = [
  'https://felora.ch',
  'http://localhost:3000',
  'http://192.168.1.238:3000',
];

async function fetchSitemap(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;

    client.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        }
      });
    }).on('error', reject);
  });
}

function extractUrls(xml) {
  const urlRegex = /<loc>(.*?)<\/loc>/g;
  const urls = [];
  let match;

  while ((match = urlRegex.exec(xml)) !== null) {
    urls.push(match[1]);
  }

  return urls;
}

function validateUrls(urls, expectedDomain) {
  const issues = [];

  urls.forEach((url, index) => {
    // Vérifier que l'URL commence par le domaine attendu
    if (expectedDomain && !url.startsWith(expectedDomain)) {
      issues.push({
        line: index + 1,
        url,
        issue: `URL ne commence pas par ${expectedDomain}`,
      });
    }

    // Vérifier que l'URL est bien formée
    try {
      new URL(url);
    } catch (error) {
      issues.push({
        line: index + 1,
        url,
        issue: 'URL mal formée',
      });
    }

    // Vérifier qu'il n'y a pas de slash double
    if (url.includes('//') && !url.startsWith('http://') && !url.startsWith('https://')) {
      issues.push({
        line: index + 1,
        url,
        issue: 'Slash double détecté',
      });
    }
  });

  return issues;
}

async function main() {
  const args = process.argv.slice(2);
  const sitemapUrl = args[0] || 'http://localhost:3000/sitemap.xml';

  console.log('🔍 Vérification du sitemap...');
  console.log(`📄 URL: ${sitemapUrl}\n`);

  try {
    // Récupérer le sitemap
    const xml = await fetchSitemap(sitemapUrl);

    // Extraire les URLs
    const urls = extractUrls(xml);
    console.log(`✅ ${urls.length} URLs trouvées\n`);

    // Déterminer le domaine attendu
    let expectedDomain = null;
    if (process.env.VERCEL_ENV === 'production') {
      expectedDomain = PRODUCTION_DOMAIN;
    }

    // Valider les URLs
    const issues = validateUrls(urls, expectedDomain);

    if (issues.length === 0) {
      console.log('✅ Toutes les URLs sont valides !');

      // Afficher un échantillon
      console.log('\n📋 Échantillon des URLs (5 premières) :');
      urls.slice(0, 5).forEach((url, i) => {
        console.log(`  ${i + 1}. ${url}`);
      });

      if (urls.length > 5) {
        console.log(`  ... et ${urls.length - 5} autres URLs`);
      }

      process.exit(0);
    } else {
      console.error('❌ Problèmes détectés dans le sitemap :\n');

      issues.slice(0, 10).forEach((issue) => {
        console.error(`  Ligne ${issue.line}: ${issue.issue}`);
        console.error(`    URL: ${issue.url}\n`);
      });

      if (issues.length > 10) {
        console.error(`  ... et ${issues.length - 10} autres problèmes`);
      }

      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Erreur lors de la vérification du sitemap:');
    console.error(`   ${error.message}`);
    process.exit(1);
  }
}

main();
