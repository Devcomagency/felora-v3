import { NextRequest, NextResponse } from 'next/server'

type EscortCard = {
  id: string
  name: string
  city?: string
  avatar?: string
}

// Minimal mock mapping of escorts per club for demo purposes
const CLUB_ESCORTS: Record<string, EscortCard[]> = {
  'club-luxe-geneva': [
    {
      id: 'aria-zurich-id',
      name: 'Aria',
      city: 'Genève',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face'
    },
    {
      id: 'luna-geneve-id',
      name: 'Luna',
      city: 'Genève',
      avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop&crop=face'
    },
    {
      id: 'maya-lausanne-id',
      name: 'Maya',
      city: 'Genève',
      avatar: 'https://images.unsplash.com/photo-1488207984690-a8bfe0b4c163?w=400&h=400&fit=crop&crop=face'
    },
    {
      id: 'sofia-bern-id',
      name: 'Sofia',
      city: 'Berne',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face'
    },
    {
      id: 'chloe-bale-id',
      name: 'Chloé',
      city: 'Bâle',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b613905b?w=400&h=400&fit=crop&crop=face'
    },
    {
      id: 'emma-luzern-id',
      name: 'Emma',
      city: 'Lucerne',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=face'
    },
    {
      id: 'zoe-basel-id',
      name: 'Zoé',
      city: 'Bâle',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face'
    },
    {
      id: 'lea-lugano-id',
      name: 'Léa',
      city: 'Lugano',
      avatar: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=400&h=400&fit=crop&crop=face'
    },
    {
      id: 'eva-neuchatel-id',
      name: 'Eva',
      city: 'Neuchâtel',
      avatar: 'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=400&h=400&fit=crop&crop=face'
    },
    {
      id: 'mia-fribourg-id',
      name: 'Mia',
      city: 'Fribourg',
      avatar: 'https://images.unsplash.com/photo-1544717305-996b815c338c?w=400&h=400&fit=crop&crop=face'
    }
  ]
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const list = CLUB_ESCORTS[id] || []
  return NextResponse.json({ escorts: list }, { status: 200 })
}
