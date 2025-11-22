import { NextRequest, NextResponse } from 'next/server';
import { updateUserSubscription, logWebhookEvent } from '@/lib/subscription';

/**
 * POST /api/webhooks/whop
 * 
 * Handles Whop webhook events and syncs subscription status to database
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const signature = request.headers.get('x-whop-signature');
        const webhookSecret = process.env.WHOP_WEBHOOK_SECRET;

        // Verify webhook signature (important for security!)
        if (!signature || !webhookSecret) {
            console.error('❌ Missing webhook signature or secret');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // TODO: Properly verify signature with crypto
        // For now, just check that it exists

        const event = JSON.parse(body);

        console.log('📥 Whop Webhook Received:', event.type);

        // Log all webhook events
        await logWebhookEvent({
            eventType: event.type,
            whopUserId: event.data?.user?.id || event.data?.user_id,
            whopMembershipId: event.data?.id,
            payload: event,
        });

        // Handle different event types
        switch (event.type) {
            case 'membership_went_valid':
            case 'membership_activated':
                await handleMembershipActivated(event.data);
                break;

            case 'membership_went_invalid':
            case 'membership_deactivated':
                await handleMembershipDeactivated(event.data);
                break;

            case 'payment_succeeded':
            case 'invoice_paid':
                await handlePaymentSucceeded(event.data);
                break;

            default:
                console.log('⚠️  Unhandled event type:', event.type);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('❌ Webhook Error:', error);
        return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
    }
}

async function handleMembershipActivated(data: any) {
    console.log('✅ Membership Activated');
    console.log('   User ID:', data.user?.id || data.user_id);
    console.log('   Membership ID:', data.id);
    console.log('   Email:', data.user?.email || data.email);

    await updateUserSubscription({
        whopUserId: data.user?.id || data.user_id,
        whopMembershipId: data.id,
        status: 'active',
        email: data.user?.email || data.email,
        expiresAt: data.expires_at,
    });
}

async function handleMembershipDeactivated(data: any) {
    console.log('❌ Membership Deactivated');
    console.log('   User ID:', data.user?.id || data.user_id);
    console.log('   Membership ID:', data.id);

    await updateUserSubscription({
        whopUserId: data.user?.id || data.user_id,
        whopMembershipId: data.id,
        status: 'canceled',
    });
}

async function handlePaymentSucceeded(data: any) {
    console.log('💰 Payment Succeeded');
    console.log('   Amount:', data.amount / 100, data.currency?.toUpperCase());
    console.log('   User ID:', data.user?.id || data.user_id);

    // Update last payment date
    await updateUserSubscription({
        whopUserId: data.user?.id || data.user_id,
        whopMembershipId: data.membership_id || data.id,
        status: 'active',
    });
}
