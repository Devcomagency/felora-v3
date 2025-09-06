'use client'

// import { useSession, signIn, signOut } from 'next-auth/react' // Désactivé temporairement
import { useRouter } from 'next/navigation'

export function useAuth() {
  // const { data: session, status } = useSession() // Désactivé temporairement
  const session = null
  const status = 'loading'
  const router = useRouter()

  const login = async (email: string, password: string) => {
    // const result = await signIn('credentials', { // Désactivé temporairement
    //   email,
    //   password,
    //   redirect: false,
    // })
    const result = { ok: true } // Mock result

    if (result?.ok) {
      router.push('/')
      router.refresh()
    }

    return result
  }

  const logout = async () => {
    // await signOut({ redirect: false }) // Désactivé temporairement
    router.push('/auth/signin')
    router.refresh()
  }

  const loginWithGoogle = async () => {
    // await signIn('google', { callbackUrl: '/' }) // Désactivé temporairement
    console.log('Google login disabled temporarily')
  }

  return {
    user: session?.user || null,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    login,
    logout,
    loginWithGoogle,
  }
}