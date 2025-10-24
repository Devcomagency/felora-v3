/**
 * Script pour identifier et corriger les clés React dupliquées
 * Analyse les fichiers et suggère des corrections
 */

const fs = require('fs')
const path = require('path')

// Fonction pour analyser un fichier
function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const lines = content.split('\n')
    const issues = []

    lines.forEach((line, index) => {
      // Chercher les patterns de clés potentiellement problématiques
      const keyPatterns = [
        /key=\{([^}]+)\.id\}/g,
        /key=\{([^}]+)\.id\s*\+/g,
        /key=\{([^}]+)\.id\s*\}/g
      ]

      keyPatterns.forEach(pattern => {
        let match
        while ((match = pattern.exec(line)) !== null) {
          const fullMatch = match[0]
          const variable = match[1]
          
          // Vérifier si c'est dans un map sans index
          const beforeLine = lines.slice(Math.max(0, index - 5), index).join('\n')
          const hasMap = beforeLine.includes('.map(') && !beforeLine.includes('.map((')
          
          if (hasMap && !line.includes('index')) {
            issues.push({
              file: filePath,
              line: index + 1,
              content: line.trim(),
              issue: `Clé potentiellement dupliquée: ${fullMatch}`,
              suggestion: `Utiliser une clé composite avec index: key={\`\${${variable}.id}-\${index}\`}`
            })
          }
        }
      })
    })

    return issues
  } catch (error) {
    console.error(`Erreur lors de l'analyse de ${filePath}:`, error.message)
    return []
  }
}

// Fonction pour analyser récursivement un dossier
function analyzeDirectory(dirPath, extensions = ['.tsx', '.ts', '.jsx', '.js']) {
  const issues = []
  
  function scanDir(currentPath) {
    const items = fs.readdirSync(currentPath)
    
    items.forEach(item => {
      const fullPath = path.join(currentPath, item)
      const stat = fs.statSync(fullPath)
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scanDir(fullPath)
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        const fileIssues = analyzeFile(fullPath)
        issues.push(...fileIssues)
      }
    })
  }
  
  scanDir(dirPath)
  return issues
}

// Analyser le projet
console.log('🔍 Analyse des clés React dupliquées...\n')

const srcPath = path.join(__dirname, '..', 'src')
const issues = analyzeDirectory(srcPath)

if (issues.length === 0) {
  console.log('✅ Aucun problème de clés dupliquées détecté !')
} else {
  console.log(`⚠️  ${issues.length} problèmes potentiels détectés :\n`)
  
  // Grouper par fichier
  const issuesByFile = {}
  issues.forEach(issue => {
    if (!issuesByFile[issue.file]) {
      issuesByFile[issue.file] = []
    }
    issuesByFile[issue.file].push(issue)
  })
  
  // Afficher les résultats
  Object.keys(issuesByFile).forEach(filePath => {
    const relativePath = path.relative(process.cwd(), filePath)
    console.log(`📁 ${relativePath}:`)
    
    issuesByFile[filePath].forEach(issue => {
      console.log(`   Ligne ${issue.line}: ${issue.issue}`)
      console.log(`   Code: ${issue.content}`)
      console.log(`   💡 Suggestion: ${issue.suggestion}`)
      console.log('')
    })
  })
  
  // Générer un rapport
  const reportPath = path.join(__dirname, 'duplicate-keys-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(issues, null, 2))
  console.log(`📊 Rapport détaillé sauvegardé: ${reportPath}`)
}

console.log('🎉 Analyse terminée !')
