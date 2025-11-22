'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Check, ArrowRight, Sparkles, TrendingUp, Target, ShieldCheck, BarChart3, Zap } from 'lucide-react';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function PricingPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        if (searchParams.get('checkout') === 'true') {
            // Redirect to checkout API
            window.location.href = '/api/whop/checkout';
        }
    }, [searchParams]);

    const features = [
        { icon: TrendingUp, text: 'Real-time trend velocity tracking' },
        { icon: Target, text: 'Blue Ocean market gap analysis' },
        { icon: ShieldCheck, text: 'AI-powered idea validation' },
        { icon: BarChart3, text: 'Access to 50,000+ launch analytics' },
        { icon: Sparkles, text: 'Competitor intelligence reports' },
        { icon: Zap, text: 'Niche success probability scores' },
    ];

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-md border-b border-neutral-900 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 relative rounded-xl overflow-hidden shadow-lg shadow-orange-600/20">
                            <Image src="/Favicon.png" alt="Logo" fill className="object-cover" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-white">Product Huntr</span>
                    </Link>

                    <div className="flex items-center gap-6">
                        <Link href="/#features" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">
                            Features
                        </Link>
                        <Link href="/login" className="text-sm font-semibold bg-white text-black px-5 py-2.5 rounded-full hover:bg-neutral-200 transition-all">
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-40 pb-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900 border border-neutral-800 text-sm font-medium text-orange-500 mb-8">
                        <Sparkles className="w-4 h-4" />
                        Simple, transparent pricing
                    </div>

                    <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
                        One plan.<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
                            Everything included.
                        </span>
                    </h1>

                    <p className="text-xl text-neutral-400 max-w-2xl mx-auto mb-16">
                        Get full access to all features, data, and insights. No hidden fees, no surprises.
                    </p>
                </div>
            </section>

            {/* Pricing Card */}
            <section className="pb-32 px-6">
                <div className="max-w-2xl mx-auto">
                    <div className="relative bg-gradient-to-b from-neutral-900 to-black border border-neutral-800 rounded-3xl p-10 shadow-2xl">
                        {/* Popular Badge */}
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-orange-600 text-white text-xs font-bold uppercase tracking-wider rounded-full">
                            Best Value
                        </div>

                        {/* Header */}
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-bold text-white mb-2">Pro Plan</h2>
                            <p className="text-neutral-400">For serious founders and makers</p>
                        </div>

                        {/* Price */}
                        <div className="text-center mb-10">
                            <div className="flex items-baseline justify-center gap-2 mb-2">
                                <span className="text-6xl font-bold text-white">$15</span>
                                <span className="text-2xl text-neutral-500">/month</span>
                            </div>
                            <p className="text-sm text-neutral-500">Billed monthly • Cancel anytime</p>
                        </div>

                        {/* CTA Button */}
                        <a
                            href="/api/whop/checkout"
                            className="w-full block text-center py-4 bg-orange-600 text-white rounded-xl font-bold text-lg hover:bg-orange-700 transition-all hover:scale-105 shadow-xl shadow-orange-600/20 mb-10"
                        >
                            Get Started Now <ArrowRight className="inline w-5 h-5 ml-2" />
                        </a>

                        {/* Features List */}
                        <div className="space-y-4 mb-8">
                            <div className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-4">
                                Everything included:
                            </div>
                            {features.map((feature, i) => {
                                const Icon = feature.icon;
                                return (
                                    <div key={i} className="flex items-center gap-3 text-neutral-300">
                                        <div className="w-5 h-5 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                                            <Check className="w-3 h-3 text-orange-500 stroke-[3]" />
                                        </div>
                                        <Icon className="w-4 h-4 text-neutral-500" />
                                        <span>{feature.text}</span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Additional Benefits */}
                        <div className="pt-8 border-t border-neutral-800">
                            <div className="grid grid-cols-3 gap-6 text-center">
                                <div>
                                    <div className="text-2xl font-bold text-white mb-1">50k+</div>
                                    <div className="text-xs text-neutral-500 uppercase tracking-wider">Launches</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-white mb-1">100+</div>
                                    <div className="text-xs text-neutral-500 uppercase tracking-wider">Niches</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-white mb-1">Daily</div>
                                    <div className="text-xs text-neutral-500 uppercase tracking-wider">Updates</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Trust Indicators */}
                    <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-neutral-500">
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" />
                            <span>Cancel anytime</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" />
                            <span>Instant access</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" />
                            <span>Secure payment</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24 px-6 border-t border-neutral-900">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-white text-center mb-12">
                        Frequently Asked Questions
                    </h2>

                    <div className="space-y-6">
                        <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-2">Can I cancel anytime?</h3>
                            <p className="text-neutral-400">
                                Yes! You can cancel your subscription at any time. No questions asked, no hidden fees.
                            </p>
                        </div>

                        <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-2">Is there a free trial?</h3>
                            <p className="text-neutral-400">
                                We don't offer a free trial, but we do offer a full refund within 7 days if you're not satisfied.
                            </p>
                        </div>

                        <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-2">What payment methods do you accept?</h3>
                            <p className="text-neutral-400">
                                We accept all major credit cards (Visa, Mastercard, American Express) via Stripe.
                            </p>
                        </div>

                        <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-2">Do you offer discounts for annual plans?</h3>
                            <p className="text-neutral-400">
                                Currently, we only offer monthly billing at $15/month. Annual plans may be available in the future.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 px-6 bg-gradient-to-b from-black to-neutral-950">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-bold text-white mb-6">
                        Ready to discover your next big opportunity?
                    </h2>
                    <p className="text-xl text-neutral-400 mb-10">
                        Join hundreds of founders making data-driven decisions.
                    </p>
                    <a
                        href="/api/whop/checkout"
                        className="inline-flex items-center gap-2 px-10 py-4 bg-orange-600 text-white rounded-full font-bold text-lg hover:bg-orange-700 transition-all hover:scale-105 shadow-xl shadow-orange-600/20"
                    >
                        Get Started for $15/month <ArrowRight className="w-5 h-5" />
                    </a>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-neutral-900 bg-black">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 relative rounded-lg overflow-hidden">
                            <Image src="/Favicon.png" alt="Logo" fill className="object-cover" />
                        </div>
                        <span className="font-bold text-white">Product Huntr</span>
                    </div>
                    <div className="flex gap-8 text-sm font-medium text-neutral-400">
                        <Link href="/#features" className="hover:text-white transition-colors">Features</Link>
                        <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
                        <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
                        <Link href="#" className="hover:text-white transition-colors">Terms</Link>
                    </div>
                    <div className="text-sm text-neutral-500">
                        © 2025 Product Huntr. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
