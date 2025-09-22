import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ADMIN ENDPOINT - Apply missing migration for languageLevels
export async function POST() {
  try {
    // Execute raw SQL to add the missing column
    await prisma.$executeRaw`
      ALTER TABLE escort_profiles
      ADD COLUMN IF NOT EXISTS "languageLevels" TEXT;
    `

    return NextResponse.json({
      success: true,
      message: 'Migration applied: languageLevels column added'
    })
  } catch (error: any) {
    console.error('Migration error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}