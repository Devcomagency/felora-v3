import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function DashboardRedirectPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/login')
  }

  // Déterminer la redirection basée sur le rôle
  const userRole = (session.user as any)?.role

  if (userRole === 'ESCORT') {
    redirect('/dashboard-escort')
  } else if (userRole === 'CLUB') {
    redirect('/dashboard-club') 
  } else if (userRole === 'ADMIN') {
    redirect('/admin/dashboard')
  } else {
    // Utilisateur CLIENT ou rôle inconnu - vers page d'accueil
    redirect('/')
  }

  // Cette ligne ne devrait jamais être atteinte
  return null
}