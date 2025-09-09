import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

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

    console.log('💾 API Upload - Conversion en base64 (Vercel ne supporte pas le filesystem)')
    
    try {
      // Sur Vercel, on ne peut pas écrire de fichiers. On va stocker en base64 temporairement
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64 = buffer.toString('base64')
      const mimeType = file.type
      
      // Créer une data URL
      const dataUrl = `data:${mimeType};base64,${base64}`
      
      console.log('✅ API Upload - Fichier converti en base64, taille:', base64.length, 'caractères')
      
      // TODO: Ici on devrait stocker l'image sur un service cloud (Cloudinary, AWS S3, etc.)
      // Pour l'instant, on retourne la data URL directement
      
      return NextResponse.json({
        success: true,
        url: dataUrl, // Data URL temporaire
        message: 'Photo uploadée avec succès (stockage temporaire)',
        warning: 'Stockage temporaire - implémenter un service cloud pour la production'
      }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      })
      
    } catch (conversionError) {
      console.error('💥 Erreur conversion base64:', conversionError)
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la conversion de l\'image' },
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