import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #FF6B9D 0%, #B794F6 100%)',
          borderRadius: '20%',
        }}
      >
        <div
          style={{
            fontSize: 110,
            fontWeight: 900,
            color: 'white',
            letterSpacing: '-0.05em',
          }}
        >
          F
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
