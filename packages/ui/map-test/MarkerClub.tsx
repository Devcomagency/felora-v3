"use client"

import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

export type ClubPinDTO = { id: string; lat: number; lng: number; name: string; verified?: boolean }

function icon() {
  const size = 30
  return L.divIcon({
    html: `
      <div style="width:${size}px;height:${size}px;position:relative">
        <div style="position:relative;width:${size}px;height:${size}px;border-radius:10px;background:rgba(107,114,128,0.6);border:2px solid rgba(255,255,255,0.3);box-shadow:0 4px 12px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(10px);">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M3 21V8l9-5 9 5v13"/><path d="M9 22V12h6v10"/></svg>
        </div>
      </div>
    `,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
    popupAnchor: [0, -size/2]
  })
}

export default function MarkerClub({ club }: { club: ClubPinDTO }) {
  if (!club || !Number.isFinite(club.lat) || !Number.isFinite(club.lng)) return null
  return (
    <Marker position={[club.lat, club.lng]} icon={icon()}>
      <Popup autoPan keepInView>
        <div style={{
          background: 'var(--glass-bg)', backdropFilter: 'blur(var(--glass-blur))',
          border: '1px solid var(--glass-border)', borderRadius: 16, padding: 12, color: 'var(--text)'
        }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>{club.name}</div>
          <a
            href={`/profile-test/club/${club.id}`}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', padding: '10px 12px', borderRadius: 12,
              background: 'linear-gradient(135deg, #FF6B9D 0%, #B794F6 100%)', color: '#fff',
              fontWeight: 700, textDecoration: 'none'
            }}
          >
            Voir le profil
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
          </a>
        </div>
      </Popup>
    </Marker>
  )
}
