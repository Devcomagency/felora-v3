import { ImageResponse } from 'next/og'
import { prisma } from '@/lib/prisma'

export const runtime = 'edge'
export const alt = 'Profil sur Felora'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image({ params }: { params: { id: string } }) {
  try {
    // Récupérer les infos du profil
    const profile = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        name: true,
        city: true,
        age: true,
        verified: true,
        premium: true,
        avatar: true,
        languages: true,
      },
    })

    if (!profile) {
      // Fallback si profil non trouvé
      return new ImageResponse(
        (
          <div
            style={{
              background: 'linear-gradient(135deg, #FF6B9D 0%, #B794F6 50%, #4FD1C7 100%)',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            <div style={{ fontSize: 60, color: 'white', fontWeight: 700 }}>
              Profil non trouvé
            </div>
          </div>
        ),
        { ...size }
      )
    }

    return new ImageResponse(
      (
        <div
          style={{
            background: 'linear-gradient(135deg, #1A1A1A 0%, #0D0D0D 100%)',
            width: '100%',
            height: '100%',
            display: 'flex',
            fontFamily: 'system-ui, sans-serif',
            position: 'relative',
          }}
        >
          {/* Gradient overlay */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(255, 107, 157, 0.2) 0%, rgba(183, 148, 246, 0.2) 100%)',
            }}
          />

          {/* Content */}
          <div
            style={{
              display: 'flex',
              width: '100%',
              height: '100%',
              padding: '60px',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {/* Left side - Profile info */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                maxWidth: '60%',
              }}
            >
              {/* Name and badges */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                }}
              >
                <div
                  style={{
                    fontSize: 72,
                    fontWeight: 900,
                    color: 'white',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {profile.name}
                </div>
                {profile.verified && (
                  <div
                    style={{
                      width: 50,
                      height: 50,
                      background: '#4FD1C7',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 30,
                    }}
                  >
                    ✓
                  </div>
                )}
                {profile.premium && (
                  <div
                    style={{
                      width: 50,
                      height: 50,
                      background: 'linear-gradient(135deg, #FF6B9D, #B794F6)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 30,
                    }}
                  >
                    ⭐
                  </div>
                )}
              </div>

              {/* Details */}
              <div
                style={{
                  display: 'flex',
                  gap: '30px',
                  fontSize: 32,
                  color: 'rgba(255, 255, 255, 0.85)',
                }}
              >
                {profile.age && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{profile.age} ans</span>
                  </div>
                )}
                {profile.city && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>📍</span>
                    <span>{profile.city}</span>
                  </div>
                )}
              </div>

              {/* Languages */}
              {profile.languages && profile.languages.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    gap: '12px',
                    flexWrap: 'wrap',
                  }}
                >
                  {profile.languages.slice(0, 3).map((lang) => (
                    <div
                      key={lang}
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        padding: '10px 20px',
                        borderRadius: '20px',
                        fontSize: 24,
                        color: 'white',
                      }}
                    >
                      {lang}
                    </div>
                  ))}
                </div>
              )}

              {/* Felora branding */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  marginTop: '20px',
                }}
              >
                <div
                  style={{
                    fontSize: 36,
                    fontWeight: 900,
                    background: 'linear-gradient(135deg, #FF6B9D, #B794F6)',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  FELORA
                </div>
                <div
                  style={{
                    fontSize: 24,
                    color: 'rgba(255, 255, 255, 0.6)',
                  }}
                >
                  Plateforme Premium
                </div>
              </div>
            </div>

            {/* Right side - Avatar */}
            {profile.avatar && (
              <div
                style={{
                  width: 350,
                  height: 350,
                  borderRadius: '30px',
                  overflow: 'hidden',
                  border: '4px solid rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                }}
              >
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
            )}
          </div>
        </div>
      ),
      {
        ...size,
      }
    )
  } catch (error) {
    console.error('Error generating OG image:', error)

    // Fallback en cas d'erreur
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
            gap: '20px',
          }}
        >
          <div style={{ fontSize: 80, fontWeight: 900, color: 'white' }}>
            FELORA
          </div>
          <div style={{ fontSize: 36, color: 'rgba(255, 255, 255, 0.9)' }}>
            Découvrez ce profil premium
          </div>
        </div>
      ),
      { ...size }
    )
  }
}
