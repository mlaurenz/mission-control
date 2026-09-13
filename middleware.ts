import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/api/auth/token'];

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Let API auth endpoint through
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check for magic token in URL — sets cookie and redirects clean
  const token = searchParams.get('token');
  if (token) {
    const validToken = process.env.MAGIC_LINK_TOKEN || '';
    if (validToken && token === validToken) {
      const url = request.nextUrl.clone();
      url.searchParams.delete('token');
      const response = NextResponse.redirect(url);
      response.cookies.set('mc_session', token, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
      return response;
    }
  }

  // Check session cookie
  const session = request.cookies.get('mc_session')?.value;
  const validToken = process.env.MAGIC_LINK_TOKEN || '';

  if (validToken && session === validToken) {
    return NextResponse.next();
  }

  // No valid session — show login page (unless already there)
  if (pathname === '/login') {
    return NextResponse.next();
  }

  // Protect API routes too — return 401
  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Redirect to login
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = '/login';
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    // Match everything except static assets and _next
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
