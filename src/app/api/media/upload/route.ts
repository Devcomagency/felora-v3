// API de test pour upload média - Version simplifiée
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const visibility = formData.get('visibility') as string || 'PUBLIC'
    const price = formData.get('price') as string

    // Utiliser une image de test valide selon CSP (picsum.photos est autorisé)
    const testImageUrl = file?.type.startsWith('image/')
      ? 'https://picsum.photos/400/400?random=' + Date.now()
      : 'https://picsum.photos/400/400?random=' + Date.now() // Même pour les vidéos en test

    const media = {
      id: 'test-' + Date.now(),
      url: testImageUrl,
      type: file?.type.startsWith('video/') ? 'VIDEO' : 'IMAGE',
      visibility: visibility.toUpperCase(),
      price: price ? parseInt(price) : undefined,
      createdAt: new Date().toISOString()
    }

    // Simuler un délai d'upload
    await new Promise(resolve => setTimeout(resolve, 1000))

    return Response.json({
      success: true,
      message: `Upload simulé avec succès (${visibility})`,
      media
    })
  } catch (error) {
    return Response.json({
      success: false,
      error: 'Erreur upload'
    }, { status: 500 })
  }
}

export async function GET() {
  return Response.json({ 
    success: true, 
    medias: []
  })
}
