import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import PublishPageClient from './PublishPageClient'

export default async function PublishPage() {
  const session = await getServerSession(authOptions as any)
  const userRole = (session as any)?.user?.role as string | undefined

  return <PublishPageClient userRole={userRole} />
}
