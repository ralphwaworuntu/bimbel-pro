import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
    const url = request.nextUrl;
    const { pathname } = url;
    const hostname = request.headers.get('host') ?? '';

    // Handle subdomain extraction
    // Localhost: foo.localhost:3000 -> foo
    // Production: foo.bimbelpro.com -> foo
    let currentHost = hostname;
    if (process.env.NODE_ENV === 'production') {
        const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'bimbelpro.com';
        currentHost = hostname.replace(`.${rootDomain}`, '');
    } else {
        currentHost = hostname.replace('.localhost:3000', '');
    }

    // Check if it's the main domain
    // If replacement didn't change anything (except port), or it's 'www', it's main.
    // For localhost:3000, currentHost is 'localhost:3000'.
    const isMainDomain =
        currentHost === 'localhost:3000' ||
        currentHost === (process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'bimbelpro.com') ||
        currentHost === 'www';

    // If it's a tenant subdomain
    if (!isMainDomain) {
        // Exclude internal paths
        if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.startsWith('/static') || pathname.includes('.')) {
            return NextResponse.next();
        }

        // Rewrite to the tenant page
        // e.g. foo.bimbelpro.com/about -> /_sites/foo/about
        return NextResponse.rewrite(new URL(`/_sites/${currentHost}${pathname}`, request.url));
    }

    // Protect admin routes on main domain
    if (pathname.startsWith('/admin')) {
        const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
        if (!token) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
