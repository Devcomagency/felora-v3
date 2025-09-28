import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ width: string; height: string }> }
) {
  try {
    const { width, height } = await params
    
    const w = parseInt(width) || 400
    const h = parseInt(height) || 400
    
    // Créer une image SVG placeholder simple
    const svg = `
      <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#374151"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14" fill="#9CA3AF" text-anchor="middle" dy=".3em">
          Image non disponible
        </text>
      </svg>
    `
    
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600'
      }
    })
  } catch (error) {
    return new NextResponse('Error', { status: 500 })
  }
}
