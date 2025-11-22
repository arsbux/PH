import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const path = request.nextUrl.pathname;

    // Public routes that DON'T need authentication
    const publicPaths = [
        '/',
        '/login',
        '/pricing',
        '/success',
        '/api/whop/checkout',
        '/api/auth/signup-from-checkout',
        '/api/auth/sync-status',
        '/api/webhooks/whop',
    ];

    // Check if path is public
    const isPublic = publicPaths.some(route => path === route || path.startsWith(route + '/'));

    if (isPublic) {
        return response;
    }

    // For protected routes, check authentication
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                },
            },
        }
    );

    const { data: { session } } = await supabase.auth.getSession();

    // If no session, redirect to login
    if (!session) {
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('next', path);
        return NextResponse.redirect(redirectUrl);
    }

    // Admin routes check
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
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
