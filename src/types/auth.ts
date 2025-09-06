import { DefaultSession } from 'next-auth'

export interface User {
  id: string
  email: string
  phone?: string
  name?: string
  image?: string
  password?: string
  role: 'CLIENT' | 'ESCORT' | 'SALON' | 'ADMIN'
  createdAt: Date
  updatedAt: Date
}

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: User & DefaultSession['user']
  }
  
  interface User {
    role?: 'CLIENT' | 'ESCORT' | 'SALON' | 'ADMIN'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: 'CLIENT' | 'ESCORT' | 'SALON' | 'ADMIN'
  }
}

export interface ClientProfile {
  id: string
  userId: string
  firstName?: string
  lastName?: string
  dateOfBirth?: Date
  city?: string
  preferences?: any
  verifyLevel: number
}

export interface EscortProfile {
  id: string
  userId: string
  firstName: string
  stageName: string
  dateOfBirth: Date
  nationality: string
  languages: string[]
  city: string
  workingArea: string[]
  description: string
  services: string[]
  rates: Array<{
    duration: string
    price: number
    currency: 'CHF' | 'EUR'
  }>
  availability: {
    days: string[]
    hours: {
      start: string
      end: string
    }
  }
  profilePhoto?: string
  galleryPhotos: string[]
  videos: string[]
  status: 'PENDING' | 'VERIFIED' | 'SUSPENDED' | 'BANNED'
  views: number
  likes: number
  rating: number
  reviewCount: number
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  confirmPassword: string
  role: 'CLIENT' | 'ESCORT' | 'SALON'
  acceptTerms: boolean
  acceptAge: boolean
}

export interface SalonProfile {
  id: string
  userId: string
  companyName: string
  businessName?: string
  siret: string
  vatNumber?: string
  address: string
  city: string
  postalCode: string
  country: string
  managerName: string
  managerEmail: string
  phone: string
  website?: string
  description: string
  services: string[]
  capacity: number
  openingHours: {
    [day: string]: {
      open: string
      close: string
      closed?: boolean
    }
  }
  logo?: string
  photos: string[]
  status: 'PENDING' | 'VERIFIED' | 'SUSPENDED' | 'BANNED'
  businessDocuments?: any
  views: number
  rating: number
  reviewCount: number
  managedEscorts: string[]
}