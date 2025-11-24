import { readFileSync, writeFileSync } from 'fs'
import { translate } from '@vitalets/google-translate-api'

// Fonction pour traduire avec Google Translate (gratuit via @vitalets)
async function translateText(text, targetLang, sectionNum) {
  try {
    console.log(`      🔄 Traduction section ${sectionNum}... (${text.length} chars)`)

    const result = await translate(text, { from: 'fr', to: targetLang })

    console.log(`      ✅ Section ${sectionNum} traduite`)
    return result.text
  } catch (error) {
    console.log(`      ❌ Erreur section ${sectionNum}:`, error.message)
    return text // Fallback
  }
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

async function translateTermsGoogle() {
  console.log('🚀 Traduction des Terms avec Google Translate...\n')

  // Charger le français
  const fr = JSON.parse(readFileSync('src/messages/fr.json', 'utf-8'))

  for (const [lang, code] of Object.entries(langMap)) {
    console.log(`\n📝 Traduction vers ${lang.toUpperCase()}...`)

    const jsonPath = `src/messages/${lang}.json`
    const json = JSON.parse(readFileSync(jsonPath, 'utf-8'))

    // S'assurer que la structure existe
    if (!json.legal) json.legal = {}
    if (!json.legal.terms) json.legal.terms = {}

    // Traduire les 16 sections
    for (let i = 1; i <= 16; i++) {
      const sectionKey = `section${i}`
      const sectionFr = fr.legal.terms[sectionKey]

      if (!sectionFr) {
        console.log(`   ⚠️  Section ${i} manquante dans fr.json`)
        continue
      }

      // Garder le titre déjà traduit ou traduire le titre
      const existingTitle = json.legal.terms[sectionKey]?.title

      // Traduire le contenu
      const translatedContent = await translateText(sectionFr.content, code, i)

      json.legal.terms[sectionKey] = {
        title: existingTitle || sectionFr.title, // Garder les titres manuels
        content: translatedContent
      }

      // Attendre 1 seconde entre requêtes pour éviter le rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // Sauvegarder
    writeFileSync(jsonPath, JSON.stringify(json, null, 2) + '\n', 'utf-8')
    console.log(`   ✅ ${lang}.json mis à jour`)
  }

  console.log('\n\n✅ Toutes les traductions Terms sont terminées !')
}

translateTermsGoogle().catch(console.error)
