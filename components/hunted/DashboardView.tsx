'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HuntedSpaceLayout } from '@/components/hunted/HuntedSpaceLayout';
import { TrendingCategories } from '@/components/hunted/TrendingCategories';
import { TrendChart } from '@/components/hunted/TrendChart';
import { useDashboard } from '@/components/hunted/DashboardContext';
import { TopProductsSidebar } from '@/components/hunted/TopProductsSidebar';
import { InsightsSidebar } from '@/components/hunted/InsightsSidebar';


interface DashboardViewProps {
    displayDate: Date;
    leftSidebar?: React.ReactNode;
    rightSidebar?: React.ReactNode;
}

export function DashboardView({ displayDate, leftSidebar, rightSidebar }: DashboardViewProps) {
    const router = useRouter();
    const [analysisView, setAnalysisView] = useState<'categories' | 'products' | 'ideas' | 'growth'>('categories');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [rankingMetric, setRankingMetric] = useState<'votes' | 'comments' | 'volume'>('votes');


    const { products, categoryTrendData } = useDashboard();

    // Use categoryTrendData directly - no need for local state
    const liveCategoryData = categoryTrendData || [];

    // Compute metrics
    const categoryMetrics = useMemo(() => {
        if (liveCategoryData.length === 0) return {};
        const latest = liveCategoryData[liveCategoryData.length - 1];
        const prev = liveCategoryData.length > 1 ? liveCategoryData[liveCategoryData.length - 2] : null;
        const metrics: Record<string, number> = {};

        Object.keys(latest).forEach((key) => {
            if (key === 'time' || key === 'hour' || key === 'month' || key.endsWith('_comments') || key.endsWith('_launches')) return;

            const votes = latest[key] as number; // This is avgUpvotes from the data source
            const comments = (latest[`${key}_comments`] as number) || 0;
            const volume = (latest[`${key}_launches`] as number) || 0;

            switch (rankingMetric) {
                case 'votes': metrics[key] = votes; break;
                case 'comments': metrics[key] = comments; break;
                case 'volume': metrics[key] = volume; break;
            }
        });
        return metrics;
    }, [liveCategoryData, rankingMetric]);

    // Get sorted top categories
    const topCategories = useMemo(() => {
        return Object.entries(categoryMetrics)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 50) // Increased to 50 to show more categories
            .map(([name]) => name);
    }, [categoryMetrics]);

    // Select first category by default if none selected
    useEffect(() => {
        if (!selectedCategory && topCategories.length > 0) {
            setSelectedCategory(topCategories[0]);
        }
    }, [topCategories, selectedCategory]);

    // Centered Navigation Tabs
    const centerNav = (
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/10">
            {(['categories', 'products', 'ideas', 'growth'] as const).map((tab) => (
                <button
                    key={tab}
                    onClick={() => setAnalysisView(tab)}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${analysisView === tab
                        ? 'bg-white/10 text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-300'
                        }`}
                >
                    {tab}
                </button>
            ))}
        </div>
    );

    // Left Sidebar: Category Leaderboard
    const CategoryLeaderboard = () => {
        // Calculate category stats from ALL historical data points
        const categoryStats = useMemo(() => {
            if (liveCategoryData.length === 0) return [];

            return topCategories.map(category => {
                // Sum launches across ALL months
                const totalLaunches = liveCategoryData.reduce((sum, point) => {
                    return sum + ((point[`${category}_launches`] as number) || 0);
                }, 0);

                // Calculate average votes (weighted by activity)
                let voteSum = 0;
                let voteCount = 0;
                liveCategoryData.forEach(point => {
                    const val = point[category] as number;
                    if (val > 0) {
                        voteSum += val;
                        voteCount++;
                    }
                });
                const avgVotes = voteCount > 0 ? Math.round(voteSum / voteCount) : 0;

                // Calculate average comments (same pattern as votes)
                let commentSum = 0;
                let commentCount = 0;
                liveCategoryData.forEach(point => {
                    const val = (point[`${category}_comments`] as number) || 0;
                    if (val > 0) {
                        commentSum += val;
                        commentCount++;
                    }
                });
                const avgComments = commentCount > 0 ? Math.round(commentSum / commentCount) : 0;

                // Calculate growth (first half vs second half)
                const midPoint = Math.floor(liveCategoryData.length / 2);
                const firstHalf = liveCategoryData.slice(0, midPoint);
                const secondHalf = liveCategoryData.slice(midPoint);

                const firstHalfLaunches = firstHalf.reduce((sum, p) => sum + ((p[`${category}_launches`] as number) || 0), 0);
                const secondHalfLaunches = secondHalf.reduce((sum, p) => sum + ((p[`${category}_launches`] as number) || 0), 0);

                const growth = firstHalfLaunches === 0 ? (secondHalfLaunches > 0 ? 100 : 0) : Math.round(((secondHalfLaunches - firstHalfLaunches) / firstHalfLaunches) * 100);

                // Determine if growing
                const isGrowing = growth > 0;

                return {
                    category,
                    totalVotes: avgVotes,
                    totalComments: avgComments,
                    avgVotes,
                    productCount: totalLaunches, // Now using total launches across all time
                    growth,
                    isGrowing
                };
            });
        }, [topCategories, liveCategoryData]);

        return (
            <div className="flex flex-col h-full">
                <div className="p-4 border-b border-white/10 space-y-3">
                    <h2 className="text-base font-bold text-white">Category Leaderboard</h2>

                    {/* Sort Controls */}
                    <div className="grid grid-cols-3 gap-1 bg-white/5 p-1 rounded-lg">
                        <button
                            onClick={() => setRankingMetric('votes')}
                            className={`py-1.5 px-2 rounded text-[10px] font-medium transition-colors ${rankingMetric === 'votes' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            Votes
                        </button>
                        <button
                            onClick={() => setRankingMetric('comments')}
                            className={`py-1.5 px-2 rounded text-[10px] font-medium transition-colors ${rankingMetric === 'comments' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            Engagement
                        </button>
                        <button
                            onClick={() => setRankingMetric('volume')}
                            className={`py-1.5 px-2 rounded text-[10px] font-medium transition-colors ${rankingMetric === 'volume' ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            Volume
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {categoryStats.map((stat, index) => {
                        const isSelected = selectedCategory === stat.category;
                        let metricValue = 0;
                        let metricLabel = '';

                        switch (rankingMetric) {
                            case 'votes':
                                metricValue = stat.totalVotes;
                                metricLabel = 'avg votes';
                                break;
                            case 'comments':
                                metricValue = stat.totalComments;
                                metricLabel = 'avg comments';
                                break;
                            case 'volume':
                                metricValue = stat.productCount;
                                metricLabel = 'launches';
                                break;
                        }

                        return (
                            <button
                                key={stat.category}
                                onClick={() => {
                                    setSelectedCategory(stat.category);
                                    // Optional: router.push if we want deep linking
                                }}
                                className={`w-full p-3 rounded-xl border transition-all text-left group ${isSelected
                                    ? 'bg-white/10 border-white/20'
                                    : 'bg-transparent border-transparent hover:bg-white/5'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-6 h-6 flex items-center justify-center rounded text-xs font-bold ${index < 3
                                        ? 'bg-orange-500/20 text-orange-400'
                                        : 'bg-white/5 text-gray-500'
                                        }`}>
                                        {index + 1}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={`text-sm font-medium truncate ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                                                {stat.category}
                                            </span>
                                            {stat.isGrowing && rankingMetric === 'volume' && (
                                                <span className="flex h-1.5 w-1.5 relative">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-gray-500">{stat.productCount} products</span>
                                            <span className={`font-mono ${rankingMetric === 'votes' ? 'text-orange-400' :
                                                rankingMetric === 'comments' ? 'text-blue-400' :
                                                    'text-emerald-400'
                                                }`}>
                                                {metricValue.toLocaleString()} {metricLabel}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Right Sidebar: Products for selected category
    const CategoryProducts = () => {
        // Filter products by selected category
        const categoryProducts = products.filter(p => p.topics && p.topics.includes(selectedCategory));

        // Separate today's products (top 10 overall) from historical top products
        const todaysProducts = categoryProducts.slice(0, 10); // Assuming first 10 are today's
        const historicalTopProducts = categoryProducts
            .sort((a, b) => (b.votes_count || 0) - (a.votes_count || 0))
            .slice(0, 20); // Get top 20 all-time in this category

        if (!selectedCategory) return null;

        return (
            <div className="flex flex-col h-full bg-black">
                <div className="p-4 border-b border-white/10">
                    <h2 className="text-base font-semibold text-white truncate">Top in {selectedCategory}</h2>
                    <p className="text-xs text-gray-500 mt-1">{categoryProducts.length} products launched</p>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {/* Today's Launches Section */}
                    {todaysProducts.length > 0 && (
                        <div className="p-3">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Today's Launches</h3>
                                <span className="text-xs text-gray-600">{todaysProducts.length}</span>
                            </div>
                            <div className="space-y-1">
                                {todaysProducts.map((product, idx) => (
                                    <a
                                        key={product.id}
                                        href={product.ph_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-all"
                                    >
                                        <div className="text-sm font-bold text-emerald-400 w-6 text-center">{idx + 1}</div>
                                        <div className="w-10 h-10 rounded-lg bg-white/5 overflow-hidden flex-shrink-0">
                                            {product.thumbnail_url && (
                                                <img src={product.thumbnail_url} alt={product.name} className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-gray-200 group-hover:text-white truncate">
                                                {product.name}
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-xs text-gray-500 font-mono">{product.votes_count}</span>
                                                <span className="text-xs text-gray-600">•</span>
                                                <span className="text-xs text-gray-500 font-mono">{product.comments_count}</span>
                                            </div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* All-Time Top Products Section */}
                    <div className="p-3 pt-0">
                        <div className="flex items-center gap-2 mb-3 pt-3 border-t border-white/10">
                            <svg className="w-3.5 h-3.5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">All-Time Top</h3>
                            <span className="text-xs text-gray-600">{historicalTopProducts.length}</span>
                        </div>
                        <div className="space-y-1">
                            {historicalTopProducts.map((product, idx) => (
                                <a
                                    key={product.id}
                                    href={product.ph_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-all"
                                >
                                    <div className={`text-sm font-bold w-6 text-center ${idx < 3 ? 'text-orange-400' : 'text-gray-500'
                                        }`}>
                                        {idx + 1}
                                    </div>
                                    <div className="w-10 h-10 rounded-lg bg-white/5 overflow-hidden flex-shrink-0">
                                        {product.thumbnail_url && (
                                            <img src={product.thumbnail_url} alt={product.name} className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-gray-200 group-hover:text-white truncate">
                                            {product.name}
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-xs text-gray-500 font-mono">{product.votes_count}</span>
                                            <span className="text-xs text-gray-600">•</span>
                                            <span className="text-xs text-gray-500 font-mono">{product.comments_count}</span>
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>

                    {categoryProducts.length === 0 && (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-sm text-gray-500">No products found</p>
                        </div>
                    )}
                </div>
            </div >
        );
    };

    return (
        <HuntedSpaceLayout
            leftSidebar={analysisView === 'categories' ? <CategoryLeaderboard /> : (leftSidebar || <TopProductsSidebar />)}
            centerContent={
                <div className="min-h-full">
                    {analysisView === 'categories' && (
                        <TrendingCategories displayDate={displayDate} />
                    )}
                    {analysisView === 'products' && (
                        <div className="p-6">
                            <h2 className="text-xl font-bold mb-4">Top Products</h2>
                            {/* Product list would go here */}
                            <div className="grid gap-4">
                                {products.map(product => (
                                    <div key={product.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition">
                                        <div className="flex gap-4">
                                            <img src={product.thumbnail_url} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                                            <div>
                                                <h3 className="font-bold text-lg">{product.name}</h3>
                                                <p className="text-gray-400 text-sm line-clamp-1">{product.tagline}</p>
                                                <div className="flex gap-2 mt-2">
                                                    <span className="text-xs bg-white/10 px-2 py-1 rounded text-gray-300">
                                                        Votes: {product.votes_count}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {(analysisView === 'ideas' || analysisView === 'growth') && (
                        <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Coming Soon</h3>
                            <p className="text-gray-400 max-w-md">
                                The {analysisView === 'ideas' ? 'Idea Validation' : 'Growth Analytics'} module is currently under development. Check back soon for updates!
                            </p>
                        </div>
                    )}
                </div>
            }
            rightSidebar={rightSidebar || <InsightsSidebar
                totalVotes={0}
                totalComments={0}
                topProduct=""
                mostPopularTopic=""
                featuredToday={0}
                categoryInsights={[]}
                launchInsights={[]}
                marketGaps={[]}
                makerStrategies={{
                    teamSizeDistribution: { solo: 0, small: 0, team: 0 },
                    avgMakersPerProduct: "0",
                    topPerformingTeamSize: 0
                }}
            />}
            centerNav={centerNav}
        />
    );
}
