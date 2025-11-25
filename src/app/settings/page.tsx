import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import SettingsClient from './SettingsClient'

export const metadata: Metadata = {
  title: 'Paramètres - Felora',
  description: 'Gérez vos paramètres de compte'
}

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  // Rediriger vers login si non connecté
  if (!session?.user) {
    redirect('/login?callbackUrl=/settings')
  }

  return <SettingsClient user={session.user} />
}
