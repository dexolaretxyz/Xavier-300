import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Routes that require authentication
  const protectedPaths = [
    '/dashboard',
    '/courses',
    '/exam',
    '/leaderboard',
    '/profile',
    '/support',
    '/admin',
    '/teacher',
  ]

  // Routes that should redirect to dashboard if already logged in
  const authOnlyPaths = [
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
  ]

  const isProtectedPath = protectedPaths.some(
    path => pathname === path || pathname.startsWith(path + '/')
  )

  const isAuthPath = authOnlyPaths.some(
    path => pathname === path
  )

  // Try multiple cookie names for compatibility
  const token = 
    request.cookies.get('xavier_access_token')?.value ||
    request.cookies.get('token')?.value ||
    request.cookies.get('accessToken')?.value

  console.log('[PROXY]', pathname, '| token:', !!token)

  // No token on protected route — go to login
  if (isProtectedPath && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Has token on auth page — go to dashboard
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
    '/forgot-password',
    '/reset-password',
  ],
}
