import { NextRequest, NextResponse } from 'next/server';
import { hasActiveMembership } from '@/lib/whop';

/**
 * GET /api/whop/verify
 * 
 * Check if the current user has an active Whop membership
 */
export async function GET(request: NextRequest) {
    try {
        // Get user ID from session/cookies
        // For now, we'll expect it as a query parameter
        const userId = request.nextUrl.searchParams.get('user_id');

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID required', hasAccess: false },
                { status: 400 }
            );
        }

        const hasAccess = await hasActiveMembership(userId);

        return NextResponse.json({
            hasAccess,
            userId,
        });
    } catch (error) {
        console.error('Error verifying membership:', error);
        return NextResponse.json(
            { error: 'Failed to verify membership', hasAccess: false },
            { status: 500 }
        );
    }
}
