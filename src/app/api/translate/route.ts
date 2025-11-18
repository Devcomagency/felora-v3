import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateTranslation, type EntityType } from '@/lib/translation/translationCache'

/**
 * API Route pour traduire du texte avec cache
 * POST /api/translate
 *
 * Body:
 * {
 *   entityId: string
 *   entityType: 'profile_bio' | 'profile_description' | 'chat_message' | etc.
 *   text: string
 *   sourceLang: string (code ISO 639-1)
 *   targetLang: string (code ISO 639-1)
 * }
 *
 * Response:
 * {
 *   success: boolean
 *   translatedText?: string
 *   fromCache?: boolean
 *   error?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { entityId, entityType, text, sourceLang, targetLang } = body

    // Validation
    if (!entityId || typeof entityId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid entityId' },
        { status: 400 }
      )
    }

    if (!entityType || typeof entityType !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid entityType' },
        { status: 400 }
      )
    }

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid text' },
        { status: 400 }
      )
    }

    if (!sourceLang || typeof sourceLang !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid sourceLang' },
        { status: 400 }
      )
    }

    if (!targetLang || typeof targetLang !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid targetLang' },
        { status: 400 }
      )
    }

    // Traduire avec cache
    const result = await getOrCreateTranslation(
      entityId,
      entityType as EntityType,
      text,
      sourceLang,
      targetLang
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('[API /translate] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
