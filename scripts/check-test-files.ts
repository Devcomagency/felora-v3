#!/usr/bin/env tsx
/**
 * Script CI pour détecter les fichiers test/debug accidentellement présents dans src/app
 * Évite que des pages de test ne reviennent en production
 */

import * as fs from 'fs'
import * as path from 'path'
import { glob } from 'glob'

interface TestFile {
  path: string
  reason: string
}

const testFiles: TestFile[] = []

// Patterns interdits dans src/app (hors _archive)
const FORBIDDEN_PATTERNS = [
  'test-*.tsx',
  'test-*.ts',
  '*-test.tsx',
  '*-test.ts',
  'debug-*.tsx',
  'debug-*.ts',
  'dev-*.tsx',
  'dev-*.ts',
  '*.test.tsx',
  '*.test.ts',
  '*.spec.tsx',
  '*.spec.ts',
]

// Dossiers autorisés pour les tests
const ALLOWED_FOLDERS = [
  '_archive',
  '__tests__',
  '__mocks__',
  'tests',
  'test',
]

async function checkTestFiles() {
  console.log('🔍 Checking for test/debug files in src/app...\n')

  for (const pattern of FORBIDDEN_PATTERNS) {
    try {
      const files = await glob(`src/app/**/${pattern}`, {
        ignore: ALLOWED_FOLDERS.map(folder => `**/${folder}/**`),
      })

      files.forEach(file => {
        testFiles.push({
          path: file,
          reason: `Matches forbidden pattern: ${pattern}`,
        })
      })
    } catch (error) {
      console.error(`Error checking pattern ${pattern}:`, error)
    }
  }

  // Afficher les résultats
  console.log('='.repeat(80))
  console.log('🔒 TEST FILES CHECK RESULTS')
  console.log('='.repeat(80) + '\n')

  if (testFiles.length === 0) {
    console.log('✅ No test/debug files found in src/app\n')
    console.log('='.repeat(80) + '\n')
    process.exit(0)
  }

  console.log(`❌ Found ${testFiles.length} test/debug file(s) in src/app:\n`)

  testFiles.forEach(file => {
    console.log(`  📄 ${file.path}`)
    console.log(`     Reason: ${file.reason}\n`)
  })

  console.log('='.repeat(80))
  console.log('\n❌ Test/debug files detected in production code!')
  console.log('   Please move them to src/app/_archive/ or remove them.\n')
  console.log('='.repeat(80) + '\n')

  process.exit(1)
}

// Fonction pour vérifier les routes qui pourraient être accessibles
async function checkRoutes() {
  console.log('🔍 Checking for potentially public test routes...\n')

  const routeFiles = await glob('src/app/**/page.tsx')
  const suspiciousRoutes: string[] = []

  for (const file of routeFiles) {
    const relativePath = path.relative('src/app', file)

    // Ignorer _archive et les dossiers autorisés
    if (ALLOWED_FOLDERS.some(folder => relativePath.includes(folder))) {
      continue
    }

    // Vérifier si le chemin contient des mots suspects
    const suspiciousWords = ['test', 'debug', 'dev', 'demo', 'playground', 'sandbox']
    if (suspiciousWords.some(word => relativePath.toLowerCase().includes(word))) {
      suspiciousRoutes.push(file)
    }
  }

  if (suspiciousRoutes.length > 0) {
    console.log(`⚠️  Found ${suspiciousRoutes.length} suspicious route(s):\n`)
    suspiciousRoutes.forEach(route => {
      console.log(`  📄 ${route}`)
    })
    console.log('\n⚠️  These routes might be test pages accessible in production.')
    console.log('   Consider moving them to _archive/ or adding proper authentication.\n')
  }
}

async function main() {
  try {
    await checkTestFiles()
    await checkRoutes()
  } catch (error) {
    console.error('❌ Error during test files check:', error)
    process.exit(1)
  }
}

main()
