import { NextResponse } from 'next/server';

export function middleware(request) {
  const session = request.cookies.get('sessionid');
  const { pathname } = request.nextUrl;

  // Allow requests for next internals
  if (pathname.startsWith('/_next')) {
    return NextResponse.next();
  }

  // Never redirect API routes
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // If logged in and path does not start with /start/, redirect
  if (session && !pathname.startsWith('/start/')) {
    // allow logout
    if (pathname === '/logout') {
      return NextResponse.next();
    }
    const url = request.nextUrl.clone();
    url.pathname = '/start/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
