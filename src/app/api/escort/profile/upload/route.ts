import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  console.log('🚀 API Upload - Début de la requête')
  
  try {
    // Vérifier l'authentification
    console.log('🔐 API Upload - Vérification de l\'authentification...')
    const session = await getServerSession(authOptions)
    console.log('👤 API Upload - Session:', session ? `User ID: ${session.user?.id}` : 'Pas de session')
    
    if (!session?.user?.id) {
      console.log('❌ API Upload - Authentification échouée')
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }
    
    console.log('✅ API Upload - Utilisateur authentifié:', session.user.id)

    console.log('📋 API Upload - Lecture du FormData...')
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string
    
    console.log('📁 API Upload - File:', file ? `${file.name} (${file.size} bytes)` : 'Aucun fichier')
    console.log('🏷️ API Upload - Type:', type)

    if (!file) {
      console.log('❌ API Upload - Aucun fichier dans FormData')
      return NextResponse.json(
        { success: false, error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    // Validation du type de fichier
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'Le fichier doit être une image' },
        { status: 400 }
      )
    }

    // Validation de la taille (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'Le fichier est trop volumineux (5MB maximum)' },
        { status: 400 }
      )
    }

    // Créer le nom de fichier unique
    const fileExtension = file.name.split('.').pop()
    const fileName = `${uuidv4()}.${fileExtension}`
    
    console.log('📁 API Upload - Nom de fichier généré:', fileName)
    
    // Sur Vercel, utiliser /tmp au lieu de public/uploads
    const uploadDir = process.env.NODE_ENV === 'production' 
      ? '/tmp' 
      : join(process.cwd(), 'public', 'uploads', 'escorts')
    
    const filePath = join(uploadDir, fileName)
    
    console.log('📂 API Upload - Répertoire:', uploadDir)
    console.log('📄 API Upload - Chemin complet:', filePath)

    try {
      // Créer le dossier s'il n'existe pas (seulement en dev)
      if (process.env.NODE_ENV !== 'production') {
        await mkdir(uploadDir, { recursive: true })
      }
      
      // Convertir le fichier en buffer et l'écrire
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filePath, buffer)

      // Retourner l'URL publique
      const publicUrl = process.env.NODE_ENV === 'production'
        ? `/api/uploads/${fileName}` // API endpoint pour servir le fichier depuis /tmp
        : `/uploads/escorts/${fileName}` // Fichier statique en dev
      
      console.log('✅ API Upload - Succès! URL:', publicUrl)
      
      return NextResponse.json({
        success: true,
        url: publicUrl,
        message: 'Photo uploadée avec succès'
      })
      
    } catch (fsError) {
      console.error('💥 API Upload - Erreur écriture fichier:', fsError)
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la sauvegarde du fichier', details: (fsError as Error).message },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('💥 API Upload - Erreur globale:', error)
    console.error('📊 API Upload - Stack trace:', (error as Error).stack)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur interne du serveur',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  }
}