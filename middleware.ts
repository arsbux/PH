import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Allow public routes immediately
    const publicRoutes = ['/', '/login', '/pricing', '/success', '/api/webhooks/whop'];
    if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
        return NextResponse.next();
    }

    // 2. Setup Supabase Client
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

    // 3. Get User Session
    const { data: { user } } = await supabase.auth.getUser();

    // 4. Protect /desk and /admin routes
    if (pathname.startsWith('/desk') || pathname.startsWith('/admin')) {

        // A. Not Logged In -> Redirect to Login
        if (!user) {
            const loginUrl = new URL('/login', request.url);
            // After login, go back to where they were trying to go
            loginUrl.searchParams.set('next', pathname);
            return NextResponse.redirect(loginUrl);
        }

        // B. Logged In -> Check Subscription Status
        const { data: dbUser } = await supabase
            .from('users')
            .select('subscription_status, is_admin')
            .eq('id', user.id)
            .single();

        // Admin Bypass
        if (pathname.startsWith('/admin')) {
            if (!dbUser?.is_admin) {
                return NextResponse.redirect(new URL('/desk', request.url));
            }
            return response;
        }

        // Check Subscription
        const isActive =
            dbUser?.subscription_status === 'active' ||
            dbUser?.subscription_status === 'trialing';

        if (!isActive) {
            // Inactive -> Redirect to Pricing with checkout trigger
            const pricingUrl = new URL('/pricing', request.url);
            pricingUrl.searchParams.set('checkout', 'true');
            return NextResponse.redirect(pricingUrl);
        }
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         * - api routes (except webhooks which are explicitly allowed above)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)',
    ],
};
