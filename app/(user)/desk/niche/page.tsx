'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Target, ArrowRight, TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function NicheDirectoryPage() {
    const [loading, setLoading] = useState(true);
    const [niches, setNiches] = useState<any[]>([]);
    const supabase = createClientComponentClient();

    useEffect(() => {
        loadNiches();
    }, []);

    const loadNiches = async () => {
        setLoading(true);
        try {
            const { data: launches } = await supabase
                .from('ph_launches')
                .select('ai_analysis, votes_count, comments_count, launched_at')
                .not('ai_analysis', 'is', null);

            if (!launches) {
                setLoading(false);
                return;
            }

            // Group by niche
            const nicheMap = new Map<string, {
                launches: any[];
                totalVotes: number;
                totalComments: number;
                recentLaunches: number;
            }>();

            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            launches.forEach(launch => {
                const niche = launch.ai_analysis?.niche;
                if (!niche) return;

                if (!nicheMap.has(niche)) {
                    nicheMap.set(niche, {
                        launches: [],
                        totalVotes: 0,
                        totalComments: 0,
                        recentLaunches: 0,
                    });
                }

                const data = nicheMap.get(niche)!;
                data.launches.push(launch);
                data.totalVotes += launch.votes_count || 0;
                data.totalComments += launch.comments_count || 0;

                if (new Date(launch.launched_at) > sixMonthsAgo) {
                    data.recentLaunches += 1;
                }
            });

            // Convert to array and calculate metrics
            const nicheArray = Array.from(nicheMap.entries()).map(([niche, data]) => {
                const avgVotes = Math.round(data.totalVotes / data.launches.length);
                const avgComments = Math.round(data.totalComments / data.launches.length);
                const totalLaunches = data.launches.length;
                const oldLaunches = totalLaunches - data.recentLaunches;
                const growthRate = oldLaunches > 0
                    ? Math.round(((data.recentLaunches - oldLaunches) / oldLaunches) * 100)
                    : 100;

                let trend: 'rising' | 'stable' | 'declining' = 'stable';
                if (growthRate > 30) trend = 'rising';
                else if (growthRate < -30) trend = 'declining';

                return {
                    niche,
                    totalLaunches,
                    avgVotes,
                    avgComments,
                    growthRate,
                    trend,
                    recentActivity: data.recentLaunches,
                };
            });

            // Sort by total launches
            nicheArray.sort((a, b) => b.totalLaunches - a.totalLaunches);

            setNiches(nicheArray);
        } catch (error) {
            console.error('Error loading niches:', error);
        }
        setLoading(false);
    };

    const getTrendIcon = (trend: 'rising' | 'stable' | 'declining') => {
        if (trend === 'rising') return <TrendingUp className="w-4 h-4 text-green-600" />;
        if (trend === 'declining') return <TrendingDown className="w-4 h-4 text-red-600" />;
        return <Minus className="w-4 h-4 text-gray-600" />;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading niches...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Niche Analysis
                    </h1>
                    <p className="text-gray-600">
                        Deep dive into {niches.length} product categories to understand success drivers.
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <div className="text-sm text-gray-600 mb-1">Total Niches</div>
                        <div className="text-3xl font-bold text-blue-600">{niches.length}</div>
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <div className="text-sm text-gray-600 mb-1">Rising Categories</div>
                        <div className="text-3xl font-bold text-green-600">
                            {niches.filter(n => n.trend === 'rising').length}
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <div className="text-sm text-gray-600 mb-1">Most Active</div>
                        <div className="text-xl font-bold text-gray-900 truncate">
                            {niches[0]?.niche || 'N/A'}
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <div className="text-sm text-gray-600 mb-1">Highest Avg Votes</div>
                        <div className="text-xl font-bold text-gray-900 truncate">
                            {[...niches].sort((a, b) => b.avgVotes - a.avgVotes)[0]?.niche || 'N/A'}
                        </div>
                    </div>
                </div>

                {/* Niches Grid */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">All Niches ({niches.length})</h2>
                        <div className="text-sm text-gray-600 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-600" /> Rising
                            <Minus className="w-4 h-4 text-gray-600" /> Stable
                            <TrendingDown className="w-4 h-4 text-red-600" /> Declining
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {niches.map((niche, index) => (
                            <Link
                                key={niche.niche}
                                href={`/desk/niche/${encodeURIComponent(niche.niche)}`}
                                className="bg-white rounded-lg border border-gray-200 hover:border-blue-500 p-6 transition-all hover:shadow-sm group"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                                            {niche.niche}
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-2 ml-3">
                                        {getTrendIcon(niche.trend)}
                                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <div className="text-xs text-gray-600 mb-1">Total Launches</div>
                                        <div className="text-2xl font-bold text-gray-900">{niche.totalLaunches}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-600 mb-1">Avg Upvotes</div>
                                        <div className="text-2xl font-bold text-blue-600">{niche.avgVotes}</div>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-gray-200 flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Recent (6mo): {niche.recentActivity}</span>
                                    <span className={`font-semibold ${niche.growthRate > 0 ? 'text-green-600' : niche.growthRate < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                                        {niche.growthRate > 0 ? '+' : ''}{niche.growthRate}%
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Empty State */}
                {niches.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                        <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Niches Found</h3>
                        <p className="text-gray-600">Check back later for niche data</p>
                    </div>
                )}
            </div>
        </div>
    );
}
