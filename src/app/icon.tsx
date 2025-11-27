import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = {
  width: 512,
  height: 512,
}
export const contentType = 'image/png'

export default function Icon() {
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
            fontSize: 280,
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
