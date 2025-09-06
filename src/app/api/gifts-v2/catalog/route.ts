import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/gifts-v2/catalog
export async function GET(req: NextRequest) {
  try {
    const gifts = await prisma.giftCatalog.findMany({
      where: { active: true },
      orderBy: { price: 'asc' }
    })

    // Si aucun cadeau n'existe, créer les cadeaux par défaut
    if (gifts.length === 0) {
      const defaultGifts = [
        {
          code: 'HEART',
          name: 'Coeur',
          price: 10,
          lottieUrl: '/lottie/heart.json',
        },
        {
          code: 'DIAMOND',
          name: 'Diamant',
          price: 50,
          lottieUrl: '/lottie/diamond.json',
        },
        {
          code: 'FIREWORKS',
          name: 'Feux d\'artifice',
          price: 100,
          lottieUrl: '/lottie/fireworks.json',
        },
        {
          code: 'ROSE',
          name: 'Rose',
          price: 25,
          lottieUrl: '/lottie/rose.json',
        },
        {
          code: 'CROWN',
          name: 'Couronne',
          price: 200,
          lottieUrl: '/lottie/crown.json',
        }
      ]

      // Créer les cadeaux par défaut
      await prisma.giftCatalog.createMany({
        data: defaultGifts
      })

      // Récupérer à nouveau la liste
      const newGifts = await prisma.giftCatalog.findMany({
        where: { active: true },
        orderBy: { price: 'asc' }
      })

      return NextResponse.json({
        items: newGifts.map(gift => ({
          code: gift.code,
          name: gift.name,
          price: gift.price,
          lottieUrl: gift.lottieUrl
        }))
      })
    }

    return NextResponse.json({
      items: gifts.map(gift => ({
        code: gift.code,
        name: gift.name,
        price: gift.price,
        lottieUrl: gift.lottieUrl
      }))
    })

  } catch (e: any) {
    console.error('gifts-v2/catalog error:', e.message)
    return NextResponse.json({ error: 'erreur serveur' }, { status: 200 })
  }
}