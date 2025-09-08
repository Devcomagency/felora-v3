import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    variables: {
      SMTP_HOST: process.env.SMTP_HOST ? 'SET' : 'NOT_SET',
      SMTP_PORT: process.env.SMTP_PORT || 'NOT_SET', 
      SMTP_USER: process.env.SMTP_USER ? 'SET' : 'NOT_SET',
      SMTP_PASS: process.env.SMTP_PASS ? 'SET' : 'NOT_SET',
      SMTP_FROM: process.env.SMTP_FROM || 'NOT_SET'
    },
    values: {
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT,
      SMTP_USER: process.env.SMTP_USER,
      SMTP_FROM: process.env.SMTP_FROM
    }
  })
}