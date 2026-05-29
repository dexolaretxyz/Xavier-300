import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedPaths = ['/dashboard', '/courses', '/exam', '/leaderboard', '/profile', '/support'];
const authPaths = ['/login', '/signup', '/verify', '/forgot-password'];

export function proxy(request: NextRequest) {
  const token = request.cookies.get('xavier_access_token')?.value;
  const { pathname } = request.nextUrl;

  // Check if path requires authentication
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  const isAuthPath = authPaths.some(path => pathname.startsWith(path));

  // Redirect to login if accessing protected route without token
  if (isProtectedPath && !token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  // Redirect to dashboard if accessing auth route with token
  if (isAuthPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Admin routes protection
  if (pathname.startsWith('/admin') && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Note: Role-based protection (admin/teacher) requires decoding the JWT or 
  // checking with backend. For middleware, we only check if token exists. 
  // Strict role enforcement happens in the layout or via API.

  if (pathname.startsWith('/teacher') && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
