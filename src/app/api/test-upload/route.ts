import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('🧪 [TEST API] API test-upload called successfully')

  try {
    const body = await request.json().catch(() => null)
    console.log('🧪 [TEST API] Body received:', body ? 'OK' : 'EMPTY')

    return NextResponse.json({
      success: true,
      message: 'API accessible, pas de problème auth Vercel',
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.log('🧪 [TEST API] Error:', error.message)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

export async function GET() {
  console.log('🧪 [TEST API] GET test-upload called')
  return NextResponse.json({ message: 'Test API works!' })
}