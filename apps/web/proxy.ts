import { type NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * List of routes that require authentication
 */
const protectedRoutes = ['/', '/cart', '/profile'];

/**
 * Middleware for route protection
 * Checks for authentication cookie and redirects to login if missing
 * Applied to all routes except API, static files, and images
 */
export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);

  const cookie = (await cookies()).get('mz_session')?.value;

  if (isProtectedRoute && !cookie) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)']
};
