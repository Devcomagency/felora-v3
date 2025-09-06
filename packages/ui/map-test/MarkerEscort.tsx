"use client"

import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

export type EscortPinDTO = {
  id: string
  lat: number
  lng: number
  name: string
  city: string
  avatar?: string
  verified?: boolean
  isActive?: boolean
}

function createEscortIcon(escort: EscortPinDTO, variant?: 'user') {
  // User location → small pin, no heart
  if (variant === 'user') {
    const w = 18
    const h = 24
    return L.divIcon({
      html: `
        <div style="position:relative;width:${w}px;height:${h}px;">
          <svg width="${w}" height="${h}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22s7-7.16 7-12a7 7 0 1 0-14 0c0 4.84 7 12 7 12Z" fill="#10B981" fill-opacity="0.85" stroke="white" stroke-width="1.2"/>
            <circle cx="12" cy="10" r="2.4" fill="white"/>
          </svg>
        </div>
      `,
      className: '',
      iconSize: [w, h],
      iconAnchor: [w/2, h],
      popupAnchor: [0, -h]
    })
  }
  const size = 32
  const pulseSize = 40
  const bg = escort.isActive ? 'linear-gradient(135deg, #FF6B9D 0%, #B794F6 100%)' : 'rgba(107, 114, 128, 0.6)'

  return L.divIcon({
    html: `
      <div style="width:${size}px;height:${size}px;position:relative;cursor:pointer">
        ${pulseSize ? `<div style="position:absolute;inset:0;width:${pulseSize}px;height:${pulseSize}px;left:50%;top:50%;transform:translate(-50%,-50%);border-radius:50%;background:rgba(255,107,157,0.3);animation:pulse 2s infinite;"></div>` : ''}
        <div style="position:relative;width:${size}px;height:${size}px;border-radius:50%;background:${bg};border:2px solid rgba(255,255,255,0.3);box-shadow:0 4px 12px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(10px);">
          ${escort.avatar ? `<img src="${escort.avatar}" alt="${escort.name}" style="width:${Math.round(size*0.75)}px;height:${Math.round(size*0.75)}px;border-radius:50%;object-fit:cover;border:1px solid rgba(255,255,255,0.4)"/>` : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`}
          ${escort.verified ? `<div style="position:absolute;top:-2px;right:-2px;width:12px;height:12px;border-radius:50%;background:#3B82F6;border:1px solid white;display:flex;align-items:center;justify-content:center"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg></div>`: ''}
        </div>
        <style>
          @keyframes pulse {0%{transform:translate(-50%,-50%) scale(1);opacity:1}70%{transform:translate(-50%,-50%) scale(1.2);opacity:.5}100%{transform:translate(-50%,-50%) scale(1);opacity:1}}
        </style>
      </div>
    `,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
    popupAnchor: [0, -size/2]
  })
}

export default function MarkerEscort({ escort, variant }: { escort: EscortPinDTO; variant?: 'user' }) {
  // guard
  if (!escort || !Number.isFinite(escort.lat) || !Number.isFinite(escort.lng)) return null
  const icon = createEscortIcon(escort, variant)
  // For user location: small pin, no popup
  if (variant === 'user') {
    return (
      <Marker position={[escort.lat, escort.lng]} icon={icon} zIndexOffset={5000} />
    )
  }
  // Default escort marker with popup
  return (
    <Marker
      position={[escort.lat, escort.lng]}
      icon={icon}
      zIndexOffset={1000}
      eventHandlers={{
        click: (e) => {
          const t: any = e.target
          if (t && typeof t.openPopup === 'function') t.openPopup()
        }
      }}
    >
      <Popup autoPan keepInView>
        <div style={{
          background: 'var(--glass-bg)', backdropFilter: 'blur(var(--glass-blur))',
          border: '1px solid var(--glass-border)', borderRadius: 16, padding: 12,
          color: 'var(--text)', minWidth: 220, maxWidth: 300
        }}>
          {/* Big photo */}
          <div style={{ position: 'relative', width: '100%', height: 160, borderRadius: 12, overflow: 'hidden', marginBottom: 10 }}>
            <img src={escort.avatar || '/icons/verified.svg'} alt={escort.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {escort.verified && (
              <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, padding: '4px 8px' }}>
                <img src="/icons/verified.svg" alt="Vérifié" width={14} height={14} />
                <span style={{ fontSize: 11, color: '#fff', fontWeight: 600 }}>Vérifié</span>
              </div>
            )}
          </div>

          {/* Title + city */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{escort.name}</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>{escort.city || '—'}</div>
            </div>
          </div>

          {/* Top 3 services */}
          {Array.isArray((escort as any).services) && (escort as any).services.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
              {((escort as any).services as string[]).slice(0,3).map((s, i) => (
                <span key={i} style={{ fontSize: 11, padding: '4px 8px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>{s}</span>
              ))}
            </div>
          )}

          {/* CTA */}
          <a href={`/profile-test/escort/${escort.id}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '10px 12px', borderRadius: 12, background: 'linear-gradient(135deg, #FF6B9D 0%, #B794F6 100%)', color: '#fff', fontWeight: 700, textDecoration: 'none' }}>
            Voir le profil
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
          </a>
        </div>
      </Popup>
    </Marker>
  )
}
