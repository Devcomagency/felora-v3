#!/usr/bin/env tsx
/**
 * Script pour vérifier l'état KYC d'un utilisateur spécifique
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const userEmail = 'recrutementsignature099@gmail.com'

  console.log(`🔍 Recherche de l'utilisateur: ${userEmail}`)

  // Trouver l'utilisateur
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    select: {
      id: true,
      email: true,
      name: true,
      role: true
    }
  })

  if (!user) {
    console.log('❌ Utilisateur non trouvé')
    return
  }

  console.log('\n👤 Utilisateur:')
  console.log(`   ID: ${user.id}`)
  console.log(`   Email: ${user.email}`)
  console.log(`   Nom: ${user.name}`)
  console.log(`   Rôle: ${user.role}`)

  // Trouver toutes les soumissions KYC
  const submissions = await prisma.kycSubmission.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      status: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      reviewedAt: true,
      reviewerId: true
    }
  })

  console.log(`\n📋 Soumissions KYC: ${submissions.length}`)
  submissions.forEach((sub, i) => {
    console.log(`\n   ${i + 1}. Soumission ${sub.id.slice(0, 8)}...`)
    console.log(`      Statut: ${sub.status}`)
    console.log(`      Rôle: ${sub.role}`)
    console.log(`      Créée le: ${sub.createdAt.toLocaleString('fr-FR')}`)
    console.log(`      Mise à jour: ${sub.updatedAt.toLocaleString('fr-FR')}`)
    console.log(`      Reviewer: ${sub.reviewerId || 'Aucun'}`)
    console.log(`      Reviewed at: ${sub.reviewedAt ? sub.reviewedAt.toLocaleString('fr-FR') : 'Non'}`)
  })

  // Trouver le profil escort
  const escortProfile = await prisma.escortProfile.findFirst({
    where: { userId: user.id },
    select: {
      id: true,
      stageName: true,
      isVerifiedBadge: true
    }
  })

  console.log('\n🎭 Profil Escort:')
  if (escortProfile) {
    console.log(`   ID: ${escortProfile.id}`)
    console.log(`   Nom de scène: ${escortProfile.stageName || 'Non défini'}`)
    console.log(`   Badge vérifié: ${escortProfile.isVerifiedBadge ? '✅ OUI' : '❌ NON'}`)
  } else {
    console.log('   ❌ Aucun profil escort trouvé')
  }

  // Quelle devrait être la soumission affichée ?
  const latestByUpdated = submissions.sort((a, b) =>
    b.updatedAt.getTime() - a.updatedAt.getTime()
  )[0]

  const latestByCreated = submissions.sort((a, b) =>
    b.createdAt.getTime() - a.createdAt.getTime()
  )[0]

  console.log('\n📊 Analyse:')
  console.log(`   Dernière soumission (par updatedAt): ${latestByUpdated?.status || 'Aucune'}`)
  console.log(`   Dernière soumission (par createdAt): ${latestByCreated?.status || 'Aucune'}`)

  if (latestByUpdated && latestByUpdated.status === 'APPROVED' && escortProfile && !escortProfile.isVerifiedBadge) {
    console.log('\n⚠️  PROBLÈME DÉTECTÉ:')
    console.log('   La KYC est APPROVED mais le profil n\'a pas le badge!')
    console.log('\n🔧 Correction...')

    await prisma.escortProfile.update({
      where: { id: escortProfile.id },
      data: { isVerifiedBadge: true }
    })

    console.log('✅ Badge attribué!')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
