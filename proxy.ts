import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/dashboard/login']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always allow the login page through
  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next()

  // Check the session cookie set by lib/auth.ts login()
  const session = request.cookies.get('mila_session')
  if (session?.value) return NextResponse.next()

  // Admin API routes each verify the caller's role themselves; this is a second
  // gate so a route added later that forgets the check still isn't reachable
  // anonymously. It answers with JSON — redirecting an API call to an HTML
  // login page would surface to fetch() as an unhelpful parse error.
  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.redirect(new URL('/dashboard/login', request.url))
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/admin/:path*'],
}
