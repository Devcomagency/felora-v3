import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const response = NextResponse.json({
    success: true,
    message: 'Déconnexion réussie'
  })

  // Supprimer le cookie
  response.cookies.delete('felora-admin-token')

  return response
}
