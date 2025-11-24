import { readFileSync, writeFileSync } from 'fs'
import https from 'https'

async function translateText(text, targetLang) {
  return new Promise((resolve) => {
    const data = JSON.stringify({
      q: text,
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
          resolve(json.translatedText || text)
        } catch (e) {
          resolve(text)
        }
      })
    })

    req.on('error', () => resolve(text))
    req.setTimeout(30000, () => { req.destroy(); resolve(text) })
    req.write(data)
    req.end()
  })
}

const langMap = {
  en: 'en', de: 'de', es: 'es', it: 'it',
  pt: 'pt', ru: 'ru', ar: 'ar', sq: 'sq'
}

const manualTranslations = {
  en: {
    title: "Cookie Policy — FELORA",
    version: "Version: November 2025",
    backHome: "← Back to home",
    termsLink: "Terms and Conditions",
    privacyLink: "Data Protection"
  },
  de: {
    title: "Cookie-Richtlinie — FELORA",
    version: "Version: November 2025",
    backHome: "← Zurück zur Startseite",
    termsLink: "Allgemeine Geschäftsbedingungen",
    privacyLink: "Datenschutz"
  },
  es: {
    title: "Política de Cookies — FELORA",
    version: "Versión: noviembre de 2025",
    backHome: "← Volver al inicio",
    termsLink: "Condiciones Generales",
    privacyLink: "Protección de Datos"
  },
  it: {
    title: "Politica sui Cookie — FELORA",
    version: "Versione: novembre 2025",
    backHome: "← Torna alla home",
    termsLink: "Termini e Condizioni",
    privacyLink: "Protezione dei Dati"
  },
  pt: {
    title: "Política de Cookies — FELORA",
    version: "Versão: novembro de 2025",
    backHome: "← Voltar ao início",
    termsLink: "Termos e Condições",
    privacyLink: "Proteção de Dados"
  },
  ru: {
    title: "Политика использования файлов cookie — FELORA",
    version: "Версия: ноябрь 2025",
    backHome: "← Назад на главную",
    termsLink: "Условия использования",
    privacyLink: "Защита данных"
  },
  ar: {
    title: "سياسة ملفات تعريف الارتباط — FELORA",
    version: "الإصدار: نوفمبر 2025",
    backHome: "← العودة إلى الصفحة الرئيسية",
    termsLink: "الشروط والأحكام",
    privacyLink: "حماية البيانات"
  },
  sq: {
    title: "Politika e Cookies — FELORA",
    version: "Versioni: nëntor 2025",
    backHome: "← Kthehu në fillim",
    termsLink: "Termat dhe Kushtet",
    privacyLink: "Mbrojtja e të Dhënave"
  }
}

const sectionTitles = {
  en: [
    "1. Introduction",
    "2. What is a cookie?",
    "3. Why do we use cookies?",
    "4. Categories of cookies used",
    "5. Detailed list of cookies used",
    "6. Managing your cookie preferences",
    "7. Third-party cookies",
    "8. Cookie retention period",
    "9. Cookie security",
    "10. Changes to the Cookie Policy",
    "11. Contact for questions about cookies"
  ],
  de: [
    "1. Einführung",
    "2. Was ist ein Cookie?",
    "3. Warum verwenden wir Cookies?",
    "4. Verwendete Cookie-Kategorien",
    "5. Detaillierte Liste der verwendeten Cookies",
    "6. Verwaltung Ihrer Cookie-Einstellungen",
    "7. Cookies von Drittanbietern",
    "8. Aufbewahrungsdauer von Cookies",
    "9. Cookie-Sicherheit",
    "10. Änderungen der Cookie-Richtlinie",
    "11. Kontakt für Fragen zu Cookies"
  ],
  es: [
    "1. Introducción",
    "2. ¿Qué es una cookie?",
    "3. ¿Por qué usamos cookies?",
    "4. Categorías de cookies utilizadas",
    "5. Lista detallada de cookies utilizadas",
    "6. Gestión de sus preferencias de cookies",
    "7. Cookies de terceros",
    "8. Período de conservación de cookies",
    "9. Seguridad de las cookies",
    "10. Modificaciones de la Política de Cookies",
    "11. Contacto para preguntas sobre cookies"
  ],
  it: [
    "1. Introduzione",
    "2. Cos'è un cookie?",
    "3. Perché usiamo i cookie?",
    "4. Categorie di cookie utilizzati",
    "5. Elenco dettagliato dei cookie utilizzati",
    "6. Gestione delle preferenze sui cookie",
    "7. Cookie di terze parti",
    "8. Periodo di conservazione dei cookie",
    "9. Sicurezza dei cookie",
    "10. Modifiche alla Politica sui Cookie",
    "11. Contatto per domande sui cookie"
  ],
  pt: [
    "1. Introdução",
    "2. O que é um cookie?",
    "3. Por que usamos cookies?",
    "4. Categorias de cookies utilizados",
    "5. Lista detalhada de cookies utilizados",
    "6. Gestão das suas preferências de cookies",
    "7. Cookies de terceiros",
    "8. Período de conservação de cookies",
    "9. Segurança dos cookies",
    "10. Modificações da Política de Cookies",
    "11. Contato para questões sobre cookies"
  ],
  ru: [
    "1. Введение",
    "2. Что такое файл cookie?",
    "3. Почему мы используем файлы cookie?",
    "4. Категории используемых файлов cookie",
    "5. Подробный список используемых файлов cookie",
    "6. Управление настройками файлов cookie",
    "7. Файлы cookie третьих лиц",
    "8. Срок хранения файлов cookie",
    "9. Безопасность файлов cookie",
    "10. Изменения в Политике использования файлов cookie",
    "11. Контакт по вопросам файлов cookie"
  ],
  ar: [
    "1. مقدمة",
    "2. ما هو ملف تعريف الارتباط؟",
    "3. لماذا نستخدم ملفات تعريف الارتباط؟",
    "4. فئات ملفات تعريف الارتباط المستخدمة",
    "5. قائمة مفصلة بملفات تعريف الارتباط المستخدمة",
    "6. إدارة تفضيلات ملفات تعريف الارتباط",
    "7. ملفات تعريف الارتباط من جهات خارجية",
    "8. فترة الاحتفاظ بملفات تعريف الارتباط",
    "9. أمان ملفات تعريف الارتباط",
    "10. التغييرات في سياسة ملفات تعريف الارتباط",
    "11. الاتصال للأسئلة حول ملفات تعريف الارتباط"
  ],
  sq: [
    "1. Hyrje",
    "2. Çfarë është një cookie?",
    "3. Pse përdorim cookies?",
    "4. Kategoritë e cookies të përdorura",
    "5. Lista e detajuar e cookies të përdorura",
    "6. Menaxhimi i preferencave tuaja të cookies",
    "7. Cookies nga palë të treta",
    "8. Periudha e ruajtjes së cookies",
    "9. Siguria e cookies",
    "10. Ndryshimet në Politikën e Cookies",
    "11. Kontakti për pyetje rreth cookies"
  ]
}

async function main() {
  console.log('🚀 Traduction de Cookies dans les 8 langues...\n')

  const fr = JSON.parse(readFileSync('src/messages/fr.json', 'utf-8'))

  for (const [lang, code] of Object.entries(langMap)) {
    console.log(`\n📝 Traduction vers ${lang.toUpperCase()}...`)

    const jsonPath = `src/messages/${lang}.json`
    const json = JSON.parse(readFileSync(jsonPath, 'utf-8'))

    if (!json.legal) json.legal = {}
    json.legal.cookies = {
      ...manualTranslations[lang]
    }

    // Traduire les 11 sections
    for (let i = 1; i <= 11; i++) {
      const sectionKey = `section${i}`
      const sectionFr = fr.legal.cookies[sectionKey]

      console.log(`   Section ${i}...`)

      json.legal.cookies[sectionKey] = {
        title: sectionTitles[lang][i-1],
        content: await translateText(sectionFr.content, code)
      }

      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    writeFileSync(jsonPath, JSON.stringify(json, null, 2) + '\n', 'utf-8')
    console.log(`   ✅ ${lang}.json mis à jour`)
  }

  console.log('\n\n✅ Toutes les traductions Cookies sont terminées !')
}

main().catch(console.error)
