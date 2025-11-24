import { readFileSync, writeFileSync } from 'fs'
import { translate } from '@vitalets/google-translate-api'

// TRADUIRE SEULEMENT 3 SECTIONS PAR EXÉCUTION pour éviter rate limit
const SECTIONS_PER_RUN = 3

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

async function translateProgressive() {
  console.log(`🔄 Traduction PROGRESSIVE (${SECTIONS_PER_RUN} sections par run)...\n`)

  const fr = JSON.parse(readFileSync('src/messages/fr.json', 'utf-8'))

  for (const [lang, code] of Object.entries(langMap)) {
    console.log(`\n📝 ${lang.toUpperCase()}...`)

    const jsonPath = `src/messages/${lang}.json`
    const json = JSON.parse(readFileSync(jsonPath, 'utf-8'))

    if (!json.legal) json.legal = {}
    if (!json.legal.terms) json.legal.terms = {}

    let translated = 0

    for (let i = 1; i <= 16 && translated < SECTIONS_PER_RUN; i++) {
      const sectionKey = `section${i}`
      const sectionFr = fr.legal.terms[sectionKey]

      if (!sectionFr) continue

      const existingTitle = json.legal.terms[sectionKey]?.title
      const existingContent = json.legal.terms[sectionKey]?.content

      // Skip si déjà traduit (différent du français)
      if (existingContent && existingContent !== sectionFr.content) {
        console.log(`      ⏭️  Section ${i} déjà OK`)
        continue
      }

      const translatedContent = await translateText(sectionFr.content, code, i)

      json.legal.terms[sectionKey] = {
        title: existingTitle || sectionFr.title,
        content: translatedContent
      }

      translated++

      // Délai 15 secondes entre sections
      if (translated < SECTIONS_PER_RUN) {
        await new Promise(resolve => setTimeout(resolve, 15000))
      }
    }

    writeFileSync(jsonPath, JSON.stringify(json, null, 2) + '\n', 'utf-8')
    console.log(`   ✅ ${lang}.json - ${translated} sections traduites`)

    // Pause entre langues
    if (Object.keys(langMap).indexOf(lang) < Object.keys(langMap).length - 1) {
      console.log('   ⏸️  Pause 30 sec...')
      await new Promise(resolve => setTimeout(resolve, 30000))
    }
  }

  console.log('\n\n✅ Session terminée - Relancez ce script pour continuer !')
}

translateProgressive().catch(console.error)
