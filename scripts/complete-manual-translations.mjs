import { readFileSync, writeFileSync } from 'fs'

// TRADUCTIONS COMPLÈTES MANUELLES - TERMS SECTIONS 3-16
const termsTranslations = {
  it: {
    section3: {
      content: `<ul class="list-disc pl-6 space-y-2">
  <li><strong>Utente</strong>: Qualsiasi persona maggiorenne che accede alla Piattaforma per consultare profili, effettuare ricerche, contattare Fornitori o utilizzare le funzionalità offerte.</li>
  <li><strong>Fornitore</strong>: Persona fisica o giuridica (escort indipendente, club, studio, salone, agenzia, ecc.) che crea un profilo su Felora per offrire servizi per adulti nel rispetto della legge.</li>
  <li><strong>Account</strong>: Spazio personale creato da un Utente o Fornitore dopo la registrazione, che consente l'accesso alle funzionalità della Piattaforma.</li>
  <li><strong>Contenuto</strong>: Qualsiasi testo, immagine, video, audio, dato o informazione pubblicato, caricato o condiviso sulla Piattaforma da un Utente o Fornitore.</li>
  <li><strong>Servizi</strong>: Insieme delle funzionalità offerte da Felora (ricerca profili, messaggistica, mappa interattiva, storie, regali virtuali, abbonamenti premium, ecc.).</li>
</ul>`
    },
    section4: {
      content: `<p>Felora è una <strong>piattaforma di intermediazione</strong> e un <strong>host di contenuti</strong>. Forniamo uno spazio digitale che consente ai Fornitori di presentare i loro servizi e agli Utenti di scoprirli e contattarli.</p>
<p class="mt-4"><strong>Felora non fornisce direttamente servizi di escort, servizi sessuali o incontri.</strong> Non siamo parte delle transazioni, accordi o incontri che possono verificarsi tra Utenti e Fornitori.</p>
<p class="mt-4">I Fornitori agiscono in <strong>totale indipendenza</strong>. Fissano liberamente le loro tariffe, disponibilità, condizioni di servizio e sono gli unici responsabili della fornitura, qualità e legalità dei loro servizi.</p>
<p class="mt-4">Felora agisce come <strong>host ai sensi della legge svizzera</strong> e non esercita alcun controllo preventivo sui contenuti pubblicati dai Fornitori, fatte salve le obbligazioni legali di moderazione e segnalazione.</p>`
    },
    section5: {
      content: `<div class="space-y-4">
  <div>
    <h3 class="text-xl font-semibold text-white mb-2">5.1. Registrazione Utenti</h3>
    <p>Per accedere a determinate funzionalità (messaggistica, preferiti, regali virtuali, ecc.), è necessario creare un account fornendo:</p>
    <ul class="list-disc pl-6 space-y-1 mt-2">
      <li>Un indirizzo email valido,</li>
      <li>Una password sicura,</li>
      <li>L'accettazione dei Termini e della Dichiarazione sulla Protezione dei Dati.</li>
    </ul>
    <p class="mt-2">Siete responsabili della riservatezza delle vostre credenziali e di qualsiasi attività effettuata dal vostro account.</p>
  </div>

  <div>
    <h3 class="text-xl font-semibold text-white mb-2">5.2. Registrazione e verifica Fornitori</h3>
    <p>I Fornitori devono obbligatoriamente:</p>
    <ul class="list-disc pl-6 space-y-1 mt-2">
      <li>Creare un account professionale,</li>
      <li>Fornire una copia di un <strong>documento d'identità ufficiale</strong> (carta d'identità, passaporto),</li>
      <li>Completare una <strong>verifica dell'identità (KYC – Know Your Customer)</strong> per garantire che siano maggiorenni e agiscano legalmente,</li>
      <li>Accettare i Termini specifici per i Fornitori e il Codice di Condotta.</li>
    </ul>
    <p class="mt-2">Felora si riserva il diritto di rifiutare, sospendere o eliminare qualsiasi account Fornitore in caso di non conformità, falsa dichiarazione o comportamento contrario ai Termini.</p>
  </div>
</div>`
    },
    section6: {
      content: `<div class="space-y-4">
  <div>
    <h3 class="text-xl font-semibold text-white mb-2">6.1. Obblighi comuni</h3>
    <p>Vi impegnate a:</p>
    <ul class="list-disc pl-6 space-y-1 mt-2">
      <li>Non violare le leggi applicabili (in particolare in materia di prostituzione, tratta di esseri umani, protezione dei minori, discriminazione, ecc.),</li>
      <li>Rispettare i diritti altrui (privacy, proprietà intellettuale, dignità, ecc.),</li>
      <li>Non pubblicare contenuti illegali, diffamatori, violenti, odiosi, pedopornografici o che incitano all'odio,</li>
      <li>Non usurpare l'identità altrui o creare profili falsi,</li>
      <li>Non utilizzare la Piattaforma per scopi fraudolenti, molestie, spam o truffe,</li>
      <li>Non tentare di aggirare le misure di sicurezza o accedere illegalmente ai dati.</li>
    </ul>
  </div>

  <div>
    <h3 class="text-xl font-semibold text-white mb-2">6.2. Obblighi specifici dei Fornitori</h3>
    <ul class="list-disc pl-6 space-y-1">
      <li>Garantire di esercitare la vostra attività <strong>legalmente e volontariamente</strong>,</li>
      <li>Rispettare le leggi locali in materia di prostituzione, salute pubblica e fiscalità,</li>
      <li>Non essere vittima di tratta di esseri umani, sfruttamento della prostituzione o sfruttamento sessuale,</li>
      <li>Pubblicare contenuti veritieri e non indurre in errore gli Utenti (foto recenti, descrizioni oneste, tariffe chiare),</li>
      <li>Rispettare le regole di decenza e moderazione di Felora,</li>
      <li>Dichiarare i vostri redditi in conformità con la legislazione fiscale applicabile.</li>
    </ul>
  </div>
</div>`
    },
    section7: {
      content: `<p>Felora offre un sistema di <strong>moneta virtuale</strong> (crediti, gettoni, ecc.) che consente agli Utenti di acquistare regali virtuali, accedere a contenuti premium o interagire in modo privilegiato con i Fornitori.</p>
<ul class="list-disc pl-6 space-y-2 mt-4">
  <li><strong>Acquisto di crediti</strong>: I crediti possono essere acquistati tramite metodi di pagamento sicuri (carte bancarie, PayPal, criptovalute).</li>
  <li><strong>Utilizzo</strong>: I crediti non sono rimborsabili e non hanno alcun valore monetario reale. Possono essere utilizzati solo sulla Piattaforma.</li>
  <li><strong>Regali virtuali</strong>: Gli Utenti possono inviare regali virtuali ai Fornitori (fiori, champagne, gioielli virtuali, ecc.). I Fornitori ricevono parte del valore sotto forma di entrate (dopo deduzione della commissione Felora).</li>
  <li><strong>Scadenza</strong>: I crediti possono avere una durata di validità limitata (indicata al momento dell'acquisto).</li>
</ul>
<p class="mt-4"><em>I crediti e i regali virtuali non costituiscono in alcun modo un pagamento per servizi sessuali. Sono destinati esclusivamente all'utilizzo di funzionalità digitali sulla Piattaforma.</em></p>`
    },
    section8: {
      content: `<div class="space-y-4">
  <div>
    <h3 class="text-xl font-semibold text-white mb-2">8.1. Abbonamenti Premium</h3>
    <p>Felora offre <strong>abbonamenti premium</strong> (mensili, trimestrali, annuali) che offrono vantaggi aggiuntivi (profilo in evidenza, accesso anticipato alle novità, messaggistica illimitata, statistiche avanzate, ecc.).</p>
    <p class="mt-2">Gli abbonamenti sono a pagamento e si rinnovano automaticamente salvo disdetta anticipata.</p>
  </div>

  <div>
    <h3 class="text-xl font-semibold text-white mb-2">8.2. Commissione sulle entrate dei Fornitori</h3>
    <p>Felora preleva una <strong>commissione</strong> sulle entrate generate dai Fornitori tramite la Piattaforma (regali virtuali, abbonamenti fan, contenuti a pagamento, ecc.). L'aliquota della commissione è indicata nelle condizioni specifiche per i Fornitori.</p>
  </div>

  <div>
    <h3 class="text-xl font-semibold text-white mb-2">8.3. Rimborsi</h3>
    <p>Gli acquisti di crediti, abbonamenti e regali virtuali sono <strong>definitivi</strong>. Nessun rimborso viene concesso tranne:</p>
    <ul class="list-disc pl-6 space-y-1 mt-2">
      <li>Errore tecnico comprovato imputabile a Felora,</li>
      <li>Obbligo legale (diritto di recesso applicabile secondo la legge svizzera o europea).</li>
    </ul>
  </div>
</div>`
    },
    section9: {
      content: `<p>Tutti gli elementi della Piattaforma (logo, grafica, codice sorgente, testi, video, design, funzionalità, ecc.) sono di <strong>proprietà esclusiva di Felora</strong> o dei suoi partner e sono protetti dalle leggi sulla proprietà intellettuale (diritto d'autore, marchi, brevetti, ecc.).</p>
<p class="mt-4"><strong>Licenza d'uso:</strong> Felora vi concede una licenza <strong>non esclusiva, non trasferibile e revocabile</strong> per utilizzare la Piattaforma per scopi personali e non commerciali.</p>
<p class="mt-4"><strong>Contenuti pubblicati dai Fornitori:</strong> Pubblicando contenuti su Felora, concedete a Felora una <strong>licenza mondiale, gratuita, non esclusiva</strong> per utilizzare, riprodurre, modificare, visualizzare e distribuire i vostri contenuti sulla Piattaforma e per scopi promozionali (nel rispetto della vostra privacy e dei vostri diritti).</p>
<p class="mt-4">Garantite di possedere tutti i diritti sui contenuti che pubblicate e che non violano alcun diritto di terzi.</p>`
    },
    section10: {
      content: `<div class="space-y-4">
  <div>
    <h3 class="text-xl font-semibold text-white mb-2">10.1. Moderazione dei contenuti</h3>
    <p>Felora si riserva il diritto di <strong>moderare, eliminare o rifiutare</strong> qualsiasi contenuto che:</p>
    <ul class="list-disc pl-6 space-y-1 mt-2">
      <li>Viola i Termini, la legge o il buon costume,</li>
      <li>È segnalato dalla comunità come inappropriato,</li>
      <li>Presenta un rischio per la sicurezza, la dignità o i diritti altrui.</li>
    </ul>
  </div>

  <div>
    <h3 class="text-xl font-semibold text-white mb-2">10.2. Segnalazione</h3>
    <p>Qualsiasi Utente può segnalare un contenuto o profilo sospetto tramite il <strong>pulsante di segnalazione</strong> presente su ogni profilo e contenuto. Le segnalazioni vengono elaborate nel più breve tempo possibile dal nostro team di moderazione.</p>
  </div>

  <div>
    <h3 class="text-xl font-semibold text-white mb-2">10.3. Lotta contro la tratta di esseri umani e lo sfruttamento sessuale</h3>
    <p>Felora condanna fermamente ogni forma di <strong>tratta di esseri umani, sfruttamento della prostituzione, sfruttamento sessuale o lavoro forzato</strong>. Collaboriamo attivamente con le autorità competenti per prevenire e segnalare tali atti.</p>
    <p class="mt-2">Se avete conoscenza o sospetto di tali attività, contattateci immediatamente a: <a href="mailto:info@felora.ch" class="text-pink-400 hover:text-pink-300">info@felora.ch</a> o segnalate il profilo interessato.</p>
  </div>
</div>`
    },
    section11: {
      content: `<p>Felora agisce come <strong>intermediario tecnico</strong> e <strong>host</strong>. In quanto tale:</p>
<ul class="list-disc pl-6 space-y-2 mt-4">
  <li>Non siamo <strong>responsabili</strong> dei contenuti pubblicati dai Fornitori (descrizioni, foto, video, tariffe, disponibilità),</li>
  <li>Non siamo <strong>responsabili</strong> delle transazioni, accordi o incontri tra Utenti e Fornitori,</li>
  <li>Non garantiamo la veridicità, qualità, sicurezza o legalità dei servizi offerti dai Fornitori,</li>
  <li>Non siamo <strong>responsabili</strong> dei danni diretti o indiretti derivanti dall'uso della Piattaforma, salvo colpa grave o intenzionale da parte nostra.</li>
</ul>
<p class="mt-4"><strong>Disponibilità della Piattaforma:</strong> Ci sforziamo di garantire la massima disponibilità della Piattaforma, ma non garantiamo un accesso ininterrotto. Possono verificarsi manutenzioni, guasti o interruzioni.</p>
<p class="mt-4"><strong>Limitazione di responsabilità:</strong> Nei limiti consentiti dalla legge, la responsabilità di Felora è limitata all'importo delle somme effettivamente ricevute dall'Utente o dal Fornitore negli ultimi 12 mesi.</p>`
    },
    section12: {
      content: `<p>Siete responsabili della <strong>riservatezza delle vostre credenziali</strong> (indirizzo email, password). Dovete:</p>
<ul class="list-disc pl-6 space-y-1 mt-4">
  <li>Scegliere una password forte e unica,</li>
  <li>Non condividere mai le vostre credenziali con terzi,</li>
  <li>Informarci immediatamente in caso di utilizzo non autorizzato del vostro account.</li>
</ul>
<p class="mt-4">Felora implementa misure di sicurezza per proteggere i vostri dati (crittografia, HTTPS, autenticazione a due fattori opzionale), ma nessun sistema è infallibile. Riconoscete i rischi inerenti all'uso di Internet.</p>`
    },
    section13: {
      content: `<div class="space-y-4">
  <div>
    <h3 class="text-xl font-semibold text-white mb-2">13.1. Durata</h3>
    <p>I presenti Termini si applicano finché utilizzate la Piattaforma. Il vostro account rimane attivo fino alla sua eliminazione o risoluzione.</p>
  </div>

  <div>
    <h3 class="text-xl font-semibold text-white mb-2">13.2. Sospensione o risoluzione da parte di Felora</h3>
    <p>Felora si riserva il diritto di sospendere o eliminare il vostro account in qualsiasi momento, senza preavviso né indennizzo, in caso di:</p>
    <ul class="list-disc pl-6 space-y-1 mt-2">
      <li>Violazione dei Termini,</li>
      <li>Attività fraudolenta, illegale o dannosa,</li>
      <li>Falsa dichiarazione (età, identità, ecc.),</li>
      <li>Mancato rispetto degli obblighi di pagamento,</li>
      <li>Comportamento contrario ai valori di Felora o alla sicurezza della comunità.</li>
    </ul>
  </div>

  <div>
    <h3 class="text-xl font-semibold text-white mb-2">13.3. Risoluzione da parte dell'Utente o Fornitore</h3>
    <p>Potete eliminare il vostro account in qualsiasi momento dalle impostazioni del profilo. L'eliminazione è definitiva e comporta la perdita di tutti i vostri dati (messaggi, crediti non utilizzati, cronologia, ecc.).</p>
  </div>
</div>`
    },
    section14: {
      content: `<p>La raccolta, l'utilizzo e la protezione dei vostri dati personali sono disciplinati dalla nostra <strong><a href="/legal/privacy" class="text-pink-400 hover:text-pink-300">Dichiarazione sulla Protezione dei Dati</a></strong>, che fa parte integrante dei presenti Termini.</p>
<p class="mt-4">Utilizzando la Piattaforma, accettate le modalità di trattamento dei vostri dati come descritto in tale Dichiarazione, in conformità con la <strong>Legge federale svizzera sulla protezione dei dati (LPD)</strong>.</p>`
    },
    section15: {
      content: `<p>Felora si riserva il diritto di modificare i presenti Termini in qualsiasi momento, in particolare in caso di evoluzione dei nostri servizi, delle nostre pratiche o della legislazione applicabile.</p>
<p class="mt-4">Qualsiasi modifica sostanziale sarà comunicata tramite:</p>
<ul class="list-disc pl-6 space-y-1 mt-2">
  <li>Una notifica sulla Piattaforma (banner, pop-up),</li>
  <li>Un'email all'indirizzo associato al vostro account.</li>
</ul>
<p class="mt-4">La versione aggiornata entrerà in vigore dalla sua pubblicazione sulla Piattaforma, salvo indicazione contraria. Continuando a utilizzare la Piattaforma dopo la modifica, accettate i nuovi Termini. Se non accettate le modifiche, dovete cessare di utilizzare la Piattaforma ed eliminare il vostro account.</p>`
    },
    section16: {
      content: `<p>I presenti Termini sono disciplinati dal <strong>diritto svizzero</strong>.</p>
<p class="mt-4">Qualsiasi controversia relativa all'interpretazione, esecuzione o validità dei Termini sarà sottoposta alla competenza esclusiva dei tribunali del cantone della <strong>sede di Felora</strong> (o, a seconda dei casi, ai tribunali competenti in Svizzera), salvo disposizione imperativa contraria.</p>
<p class="mt-4"><strong>Mediazione:</strong> Prima di qualsiasi ricorso giudiziario, le parti si sforzeranno di risolvere amichevolmente la loro controversia tramite mediazione o conciliazione.</p>
<p class="mt-4"><strong>Contatto per controversie:</strong> <a href="mailto:info@felora.ch" class="text-pink-400 hover:text-pink-300">info@felora.ch</a></p>`
    }
  }
}

console.log('🚀 APPLICATION DES TRADUCTIONS MANUELLES COMPLÈTES...\n')

// Appliquer les traductions IT pour Terms sections 3-16
const it = JSON.parse(readFileSync('src/messages/it.json', 'utf-8'))

for (let i = 3; i <= 16; i++) {
  const key = `section${i}`
  if (termsTranslations.it[key]) {
    it.legal.terms[key] = {
      title: it.legal.terms[key]?.title || `${i}. [Titre IT]`,
      content: termsTranslations.it[key].content
    }
    console.log(`✅ IT Terms section ${i} traduite`)
  }
}

writeFileSync('src/messages/it.json', JSON.stringify(it, null, 2) + '\n', 'utf-8')

console.log('\n🎉 ITALIEN (IT) - Terms sections 3-16 COMPLÉTÉ !')
console.log('\n📝 Pour PT, RU, AR, SQ - je continue...')
