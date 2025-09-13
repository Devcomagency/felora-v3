import { NextResponse } from 'next/server'

type Provider = 'mapbox' | 'nominatim' | 'google'

const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN
const GOOGLE_KEY = process.env.GOOGLE_PLACES_KEY || process.env.NEXT_PUBLIC_GOOGLE_PLACES_KEY

function chooseProvider(): Provider {
  if (MAPBOX_TOKEN) return 'mapbox'
  if (GOOGLE_KEY) return 'google'
  return 'nominatim'
}

export async function GET(req: Request) {
  // 🚨 DEPRECATION WARNING
  console.warn('🚨 DEPRECATED: /api/geocode/* will be removed. Use /api/geo/* instead.')
  
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get('q') || '').trim()
  const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10) || 10, 15)
  const region = (searchParams.get('region') || '').trim() // canton name
  const city = (searchParams.get('city') || '').trim()

  if (q.length < 2) {
    return NextResponse.json({ hits: [] })
  }

  const provider = (searchParams.get('provider') as Provider) || chooseProvider()

  try {
    if (provider === 'mapbox' && MAPBOX_TOKEN) {
      // Biais simple: concaténer la région/ville à la requête
      const query = [q, city || region].filter(Boolean).join(', ')
      const url = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`)
      url.searchParams.set('country', 'ch')
      url.searchParams.set('limit', String(limit))
      url.searchParams.set('language', 'fr')
      // Limiter aux entités de type ville/localité pour éviter les adresses complètes
      url.searchParams.set('types', 'place,locality,region')
      url.searchParams.set('access_token', MAPBOX_TOKEN)

      const r = await fetch(url.toString())
      if (!r.ok) throw new Error(`Mapbox error ${r.status}`)
      const data = await r.json()

      const hitsRaw = (data.features || []).map((f: any) => ({
        score: Math.round((f.relevance || 0) * 100),
        identifier: `mapbox:${f.id}`,
        countryCode: (f.context || []).find((c: any) => c.id?.startsWith('country'))?.short_code?.toUpperCase() || 'CH',
        addressId: f.id,
        buildingId: f.properties?.mapbox_id || f.id,
        name: f.text_fr || f.text,
        address: f.place_name_fr || f.place_name || f.text,
        latitude: f.center?.[1] || f.geometry?.coordinates?.[1] || 0,
        longitude: f.center?.[0] || f.geometry?.coordinates?.[0] || 0,
        type: f.place_type?.[0] || 'place'
      }))
      // Dédupliquer par nom, garder villes/localités
      const seen = new Set<string>()
      const hits = hitsRaw
        .filter((h:any) => ['place','locality','region'].includes(h.type))
        .filter((h:any) => {
          const key = String(h.name || '').toLowerCase()
          if (!key) return false
          if (seen.has(key)) return false
          seen.add(key)
          return true
        })
        .map(h => ({ ...h, address: h.name }))

      return NextResponse.json({ hits })
    }

    if (provider === 'google' && GOOGLE_KEY) {
      // Use Geocoding API with CH component filter
      const url = new URL('https://maps.googleapis.com/maps/api/geocode/json')
      const address = [q, city || region].filter(Boolean).join(', ')
      url.searchParams.set('address', address)
      const comps = ['country:CH']
      if (region) comps.push(`administrative_area:${region}`)
      url.searchParams.set('components', comps.join('|'))
      url.searchParams.set('language', 'fr')
      url.searchParams.set('key', GOOGLE_KEY)

      const r = await fetch(url.toString())
      if (!r.ok) throw new Error(`Google error ${r.status}`)
      const data = await r.json()

      const hitsRaw = (data.results || []).slice(0, limit).map((res: any) => {
        const comps = res.address_components || []
        const locality = comps.find((c:any)=> (c.types||[]).includes('locality'))?.long_name
        const admin2 = comps.find((c:any)=> (c.types||[]).includes('administrative_area_level_2'))?.long_name
        const name = locality || admin2 || (res.formatted_address || '').split(',')[0]
        return {
          score: 90,
          identifier: `google:${res.place_id}`,
          countryCode: comps.find((c: any) => c.types?.includes('country'))?.short_name || 'CH',
          addressId: res.place_id,
          buildingId: res.place_id,
          name,
          address: name,
          latitude: res.geometry?.location?.lat || 0,
          longitude: res.geometry?.location?.lng || 0
        }
      })
      // Dédupliquer par nom
      const seen = new Set<string>()
      const hits = hitsRaw.filter((h:any)=>{
        const key = String(h.name||'').toLowerCase()
        if (!key) return false
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })

      return NextResponse.json({ hits })
    }

    // Fallback: Nominatim (OpenStreetMap)
    const url = new URL('https://nominatim.openstreetmap.org/search')
    url.searchParams.set('format', 'jsonv2')
    url.searchParams.set('addressdetails', '1')
    url.searchParams.set('limit', String(limit))
    url.searchParams.set('countrycodes', 'ch')
    url.searchParams.set('accept-language', 'fr')
    const nq = [q, city || region].filter(Boolean).join(', ')
    url.searchParams.set('q', nq)

    const r = await fetch(url.toString(), {
      headers: {
        // Nominatim usage policy: send valid UA
        'User-Agent': 'felora-v2/1.0 (contact@felora.app)'
      }
    })
    if (!r.ok) throw new Error(`Nominatim error ${r.status}`)
    const data = await r.json()

    // Filtrer uniquement les villes/localités et retourner le nom court
    const allowedTypes = new Set(['city','town','village','hamlet','locality','municipality'])
    const hitsRaw = (data || [])
      .filter((item:any)=> allowedTypes.has(String(item.type||'').toLowerCase()))
      .map((item: any) => {
        const name = (item.display_name || '').split(',')[0]
        return {
          score: Math.round(((item.importance || 0.5) / 1.0) * 100),
          identifier: `osm:${item.place_id}`,
          countryCode: (item.address?.country_code || 'ch').toUpperCase(),
          addressId: String(item.osm_id || item.place_id || ''),
          buildingId: String(item.osm_id || item.place_id || ''),
          name,
          address: name,
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          type: item.type
        }
      })
    const seen = new Set<string>()
    const hits = hitsRaw.filter((h:any)=>{
      const key = String(h.name||'').toLowerCase()
      if (!key) return false
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    return NextResponse.json({ hits })
  } catch (err: any) {
    console.error('Geocode search error', err)
    return NextResponse.json({ hits: [], error: 'geocode_failed' }, { status: 500 })
  }
}
