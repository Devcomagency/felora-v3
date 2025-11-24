import { readFileSync, writeFileSync } from 'fs'
import { translate } from '@vitalets/google-translate-api'

// Fonction pour traduire avec Google Translate
async function translateText(text, targetLang, sectionNum) {
  try {
    console.log(`      🔄 Traduction section ${sectionNum}... (${text.length} chars)`)
    const result = await translate(text, { from: 'fr', to: targetLang })
    console.log(`      ✅ Section ${sectionNum} traduite`)
    return result.text
  } catch (error) {
    console.log(`      ❌ Erreur section ${sectionNum}:`, error.message)
    return text
  }
}

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

async function translateCookiesGoogle() {
  console.log('🚀 Traduction Cookies avec Google Translate...\n')

  const fr = JSON.parse(readFileSync('src/messages/fr.json', 'utf-8'))

  for (const [lang, code] of Object.entries(langMap)) {
    console.log(`\n📝 Traduction vers ${lang.toUpperCase()}...`)

    const jsonPath = `src/messages/${lang}.json`
    const json = JSON.parse(readFileSync(jsonPath, 'utf-8'))

    if (!json.legal) json.legal = {}
    if (!json.legal.cookies) json.legal.cookies = {}

    // Traduire les 11 sections
    for (let i = 1; i <= 11; i++) {
      const sectionKey = `section${i}`
      const sectionFr = fr.legal.cookies[sectionKey]

      if (!sectionFr) {
        console.log(`   ⚠️  Section ${i} manquante`)
        continue
      }

      const existingTitle = json.legal.cookies[sectionKey]?.title
      const translatedContent = await translateText(sectionFr.content, code, i)

      json.legal.cookies[sectionKey] = {
        title: existingTitle || sectionFr.title,
        content: translatedContent
      }

      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    writeFileSync(jsonPath, JSON.stringify(json, null, 2) + '\n', 'utf-8')
    console.log(`   ✅ ${lang}.json mis à jour`)
  }

  console.log('\n\n✅ Toutes les traductions Cookies terminées !')
}

translateCookiesGoogle().catch(console.error)
