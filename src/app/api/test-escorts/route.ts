import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('[TEST-API] Test endpoint called')
    
    // Retourner des données mock pour tester
    const mockData = {
      items: [
        {
          id: 'test1',
          stageName: 'Test Escort',
          city: 'Genève',
          canton: 'Genève',
          status: 'ACTIVE'
        }
      ],
      nextCursor: null,
      total: 1
    }
    
    console.log('[TEST-API] Returning mock data:', mockData)
    return NextResponse.json(mockData)
    
  } catch (error) {
    console.error('[TEST-API] Error:', error)
    return NextResponse.json({ error: 'test_error' }, { status: 500 })
  }
}
