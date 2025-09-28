import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { size: string } }
) {
  try {
    const size = params.size || '400x400'
    const [width, height] = size.split('x').map(Number)

    // Valider les dimensions
    const w = width && width > 0 && width <= 2000 ? width : 400
    const h = height && height > 0 && height <= 2000 ? height : 400

    // Créer une image SVG placeholder moderne
    const svg = `
      <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#6366f1;stop-opacity:0.1" />
            <stop offset="50%" style="stop-color:#a855f7;stop-opacity:0.1" />
            <stop offset="100%" style="stop-color:#ec4899;stop-opacity:0.1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)"/>
        <rect width="100%" height="100%" fill="#1f2937" fill-opacity="0.8"/>

        <!-- Icône image -->
        <g transform="translate(${w/2 - 24}, ${h/2 - 24})">
          <rect x="8" y="8" width="32" height="24" rx="2" fill="none" stroke="#6b7280" stroke-width="2"/>
          <path d="M8 8L8 32L40 32L40 8z" fill="none" stroke="#6b7280" stroke-width="2"/>
          <circle cx="18" cy="18" r="3" fill="#6b7280"/>
          <path d="M32 24L26 18L22 22L18 18L8 28" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round"/>
        </g>

        <!-- Texte -->
        <text x="${w/2}" y="${h/2 + 45}" text-anchor="middle" fill="#9ca3af" font-family="Arial, sans-serif" font-size="12">
          ${w} × ${h}
        </text>
      </svg>
    `

    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    })

  } catch (error) {
    console.error('Erreur génération placeholder:', error)
    return NextResponse.json({ error: 'Erreur génération image' }, { status: 500 })
  }
}