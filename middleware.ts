import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
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

    const path = request.nextUrl.pathname;

    // Public routes (no auth required)
    const publicRoutes = ['/', '/login', '/pricing', '/success', '/api/webhooks/whop', '/api/whop/checkout'];
    if (publicRoutes.some(route => path.startsWith(route))) {
        return response;
    }

    // Protected routes (require login only)
    if (!session) {
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('next', path);
        return NextResponse.redirect(redirectUrl);
    }

    // Admin routes
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
