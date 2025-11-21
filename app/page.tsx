'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import TrendCard from '@/components/TrendCard';
import HeroChart from '@/components/HeroChart';
import {
  Zap,
  ArrowRight,
  TrendingUp,
  Target,
  ShieldCheck,
  Layers,
  Search,
  BarChart2,
  Lock
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

interface NicheData {
  category: string;
  launches: number;
  avgEngagement: number;
  growthRate: number;
}

interface LandingStats {
  totalProducts: number;
  successRate: number;
  marketGaps: number;
  highPerformers: number;
}

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [showLanding, setShowLanding] = useState(false);
  const [trends, setTrends] = useState<Trend[]>([]);
  const [topNiches, setTopNiches] = useState<NicheData[]>([]);
  const [stats, setStats] = useState<LandingStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (mounted) {
          if (session) {
            if (window.location.pathname === '/') {
              router.replace('/desk');
            }
          } else {
            setShowLanding(true);
            fetchData();
          }
          setChecking(false);
        }
      } catch (error) {
        console.error('Session check error:', error);
        if (mounted) {
          setShowLanding(true);
          setChecking(false);
        }
      }
    };

    const fetchData = async () => {
      try {
        const res = await fetch('/api/landing-trends');
        const data = await res.json();
        if (data.trends) setTrends(data.trends);
        if (data.topNiches) setTopNiches(data.topNiches);
        if (data.stats) setStats(data.stats);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    return () => {
      mounted = false;
    };
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d1117]">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!showLanding) return null;

  return (
    <div className="min-h-screen bg-[#0d1117] text-white font-sans selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-[#0d1117]/80 backdrop-blur-xl border-b border-white/5 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">FounderSignal</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">Log In</Link>
            <Link href="/login" className="text-sm font-semibold bg-white text-[#0d1117] px-5 py-2 rounded-full hover:bg-neutral-200 transition-colors shadow-lg shadow-white/5">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -z-10 opacity-40"></div>
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] -z-10 opacity-30"></div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Tracking {stats?.totalProducts ? stats.totalProducts.toLocaleString() : '15,000+'} launches in real-time
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-white">
              Spot the next <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                unicorn trend.
              </span>
            </h1>

            <p className="text-lg text-neutral-400 max-w-lg leading-relaxed">
              We analyze thousands of Product Hunt launches to identify exploding niches, validate ideas, and find blue ocean opportunities before they go mainstream.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/login" className="px-8 py-4 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-500 transition-all hover:scale-105 shadow-lg shadow-blue-900/20 flex items-center gap-2">
                Start Analyzing Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="#trends" className="px-8 py-4 bg-[#161b22] border border-white/10 text-white rounded-full font-semibold hover:bg-[#1c2128] transition-colors">
                View Trends
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/5">
              <div>
                <div className="text-2xl font-bold text-white">{stats?.totalProducts ? (stats.totalProducts / 1000).toFixed(1) + 'k+' : '15k+'}</div>
                <div className="text-xs text-neutral-500 font-medium uppercase tracking-wider mt-1">Products</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stats?.successRate || '98'}%</div>
                <div className="text-xs text-neutral-500 font-medium uppercase tracking-wider mt-1">Accuracy</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stats?.marketGaps || '24'}</div>
                <div className="text-xs text-neutral-500 font-medium uppercase tracking-wider mt-1">Gaps Found</div>
              </div>
            </div>
          </div>

          {/* Hero Chart */}
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-10 blur-2xl"></div>
            {loading ? (
              <div className="w-full h-[420px] bg-[#161b22] rounded-xl animate-pulse border border-white/5"></div>
            ) : (
              <HeroChart data={topNiches} />
            )}
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="py-32 px-6 bg-[#0d1117] relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">Enterprise-Grade Intelligence</h2>
            <p className="text-neutral-400 max-w-2xl mx-auto text-lg">
              Stop guessing. Use data to validate your next big idea.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Large Card */}
            <div className="md:col-span-2 bg-[#161b22] border border-white/5 rounded-2xl p-8 hover:border-white/10 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <TrendingUp className="w-32 h-32 text-blue-500" />
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 border border-blue-500/20">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Trend Velocity</h3>
              <p className="text-neutral-400 mb-8 max-w-md leading-relaxed">
                Identify which niches are heating up before they explode. Our velocity algorithms track momentum across millions of data points to give you an unfair advantage.
              </p>
              <div className="h-32 bg-gradient-to-t from-blue-500/5 to-transparent rounded-xl border border-blue-500/10 relative overflow-hidden">
                <div className="absolute bottom-0 left-0 right-0 h-px bg-blue-500/30"></div>
                <svg className="absolute bottom-0 left-0 right-0 h-full w-full" preserveAspectRatio="none">
                  <path d="M0,100 C100,80 200,90 300,40 L400,20 L500,10 L800,0 L800,128 L0,128 Z" fill="url(#grad1)" className="opacity-20" />
                  <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: 'rgb(59, 130, 246)', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: 'rgb(59, 130, 246)', stopOpacity: 0 }} />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Tall Card */}
            <div className="bg-[#161b22] border border-white/5 rounded-2xl p-8 hover:border-white/10 transition-all group">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 border border-purple-500/20">
                <Target className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">ICP Identification</h3>
              <p className="text-neutral-400 mb-8 leading-relaxed">
                Stop guessing who your customer is. We analyze successful launches to pinpoint the exact Ideal Customer Profile.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-neutral-300 p-3 bg-white/5 rounded-lg border border-white/5">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  Freelance Developers
                </div>
                <div className="flex items-center gap-3 text-sm text-neutral-300 p-3 bg-white/5 rounded-lg border border-white/5">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  SaaS Founders
                </div>
                <div className="flex items-center gap-3 text-sm text-neutral-300 p-3 bg-white/5 rounded-lg border border-white/5">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  Growth Marketers
                </div>
              </div>
            </div>

            {/* Small Card 1 */}
            <div className="bg-[#161b22] border border-white/5 rounded-2xl p-8 hover:border-white/10 transition-all group">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 border border-emerald-500/20">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Risk Analysis</h3>
              <p className="text-neutral-400 leading-relaxed">
                See why similar products failed so you don't make the same mistakes.
              </p>
            </div>

            {/* Small Card 2 */}
            <div className="md:col-span-2 bg-[#161b22] border border-white/5 rounded-2xl p-8 hover:border-white/10 transition-all group flex flex-col sm:flex-row items-center gap-8">
              <div className="flex-1">
                <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-6 border border-orange-500/20">
                  <Layers className="w-6 h-6 text-orange-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Market Gaps</h3>
                <p className="text-neutral-400 leading-relaxed">
                  Find "Blue Ocean" opportunities where demand is high but supply is low.
                </p>
              </div>
              <div className="flex-1 w-full">
                <div className="bg-[#0d1117] rounded-xl p-5 border border-white/5 shadow-inner">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Opportunity Score</span>
                    <span className="text-sm font-bold text-emerald-400">94/100</span>
                  </div>
                  <div className="h-2.5 bg-[#161b22] rounded-full overflow-hidden border border-white/5">
                    <div className="h-full w-[94%] bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-neutral-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    {stats?.marketGaps ? `${stats.marketGaps} active gaps identified` : 'Analyzing gaps...'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Grid */}
      <section id="trends" className="py-32 px-6 bg-[#0d1117] border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-3 tracking-tight">Exploding Niches</h2>
              <p className="text-neutral-400">Categories seeing abnormal growth in the last 30 days.</p>
            </div>
            <Link href="/login" className="hidden sm:flex items-center gap-2 text-sm font-semibold text-white hover:text-blue-400 transition-colors">
              View all 100+ niches <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-56 bg-[#161b22] rounded-xl animate-pulse border border-white/5"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {trends.slice(0, 6).map((trend, i) => (
                <TrendCard key={trend.id} {...trend} delay={i * 100} />
              ))}

              {/* Blurred Cards for "Pro" feel */}
              <div className="relative group">
                <div className="absolute inset-0 bg-[#161b22]/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-xl border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-3">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-white">Unlock 50+ more niches</span>
                  <span className="text-xs text-neutral-400 mt-1">Join FounderSignal Pro</span>
                </div>
                <TrendCard
                  title="Generative Video"
                  subtitle="142 Launches"
                  metric="+450%"
                  metricLabel="Growth"
                  chartData={[{ value: 10 }, { value: 20 }, { value: 40 }, { value: 80 }, { value: 120 }]}
                  status="Exploding"
                />
              </div>
              <div className="relative group hidden sm:block">
                <div className="absolute inset-0 bg-[#161b22]/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-xl border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-3">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-white">Unlock 50+ more niches</span>
                  <span className="text-xs text-neutral-400 mt-1">Join FounderSignal Pro</span>
                </div>
                <TrendCard
                  title="AI Agents"
                  subtitle="89 Launches"
                  metric="+310%"
                  metricLabel="Growth"
                  chartData={[{ value: 15 }, { value: 25 }, { value: 35 }, { value: 60 }, { value: 90 }]}
                  status="Exploding"
                />
              </div>
              <div className="relative group hidden lg:block">
                <div className="absolute inset-0 bg-[#161b22]/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-xl border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-3">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-white">Unlock 50+ more niches</span>
                  <span className="text-xs text-neutral-400 mt-1">Join FounderSignal Pro</span>
                </div>
                <TrendCard
                  title="No-Code Databases"
                  subtitle="56 Launches"
                  metric="+120%"
                  metricLabel="Growth"
                  chartData={[{ value: 20 }, { value: 22 }, { value: 25 }, { value: 35 }, { value: 45 }]}
                  status="Rising"
                />
              </div>
            </div>
          )}

          <div className="mt-12 text-center sm:hidden">
            <Link href="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-blue-400 transition-colors">
              View all 100+ niches <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] -z-10"></div>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold mb-8 tracking-tight text-white">
            Ready to find your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">winning product?</span>
          </h2>
          <Link href="/login" className="inline-flex px-10 py-4 bg-white text-[#0d1117] rounded-full font-bold text-lg hover:bg-neutral-200 transition-all hover:scale-105 shadow-xl shadow-white/10 items-center gap-2">
            Get Started for Free <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="mt-8 text-sm text-neutral-500 font-medium">No credit card required • Free plan available</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 bg-[#0d1117]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-sm text-white tracking-tight">FounderSignal</span>
          </div>
          <div className="flex gap-8 text-sm text-neutral-500 font-medium">
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
          </div>
          <div className="text-sm text-neutral-600">
            © 2025 FounderSignal. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}