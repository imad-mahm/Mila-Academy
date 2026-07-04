'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, hasAccess, type SessionUser, type Resource } from '@/lib/auth'

interface Result {
  user: SessionUser | null
  loading: boolean
}

/**
 * Guards a dashboard page by resource access.
 * Redirects to /dashboard/login if not logged in,
 * or to /dashboard if the user's role cannot view that resource.
 */
export function useRequireAccess(resource: Resource): Result {
  const [user,    setUser]    = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const u = getCurrentUser()
    if (!u) {
      router.replace('/dashboard/login')
      return
    }
    if (!hasAccess(resource, 'view', u)) {
      router.replace('/dashboard')
      return
    }
    setUser(u)
    setLoading(false)
  }, [resource, router])

  return { user, loading }
}
