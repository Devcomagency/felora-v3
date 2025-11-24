import { readFileSync, writeFileSync } from 'fs'
import { translate } from '@vitalets/google-translate-api'

async function translateText(text, targetLang, sectionNum) {
  try {
    console.log(`      🔄 Section ${sectionNum}... (${text.length} chars)`)
    const result = await translate(text, { from: 'fr', to: targetLang })
    console.log(`      ✅ Section ${sectionNum} OK`)
    return result.text
  } catch (error) {
    console.log(`      ❌ Section ${sectionNum}: ${error.message}`)
    return text
  }
}

const langMap = {
  es: 'es', // Finir ES d'abord (sections 13-16)
  it: 'it',
  pt: 'pt',
  ru: 'ru',
  ar: 'ar',
  sq: 'sq'
}

async function translateTermsSlow() {
  console.log('🐢 Traduction LENTE (5 sec délai) pour éviter rate limit...\n')

  const fr = JSON.parse(readFileSync('src/messages/fr.json', 'utf-8'))

  for (const [lang, code] of Object.entries(langMap)) {
    console.log(`\n📝 ${lang.toUpperCase()}...`)

    const jsonPath = `src/messages/${lang}.json`
    const json = JSON.parse(readFileSync(jsonPath, 'utf-8'))

    if (!json.legal) json.legal = {}
    if (!json.legal.terms) json.legal.terms = {}

    // Déterminer quelles sections traduire
    let startSection = 1
    if (lang === 'es') {
      startSection = 13 // Finir ES sections 13-16
      console.log('   (Reprise depuis section 13)')
    }

    for (let i = startSection; i <= 16; i++) {
      const sectionKey = `section${i}`
      const sectionFr = fr.legal.terms[sectionKey]

      if (!sectionFr) {
        console.log(`   ⚠️  Section ${i} manquante`)
        continue
      }

      const existingTitle = json.legal.terms[sectionKey]?.title
      const existingContent = json.legal.terms[sectionKey]?.content

      // Vérifier si déjà traduit (pas identique au français)
      if (existingContent && existingContent !== sectionFr.content) {
        console.log(`      ⏭️  Section ${i} déjà traduite`)
        continue
      }

      const translatedContent = await translateText(sectionFr.content, code, i)

      json.legal.terms[sectionKey] = {
        title: existingTitle || sectionFr.title,
        content: translatedContent
      }

      // 🐢 DÉLAI DE 5 SECONDES pour éviter rate limit
      await new Promise(resolve => setTimeout(resolve, 5000))
    }

    writeFileSync(jsonPath, JSON.stringify(json, null, 2) + '\n', 'utf-8')
    console.log(`   ✅ ${lang}.json sauvegardé`)

    // Pause de 10 secondes entre langues
    if (Object.keys(langMap).indexOf(lang) < Object.keys(langMap).length - 1) {
      console.log('   ⏸️  Pause 10 sec avant langue suivante...')
      await new Promise(resolve => setTimeout(resolve, 10000))
    }
  }

  console.log('\n\n✅ Traduction Terms terminée !')
}

translateTermsSlow().catch(console.error)
