import { readFileSync, writeFileSync } from 'fs'
import { translate } from '@vitalets/google-translate-api'

async function translateText(text, targetLang, sectionNum) {
  try {
    console.log(`      🔄 Section ${sectionNum}...`)
    const result = await translate(text, { from: 'fr', to: targetLang })
    console.log(`      ✅ Section ${sectionNum} OK`)
    return result.text
  } catch (error) {
    console.log(`      ❌ Section ${sectionNum}: ${error.message}`)
    return text
  }
}

const langMap = {
  it: 'it',
  pt: 'pt',
  ru: 'ru',
  ar: 'ar',
  sq: 'sq'
}

async function translateTermsUltraSlow() {
  console.log('🐌 Traduction ULTRA LENTE (10 sec délai) - Toutes les 3 langues...\n')

  const fr = JSON.parse(readFileSync('src/messages/fr.json', 'utf-8'))

  for (const [lang, code] of Object.entries(langMap)) {
    console.log(`\n📝 ${lang.toUpperCase()}...`)

    const jsonPath = `src/messages/${lang}.json`
    const json = JSON.parse(readFileSync(jsonPath, 'utf-8'))

    if (!json.legal) json.legal = {}
    if (!json.legal.terms) json.legal.terms = {}

    for (let i = 1; i <= 16; i++) {
      const sectionKey = `section${i}`
      const sectionFr = fr.legal.terms[sectionKey]

      if (!sectionFr) continue

      const existingTitle = json.legal.terms[sectionKey]?.title
      const existingContent = json.legal.terms[sectionKey]?.content

      // Skip si déjà traduit
      if (existingContent && existingContent !== sectionFr.content) {
        console.log(`      ⏭️  Section ${i} déjà OK`)
        continue
      }

      const translatedContent = await translateText(sectionFr.content, code, i)

      json.legal.terms[sectionKey] = {
        title: existingTitle || sectionFr.title,
        content: translatedContent
      }

      // 🐌 DÉLAI DE 10 SECONDES
      await new Promise(resolve => setTimeout(resolve, 10000))
    }

    writeFileSync(jsonPath, JSON.stringify(json, null, 2) + '\n', 'utf-8')
    console.log(`   ✅ ${lang}.json sauvegardé`)

    // Pause 20 secondes entre langues
    if (Object.keys(langMap).indexOf(lang) < Object.keys(langMap).length - 1) {
      console.log('   ⏸️  Pause 20 sec...')
      await new Promise(resolve => setTimeout(resolve, 20000))
    }
  }

  console.log('\n\n🎉 Traduction Terms ALL langues terminée !')
}

translateTermsUltraSlow().catch(console.error)
