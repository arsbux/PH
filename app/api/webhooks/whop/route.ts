import { NextRequest, NextResponse } from 'next/server';
import { updateUserSubscription, logWebhookEvent } from '@/lib/subscription';
import crypto from 'crypto';

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

        console.log('📥 Webhook received');

        // 1. Debugging Logs (Check Vercel logs to see these)
        if (!webhookSecret) {
            console.error('❌ CRITICAL: WHOP_WEBHOOK_SECRET is missing in env variables');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        if (!signature) {
            console.error('❌ Missing x-whop-signature header from Whop');
            return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
        }

        // 2. Verify Signature (HMAC SHA256)
        // Create a hash using the body and your secret
        const calculatedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(body)
            .digest('hex');

        // Compare the calculated signature with the one from Whop
        // We use timingSafeEqual to prevent timing attacks
        const isValid = crypto.timingSafeEqual(
            Buffer.from(calculatedSignature),
            Buffer.from(signature)
        );

        if (!isValid) {
            console.error('❌ Invalid webhook signature. Potential spoofing attempt.');
            console.log('Expected:', calculatedSignature);
            console.log('Received:', signature);
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        // 3. Process Event
        const event = JSON.parse(body);
        console.log('✅ Signature verified. Processing event:', event.type);

        // Log to database
        await logWebhookEvent({
            eventType: event.type,
            whopUserId: event.data?.user?.id || event.data?.user_id,
            whopMembershipId: event.data?.id || event.data?.membership_id,
            payload: event,
        });

        // Handle events
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
                console.log('ℹ️ Unhandled event type:', event.type);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('❌ Webhook Error:', error);
        return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
    }
}

async function handleMembershipActivated(data: any) {
    console.log('🔄 Processing Membership Activation');
    const userId = data.user?.id || data.user_id;
    const email = data.user?.email || data.email;

    if (!userId) {
        console.error('❌ No user ID found in webhook data');
        return;
    }

    await updateUserSubscription({
        whopUserId: userId,
        whopMembershipId: data.id,
        status: 'active',
        email: email,
        expiresAt: data.expires_at,
    });
}

async function handleMembershipDeactivated(data: any) {
    console.log('🔄 Processing Membership Deactivation');
    await updateUserSubscription({
        whopUserId: data.user?.id || data.user_id,
        whopMembershipId: data.id,
        status: 'canceled',
    });
}

async function handlePaymentSucceeded(data: any) {
    console.log('💰 Processing Payment Success');
    await updateUserSubscription({
        whopUserId: data.user?.id || data.user_id,
        whopMembershipId: data.membership_id || data.id,
        status: 'active',
    });
}
