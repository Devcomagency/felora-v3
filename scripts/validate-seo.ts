#!/usr/bin/env tsx
/**
 * Script de validation SEO - À exécuter en CI/CD
 * Vérifie que toutes les pages ont des metadata complètes
 */

import * as fs from 'fs'
import * as path from 'path'
import { glob } from 'glob'

interface SEOIssue {
  file: string
  severity: 'error' | 'warning'
  message: string
}

const issues: SEOIssue[] = []

// Patterns à ignorer (pages internes, archives, etc.)
const IGNORE_PATTERNS = [
  '**/node_modules/**',
  '**/_archive/**',
  '**/dev/**',
  '**/test*/**',
  '**/debug*/**',
  '**/.next/**',
]

// Pages publiques qui DOIVENT avoir des metadata
const PUBLIC_ROUTES = [
  'src/app/page.tsx',
  'src/app/search/**/*.tsx',
  'src/app/map/**/*.tsx',
  'src/app/profiles/**/*.tsx',
  'src/app/clubs/**/*.tsx',
  'src/app/profile/[id]/**/*.tsx',
  'src/app/landing/**/*.tsx',
  'src/app/legal/**/*.tsx',
]

async function validateMetadata(filePath: string): Promise<void> {
  const content = fs.readFileSync(filePath, 'utf-8')
  const fileName = path.relative(process.cwd(), filePath)

  // Vérifier si c'est un layout ou une page
  const isLayout = filePath.includes('layout.tsx')
  const isPage = filePath.includes('page.tsx')

  if (!isLayout && !isPage) return

  // Vérifier la présence de metadata export
  const hasMetadataExport = /export\s+(const\s+)?metadata\s*[:=]/i.test(content)
  const hasGenerateMetadata = /export\s+async\s+function\s+generateMetadata/i.test(content)

  if (!hasMetadataExport && !hasGenerateMetadata) {
    issues.push({
      file: fileName,
      severity: 'error',
      message: 'Missing metadata export or generateMetadata function'
    })
    return
  }

  // Vérifier les champs essentiels dans les metadata statiques
  if (hasMetadataExport) {
    const requiredFields = ['title', 'description']
    for (const field of requiredFields) {
      const regex = new RegExp(`${field}\\s*:`, 'i')
      if (!regex.test(content)) {
        issues.push({
          file: fileName,
          severity: 'error',
          message: `Missing required metadata field: ${field}`
        })
      }
    }

    // Vérifier OpenGraph (recommandé)
    if (!/openGraph\s*:/i.test(content)) {
      issues.push({
        file: fileName,
        severity: 'warning',
        message: 'Missing OpenGraph metadata (recommended for social sharing)'
      })
    }

    // Vérifier Twitter Card (recommandé)
    if (!/twitter\s*:/i.test(content)) {
      issues.push({
        file: fileName,
        severity: 'warning',
        message: 'Missing Twitter Card metadata (recommended for social sharing)'
      })
    }

    // Vérifier canonical/alternates (important pour i18n)
    if (!/alternates\s*:/i.test(content) && !/canonical\s*:/i.test(content)) {
      issues.push({
        file: fileName,
        severity: 'warning',
        message: 'Missing canonical/alternates (important for i18n and duplicate content)'
      })
    }
  }
}

async function validateImages(filePath: string): Promise<void> {
  const content = fs.readFileSync(filePath, 'utf-8')
  const fileName = path.relative(process.cwd(), filePath)

  // Détecter les <img> non optimisées (doit utiliser next/image)
  const imgTags = content.match(/<img[^>]+>/gi)
  if (imgTags && imgTags.length > 0) {
    // Vérifier si c'est dans un composant client ou serveur
    const isClientComponent = /['"]use client['"]/i.test(content)

    for (const imgTag of imgTags) {
      // Exclure les SVG (pas besoin de next/image pour les SVG)
      if (/src=["'][^"']*\.svg["']/i.test(imgTag)) continue

      // Vérifier si l'image a un alt text
      if (!/alt=["'][^"']+["']/i.test(imgTag)) {
        issues.push({
          file: fileName,
          severity: 'error',
          message: `Image missing alt text: ${imgTag.substring(0, 50)}...`
        })
      }

      // Recommander l'utilisation de next/image
      if (!content.includes('next/image')) {
        issues.push({
          file: fileName,
          severity: 'warning',
          message: 'Consider using next/image instead of <img> for better performance'
        })
      }
    }
  }

  // Détecter les next/image sans alt
  const nextImagePattern = /<Image[^>]+>/gi
  const nextImages = content.match(nextImagePattern)
  if (nextImages) {
    for (const img of nextImages) {
      if (!/alt=\{?["'][^"']*["']\}?/i.test(img) && !/alt=\{[^}]+\}/i.test(img)) {
        issues.push({
          file: fileName,
          severity: 'error',
          message: `Next Image missing alt attribute: ${img.substring(0, 50)}...`
        })
      }
    }
  }
}

async function validateHeadingHierarchy(filePath: string): Promise<void> {
  const content = fs.readFileSync(filePath, 'utf-8')
  const fileName = path.relative(process.cwd(), filePath)

  // Détecter la hiérarchie des titres
  const h1Count = (content.match(/<h1[^>]*>/gi) || []).length

  if (h1Count === 0 && filePath.includes('page.tsx')) {
    issues.push({
      file: fileName,
      severity: 'warning',
      message: 'Page should have exactly one <h1> tag'
    })
  } else if (h1Count > 1) {
    issues.push({
      file: fileName,
      severity: 'error',
      message: `Multiple <h1> tags found (${h1Count}). Should have only one.`
    })
  }
}

async function main() {
  console.log('🔍 Starting SEO validation...\n')

  // Récupérer tous les fichiers tsx/jsx dans src/app
  const files = await glob('src/app/**/*.{tsx,jsx}', {
    ignore: IGNORE_PATTERNS
  })

  console.log(`📄 Analyzing ${files.length} files...\n`)

  for (const file of files) {
    try {
      await validateMetadata(file)
      await validateImages(file)
      await validateHeadingHierarchy(file)
    } catch (error) {
      console.error(`Error analyzing ${file}:`, error)
    }
  }

  // Afficher les résultats
  console.log('\n' + '='.repeat(80))
  console.log('📊 SEO VALIDATION RESULTS')
  console.log('='.repeat(80) + '\n')

  if (issues.length === 0) {
    console.log('✅ All SEO checks passed!\n')
    process.exit(0)
  }

  // Grouper par sévérité
  const errors = issues.filter(i => i.severity === 'error')
  const warnings = issues.filter(i => i.severity === 'warning')

  if (errors.length > 0) {
    console.log(`❌ ${errors.length} ERROR${errors.length > 1 ? 'S' : ''}\n`)
    errors.forEach(issue => {
      console.log(`  File: ${issue.file}`)
      console.log(`  Issue: ${issue.message}\n`)
    })
  }

  if (warnings.length > 0) {
    console.log(`⚠️  ${warnings.length} WARNING${warnings.length > 1 ? 'S' : ''}\n`)
    warnings.forEach(issue => {
      console.log(`  File: ${issue.file}`)
      console.log(`  Issue: ${issue.message}\n`)
    })
  }

  console.log('='.repeat(80) + '\n')

  // Exit avec erreur si des erreurs critiques
  if (errors.length > 0) {
    console.error('❌ SEO validation failed with errors. Please fix them before deploying.\n')
    process.exit(1)
  } else {
    console.log('⚠️  SEO validation passed with warnings. Consider fixing them.\n')
    process.exit(0)
  }
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
