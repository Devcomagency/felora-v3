'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface User {
  id: string
  name: string
  email: string
  role: 'ESCORT' | 'CLIENT' | 'ADMIN' | 'SALON'
  image?: string
  verified?: boolean
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: { email: string; password: string }) => Promise<boolean>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true)
    } else {
      setIsLoading(false)
      
      if (session?.user) {
        setUser({
          id: session.user.id as string,
          name: session.user.name || '',
          email: session.user.email || '',
          role: ((session.user as any).role as any) || 'CLIENT',
          image: session.user.image || undefined,
          verified: (session.user as any).verified || false
        })
      } else {
        setUser(null)
      }
    }
  }, [session, status])

  const login = async (credentials: { email: string; password: string }): Promise<boolean> => {
    try {
      // Cette fonction sera implémentée avec signIn de next-auth
      return true
    } catch (error) {
      console.error('Erreur de connexion:', error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData })
    }
  }

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
