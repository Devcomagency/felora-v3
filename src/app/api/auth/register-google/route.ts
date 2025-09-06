import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { accountType, stageName, age, city, subscriptionPlan, companyName, siret, pseudo } = await request.json()

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Session Google requise' },
        { status: 401 }
      )
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Utilisateur Google non trouvé' },
        { status: 404 }
      )
    }

    // Mettre à jour le rôle de l'utilisateur
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        role: accountType.toUpperCase() as 'CLIENT' | 'ESCORT' | 'SALON' | 'ADMIN',
        name: accountType === 'client' ? pseudo : session.user.name
      }
    })

    let redirectUrl = '/dashboard'

    // Pour les clients, créer le profil client
    if (accountType === 'client') {
      await prisma.clientProfile.create({
        data: {
          userId: existingUser.id,
          firstName: pseudo
        }
      })
    }

    // Pour les escortes, créer le profil et gérer l'abonnement
    if (accountType === 'escort') {
      if (!subscriptionPlan || !stageName || !age || !city) {
        return NextResponse.json(
          { error: 'Informations escorte incomplètes' },
          { status: 400 }
        )
      }

      // Créer le profil escorte
      await prisma.escortProfile.create({
        data: {
          userId: existingUser.id,
          firstName: session.user.name?.split(' ')[0] || 'Prénom',
          stageName,
          dateOfBirth: new Date(new Date().getFullYear() - age, 0, 1),
          nationality: 'CH',
          languages: JSON.stringify(['fr']),
          city,
          workingArea: JSON.stringify([city]),
          description: 'Profil en cours de configuration...',
          services: JSON.stringify([]),
          rates: JSON.stringify({}),
          availability: JSON.stringify({}),
          galleryPhotos: JSON.stringify([]),
          videos: JSON.stringify([])
        }
      })

      redirectUrl = `/subscription/success?plan=${subscriptionPlan}`
    }

    // Pour les salons/clubs, créer le profil salon
    if (accountType === 'salon' || accountType === 'club') {
      if (!companyName || !siret) {
        return NextResponse.json(
          { error: 'Nom d\'entreprise et SIRET requis' },
          { status: 400 }
        )
      }

      await prisma.salonProfile.create({
        data: {
          userId: existingUser.id,
          companyName,
          businessName: companyName,
          siret,
          address: 'À compléter...',
          city: city || 'À préciser',
          postalCode: '0000',
          country: 'CH',
          managerName: session.user.name || 'Manager',
          managerEmail: session.user.email,
          phone: 'À préciser',
          description: 'Profil en cours de configuration...',
          services: JSON.stringify(['escorte', 'massage']),
          capacity: 10,
          openingHours: JSON.stringify({
            lundi: { open: '10:00', close: '22:00' },
            mardi: { open: '10:00', close: '22:00' },
            mercredi: { open: '10:00', close: '22:00' },
            jeudi: { open: '10:00', close: '22:00' },
            vendredi: { open: '10:00', close: '23:00' },
            samedi: { open: '10:00', close: '23:00' },
            dimanche: { closed: true }
          }),
          photos: JSON.stringify([]),
          managedEscorts: JSON.stringify([])
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Profil Google créé avec succès',
      redirectUrl,
      userId: existingUser.id
    })

  } catch (error) {
    console.error('Erreur lors de l\'inscription Google:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du profil' },
      { status: 500 }
    )
  }
}