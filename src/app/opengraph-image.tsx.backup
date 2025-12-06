import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Felora — Plateforme Premium'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #FF6B9D 0%, #B794F6 50%, #4FD1C7 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Logo/Text */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
          }}
        >
          <div
            style={{
              fontSize: 120,
              fontWeight: 900,
              color: 'white',
              letterSpacing: '-0.05em',
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            }}
          >
            FELORA
          </div>
          <div
            style={{
              fontSize: 36,
              color: 'rgba(255, 255, 255, 0.95)',
              fontWeight: 500,
              textAlign: 'center',
              maxWidth: '800px',
              lineHeight: 1.4,
            }}
          >
            Plateforme Premium — Rencontres d'exception
          </div>
          <div
            style={{
              display: 'flex',
              gap: '15px',
              marginTop: '20px',
            }}
          >
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: 24,
                color: 'white',
                fontWeight: 600,
              }}
            >
              ✓ Profils Vérifiés
            </div>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: 24,
                color: 'white',
                fontWeight: 600,
              }}
            >
              ✓ Sécurisé
            </div>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: 24,
                color: 'white',
                fontWeight: 600,
              }}
            >
              ✓ Premium
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
