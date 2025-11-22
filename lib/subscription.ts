import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side client with service role (can bypass RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Update user subscription status in database
 */
export async function updateUserSubscription(data: {
    whopUserId: string;
    whopMembershipId: string;
    status: 'active' | 'past_due' | 'canceled' | 'trialing';
    email?: string;
    expiresAt?: string;
}) {
    try {
        // First, try to find user by whop_user_id
        let { data: user } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('whop_user_id', data.whopUserId)
            .single();

        // If not found and we have email, try to find by email
        if (!user && data.email) {
            const { data: userByEmail } = await supabaseAdmin
                .from('users')
                .select('*')
                .eq('email', data.email)
                .single();

            user = userByEmail;
        }

        if (!user) {
            console.log('User not found in database, will be created on first login');
            return null;
        }

        // Update user record
        const { error: userError } = await supabaseAdmin
            .from('users')
            .update({
                whop_user_id: data.whopUserId,
                whop_membership_id: data.whopMembershipId,
                subscription_status: data.status,
                subscription_expires_at: data.expiresAt || null,
                subscription_created_at: data.status === 'active' ? new Date().toISOString() : undefined,
                last_payment_at: data.status === 'active' ? new Date().toISOString() : undefined,
            })
            .eq('id', user.id);

        if (userError) {
            console.error('Error updating user:', userError);
            return null;
        }

        // Upsert subscription record
        const { error: subError } = await supabaseAdmin
            .from('subscriptions')
            .upsert({
                user_id: user.id,
                whop_user_id: data.whopUserId,
                whop_membership_id: data.whopMembershipId,
                whop_product_id: process.env.WHOP_PRODUCT_ID,
                status: data.status,
                expires_at: data.expiresAt || null,
                updated_at: new Date().toISOString(),
                canceled_at: data.status === 'canceled' ? new Date().toISOString() : null,
            }, {
                onConflict: 'whop_membership_id'
            });

        if (subError) {
            console.error('Error upserting subscription:', subError);
        }

        return user;
    } catch (error) {
        console.error('Error in updateUserSubscription:', error);
        return null;
    }
}

/**
 * Check if a user has an active subscription
 */
export async function checkUserSubscription(userId: string): Promise<boolean> {
    try {
        const { data, error } = await supabaseAdmin
            .from('users')
            .select('subscription_status')
            .eq('id', userId)
            .single();

        if (error || !data) {
            return false;
        }

        return data.subscription_status === 'active' || data.subscription_status === 'trialing';
    } catch (error) {
        console.error('Error checking subscription:', error);
        return false;
    }
}

/**
 * Log webhook event
 */
export async function logWebhookEvent(data: {
    eventType: string;
    whopUserId?: string;
    whopMembershipId?: string;
    payload: any;
}) {
    try {
        await supabaseAdmin
            .from('webhook_events')
            .insert({
                event_type: data.eventType,
                whop_user_id: data.whopUserId,
                whop_membership_id: data.whopMembershipId,
                payload: data.payload,
                processed: false,
            });
    } catch (error) {
        console.error('Error logging webhook event:', error);
    }
}
