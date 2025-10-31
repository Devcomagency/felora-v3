import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkSubmissionId() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'recrutementsignature099@gmail.com' },
      select: { id: true }
    })

    if (!user) {
      console.log('❌ Utilisateur non trouvé')
      return
    }

    const submissions = await prisma.kycSubmission.findMany({
      where: { userId: user.id }
    })

    console.log(`📋 Soumissions pour ${user.id}:\n`)
    submissions.forEach((sub, i) => {
      console.log(`${i + 1}. ID de la soumission:`)
      console.log(`   Brut: "${sub.id}"`)
      console.log(`   Longueur: ${sub.id.length}`)
      console.log(`   Contient "_ESCORT": ${sub.id.includes('_ESCORT')}`)
      console.log(`   userId: "${sub.userId}"`)
      console.log(`   role: "${sub.role}"`)
      console.log(`   status: "${sub.status}"`)
      console.log()
    })

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkSubmissionId()
