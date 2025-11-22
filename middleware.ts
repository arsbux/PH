import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // ONLY protect /desk and /admin - everything else is PUBLIC
    const protectedPaths = ['/desk', '/admin'];
    const needsAuth = protectedPaths.some(route => path.startsWith(route));

    // If the path doesn't need auth, let it through immediately
    if (!needsAuth) {
        return NextResponse.next();
    }

    // Only check auth for protected paths
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({ name, value, ...options });
                    response = NextResponse.next({ request: { headers: request.headers } });
                    response.cookies.set({ name, value, ...options });
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({ name, value: '', ...options });
                    response = NextResponse.next({ request: { headers: request.headers } });
                    response.cookies.set({ name, value: '', ...options });
                },
            },
        }
    );

    const { data: { session } } = await supabase.auth.getSession();

    // No session? Redirect to login
    if (!session) {
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('next', path);
        return NextResponse.redirect(redirectUrl);
    }

    // Admin check
    if (path.startsWith('/admin')) {
        const { data: user } = await supabase
            .from('users')
            .select('is_admin')
            .eq('id', session.user.id)
            .single();

        if (!user?.is_admin) {
            return NextResponse.redirect(new URL('/desk', request.url));
        }
    }

    return response;
}

export const config = {
    // Only run middleware on app routes, exclude all static files and API routes
    matcher: [
        '/desk/:path*',
        '/admin/:path*',
    ],
};
