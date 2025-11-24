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
  en: 'en',
  de: 'de',
  es: 'es',
  it: 'it',
  pt: 'pt',
  ru: 'ru',
  ar: 'ar',
  sq: 'sq'
}

async function translatePrivacyUltraSlow() {
  console.log('🐌 Traduction PRIVACY ultra lente (10 sec délai)...\n')

  const fr = JSON.parse(readFileSync('src/messages/fr.json', 'utf-8'))

  for (const [lang, code] of Object.entries(langMap)) {
    console.log(`\n📝 ${lang.toUpperCase()}...`)

    const jsonPath = `src/messages/${lang}.json`
    const json = JSON.parse(readFileSync(jsonPath, 'utf-8'))

    if (!json.legal) json.legal = {}
    if (!json.legal.privacy) json.legal.privacy = {}

    for (let i = 1; i <= 17; i++) {
      const sectionKey = `section${i}`
      const sectionFr = fr.legal.privacy[sectionKey]

      if (!sectionFr) continue

      const existingTitle = json.legal.privacy[sectionKey]?.title
      const existingContent = json.legal.privacy[sectionKey]?.content

      // Skip si déjà traduit
      if (existingContent && existingContent !== sectionFr.content) {
        console.log(`      ⏭️  Section ${i} déjà OK`)
        continue
      }

      const translatedContent = await translateText(sectionFr.content, code, i)

      json.legal.privacy[sectionKey] = {
        title: existingTitle || sectionFr.title,
        content: translatedContent
      }

      await new Promise(resolve => setTimeout(resolve, 10000))
    }

    writeFileSync(jsonPath, JSON.stringify(json, null, 2) + '\n', 'utf-8')
    console.log(`   ✅ ${lang}.json sauvegardé`)

    if (Object.keys(langMap).indexOf(lang) < Object.keys(langMap).length - 1) {
      console.log('   ⏸️  Pause 20 sec...')
      await new Promise(resolve => setTimeout(resolve, 20000))
    }
  }

  console.log('\n\n🎉 Traduction Privacy terminée !')
}

translatePrivacyUltraSlow().catch(console.error)
