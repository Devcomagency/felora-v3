import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { ESCORT_SUBSCRIPTION_PLANS, getSubscriptionPlan, calculateEndDate } from '@/lib/subscription-plans'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    console.log('Données reçues:', JSON.stringify(data, null, 2))
    
    const {
      accountType,
      email,
      password,
      firstName,
      lastName,
      phone,
      stageName,
      age,
      city,
      subscriptionPlan,
      companyName,
      siret,
      // Champs spécifiques aux salons suisses
      ideNumber,
      vatNumber,
      legalForm,
      canton,
      openingHours,
      businessName,
      address,
      postalCode,
      managerFirstName,
      managerLastName,
      managerEmail,
      description,
      services,
      capacity,
      website
    } = data

    // Validation de base
    if (!email || !password || !accountType) {
      console.log('Validation échouée: champs manquants', { email: !!email, password: !!password, accountType: !!accountType })
      return NextResponse.json(
        { error: 'Email, mot de passe et type de compte requis' },
        { status: 400 }
      )
    }

    // Validation du type de compte
    const validAccountTypes = ['client', 'escort', 'salon', 'club']
    if (!validAccountTypes.includes(accountType)) {
      return NextResponse.json(
        { error: 'Type de compte invalide' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      )
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: {
        salonProfile: true,
        escortProfile: true,
        profile: true
      }
    })

    if (existingUser) {
      // Si l'utilisateur existe mais n'a pas de profil salon (inscription incomplète)
      if (accountType === 'salon' && !existingUser.salonProfile) {
        console.log('Utilisateur existe mais sans profil salon, on supprime et recréé')
        // Supprimer l'utilisateur incomplet et recréer
        await prisma.user.delete({
          where: { id: existingUser.id }
        })
      } else {
        return NextResponse.json(
          { error: 'Un compte avec cet email existe déjà' },
          { status: 400 }
        )
      }
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    let user
    let redirectUrl = '/login?success=1'

    // Pour les salons, utiliser une transaction pour créer utilisateur + profil salon
    if (accountType === 'salon' || accountType === 'club') {
      // Validation pour les salons suisses
      if (ideNumber) {
        if (!companyName || !ideNumber || !legalForm || !canton) {
          return NextResponse.json(
            { error: 'Nom d\'entreprise, numéro IDE, forme juridique et canton requis pour les salons suisses' },
            { status: 400 }
          )
        }
      } else if (siret) {
        if (!companyName || !siret) {
          return NextResponse.json(
            { error: 'Nom d\'entreprise et SIRET requis' },
            { status: 400 }
          )
        }
      } else {
        return NextResponse.json(
          { error: 'Numéro d\'identification entreprise requis (IDE pour Suisse, SIRET pour France/Europe)' },
          { status: 400 }
        )
      }

      // Créer l'utilisateur salon en deux étapes pour éviter les problèmes Prisma
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: `${managerFirstName || firstName || ''} ${managerLastName || lastName || ''}`.trim() || email.split('@')[0],
          phone,
          role: accountType.toUpperCase() as 'CLIENT' | 'ESCORT' | 'SALON' | 'ADMIN'
        }
      })

      // Puis créer le profil salon
      await prisma.salonProfile.create({
        data: {
          userId: user.id,
          companyName: companyName || 'Nom à compléter',
          businessName: businessName || companyName || 'Nom à compléter',
          siret: siret || null,
          ideNumber: ideNumber || null,
          vatNumber: vatNumber || null,
          legalForm: legalForm || null,
          canton: canton || null,
          address: address || 'À compléter...',
          city: city || canton || 'À préciser',
          postalCode: postalCode || '0000',
          country: ideNumber ? 'CH' : 'FR',
          managerName: `${managerFirstName || firstName || ''} ${managerLastName || lastName || ''}`.trim() || 'Gestionnaire',
          managerEmail: managerEmail || email,
          phone: phone || 'À préciser',
          website: website || null,
          description: description || 'Profil en cours de configuration...',
          services: JSON.stringify(services || ['escorte', 'massage']),
          capacity: capacity || 10,
          openingHours: JSON.stringify(openingHours || {
            lundi: { open: '10:00', close: '22:00', closed: false },
            mardi: { open: '10:00', close: '22:00', closed: false },
            mercredi: { open: '10:00', close: '22:00', closed: false },
            jeudi: { open: '10:00', close: '22:00', closed: false },
            vendredi: { open: '10:00', close: '23:00', closed: false },
            samedi: { open: '10:00', close: '23:00', closed: false },
            dimanche: { open: '14:00', close: '22:00', closed: true }
          }),
          photos: JSON.stringify([]),
          managedEscorts: JSON.stringify([])
        }
      })
      
      redirectUrl = '/login?message=Inscription+salon+réussie+!+Connectez-vous+pour+accéder+à+votre+dashboard&redirect=/dashboard/salon'
    } else {
      // Création normale pour clients et escortes
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: `${firstName || ''} ${lastName || ''}`.trim() || email.split('@')[0],
          phone,
          role: accountType.toUpperCase() as 'CLIENT' | 'ESCORT' | 'SALON' | 'ADMIN'
        }
      })
    }

    // Pour les clients, créer le profil client
    if (accountType === 'client') {
      await prisma.clientProfile.create({
        data: {
          userId: user.id,
          firstName,
          lastName
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

      const plan = getSubscriptionPlan(subscriptionPlan as keyof typeof ESCORT_SUBSCRIPTION_PLANS)
      if (!plan) {
        return NextResponse.json(
          { error: 'Plan d\'abonnement invalide' },
          { status: 400 }
        )
      }

      // Créer le profil escorte
      await prisma.escortProfile.create({
        data: {
          userId: user.id,
          firstName,
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

      // Créer l'abonnement en attente de paiement
      const startDate = new Date()
      const endDate = calculateEndDate(startDate, subscriptionPlan as keyof typeof ESCORT_SUBSCRIPTION_PLANS)

      // Créer l'abonnement escorte
      try {
        await prisma.escortSubscription.create({
          data: {
            userId: user.id,
            plan: subscriptionPlan.toUpperCase() as 'TRIAL' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY',
            amount: plan.price,
            startDate,
            endDate,
            status: 'PENDING_PAYMENT'
          }
        })
        console.log('Abonnement escorte créé avec succès')
      } catch (subscriptionError) {
        console.error('Erreur création abonnement:', subscriptionError)
        // On continue sans bloquer l'inscription
      }

      // Redirection vers login avec message de succès
      redirectUrl = `/login?message=Inscription+escorte+réussie+!+Connectez-vous+avec+vos+identifiants&redirect=/escort/profile`
    }


    return NextResponse.json({
      success: true,
      message: 'Compte créé avec succès',
      checkoutUrl: redirectUrl,
      userId: user.id
    })

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du compte' },
      { status: 500 }
    )
  }
}
