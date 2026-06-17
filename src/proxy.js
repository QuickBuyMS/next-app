/**
 * Next.js Proxy — route protection (replaces deprecated middleware.js in Next.js 16)
 * Replaces mobile's authGuard.tsx component guard
 * Runs on the server before every matched request
 */
import { NextResponse } from 'next/server';

// Routes that require authentication
const protectedRoutes = ['/cart', '/checkout', '/wishlist', '/orders', '/addresses'];

// Routes only for unauthenticated users
const authRoutes = ['/signin', '/signup', '/products'];

export function proxy(request) {
  const { pathname } = request.nextUrl;
  // Check for the HttpOnly refreshToken cookie — if it exists, user has an active session
  const refreshToken = request.cookies.get('refreshToken')?.value;

  // If trying to access protected routes without auth → redirect to signin
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  if (isProtected && !refreshToken) {
    const signinUrl = new URL('/signin', request.url);
    signinUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signinUrl);
  }

  // If authenticated user tries to access auth pages → redirect to products
  const isAuthRoute = authRoutes.some((route) =>
    pathname.startsWith(route)
  );
  console.log(pathname, isAuthRoute, refreshToken)
  if (isAuthRoute && refreshToken) {
    return NextResponse.redirect(new URL('/products', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/cart/:path*', '/checkout/:path*', '/wishlist/:path*', '/orders/:path*', '/addresses/:path*', '/signin', '/signup'],
};
