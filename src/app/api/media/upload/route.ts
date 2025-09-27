// API de test pour upload média - Version simplifiée
export async function POST() {
  return Response.json({ 
    success: true, 
    message: 'API de test - Upload simulé',
    media: {
      id: 'test-' + Date.now(),
      url: 'https://test.example.com/test.jpg',
      type: 'IMAGE',
      visibility: 'PUBLIC'
    }
  })
}

export async function GET() {
  return Response.json({ 
    success: true, 
    medias: []
  })
}
