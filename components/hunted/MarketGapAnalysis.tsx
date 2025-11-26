'use client';

import React, { useState, useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ZAxis, LineChart, Line } from 'recharts';
import { useDashboard } from './DashboardContext';

export function MarketGapAnalysis() {
    const [selectedQuadrant, setSelectedQuadrant] = useState<string | null>(null);
    const { categoryTrendData } = useDashboard();

    // Process real data
    const { marketData, categoryStats, totalLaunches, avgGrowth, topCategory, fastestGrowing } = useMemo(() => {
        if (!categoryTrendData || categoryTrendData.length === 0) {
            return { marketData: [], categoryStats: [], totalLaunches: 0, avgGrowth: 0, topCategory: '-', fastestGrowing: '-' };
        }

        // 1. Identify Categories
        const categories = new Set<string>();
        const latest = categoryTrendData[categoryTrendData.length - 1];
        Object.keys(latest).forEach(key => {
            if (key !== 'time' && key !== 'hour' && key !== 'month' && !key.endsWith('_comments') && !key.endsWith('_launches')) {
                categories.add(key);
            }
        });

        // 2. Calculate Stats per Category
        const stats = Array.from(categories).map(category => {
            // Launches
            const launches = categoryTrendData.reduce((sum, point) => {
                return sum + ((point[`${category}_launches`] as number) || 0);
            }, 0);

            // Avg Votes (Demand)
            // We'll take the average of the monthly averages, weighted by launches if possible, or just simple average of non-zero months
            let voteSum = 0;
            let voteCount = 0;
            categoryTrendData.forEach(point => {
                const val = point[category] as number;
                if (val > 0) {
                    voteSum += val;
                    voteCount++;
                }
            });
            const avgVotes = voteCount > 0 ? Math.round(voteSum / voteCount) : 0;

            // Growth (YoY or Period over Period)
            // Compare last 3 months vs previous 3 months (or similar)
            // If data is short, compare first half vs second half
            const midPoint = Math.floor(categoryTrendData.length / 2);
            const firstHalf = categoryTrendData.slice(0, midPoint);
            const secondHalf = categoryTrendData.slice(midPoint);

            const firstHalfLaunches = firstHalf.reduce((sum, p) => sum + ((p[`${category}_launches`] as number) || 0), 0);
            const secondHalfLaunches = secondHalf.reduce((sum, p) => sum + ((p[`${category}_launches`] as number) || 0), 0);

            // Avoid division by zero
            const growth = firstHalfLaunches === 0 ? (secondHalfLaunches > 0 ? 100 : 0) : Math.round(((secondHalfLaunches - firstHalfLaunches) / firstHalfLaunches) * 100);

            return {
                name: category,
                launches,
                avgVotes,
                growth,
                color: '#6b7280', // Default, will assign based on quadrant
                quadrant: '',
                share: 0
            };
        });

        const totalLaunchesVal = stats.reduce((sum, s) => sum + s.launches, 0);

        // 3. Assign Quadrants and Colors
        // Calculate medians/means to define quadrants
        const medianLaunches = stats.length > 0 ? stats.sort((a, b) => a.launches - b.launches)[Math.floor(stats.length / 2)].launches : 0;
        const medianVotes = stats.length > 0 ? stats.sort((a, b) => a.avgVotes - b.avgVotes)[Math.floor(stats.length / 2)].avgVotes : 0;

        const processedStats = stats.map(s => {
            s.share = totalLaunchesVal > 0 ? Math.round((s.launches / totalLaunchesVal) * 1000) / 10 : 0;

            // Quadrant Logic
            // High Demand (Votes), Low Comp (Launches) -> Blue Ocean
            // High Demand, High Comp -> Red Ocean
            // Low Demand, High Comp -> Emerging (or Saturated?) -> Let's stick to "Emerging" label from original code but maybe "Saturated" is better? 
            // Original: Emerging = Low Demand, High Comp. Niche = Low Demand, Low Comp.

            if (s.avgVotes >= medianVotes) {
                if (s.launches < medianLaunches) {
                    s.quadrant = 'blue';
                    s.color = '#10b981'; // Emerald
                } else {
                    s.quadrant = 'red';
                    s.color = '#ef4444'; // Red
                }
            } else {
                if (s.launches >= medianLaunches) {
                    s.quadrant = 'emerging';
                    s.color = '#f59e0b'; // Amber
                } else {
                    s.quadrant = 'niche';
                    s.color = '#6b7280'; // Gray
                }
            }
            return s;
        });

        // Sort by launches for the card view
        const sortedStats = [...processedStats].sort((a, b) => b.launches - a.launches);

        // Summary metrics
        const avgGrowthVal = stats.length > 0 ? Math.round(stats.reduce((sum, s) => sum + s.growth, 0) / stats.length) : 0;
        const topCat = sortedStats.length > 0 ? sortedStats[0].name : '-';
        const fastest = [...processedStats].sort((a, b) => b.growth - a.growth)[0]?.name || '-';

        return {
            marketData: processedStats.map(s => ({
                name: s.name,
                x: s.launches,
                y: s.avgVotes,
                size: s.launches, // Using launches as size for bubble
                color: s.color,
                quadrant: s.quadrant,
                count: 1 // Dummy for aggregation if needed
            })),
            categoryStats: sortedStats,
            totalLaunches: totalLaunchesVal,
            avgGrowth: avgGrowthVal,
            topCategory: topCat,
            fastestGrowing: fastest
        };
    }, [categoryTrendData]);

    const quadrants = [
        {
            id: 'blue',
            name: 'Blue Ocean',
            color: '#10b981',
            description: 'HIGH DEMAND • LOW COMP',
            count: marketData.filter(d => d.quadrant === 'blue').length,
            recommendation: 'Best opportunity for new launches'
        },
        {
            id: 'red',
            name: 'Red Ocean',
            color: '#ef4444',
            description: 'HIGH DEMAND • HIGH COMP',
            count: marketData.filter(d => d.quadrant === 'red').length,
            recommendation: 'Requires strong differentiation'
        },
        {
            id: 'emerging',
            name: 'Emerging',
            color: '#f59e0b',
            description: 'LOW DEMAND • HIGH COMP',
            count: marketData.filter(d => d.quadrant === 'emerging').length,
            recommendation: 'Growing market, early mover advantage'
        },
        {
            id: 'niche',
            name: 'Niche',
            color: '#6b7280',
            description: 'LOW DEMAND • LOW COMP',
            count: marketData.filter(d => d.quadrant === 'niche').length,
            recommendation: 'Specialized opportunities'
        },
    ];

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-gray-900 border border-white/20 rounded-lg p-3 shadow-xl">
                    <div className="text-sm font-semibold text-white mb-2">{data.name}</div>
                    <div className="space-y-1">
                        <div className="text-xs text-gray-300">
                            Competition: <span className="font-semibold text-white">{data.x} launches</span>
                        </div>
                        <div className="text-xs text-gray-300">
                            Demand: <span className="font-semibold text-white">{data.y} avg upvotes</span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6">
            {/* Category Volume Overview */}
            <div className="bg-black/20 border border-white/[0.08] rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            <h3 className="text-lg font-semibold text-white">Category Launch Volume</h3>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Total launches and market share by category</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 rounded-lg text-xs font-medium text-blue-400">
                            All Time
                        </button>
                    </div>
                </div>

                {/* Category Cards Grid */}
                <div className="grid grid-cols-3 gap-4">
                    {categoryStats.slice(0, 9).map((category, index) => (
                        <div
                            key={category.name}
                            className="relative overflow-hidden bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 rounded-xl p-4 hover:border-white/20 transition group"
                        >
                            {/* Rank Badge */}
                            <div className="absolute top-3 right-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index < 3 ? 'bg-orange-500/20 text-orange-400' : 'bg-white/10 text-gray-400'
                                    }`}>
                                    {index + 1}
                                </div>
                            </div>

                            {/* Category Info */}
                            <div className="mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{
                                            backgroundColor: category.color,
                                            boxShadow: `0 0 8px ${category.color}80`
                                        }}
                                    />
                                    <h4 className="text-sm font-semibold text-white truncate">{category.name}</h4>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-white">{category.launches}</span>
                                    <span className="text-xs text-gray-400">launches</span>
                                </div>
                            </div>

                            {/* Metrics */}
                            <div className="space-y-2">
                                {/* Market Share */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-gray-400">Market Share</span>
                                        <span className="text-xs font-semibold text-white">{category.share}%</span>
                                    </div>
                                    <div className="w-full bg-white/5 rounded-full h-1.5">
                                        <div
                                            className="h-1.5 rounded-full transition-all"
                                            style={{
                                                width: `${Math.min(category.share * 4, 100)}%`,
                                                backgroundColor: category.color
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Growth */}
                                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                    <span className="text-xs text-gray-400">Growth</span>
                                    <div className="flex items-center gap-1">
                                        {category.growth > 0 ? (
                                            <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                            </svg>
                                        ) : category.growth < 0 ? (
                                            <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                                            </svg>
                                        ) : (
                                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                                            </svg>
                                        )}
                                        <span className={`text-xs font-semibold ${category.growth > 50 ? 'text-emerald-400' :
                                                category.growth > 0 ? 'text-blue-400' :
                                                    'text-red-400'
                                            }`}>
                                            {category.growth > 0 ? '+' : ''}{category.growth}%
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Hover Effect Border */}
                            <div
                                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition pointer-events-none"
                                style={{
                                    boxShadow: `inset 0 0 0 1px ${category.color}40`
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-white mb-1">{totalLaunches.toLocaleString()}</div>
                        <div className="text-xs text-gray-400">Total Launches</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-emerald-400 mb-1">{avgGrowth > 0 ? '+' : ''}{avgGrowth}%</div>
                        <div className="text-xs text-gray-400">Avg Growth</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400 mb-1 truncate px-2">{topCategory}</div>
                        <div className="text-xs text-gray-400">Top Category</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-violet-400 mb-1 truncate px-2">{fastestGrowing}</div>
                        <div className="text-xs text-gray-400">Fastest Growing</div>
                    </div>
                </div>
            </div>

            {/* Market Opportunity Matrix */}
            <div className="bg-black/20 border border-white/[0.08] rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <h3 className="text-lg font-semibold text-white">Market Opportunity Matrix</h3>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Competition vs. Demand analysis across categories</p>
                    </div>
                </div>

                {/* Quadrant Cards Grid */}
                <div className="grid grid-cols-2 gap-6">
                    {quadrants.map((quadrant) => {
                        const categories = marketData.filter(d => d.quadrant === quadrant.id);
                        const avgDemand = categories.length > 0 ? Math.round(categories.reduce((sum, c) => sum + c.y, 0) / categories.length) : 0;
                        const avgCompetition = categories.length > 0 ? Math.round(categories.reduce((sum, c) => sum + c.x, 0) / categories.length) : 0;

                        return (
                            <div
                                key={quadrant.id}
                                className={`relative overflow-hidden rounded-xl border-2 transition-all ${selectedQuadrant === quadrant.id
                                        ? 'border-white/30 scale-[1.02]'
                                        : 'border-white/10 hover:border-white/20'
                                    }`}
                                style={{
                                    background: `linear-gradient(135deg, ${quadrant.color}15 0%, ${quadrant.color}05 100%)`
                                }}
                                onClick={() => setSelectedQuadrant(selectedQuadrant === quadrant.id ? null : quadrant.id)}
                            >
                                {/* Header */}
                                <div className="p-5 border-b border-white/10">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded-full shadow-lg"
                                                style={{
                                                    backgroundColor: quadrant.color,
                                                    boxShadow: `0 0 12px ${quadrant.color}80`
                                                }}
                                            />
                                            <h4 className="text-base font-bold text-white">{quadrant.name}</h4>
                                        </div>
                                        <span className="px-2 py-1 bg-white/10 rounded-full text-xs font-bold text-white">
                                            {quadrant.count}
                                        </span>
                                    </div>
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                                        {quadrant.description}
                                    </p>
                                </div>

                                {/* Metrics */}
                                <div className="p-5 space-y-4">
                                    {/* Demand Bar */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-medium text-gray-400">Avg Demand</span>
                                            <span className="text-sm font-bold text-white">{avgDemand} votes</span>
                                        </div>
                                        <div className="w-full bg-white/5 rounded-full h-2">
                                            <div
                                                className="h-2 rounded-full transition-all"
                                                style={{
                                                    width: `${Math.min((avgDemand / 300) * 100, 100)}%`,
                                                    background: `linear-gradient(90deg, ${quadrant.color}, ${quadrant.color}80)`
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Competition Bar */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-medium text-gray-400">Avg Competition</span>
                                            <span className="text-sm font-bold text-white">{avgCompetition} launches</span>
                                        </div>
                                        <div className="w-full bg-white/5 rounded-full h-2">
                                            <div
                                                className="h-2 rounded-full transition-all"
                                                style={{
                                                    width: `${Math.min((avgCompetition / 50) * 100, 100)}%`,
                                                    background: `linear-gradient(90deg, ${quadrant.color}80, ${quadrant.color}40)`
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Recommendation */}
                                    <div className="pt-3 border-t border-white/10">
                                        <p className="text-xs text-gray-300 leading-relaxed">
                                            💡 {quadrant.recommendation}
                                        </p>
                                    </div>
                                </div>

                                {/* Categories List */}
                                <div className="p-5 pt-0">
                                    <div className="space-y-2">
                                        {categories.slice(0, 5).map((category) => (
                                            <div
                                                key={category.name}
                                                className="flex items-center justify-between p-2 bg-black/20 rounded-lg border border-white/5 hover:bg-black/30 transition"
                                            >
                                                <span className="text-xs font-medium text-gray-200 truncate max-w-[120px]">{category.name}</span>
                                                <div className="flex items-center gap-3 text-xs">
                                                    <span className="text-gray-400">{category.y}↑</span>
                                                    <span className="text-gray-500">{category.x}⚡</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
