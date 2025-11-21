'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Target,
    TrendingUp,
    ArrowRight,
    Filter,
    Sparkles,
    Users,
    BarChart3
} from 'lucide-react';
import { getMarketGaps, type MarketGap } from '@/lib/charts-data';

export default function OpportunitiesPage() {
    const [loading, setLoading] = useState(true);
    const [marketGaps, setMarketGaps] = useState<MarketGap[]>([]);
    const [filter, setFilter] = useState<'all' | 'hot' | 'strong'>('all');

    useEffect(() => {
        loadOpportunities();
    }, []);

    const loadOpportunities = async () => {
        setLoading(true);
        try {
            const gaps = await getMarketGaps();
            setMarketGaps(gaps);
        } catch (error) {
            console.error('Error loading opportunities:', error);
        }
        setLoading(false);
    };

    const getFilteredGaps = () => {
        if (filter === 'hot') return marketGaps.filter(g => g.opportunityScore >= 400);
        if (filter === 'strong') return marketGaps.filter(g => g.opportunityScore >= 300 && g.opportunityScore < 400);
        return marketGaps;
    };

    const filteredGaps = getFilteredGaps();

    const getScoreBadge = (score: number) => {
        if (score >= 400) return { label: 'High Potential', color: 'bg-blue-100', textColor: 'text-blue-900' };
        if (score >= 300) return { label: 'Moderate Potential', color: 'bg-gray-100', textColor: 'text-gray-900' };
        return { label: 'Standard', color: 'bg-gray-50', textColor: 'text-gray-700' };
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-3 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Finding opportunities...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-6 py-12">
                {/* Header Section */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
                            <Target className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900">
                                Market Opportunities
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Underserved market segments with growth potential
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                                <Target className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">{marketGaps.length}</div>
                                <div className="text-sm text-gray-500">Total Opportunities</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {marketGaps.filter(g => g.opportunityScore >= 400).length}
                                </div>
                                <div className="text-sm text-gray-600">High Potential Markets</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                                <BarChart3 className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {Math.round(marketGaps.reduce((sum, g) => sum + g.avgEngagement, 0) / marketGaps.length || 0)}
                                </div>
                                <div className="text-sm text-gray-500">Avg Engagement</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="flex items-center gap-3 mb-6">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'all'
                                ? 'bg-gray-900 text-white shadow-sm'
                                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            All ({marketGaps.length})
                        </button>
                        <button
                            onClick={() => setFilter('hot')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'hot'
                                ? 'bg-green-500 text-white shadow-sm'
                                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            High Potential ({marketGaps.filter(g => g.opportunityScore >= 400).length})
                        </button>
                        <button
                            onClick={() => setFilter('strong')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'strong'
                                ? 'bg-blue-500 text-white shadow-sm'
                                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            Moderate ({marketGaps.filter(g => g.opportunityScore >= 300 && g.opportunityScore < 400).length})
                        </button>
                    </div>
                </div>

                {/* Opportunities Grid */}
                <div className="space-y-4">
                    {filteredGaps.map((gap, index) => {
                        const badge = getScoreBadge(gap.opportunityScore);
                        const actualIndex = marketGaps.indexOf(gap);

                        return (
                            <Link
                                key={`${gap.icp}-${gap.problem}-${index}`}
                                href={`/desk/niche/${encodeURIComponent(gap.niche)}`}
                                className="block"
                            >
                                <div className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-gray-200 hover:shadow-lg transition-all group">
                                    <div className="flex items-start gap-6">
                                        {/* Rank Badge */}
                                        <div className="flex-shrink-0">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold ${actualIndex < 3
                                                    ? 'bg-gray-900 text-white'
                                                    : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {actualIndex + 1}
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            {/* Top Row */}
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className={`px-3 py-1 rounded-md text-xs font-medium ${badge.color} ${badge.textColor}`}>
                                                    {badge.label}
                                                </span>
                                                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold border border-blue-100">
                                                    {gap.niche}
                                                </span>
                                                <span className="text-xs text-gray-400 ml-auto">
                                                    Score: {gap.opportunityScore}
                                                </span>
                                            </div>

                                            {/* Problem - Main Focus */}
                                            <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors leading-tight">
                                                {gap.problem}
                                            </h3>

                                            {/* Target Audience with Icon */}
                                            <div className="flex items-center gap-2 mb-4 text-gray-600">
                                                <Users className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm">
                                                    <span className="text-gray-500">For</span>{' '}
                                                    <span className="font-semibold text-gray-900">{gap.icp}</span>
                                                </span>
                                            </div>

                                            {/* Metrics Bar */}
                                            <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                    <div>
                                                        <div className="text-lg font-bold text-gray-900">{gap.currentProducts}</div>
                                                        <div className="text-xs text-gray-500">Products</div>
                                                    </div>
                                                </div>
                                                <div className="w-px h-8 bg-gray-200"></div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                    <div>
                                                        <div className="text-lg font-bold text-gray-900">{gap.avgEngagement}</div>
                                                        <div className="text-xs text-gray-500">Avg Engagement</div>
                                                    </div>
                                                </div>
                                                <div className="w-px h-8 bg-gray-200"></div>
                                                <div className="flex-1 flex items-center justify-end">
                                                    <div className="text-xs text-gray-500 italic">
                                                        {gap.reasoning}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Arrow */}
                                        <div className="flex-shrink-0">
                                            <div className="w-10 h-10 rounded-xl bg-gray-50 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
                                                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Empty State */}
                {filteredGaps.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                        <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No opportunities found</h3>
                        <p className="text-gray-500 text-sm">
                            Try adjusting your filters
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
