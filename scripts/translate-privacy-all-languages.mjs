import { readFileSync, writeFileSync } from 'fs'
import https from 'https'

async function translateText(text, targetLang) {
  return new Promise((resolve, reject) => {
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
    title: "Data Protection Statement — FELORA",
    version: "Version: November 2025",
    backHome: "← Back to home",
    termsLink: "Terms and Conditions",
    cookiesLink: "Cookie Policy"
  },
  de: {
    title: "Datenschutzerklärung — FELORA",
    version: "Version: November 2025",
    backHome: "← Zurück zur Startseite",
    termsLink: "Allgemeine Geschäftsbedingungen",
    cookiesLink: "Cookie-Richtlinie"
  },
  es: {
    title: "Declaración de Protección de Datos — FELORA",
    version: "Versión: noviembre de 2025",
    backHome: "← Volver al inicio",
    termsLink: "Condiciones Generales",
    cookiesLink: "Política de Cookies"
  },
  it: {
    title: "Dichiarazione sulla Protezione dei Dati — FELORA",
    version: "Versione: novembre 2025",
    backHome: "← Torna alla home",
    termsLink: "Termini e Condizioni",
    cookiesLink: "Politica sui Cookie"
  },
  pt: {
    title: "Declaração de Proteção de Dados — FELORA",
    version: "Versão: novembro de 2025",
    backHome: "← Voltar ao início",
    termsLink: "Termos e Condições",
    cookiesLink: "Política de Cookies"
  },
  ru: {
    title: "Заявление о защите данных — FELORA",
    version: "Версия: ноябрь 2025",
    backHome: "← Назад на главную",
    termsLink: "Условия использования",
    cookiesLink: "Политика использования файлов cookie"
  },
  ar: {
    title: "بيان حماية البيانات — FELORA",
    version: "الإصدار: نوفمبر 2025",
    backHome: "← العودة إلى الصفحة الرئيسية",
    termsLink: "الشروط والأحكام",
    cookiesLink: "سياسة ملفات تعريف الارتباط"
  },
  sq: {
    title: "Deklarata e Mbrojtjes së të Dhënave — FELORA",
    version: "Versioni: nëntor 2025",
    backHome: "← Kthehu në fillim",
    termsLink: "Termat dhe Kushtet",
    cookiesLink: "Politika e Cookies"
  }
}

const sectionTitles = {
  en: [
    "1. Data controller identity",
    "2. Purpose and scope of the statement",
    "3. Personal data collected",
    "4. Purposes of data processing",
    "5. Legal bases for processing",
    "6. Data retention period",
    "7. Data sharing with third parties",
    "8. International data transfers",
    "9. Data security",
    "10. Your data protection rights",
    "11. Right to appeal to supervisory authority",
    "12. Minors",
    "13. Cookies and tracking technologies",
    "14. Anonymized and pseudonymized data",
    "15. Changes to the Data Protection Statement",
    "16. Contact for data protection questions",
    "17. Acceptance of the Statement"
  ],
  de: [
    "1. Identität des Verantwortlichen",
    "2. Zweck und Umfang der Erklärung",
    "3. Erhobene personenbezogene Daten",
    "4. Zwecke der Datenverarbeitung",
    "5. Rechtsgrundlagen für die Verarbeitung",
    "6. Aufbewahrungsdauer von Daten",
    "7. Weitergabe von Daten an Dritte",
    "8. Internationale Datenübermittlungen",
    "9. Datensicherheit",
    "10. Ihre Datenschutzrechte",
    "11. Beschwerderecht bei der Aufsichtsbehörde",
    "12. Minderjährige",
    "13. Cookies und Tracking-Technologien",
    "14. Anonymisierte und pseudonymisierte Daten",
    "15. Änderungen der Datenschutzerklärung",
    "16. Kontakt für Datenschutzfragen",
    "17. Annahme der Erklärung"
  ],
  es: [
    "1. Identidad del responsable del tratamiento",
    "2. Objeto y alcance de la declaración",
    "3. Datos personales recopilados",
    "4. Finalidades del tratamiento de datos",
    "5. Bases jurídicas del tratamiento",
    "6. Período de conservación de datos",
    "7. Compartir datos con terceros",
    "8. Transferencias internacionales de datos",
    "9. Seguridad de los datos",
    "10. Sus derechos de protección de datos",
    "11. Derecho de recurso ante la autoridad de supervisión",
    "12. Menores",
    "13. Cookies y tecnologías de seguimiento",
    "14. Datos anonimizados y seudonimizados",
    "15. Modificaciones de la Declaración de Protección de Datos",
    "16. Contacto para preguntas sobre protección de datos",
    "17. Aceptación de la Declaración"
  ],
  it: [
    "1. Identità del titolare del trattamento",
    "2. Scopo e portata della dichiarazione",
    "3. Dati personali raccolti",
    "4. Finalità del trattamento dei dati",
    "5. Basi giuridiche del trattamento",
    "6. Periodo di conservazione dei dati",
    "7. Condivisione dei dati con terzi",
    "8. Trasferimenti internazionali di dati",
    "9. Sicurezza dei dati",
    "10. I vostri diritti in materia di protezione dei dati",
    "11. Diritto di ricorso all'autorità di vigilanza",
    "12. Minori",
    "13. Cookie e tecnologie di tracciamento",
    "14. Dati anonimizzati e pseudonimizzati",
    "15. Modifiche alla Dichiarazione sulla Protezione dei Dati",
    "16. Contatto per domande sulla protezione dei dati",
    "17. Accettazione della Dichiarazione"
  ],
  pt: [
    "1. Identidade do responsável pelo tratamento",
    "2. Objeto e âmbito da declaração",
    "3. Dados pessoais coletados",
    "4. Finalidades do tratamento de dados",
    "5. Bases jurídicas do tratamento",
    "6. Período de conservação de dados",
    "7. Compartilhamento de dados com terceiros",
    "8. Transferências internacionais de dados",
    "9. Segurança dos dados",
    "10. Seus direitos de proteção de dados",
    "11. Direito de recurso à autoridade de supervisão",
    "12. Menores",
    "13. Cookies e tecnologias de rastreamento",
    "14. Dados anonimizados e pseudonimizados",
    "15. Modificações da Declaração de Proteção de Dados",
    "16. Contato para questões sobre proteção de dados",
    "17. Aceitação da Declaração"
  ],
  ru: [
    "1. Идентификация контролера данных",
    "2. Цель и область применения заявления",
    "3. Собираемые персональные данные",
    "4. Цели обработки данных",
    "5. Правовые основания обработки",
    "6. Срок хранения данных",
    "7. Передача данных третьим лицам",
    "8. Международные передачи данных",
    "9. Безопасность данных",
    "10. Ваши права на защиту данных",
    "11. Право на обращение в надзорный орган",
    "12. Несовершеннолетние",
    "13. Файлы cookie и технологии отслеживания",
    "14. Анонимизированные и псевдонимизированные данные",
    "15. Изменения в Заявлении о защите данных",
    "16. Контакт по вопросам защиты данных",
    "17. Принятие Заявления"
  ],
  ar: [
    "1. هوية مراقب البيانات",
    "2. الغرض ونطاق البيان",
    "3. البيانات الشخصية المجمعة",
    "4. أغراض معالجة البيانات",
    "5. الأسس القانونية للمعالجة",
    "6. فترة الاحتفاظ بالبيانات",
    "7. مشاركة البيانات مع أطراف ثالثة",
    "8. نقل البيانات الدولية",
    "9. أمن البيانات",
    "10. حقوقك في حماية البيانات",
    "11. الحق في الاستئناف أمام السلطة الإشرافية",
    "12. القُصّر",
    "13. ملفات تعريف الارتباط وتقنيات التتبع",
    "14. البيانات المجهولة والمستعارة",
    "15. التغييرات في بيان حماية البيانات",
    "16. الاتصال لأسئلة حماية البيانات",
    "17. قبول البيان"
  ],
  sq: [
    "1. Identiteti i kontrollorit të të dhënave",
    "2. Qëllimi dhe fusha e deklaratës",
    "3. Të dhënat personale të mbledhura",
    "4. Qëllimet e përpunimit të të dhënave",
    "5. Bazat ligjore të përpunimit",
    "6. Periudha e ruajtjes së të dhënave",
    "7. Ndarja e të dhënave me palë të treta",
    "8. Transferimet ndërkombëtare të të dhënave",
    "9. Siguria e të dhënave",
    "10. Të drejtat tuaja për mbrojtjen e të dhënave",
    "11. E drejta e ankesës te autoriteti mbikëqyrës",
    "12. Të mitur",
    "13. Cookies dhe teknologjitë e gjurmimit",
    "14. Të dhëna të anonimizuara dhe pseudonimizuara",
    "15. Ndryshimet në Deklaratën e Mbrojtjes së të Dhënave",
    "16. Kontakti për pyetje mbi mbrojtjen e të dhënave",
    "17. Pranimin e Deklaratës"
  ]
}

async function main() {
  console.log('🚀 Traduction de Privacy dans les 8 langues...\n')

  const fr = JSON.parse(readFileSync('src/messages/fr.json', 'utf-8'))

  for (const [lang, code] of Object.entries(langMap)) {
    console.log(`\n📝 Traduction vers ${lang.toUpperCase()}...`)

    const jsonPath = `src/messages/${lang}.json`
    const json = JSON.parse(readFileSync(jsonPath, 'utf-8'))

    if (!json.legal) json.legal = {}
    json.legal.privacy = {
      ...manualTranslations[lang]
    }

    // Traduire les 17 sections
    for (let i = 1; i <= 17; i++) {
      const sectionKey = `section${i}`
      const sectionFr = fr.legal.privacy[sectionKey]

      console.log(`   Section ${i}...`)

      json.legal.privacy[sectionKey] = {
        title: sectionTitles[lang][i-1],
        content: await translateText(sectionFr.content, code)
      }

      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    writeFileSync(jsonPath, JSON.stringify(json, null, 2) + '\n', 'utf-8')
    console.log(`   ✅ ${lang}.json mis à jour`)
  }

  console.log('\n\n✅ Toutes les traductions Privacy sont terminées !')
}

main().catch(console.error)
