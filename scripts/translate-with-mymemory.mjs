import { readFileSync, writeFileSync } from 'fs'
import https from 'https'

// Fonction pour traduire avec MyMemory API (gratuit, 5000 chars/call)
async function translateText(text, targetLang, sectionNum) {
  return new Promise((resolve) => {
    // MyMemory a une limite de ~500 mots, on découpe si nécessaire
    if (text.length > 4000) {
      console.log(`      ⚠️  Section ${sectionNum} trop longue (${text.length} chars), traduction en chunks`)
      // Pour l'instant on retourne le texte original pour les trop longs
      // TODO: découper en chunks
      resolve(text)
      return
    }

    const encoded = encodeURIComponent(text)
    const path = `/get?q=${encoded}&langpair=fr|${targetLang}`

    const options = {
      hostname: 'api.mymemory.translated.net',
      port: 443,
      path: path,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    }

    const req = https.request(options, (res) => {
      let body = ''
      res.on('data', (chunk) => { body += chunk })
      res.on('end', () => {
        try {
          const json = JSON.parse(body)
          if (json.responseData && json.responseData.translatedText) {
            const translated = json.responseData.translatedText
            console.log(`      ✅ Section ${sectionNum} - Traduite (${translated.length} chars)`)
            resolve(translated)
          } else {
            console.log(`      ⚠️  Section ${sectionNum} - Pas de traduction:`, json)
            resolve(text)
          }
        } catch (e) {
          console.log(`      ❌ Section ${sectionNum} - Erreur:`, e.message)
          resolve(text)
        }
      })
    })

    req.on('error', (e) => {
      console.log(`      ❌ Section ${sectionNum} - Erreur:`, e.message)
      resolve(text)
    })

    req.setTimeout(30000, () => {
      console.log(`      ⏱️  Section ${sectionNum} - Timeout`)
      req.destroy()
      resolve(text)
    })

    req.end()
  })
}

async function translateTermsSection() {
  console.log('🔧 Test MyMemory API...\n')

  const fr = JSON.parse(readFileSync('src/messages/fr.json', 'utf-8'))
  const en = JSON.parse(readFileSync('src/messages/en.json', 'utf-8'))

  // Tester avec section 1 (plus courte)
  const section1 = fr.legal.terms.section1
  console.log(`📝 Test traduction section 1...`)
  console.log(`   FR (${section1.content.length} chars): ${section1.content.substring(0, 100)}...`)

  const translated = await translateText(section1.content, 'en', 1)

  console.log(`   EN (${translated.length} chars): ${translated.substring(0, 100)}...`)
  console.log(`   Identique? ${translated === section1.content ? '❌ OUI' : '✅ NON'}`)

  // Si ça marche, mettre à jour
  if (translated !== section1.content) {
    en.legal.terms.section1.content = translated
    writeFileSync('src/messages/en.json', JSON.stringify(en, null, 2) + '\n', 'utf-8')
    console.log('\n✅ Section 1 traduite et sauvegardée')
  } else {
    console.log('\n❌ MyMemory API ne fonctionne pas non plus')
  }
}

translateTermsSection().catch(console.error)
