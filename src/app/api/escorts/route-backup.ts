import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('[API ESCORTS] Simple test started')
    
    // Version ultra-simple pour tester
    const testEscorts = [
      {
        id: 'test-1',
        stageName: 'Escorte Test 1',
        age: 25,
        city: 'Genève',
        canton: 'Genève',
        isVerifiedBadge: true,
        isActive: true,
        profilePhoto: 'https://picsum.photos/400/600?random=1',
        heroMedia: {
          type: 'IMAGE',
          url: 'https://picsum.photos/400/600?random=1',
          thumb: 'https://picsum.photos/200/300?random=1'
        },
        languages: ['Français'],
        services: ['Rapport'],
        rate1H: 200,
        availableNow: true,
        outcall: true,
        incall: true,
        hasPrivatePhotos: false,
        hasPrivateVideos: false,
        hasWebcamLive: false,
        rating: 4.5,
        reviewCount: 10,
        views: 100,
        likes: 20,
        status: 'ACTIVE',
        updatedAt: new Date().toISOString()
      },
      {
        id: 'test-2',
        stageName: 'Escorte Test 2',
        age: 28,
        city: 'Zurich',
        canton: 'Zurich',
        isVerifiedBadge: true,
        isActive: true,
        profilePhoto: 'https://picsum.photos/400/600?random=2',
        heroMedia: {
          type: 'IMAGE',
          url: 'https://picsum.photos/400/600?random=2',
          thumb: 'https://picsum.photos/200/300?random=2'
        },
        languages: ['Français', 'Anglais'],
        services: ['Rapport', 'French kiss'],
        rate1H: 250,
        availableNow: false,
        outcall: true,
        incall: true,
        hasPrivatePhotos: true,
        hasPrivateVideos: false,
        hasWebcamLive: false,
        rating: 4.8,
        reviewCount: 25,
        views: 200,
        likes: 45,
        status: 'ACTIVE',
        updatedAt: new Date().toISOString()
      }
    ]

    const nextCursor = '20'
    const total = 100

    console.log('[API ESCORTS] Simple response prepared:', { itemsCount: testEscorts.length })

    return NextResponse.json({ 
      success: true, 
      items: testEscorts, 
      nextCursor, 
      total 
    })
  } catch (error) {
    console.error('[API ESCORTS] Simple ERROR:', error)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
