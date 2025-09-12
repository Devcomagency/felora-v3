import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function DashboardIndex() {
  const session = await getServerSession(authOptions as any)
  const role = (session as any)?.user?.role as string | undefined

  if (!session) {
    redirect('/login?redirect=%2Fdashboard')
  }

  if (role === 'CLUB' || role === 'SALON') {
    redirect('/club/profile')
  }
  if (role === 'ADMIN') {
    redirect('/admin/kyc')
  }
  if (role === 'ESCORT') {
  redirect('/dashboard-escort/profil')
  }

  // Fallback: accueil
  redirect('/')
}
