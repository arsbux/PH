import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware protects routes for paid users only
export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const response = NextResponse.next();

    // Skip middleware for public routes and API routes
    const publicRoutes = ['/', '/pricing', '/login', '/success'];
    const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));
    const isApiRoute = pathname.startsWith('/api/');
    const isStaticRoute = pathname.startsWith('/_next/') || pathname.startsWith('/static/');

    if (isPublicRoute || isApiRoute || isStaticRoute) {
        return response;
    }

    try {
        // Create Supabase client for middleware
        const supabase = createMiddlewareClient({ req: request, res: response });

        // Get user session
        const { data: { session } } = await supabase.auth.getSession();

        // Check if user is authenticated
        if (!session) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }

        const userId = session.user.id;

        // For protected routes, check subscription
        if (pathname.startsWith('/desk') || pathname.startsWith('/admin')) {
            // Get user data including subscription status
            const { data: userData, error } = await supabase
                .from('users')
                .select('subscription_status, is_admin')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching user data:', error);
                // Allow access if there's an error (fail open for now)
                return response;
            }

            // Check admin routes
            if (pathname.startsWith('/admin')) {
                if (!userData?.is_admin) {
                    return NextResponse.redirect(new URL('/desk', request.url));
                }
                return response;
            }

            // Check subscription for /desk routes
            if (pathname.startsWith('/desk')) {
                const hasActiveSubscription =
                    userData?.subscription_status === 'active' ||
                    userData?.subscription_status === 'trialing';

                if (!hasActiveSubscription) {
                    const pricingUrl = new URL('/pricing', request.url);
                    pricingUrl.searchParams.set('message', 'subscription-required');
                    return NextResponse.redirect(pricingUrl);
                }
            }
        }

        return response;
    } catch (error) {
        console.error('Middleware error:', error);
        // On error, allow access (fail open)
        return response;
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)',
    ],
};
