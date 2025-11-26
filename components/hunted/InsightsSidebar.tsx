'use client';

import React from 'react';
import { CategoryInsight, LaunchInsight, MarketGap } from '@/lib/market-insights';
import { CategoryTrends } from './CategoryTrends';
import { LaunchInsights } from './LaunchInsights';
import { MarketOpportunities } from './MarketOpportunitiesPanel';
import { ComposedChart, Line, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowUp, MessageCircle, Flame, Users } from 'lucide-react';

interface InsightsSidebarProps {
    totalVotes: number;
    totalComments: number;
    topProduct: string;
    mostPopularTopic: string;
    featuredToday: number;
    categoryInsights: CategoryInsight[];
    launchInsights: LaunchInsight[];
    marketGaps: MarketGap[];
    makerStrategies: {
        teamSizeDistribution: { solo: number; small: number; team: number };
        avgMakersPerProduct: string;
        topPerformingTeamSize: number;
    };
}


export function InsightsSidebar({
    totalVotes,
    totalComments,
    topProduct,
    mostPopularTopic,
    featuredToday,
    categoryInsights,
    launchInsights,
    marketGaps,
    makerStrategies
}: InsightsSidebarProps) {
    // Market segments data
    const marketSegments = [
        { name: 'B2B SaaS', value: 3200, color: '#10b981' },
        { name: 'Consumer Apps', value: 2100, color: '#3b82f6' },
        { name: 'Dev Tools', value: 1800, color: '#8b5cf6' },
        { name: 'Design Tools', value: 1500, color: '#f59e0b' },
        { name: 'Other', value: 1905, color: '#6b7280' },
    ];

    return (
        <div className="flex flex-col h-full">
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                    {/* Key Metrics */}
                    <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-white/10 rounded-xl p-4">
                        <h3 className="text-base font-bold text-white mb-4">Key Metrics</h3>
                        <div className="space-y-3">
                            {/* Top Category */}
                            <div className="bg-black/30 border border-white/5 rounded-lg p-4 text-center">
                                <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">Top Category</div>
                                <div className="text-base font-bold text-white">{mostPopularTopic || 'N/A'}</div>
                            </div>

                            {/* Fastest Growing */}
                            <div className="bg-black/30 border border-white/5 rounded-lg p-4 text-center">
                                <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">Fastest Growing</div>
                                <div className="text-base font-bold text-white">
                                    {categoryInsights.length > 0
                                        ? categoryInsights.filter(c => c.trend === 'hot' || c.trend === 'growing').sort((a, b) => b.totalVotes - a.totalVotes)[0]?.category || mostPopularTopic || 'N/A'
                                        : mostPopularTopic || 'N/A'}
                                </div>
                            </div>

                            {/* Most Popular */}
                            <div className="bg-black/30 border border-white/5 rounded-lg p-4 text-center">
                                <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">Most Popular</div>
                                <div className="text-base font-bold text-white">{topProduct || mostPopularTopic || 'N/A'}</div>
                            </div>

                            {/* Total Launches */}
                            <div className="bg-black/30 border border-white/5 rounded-lg p-4 text-center">
                                <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">Total Launches</div>
                                <div className="text-base font-bold text-white">{featuredToday.toLocaleString()}</div>
                            </div>
                        </div>
                    </div>

                    {/* Market Distribution */}
                    <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-white/10 rounded-xl p-4">
                        <h3 className="text-sm font-semibold text-white mb-3">Market Distribution</h3>
                        <ResponsiveContainer width="100%" height={180}>
                            <PieChart>
                                <Pie
                                    data={marketSegments}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={45}
                                    outerRadius={70}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {marketSegments.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2">
                            {marketSegments.map((segment) => (
                                <div key={segment.name} className="flex items-center justify-between text-[10px]">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: segment.color }} />
                                        <span className="text-gray-300">{segment.name}</span>
                                    </div>
                                    <span className="text-white font-mono font-semibold">{segment.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
