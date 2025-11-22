import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/subscription';

export async function POST(request: Request) {
    try {
        const { email, password, receiptId } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
        }

        // 1. Verify the email has a valid Whop membership
        if (receiptId) {
            const whopResponse = await fetch(`https://api.whop.com/api/v2/memberships?email=${encodeURIComponent(email)}`, {
                headers: {
                    'Authorization': `Bearer ${process.env.WHOP_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!whopResponse.ok) {
                console.error('Whop API Error:', await whopResponse.text());
                return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
            }

            const whopData = await whopResponse.json();
            const memberships = whopData.data || [];

            const validMembership = memberships.find((m: any) =>
                (m.status === 'active' || m.status === 'trialing') &&
                (!process.env.WHOP_PRODUCT_ID || m.product_id === process.env.WHOP_PRODUCT_ID)
            );

            if (!validMembership) {
                return NextResponse.json({ error: 'No valid membership found for this email' }, { status: 400 });
            }
        }

        // 2. Create Supabase auth user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm since they paid
        });

        if (authError) {
            console.error('Auth Error:', authError);
            return NextResponse.json({ error: authError.message }, { status: 400 });
        }

        // 3. The trigger will auto-create the public.users record
        // But we'll update it to set subscription_status = 'active'
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait for trigger

        const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({
                subscription_status: 'active',
            })
            .eq('id', authData.user.id);

        if (updateError) {
            console.error('Update Error:', updateError);
        }

        // 4. Create session for the user
        const supabase = createRouteHandlerClient({ cookies });
        const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (sessionError) {
            return NextResponse.json({ error: 'Account created but login failed. Please try logging in.' }, { status: 500 });
        }

        return NextResponse.json({ success: true, user: sessionData.user });

    } catch (error) {
        console.error('Signup Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
