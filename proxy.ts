import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/dashboard/login']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always allow the login page through
  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next()

  // Check the session cookie set by lib/auth.ts login()
  const session = request.cookies.get('mila_session')
  if (!session?.value) {
    const loginUrl = new URL('/dashboard/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
