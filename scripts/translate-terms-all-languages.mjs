import { readFileSync, writeFileSync } from 'fs'
import https from 'https'

// Fonction pour traduire avec LibreTranslate (gratuit)
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

// Traduire les titres simples (traductions manuelles de qualité)
const manualTranslations = {
  en: {
    title: "Terms and Conditions — FELORA",
    version: "Version: November 2025",
    backHome: "← Back to home",
    privacyLink: "Data Protection",
    cookiesLink: "Cookie Policy"
  },
  de: {
    title: "Allgemeine Geschäftsbedingungen — FELORA",
    version: "Version: November 2025",
    backHome: "← Zurück zur Startseite",
    privacyLink: "Datenschutz",
    cookiesLink: "Cookie-Richtlinie"
  },
  es: {
    title: "Condiciones Generales — FELORA",
    version: "Versión: noviembre de 2025",
    backHome: "← Volver al inicio",
    privacyLink: "Protección de Datos",
    cookiesLink: "Política de Cookies"
  },
  it: {
    title: "Termini e Condizioni — FELORA",
    version: "Versione: novembre 2025",
    backHome: "← Torna alla home",
    privacyLink: "Protezione dei Dati",
    cookiesLink: "Politica sui Cookie"
  },
  pt: {
    title: "Termos e Condições — FELORA",
    version: "Versão: novembro de 2025",
    backHome: "← Voltar ao início",
    privacyLink: "Proteção de Dados",
    cookiesLink: "Política de Cookies"
  },
  ru: {
    title: "Условия использования — FELORA",
    version: "Версия: ноябрь 2025",
    backHome: "← Назад на главную",
    privacyLink: "Защита данных",
    cookiesLink: "Политика использования файлов cookie"
  },
  ar: {
    title: "الشروط والأحكام — FELORA",
    version: "الإصدار: نوفمبر 2025",
    backHome: "← العودة إلى الصفحة الرئيسية",
    privacyLink: "حماية البيانات",
    cookiesLink: "سياسة ملفات تعريف الارتباط"
  },
  sq: {
    title: "Termat dhe Kushtet — FELORA",
    version: "Versioni: nëntor 2025",
    backHome: "← Kthehu në fillim",
    privacyLink: "Mbrojtja e të Dhënave",
    cookiesLink: "Politika e Cookies"
  }
}

// Traduire les titres de sections (manuellement pour meilleure qualité)
const sectionTitles = {
  en: [
    "1. Service provider identity and scope of application",
    "2. Acceptance of Terms and access reserved for adults",
    "3. Definitions",
    "4. Nature of service and Felora's role",
    "5. Account creation and verification",
    "6. Obligations of Users and Service Providers",
    "7. Virtual currency and virtual gifts",
    "8. Payments, subscriptions and refunds",
    "9. Intellectual property",
    "10. Moderation, reporting and fight against human trafficking",
    "11. Felora's liability",
    "12. Account security",
    "13. Duration, suspension and termination",
    "14. Data ownership and reference to privacy policy",
    "15. Modification of Terms",
    "16. Applicable law and jurisdiction"
  ],
  de: [
    "1. Identität des Dienstleisters und Anwendungsbereich",
    "2. Annahme der AGB und Zugang nur für Erwachsene",
    "3. Definitionen",
    "4. Art des Dienstes und Rolle von Felora",
    "5. Kontoerstellung und Verifizierung",
    "6. Pflichten der Nutzer und Dienstleister",
    "7. Virtuelle Währung und virtuelle Geschenke",
    "8. Zahlungen, Abonnements und Rückerstattungen",
    "9. Geistiges Eigentum",
    "10. Moderation, Meldung und Kampf gegen Menschenhandel",
    "11. Haftung von Felora",
    "12. Kontosicherheit",
    "13. Laufzeit, Aussetzung und Kündigung",
    "14. Dateneigentum und Verweis auf Datenschutzerklärung",
    "15. Änderung der AGB",
    "16. Anwendbares Recht und Gerichtsstand"
  ],
  es: [
    "1. Identidad del proveedor y ámbito de aplicación",
    "2. Aceptación de las CGU y acceso reservado a adultos",
    "3. Definiciones",
    "4. Naturaleza del servicio y papel de Felora",
    "5. Creación y verificación de cuenta",
    "6. Obligaciones de los Usuarios y Proveedores",
    "7. Moneda virtual y regalos virtuales",
    "8. Pagos, suscripciones y reembolsos",
    "9. Propiedad intelectual",
    "10. Moderación, denuncia y lucha contra la trata de personas",
    "11. Responsabilidad de Felora",
    "12. Seguridad de la cuenta",
    "13. Duración, suspensión y terminación",
    "14. Propiedad de los datos y referencia a la política de privacidad",
    "15. Modificación de las CGU",
    "16. Ley aplicable y jurisdicción"
  ],
  it: [
    "1. Identità del fornitore e campo di applicazione",
    "2. Accettazione dei Termini e accesso riservato agli adulti",
    "3. Definizioni",
    "4. Natura del servizio e ruolo di Felora",
    "5. Creazione e verifica dell'account",
    "6. Obblighi degli Utenti e dei Fornitori",
    "7. Moneta virtuale e regali virtuali",
    "8. Pagamenti, abbonamenti e rimborsi",
    "9. Proprietà intellettuale",
    "10. Moderazione, segnalazione e lotta contro la tratta di esseri umani",
    "11. Responsabilità di Felora",
    "12. Sicurezza dell'account",
    "13. Durata, sospensione e risoluzione",
    "14. Proprietà dei dati e riferimento alla politica sulla privacy",
    "15. Modifica dei Termini",
    "16. Legge applicabile e foro competente"
  ],
  pt: [
    "1. Identidade do prestador e âmbito de aplicação",
    "2. Aceitação dos Termos e acesso reservado a adultos",
    "3. Definições",
    "4. Natureza do serviço e papel da Felora",
    "5. Criação e verificação de conta",
    "6. Obrigações dos Usuários e Prestadores",
    "7. Moeda virtual e presentes virtuais",
    "8. Pagamentos, assinaturas e reembolsos",
    "9. Propriedade intelectual",
    "10. Moderação, denúncia e luta contra o tráfico de pessoas",
    "11. Responsabilidade da Felora",
    "12. Segurança da conta",
    "13. Duração, suspensão e rescisão",
    "14. Propriedade dos dados e referência à política de privacidade",
    "15. Modificação dos Termos",
    "16. Lei aplicável e jurisdição"
  ],
  ru: [
    "1. Идентификация поставщика услуг и область применения",
    "2. Принятие Условий и доступ только для совершеннолетних",
    "3. Определения",
    "4. Характер услуги и роль Felora",
    "5. Создание и проверка учетной записи",
    "6. Обязанности Пользователей и Поставщиков",
    "7. Виртуальная валюта и виртуальные подарки",
    "8. Платежи, подписки и возвраты",
    "9. Интеллектуальная собственность",
    "10. Модерация, жалобы и борьба с торговлей людьми",
    "11. Ответственность Felora",
    "12. Безопасность учетной записи",
    "13. Срок действия, приостановка и прекращение",
    "14. Право собственности на данные и ссылка на политику конфиденциальности",
    "15. Изменение Условий",
    "16. Применимое право и юрисдикция"
  ],
  ar: [
    "1. هوية مقدم الخدمة ونطاق التطبيق",
    "2. قبول الشروط والوصول المحجوز للبالغين",
    "3. التعريفات",
    "4. طبيعة الخدمة ودور Felora",
    "5. إنشاء الحساب والتحقق منه",
    "6. التزامات المستخدمين ومقدمي الخدمات",
    "7. العملة الافتراضية والهدايا الافتراضية",
    "8. المدفوعات والاشتراكات والمبالغ المستردة",
    "9. الملكية الفكرية",
    "10. الإشراف والإبلاغ ومكافحة الاتجار بالبشر",
    "11. مسؤولية Felora",
    "12. أمان الحساب",
    "13. المدة والتعليق والإنهاء",
    "14. ملكية البيانات والإشارة إلى سياسة الخصوصية",
    "15. تعديل الشروط",
    "16. القانون المعمول به والاختصاص القضائي"
  ],
  sq: [
    "1. Identiteti i ofruesit dhe fusha e aplikimit",
    "2. Pranimi i Kushteve dhe aksesi i rezervuar për të rritur",
    "3. Përkufizimet",
    "4. Natyra e shërbimit dhe roli i Felora",
    "5. Krijimi dhe verifikimi i llogarisë",
    "6. Detyrimet e Përdoruesve dhe Ofruesve",
    "7. Monedha virtuale dhe dhurata virtuale",
    "8. Pagesat, abonimet dhe rimbursimi",
    "9. Pronësia intelektuale",
    "10. Moderimi, raportimi dhe lufta kundër trafikimit të qenieve njerëzore",
    "11. Përgjegjësia e Felora",
    "12. Siguria e llogarisë",
    "13. Kohëzgjatja, pezullimi dhe ndërprerja",
    "14. Pronësia e të dhënave dhe referenca në politikën e privatësisë",
    "15. Ndryshimi i Kushteve",
    "16. Ligji i zbatueshëm dhe juridiksioni"
  ]
}

async function main() {
  console.log('🚀 Traduction des Terms dans les 8 langues...\n')

  const fr = JSON.parse(readFileSync('src/messages/fr.json', 'utf-8'))

  for (const [lang, code] of Object.entries(langMap)) {
    console.log(`\n📝 Traduction vers ${lang.toUpperCase()}...`)

    const jsonPath = `src/messages/${lang}.json`
    const json = JSON.parse(readFileSync(jsonPath, 'utf-8'))

    // Ajouter la structure legal.terms
    if (!json.legal) json.legal = {}
    json.legal.terms = {
      ...manualTranslations[lang]
    }

    // Traduire les 16 sections
    for (let i = 1; i <= 16; i++) {
      const sectionKey = `section${i}`
      const sectionFr = fr.legal.terms[sectionKey]

      console.log(`   Section ${i}...`)

      json.legal.terms[sectionKey] = {
        title: sectionTitles[lang][i-1],
        content: await translateText(sectionFr.content, code)
      }

      // Attendre 2 secondes entre chaque requête pour éviter le rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    // Sauvegarder
    writeFileSync(jsonPath, JSON.stringify(json, null, 2) + '\n', 'utf-8')
    console.log(`   ✅ ${lang}.json mis à jour`)
  }

  console.log('\n\n✅ Toutes les traductions Terms sont terminées !')
}

main().catch(console.error)
