const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function cleanOldMedia() {
  try {
    console.log('🧹 Nettoyage des anciens médias...\n')

    // Trouver tous les messages avec attachments
    const messagesWithMedia = await prisma.e2EEMessageEnvelope.findMany({
      where: {
        attachmentUrl: {
          not: null
        }
      }
    })

    console.log(`📊 Trouvé ${messagesWithMedia.length} messages avec médias\n`)

    if (messagesWithMedia.length === 0) {
      console.log('✅ Aucun média à nettoyer !')
      return
    }

    // Afficher les messages qui seront supprimés
    console.log('🗑️  Messages qui seront supprimés :')
    messagesWithMedia.forEach((msg, idx) => {
      console.log(`   ${idx + 1}. ID: ${msg.id} | Conversation: ${msg.conversationId} | URL: ${msg.attachmentUrl}`)
    })

    console.log('\n⚠️  Voulez-vous vraiment supprimer ces messages ? (Ctrl+C pour annuler)\n')

    // Attendre 3 secondes avant de supprimer
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Supprimer les messages
    const result = await prisma.e2EEMessageEnvelope.deleteMany({
      where: {
        attachmentUrl: {
          not: null
        }
      }
    })

    console.log(`\n✅ ${result.count} messages avec médias supprimés !`)
    console.log('\n💡 Les nouveaux médias que vous enverrez maintenant fonctionneront correctement.')

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanOldMedia()
