import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkKYCNotificationHistory() {
  try {
    console.log('🔍 Vérification de l\'historique KYC et notifications pour recrutementsignature099\n')

    // 1. Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: 'recrutementsignature099@gmail.com' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        escortProfile: {
          select: {
            id: true,
            stageName: true,
            isVerifiedBadge: true
          }
        }
      }
    })

    if (!user) {
      console.log('❌ Utilisateur non trouvé')
      return
    }

    console.log('👤 UTILISATEUR TROUVÉ:')
    console.log('  - ID:', user.id)
    console.log('  - Email:', user.email)
    console.log('  - Nom:', user.name || 'N/A')
    console.log('  - Badge vérifié:', user.escortProfile?.isVerifiedBadge ? '✅ OUI' : '❌ NON')
    console.log()

    // 2. Récupérer TOUTES les soumissions KYC
    const submissions = await prisma.kycSubmission.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        reviewerId: true,
        reviewedAt: true,
        rejectionReason: true,
        notes: true,
        docFrontUrl: true,
        docBackUrl: true,
        selfieSignUrl: true,
        livenessVideoUrl: true
      }
    })

    console.log(`📋 SOUMISSIONS KYC (${submissions.length} total):`)
    submissions.forEach((sub, index) => {
      console.log(`\n  ${index + 1}. Soumission ID: ${sub.id.substring(0, 12)}...`)
      console.log(`     Statut: ${sub.status}`)
      console.log(`     Créé le: ${sub.createdAt.toLocaleString('fr-FR')}`)
      console.log(`     Modifié le: ${sub.updatedAt.toLocaleString('fr-FR')}`)
      console.log(`     Reviewer ID: ${sub.reviewerId || 'N/A'}`)
      console.log(`     Reviewed at: ${sub.reviewedAt?.toLocaleString('fr-FR') || 'N/A'}`)
      console.log(`     Raison rejet: ${sub.rejectionReason || 'N/A'}`)
      console.log(`     Notes: ${sub.notes || 'N/A'}`)
      console.log(`     Documents:`)
      console.log(`       - Front: ${sub.docFrontUrl ? '✅' : '❌ NULL'}`)
      console.log(`       - Back: ${sub.docBackUrl ? '✅' : '❌ NULL'}`)
      console.log(`       - Selfie: ${sub.selfieSignUrl ? '✅' : '❌ NULL'}`)
      console.log(`       - Video: ${sub.livenessVideoUrl ? '✅' : '❌ NULL'}`)
    })

    // 3. Récupérer TOUTES les notifications KYC de cet utilisateur
    const notifications = await prisma.notification.findMany({
      where: {
        userId: user.id,
        OR: [
          { type: 'KYC_APPROVED' },
          { type: 'KYC_REJECTED' }
        ]
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log(`\n\n📬 NOTIFICATIONS KYC (${notifications.length} total):`)
    notifications.forEach((notif, index) => {
      console.log(`\n  ${index + 1}. Notification ID: ${notif.id.substring(0, 12)}...`)
      console.log(`     Type: ${notif.type}`)
      console.log(`     Titre: ${notif.title}`)
      console.log(`     Message: ${notif.message}`)
      console.log(`     Créé le: ${notif.createdAt.toLocaleString('fr-FR')}`)
      console.log(`     Lu: ${notif.read ? '✅' : '❌'}`)
      console.log(`     Lien: ${notif.link || 'N/A'}`)
    })

    // 4. CONCLUSION
    console.log('\n\n📊 CONCLUSION:')
    const latestSubmission = submissions[0]
    const latestNotification = notifications[0]

    console.log(`  État actuel de la soumission KYC: ${latestSubmission?.status || 'AUCUNE'}`)
    console.log(`  Badge attribué: ${user.escortProfile?.isVerifiedBadge ? '✅ OUI' : '❌ NON'}`)
    console.log(`  Dernière notification envoyée: ${latestNotification?.type || 'AUCUNE'}`)

    if (latestSubmission?.status === 'REJECTED' && user.escortProfile?.isVerifiedBadge === false) {
      console.log('\n  ✅ COHÉRENT - Le compte est bien rejeté sans badge')
    } else if (latestSubmission?.status === 'APPROVED' && user.escortProfile?.isVerifiedBadge === true) {
      console.log('\n  ✅ COHÉRENT - Le compte est bien approuvé avec badge')
    } else if (latestSubmission?.status === 'APPROVED' && user.escortProfile?.isVerifiedBadge === false) {
      console.log('\n  ⚠️ INCOHÉRENCE - Approuvé mais pas de badge !')
      console.log('  🔧 Action recommandée: Attribuer le badge manuellement')
    } else if (latestSubmission?.status === 'REJECTED' && user.escortProfile?.isVerifiedBadge === true) {
      console.log('\n  ⚠️ INCOHÉRENCE - Rejeté mais badge attribué !')
      console.log('  🔧 Action recommandée: Retirer le badge')
    }

    if (latestNotification?.type === 'KYC_APPROVED' && latestSubmission?.status === 'REJECTED') {
      console.log('\n  ⚠️ DISCORDANCE - Notification d\'approbation mais statut rejeté !')
      console.log('  💡 Explication possible: Une approbation a eu lieu suivie d\'un rejet ultérieur')
    }

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkKYCNotificationHistory()
