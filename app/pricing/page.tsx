'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Check, ArrowRight, Phone } from 'lucide-react';

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FFF9F5] to-[#FFF5F0]">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 bg-[#FFF5F0]/80 backdrop-blur-md border-b border-orange-100/50 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 relative rounded-lg overflow-hidden">
                            <Image src="/Favicon.png" alt="Logo" fill className="object-cover" />
                        </div>
                        <span className="font-bold text-lg text-gray-900">Product Huntr</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors">
                            Log in
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-12 px-6">
                <div className="max-w-5xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Choose Your Plan
                    </h1>
                    <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                        Get instant access to validated business opportunities and market insights. Start finding your next big idea today.
                    </p>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="pb-20 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Basic Plan - MOST POPULAR */}
                        <div className="bg-white rounded-2xl border-2 border-gray-900 p-8 hover:shadow-xl transition-all duration-300 relative">
                            {/* Most Popular Badge */}
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <div className="px-4 py-1 bg-gray-900 text-white text-xs font-bold rounded-full flex items-center gap-1">
                                    MOST POPULAR
                                </div>
                            </div>

                            <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                Basic - Monthly Access
                            </h3>

                            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                                Full access to all Product Huntr features and market intelligence
                            </p>

                            <div className="mb-6">
                                <span className="text-5xl font-bold text-gray-900">$15</span>
                                <span className="text-gray-600">/month</span>
                            </div>

                            <Link
                                href="/api/whop/checkout"
                                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-all mb-8"
                            >
                                Get Started
                                <ArrowRight className="w-5 h-5" />
                            </Link>

                            <div className="space-y-3">
                                <p className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">All Features Included</p>
                                {[
                                    '12K+ Product Hunt launches analyzed',
                                    'Daily market trends & insights',
                                    'Real-time opportunity discovery',
                                    'Market gap analysis & R2 AI Briefing',
                                    'Launch timing analytics',
                                    'Category performance metrics',
                                    'Yesterday\'s launch data & analysis',
                                    'Competitor research tools',
                                    'Engagement pattern analysis',
                                    'Success pattern recognition',
                                    'Market landscape treemap',
                                    'Full dashboard access',
                                ].map((feature, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                                        <span className="text-gray-700 text-sm">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <p className="text-center text-sm text-gray-500 mt-6">
                                Cancel anytime. No hidden fees.
                            </p>
                        </div>

                        {/* Enterprise Plan */}
                        <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 hover:shadow-xl transition-all duration-300 relative">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                Enterprise - Custom
                            </h3>

                            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                                Tailored solutions for teams and organizations with advanced needs
                            </p>

                            <div className="mb-6">
                                <span className="text-5xl font-bold text-gray-900">Custom</span>
                            </div>

                            <Link
                                href="https://calendly.com/keithkatale1/discovery-call"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-all mb-8"
                            >
                                <Phone className="w-5 h-5" />
                                Book a Discovery Call
                            </Link>

                            <div className="space-y-3">
                                <p className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Everything in Basic, plus</p>
                                {[
                                    'Dedicated account manager',
                                    'Custom data integrations',
                                    'API access for automation',
                                    'Priority support & onboarding',
                                    'Custom reports & analytics',
                                    'Team collaboration features',
                                    'Advanced filtering & segmentation',
                                    'White-label options available',
                                    'Custom data exports',
                                    'SLA guarantees',
                                    'Quarterly strategy sessions',
                                    'Early access to new features',
                                ].map((feature, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                                        <span className="text-gray-700 text-sm">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <p className="text-center text-sm text-gray-500 mt-6">
                                Custom pricing based on your needs
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 px-6 bg-white/50 border-t border-orange-100">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Common Questions</h2>
                    <div className="space-y-6">
                        {[
                            {
                                q: "Can I cancel anytime?",
                                a: "Yes! You can cancel your subscription at any time. No questions asked, no strings attached."
                            },
                            {
                                q: "What payment methods do you accept?",
                                a: "We accept all major credit cards, debit cards, and PayPal through our secure payment processor."
                            },
                            {
                                q: "Do you offer refunds?",
                                a: "Yes, we offer a 7-day money-back guarantee. If you're not satisfied, contact us for a full refund."
                            },
                            {
                                q: "What's included in the Enterprise plan?",
                                a: "Enterprise includes everything in Basic plus custom integrations, API access, dedicated support, team features, and more. Book a call to discuss your specific needs."
                            },
                            {
                                q: "How often is the data updated?",
                                a: "Our database is updated daily with the latest Product Hunt launches. Market gap analysis and opportunity scores are recalculated in real-time."
                            }
                        ].map((faq, index) => (
                            <div key={index} className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-orange-300 transition-colors">
                                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                                <p className="text-gray-600">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-bold text-gray-900 mb-6">
                        Ready to discover your next big opportunity?
                    </h2>
                    <p className="text-xl text-gray-600 mb-8">
                        Join builders using Product Huntr to validate ideas and spot market gaps
                    </p>
                    <Link
                        href="/api/whop/checkout"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition-all text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                        Start Building Now
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
