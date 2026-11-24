'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { hasAccess, type SessionUser, type Resource } from '@/lib/auth'
import { useSession } from '@/lib/use-session'

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
  const { user, ready } = useSession()
  const router = useRouter()

  const allowed = user !== null && hasAccess(resource, 'view', user)

  useEffect(() => {
    // `ready` is false until hydration has read localStorage — redirecting
    // before that would bounce every logged-in user straight to the login page.
    if (!ready) return
    if (!user) {
      router.replace('/dashboard/login')
      return
    }
    if (!allowed) router.replace('/dashboard')
  }, [ready, user, allowed, router])

  // Keep reporting "loading" while a redirect is pending, so callers don't
  // paint a page the user isn't allowed to see before the route changes.
  return { user: allowed ? user : null, loading: !ready || !allowed }
}
