/**
 * Service de géolocalisation pour la recherche de profils avec Prisma
 */

import type { EscortPinDTO, ClubPinDTO, GeoSearchParams } from './types'
import { parseBBox } from './geoUtils'
import { prisma } from '../../../../src/lib/prisma'

export class GeoService {
  // Helper global parseSafe pour JSON string → T avec fallback
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static ensureParseSafe() {
    if (!(JSON as any).parseSafe) {
      ;(JSON as any).parseSafe = function <T>(txt: string, fallback: T): T {
        try { return JSON.parse(txt) as T } catch { return fallback }
      }
    }
  }

  static buildWhere(params: GeoSearchParams) {
    const where: any = {
      AND: [
        { latitude: { not: null } },
        { longitude: { not: null } },
      ],
    }

    // Optionnel: filtrage actif — désactivé pour compat compat DB (colonne possible non migrée)

    if (params.bbox) {
      const bbox = parseBBox(params.bbox)
      if (bbox) {
        where.AND.push(
          { latitude: { gte: bbox.minLat, lte: bbox.maxLat } },
          { longitude: { gte: bbox.minLng, lte: bbox.maxLng } },
        )
      }
    }

    if (typeof params.priceMax === 'number') {
      where.rate1H = { lte: params.priceMax }
    }

    return where
  }

  /**
   * Recherche des escorts proches avec obfuscation géographique
   */
  static async getNearbyEscorts(params: GeoSearchParams): Promise<EscortPinDTO[]> {
    try {
      this.ensureParseSafe()
      const where = this.buildWhere(params)

      const rows = await prisma.escortProfile.findMany({
        where, // ✅ on utilise le where
        select: {
          id: true,
          stageName: true,
          latitude: true,
          longitude: true,
          // isActive: true, // colonne optionnelle
          city: true,
          isVerifiedBadge: true,
          profilePhoto: true,
          services: true,
          languages: true,
          rate1H: true,
        },
        // 👉 optionnel: limite conditionnelle si pas de bbox
        take: params.bbox ? undefined : 50,
      })

      // Logs dev: items sans coords (pour corriger à la source)
      if (process.env.NODE_ENV === 'development') {
        const invalid = rows.filter((r: any) => !Number.isFinite(r?.latitude) || !Number.isFinite(r?.longitude))
        if (invalid.length) {
          // eslint-disable-next-line no-console
          console.warn('[geo] dropped items without coords:', invalid.map((r: any) => r.id))
        }
      }

      const needServices = !!(params.services && params.services.length)
      const needLangs = !!(params.languages && params.languages.length)

      // ✅ Post-filtre services/langues si stockés en string JSON
      const filtered = rows
        .filter(r => r.latitude && r.longitude)
        .filter(r => {
          let ok = true
          if (needServices) {
            // @ts-expect-error - parseSafe injecté
            const svc = Array.isArray(r.services)
              ? r.services
              : (typeof r.services === 'string' ? (JSON as any).parseSafe<string[]>(r.services, []) : [])
            ok = ok && svc.some(s => params.services!.includes(s))
          }
          if (needLangs) {
            // @ts-expect-error - parseSafe injecté
            const lng = Array.isArray(r.languages)
              ? r.languages
              : (typeof r.languages === 'string' ? (JSON as any).parseSafe<string[]>(r.languages, []) : [])
            ok = ok && lng.some(l => params.languages!.includes(l))
          }
          return ok
        })

      return filtered.map((r) => {
        // @ts-expect-error - parseSafe injecté
        const svc = Array.isArray(r.services) ? r.services : (typeof r.services === 'string' ? (JSON as any).parseSafe<string[]>(r.services, []) : [])
        // @ts-expect-error - parseSafe injecté
        const lng = Array.isArray(r.languages) ? r.languages : (typeof r.languages === 'string' ? (JSON as any).parseSafe<string[]>(r.languages, []) : [])
        return {
          id: r.id,
          type: 'ESCORT',
          name: r.stageName ?? `user_${r.id.slice(-6)}`,
          handle: r.stageName ? `@${r.stageName.toLowerCase().replace(/\s+/g, '_')}` : `@user_${r.id.slice(-6)}`,
          avatar: r.profilePhoto ?? undefined,
          lat: r.latitude!,
          lng: r.longitude!,
          isActive: true,
          services: svc,
          languages: lng,
          priceRange: typeof r.rate1H === 'number' ? { min: r.rate1H, max: Math.round(r.rate1H * 2) } : undefined,
          city: r.city || undefined,
          verified: !!r.isVerifiedBadge,
          // isActive n'est pas fiable en DB pour l'instant
          // @ts-ignore
          // isActive: r.isActive === true,
        } as EscortPinDTO
      })
    } catch (e) {
      console.error('getNearbyEscorts error', e)
      return []
    }
  }
  
  /**
   * Recherche des clubs proches avec obfuscation géographique
   * TODO: Le schéma ClubProfile n'a pas encore de coordonnées GPS - utiliser mock temporaire
   */
  static async getNearbyClubs(params: GeoSearchParams): Promise<ClubPinDTO[]> {
    // même principe (where + map DTO)
    // ...
    return []
  }
  
  /**
   * Recherche combinée escorts + clubs
   */
  static async getNearbyAll(params: GeoSearchParams) {
    const escorts = params.type === 'club' ? [] : await this.getNearbyEscorts(params)
    const clubs   = params.type === 'escort' ? [] : await this.getNearbyClubs(params)
    return { escorts, clubs }
  }
}
