import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function enableEmailNotifications() {
  try {
    const result = await prisma.user.updateMany({
      where: {
        email: 'felorafelorafelora60@gmail.com'
      },
      data: {
        emailNotifications: true
      }
    })

    console.log('✅ Email notifications activées pour felorafelorafelora60@gmail.com')
    console.log('Nombre d\'utilisateurs mis à jour:', result.count)

    // Vérifier
    const user = await prisma.user.findFirst({
      where: { email: 'felorafelorafelora60@gmail.com' },
      select: { email: true, emailNotifications: true }
    })

    console.log('État actuel:', user)
  } catch (error) {
    console.error('Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

enableEmailNotifications()
