import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Récupérer le profil club
    const club = await prisma.clubProfileV2.findUnique({
      where: { userId: session.user.id }
    })

    if (!club) {
      return NextResponse.json(
        { success: false, error: 'Profil club non trouvé' },
        { status: 404 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const slot = formData.get('slot') as string
    const slotIndex = formData.get('slotIndex') as string

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Fichier manquant' },
        { status: 400 }
      )
    }

    // Convertir slotIndex en nombre
    const pos = parseInt(slotIndex, 10)
    if (isNaN(pos) || pos < 0 || pos > 4) {
      return NextResponse.json(
        { success: false, error: 'Position invalide (0-4 requis)' },
        { status: 400 }
      )
    }

    // Déterminer le type de média
    const mediaType = slot === 'image' ? 'IMAGE' : 'VIDEO'

    // Sauvegarder le fichier réellement sur le disque
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Créer un nom de fichier unique
    const timestamp = Date.now()
    const fileName = `${club.id}_${slot}_${pos}_${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const filePath = path.join(process.cwd(), 'public', 'uploads', 'clubs', fileName)

    // Sauvegarder le fichier
    await writeFile(filePath, buffer)

    // Créer l'URL locale
    const fileUrl = `/uploads/clubs/${fileName}`

    console.log(`✅ Upload RÉEL pour club ${club.id}: ${mediaType} slot ${pos}, fichier: ${file.name} -> ${filePath}`)

    // Chercher s'il existe déjà un média pour cette position
    const existingMedia = await prisma.media.findFirst({
      where: {
        ownerType: 'CLUB',
        ownerId: club.id,
        pos: pos
      }
    })

    let media
    if (existingMedia) {
      // Mettre à jour le média existant
      media = await prisma.media.update({
        where: { id: existingMedia.id },
        data: {
          type: mediaType,
          url: fileUrl
        }
      })
    } else {
      // Créer un nouveau média
      media = await prisma.media.create({
        data: {
          ownerType: 'CLUB',
          ownerId: club.id,
          type: mediaType,
          url: fileUrl,
          pos: pos,
          visibility: 'PUBLIC'
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Média sauvegardé avec succès',
      url: media.url,
      id: media.id,
      pos: media.pos,
      type: media.type
    })

  } catch (error) {
    console.error('Erreur upload média club:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}