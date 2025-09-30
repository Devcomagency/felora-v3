/**
 * Zod Validators for Profile Test APIs
 * Input validation and sanitization
 */

import { z, ZodError } from 'zod'

// ID Parameter validation
export const ProfileParamsSchema = z.object({
  id: z.string()
    .min(1, 'ID cannot be empty')
    .max(100, 'ID too long')
    .regex(/^[a-zA-Z0-9\-_]+$/, 'Invalid ID format')
})

// Query parameters for profile endpoints
export const ProfileQuerySchema = z.object({
  include_media: z.string().optional().transform(val => val === 'true'),
  include_stats: z.string().optional().transform(val => val === 'true'),
  cache_bust: z.string().optional()
}).optional()

// Response schemas for type safety
export const MediaItemSchema = z.object({
  type: z.enum(['image', 'video']),
  url: z.string().min(1), // Accept both full URLs and relative paths
  thumb: z.string().min(1).optional().nullable(),
  poster: z.string().min(1).optional().nullable()
})

export const StatsSchema = z.object({
  likes: z.number().int().min(0).optional(),
  followers: z.number().int().min(0).optional(),
  views: z.number().int().min(0).optional()
})

export const EscortProfileResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  handle: z.string().optional(),
  stageName: z.string().optional(),
  avatar: z.string().min(1).optional().nullable(),
  footerMedia: z.string().min(1).optional().nullable(),
  city: z.string().optional(),
  age: z.number().int().min(18).max(99).optional(),
  languages: z.array(z.string()),
  services: z.array(z.string()),
  media: z.array(MediaItemSchema),
  verified: z.boolean().optional(),
  premium: z.boolean().optional(),
  online: z.boolean().optional(),
  description: z.string().optional(),
  stats: StatsSchema.optional(),
  rates: z.object({
    hour: z.number().positive().optional(),
    twoHours: z.number().positive().optional(),
    halfDay: z.number().positive().optional(),
    fullDay: z.number().positive().optional(),
    overnight: z.number().positive().optional()
  }).optional(),
  availability: z.object({
    incall: z.boolean().optional(),
    outcall: z.boolean().optional(),
    available: z.boolean().optional(),
    schedule: z.string().optional()
  }).optional(),
  physical: z.object({
    height: z.number().positive().optional(),
    bodyType: z.string().optional(),
    hairColor: z.string().optional(),
    eyeColor: z.string().optional()
  }).optional(),
  practices: z.array(z.string()).optional(),
  workingArea: z.string().optional()
})

export const ClubProfileResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  handle: z.string().optional(),
  avatar: z.string().min(1).optional().nullable(),
  footerMedia: z.string().min(1).optional().nullable(),
  city: z.string().optional().nullable(),
  languages: z.array(z.string()),
  services: z.array(z.string()),
  media: z.array(MediaItemSchema),
  verified: z.boolean().optional(),
  premium: z.boolean().optional(),
  description: z.string().optional().nullable(),
  stats: StatsSchema.optional(),
  location: z.object({
    address: z.string().optional().nullable(),
    coordinates: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180)
    }).optional()
  }).optional(),
  contact: z.object({
    phone: z.string().optional().nullable(),
    website: z.string().min(1).optional().nullable(),
    email: z.string().email().optional().nullable()
  }).optional(),
  amenities: z.array(z.string()).optional(),
  workingHours: z.string().optional().nullable()
})

// Error response schema
export const ErrorResponseSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
  code: z.number().int().optional()
})

// Success response wrapper
export const SuccessResponseSchema = z.object({
  success: z.boolean(),
  data: z.union([EscortProfileResponseSchema, ClubProfileResponseSchema]),
  cached: z.boolean().optional(),
  timestamp: z.string().datetime().optional()
})

/**
 * Validate profile ID parameter
 */
export function validateProfileId(id: unknown): { success: true; data: string } | { success: false; error: string } {
  try {
    const result = ProfileParamsSchema.parse({ id })
    return { success: true, data: result.id }
  } catch (error) {
    if (error instanceof ZodError) {
      return { 
        success: false, 
        error: error.issues.map(e => e.message).join(', ')
      }
    }
    return { success: false, error: 'Invalid ID format' }
  }
}

/**
 * Validate query parameters
 */
export function validateQuery(query: unknown) {
  try {
    return ProfileQuerySchema.parse(query)
  } catch {
    return {}
  }
}

/**
 * Type guards for response validation
 */
export type EscortProfileResponse = z.infer<typeof EscortProfileResponseSchema>
export type ClubProfileResponse = z.infer<typeof ClubProfileResponseSchema>
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>
export type SuccessResponse = z.infer<typeof SuccessResponseSchema>

/**
 * Sanitize and validate escort profile for output
 */
export function validateEscortProfile(profile: unknown): EscortProfileResponse {
  try {
    return EscortProfileResponseSchema.parse(profile)
  } catch (error) {
    console.warn('Profile validation failed, using minimal data:', error)
    // Return minimal valid profile with demo media for onglets
    return {
      id: typeof profile === 'object' && profile && 'id' in profile ? String(profile.id) : 'unknown',
      name: 'Profile Unavailable',
      languages: [],
      services: [],
      media: [
        {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1494790108755-2616c4e1d93b?w=400&h=600&fit=crop'
        },
        {
          type: 'video',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          thumb: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop'
        },
        {
          type: 'image', 
          url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop'
        }
      ]
    }
  }
}

/**
 * Sanitize and validate club profile for output
 */
export function validateClubProfile(profile: unknown): ClubProfileResponse {
  try {
    return ClubProfileResponseSchema.parse(profile)
  } catch (error) {
    console.warn('Club profile validation failed, using minimal data:', error)
    return {
      id: typeof profile === 'object' && profile && 'id' in profile ? String(profile.id) : 'unknown',
      name: 'Club Unavailable',
      languages: [],
      services: [],
      media: [
        {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1566041510394-cf7c8fe21800?w=400&h=600&fit=crop'
        },
        {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1544376664-80b17f09d399?w=400&h=600&fit=crop'
        },
        {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1520637836862-4d197d17c90a?w=400&h=600&fit=crop'
        }
      ]
    }
  }
}