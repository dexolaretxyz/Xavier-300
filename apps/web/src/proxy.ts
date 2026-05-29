import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default function proxy(request: NextRequest) {
  const token = request.cookies.get('xavier_access_token')?.value
  const { pathname } = request.nextUrl

  const protectedPaths = [
    '/dashboard',
    '/courses',
    '/exam',
    '/leaderboard',
    '/profile',
    '/support',
    '/admin',
    '/teacher'
  ]

  const authPaths = ['/login', '/signup', '/verify', '/forgot-password', '/reset-password']

  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))
  const isAuthPath = authPaths.some(path => pathname.startsWith(path))

  if (isProtectedPath && !token) {
    const url = new URL('/login', request.url)
    url.searchParams.set('callbackUrl', encodeURI(request.url))
    return NextResponse.redirect(url)
  }

  if (isAuthPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/courses/:path*',
    '/exam/:path*',
    '/leaderboard/:path*',
    '/profile/:path*',
    '/support/:path*',
    '/admin/:path*',
    '/teacher/:path*',
    '/login',
    '/signup',
    '/verify',
    '/forgot-password',
    '/reset-password',
  ],
}
