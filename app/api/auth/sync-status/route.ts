import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { updateUserSubscription } from '@/lib/subscription';

export async function GET(request: Request) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = session.user;

        // 1. Fetch memberships from Whop API
        // We filter by email to find the user's memberships
        const whopResponse = await fetch(`https://api.whop.com/api/v2/memberships?email=${encodeURIComponent(user.email!)}`, {
            headers: {
                'Authorization': `Bearer ${process.env.WHOP_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        if (!whopResponse.ok) {
            console.error('Whop API Error:', await whopResponse.text());
            return NextResponse.json({ error: 'Failed to fetch from Whop' }, { status: 500 });
        }

        const whopData = await whopResponse.json();
        const memberships = whopData.data || [];

        // 2. Find a valid membership for our product
        // You might want to filter by specific product ID if you have multiple
        const validMembership = memberships.find((m: any) =>
            (m.status === 'active' || m.status === 'trialing') &&
            (!process.env.WHOP_PRODUCT_ID || m.product_id === process.env.WHOP_PRODUCT_ID)
        );

        if (validMembership) {
            console.log('Found valid membership from sync:', validMembership.id);

            // 3. Update local database
            await updateUserSubscription({
                whopUserId: validMembership.user_id,
                whopMembershipId: validMembership.id,
                status: validMembership.status,
                email: user.email,
                expiresAt: validMembership.valid_until ? new Date(validMembership.valid_until * 1000).toISOString() : undefined,
            });

            return NextResponse.json({ success: true, status: validMembership.status });
        }

        return NextResponse.json({ success: false, message: 'No active membership found' });

    } catch (error) {
        console.error('Sync Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
