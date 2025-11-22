'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Check, ArrowRight, Sparkles, TrendingUp, Target, ShieldCheck, BarChart3, Zap } from 'lucide-react';

export default function PricingPage() {
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
                        <Link
                            href="/login"
                            className="text-sm font-semibold text-neutral-400 hover:text-white transition-colors"
                        >
                            Login
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
                            Everything you need.
                        </span>
                    </h1>

                    <p className="text-xl text-neutral-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                        Stop guessing what to build. Get instant access to data-backed market insights and validate your ideas before writing a single line of code.
                    </p>

                    {/* Pricing Card */}
                    <div className="max-w-md mx-auto relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-red-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                        <div className="relative bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl">
                            <div className="flex items-baseline justify-center gap-2 mb-2">
                                <span className="text-5xl font-bold text-white">$15</span>
                                <span className="text-neutral-400">/month</span>
                            </div>
                            <p className="text-neutral-400 text-sm mb-8">Cancel anytime. No hidden fees.</p>

                            <Link
                                href="/api/whop/checkout"
                                className="w-full py-4 px-6 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] shadow-lg shadow-orange-900/20 flex items-center justify-center gap-2"
                            >
                                Get Started <ArrowRight className="w-5 h-5" />
                            </Link>

                            <div className="mt-8 space-y-4 text-left">
                                {features.map((feature, index) => (
                                    <div key={index} className="flex items-center gap-3 text-neutral-300">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/10 flex items-center justify-center">
                                            <feature.icon className="w-3.5 h-3.5 text-orange-500" />
                                        </div>
                                        <span className="text-sm">{feature.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <p className="mt-8 text-neutral-500 text-sm">
                        Secure payment via Whop. 30-day money-back guarantee.
                    </p>
                </div>
            </section>
        </div>
    );
}
