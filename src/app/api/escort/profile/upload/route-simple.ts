import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  console.log('🚀 API Upload Simple - Début')
  
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    // Validation basique
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'Le fichier doit être une image' },
        { status: 400 }
      )
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'Le fichier est trop volumineux (5MB maximum)' },
        { status: 400 }
      )
    }

    // Convertir en base64 pour test
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Data = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64Data}`
    
    const fileName = `test-${uuidv4()}.${file.name.split('.').pop()}`
    
    console.log('✅ Upload simple réussi, taille:', buffer.length)
    
    return NextResponse.json({
      success: true,
      url: dataUrl,
      fileName,
      message: 'Photo uploadée en mémoire (test)'
    })
    
  } catch (error) {
    console.error('💥 Erreur upload simple:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur', details: (error as Error).message },
      { status: 500 }
    )
  }
}