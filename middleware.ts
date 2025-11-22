import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This middleware protects routes for paid users only
export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip middleware for public routes
    const publicRoutes = ['/', '/pricing', '/login', '/api/auth', '/success'];
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

    if (isPublicRoute) {
        return NextResponse.next();
    }

    // Check authentication and subscription for protected routes
    if (pathname.startsWith('/desk') || pathname.startsWith('/admin')) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

        // Get session from cookie
        const session = request.cookies.get('sb-access-token');

        if (!session) {
            // Not logged in - redirect to login
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }

        // Create Supabase client
        const supabase = createClient(supabaseUrl, supabaseKey);

        try {
            // Get user from session token
            const { data: { user }, error: authError } = await supabase.auth.getUser(session.value);

            if (authError || !user) {
                const loginUrl = new URL('/login', request.url);
                return NextResponse.redirect(loginUrl);
            }

            // Check if admin route
            if (pathname.startsWith('/admin')) {
                // Check if user is admin
                const { data: userData } = await supabase
                    .from('users')
                    .select('is_admin')
                    .eq('id', user.id)
                    .single();

                if (!userData?.is_admin) {
                    return NextResponse.redirect(new URL('/desk', request.url));
                }
            }

            // Check subscription status for desk routes
            if (pathname.startsWith('/desk')) {
                const { data: userData } = await supabase
                    .from('users')
                    .select('subscription_status')
                    .eq('id', user.id)
                    .single();

                const hasActiveSubscription =
                    userData?.subscription_status === 'active' ||
                    userData?.subscription_status === 'trialing';

                if (!hasActiveSubscription) {
                    // No active subscription - redirect to pricing
                    const pricingUrl = new URL('/pricing', request.url);
                    pricingUrl.searchParams.set('message', 'subscription-required');
                    return NextResponse.redirect(pricingUrl);
                }
            }

            return NextResponse.next();
        } catch (error) {
            console.error('Middleware error:', error);
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (public directory)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)',
    ],
};
