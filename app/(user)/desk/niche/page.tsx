'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function CategoriesPage() {
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
        if (trend === 'rising') return <TrendingUp className="w-3.5 h-3.5 text-green-600" />;
        if (trend === 'declining') return <TrendingDown className="w-3.5 h-3.5 text-red-600" />;
        return <Minus className="w-3.5 h-3.5 text-gray-400" />;
    };

    const getTrendColor = (trend: 'rising' | 'stable' | 'declining') => {
        if (trend === 'rising') return 'bg-green-50 text-green-700 border-green-100';
        if (trend === 'declining') return 'bg-red-50 text-red-700 border-red-100';
        return 'bg-gray-50 text-gray-600 border-gray-100';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500 text-sm">Loading categories...</p>
                </div>
            </div>
        );
    }

    const risingCount = niches.filter(n => n.trend === 'rising').length;
    const mostActive = niches[0];
    const highestVotes = [...niches].sort((a, b) => b.avgVotes - a.avgVotes)[0];

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-[1400px] mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">
                        Categories
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Deep dive into {niches.length} product categories to understand success drivers.
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-lg border border-gray-100 p-5 hover:border-gray-200 transition-colors">
                        <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">Total Categories</div>
                        <div className="text-2xl font-bold text-gray-900">{niches.length}</div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-100 p-5 hover:border-gray-200 transition-colors">
                        <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">Rising</div>
                        <div className="text-2xl font-bold text-green-600">{risingCount}</div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-100 p-5 hover:border-gray-200 transition-colors">
                        <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">Most Active</div>
                        <div className="text-base font-semibold text-gray-900 truncate">
                            {mostActive?.niche || 'N/A'}
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-100 p-5 hover:border-gray-200 transition-colors">
                        <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">Highest Avg Votes</div>
                        <div className="text-base font-semibold text-gray-900 truncate">
                            {highestVotes?.niche || 'N/A'}
                        </div>
                    </div>
                </div>

                {/* Categories Grid */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">
                            All Categories
                            <span className="ml-2 text-sm font-normal text-gray-400">
                                {niches.length}
                            </span>
                        </h2>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1.5">
                                <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                                <span>Rising</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Minus className="w-3.5 h-3.5 text-gray-400" />
                                <span>Stable</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <TrendingDown className="w-3.5 h-3.5 text-red-600" />
                                <span>Declining</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {niches.map((niche) => (
                            <Link
                                key={niche.niche}
                                href={`/desk/niche/${encodeURIComponent(niche.niche)}`}
                                className="group block"
                            >
                                <div className="relative bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 hover:shadow-lg transition-all duration-200 overflow-hidden">
                                    {/* Gradient Accent */}
                                    <div className={`absolute top-0 left-0 right-0 h-1 ${niche.trend === 'rising'
                                            ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                                            : niche.trend === 'declining'
                                                ? 'bg-gradient-to-r from-red-400 to-rose-500'
                                                : 'bg-gradient-to-r from-gray-300 to-gray-400'
                                        }`} />

                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-5">
                                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors flex-1 min-w-0 pr-3 leading-tight">
                                            {niche.niche}
                                        </h3>
                                        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold ${getTrendColor(niche.trend)}`}>
                                            {getTrendIcon(niche.trend)}
                                            <span className="hidden sm:inline">
                                                {niche.trend === 'rising' ? 'Rising' : niche.trend === 'declining' ? 'Declining' : 'Stable'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Metrics */}
                                    <div className="grid grid-cols-2 gap-5 mb-5">
                                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 border border-gray-100">
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Total Launches</div>
                                            <div className="text-2xl font-bold text-gray-900">{niche.totalLaunches}</div>
                                        </div>
                                        <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-4 border border-blue-100">
                                            <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-2">Avg Upvotes</div>
                                            <div className="text-2xl font-bold text-blue-600">{niche.avgVotes}</div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-gray-300" />
                                            <span className="text-xs text-gray-500">
                                                Recent: <span className="font-semibold text-gray-900">{niche.recentActivity}</span>
                                            </span>
                                        </div>
                                        <div className={`flex items-center gap-1 px-2 py-1 rounded-md font-bold text-xs ${niche.growthRate > 0
                                                ? 'bg-green-50 text-green-700'
                                                : niche.growthRate < 0
                                                    ? 'bg-red-50 text-red-700'
                                                    : 'bg-gray-50 text-gray-600'
                                            }`}>
                                            {niche.growthRate > 0 ? '↑' : niche.growthRate < 0 ? '↓' : '→'}
                                            <span>{Math.abs(niche.growthRate)}%</span>
                                        </div>
                                    </div>

                                    {/* Hover Effect Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300 pointer-events-none rounded-xl" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Empty State */}
                {niches.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">No Categories Found</h3>
                        <p className="text-gray-500 text-sm">Check back later for category data</p>
                    </div>
                )}
            </div>
        </div>
    );
}
