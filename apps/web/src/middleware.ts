import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define route categories
const authRoutes = ['/login', '/signup', '/verify', '/forgot-password', '/reset-password'];
const protectedPrefixes = ['/dashboard', '/courses', '/exam', '/leaderboard', '/profile', '/payment', '/support', '/admin', '/teacher'];
const adminPrefixes = ['/admin'];
const teacherPrefixes = ['/teacher'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public assets and api routes are skipped
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // Check if access token exists in cookies
  const token = request.cookies.get('accessToken')?.value;

  // 1. If user is trying to access auth routes while logged in, redirect to dashboard
  const isAuthRoute = authRoutes.some(route => pathname === route || pathname.startsWith(route));
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 2. Check if route is protected
  const isProtectedRoute = protectedPrefixes.some(prefix => pathname.startsWith(prefix));
  
  if (isProtectedRoute && !token) {
    // Redirect unauthenticated users to login, carrying the intended destination as a query param
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 3. Role-based checks (Basic edge decode)
  if (token && (pathname.startsWith('/admin') || pathname.startsWith('/teacher'))) {
    try {
      // Very basic JWT decode without library since we're in Edge runtime
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const payload = JSON.parse(jsonPayload);

      if (pathname.startsWith('/admin') && payload.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      if (pathname.startsWith('/teacher') && payload.role !== 'TEACHER' && payload.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch (e) {
      // If parsing fails, just let them through and let the backend reject requests
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
