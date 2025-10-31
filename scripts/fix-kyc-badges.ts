#!/usr/bin/env tsx
/**
 * Script pour attribuer les badges de vérification aux profils
 * qui ont une KYC approuvée mais pas encore le badge
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Recherche des soumissions KYC approuvées...')

  // Trouver toutes les soumissions KYC approuvées
  const approvedSubmissions = await prisma.kycSubmission.findMany({
    where: { status: 'APPROVED' },
    select: {
      id: true,
      userId: true,
      role: true,
      updatedAt: true
    },
    orderBy: { updatedAt: 'desc' }
  })

  console.log(`✅ ${approvedSubmissions.length} soumissions KYC approuvées trouvées`)

  // Grouper par userId (garder la plus récente pour chaque user)
  const userMap = new Map<string, typeof approvedSubmissions[0]>()

  for (const sub of approvedSubmissions) {
    const existing = userMap.get(sub.userId)
    if (!existing || sub.updatedAt > existing.updatedAt) {
      userMap.set(sub.userId, sub)
    }
  }

  console.log(`👥 ${userMap.size} utilisateurs uniques avec KYC approuvée`)

  let escortsFixed = 0
  let clubsFixed = 0

  for (const [userId, submission] of userMap.entries()) {
    if (submission.role === 'ESCORT') {
      // Vérifier si le profil escort a déjà le badge
      const profile = await prisma.escortProfile.findFirst({
        where: { userId },
        select: { id: true, isVerifiedBadge: true, stageName: true }
      })

      if (profile && !profile.isVerifiedBadge) {
        // Attribuer le badge
        await prisma.escortProfile.update({
          where: { id: profile.id },
          data: { isVerifiedBadge: true }
        })
        console.log(`✅ Badge attribué à l'escort: ${profile.stageName || userId}`)
        escortsFixed++
      }
    } else if (submission.role === 'CLUB') {
      // Vérifier si le profil club a déjà le badge
      const profile = await prisma.clubProfileV2.findFirst({
        where: { userId },
        select: { id: true, verified: true, companyName: true }
      })

      if (profile && !profile.verified) {
        // Attribuer le badge
        await prisma.clubProfileV2.update({
          where: { id: profile.id },
          data: { verified: true }
        })
        console.log(`✅ Badge attribué au club: ${profile.companyName || userId}`)
        clubsFixed++
      }
    }
  }

  console.log('\n📊 Résumé:')
  console.log(`   - Escorts corrigés: ${escortsFixed}`)
  console.log(`   - Clubs corrigés: ${clubsFixed}`)
  console.log(`   - Total: ${escortsFixed + clubsFixed}`)
  console.log('\n✅ Script terminé!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
