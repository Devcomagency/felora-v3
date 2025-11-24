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
    const positionParam = formData.get('position') as string
    const typeParam = formData.get('type') as string

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Fichier manquant' },
        { status: 400 }
      )
    }

    // Priorité à position (nouveau format feed) sinon slotIndex (ancien format slots fixes)
    const posStr = positionParam || slotIndex
    const pos = posStr ? parseInt(posStr, 10) : null

    if (pos === null || isNaN(pos) || pos < 0) {
      return NextResponse.json(
        { success: false, error: 'Position manquante ou invalide (≥0 requis)' },
        { status: 400 }
      )
    }

    // Déterminer le type média
    // 1. typeParam si fourni (nouveau format)
    // 2. slot si fourni (ancien format)
    // 3. type MIME du fichier
    let mediaType: 'IMAGE' | 'VIDEO'
    if (typeParam) {
      mediaType = typeParam === 'VIDEO' ? 'VIDEO' : 'IMAGE'
    } else if (slot === 'video') {
      mediaType = 'VIDEO'
    } else if (file.type.startsWith('video/')) {
      mediaType = 'VIDEO'
    } else {
      mediaType = 'IMAGE'
    }

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

    console.log(`✅ Upload R2 pour club ${club.id}: ${mediaType} position ${pos}, fichier: ${file.name} -> ${fileUrl}`)

    let media

    // ✅ LOGIQUE CLUB (comme Escort) :
    // - Position 0 (avatar) : UPDATE si existe, sinon CREATE
    // - Position 1 (feed) : TOUJOURS CREATE (nouveau média)
    // - Autres positions : CREATE

    if (pos === 0) {
      // AVATAR (pos 0) : remplacer si existe
      const existingMedia = await prisma.media.findFirst({
        where: {
          ownerType: 'CLUB',
          ownerId: club.id,
          pos: 0
        }
      })

      if (existingMedia) {
        // Mettre à jour l'avatar existant
        media = await prisma.media.update({
          where: { id: existingMedia.id },
          data: {
            type: mediaType,
            url: fileUrl,
            updatedAt: new Date()
          }
        })
        console.log(`  ↻ Avatar (pos 0) remplacé`)
      } else {
        // Créer un nouvel avatar
        media = await prisma.media.create({
          data: {
            ownerType: 'CLUB',
            ownerId: club.id,
            type: mediaType,
            url: fileUrl,
            pos: 0,
            visibility: 'PUBLIC'
          }
        })
        console.log(`  ✓ Nouvel avatar (pos 0) créé`)
      }
    } else {
      // FEED (pos 1) ou autre : TOUJOURS créer un nouveau média
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
      console.log(`  ✓ Nouveau média position ${pos} créé (feed)`)
    }

    // Mettre à jour aussi le champ avatarUrl dans ClubDetails si c'est l'avatar
    if (pos === 0) {
      // Photo de profil
      await prisma.clubDetails.updateMany({
        where: { clubId: club.id },
        data: { avatarUrl: fileUrl }
      })
    }
    // Note: Position 1 = feed maintenant, pas de cover spécifique

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