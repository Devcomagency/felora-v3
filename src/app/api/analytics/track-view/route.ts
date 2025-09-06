import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  // Simple tracking endpoint - return quickly
  return NextResponse.json({ success: true, tracked: true })
}

export async function POST(req: NextRequest) {
  // Simple tracking endpoint - return quickly
  return NextResponse.json({ success: true, tracked: true })
}