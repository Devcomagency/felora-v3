import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { v4 as uuidv4 } from 'uuid'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

// Configuration Cloudflare R2
const R2_ENDPOINT = process.env.CLOUDFLARE_R2_ENDPOINT
const R2_ACCESS_KEY = process.env.CLOUDFLARE_R2_ACCESS_KEY  
const R2_SECRET_KEY = process.env.CLOUDFLARE_R2_SECRET_KEY
const R2_BUCKET = process.env.CLOUDFLARE_R2_BUCKET

// Initialisation du client R2
const r2Client = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY || '',
    secretAccessKey: R2_SECRET_KEY || ''
  }
})

export async function POST(request: NextRequest) {
  console.log('🚀 API Upload - Début de la requête')
  console.log('🔧 API Upload - Runtime:', process.env.VERCEL_ENV || 'local')
  console.log('🔧 API Upload - Node version:', process.version)
  
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

    // Vérifier la configuration R2 - si manquante, utiliser stockage local
    const useR2 = R2_ENDPOINT && R2_ACCESS_KEY && R2_SECRET_KEY && R2_BUCKET
    console.log('🔧 API Upload - Variables R2:')
    console.log('  - R2_ENDPOINT:', R2_ENDPOINT ? 'présent' : 'manquant')
    console.log('  - R2_ACCESS_KEY:', R2_ACCESS_KEY ? 'présent' : 'manquant') 
    console.log('  - R2_SECRET_KEY:', R2_SECRET_KEY ? 'présent' : 'manquant')
    console.log('  - R2_BUCKET:', R2_BUCKET ? 'présent' : 'manquant')
    console.log('🔧 API Upload - Mode stockage:', useR2 ? 'Cloudflare R2' : 'Base64 (fallback)')

    // Créer le nom de fichier unique
    const fileExtension = file.name.split('.').pop()
    const fileName = `escorts/${session.user.id}/${uuidv4()}.${fileExtension}`
    
    console.log('📁 API Upload - Nom de fichier généré:', fileName)

    try {
      console.log('🔄 API Upload - Conversion du fichier...')
      
      // Convertir le fichier en buffer
      const bytes = await file.arrayBuffer()
      console.log('📦 API Upload - ArrayBuffer créé, taille:', bytes.byteLength)
      
      const buffer = Buffer.from(bytes)
      console.log('📦 API Upload - Buffer créé, taille:', buffer.length)
      
      let publicUrl: string
      
      if (useR2) {
        console.log('☁️ API Upload - Upload vers Cloudflare R2...')
        
        // Upload vers Cloudflare R2
        const uploadCommand = new PutObjectCommand({
          Bucket: R2_BUCKET,
          Key: fileName,
          Body: buffer,
          ContentType: file.type,
          ContentLength: buffer.length,
          Metadata: {
            originalName: file.name,
            userId: session.user.id,
            uploadedAt: new Date().toISOString()
          }
        })
        
        await r2Client.send(uploadCommand)
        
        // URL publique R2 via API proxy
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3004'
        publicUrl = `${baseUrl}/api/uploads/${fileName}`
        
        console.log('✅ API Upload - Succès R2! URL:', publicUrl)
        
      } else {
        console.log('💾 API Upload - Fallback: stockage temporaire en base64...')
        
        // En attendant la config R2, utiliser un stockage temporaire
        // Convertir en base64 pour stockage temporaire
        const base64Data = buffer.toString('base64')
        const dataUrl = `data:${file.type};base64,${base64Data}`
        
        // Pour le développement/test, retourner directement la data URL
        publicUrl = dataUrl
        
        console.log('✅ API Upload - Succès temporaire! Taille:', buffer.length)
      }
      
      return NextResponse.json({
        success: true,
        url: publicUrl,
        fileName,
        message: `Photo uploadée avec succès${useR2 ? ' vers R2' : ' (local)'}`
      })
      
    } catch (uploadError) {
      console.error('💥 API Upload - Erreur upload:', uploadError)
      console.error('💥 API Upload - Stack:', (uploadError as Error).stack)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erreur lors de l\'upload vers le stockage', 
          details: (uploadError as Error).message,
          stack: process.env.NODE_ENV === 'development' ? (uploadError as Error).stack : undefined,
          useR2: useR2
        },
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