import { NextResponse } from 'next/server';
import { getWhopCheckoutUrl } from '@/lib/whop';

/**
 * GET /api/whop/checkout
 * 
 * Redirects user to Whop checkout page with success redirect URL
 */
export async function GET() {
    try {
        // Use production URL or localhost for redirect
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const successUrl = `${baseUrl}/success-producthuntr`;

        const checkoutUrl = getWhopCheckoutUrl(successUrl);
        return NextResponse.redirect(checkoutUrl);
    } catch (error) {
        console.error('Error generating checkout URL:', error);
        return NextResponse.json(
            { error: 'Failed to generate checkout URL' },
            { status: 500 }
        );
    }
}
