import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// API pour upload média vers le profil utilisateur
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

    if (!mediaFile) {
      return NextResponse.json({ success: false, error: 'Aucun fichier fourni' }, { status: 400 })
    }

    // Créer le dossier uploads s'il n'existe pas
    const uploadsDir = join(process.cwd(), 'uploads', 'profiles', session.user.id)
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Générer un nom de fichier unique
    const fileExtension = mediaFile.type.includes('video') ? 'mp4' : 'jpg'
    const fileName = `${type.toLowerCase()}_${pos}_${Date.now()}.${fileExtension}`
    const filePath = join(uploadsDir, fileName)

    // Sauvegarder le fichier
    const bytes = await mediaFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // URL relative pour le serveur
    const mediaUrl = `/uploads/profiles/${session.user.id}/${fileName}`

    // Déterminer le type de profil (escort ou club)
    let ownerType = 'ESCORT'
    let ownerId = session.user.id

    // Vérifier si c'est un club
    const clubProfile = await prisma.clubProfileV2.findUnique({
      where: { userId: session.user.id }
    })

    console.log('🏢 Profil club:', clubProfile ? { id: clubProfile.id, handle: clubProfile.handle } : 'Non trouvé')

    if (clubProfile) {
      ownerType = 'CLUB'
      ownerId = clubProfile.id
      console.log('✅ Utilisateur identifié comme club:', ownerId)
    } else {
      console.log('✅ Utilisateur identifié comme escort:', ownerId)
    }

    // Sauvegarder en base de données
    const media = await prisma.media.create({
      data: {
        ownerType: ownerType as any,
        ownerId: ownerId,
        type: type as any,
        url: mediaUrl,
        description: description || null,
        pos: parseInt(pos),
        createdAt: new Date()
      }
    })

    // Déterminer l'URL de redirection
    let redirectUrl = '/profile'
    if (clubProfile) {
      redirectUrl = `/profile-test/club/${clubProfile.handle}`
    }

    console.log('🎉 Média sauvegardé avec succès:', {
      id: media.id,
      ownerType,
      ownerId,
      url: mediaUrl,
      description: description || 'Aucune description',
      redirectUrl
    })

    return NextResponse.json({
      success: true,
      message: 'Média ajouté au profil',
      media: {
        id: media.id,
        url: mediaUrl,
        type: media.type,
        pos: media.pos
      },
      redirectUrl: redirectUrl,
      userType: ownerType
    })

  } catch (error) {
    console.error('Erreur upload média:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'upload'
    }, { status: 500 })
  }
}

export async function GET() {
  return Response.json({ 
    success: true, 
    medias: []
  })
}
