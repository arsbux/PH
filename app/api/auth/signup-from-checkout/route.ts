import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/subscription';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
        }

        // Create Supabase auth user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm since they paid
        });

        if (authError) {
            console.error('Auth Error:', authError);
            return NextResponse.json({ error: authError.message }, { status: 400 });
        }

        // Wait for trigger to create public.users record
        await new Promise(resolve => setTimeout(resolve, 500));

        // Update to set subscription_status = 'active' (they paid to get here)
        const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({
                subscription_status: 'active',
            })
            .eq('id', authData.user.id);

        if (updateError) {
            console.error('Update Error:', updateError);
        }

        // Create session for the user
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
