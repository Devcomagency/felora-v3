import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    nextauth: {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT_SET',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT_SET'
    },
    database: {
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT_SET',
      POSTGRES_URL: process.env.POSTGRES_URL ? 'SET' : 'NOT_SET'
    }
  })
}