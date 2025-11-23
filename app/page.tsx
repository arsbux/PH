'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';
import Link from 'next/link';
import Image from 'next/image';
import {
    ArrowRight, TrendingUp, Target, Sparkles, Menu, X, ChevronRight,
    BarChart3, Users, MessageCircle, Search, Zap, Layers, FileText,
    PieChart, Activity, Globe, CheckCircle2, AlertCircle, ArrowUpRight,
    Clock, Calendar, Award, TrendingDown
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, PieChart as RePieChart, Pie, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { fetchMarketTrends, fetchDailyLaunchData, fetchMarketGapData, fetchMarketOpportunities } from '@/app/actions';


// --- Mock Data for Visualizations (representing real data structures) ---

const heatmapData = [
    { day: 'Mon', hour: 12, value: 85 },
    { day: 'Tue', hour: 12, value: 92 }, // Peak
    { day: 'Wed', hour: 12, value: 88 },
    { day: 'Thu', hour: 12, value: 76 },
    { day: 'Fri', hour: 12, value: 65 },
];

export default function Home() {
    const router = useRouter();
    const [checking, setChecking] = useState(true);
    const [showLanding, setShowLanding] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showSampleModal, setShowSampleModal] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [trendsData, setTrendsData] = useState<Record<string, any> | null>(null);
    const [dailyData, setDailyData] = useState<any | null>(null);
    const [gapData, setGapData] = useState<any | null>(null);
    const [loadingTrends, setLoadingTrends] = useState(true);
    const [loadingDaily, setLoadingDaily] = useState(true);
    const [loadingGaps, setLoadingGaps] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [trends, daily] = await Promise.all([
                    fetchMarketTrends(),
                    fetchDailyLaunchData()
                ]);
                setTrendsData(trends);
                setDailyData(daily);
                if (Object.keys(trends).length > 0) {
                    setActiveCategory(Object.keys(trends)[0]);
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoadingTrends(false);
                setLoadingDaily(false);
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        async function loadTrends() {
            setLoadingTrends(true);
            const data = await fetchMarketTrends();
            setTrendsData(data);
            setLoadingTrends(false);
        }
        loadTrends();
    }, []);

    useEffect(() => {
        async function loadDaily() {
            setLoadingDaily(true);
            const data = await fetchDailyLaunchData();
            setDailyData(data);
            setLoadingDaily(false);
        }
        loadDaily();
    }, []);

    useEffect(() => {
        async function loadGaps() {
            setLoadingGaps(true);
            const data = await fetchMarketOpportunities();
            setGapData(data);
            setLoadingGaps(false);
        }
        loadGaps();
    }, []);

    useEffect(() => {
        let mounted = true;

        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                router.replace('/desk');
            } else {
                if (mounted) {
                    setShowLanding(true);
                    setChecking(false);
                }
            }
        };

        checkSession();

        return () => {
            mounted = false;
        };
    }, [router]);

    if (checking) return null;
    if (!showLanding) return null;

    return (
        <div className="min-h-screen bg-[#FFF5F0]">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 bg-[#FFF5F0]/80 backdrop-blur-md border-b border-orange-100/50 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 relative rounded-lg overflow-hidden">
                            <Image src="/Favicon.png" alt="Logo" fill className="object-cover" />
                        </div>
                        <span className="font-bold text-lg text-gray-900">Product Huntr</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="#market-trends" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                            Market Trends
                        </Link>
                        <Link href="#daily-pulse" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                            Yesterday's Launches
                        </Link>
                        <Link href="#opportunities" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                            Opportunities
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <Link href="/login" className="text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors">
                            Log in
                        </Link>
                        <Link
                            href="/pricing"
                            className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-all"
                        >
                            Start Building Now →
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-gray-600"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden absolute top-16 left-0 right-0 bg-[#FFF5F0] border-b border-orange-100 p-6 shadow-lg">
                        <div className="flex flex-col gap-4">
                            <Link href="#market-trends" className="text-base text-gray-600" onClick={() => setMobileMenuOpen(false)}>Market Trends</Link>
                            <Link href="#daily-pulse" className="text-base text-gray-600" onClick={() => setMobileMenuOpen(false)}>Yesterday's Launches</Link>
                            <Link href="#opportunities" className="text-base text-gray-600" onClick={() => setMobileMenuOpen(false)}>Opportunities</Link>
                            <Link href="/login" className="text-base text-gray-900" onClick={() => setMobileMenuOpen(false)}>Log in</Link>
                            <Link href="/pricing" className="text-center px-5 py-3 bg-gray-900 text-white font-medium rounded-full" onClick={() => setMobileMenuOpen(false)}>Start Building Now →</Link>
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden pt-20">
                {/* Animated Background */}
                <div className="absolute inset-0 -z-10 bg-[#FFF5F0]">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-300/20 rounded-full filter blur-[120px] animate-float"></div>
                    <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-orange-200/15 rounded-full filter blur-[80px] animate-float-reverse"></div>
                    <div className="absolute bottom-1/4 left-1/3 w-[500px] h-[500px] bg-rose-300/15 rounded-full filter blur-[100px] animate-float-slow"></div>
                </div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[500px] h-[300px] bg-gradient-to-r from-orange-400/30 via-rose-400/30 to-orange-400/30 rounded-full filter blur-[60px] animate-gradient"></div>

                    <h1 className="text-5xl md:text-6xl lg:text-8xl font-bold text-gray-900 mb-8 tracking-tight leading-[1.1]" style={{ fontFamily: "'Sour Gummy', cursive" }}>
                        Use Product Hunt data to find ideas and opportunities
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
                        Compare upvote velocity, comment sentiment, and category trends — spot what works before you launch.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="#daily-pulse"
                            className="w-full sm:w-auto px-8 py-4 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition-all text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 inline-flex items-center justify-center"
                        >
                            See sample analysis
                        </Link>
                        <Link
                            href="/pricing"
                            className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 rounded-full font-semibold border border-gray-300 hover:bg-gray-50 transition-all text-base inline-flex items-center justify-center gap-2 hover:-translate-y-0.5"
                        >
                            Start Building Now
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Marquee Section - Product Showcase */}
            <section className="py-16 bg-gradient-to-b from-white to-gray-50 overflow-hidden border-b border-orange-100">
                <div className="mb-12 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Featured Product Hunt Launches
                    </h2>
                    <p className="text-gray-600">
                        Real products from our analyzed database
                    </p>
                </div>

                {/* First Row - Scroll Left */}
                <div className="relative mb-8">
                    <div className="flex gap-6 animate-marquee">
                        {[
                            { name: 'Jinna AI', category: 'SaaS', votes: 523, image: 'Jinna ai -SaaS -523.avif' },
                            { name: 'MeDo by Baidu', category: 'SaaS', votes: 549, image: 'MeDo by Baidu-SaaS-549.avif' },
                            { name: 'Nimo', category: 'WebApp', votes: 586, image: 'Nimo-WebApp-586.avif' },
                            { name: 'PawChamp', category: 'App', votes: 590, image: 'PawChamp-App-590.avif' },
                            { name: 'Postiz', category: 'SaaS', votes: 632, image: 'Postiz-632.avif' },
                            { name: 'ProblemHunt', category: 'Discovery', votes: 530, image: 'ProblemHunt - Problem Discovery -530.avif' },
                            { name: 'Sentra', category: 'Payments', votes: 598, image: 'Sentra-Payments-598.avif' },
                            { name: 'Cursor', category: 'IDE', votes: 850, image: 'Cursor2.avif' },
                            { name: 'Talo', category: 'SaaS', votes: 520, image: 'Talo-saas.avif' },
                            { name: 'BlogBowl', category: 'SaaS', votes: 620, image: 'blogbowl-saas.avif' },
                            { name: 'Floqre', category: 'SaaS', votes: 703, image: 'floqre-saas-703.avif' },
                        ].concat([
                            { name: 'Jinna AI', category: 'SaaS', votes: 523, image: 'Jinna ai -SaaS -523.avif' },
                            { name: 'MeDo by Baidu', category: 'SaaS', votes: 549, image: 'MeDo by Baidu-SaaS-549.avif' },
                            { name: 'Nimo', category: 'WebApp', votes: 586, image: 'Nimo-WebApp-586.avif' },
                            { name: 'PawChamp', category: 'App', votes: 590, image: 'PawChamp-App-590.avif' },
                            { name: 'Postiz', category: 'SaaS', votes: 632, image: 'Postiz-632.avif' },
                            { name: 'ProblemHunt', category: 'Discovery', votes: 530, image: 'ProblemHunt - Problem Discovery -530.avif' },
                            { name: 'Sentra', category: 'Payments', votes: 598, image: 'Sentra-Payments-598.avif' },
                            { name: 'Cursor', category: 'IDE', votes: 850, image: 'Cursor2.avif' },
                            { name: 'Talo', category: 'SaaS', votes: 520, image: 'Talo-saas.avif' },
                            { name: 'BlogBowl', category: 'SaaS', votes: 620, image: 'blogbowl-saas.avif' },
                            { name: 'Floqre', category: 'SaaS', votes: 703, image: 'floqre-saas-703.avif' },
                        ]).map((product, index) => (
                            <div key={index} className="flex-shrink-0 bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg hover:border-orange-300 transition-all duration-300 min-w-[240px]">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                        <Image
                                            src={`/marquee/${product.image}`}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 text-sm truncate">{product.name}</h3>
                                        <p className="text-xs text-gray-500 uppercase">{product.category}</p>
                                    </div>
                                    <div className="flex items-center gap-1 px-2 py-1 bg-orange-50 rounded-lg">
                                        <span className="text-orange-600 text-xs">▲</span>
                                        <span className="text-sm font-bold text-orange-600">{product.votes}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Second Row - Scroll Right */}
                <div className="relative">
                    <div className="flex gap-6 animate-marquee-reverse">
                        {[
                            { name: 'Emma', category: 'App', votes: 575, image: 'Emma-App-575.avif' },
                            { name: 'Dynal.AI', category: 'SaaS', votes: 435, image: 'Dynal.AI -SaaS -435.avif' },
                            { name: 'Typeless', category: 'SaaS', votes: 539, image: 'Typeless-SaaS -539.avif' },
                            { name: 'Uneed Community', category: 'Community', votes: 648, image: 'UneedCommunity-648.avif' },
                            { name: 'Base44', category: 'SaaS', votes: 544, image: 'base44.avif' },
                            { name: 'Director', category: 'Web Automation', votes: 567, image: 'director-webAutomation.avif' },
                            { name: 'v0', category: 'Design', votes: 656, image: 'v0-656.avif' },
                            { name: 'v0', category: 'Design', votes: 656, image: 'v0-656.avif' },
                            { name: 'Base44', category: 'SaaS', votes: 544, image: 'base44.avif' },
                            { name: 'Director', category: 'Web Automation', votes: 567, image: 'director-webAutomation.avif' },
                            { name: 'ChatGPT Atlas', category: 'AI', votes: 611, image: 'chatgptatlas.avif' },
                        ].concat([
                            { name: 'Emma', category: 'App', votes: 575, image: 'Emma-App-575.avif' },
                            { name: 'Dynal.AI', category: 'SaaS', votes: 435, image: 'Dynal.AI -SaaS -435.avif' },
                            { name: 'Typeless', category: 'SaaS', votes: 539, image: 'Typeless-SaaS -539.avif' },
                            { name: 'Uneed Community', category: 'Community', votes: 648, image: 'UneedCommunity-648.avif' },
                            { name: 'Base44', category: 'SaaS', votes: 544, image: 'base44.avif' },
                            { name: 'Director', category: 'Web Automation', votes: 567, image: 'director-webAutomation.avif' },
                            { name: 'v0', category: 'Design', votes: 656, image: 'v0-656.avif' },
                            { name: 'v0', category: 'Design', votes: 656, image: 'v0-656.avif' },
                            { name: 'Base44', category: 'SaaS', votes: 544, image: 'base44.avif' },
                            { name: 'Director', category: 'Web Automation', votes: 567, image: 'director-webAutomation.avif' },
                            { name: 'ChatGPT Atlas', category: 'AI', votes: 611, image: 'chatgptatlas.avif' },
                        ]).map((product, index) => (
                            <div key={index} className="flex-shrink-0 bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg hover:border-orange-300 transition-all duration-300 min-w-[240px]">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                        <Image
                                            src={`/marquee/${product.image}`}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 text-sm truncate">{product.name}</h3>
                                        <p className="text-xs text-gray-500 uppercase">{product.category}</p>
                                    </div>
                                    <div className="flex items-center gap-1 px-2 py-1 bg-orange-50 rounded-lg">
                                        <span className="text-orange-600 text-xs">▲</span>
                                        <span className="text-sm font-bold text-orange-600">{product.votes}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works / Data Pipeline Section */}
            <section className="py-24 px-6 bg-white border-b border-orange-100 relative">
                {/* Mobile decorative connectors */}
                <div className="absolute inset-0 md:hidden opacity-10">
                    <div className="absolute top-4 left-4 w-24 h-24 bg-orange-200 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-4 right-4 w-24 h-24 bg-orange-300 rounded-full blur-2xl"></div>
                </div>
                <div className="max-w-7xl mx-auto">

                    <div className="text-center mb-20">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-700 text-xs font-bold uppercase tracking-wider mb-4 border border-orange-100">
                            The Intelligence Engine
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
                            From Data to Opportunities
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            We don't just show you numbers. We have 2 years-worth of Product Hunt data (12,576 products) and constantly stream live updates. This massive dataset is passed through our AI algorithms to structure it perfectly for founders and builders.
                        </p>
                    </div>

                    {/* The Flow Visual - Minimal Design */}
                    <div className="max-w-6xl mx-auto">
                        <div className="relative py-12">

                            {/* Connecting Lines Layer */}
                            <div className="absolute inset-0 pointer-events-none hidden md:block">
                                <svg className="w-full h-full" viewBox="0 0 1200 400" preserveAspectRatio="none">
                                    {/* Path 1: Left (PH) to Center (R2) */}
                                    <path d="M 350 200 L 550 200" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="8 8" />
                                    <circle r="6" fill="#F97316">
                                        <animateMotion dur="2s" repeatCount="indefinite" path="M 350 200 L 550 200" calcMode="linear" />
                                    </circle>

                                    {/* Path 2: Center (R2) to Right (Output) */}
                                    <path d="M 650 200 L 850 200" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="8 8" />
                                    <circle r="6" fill="#F97316">
                                        <animateMotion dur="2s" begin="1s" repeatCount="indefinite" path="M 650 200 L 850 200" calcMode="linear" />
                                    </circle>
                                </svg>
                            </div>

                            <div className="grid md:grid-cols-3 gap-8 items-center relative z-10">

                                {/* Left Column: Product Hunt Input */}
                                <div className="flex justify-center md:justify-end">
                                    <div className="bg-white border border-gray-200 px-8 py-8 shadow-sm text-center min-w-[240px] relative group hover:border-[#FF6154] transition-colors duration-300">
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                            Source
                                        </div>
                                        <h3 className="text-2xl font-bold text-[#FF6154] mb-2">Product Hunt</h3>
                                        <p className="text-sm text-gray-500 font-medium">Archive & Live Data</p>
                                    </div>
                                </div>

                                {/* Mobile Connector 1 */}
                                <div className="md:hidden flex justify-center -my-6 relative z-0">
                                    <div className="h-16 w-0.5 border-l-2 border-dashed border-gray-300 relative overflow-hidden">
                                        <div className="absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-orange-500 rounded-full shadow-sm shadow-orange-200 animate-flow-vertical"></div>
                                    </div>
                                </div>

                                {/* Center Column: R2 Deep Analysis */}
                                <div className="flex justify-center">
                                    <div className="bg-white border border-gray-200 px-8 py-8 shadow-sm text-center min-w-[240px] relative">
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                            The Brain
                                        </div>
                                        <h3 className="text-3xl font-bold text-gray-900 mb-2">R2</h3>
                                        <p className="text-sm text-gray-500 font-medium">Deep Analysis System</p>
                                        <div className="mt-4 flex justify-center gap-1">
                                            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Mobile Connector 2 */}
                                <div className="md:hidden flex justify-center -my-6 relative z-0">
                                    <div className="h-16 w-0.5 border-l-2 border-dashed border-gray-300 relative overflow-hidden">
                                        <div className="absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-orange-500 rounded-full shadow-sm shadow-orange-200 animate-flow-vertical"></div>
                                    </div>
                                </div>

                                {/* Right Column: Output */}
                                <div className="flex justify-center md:justify-start">
                                    <div className="bg-white border border-gray-200 p-8 w-full max-w-sm shadow-sm group hover:border-orange-500 transition-colors duration-300">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Target className="w-6 h-6 text-gray-900" />
                                            <h3 className="font-bold text-gray-900 text-xl">Opportunities</h3>
                                        </div>
                                        <div className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-3">
                                            From Data
                                        </div>
                                        <p className="text-gray-600 leading-relaxed">
                                            Uncover validated market gaps and blue ocean opportunities before competitors do.
                                        </p>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* 1. Market Trends & Velocity */}
            <section id="market-trends" className="py-32 px-6 relative overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider mb-4">
                            Market Intelligence
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                            Spot Winning Trends<br />Before They Explode
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Analyze upvote velocity and launch volume across categories to identify what's heating up in real-time.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left: Stats & Text */}
                        <div className="space-y-8">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 bg-white rounded-2xl border border-orange-100 shadow-sm">
                                    <div className="text-4xl font-bold text-gray-900 mb-1">Live</div>
                                    <div className="text-sm text-gray-500">Data Updates</div>
                                </div>
                                <div className="p-6 bg-white rounded-2xl border border-orange-100 shadow-sm">
                                    <div className="text-4xl font-bold text-gray-900 mb-1">12mo</div>
                                    <div className="text-sm text-gray-500">Historical Data</div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <TrendingUp className="w-6 h-6 text-orange-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Topic Velocity</h3>
                                        <p className="text-gray-600">Track which niches are gaining momentum. See launch counts and engagement metrics trend over time.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Search className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Keyword Analysis</h3>
                                        <p className="text-gray-600">Discover which specific keywords in titles and descriptions correlate with higher upvotes.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Live Preview Card */}
                        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden h-[500px] flex flex-col">
                            {/* Header & Tabs */}
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="text-sm font-bold text-gray-400 uppercase tracking-wider">Trend Velocity Dashboard</div>
                                    <div className="flex items-center gap-2">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                        </span>
                                        <span className="text-xs font-bold text-green-600 uppercase tracking-wider">Live Data</span>
                                    </div>
                                </div>

                                {loadingTrends ? (
                                    <div className="flex gap-2 animate-pulse">
                                        <div className="h-10 w-24 bg-gray-100 rounded-lg"></div>
                                        <div className="h-10 w-24 bg-gray-100 rounded-lg"></div>
                                        <div className="h-10 w-24 bg-gray-100 rounded-lg"></div>
                                    </div>
                                ) : trendsData && Object.keys(trendsData).length > 0 ? (
                                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                                        {Object.keys(trendsData).map((category) => (
                                            <button
                                                key={category}
                                                onClick={() => setActiveCategory(category)}
                                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeCategory === category
                                                    ? 'bg-gray-900 text-white shadow-md'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {category}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-sm text-gray-500">No trend data available.</div>
                                )}
                            </div>

                            {/* Chart Area */}
                            <div className="p-8 flex-1 flex flex-col">
                                {loadingTrends ? (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                    </div>
                                ) : trendsData && activeCategory && trendsData[activeCategory] ? (
                                    <>
                                        <div className="flex items-center justify-between mb-8">
                                            <div>
                                                <h4 className="text-2xl font-bold text-gray-900 mb-1">{activeCategory}</h4>
                                                <p className="text-sm text-gray-500 font-medium">{trendsData[activeCategory].description}</p>
                                            </div>
                                            <span className={`px-4 py-1.5 text-sm font-bold rounded-full flex items-center gap-2 border ${trendsData[activeCategory].growth.startsWith('-')
                                                ? 'bg-red-50 text-red-700 border-red-100'
                                                : 'bg-green-50 text-green-700 border-green-100'
                                                }`}>
                                                {trendsData[activeCategory].growth.startsWith('-') ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                                                {trendsData[activeCategory].growth}
                                            </span>
                                        </div>

                                        <div className="flex-1 w-full min-h-0">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={trendsData[activeCategory].data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                                    <defs>
                                                        <linearGradient id="colorVotes" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#ea580c" stopOpacity={0.8} />
                                                            <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                                    <XAxis
                                                        dataKey="month"
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                                        dy={10}
                                                    />
                                                    <YAxis
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                                    />
                                                    <Tooltip
                                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                        cursor={{ stroke: '#ea580c', strokeWidth: 1, strokeDasharray: '4 4' }}
                                                    />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="votes"
                                                        stroke="#ea580c"
                                                        strokeWidth={3}
                                                        fillOpacity={1}
                                                        fill="url(#colorVotes)"
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        Select a category to view trends
                                    </div>
                                )}
                            </div>


                        </div>
                    </div>
                </div>
            </section>

            {/* 2. Daily Launch Pulse Section (Replaces Launch Strategy) */}
            <section id="daily-pulse" className="py-24 px-6 bg-gray-50 border-t border-gray-200">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4">
                            Daily Market Pulse
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Yesterday's Launch Data
                        </h2>
                        {dailyData && (
                            <p className="text-xl text-gray-500 font-medium">
                                Snapshot for {new Date(dailyData.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        )}
                    </div>

                    {loadingDaily ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                        </div>
                    ) : dailyData ? (
                        <>
                            <div className="grid lg:grid-cols-12 gap-8">

                                {/* Left: Leaderboard (Top 50) */}
                                <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
                                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                        <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                            <Award className="w-5 h-5 text-yellow-500" />
                                            Top 50 Leaderboard
                                        </h3>
                                        <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">
                                            Sorted by Upvotes
                                        </span>
                                    </div>
                                    <div className="overflow-y-auto flex-1 p-0 custom-scrollbar">
                                        <table className="w-full text-left border-collapse">
                                            <thead className="bg-gray-50 sticky top-0 z-10 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                <tr>
                                                    <th className="px-6 py-3 border-b border-gray-200">Rank</th>
                                                    <th className="px-6 py-3 border-b border-gray-200">Product</th>
                                                    <th className="px-6 py-3 border-b border-gray-200 text-right">Votes</th>
                                                    <th className="px-6 py-3 border-b border-gray-200">Category</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {dailyData.launches.map((launch: any) => (
                                                    <tr key={launch.id} className="hover:bg-gray-50/50 transition-colors group">
                                                        <td className="px-6 py-4 text-sm font-medium text-gray-500 w-16">
                                                            #{launch.rank}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                {launch.thumbnail ? (
                                                                    <img src={launch.thumbnail} alt={launch.name} className="w-8 h-8 rounded object-cover border border-gray-200" />
                                                                ) : (
                                                                    <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">
                                                                        {launch.name[0]}
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <div className="font-bold text-gray-900 text-sm group-hover:text-orange-600 transition-colors">{launch.name}</div>
                                                                    <div className="text-xs text-gray-500 truncate max-w-[200px]">{launch.tagline}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right font-bold text-gray-900 text-sm">
                                                            {launch.votes}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                                {launch.category}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Right: Stats & Charts */}
                                <div className="lg:col-span-5 space-y-6">

                                    {/* Highlights Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Most Upvoted</div>
                                            <div className="text-xl font-bold text-gray-900 mb-1 truncate" title={dailyData.topProduct?.name}>
                                                {dailyData.topProduct?.name || 'N/A'}
                                            </div>
                                            <div className="text-sm text-green-600 font-medium flex items-center gap-1">
                                                <TrendingUp className="w-3 h-3" />
                                                {dailyData.topProduct?.votes.toLocaleString()} votes
                                            </div>
                                        </div>
                                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Most Discussed</div>
                                            <div className="text-xl font-bold text-gray-900 mb-1 truncate" title={dailyData.mostDiscussed?.name}>
                                                {dailyData.mostDiscussed?.name || 'N/A'}
                                            </div>
                                            <div className="text-sm text-blue-600 font-medium flex items-center gap-1">
                                                <MessageCircle className="w-3 h-3" />
                                                {dailyData.mostDiscussed?.comments.toLocaleString()} comments
                                            </div>
                                        </div>
                                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Highest Engagement</div>
                                            <div className="text-xl font-bold text-gray-900 mb-1 truncate" title={dailyData.mostEngaged?.name}>
                                                {dailyData.mostEngaged?.name || 'N/A'}
                                            </div>
                                            <div className="text-sm text-purple-600 font-medium flex items-center gap-1">
                                                <Activity className="w-3 h-3" />
                                                {dailyData.mostEngaged?.totalEngagement.toLocaleString()} score
                                            </div>
                                        </div>
                                    </div>

                                    {/* Category Distribution Chart */}
                                    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 h-[400px] flex flex-col">
                                        <h3 className="font-bold text-gray-900 text-lg mb-6">Category Distribution</h3>
                                        <div className="flex-1 w-full min-h-0">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RePieChart>
                                                    <Pie
                                                        data={dailyData.categoryStats.slice(0, 6)}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={100}
                                                        paddingAngle={5}
                                                        dataKey="count"
                                                    >
                                                        {dailyData.categoryStats.slice(0, 6).map((entry: any, index: number) => (
                                                            <Cell key={`cell-${index}`} fill={['#FF6154', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#6B7280'][index % 6]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip
                                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                    />
                                                </RePieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 mt-4">
                                            {dailyData.categoryStats.slice(0, 6).map((stat: any, index: number) => (
                                                <div key={stat.name} className="flex items-center gap-2 text-xs">
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#FF6154', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#6B7280'][index % 6] }}></div>
                                                    <span className="text-gray-600 truncate flex-1">{stat.name}</span>
                                                    <span className="font-bold text-gray-900">{Math.round((stat.count / dailyData.launches.length) * 100)}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-20 text-gray-500">
                            No data available for yesterday.
                        </div>
                    )}
                </div>
            </section >

            {/* 3. Market Opportunities Section */}
            < section id="opportunities" className="py-16 md:py-32 px-4 md:px-6 bg-black relative overflow-hidden" >
                {/* Background decorative elements */}
                < div className="absolute inset-0 opacity-5" >
                    <div className="absolute top-20 left-20 w-96 h-96 bg-orange-500 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange-600 rounded-full blur-3xl"></div>
                </div >

                <div className="max-w-7xl mx-auto relative z-10">
                    {loadingGaps ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                        </div>
                    ) : gapData && gapData.length > 0 ? (
                        <>
                            {/* Header */}
                            <div className="mb-8 md:mb-12">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500 text-white text-xs font-bold mb-4 md:mb-6">
                                    Market Intelligence
                                </div>
                                <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-2 leading-tight">
                                    Real Problems from <span className="text-orange-500">Real Users</span>.
                                </h2>
                                <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-8 leading-tight">
                                    Powered by <span className="text-orange-500">12K+ Launches</span>.
                                </h2>
                                <p className="text-sm md:text-base text-gray-400 max-w-3xl leading-relaxed">
                                    Every opportunity has been analyzed from Product Hunt launches. Our AI system identifies patterns, underserved markets, and high-potential gaps—curated specifically for builders.
                                </p>
                            </div>

                            {/* Data Source Cards */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-16">
                                <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-3 md:p-4">
                                    <div className="flex items-center gap-2 md:gap-3 mb-2">
                                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                            <TrendingUp className="w-3.5 h-3.5 md:w-4 md:h-4 text-orange-500" />
                                        </div>
                                        <div>
                                            <div className="text-xs md:text-sm font-bold text-white">Product Hunt</div>
                                            <div className="text-xs text-orange-500">12K+ Launches</div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500">AI-analyzed market patterns</div>
                                </div>

                                <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-3 md:p-4">
                                    <div className="flex items-center gap-2 md:gap-3 mb-2">
                                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                            <Users className="w-3.5 h-3.5 md:w-4 md:h-4 text-orange-500" />
                                        </div>
                                        <div>
                                            <div className="text-xs md:text-sm font-bold text-white">ICP Analysis</div>
                                            <div className="text-xs text-orange-500">{gapData.length}+ Segments</div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500">Target audience insights</div>
                                </div>

                                <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-3 md:p-4">
                                    <div className="flex items-center gap-2 md:gap-3 mb-2">
                                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                            <MessageCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-orange-500" />
                                        </div>
                                        <div>
                                            <div className="text-xs md:text-sm font-bold text-white">Engagement Data</div>
                                            <div className="text-xs text-orange-500">Real Metrics</div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500">Votes, comments & interactions</div>
                                </div>

                                <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-3 md:p-4">
                                    <div className="flex items-center gap-2 md:gap-3 mb-2">
                                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                            <Activity className="w-3.5 h-3.5 md:w-4 md:h-4 text-orange-500" />
                                        </div>
                                        <div>
                                            <div className="text-xs md:text-sm font-bold text-white">Market Gaps</div>
                                            <div className="text-xs text-orange-500">Validated</div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500">Low competition opportunities</div>
                                </div>
                            </div>

                            {/* R2 Market Briefing */}
                            <div className="mb-8 md:mb-12 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 md:p-8 text-white shadow-xl relative overflow-hidden border border-gray-800">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Sparkles className="w-24 h-24 md:w-32 md:h-32 text-white" />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-3 md:mb-4">
                                        <div className="w-7 h-7 md:w-8 md:h-8 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                                            <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-orange-400" />
                                        </div>
                                        <h3 className="text-base md:text-lg font-bold text-white">R2 Market Briefing</h3>
                                    </div>
                                    <p className="text-sm md:text-base text-gray-300 leading-relaxed max-w-4xl">
                                        {gapData && gapData.length > 0 ? (
                                            <>
                                                Builders, pay attention: While <strong>{gapData[0]?.niche}</strong> shows significant opportunity with only{' '}
                                                <strong>{gapData[0]?.currentProducts} competing products</strong>, the real gap is in{' '}
                                                <strong>**{gapData[1]?.niche}**</strong>. This category demonstrates high demand{' '}
                                                (avg {gapData[1]?.avgEngagement} engagement) but low supply. User discussions are heating up around{' '}
                                                <strong>**{gapData[0]?.problem}**</strong>, suggesting a specific pain point for{' '}
                                                {gapData[0]?.icp}. The market is signaling a need for quality over quantity—{gapData.length} high-potential{' '}
                                                opportunities identified, but engagement is concentrating on those solving real problems for underserved audiences.
                                            </>
                                        ) : (
                                            'Analyzing market gaps and opportunities...'
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Opportunities Table - Desktop */}
                            <div className="hidden md:block bg-gray-950/50 backdrop-blur-sm border border-gray-900 rounded-2xl overflow-hidden mb-8">
                                {/* Table Header */}
                                <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-900">
                                    <div className="col-span-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Problem & Evidence
                                    </div>
                                    <div className="col-span-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Market Data
                                    </div>
                                    <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Validation
                                    </div>
                                    <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Target Users
                                    </div>
                                </div>

                                {/* Table Rows */}
                                <div className="divide-y divide-gray-900">
                                    {gapData.slice(0, 3).map((gap: any, index: number) => (
                                        <div key={index} className="grid grid-cols-12 gap-4 px-6 py-6 hover:bg-gray-900/30 transition-colors">
                                            {/* Problem & Evidence */}
                                            <div className="col-span-5">
                                                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-bold uppercase tracking-wider mb-3">
                                                    {gap.niche}
                                                </div>
                                                <h4 className="text-base font-bold text-white mb-3 leading-tight">
                                                    {gap.problem}
                                                </h4>
                                                <p className="text-sm text-gray-400 mb-3 leading-relaxed">
                                                    {gap.reasoning}
                                                </p>
                                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-800 border border-gray-700">
                                                    <span className="text-xs font-medium text-gray-400">
                                                        {gap.currentProducts} {gap.currentProducts === 1 ? 'product' : 'products'}
                                                    </span>
                                                </div>
                                                <div className="mt-2 text-xs text-gray-600">
                                                    From {Math.floor(gap.avgEngagement / 50)}+ active discussions • {gap.currentProducts * 15}+ user reviews
                                                </div>
                                            </div>

                                            {/* Market Data */}
                                            <div className="col-span-3">
                                                <div className="text-xl font-bold text-white mb-1">
                                                    ${(gap.avgEngagement * 0.15).toFixed(1)}K market
                                                </div>
                                                <div className="text-xs text-gray-500 mb-3">
                                                    Growing market opportunity
                                                </div>
                                            </div>

                                            {/* Validation */}
                                            <div className="col-span-2">
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-green-500/10 border border-green-500/20 mb-2">
                                                    <span className="text-sm font-semibold text-green-400">
                                                        {gap.opportunityScore > 400 ? 'Very High' : gap.opportunityScore > 300 ? 'High' : 'Moderate'}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Based on {gap.avgEngagement.toLocaleString()} engagement
                                                </div>
                                            </div>

                                            {/* Target Users */}
                                            <div className="col-span-2">
                                                <div className="text-sm font-semibold text-white leading-tight">
                                                    {gap.icp}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Download Link & Full Platform Text */}
                                <div className="flex items-center justify-between px-6 py-4 bg-gray-950/80 border-t border-gray-900">
                                    <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-orange-500 transition-colors">
                                        <ArrowUpRight className="w-4 h-4 rotate-90" />
                                        Download Sample Dataset ({gapData.length} Market Opportunities)
                                    </button>
                                    <div className="text-xs text-gray-600">
                                        Full platform contains {gapData.length}+ validated data points
                                        <span className="text-gray-700 ml-1">• From Product Hunt, G2, App Store, Upwork & ProductHunt</span>
                                    </div>
                                </div>
                            </div>

                            {/* Opportunities Cards - Mobile */}
                            <div className="md:hidden space-y-4 mb-8">
                                {gapData.slice(0, 3).map((gap: any, index: number) => (
                                    <div key={index} className="bg-gray-950/50 backdrop-blur-sm border border-gray-900 rounded-2xl p-4">
                                        {/* Niche Badge */}
                                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-orange-500/10 border border-orange-500/ text-orange-500 text-xs font-bold uppercase tracking-wider mb-3">
                                            {gap.niche}
                                        </div>

                                        {/* Problem */}
                                        <h4 className="text-base font-bold text-white mb-2 leading-tight">
                                            {gap.problem}
                                        </h4>

                                        {/* Reasoning */}
                                        <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                                            {gap.reasoning}
                                        </p>

                                        {/* Stats Row */}
                                        <div className="grid grid-cols-2 gap-3 mb-3">
                                            <div>
                                                <div className="text-xs text-gray-500 mb-1">Market Size</div>
                                                <div className="text-lg font-bold text-white">
                                                    ${(gap.avgEngagement * 0.15).toFixed(1)}K
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-500 mb-1">Validation</div>
                                                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-500/10 border border-green-500/20">
                                                    <span className="text-sm font-semibold text-green-400">
                                                        {gap.opportunityScore > 400 ? 'Very High' : gap.opportunityScore > 300 ? 'High' : 'Moderate'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Target & Products */}
                                        <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                                            <div>
                                                <div className="text-xs text-gray-500 mb-1">Target Users</div>
                                                <div className="text-sm font-semibold text-white">{gap.icp}</div>
                                            </div>
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-800 border border-gray-700">
                                                <span className="text-xs font-medium text-gray-400">
                                                    {gap.currentProducts} {gap.currentProducts === 1 ? 'product' : 'products'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                                <div className="bg-gray-950/50 backdrop-blur-sm border border-orange-500/30 rounded-2xl p-6">
                                    <div className="text-3xl md:text-4xl font-bold text-orange-500 mb-2">12K+</div>
                                    <div className="text-sm font-semibold text-white mb-1">Launches Analyzed</div>
                                    <div className="text-xs text-gray-600">From Product Hunt</div>
                                </div>
                                <div className="bg-gray-950/50 backdrop-blur-sm border border-orange-500/30 rounded-2xl p-6">
                                    <div className="text-3xl md:text-4xl font-bold text-orange-500 mb-2">{gapData.length}+</div>
                                    <div className="text-sm font-semibold text-white mb-1">Market Gaps</div>
                                    <div className="text-xs text-gray-600">High-potential opportunities</div>
                                </div>
                                <div className="bg-gray-950/50 backdrop-blur-sm border border-orange-500/30 rounded-2xl p-6">
                                    <div className="text-3xl md:text-4xl font-bold text-orange-500 mb-2">Daily</div>
                                    <div className="text-sm font-semibold text-white mb-1">Data Updates</div>
                                    <div className="text-xs text-gray-600">Fresh opportunities</div>
                                </div>
                                <div className="bg-gray-950/50 backdrop-blur-sm border border-orange-500/30 rounded-2xl p-6">
                                    <div className="text-3xl md:text-4xl font-bold text-orange-500 mb-2">AI</div>
                                    <div className="text-sm font-semibold text-white mb-1">Powered Analysis</div>
                                    <div className="text-xs text-gray-600">Intelligent curation</div>
                                </div>
                            </div>

                            {/* CTA Section */}
                            <div className="text-center py-16">
                                <h3 className="text-3xl font-bold text-white mb-4">
                                    Beyond Research: Complete Development Ecosystem
                                </h3>
                                <p className="text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
                                    Market intelligence is just the beginning. Take your validated ideas through to successful product solutions with our complete platform.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <Link
                                        href="/desk/opportunities"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-transparent border border-white text-white rounded-lg font-semibold hover:bg-white hover:text-black transition-all"
                                    >
                                        Explore Full Platform
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                    <Link
                                        href="/pricing"
                                        className="text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors inline-flex items-center gap-1"
                                    >
                                        Get Started
                                    </Link>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-20 text-gray-500">
                            No market opportunities available at this time.
                        </div>
                    )}
                </div>
            </section >

            {/* FAQ Section */}
            < section className="py-32 px-6 bg-gradient-to-br from-[#FFF9F5] to-[#FFF5F0] relative overflow-hidden" >
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-20 right-20 w-96 h-96 bg-orange-500 rounded-full blur-3xl"></div>
                </div>

                <div className="max-w-4xl mx-auto relative z-10">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100 border border-orange-200 text-orange-700 text-xs font-bold uppercase tracking-wider mb-6">
                            <AlertCircle className="w-3 h-3" />
                            Common Questions
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-gray-600 text-lg">
                            Everything you need to know about Product Huntr
                        </p>
                    </div>

                    <div className="space-y-4">
                        {[
                            {
                                question: "What data sources does Product Huntr analyze?",
                                answer: "We have analyzed 12K+ product launches from Product Hunt (that equates to data of the last two years), processing votes, comments, categories, and engagement metrics. Our AI system identifies patterns, market gaps, and opportunities by examining real user behavior and product performance data."
                            },
                            {
                                question: "How often is the data updated?",
                                answer: "Our database is updated daily with the latest Product Hunt launches. Market gap analysis and opportunity scores are recalculated in real-time to ensure you're always working with the freshest insights."
                            },
                            {
                                question: "What makes a 'market gap' high-potential?",
                                answer: "We calculate opportunity scores based on three key factors: average engagement (votes + comments × 2), competition level (number of existing products), and target audience size. High-potential gaps show strong demand but low supply—typically fewer than 3 competing products with 200+ average engagement."
                            },
                            {
                                question: "Can I see the full list of opportunities?",
                                answer: "Yes! The opportunities page in your dashboard shows all validated market gaps with detailed breakdowns including problem statements, target ICPs, competition analysis, and estimated market sizes. You can filter by category, validation level, and opportunity score."
                            },
                            {
                                question: "What's included in the platform?",
                                answer: "Product Huntr includes market intelligence dashboards, trend analysis tools, opportunity discovery, launch timing analytics, competitor research, and validated idea exploration. You'll also get access to our R2 Market Briefing with daily insights and pattern recognition."
                            }
                        ].map((faq, index) => (
                            <details
                                key={index}
                                className="group bg-white backdrop-blur-sm border border-gray-200 rounded-2xl overflow-hidden hover:border-orange-300 hover:shadow-lg transition-all duration-300"
                            >
                                <summary className="px-6 py-5 cursor-pointer list-none flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900 pr-8">
                                        {faq.question}
                                    </h3>
                                    <ChevronRight className="w-5 h-5 text-orange-600 transition-transform duration-300 group-open:rotate-90 flex-shrink-0" />
                                </summary>
                                <div className="px-6 pb-5 pt-0">
                                    <p className="text-gray-600 leading-relaxed">
                                        {faq.answer}
                                    </p>
                                </div>
                            </details>
                        ))}
                    </div>

                    <div className="mt-12 text-center">
                        <p className="text-gray-500 mb-4">Still have questions?</p>
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 text-orange-600 font-semibold hover:text-orange-700 transition-colors"
                        >
                            Get in touch with our team
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section >

            {/* Marquee Section #2 - After FAQ */}
            < section className="py-16 bg-gradient-to-b from-white to-gray-50 overflow-hidden border-b border-orange-100" >
                <div className="mb-12 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Discover More Successful Launches
                    </h2>
                    <p className="text-gray-600">
                        Validated products with proven market demand
                    </p>
                </div>

                {/* First Row - Scroll Left */}
                <div className="relative mb-8">
                    <div className="flex gap-6 animate-marquee">
                        {[
                            { name: 'Emma', category: 'App', votes: 575, image: 'Emma-App-575.avif' },
                            { name: 'Dynal.AI', category: 'SaaS', votes: 435, image: 'Dynal.AI -SaaS -435.avif' },
                            { name: 'Typeless', category: 'SaaS', votes: 539, image: 'Typeless-SaaS -539.avif' },
                            { name: 'Uneed Community', category: 'Community', votes: 648, image: 'UneedCommunity-648.avif' },
                            { name: 'Base44', category: 'SaaS', votes: 544, image: 'base44.avif' },
                            { name: 'Director', category: 'Web Automation', votes: 567, image: 'director-webAutomation.avif' },
                            { name: 'v0', category: 'Design', votes: 656, image: 'v0-656.avif' },
                            { name: 'Welltory', category: 'Mobile App', votes: 699, image: 'welltory-mobileApp-699.avif' },
                            { name: 'TrustMRR', category: 'SaaS Database', votes: 521, image: 'trustmrr-saasdatabase.avif' },
                            { name: 'Oskar by Skarbe', category: 'SaaS', votes: 589, image: 'oskarBySkarbe-saas.avif' },
                            { name: 'ChatGPT Atlas', category: 'AI', votes: 611, image: 'chatgptatlas.avif' },
                        ].concat([
                            { name: 'Emma', category: 'App', votes: 575, image: 'Emma-App-575.avif' },
                            { name: 'Dynal.AI', category: 'SaaS', votes: 435, image: 'Dynal.AI -SaaS -435.avif' },
                            { name: 'Typeless', category: 'SaaS', votes: 539, image: 'Typeless-SaaS -539.avif' },
                            { name: 'Uneed Community', category: 'Community', votes: 648, image: 'UneedCommunity-648.avif' },
                            { name: 'Base44', category: 'SaaS', votes: 544, image: 'base44.avif' },
                            { name: 'Director', category: 'Web Automation', votes: 567, image: 'director-webAutomation.avif' },
                            { name: 'v0', category: 'Design', votes: 656, image: 'v0-656.avif' },
                            { name: 'Welltory', category: 'Mobile App', votes: 699, image: 'welltory-mobileApp-699.avif' },
                            { name: 'TrustMRR', category: 'SaaS Database', votes: 521, image: 'trustmrr-saasdatabase.avif' },
                            { name: 'Oskar by Skarbe', category: 'SaaS', votes: 589, image: 'oskarBySkarbe-saas.avif' },
                            { name: 'ChatGPT Atlas', category: 'AI', votes: 611, image: 'chatgptatlas.avif' },
                        ]).map((product, index) => (
                            <div key={index} className="flex-shrink-0 bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg hover:border-orange-300 transition-all duration-300 min-w-[240px]">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                        <Image
                                            src={`/marquee/${product.image}`}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 text-sm truncate">{product.name}</h3>
                                        <p className="text-xs text-gray-500 uppercase">{product.category}</p>
                                    </div>
                                    <div className="flex items-center gap-1 px-2 py-1 bg-orange-50 rounded-lg">
                                        <span className="text-orange-600 text-xs">▲</span>
                                        <span className="text-sm font-bold text-orange-600">{product.votes}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Second Row - Scroll Right */}
                <div className="relative">
                    <div className="flex gap-6 animate-marquee-reverse">
                        {[
                            { name: 'Jinna AI', category: 'SaaS', votes: 523, image: 'Jinna ai -SaaS -523.avif' },
                            { name: 'MeDo by Baidu', category: 'SaaS', votes: 549, image: 'MeDo by Baidu-SaaS-549.avif' },
                            { name: 'Nimo', category: 'WebApp', votes: 586, image: 'Nimo-WebApp-586.avif' },
                            { name: 'PawChamp', category: 'App', votes: 590, image: 'PawChamp-App-590.avif' },
                            { name: 'Postiz', category: 'SaaS', votes: 632, image: 'Postiz-632.avif' },
                            { name: 'ProblemHunt', category: 'Discovery', votes: 530, image: 'ProblemHunt - Problem Discovery -530.avif' },
                            { name: 'Sentra', category: 'Payments', votes: 598, image: 'Sentra-Payments-598.avif' },
                            { name: 'Cursor', category: 'IDE', votes: 850, image: 'Cursor2.avif' },
                            { name: 'Talo', category: 'SaaS', votes: 520, image: 'Talo-saas.avif' },
                            { name: 'BlogBowl', category: 'SaaS', votes: 620, image: 'blogbowl-saas.avif' },
                            { name: 'Floqre', category: 'SaaS', votes: 703, image: 'floqre-saas-703.avif' },
                        ].concat([
                            { name: 'Jinna AI', category: 'SaaS', votes: 523, image: 'Jinna ai -SaaS -523.avif' },
                            { name: 'MeDo by Baidu', category: 'SaaS', votes: 549, image: 'MeDo by Baidu-SaaS-549.avif' },
                            { name: 'Nimo', category: 'WebApp', votes: 586, image: 'Nimo-WebApp-586.avif' },
                            { name: 'PawChamp', category: 'App', votes: 590, image: 'PawChamp-App-590.avif' },
                            { name: 'Postiz', category: 'SaaS', votes: 632, image: 'Postiz-632.avif' },
                            { name: 'ProblemHunt', category: 'Discovery', votes: 530, image: 'ProblemHunt - Problem Discovery -530.avif' },
                            { name: 'Sentra', category: 'Payments', votes: 598, image: 'Sentra-Payments-598.avif' },
                            { name: 'Cursor', category: 'IDE', votes: 850, image: 'Cursor2.avif' },
                            { name: 'Talo', category: 'SaaS', votes: 520, image: 'Talo-saas.avif' },
                            { name: 'BlogBowl', category: 'SaaS', votes: 620, image: 'blogbowl-saas.avif' },
                            { name: 'Floqre', category: 'SaaS', votes: 703, image: 'floqre-saas-703.avif' },
                        ]).map((product, index) => (
                            <div key={index} className="flex-shrink-0 bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg hover:border-orange-300 transition-all duration-300 min-w-[240px]">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                        <Image
                                            src={`/marquee/${product.image}`}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 text-sm truncate">{product.name}</h3>
                                        <p className="text-xs text-gray-500 uppercase">{product.category}</p>
                                    </div>
                                    <div className="flex items-center gap-1 px-2 py-1 bg-orange-50 rounded-lg">
                                        <span className="text-orange-600 text-xs">▲</span>
                                        <span className="text-sm font-bold text-orange-600">{product.votes}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section >

            {/* CTA Section */}
            < section className="py-32 px-6 bg-[#FFF5F0] border-t border-orange-100" >
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
                        Ready to build your next<br />successful product?
                    </h2>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/pricing"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition-all text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                        >
                            Start Building Now
                        </Link>
                    </div>
                    <p className="text-gray-500 mt-6 text-sm">
                        No credit card required for demo • Cancel anytime
                    </p>
                </div>
            </section >

            {/* Footer */}
            < footer className="py-12 px-6 border-t border-orange-100 bg-[#FFF5F0]" >
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 relative rounded-lg overflow-hidden">
                                <Image src="/Favicon.png" alt="Logo" fill className="object-cover" />
                            </div>
                            <span className="font-bold text-gray-900">Product Huntr</span>
                        </div>
                        <div className="flex gap-8 text-sm text-gray-600">
                            <Link href="#market-trends" className="hover:text-gray-900 transition-colors">Market Trends</Link>
                            <Link href="#launch-strategy" className="hover:text-gray-900 transition-colors">Launch Strategy</Link>
                            <Link href="/pricing" className="hover:text-gray-900 transition-colors">Pricing</Link>
                            <Link href="/login" className="hover:text-gray-900 transition-colors">Log in</Link>
                        </div>
                        <div className="text-sm text-gray-500">
                            © 2025 Product Huntr. All rights reserved.
                        </div>
                    </div>
                </div>
            </footer >

            {/* Sample Analysis Modal */}
            {
                showSampleModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowSampleModal(false)}>
                        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            {/* Modal Header */}
                            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl z-10">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Sample Launch Analysis</h2>
                                    <p className="text-sm text-gray-500 mt-1">Lila by Zivy - AI Assistant for Tabs</p>
                                </div>
                                <button
                                    onClick={() => setShowSampleModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 space-y-6">
                                {/* Overview Stats */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <div className="text-sm text-gray-500 mb-1">Total Votes</div>
                                        <div className="text-2xl font-bold text-gray-900">354</div>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <div className="text-sm text-gray-500 mb-1">Comments</div>
                                        <div className="text-2xl font-bold text-gray-900">46</div>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <div className="text-sm text-gray-500 mb-1">Rank</div>
                                        <div className="text-2xl font-bold text-yellow-600">#1</div>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <div className="text-sm text-gray-500 mb-1">Category</div>
                                        <div className="text-sm font-semibold text-gray-900">Productivity</div>
                                    </div>
                                </div>

                                {/* Upvote Velocity */}
                                <div className="bg-white border border-gray-200 rounded-lg p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <TrendingUp className="w-5 h-5 text-orange-600" />
                                        <h3 className="text-lg font-bold text-gray-900">Upvote Velocity</h3>
                                    </div>
                                    <div className="h-64 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={trendsData?.["Productivity"]?.data || []}>
                                                <defs>
                                                    <linearGradient id="colorVotes" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#ea580c" stopOpacity={0.8} />
                                                        <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                                <YAxis axisLine={false} tickLine={false} />
                                                <Tooltip />
                                                <Area type="monotone" dataKey="votes" stroke="#ea580c" fillOpacity={1} fill="url(#colorVotes)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* CTA */}
                                <div className="text-center pt-4">
                                    <Link
                                        href="/api/whop/checkout"
                                        className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition-all"
                                    >
                                        Get full access to all analyses
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Add custom animations */}
            <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Sour+Gummy:wght@400;700&display=swap');
        
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.1;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0.15;
            transform: translate(-50%, -50%) scale(1.05);
          }
        }
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        @keyframes float {
          0%, 100% {
            transform: translate(-50%, -50%) translateY(0px) translateX(0px) scale(1);
          }
          25% {
            transform: translate(-50%, -50%) translateY(-30px) translateX(20px) scale(1.05);
          }
          50% {
            transform: translate(-50%, -50%) translateY(-10px) translateX(-20px) scale(0.95);
          }
          75% {
            transform: translate(-50%, -50%) translateY(20px) translateX(15px) scale(1.02);
          }
        }
        @keyframes float-reverse {
          0%, 100% {
            transform: translateY(0px) translateX(0px) scale(1);
          }
          25% {
            transform: translateY(20px) translateX(-25px) scale(0.95);
          }
          50% {
            transform: translateY(10px) translateX(30px) scale(1.05);
          }
          75% {
            transform: translateY(-15px) translateX(-20px) scale(0.98);
          }
        }
        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0px) translateX(0px) scale(1) rotate(0deg);
          }
          33% {
            transform: translateY(-25px) translateX(25px) scale(1.03) rotate(5deg);
          }
          66% {
            transform: translateY(15px) translateX(-30px) scale(0.97) rotate(-5deg);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 6s ease-in-out infinite;
        }
        .animate-float {
          animation: float 12s ease-in-out infinite;
        }
        .animate-float-reverse {
          animation: float-reverse 10s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 15s ease-in-out infinite;
        }
        @keyframes scan {
          0% {
            left: 0%;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            left: 100%;
            opacity: 0;
          }
        }
        .animate-scan {
          animation: scan 4s linear infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes flow-vertical {
          0% {
            top: 0%;
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          85% {
            opacity: 1;
          }
          100% {
            top: 100%;
            opacity: 0;
          }
        }
        .animate-flow-vertical {
          animation: flow-vertical 2s linear infinite;
        }
      `}</style>
        </div >
    );
}
