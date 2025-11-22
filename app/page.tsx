'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import LandingTrendCard from '@/components/LandingTrendCard';
import TrendVelocityDemo from '@/components/TrendVelocityDemo';
import GapAnalysisDemo from '@/components/GapAnalysisDemo';
import IdeaValidatorDemo from '@/components/IdeaValidatorDemo';
import ProductMarquee from '@/components/ProductMarquee';
import {
  Zap,
  ArrowRight,
  TrendingUp,
  Target,
  ShieldCheck,
  BarChart3,
  Search,
  CheckCircle2,
  PlayCircle,
  Menu,
  X,
  ChevronDown,
  Filter
} from 'lucide-react';

interface Trend {
  id: string;
  title: string;
  subtitle: string;
  metric: string;
  metricLabel: string;
  chartData: { value: number }[];
  status: string;
  delay?: number;
}

interface MarketGap {
  problem: string;
  icp: string;
  niche: string;
  currentProducts: number;
  avgEngagement: number;
  opportunityScore: number;
  reasoning: string;
}

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [showLanding, setShowLanding] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [trends, setTrends] = useState<Trend[]>([]);
  const [marketGaps, setMarketGaps] = useState<MarketGap[]>([]);
  const [loading, setLoading] = useState(true);

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
          fetchData();
        }
      }
    };

    const fetchData = async () => {
      try {
        const res = await fetch('/api/landing-trends');
        const data = await res.json();
        if (mounted) {
          if (data.trends) setTrends(data.trends);
          if (data.marketGaps) setMarketGaps(data.marketGaps);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        if (mounted) setLoading(false);
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
    <div className="min-h-screen bg-black text-white font-sans selection:bg-orange-500/30 selection:text-orange-200">

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-md border-b border-neutral-900 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 relative rounded-xl overflow-hidden shadow-lg shadow-orange-600/20">
              <Image src="/Favicon.png" alt="Logo" fill className="object-cover" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">Product Huntr</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">Features</Link>
            <Link href="#trends" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">Trends</Link>
            <Link href="/pricing" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">Pricing</Link>
            <div className="h-4 w-px bg-neutral-800"></div>
            <Link href="/login" className="text-sm font-medium text-white hover:text-orange-500 transition-colors">Log in</Link>
            <Link href="/login" className="text-sm font-semibold bg-white text-black px-5 py-2.5 rounded-full hover:bg-neutral-200 transition-all">
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-neutral-400"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 right-0 bg-neutral-900 border-b border-neutral-800 p-6 flex flex-col gap-4 shadow-xl">
            <Link href="#features" className="text-base font-medium text-neutral-400" onClick={() => setMobileMenuOpen(false)}>Features</Link>
            <Link href="#trends" className="text-base font-medium text-neutral-400" onClick={() => setMobileMenuOpen(false)}>Trends</Link>
            <Link href="/login" className="text-base font-medium text-white" onClick={() => setMobileMenuOpen(false)}>Log in</Link>
            <Link href="/login" className="text-center font-semibold bg-orange-600 text-white px-5 py-3 rounded-xl" onClick={() => setMobileMenuOpen(false)}>
              Get Started
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-orange-600/20 rounded-full blur-[120px] -z-10 opacity-50"></div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900 border border-neutral-800 text-sm font-medium text-orange-500 mb-8 animate-fade-in-up shadow-lg shadow-orange-900/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            Analyzing 15,000+ launches in real-time
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-white mb-8 max-w-4xl mx-auto leading-[1.1]">
            Decode the DNA of a <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
              #1 Product Hunt Launch.
            </span>
          </h1>

          <p className="text-xl text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Analyze 50,000+ launches. Uncover winning patterns, spot exploding niches, and validate your next big idea with data—not guesswork.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-orange-600 text-white rounded-full font-bold text-lg hover:bg-orange-700 transition-all hover:scale-105 shadow-xl shadow-orange-600/20 flex items-center justify-center gap-2">
              Get Started <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="#demo" className="w-full sm:w-auto px-8 py-4 bg-neutral-900 border border-neutral-800 text-white rounded-full font-bold text-lg hover:bg-neutral-800 transition-all flex items-center justify-center gap-2">
              <PlayCircle className="w-5 h-5" /> Watch Demo
            </Link>
          </div>

          {/* Hero Visual - Floating Cards */}
          <div className="relative max-w-6xl mx-auto h-[500px] hidden md:block">

            {/* Card 1 - Left */}
            <div className="absolute top-20 left-0 w-80 transform -rotate-6 hover:rotate-0 transition-transform duration-500 z-10">
              <LandingTrendCard
                title="AI Agents"
                subtitle="Autonomous agents are taking over workflows."
                metric="+310%"
                metricLabel="Growth"
                chartData={[{ value: 15 }, { value: 25 }, { value: 35 }, { value: 60 }, { value: 90 }]}
                status="Exploding"
              />
            </div>

            {/* Card 2 - Center (Prominent) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 transform hover:scale-105 transition-transform duration-500 z-20 shadow-2xl shadow-orange-900/20 rounded-2xl">
              <LandingTrendCard
                title="Generative Video"
                subtitle="Text-to-video tools are the new frontier."
                metric="+450%"
                metricLabel="Growth"
                chartData={[{ value: 10 }, { value: 20 }, { value: 40 }, { value: 80 }, { value: 120 }]}
                status="Exploding"
              />
            </div>

            {/* Card 3 - Right */}
            <div className="absolute top-20 right-0 w-80 transform rotate-6 hover:rotate-0 transition-transform duration-500 z-10">
              <LandingTrendCard
                title="No-Code DBs"
                subtitle="Simplifying backend for everyone."
                metric="+120%"
                metricLabel="Growth"
                chartData={[{ value: 20 }, { value: 22 }, { value: 25 }, { value: 35 }, { value: 45 }]}
                status="Rising"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Marquee */}
      <section className="py-10 border-y border-neutral-900 bg-black/50 backdrop-blur-sm overflow-hidden">
        <div className="text-center mb-6">
          <p className="text-sm font-medium text-neutral-500 uppercase tracking-widest">Analyzing the world's top launches</p>
        </div>
        <ProductMarquee />
      </section>

      {/* EXPLODING NICHES SECTION (Main) */}
      <section id="trends" className="py-24 px-6 bg-black">
        <div className="max-w-7xl mx-auto">

          {/* Header & Filters */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">Discover Exploding Topics</h2>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="flex items-center gap-2 text-sm font-medium text-neutral-500 mr-4">
                <span className="uppercase tracking-wider text-xs font-bold text-neutral-600">Filter By:</span>
              </div>

              <button className="bg-neutral-900 border border-neutral-800 text-neutral-300 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:border-orange-500/50 transition-colors shadow-sm">
                2 Years <ChevronDown className="w-4 h-4 text-neutral-500" />
              </button>

              <button className="bg-neutral-900 border border-neutral-800 text-neutral-300 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:border-orange-500/50 transition-colors shadow-sm">
                All Categories <ChevronDown className="w-4 h-4 text-neutral-500" />
              </button>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search Trends"
                  className="pl-9 pr-4 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 shadow-sm w-64 placeholder-neutral-600"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-orange-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">PRO</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 bg-neutral-900 rounded-2xl animate-pulse border border-neutral-800"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Show first 6 trends */}
              {trends.slice(0, 6).map((trend, i) => (
                <LandingTrendCard key={trend.id} {...trend} delay={i * 100} />
              ))}

              {/* Locked Cards for "Pro" feel */}
              <LandingTrendCard
                title="Generative Video"
                subtitle="142 Launches"
                metric="+450%"
                metricLabel="Growth"
                chartData={[{ value: 10 }, { value: 20 }, { value: 40 }, { value: 80 }, { value: 120 }]}
                status="Exploding"
                isLocked={true}
              />
              <div className="hidden sm:block">
                <LandingTrendCard
                  title="AI Agents"
                  subtitle="89 Launches"
                  metric="+310%"
                  metricLabel="Growth"
                  chartData={[{ value: 15 }, { value: 25 }, { value: 35 }, { value: 60 }, { value: 90 }]}
                  status="Exploding"
                  isLocked={true}
                />
              </div>
              <div className="hidden lg:block">
                <LandingTrendCard
                  title="No-Code Databases"
                  subtitle="56 Launches"
                  metric="+120%"
                  metricLabel="Growth"
                  chartData={[{ value: 20 }, { value: 22 }, { value: 25 }, { value: 35 }, { value: 45 }]}
                  status="Rising"
                  isLocked={true}
                />
              </div>
            </div>
          )}

          <div className="mt-16 text-center">
            <Link href="/login" className="inline-flex items-center gap-2 px-8 py-4 bg-neutral-900 border border-neutral-800 rounded-full text-white font-semibold hover:bg-neutral-800 hover:border-neutral-700 transition-all shadow-sm">
              View all 100+ niches <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURE 1: TREND VELOCITY */}
      <section className="py-32 px-6 bg-black border-t border-neutral-900">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
          <div className="order-2 lg:order-1">
            <TrendVelocityDemo trends={trends} />
          </div>
          <div className="order-1 lg:order-2">
            <div className="relative w-16 h-16 mb-8 group">
              <div className="absolute inset-0 bg-orange-500 rounded-2xl blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
              <div className="relative w-full h-full bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-orange-500" />
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              Spot rising niches <br />
              <span className="text-neutral-500">before they explode.</span>
            </h2>
            <p className="text-lg text-neutral-400 leading-relaxed mb-8">
              Our algorithms track momentum across votes, comments, and social signals to identify trends with high velocity. Don't wait for the crowd—be the first to move.
            </p>
            <ul className="space-y-4 mb-10">
              <li className="flex items-center gap-3 text-neutral-300">
                <CheckCircle2 className="w-5 h-5 text-orange-500" />
                <span>Real-time growth tracking</span>
              </li>
              <li className="flex items-center gap-3 text-neutral-300">
                <CheckCircle2 className="w-5 h-5 text-orange-500" />
                <span>Historical data analysis (up to 2 years)</span>
              </li>
              <li className="flex items-center gap-3 text-neutral-300">
                <CheckCircle2 className="w-5 h-5 text-orange-500" />
                <span>Predictive trend modeling</span>
              </li>
            </ul>
            <Link href="/login" className="text-white font-bold flex items-center gap-2 hover:gap-3 transition-all group">
              Explore Trends <ArrowRight className="w-5 h-5 text-orange-500 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURE 2: GAP ANALYSIS */}
      <section className="py-32 px-6 bg-black border-t border-neutral-900">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
          <div>
            <div className="relative w-16 h-16 mb-8 group">
              <div className="absolute inset-0 bg-blue-500 rounded-2xl blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
              <div className="relative w-full h-full bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-center">
                <Target className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              Find "Blue Ocean" <br />
              <span className="text-neutral-500">opportunities instantly.</span>
            </h2>
            <p className="text-lg text-neutral-400 leading-relaxed mb-8">
              Stop building in saturated markets. We identify high-demand problems with low-quality solutions so you can build better and dominate the niche.
            </p>
            <ul className="space-y-4 mb-10">
              <li className="flex items-center gap-3 text-neutral-300">
                <CheckCircle2 className="w-5 h-5 text-blue-500" />
                <span>Competition vs. Demand matrix</span>
              </li>
              <li className="flex items-center gap-3 text-neutral-300">
                <CheckCircle2 className="w-5 h-5 text-blue-500" />
                <span>Identify under-served ICPs</span>
              </li>
              <li className="flex items-center gap-3 text-neutral-300">
                <CheckCircle2 className="w-5 h-5 text-blue-500" />
                <span>Sentiment analysis on existing solutions</span>
              </li>
            </ul>
            <Link href="/login" className="text-white font-bold flex items-center gap-2 hover:gap-3 transition-all group">
              Find Gaps <ArrowRight className="w-5 h-5 text-blue-500 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div>
            <GapAnalysisDemo gaps={marketGaps} />
          </div>
        </div>
      </section>

      {/* FEATURE 3: IDEA VALIDATION */}
      <section className="py-32 px-6 bg-black border-t border-neutral-900">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
          <div className="order-2 lg:order-1">
            <IdeaValidatorDemo />
          </div>
          <div className="order-1 lg:order-2">
            <div className="relative w-16 h-16 mb-8 group">
              <div className="absolute inset-0 bg-green-500 rounded-2xl blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
              <div className="relative w-full h-full bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              Validate before <br />
              <span className="text-neutral-500">you write code.</span>
            </h2>
            <p className="text-lg text-neutral-400 leading-relaxed mb-8">
              Don't waste months building something nobody wants. Check your idea against historical data to estimate success probability and potential reach.
            </p>
            <ul className="space-y-4 mb-10">
              <li className="flex items-center gap-3 text-neutral-300">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Instant AI market feedback</span>
              </li>
              <li className="flex items-center gap-3 text-neutral-300">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Competitor reconnaissance</span>
              </li>
              <li className="flex items-center gap-3 text-neutral-300">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Risk assessment & differentiation tips</span>
              </li>
            </ul>
            <Link href="/login" className="text-white font-bold flex items-center gap-2 hover:gap-3 transition-all group">
              Validate Now <ArrowRight className="w-5 h-5 text-green-500 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Value Prop / Deep Dive */}
      <section className="py-32 px-6 bg-neutral-950 text-white overflow-hidden border-t border-neutral-900">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-8 leading-tight">
              Data that drives <br />
              <span className="text-orange-500">decisions.</span>
            </h2>
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/10">
                  <BarChart3 className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-white">Market Intelligence</h3>
                  <p className="text-neutral-400 leading-relaxed">
                    Get a bird's eye view of the entire tech landscape. See where capital and attention are flowing in real-time.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/10">
                  <Search className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-white">Competitor Recon</h3>
                  <p className="text-neutral-400 leading-relaxed">
                    Deconstruct successful launches. See exactly what copy, images, and positioning top hunters used to win #1 Product of the Day.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl opacity-20 blur-2xl"></div>
            <div className="relative bg-neutral-900 rounded-2xl border border-neutral-800 p-8 shadow-2xl">
              {/* Mockup of a detailed chart card */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="text-sm text-neutral-400 mb-1">Market Opportunity</div>
                  <div className="text-2xl font-bold text-white">AI Copywriting Tools</div>
                </div>
                <div className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-sm font-medium border border-green-500/20">
                  High Demand
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-[75%] bg-orange-500 rounded-full"></div>
                </div>
                <div className="flex justify-between text-sm text-neutral-400">
                  <span>Saturation</span>
                  <span>75%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-[40%] bg-red-500 rounded-full"></div>
                </div>
                <div className="flex justify-between text-sm text-neutral-400">
                  <span>Competition Quality</span>
                  <span>Medium</span>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-white/10 grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <div className="text-2xl font-bold mb-1 text-white">89</div>
                  <div className="text-xs text-neutral-500 uppercase">Launches</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <div className="text-2xl font-bold mb-1 text-white">4.8k</div>
                  <div className="text-xs text-neutral-500 uppercase">Avg Votes</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Before CTA */}
      <section className="py-10 border-y border-neutral-900 bg-black/50 backdrop-blur-sm overflow-hidden">
        <ProductMarquee />
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 bg-black border-t border-neutral-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-8 tracking-tight">
            Ready to find your next big win?
          </h2>
          <p className="text-xl text-neutral-400 mb-12">
            Join thousands of founders using Product Huntr to validate ideas and launch with confidence.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="w-full sm:w-auto px-10 py-4 bg-orange-600 text-white rounded-full font-bold text-lg hover:bg-orange-700 transition-all hover:scale-105 shadow-xl shadow-orange-600/20">
              Start for $15/month
            </Link>
          </div>
          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-neutral-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" /> Cancel anytime
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" /> Instant access
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" /> <Link href="/pricing" className="hover:text-white transition-colors underline">View pricing</Link>
            </div>
          </div>
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
            <Link href="#" className="hover:text-white transition-colors">Features</Link>
            <Link href="#" className="hover:text-white transition-colors">Pricing</Link>
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