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
      url.searchParams.set('types', 'address,place,locality,neighborhood,poi')
      url.searchParams.set('access_token', MAPBOX_TOKEN)

      const r = await fetch(url.toString())
      if (!r.ok) throw new Error(`Mapbox error ${r.status}`)
      const data = await r.json()

      const hits = (data.features || []).map((f: any) => ({
        score: Math.round((f.relevance || 0) * 100),
        identifier: `mapbox:${f.id}`,
        countryCode: (f.context || []).find((c: any) => c.id?.startsWith('country'))?.short_code?.toUpperCase() || 'CH',
        addressId: f.id,
        buildingId: f.properties?.mapbox_id || f.id,
        address: f.place_name_fr || f.place_name || f.text,
        latitude: f.center?.[1] || f.geometry?.coordinates?.[1] || 0,
        longitude: f.center?.[0] || f.geometry?.coordinates?.[0] || 0
      }))

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

      const hits = (data.results || []).slice(0, limit).map((res: any) => ({
        score: 90, // Google no explicit score; assume high relevance
        identifier: `google:${res.place_id}`,
        countryCode: (res.address_components || []).find((c: any) => c.types?.includes('country'))?.short_name || 'CH',
        addressId: res.place_id,
        buildingId: res.place_id,
        address: res.formatted_address,
        latitude: res.geometry?.location?.lat || 0,
        longitude: res.geometry?.location?.lng || 0
      }))

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

    const hits = (data || []).map((item: any) => {
      const street = item.address?.road || item.address?.pedestrian || item.address?.path || item.address?.footway || ''
      const house = item.address?.house_number ? ` ${item.address.house_number}` : ''
      const city = item.address?.city || item.address?.town || item.address?.village || item.address?.municipality || ''
      const postal = item.address?.postcode || ''
      const label = [street + house, [postal, city].filter(Boolean).join(' ')].filter(Boolean).join(', ')
      return {
        score: Math.round(((item.importance || 0.5) / 1.0) * 100),
        identifier: `osm:${item.place_id}`,
        countryCode: (item.address?.country_code || 'ch').toUpperCase(),
        addressId: String(item.osm_id || item.place_id || ''),
        buildingId: String(item.osm_id || item.place_id || ''),
        address: label || item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon)
      }
    })

    return NextResponse.json({ hits })
  } catch (err: any) {
    console.error('Geocode search error', err)
    return NextResponse.json({ hits: [], error: 'geocode_failed' }, { status: 500 })
  }
}
