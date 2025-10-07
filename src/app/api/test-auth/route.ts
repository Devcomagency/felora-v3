import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    console.log('[TEST AUTH] Testing authentication...')
    
    const authResult = await getAuthenticatedUser(request)
    
    if (!authResult.success) {
      console.log('[TEST AUTH] Authentication failed:', authResult.error)
      return NextResponse.json({ 
        success: false, 
        error: authResult.error,
        cookies: request.headers.get('cookie')
      }, { status: 401 })
    }

    console.log('[TEST AUTH] Authentication successful:', authResult.user)
    return NextResponse.json({ 
      success: true, 
      user: authResult.user,
      cookies: request.headers.get('cookie')
    })
  } catch (error) {
    console.error('[TEST AUTH] Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
