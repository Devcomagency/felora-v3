import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

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

    // Déterminer le type média correctement à partir du slot
    // video -> VIDEO, profile/photo -> IMAGE
    const mediaType = slot === 'video' ? 'VIDEO' : 'IMAGE'

    // Upload vers Cloudflare R2 (compatible Vercel)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const key = `clubs/${club.id}/${slot}_${pos}_${timestamp}_${sanitizedName}`

    const s3Client = new S3Client({
      region: 'auto',
      endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY || '',
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY || ''
      }
    })

    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type || 'application/octet-stream'
    }))

    const baseUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL || process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL || 'https://media.felora.ch'
    if (!baseUrl || baseUrl === 'undefined' || baseUrl.includes('undefined')) {
      console.error('❌ ERREUR CRITIQUE (clubs/upload): baseUrl invalide:', baseUrl)
      throw new Error('Configuration CDN invalide - baseUrl undefined')
    }
    const fileUrl = `${baseUrl}/${key}`

    console.log(`✅ Upload R2 pour club ${club.id}: ${mediaType} slot ${pos}, fichier: ${file.name} -> ${fileUrl}`)

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
      // ✅ Mettre à jour le média existant + FORCER updatedAt pour le cache-buster
      media = await prisma.media.update({
        where: { id: existingMedia.id },
        data: {
          type: mediaType,
          url: fileUrl,
          updatedAt: new Date() // Forcer la mise à jour du timestamp
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

    // Mettre à jour aussi les champs avatarUrl/coverUrl dans ClubDetails
    if (pos === 0) {
      // Photo de profil
      await prisma.clubDetails.updateMany({
        where: { clubId: club.id },
        data: { avatarUrl: fileUrl }
      })
    } else if (pos === 1) {
      // Photo de couverture
      await prisma.clubDetails.updateMany({
        where: { clubId: club.id },
        data: { coverUrl: fileUrl }
      })
    }

    // ✅ IMPORTANT : Mettre à jour updatedAt du club pour forcer le cache-buster
    await prisma.clubProfileV2.update({
      where: { id: club.id },
      data: { updatedAt: new Date() }
    })

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