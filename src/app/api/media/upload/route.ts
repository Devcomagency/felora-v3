import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

// Configuration pour augmenter la limite de body size (vidéos)
export const runtime = 'nodejs'
export const maxDuration = 60 // 60 secondes max pour l'upload
export const dynamic = 'force-dynamic'

// API pour upload média vers le profil utilisateur (avec R2)
export async function POST(request: NextRequest) {
  try {
    console.log('🎬 Début upload média...')
    const session = await getServerSession(authOptions)

    console.log('👤 Session:', {
      userId: session?.user?.id,
      email: session?.user?.email,
      role: session?.user?.role
    })

    if (!session?.user?.id) {
      console.log('❌ Pas de session utilisateur')
      return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 })
    }

    const formData = await request.formData()
    const mediaFile = formData.get('media') as File
    const type = formData.get('type') as string || 'IMAGE'
    const pos = formData.get('pos') as string || '0'
    const description = formData.get('description') as string || ''
    const visibility = formData.get('visibility') as string || 'public'
    const location = formData.get('location') as string || ''
    const price = formData.get('price') as string || ''

    if (!mediaFile) {
      return NextResponse.json({ success: false, error: 'Aucun fichier fourni' }, { status: 400 })
    }

    console.log('📦 Fichier reçu:', {
      name: mediaFile.name,
      type: mediaFile.type,
      size: mediaFile.size,
      visibility,
      location,
      price
    })

    // Configuration S3/R2
    const s3Client = new S3Client({
      region: 'auto',
      endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY || '',
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY || '',
      },
    })

    // Générer un nom de fichier unique
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = mediaFile.type.includes('video') ? 'mp4' : (mediaFile.type.includes('image') ? 'jpg' : 'bin')
    const sanitizedFileName = `${type.toLowerCase()}_${pos}_${timestamp}-${randomString}.${fileExtension}`
    const key = `profiles/${session.user.id}/${sanitizedFileName}`

    console.log('📤 Upload vers R2:', key)

    // Upload vers R2
    const bytes = await mediaFile.arrayBuffer()
    const buffer = Buffer.from(bytes)

    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mediaFile.type,
    }))

    // URL publique du fichier
    const publicUrl = `${process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL}/${key}`

    console.log('✅ Fichier uploadé sur R2:', publicUrl)

    // Déterminer le type de profil (escort ou club)
    let ownerType = 'ESCORT'
    let ownerId = session.user.id
    let profileId = session.user.id

    // Vérifier si c'est un escort avec un profil
    const escortProfile = await prisma.escortProfile.findUnique({
      where: { userId: session.user.id }
    })

    // Vérifier si c'est un club
    const clubProfile = await prisma.clubProfileV2.findUnique({
      where: { userId: session.user.id }
    })

    console.log('🔍 Profils trouvés:', {
      escort: escortProfile ? { id: escortProfile.id } : null,
      club: clubProfile ? { id: clubProfile.id, handle: clubProfile.handle } : null
    })

    if (clubProfile) {
      ownerType = 'CLUB'
      ownerId = clubProfile.id
      profileId = clubProfile.id
      console.log('✅ Utilisateur identifié comme club:', ownerId)
    } else if (escortProfile) {
      ownerType = 'ESCORT'
      ownerId = escortProfile.id
      profileId = escortProfile.id
      console.log('✅ Utilisateur identifié comme escort:', ownerId)
    } else {
      console.log('⚠️ Aucun profil escort/club trouvé, utilisation userId')
    }

    // Mapper la visibilité vers l'enum Prisma
    let visibilityEnum: 'PUBLIC' | 'PREMIUM' | 'PRIVATE' = 'PUBLIC'
    if (visibility === 'premium') visibilityEnum = 'PREMIUM'
    else if (visibility === 'private') visibilityEnum = 'PRIVATE'

    // Sauvegarder en base de données
    const media = await prisma.media.create({
      data: {
        ownerType: ownerType as any,
        ownerId: ownerId,
        type: type as any,
        url: publicUrl,
        description: description || null,
        visibility: visibilityEnum,
        price: visibility === 'premium' && price ? parseInt(price) : null,
        pos: parseInt(pos),
        createdAt: new Date()
      }
    })

    console.log('💾 Média sauvegardé en base:', {
      id: media.id,
      ownerType,
      ownerId,
      url: publicUrl
    })

    // Déterminer l'URL de redirection CORRECTE
    let redirectUrl = `/profile/${session.user.id}` // Par défaut vers le profil user

    if (clubProfile) {
      redirectUrl = `/profile-test/club/${clubProfile.handle}`
    } else if (escortProfile) {
      redirectUrl = `/profile/${escortProfile.id}` // Profil escort
    }

    console.log('🎉 Média sauvegardé avec succès:', {
      id: media.id,
      ownerType,
      ownerId,
      url: publicUrl,
      description: description || 'Aucune description',
      redirectUrl
    })

    return NextResponse.json({
      success: true,
      message: 'Média ajouté au profil',
      media: {
        id: media.id,
        url: publicUrl,
        type: media.type,
        pos: media.pos
      },
      redirectUrl: redirectUrl,
      userType: ownerType,
      profileId: profileId
    })

  } catch (error: any) {
    console.error('❌ Erreur upload média:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'upload',
      details: error.message
    }, { status: 500 })
  }
}

export async function GET() {
  return Response.json({
    success: true,
    medias: []
  })
}
