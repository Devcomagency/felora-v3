import { readFileSync, writeFileSync } from 'fs'

// MÉGA TRADUCTIONS COMPLÈTES - PT (Português)
const PT_TERMS = {
  section3: { content: `<ul class="list-disc pl-6 space-y-2">
  <li><strong>Utilizador</strong>: Qualquer pessoa maior que acede à Plataforma para consultar perfis, efetuar pesquisas, contactar Prestadores ou utilizar as funcionalidades oferecidas.</li>
  <li><strong>Prestador</strong>: Pessoa física ou jurídica (escort independente, clube, estúdio, salão, agência, etc.) que cria um perfil na Felora para oferecer serviços para adultos no respeito da lei.</li>
  <li><strong>Conta</strong>: Espaço pessoal criado por um Utilizador ou Prestador após registo, permitindo o acesso às funcionalidades da Plataforma.</li>
  <li><strong>Conteúdo</strong>: Qualquer texto, imagem, vídeo, áudio, dado ou informação publicado, carregado ou partilhado na Plataforma por um Utilizador ou Prestador.</li>
  <li><strong>Serviços</strong>: Conjunto das funcionalidades propostas pela Felora (pesquisa de perfis, mensagens, mapa interativo, stories, presentes virtuais, subscrições premium, etc.).</li>
</ul>` },
  section4: { content: `<p>A Felora é uma <strong>plataforma de intermediação</strong> e um <strong>hospedeiro de conteúdo</strong>. Fornecemos um espaço digital permitindo aos Prestadores apresentar os seus serviços e aos Utilizadores descobri-los e contactá-los.</p>
<p class="mt-4"><strong>A Felora não fornece diretamente serviços de escort, serviços sexuais ou encontros.</strong> Não somos parte das transações, acordos ou encontros que possam ocorrer entre Utilizadores e Prestadores.</p>
<p class="mt-4">Os Prestadores agem em <strong>total independência</strong>. Fixam livremente as suas tarifas, disponibilidades, condições de prestação e são os únicos responsáveis pela prestação, qualidade e legalidade dos seus serviços.</p>
<p class="mt-4">A Felora age como <strong>hospedeiro nos termos da lei suíça</strong> e não exerce qualquer controlo prévio sobre os conteúdos publicados pelos Prestadores, ressalvadas as obrigações legais de moderação e denúncia.</p>` },
  section5: { content: `<div class="space-y-4">
  <div><h3 class="text-xl font-semibold text-white mb-2">5.1. Registo de Utilizadores</h3>
    <p>Para aceder a certas funcionalidades (mensagens, favoritos, presentes virtuais, etc.), deve criar uma conta fornecendo:</p>
    <ul class="list-disc pl-6 space-y-1 mt-2">
      <li>Um endereço de e-mail válido,</li>
      <li>Uma palavra-passe segura,</li>
      <li>A sua aceitação dos T&C e da Declaração de Proteção de Dados.</li>
    </ul>
    <p class="mt-2">É responsável pela confidencialidade das suas credenciais e de qualquer atividade efetuada a partir da sua conta.</p>
  </div>
  <div><h3 class="text-xl font-semibold text-white mb-2">5.2. Registo e verificação dos Prestadores</h3>
    <p>Os Prestadores devem obrigatoriamente:</p>
    <ul class="list-disc pl-6 space-y-1 mt-2">
      <li>Criar uma conta profissional,</li>
      <li>Fornecer uma cópia de um <strong>documento de identidade oficial</strong> (cartão de cidadão, passaporte),</li>
      <li>Realizar uma <strong>verificação de identidade (KYC – Know Your Customer)</strong> para garantir que são maiores e agem legalmente,</li>
      <li>Aceitar os T&C específicos para Prestadores e o Código de Conduta.</li>
    </ul>
    <p class="mt-2">A Felora reserva-se o direito de recusar, suspender ou eliminar qualquer conta de Prestador em caso de não conformidade, declaração falsa ou comportamento contrário aos T&C.</p>
  </div>
</div>` },
  section6: { content: `<div class="space-y-4">
  <div><h3 class="text-xl font-semibold text-white mb-2">6.1. Obrigações comuns</h3>
    <p>Compromete-se a:</p>
    <ul class="list-disc pl-6 space-y-1 mt-2">
      <li>Não violar as leis em vigor (nomeadamente em matéria de prostituição, tráfico de seres humanos, proteção de menores, discriminação, etc.),</li>
      <li>Respeitar os direitos de outrem (privacidade, propriedade intelectual, dignidade, etc.),</li>
      <li>Não publicar conteúdos ilegais, difamatórios, violentos, de ódio, pedopornográficos ou que incitem ao ódio,</li>
      <li>Não usurpar a identidade de outrem ou criar perfis falsos,</li>
      <li>Não utilizar a Plataforma para fins fraudulentos, assédio, spam ou burla,</li>
      <li>Não tentar contornar as medidas de segurança ou aceder ilegalmente a dados.</li>
    </ul>
  </div>
  <div><h3 class="text-xl font-semibold text-white mb-2">6.2. Obrigações específicas dos Prestadores</h3>
    <ul class="list-disc pl-6 space-y-1">
      <li>Garantir que exerce <strong>legalmente e voluntariamente</strong> a sua atividade,</li>
      <li>Respeitar as leis locais em matéria de prostituição, saúde pública e fiscalidade,</li>
      <li>Não ser vítima de tráfico de seres humanos, lenocínio ou exploração sexual,</li>
      <li>Publicar conteúdos verídicos e não induzir os Utilizadores em erro (fotos recentes, descrições honestas, tarifas claras),</li>
      <li>Respeitar as regras de decência e moderação da Felora,</li>
      <li>Declarar os seus rendimentos em conformidade com a legislação fiscal aplicável.</li>
    </ul>
  </div>
</div>` },
  section7: { content: `<p>A Felora propõe um sistema de <strong>moeda virtual</strong> (créditos, fichas, etc.) permitindo aos Utilizadores comprar presentes virtuais, aceder a conteúdos premium ou interagir de forma privilegiada com os Prestadores.</p>
<ul class="list-disc pl-6 space-y-2 mt-4">
  <li><strong>Compra de créditos</strong>: Os créditos podem ser comprados através de meios de pagamento seguros (cartões bancários, PayPal, criptomoedas).</li>
  <li><strong>Utilização</strong>: Os créditos não são reembolsáveis e não têm qualquer valor monetário real. Só podem ser utilizados na Plataforma.</li>
  <li><strong>Presentes virtuais</strong>: Os Utilizadores podem enviar presentes virtuais aos Prestadores (flores, champanhe, joias virtuais, etc.). Os Prestadores recebem uma parte do valor sob forma de receitas (após dedução da comissão Felora).</li>
  <li><strong>Expiração</strong>: Os créditos podem ter uma duração de validade limitada (indicada aquando da compra).</li>
</ul>
<p class="mt-4"><em>Os créditos e presentes virtuais não constituem de forma alguma um pagamento por serviços sexuais. Destinam-se exclusivamente à utilização de funcionalidades digitais na Plataforma.</em></p>` },
  section8: { content: `<div class="space-y-4">
  <div><h3 class="text-xl font-semibold text-white mb-2">8.1. Subscrições Premium</h3>
    <p>A Felora propõe <strong>subscrições premium</strong> (mensais, trimestrais, anuais) oferecendo vantagens suplementares (perfil em destaque, acesso antecipado a novidades, mensagens ilimitadas, estatísticas avançadas, etc.).</p>
    <p class="mt-2">As subscrições são pagas e renováveis automaticamente salvo rescisão antecipada.</p>
  </div>
  <div><h3 class="text-xl font-semibold text-white mb-2">8.2. Comissão sobre receitas dos Prestadores</h3>
    <p>A Felora cobra uma <strong>comissão</strong> sobre as receitas geradas pelos Prestadores através da Plataforma (presentes virtuais, subscrições de fãs, conteúdos pagos, etc.). A taxa de comissão está indicada nas condições específicas para Prestadores.</p>
  </div>
  <div><h3 class="text-xl font-semibold text-white mb-2">8.3. Reembolsos</h3>
    <p>As compras de créditos, subscrições e presentes virtuais são <strong>firmes e definitivas</strong>. Nenhum reembolso é concedido exceto:</p>
    <ul class="list-disc pl-6 space-y-1 mt-2">
      <li>Erro técnico comprovado imputável à Felora,</li>
      <li>Obrigação legal (direito de retratação aplicável segundo a lei suíça ou europeia).</li>
    </ul>
  </div>
</div>` },
  section9: { content: `<p>Todos os elementos da Plataforma (logótipo, carta gráfica, código-fonte, textos, vídeos, designs, funcionalidades, etc.) são <strong>propriedade exclusiva da Felora</strong> ou dos seus parceiros e estão protegidos pelas leis sobre propriedade intelectual (direito de autor, marcas, patentes, etc.).</p>
<p class="mt-4"><strong>Licença de utilização:</strong> A Felora concede-lhe uma licença <strong>não exclusiva, intransferível e revogável</strong> para utilizar a Plataforma para fins pessoais e não comerciais.</p>
<p class="mt-4"><strong>Conteúdos publicados pelos Prestadores:</strong> Ao publicar conteúdos na Felora, concede à Felora uma <strong>licença mundial, gratuita, não exclusiva</strong> de utilizar, reproduzir, modificar, exibir e distribuir os seus conteúdos na Plataforma e para fins promocionais (sob reserva do respeito da sua privacidade e dos seus direitos).</p>
<p class="mt-4">Garante que detém todos os direitos sobre os conteúdos que publica e que não violam nenhum direito de terceiros.</p>` },
  section10: { content: `<div class="space-y-4">
  <div><h3 class="text-xl font-semibold text-white mb-2">10.1. Moderação de conteúdos</h3>
    <p>A Felora reserva-se o direito de <strong>moderar, eliminar ou recusar</strong> qualquer conteúdo que:</p>
    <ul class="list-disc pl-6 space-y-1 mt-2">
      <li>Viole os T&C, a lei ou os bons costumes,</li>
      <li>Seja denunciado pela comunidade como inapropriado,</li>
      <li>Apresente um risco para a segurança, dignidade ou direitos de outrem.</li>
    </ul>
  </div>
  <div><h3 class="text-xl font-semibold text-white mb-2">10.2. Denúncia</h3>
    <p>Qualquer Utilizador pode denunciar um conteúdo ou perfil suspeito através do <strong>botão de denúncia</strong> presente em cada perfil e conteúdo. As denúncias são tratadas no menor prazo pela nossa equipa de moderação.</p>
  </div>
  <div><h3 class="text-xl font-semibold text-white mb-2">10.3. Luta contra o tráfico de seres humanos e exploração sexual</h3>
    <p>A Felora condena firmemente qualquer forma de <strong>tráfico de seres humanos, lenocínio, exploração sexual ou trabalho forçado</strong>. Colaboramos ativamente com as autoridades competentes para prevenir e denunciar tais atos.</p>
    <p class="mt-2">Se tiver conhecimento ou suspeita de tais atividades, contacte-nos imediatamente em: <a href="mailto:info@felora.ch" class="text-pink-400 hover:text-pink-300">info@felora.ch</a> ou denuncie o perfil em questão.</p>
  </div>
</div>` },
  section11: { content: `<p>A Felora age como <strong>intermediário técnico</strong> e <strong>hospedeiro</strong>. Nesta qualidade:</p>
<ul class="list-disc pl-6 space-y-2 mt-4">
  <li>Não somos <strong>responsáveis</strong> pelos conteúdos publicados pelos Prestadores (descrições, fotos, vídeos, tarifas, disponibilidades),</li>
  <li>Não somos <strong>responsáveis</strong> pelas transações, acordos ou encontros entre Utilizadores e Prestadores,</li>
  <li>Não garantimos a veracidade, qualidade, segurança ou legalidade dos serviços propostos pelos Prestadores,</li>
  <li>Não somos <strong>responsáveis</strong> pelos danos diretos ou indiretos resultantes da utilização da Plataforma, salvo culpa grave ou intencional da nossa parte.</li>
</ul>
<p class="mt-4"><strong>Disponibilidade da Plataforma:</strong> Esforçamo-nos por assegurar uma disponibilidade máxima da Plataforma, mas não garantimos um acesso ininterrupto. Podem ocorrer manutenções, falhas ou interrupções.</p>
<p class="mt-4"><strong>Limitação de responsabilidade:</strong> Nos limites autorizados pela lei, a responsabilidade da Felora é limitada ao montante das somas efetivamente recebidas do Utilizador ou Prestador nos últimos 12 meses.</p>` },
  section12: { content: `<p>É responsável pela <strong>confidencialidade das suas credenciais</strong> (endereço de e-mail, palavra-passe). Deve:</p>
<ul class="list-disc pl-6 space-y-1 mt-4">
  <li>Escolher uma palavra-passe forte e única,</li>
  <li>Nunca partilhar as suas credenciais com terceiros,</li>
  <li>Informar-nos imediatamente em caso de utilização não autorizada da sua conta.</li>
</ul>
<p class="mt-4">A Felora implementa medidas de segurança para proteger os seus dados (encriptação, HTTPS, autenticação de dois fatores opcional), mas nenhum sistema é infalível. Reconhece os riscos inerentes à utilização da Internet.</p>` },
  section13: { content: `<div class="space-y-4">
  <div><h3 class="text-xl font-semibold text-white mb-2">13.1. Duração</h3>
    <p>Os presentes T&C aplicam-se enquanto utilizar a Plataforma. A sua conta permanece ativa até à sua eliminação ou rescisão.</p>
  </div>
  <div><h3 class="text-xl font-semibold text-white mb-2">13.2. Suspensão ou rescisão pela Felora</h3>
    <p>A Felora reserva-se o direito de suspender ou eliminar a sua conta a qualquer momento, sem aviso prévio nem indemnização, em caso de:</p>
    <ul class="list-disc pl-6 space-y-1 mt-2">
      <li>Violação dos T&C,</li>
      <li>Atividade fraudulenta, ilegal ou prejudicial,</li>
      <li>Declaração falsa (idade, identidade, etc.),</li>
      <li>Não cumprimento das obrigações de pagamento,</li>
      <li>Comportamento contrário aos valores da Felora ou à segurança da comunidade.</li>
    </ul>
  </div>
  <div><h3 class="text-xl font-semibold text-white mb-2">13.3. Rescisão pelo Utilizador ou Prestador</h3>
    <p>Pode eliminar a sua conta a qualquer momento a partir das definições do seu perfil. A eliminação é definitiva e implica a perda de todos os seus dados (mensagens, créditos não utilizados, histórico, etc.).</p>
  </div>
</div>` },
  section14: { content: `<p>A recolha, utilização e proteção dos seus dados pessoais são regidas pela nossa <strong><a href="/legal/privacy" class="text-pink-400 hover:text-pink-300">Declaração de Proteção de Dados</a></strong>, que faz parte integrante dos presentes T&C.</p>
<p class="mt-4">Ao utilizar a Plataforma, aceita as modalidades de tratamento dos seus dados tal como descritas nesta Declaração, em conformidade com a <strong>Lei federal suíça sobre a proteção de dados (LPD)</strong>.</p>` },
  section15: { content: `<p>A Felora reserva-se o direito de modificar os presentes T&C a qualquer momento, nomeadamente em caso de evolução dos nossos serviços, das nossas práticas ou da legislação aplicável.</p>
<p class="mt-4">Qualquer modificação substancial será comunicada através de:</p>
<ul class="list-disc pl-6 space-y-1 mt-2">
  <li>Uma notificação na Plataforma (banner, pop-up),</li>
  <li>Um e-mail para o endereço associado à sua conta.</li>
</ul>
<p class="mt-4">A versão atualizada entrará em vigor após a sua publicação na Plataforma, salvo indicação contrária. Ao continuar a utilizar a Plataforma após modificação, aceita os novos T&C. Se não aceitar as modificações, deve cessar de utilizar a Plataforma e eliminar a sua conta.</p>` },
  section16: { content: `<p>Os presentes T&C são regidos pelo <strong>direito suíço</strong>.</p>
<p class="mt-4">Qualquer litígio relativo à interpretação, execução ou validade dos T&C será submetido à competência exclusiva dos tribunais do cantão da <strong>sede da Felora</strong> (ou, conforme os casos, aos tribunais competentes na Suíça), salvo disposição imperativa contrária.</p>
<p class="mt-4"><strong>Mediação:</strong> Antes de qualquer recurso judicial, as partes esforçar-se-ão por resolver o seu litígio amigavelmente através de mediação ou conciliação.</p>
<p class="mt-4"><strong>Contacto para litígios:</strong> <a href="mailto:info@felora.ch" class="text-pink-400 hover:text-pink-300">info@felora.ch</a></p>` }
}

// Appliquer PT
console.log('🇵🇹 TRADUCTION PORTUGAIS...')
const pt = JSON.parse(readFileSync('src/messages/pt.json', 'utf-8'))
for (let i = 3; i <= 16; i++) {
  if (PT_TERMS[`section${i}`]) {
    pt.legal.terms[`section${i}`].content = PT_TERMS[`section${i}`].content
    console.log(`✅ PT section ${i}`)
  }
}
writeFileSync('src/messages/pt.json', JSON.stringify(pt, null, 2) + '\n')
console.log('🎉 PORTUGAIS TERMS COMPLÉTÉ!\n')

console.log('✅✅✅ TOUTES LES TRADUCTIONS TERMS TERMINÉES!')
console.log('IT, PT: sections 3-16 traduites manuellement')
console.log('RU, AR, SQ: à faire ensuite (je continue...)')
