import { readFileSync, writeFileSync } from 'fs'

// Traductions manuelles complètes pour toutes les langues
const translations = {
  it: {
    section1: {
      content: `<p><strong>Ragione sociale</strong>: Felora</p>
<p><strong>Sede legale</strong>: <em>[Indirizzo completo da inserire]</em></p>
<p><strong>Numero d'impresa (IDE)</strong>: <em>[Numero IDE/UID]</em></p>
<p><strong>Email di contatto</strong>: <a href="mailto:info@felora.ch" class="text-pink-400 hover:text-pink-300">info@felora.ch</a></p>
<p><strong>Piattaforma</strong>: <a href="https://felora.ch" class="text-pink-400 hover:text-pink-300">felora.ch</a> (di seguito la "<strong>Piattaforma</strong>")</p>
<p>Felora (di seguito "<strong>Felora</strong>", "<strong>noi</strong>", "<strong>nostro</strong>") gestisce una piattaforma digitale (sito web e applicazione mobile) che consente agli <strong>Utenti</strong> di consultare profili di escort e club, e di mettersi in contatto con <strong>Fornitori</strong> adulti indipendenti (escort, club, studi, ecc.) che offrono servizi per adulti in un contesto legale e consensuale.</p>`
    },
    section2: {
      content: `<p>Accedendo alla Piattaforma, registrandovi o utilizzando i suoi servizi, accettate senza riserve le presenti CGU. Se non accettate queste condizioni, si prega di non utilizzare la Piattaforma.</p>
<p class="mt-4"><strong>⚠️ AVVERTENZA: Accesso riservato esclusivamente ai maggiorenni (18 anni o più)</strong></p>
<p>La Piattaforma Felora è <strong>destinata esclusivamente agli adulti</strong>. Accedendovi, dichiarate e garantite che:</p>
<ul class="list-disc pl-6 space-y-1 mt-2">
  <li>Avete almeno <strong>18 anni compiuti</strong> (o l'età legale della maggioranza nella vostra giurisdizione),</li>
  <li>Non siete minorenne,</li>
  <li>Accedete alla Piattaforma di vostra iniziativa e con piena consapevolezza,</li>
  <li>Non sarete turbati da contenuti per adulti.</li>
</ul>
<p class="mt-4">Felora si riserva il diritto di verificare la vostra età in qualsiasi momento (richiesta di documento d'identità, verifica biometrica, ecc.) e di sospendere o eliminare il vostro account in caso di falsa dichiarazione.</p>
<p class="mt-4"><strong>Qualsiasi uso fraudolento o ingannevole relativo all'età può comportare azioni legali.</strong></p>`
    }
  },
  pt: {
    section1: {
      content: `<p><strong>Razão social</strong>: Felora</p>
<p><strong>Sede social</strong>: <em>[Endereço completo a inserir]</em></p>
<p><strong>Número de empresa (IDE)</strong>: <em>[Número IDE/UID]</em></p>
<p><strong>E-mail de contacto</strong>: <a href="mailto:info@felora.ch" class="text-pink-400 hover:text-pink-300">info@felora.ch</a></p>
<p><strong>Plataforma</strong>: <a href="https://felora.ch" class="text-pink-400 hover:text-pink-300">felora.ch</a> (doravante a "<strong>Plataforma</strong>")</p>
<p>A Felora (doravante "<strong>Felora</strong>", "<strong>nós</strong>", "<strong>nosso</strong>") opera uma plataforma digital (site e aplicação móvel) permitindo aos <strong>Utilizadores</strong> consultar perfis de escorts e clubes, e contactar <strong>Prestadores</strong> adultos independentes (escorts, clubes, estúdios, etc.) que oferecem serviços para adultos num contexto legal e consensual.</p>`
    },
    section2: {
      content: `<p>Ao aceder à Plataforma, ao registar-se ou ao utilizar os seus serviços, aceita sem reservas os presentes T&C. Se não aceitar estas condições, por favor não utilize a Plataforma.</p>
<p class="mt-4"><strong>⚠️ AVISO: Acesso estritamente reservado a maiores de idade (18 anos ou mais)</strong></p>
<p>A Plataforma Felora é <strong>exclusivamente destinada a adultos</strong>. Ao aceder, declara e garante que:</p>
<ul class="list-disc pl-6 space-y-1 mt-2">
  <li>Tem pelo menos <strong>18 anos completos</strong> (ou a idade legal da maioridade na sua jurisdição),</li>
  <li>Não é menor de idade,</li>
  <li>Acede à Plataforma por sua própria iniciativa e com pleno conhecimento,</li>
  <li>Não ficará chocado com conteúdos para adultos.</li>
</ul>
<p class="mt-4">A Felora reserva-se o direito de verificar a sua idade a qualquer momento (pedido de documento de identidade, verificação biométrica, etc.) e de suspender ou eliminar a sua conta em caso de declaração falsa.</p>
<p class="mt-4"><strong>Qualquer utilização fraudulenta ou enganosa relativamente à idade pode resultar em acções judiciais.</strong></p>`
    }
  },
  ru: {
    section1: {
      content: `<p><strong>Название компании</strong>: Felora</p>
<p><strong>Юридический адрес</strong>: <em>[Полный адрес для вставки]</em></p>
<p><strong>Номер предприятия (IDE)</strong>: <em>[Номер IDE/UID]</em></p>
<p><strong>Контактный e-mail</strong>: <a href="mailto:info@felora.ch" class="text-pink-400 hover:text-pink-300">info@felora.ch</a></p>
<p><strong>Платформа</strong>: <a href="https://felora.ch" class="text-pink-400 hover:text-pink-300">felora.ch</a> (далее "<strong>Платформа</strong>")</p>
<p>Felora (далее "<strong>Felora</strong>", "<strong>мы</strong>", "<strong>наш</strong>") управляет цифровой платформой (веб-сайт и мобильное приложение), позволяющей <strong>Пользователям</strong> просматривать профили эскортов и клубов, а также связываться с независимыми взрослыми <strong>Поставщиками</strong> (эскорты, клубы, студии и т.д.), предлагающими услуги для взрослых в легальном и согласованном контексте.</p>`
    },
    section2: {
      content: `<p>Получая доступ к Платформе, регистрируясь или используя её услуги, вы безоговорочно принимаете настоящие Условия. Если вы не принимаете эти условия, пожалуйста, не используйте Платформу.</p>
<p class="mt-4"><strong>⚠️ ПРЕДУПРЕЖДЕНИЕ: Доступ строго ограничен для совершеннолетних (18 лет и старше)</strong></p>
<p>Платформа Felora <strong>предназначена исключительно для взрослых</strong>. Получая доступ, вы заявляете и гарантируете, что:</p>
<ul class="list-disc pl-6 space-y-1 mt-2">
  <li>Вам исполнилось <strong>18 лет</strong> (или возраст совершеннолетия в вашей юрисдикции),</li>
  <li>Вы не являетесь несовершеннолетним,</li>
  <li>Вы получаете доступ к Платформе по собственной инициативе и с полным осознанием,</li>
  <li>Вас не шокируют материалы для взрослых.</li>
</ul>
<p class="mt-4">Felora оставляет за собой право проверить ваш возраст в любое время (запрос документа, удостоверяющего личность, биометрическая проверка и т.д.) и приостановить или удалить вашу учётную запись в случае ложного заявления.</p>
<p class="mt-4"><strong>Любое мошенническое или вводящее в заблуждение использование в отношении возраста может привести к судебному преследованию.</strong></p>`
    }
  },
  ar: {
    section1: {
      content: `<p><strong>الاسم التجاري</strong>: Felora</p>
<p><strong>المقر الاجتماعي</strong>: <em>[العنوان الكامل المراد إدراجه]</em></p>
<p><strong>رقم المؤسسة (IDE)</strong>: <em>[رقم IDE/UID]</em></p>
<p><strong>البريد الإلكتروني للاتصال</strong>: <a href="mailto:info@felora.ch" class="text-pink-400 hover:text-pink-300">info@felora.ch</a></p>
<p><strong>المنصة</strong>: <a href="https://felora.ch" class="text-pink-400 hover:text-pink-300">felora.ch</a> (فيما يلي "<strong>المنصة</strong>")</p>
<p>تدير Felora (فيما يلي "<strong>Felora</strong>"، "<strong>نحن</strong>"، "<strong>لدينا</strong>") منصة رقمية (موقع ويب وتطبيق جوال) تتيح <strong>للمستخدمين</strong> استشارة ملفات تعريف المرافقين والنوادي، والاتصال <strong>بمقدمي الخدمات</strong> البالغين المستقلين (مرافقون، نوادي، استوديوهات، إلخ) الذين يقدمون خدمات للبالغين في إطار قانوني وبالتراضي.</p>`
    },
    section2: {
      content: `<p>بالوصول إلى المنصة، أو التسجيل أو استخدام خدماتها، فإنك تقبل دون تحفظ هذه الشروط والأحكام. إذا كنت لا تقبل هذه الشروط، يرجى عدم استخدام المنصة.</p>
<p class="mt-4"><strong>⚠️ تحذير: الوصول محجوز بشكل صارم للبالغين (18 سنة فما فوق)</strong></p>
<p>منصة Felora <strong>مخصصة حصريًا للبالغين</strong>. بالوصول إليها، فإنك تقر وتضمن أن:</p>
<ul class="list-disc pl-6 space-y-1 mt-2">
  <li>عمرك <strong>18 عامًا على الأقل</strong> (أو سن الرشد القانوني في ولايتك القضائية)،</li>
  <li>أنت لست قاصرًا،</li>
  <li>تصل إلى المنصة بمبادرة منك وبمعرفة كاملة،</li>
  <li>لن تصدم من محتوى البالغين.</li>
</ul>
<p class="mt-4">تحتفظ Felora بالحق في التحقق من عمرك في أي وقت (طلب وثيقة هوية، التحقق البيومتري، إلخ) وتعليق أو حذف حسابك في حالة الإعلان الكاذب.</p>
<p class="mt-4"><strong>أي استخدام احتيالي أو مضلل فيما يتعلق بالعمر قد يؤدي إلى ملاحقة قضائية.</strong></p>`
    }
  },
  sq: {
    section1: {
      content: `<p><strong>Emri tregtar</strong>: Felora</p>
<p><strong>Selia sociale</strong>: <em>[Adresa e plotë për të futur]</em></p>
<p><strong>Numri i ndërmarrjes (IDE)</strong>: <em>[Numri IDE/UID]</em></p>
<p><strong>Email-i i kontaktit</strong>: <a href="mailto:info@felora.ch" class="text-pink-400 hover:text-pink-300">info@felora.ch</a></p>
<p><strong>Platforma</strong>: <a href="https://felora.ch" class="text-pink-400 hover:text-pink-300">felora.ch</a> (më poshtë "<strong>Platforma</strong>")</p>
<p>Felora (më poshtë "<strong>Felora</strong>", "<strong>ne</strong>", "<strong>ynë</strong>") operon një platformë dixhitale (faqe interneti dhe aplikacion mobil) që u lejon <strong>Përdoruesve</strong> të konsultojnë profilet e shoqëruesve dhe klubeve, dhe të kontaktojnë <strong>Ofruesit</strong> të rritur të pavarur (shoqërues, klube, studio, etj.) që ofrojnë shërbime për të rritur në një kontekst ligjor dhe me pëlqim.</p>`
    },
    section2: {
      content: `<p>Duke hyrë në Platformë, duke u regjistruar ose duke përdorur shërbimet e saj, ju pranoni pa rezerva këto Kushtet. Nëse nuk i pranoni këto kushte, ju lutemi mos e përdorni Platformën.</p>
<p class="mt-4"><strong>⚠️ PARALAJMËRIM: Aksesi është rezervuar rreptësisht për të rritur (18 vjeç ose më shumë)</strong></p>
<p>Platforma Felora është <strong>destinuar ekskluzivisht për të rritur</strong>. Duke hyrë, ju deklaroni dhe garantoni se:</p>
<ul class="list-disc pl-6 space-y-1 mt-2">
  <li>Jeni të paktën <strong>18 vjeç</strong> (ose mosha ligjore e madhësisë në juridiksionin tuaj),</li>
  <li>Nuk jeni i mitur,</li>
  <li>Hyni në Platformë me iniciativën tuaj dhe me njohuri të plotë,</li>
  <li>Nuk do të shokoheni nga përmbajtja për të rritur.</li>
</ul>
<p class="mt-4">Felora rezervon të drejtën të verifikojë moshën tuaj në çdo kohë (kërkesë për dokument identiteti, verifikim biometrik, etj.) dhe të pezullojë ose fshijë llogarinë tuaj në rast të deklaratës së rreme.</p>
<p class="mt-4"><strong>Çdo përdorim mashtrues ose i rremë në lidhje me moshën mund të çojë në ndjekje ligjore.</strong></p>`
    }
  }
}

// Charger et mettre à jour chaque langue
const languages = ['it', 'pt', 'ru', 'ar', 'sq']

for (const lang of languages) {
  console.log(`\n📝 Mise à jour ${lang.toUpperCase()}...`)

  const jsonPath = `src/messages/${lang}.json`
  const json = JSON.parse(readFileSync(jsonPath, 'utf-8'))

  if (!json.legal) json.legal = {}
  if (!json.legal.terms) json.legal.terms = {}

  // Mettre à jour section1 et section2
  if (translations[lang].section1) {
    json.legal.terms.section1 = {
      title: json.legal.terms.section1?.title || `1. ${lang === 'it' ? 'Identità del fornitore e ambito di applicazione' : lang === 'pt' ? 'Identidade do prestador e âmbito de aplicação' : lang === 'ru' ? 'Идентификация поставщика услуг и область применения' : lang === 'ar' ? 'هوية مقدم الخدمة ونطاق التطبيق' : 'Identiteti i ofruesit dhe fusha e aplikimit'}`,
      content: translations[lang].section1.content
    }
  }

  if (translations[lang].section2) {
    json.legal.terms.section2 = {
      title: json.legal.terms.section2?.title || `2. ${lang === 'it' ? 'Accettazione delle CGU e accesso riservato ai maggiorenni' : lang === 'pt' ? 'Aceitação dos T&C e acesso reservado a maiores' : lang === 'ru' ? 'Принятие Условий и доступ только для совершеннолетних' : lang === 'ar' ? 'قبول الشروط والوصول المحجوز للبالغين' : 'Pranimi i Kushteve dhe aksesi i rezervuar për të rritur'}`,
      content: translations[lang].section2.content
    }
  }

  writeFileSync(jsonPath, JSON.stringify(json, null, 2) + '\n', 'utf-8')
  console.log(`   ✅ ${lang}.json mis à jour (sections 1-2)`)
}

console.log('\n\n🎉 Traductions manuelles section 1-2 terminées pour IT, PT, RU, AR, SQ!')
console.log('Les sections 3-16 restent en français pour l\'instant.')
