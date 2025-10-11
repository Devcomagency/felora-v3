const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkDuplicates() {
  try {
    console.log('🔍 Vérification des conversations en double...\n')

    const conversations = await prisma.e2EEConversation.findMany({
      orderBy: { createdAt: 'desc' }
    })

    console.log(`📊 Total de conversations : ${conversations.length}\n`)

    // Grouper les conversations par participants
    const groupedByParticipants = new Map()

    for (const conv of conversations) {
      const participants = conv.participants
      if (!Array.isArray(participants)) continue

      // Créer une clé unique basée sur les participants triés
      const key = [...participants].sort().join('-')

      if (!groupedByParticipants.has(key)) {
        groupedByParticipants.set(key, [])
      }
      groupedByParticipants.get(key).push(conv)
    }

    // Afficher les doublons
    let duplicatesFound = 0
    for (const [key, convs] of groupedByParticipants.entries()) {
      if (convs.length > 1) {
        duplicatesFound++
        console.log(`\n❌ DOUBLON trouvé pour les participants : ${key}`)
        console.log(`   Nombre de conversations : ${convs.length}`)
        convs.forEach((conv, idx) => {
          console.log(`   ${idx + 1}. ID: ${conv.id} | Créée le: ${conv.createdAt.toISOString()}`)
        })
      }
    }

    if (duplicatesFound === 0) {
      console.log('\n✅ Aucun doublon trouvé !')
    } else {
      console.log(`\n\n⚠️  ${duplicatesFound} groupe(s) de conversations en double trouvé(s)`)
      console.log('\n💡 Pour nettoyer, gardez la conversation la plus récente et supprimez les autres.')
    }

    // Afficher toutes les conversations
    console.log('\n\n📋 Liste de toutes les conversations :')
    for (const conv of conversations) {
      const participants = Array.isArray(conv.participants) ? conv.participants.join(', ') : 'N/A'
      console.log(`\n  ID: ${conv.id}`)
      console.log(`  Participants: ${participants}`)
      console.log(`  Créée le: ${conv.createdAt.toISOString()}`)
      console.log(`  ParticipantsKey: ${conv.participantsKey || 'N/A'}`)
    }

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDuplicates()
