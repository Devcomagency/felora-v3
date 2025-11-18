#!/usr/bin/env node
/**
 * Script de traduction automatique pour dashboardEscort.profil
 * Traduit depuis fr.json vers toutes les autres langues
 */

const fs = require('fs');
const path = require('path');

// Langues à traduire
const languages = {
  en: 'English',
  de: 'Deutsch',
  es: 'Español',
  it: 'Italiano',
  pt: 'Português',
  ru: 'Русский',
  ar: 'العربية',
  sq: 'Shqip'
};

// Traductions manuelles des clés principales
const translations = {
  // Page titles
  "Mon Profil": {
    en: "My Profile",
    de: "Mein Profil",
    es: "Mi Perfil",
    it: "Il Mio Profilo",
    pt: "Meu Perfil",
    ru: "Мой Профиль",
    ar: "ملفي الشخصي",
    sq: "Profili Im"
  },
  "Gérez vos informations publiques et votre présentation": {
    en: "Manage your public information and presentation",
    de: "Verwalten Sie Ihre öffentlichen Informationen und Präsentation",
    es: "Gestiona tu información pública y presentación",
    it: "Gestisci le tue informazioni pubbliche e presentazione",
    pt: "Gerencie suas informações públicas e apresentação",
    ru: "Управляйте своей публичной информацией и презентацией",
    ar: "إدارة معلوماتك العامة والعرض التقديمي",
    sq: "Menaxhoni informacionin tuaj publik dhe prezantimin"
  },

  // KYC Success
  "🎉 Félicitations ! KYC soumis avec succès": {
    en: "🎉 Congratulations! KYC submitted successfully",
    de: "🎉 Glückwunsch! KYC erfolgreich eingereicht",
    es: "🎉 ¡Felicitaciones! KYC enviado con éxito",
    it: "🎉 Congratulazioni! KYC inviato con successo",
    pt: "🎉 Parabéns! KYC enviado com sucesso",
    ru: "🎉 Поздравляем! KYC успешно отправлен",
    ar: "🎉 تهانينا! تم إرسال KYC بنجاح",
    sq: "🎉 Urime! KYC u dërgua me sukses"
  },
  "Votre vérification d'identité a été transmise. Il est maintenant temps de finaliser votre profil !": {
    en: "Your identity verification has been submitted. It's now time to complete your profile!",
    de: "Ihre Identitätsprüfung wurde übermittelt. Jetzt ist es an der Zeit, Ihr Profil zu vervollständigen!",
    es: "Tu verificación de identidad ha sido enviada. ¡Ahora es momento de completar tu perfil!",
    it: "La tua verifica d'identità è stata inviata. Ora è il momento di completare il tuo profilo!",
    pt: "Sua verificação de identidade foi enviada. Agora é hora de completar seu perfil!",
    ru: "Ваша проверка личности отправлена. Теперь пора завершить ваш профиль!",
    ar: "تم إرسال التحقق من هويتك. حان الوقت الآن لإكمال ملفك الشخصي!",
    sq: "Verifikimi i identitetit tuaj u dërgua. Tani është koha për të përfunduar profilin tuaj!"
  },
  "📋 Prochaines étapes recommandées :": {
    en: "📋 Recommended next steps:",
    de: "📋 Empfohlene nächste Schritte:",
    es: "📋 Próximos pasos recomendados:",
    it: "📋 Prossimi passi consigliati:",
    pt: "📋 Próximos passos recomendados:",
    ru: "📋 Рекомендуемые следующие шаги:",
    ar: "📋 الخطوات التالية الموصى بها:",
    sq: "📋 Hapat e rekomanduar të ardhshëm:"
  },
  "Ajoutez vos photos et descriptions": {
    en: "Add your photos and descriptions",
    de: "Fügen Sie Ihre Fotos und Beschreibungen hinzu",
    es: "Agrega tus fotos y descripciones",
    it: "Aggiungi le tue foto e descrizioni",
    pt: "Adicione suas fotos e descrições",
    ru: "Добавьте свои фотографии и описания",
    ar: "أضف صورك ووصفك",
    sq: "Shto fotot dhe përshkrimet tuaja"
  },
  "Configurez vos tarifs et services": {
    en: "Configure your rates and services",
    de: "Konfigurieren Sie Ihre Preise und Dienstleistungen",
    es: "Configura tus tarifas y servicios",
    it: "Configura le tue tariffe e servizi",
    pt: "Configure suas tarifas e serviços",
    ru: "Настройте свои тарифы и услуги",
    ar: "قم بتكوين الأسعار والخدمات الخاصة بك",
    sq: "Konfiguroni tarifat dhe shërbimet tuaja"
  },
  "Votre vérification sera traitée sous 48h": {
    en: "Your verification will be processed within 48h",
    de: "Ihre Verifizierung wird innerhalb von 48 Stunden bearbeitet",
    es: "Tu verificación será procesada en 48h",
    it: "La tua verifica sarà elaborata entro 48h",
    pt: "Sua verificação será processada em 48h",
    ru: "Ваша проверка будет обработана в течение 48 часов",
    ar: "سيتم معالجة التحقق الخاص بك خلال 48 ساعة",
    sq: "Verifikimi juaj do të përpunohet brenda 48 orësh"
  },

  // Clubs
  "Mes Clubs": {
    en: "My Clubs",
    de: "Meine Clubs",
    es: "Mis Clubes",
    it: "I Miei Club",
    pt: "Meus Clubes",
    ru: "Мои Клубы",
    ar: "نواديي",
    sq: "Klubet e Mia"
  },
  "Chargement...": {
    en: "Loading...",
    de: "Laden...",
    es: "Cargando...",
    it: "Caricamento...",
    pt: "Carregando...",
    ru: "Загрузка...",
    ar: "جاري التحميل...",
    sq: "Duke u ngarkuar..."
  },
  "Invitations": {
    en: "Invitations",
    de: "Einladungen",
    es: "Invitaciones",
    it: "Inviti",
    pt: "Convites",
    ru: "Приглашения",
    ar: "الدعوات",
    sq: "Ftesat"
  },
  "Mes clubs": {
    en: "My clubs",
    de: "Meine Clubs",
    es: "Mis clubes",
    it: "I miei club",
    pt: "Meus clubes",
    ru: "Мои клубы",
    ar: "نواديي",
    sq: "Klubet e mia"
  },
  "Invitation reçue le": {
    en: "Invitation received on",
    de: "Einladung erhalten am",
    es: "Invitación recibida el",
    it: "Invito ricevuto il",
    pt: "Convite recebido em",
    ru: "Приглашение получено",
    ar: "تم استلام الدعوة في",
    sq: "Ftesa u mor më"
  },
  "Expire le": {
    en: "Expires on",
    de: "Läuft ab am",
    es: "Expira el",
    it: "Scade il",
    pt: "Expira em",
    ru: "Истекает",
    ar: "تنتهي في",
    sq: "Skadon më"
  },
  "Accepter": {
    en: "Accept",
    de: "Akzeptieren",
    es: "Aceptar",
    it: "Accetta",
    pt: "Aceitar",
    ru: "Принять",
    ar: "قبول",
    sq: "Prano"
  },
  "Refuser": {
    en: "Decline",
    de: "Ablehnen",
    es: "Rechazar",
    it: "Rifiuta",
    pt: "Recusar",
    ru: "Отклонить",
    ar: "رفض",
    sq: "Refuzo"
  },
  "Aucune invitation en attente": {
    en: "No pending invitations",
    de: "Keine ausstehenden Einladungen",
    es: "No hay invitaciones pendientes",
    it: "Nessun invito in sospeso",
    pt: "Nenhum convite pendente",
    ru: "Нет ожидающих приглашений",
    ar: "لا توجد دعوات معلقة",
    sq: "Nuk ka ftesa në pritje"
  },
  "Les clubs peuvent vous inviter à apparaître sur leur profil": {
    en: "Clubs can invite you to appear on their profile",
    de: "Clubs können Sie einladen, auf ihrem Profil zu erscheinen",
    es: "Los clubes pueden invitarte a aparecer en su perfil",
    it: "I club possono invitarti ad apparire sul loro profilo",
    pt: "Os clubes podem convidá-lo a aparecer em seu perfil",
    ru: "Клубы могут пригласить вас появиться в их профиле",
    ar: "يمكن للنوادي دعوتك للظهور في ملفهم الشخصي",
    sq: "Klubet mund t'ju ftojnë të shfaqeni në profilin e tyre"
  },
  "Historique": {
    en: "History",
    de: "Verlauf",
    es: "Historial",
    it: "Cronologia",
    pt: "Histórico",
    ru: "История",
    ar: "السجل",
    sq: "Historia"
  },
  "✓ Acceptée": {
    en: "✓ Accepted",
    de: "✓ Akzeptiert",
    es: "✓ Aceptada",
    it: "✓ Accettato",
    pt: "✓ Aceito",
    ru: "✓ Принято",
    ar: "✓ تم القبول",
    sq: "✓ Pranuar"
  },
  "✗ Refusée": {
    en: "✗ Declined",
    de: "✗ Abgelehnt",
    es: "✗ Rechazada",
    it: "✗ Rifiutato",
    pt: "✗ Recusado",
    ru: "✗ Отклонено",
    ar: "✗ تم الرفض",
    sq: "✗ Refuzuar"
  },
  "⏱ Expirée": {
    en: "⏱ Expired",
    de: "⏱ Abgelaufen",
    es: "⏱ Expirada",
    it: "⏱ Scaduto",
    pt: "⏱ Expirado",
    ru: "⏱ Истекло",
    ar: "⏱ منتهية الصلاحية",
    sq: "⏱ Skaduar"
  },
  "Voir profil": {
    en: "View profile",
    de: "Profil ansehen",
    es: "Ver perfil",
    it: "Vedi profilo",
    pt: "Ver perfil",
    ru: "Посмотреть профиль",
    ar: "عرض الملف الشخصي",
    sq: "Shiko profilin"
  },
  "Quitter le club": {
    en: "Leave club",
    de: "Club verlassen",
    es: "Abandonar club",
    it: "Lascia club",
    pt: "Sair do clube",
    ru: "Покинуть клуб",
    ar: "مغادرة النادي",
    sq: "Largohu nga klubi"
  },
  "Voulez-vous vraiment quitter {clubName} ?": {
    en: "Do you really want to leave {clubName}?",
    de: "Möchten Sie {clubName} wirklich verlassen?",
    es: "¿Realmente quieres abandonar {clubName}?",
    it: "Vuoi davvero lasciare {clubName}?",
    pt: "Você realmente quer sair de {clubName}?",
    ru: "Вы действительно хотите покинуть {clubName}?",
    ar: "هل تريد حقًا مغادرة {clubName}؟",
    sq: "Dëshironi me të vërtetë të largoheni nga {clubName}?"
  },
  "Vous n'êtes affiliée à aucun club": {
    en: "You are not affiliated with any club",
    de: "Sie sind keinem Club angeschlossen",
    es: "No estás afiliada a ningún club",
    it: "Non sei affiliata a nessun club",
    pt: "Você não está afiliada a nenhum clube",
    ru: "Вы не состоите ни в одном клубе",
    ar: "أنت لست منتميًا لأي نادٍ",
    sq: "Nuk jeni të lidhur me asnjë klub"
  },
  "Acceptez une invitation pour apparaître sur le profil d'un club": {
    en: "Accept an invitation to appear on a club's profile",
    de: "Akzeptieren Sie eine Einladung, um auf dem Profil eines Clubs zu erscheinen",
    es: "Acepta una invitación para aparecer en el perfil de un club",
    it: "Accetta un invito per apparire sul profilo di un club",
    pt: "Aceite um convite para aparecer no perfil de um clube",
    ru: "Примите приглашение, чтобы появиться в профиле клуба",
    ar: "اقبل دعوة للظهور في ملف نادٍ",
    sq: "Pranoni një ftesë për të shfaqur në profilin e një klubi"
  }
};

// Fonction pour traduire récursivement un objet
function translateObject(obj, lang) {
  if (typeof obj === 'string') {
    // Chercher une traduction exacte
    if (translations[obj] && translations[obj][lang]) {
      return translations[obj][lang];
    }
    // Si pas de traduction, retourner l'original (sera traduit manuellement après)
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => translateObject(item, lang));
  }

  if (typeof obj === 'object' && obj !== null) {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = translateObject(value, lang);
    }
    return result;
  }

  return obj;
}

// Main
async function main() {
  const messagesDir = path.join(__dirname, 'src', 'messages');

  // Lire fr.json
  const frPath = path.join(messagesDir, 'fr.json');
  const frData = JSON.parse(fs.readFileSync(frPath, 'utf8'));
  const profilSection = frData.dashboardEscort.profil;

  console.log('🔄 Translation en cours...\n');

  // Traduire pour chaque langue
  for (const [langCode, langName] of Object.entries(languages)) {
    console.log(`📝 ${langName} (${langCode})...`);

    const langPath = path.join(messagesDir, `${langCode}.json`);
    const langData = JSON.parse(fs.readFileSync(langPath, 'utf8'));

    // Traduire la section profil
    const translatedProfil = translateObject(profilSection, langCode);

    // Remplacer dans le fichier
    langData.dashboardEscort.profil = translatedProfil;

    // Sauvegarder
    fs.writeFileSync(langPath, JSON.stringify(langData, null, 2), 'utf8');
    console.log(`   ✅ ${langCode}.json mis à jour`);
  }

  console.log('\n✨ Traduction terminée!');
  console.log('⚠️  Note: Certaines chaînes peuvent encore être en français et nécessitent une traduction manuelle.');
}

main().catch(console.error);
