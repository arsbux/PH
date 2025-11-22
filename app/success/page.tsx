'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

export default function SuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        checkPaymentAndSetup();
    }, []);

    async function checkPaymentAndSetup() {
        try {
            // Get current user session
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                // User needs to sign in first
                router.push('/login?redirected=true&message=Please sign in to access your subscription');
                return;
            }

            setUser(session.user);

            // Call the sync endpoint to pull latest status from Whop
            const response = await fetch('/api/auth/sync-status');
            const data = await response.json();

            if (data.success) {
                setStatus('success');
                // Optional: Auto-redirect after a few seconds
                setTimeout(() => {
                    router.push('/desk');
                }, 3000);
            } else {
                // If sync failed (e.g. no membership found yet), wait and try again or show error
                console.warn('Sync failed:', data.message);
                // Fallback to old method: check local DB one last time
                const { data: userData } = await supabase
                    .from('users')
                    .select('subscription_status')
                    .eq('id', session.user.id)
                    .single();

                if (userData?.subscription_status === 'active' || userData?.subscription_status === 'trialing') {
                    setStatus('success');
                } else {
                    setStatus('error');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            setStatus('error');
        }
    }

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Finalizing your account...</h2>
                    <p className="text-neutral-400">Syncing your subscription with Whop</p>
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
                <div className="max-w-md text-center">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">⚠️</span>
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Something went wrong</h2>
                    <p className="text-neutral-400 mb-8">
                        We couldn't verify your subscription automatically. Please contact support if you've been charged.
                    </p>
                    <Link
                        href="/desk"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-all"
                    >
                        Try Dashboard Anyway
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
            <div className="max-w-2xl text-center">
                {/* Success Icon */}
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                    <div className="absolute inset-0 bg-green-500 rounded-full blur-xl opacity-20"></div>
                    <CheckCircle2 className="w-12 h-12 text-green-500 relative z-10" />
                </div>

                {/* Success Message */}
                <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                    Welcome to Product Huntr Pro! 🎉
                </h1>

                <p className="text-xl text-neutral-400 mb-8">
                    Your subscription is now active. You have full access to all features.
                </p>

                {/* What's Included */}
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-8 mb-8 text-left">
                    <h3 className="text-lg font-bold text-white mb-4">What you get:</h3>
                    <ul className="space-y-3">
                        {[
                            'Real-time trend velocity tracking',
                            'Blue Ocean market gap analysis',
                            'AI-powered idea validation',
                            'Access to 50,000+ launch analytics',
                            'Competitor intelligence reports',
                            'Priority support',
                        ].map((feature, i) => (
                            <li key={i} className="flex items-center gap-3 text-neutral-300">
                                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/desk"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-600 text-white rounded-full font-bold text-lg hover:bg-orange-700 transition-all hover:scale-105 shadow-xl shadow-orange-600/20"
                    >
                        Go to Dashboard <ArrowRight className="w-5 h-5" />
                    </Link>

                    <Link
                        href="/desk/idea-validator"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-neutral-900 border border-neutral-800 text-white rounded-full font-bold text-lg hover:bg-neutral-800 transition-all"
                    >
                        Validate Your First Idea
                    </Link>
                </div>

                {/* Invoice Info */}
                <p className="text-sm text-neutral-500 mt-8">
                    You'll receive a receipt at {user?.email || 'your email'}. <br />
                    Manage your subscription anytime from your dashboard.
                </p>
            </div>
        </div>
    );
}
