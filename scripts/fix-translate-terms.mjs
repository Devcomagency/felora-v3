import { readFileSync, writeFileSync } from 'fs'
import https from 'https'

// Fonction pour traduire avec LibreTranslate - AVEC LOGS
async function translateText(text, targetLang, sectionNum) {
  return new Promise((resolve, reject) => {
    // Limiter la taille pour éviter les timeouts
    const textToTranslate = text.substring(0, 5000) // Max 5000 caractères par chunk

    const data = JSON.stringify({
      q: textToTranslate,
      source: 'fr',
      target: targetLang,
      format: 'html'
    })

    const options = {
      hostname: 'libretranslate.de',
      port: 443,
      path: '/translate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }

    const req = https.request(options, (res) => {
      let body = ''
      res.on('data', (chunk) => { body += chunk })
      res.on('end', () => {
        try {
          const json = JSON.parse(body)
          if (json.translatedText) {
            console.log(`      ✅ Section ${sectionNum} traduite (${json.translatedText.length} caractères)`)
            resolve(json.translatedText)
          } else {
            console.log(`      ⚠️  Section ${sectionNum} - Pas de traduction, réponse:`, body)
            resolve(text) // Fallback
          }
        } catch (e) {
          console.log(`      ❌ Section ${sectionNum} - Erreur parse:`, e.message)
          resolve(text) // Fallback
        }
      })
    })

    req.on('error', (e) => {
      console.log(`      ❌ Section ${sectionNum} - Erreur requête:`, e.message)
      resolve(text) // Fallback
    })

    req.setTimeout(60000, () => {
      console.log(`      ⏱️  Section ${sectionNum} - Timeout`)
      req.destroy()
      resolve(text) // Fallback
    })

    req.write(data)
    req.end()
  })
}

// Mapping des codes de langue
const langMap = {
  en: 'en',
  de: 'de',
  es: 'es',
  it: 'it',
  pt: 'pt',
  ru: 'ru',
  ar: 'ar',
  sq: 'sq'
}

async function fixTranslateTerms() {
  console.log('🔧 FIX - Re-traduction des Terms avec logs détaillés...\n')

  // Charger le français
  const fr = JSON.parse(readFileSync('src/messages/fr.json', 'utf-8'))

  // Ne traduire que EN pour tester
  const testLangs = ['en']

  for (const [lang, code] of Object.entries(langMap)) {
    if (!testLangs.includes(lang)) continue

    console.log(`\n📝 RE-TRADUCTION vers ${lang.toUpperCase()}...`)

    const jsonPath = `src/messages/${lang}.json`
    const json = JSON.parse(readFileSync(jsonPath, 'utf-8'))

    // S'assurer que la structure existe
    if (!json.legal) json.legal = {}
    if (!json.legal.terms) json.legal.terms = {}

    // Traduire UNE SEULE section pour tester
    for (let i = 2; i <= 2; i++) { // Juste section 2 pour test
      const sectionKey = `section${i}`
      const sectionFr = fr.legal.terms[sectionKey]

      console.log(`   Section ${i} - Contenu FR: ${sectionFr.content.substring(0, 100)}...`)
      console.log(`   Section ${i} - Longueur: ${sectionFr.content.length} caractères`)

      const translatedContent = await translateText(sectionFr.content, code, i)

      json.legal.terms[sectionKey] = {
        title: json.legal.terms[sectionKey]?.title || sectionFr.title,
        content: translatedContent
      }

      console.log(`   Section ${i} - Contenu traduit: ${translatedContent.substring(0, 100)}...`)
      console.log(`   Section ${i} - Même texte? ${translatedContent === sectionFr.content ? '❌ OUI (PROBLÈME)' : '✅ NON (OK)'}`)

      // Attendre 3 secondes entre requêtes
      await new Promise(resolve => setTimeout(resolve, 3000))
    }

    // Sauvegarder
    writeFileSync(jsonPath, JSON.stringify(json, null, 2) + '\n', 'utf-8')
    console.log(`   ✅ ${lang}.json TEST mis à jour`)
  }

  console.log('\n\n✅ Test de traduction terminé - Vérifiez les logs ci-dessus')
}

fixTranslateTerms().catch(console.error)
