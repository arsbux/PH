'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Users, Lightbulb, Award } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface SuccessPattern {
    icp: string;
    problem: string;
    niche: string;
    count: number;
    avgVotes: number;
    avgComments: number;
    successScore: number;
}

export default function SuccessPatternsPage() {
    const [patterns, setPatterns] = useState<SuccessPattern[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState<'all' | 'high' | 'emerging'>('all');

    useEffect(() => {
        fetchPatterns();
    }, []);

    async function fetchPatterns() {
        try {
            const supabase = createClient(supabaseUrl, supabaseAnonKey);

            console.log('Fetching launches from Supabase...');
            const { data: launches, error: dbError } = await supabase
                .from('ph_launches')
                .select('ai_analysis, votes_count, comments_count')
                .not('ai_analysis', 'is', null);

            if (dbError) {
                console.error('Supabase error:', dbError);
                setError(dbError.message);
                setLoading(false);
                return;
            }

            console.log(`Found ${launches?.length || 0} launches`);

            if (!launches || launches.length === 0) {
                setError('No launch data found. Please run the backfill script.');
                setLoading(false);
                return;
            }

            // Group by ICP + Problem + Niche combination
            const patternMap = new Map<string, {
                count: number;
                totalVotes: number;
                totalComments: number;
                icp: string;
                problem: string;
                niche: string;
            }>();

            launches.forEach(launch => {
                const analysis = launch.ai_analysis;
                if (!analysis) {
                    console.log('Skipping launch with no analysis');
                    return;
                }

                const icp = analysis.icp || 'Unknown ICP';
                const problem = analysis.problem || 'Unknown Problem';
                const niche = analysis.niche || 'Unknown Niche';

                const key = `${icp}|${problem}|${niche}`;

                const existing = patternMap.get(key) || {
                    count: 0,
                    totalVotes: 0,
                    totalComments: 0,
                    icp,
                    problem,
                    niche,
                };

                existing.count++;
                existing.totalVotes += launch.votes_count || 0;
                existing.totalComments += launch.comments_count || 0;

                patternMap.set(key, existing);
            });

            console.log(`Created ${patternMap.size} unique ICP+Problem+Niche combinations`);

            // Convert to array and calculate success score
            const results: SuccessPattern[] = Array.from(patternMap.values())
                .filter(p => {
                    // Show all patterns, but filter out "Unknown" combinations
                    const hasRealData = p.icp !== 'Unknown ICP' && p.problem !== 'Unknown Problem';
                    return hasRealData;
                })
                .map(p => ({
                    icp: p.icp,
                    problem: p.problem,
                    niche: p.niche,
                    count: p.count,
                    avgVotes: Math.round(p.totalVotes / p.count),
                    avgComments: Math.round(p.totalComments / p.count),
                    successScore: Math.round(
                        (p.totalVotes / p.count * 0.6) +
                        (p.totalComments / p.count * 0.3 * 5) +
                        (Math.min(p.count, 10) * 10)
                    ),
                }))
                .sort((a, b) => b.successScore - a.successScore)
                .slice(0, 50);

            console.log(`Generated ${results.length} patterns`);
            setPatterns(results);
        } catch (error: any) {
            console.error('Error fetching patterns:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    const filteredPatterns = patterns.filter(p => {
        if (filter === 'high') return p.successScore > 300; // Lowered threshold
        if (filter === 'emerging') return p.count >= 2 && p.count <= 10; // More inclusive range
        return true;
    });

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-neutral-600">Calculating success patterns...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-red-900 mb-2">Error Loading Data</h3>
                    <p className="text-red-700 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-2">Success Patterns</h1>
                <p className="text-sm md:text-base text-neutral-600">
                    Discover which ICP + Problem + Niche combinations get the most traction on Product Hunt
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all text-sm md:text-base ${filter === 'all'
                        ? 'bg-neutral-900 text-white'
                        : 'bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-900'
                        }`}
                >
                    All Patterns
                </button>
                <button
                    onClick={() => setFilter('high')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all text-sm md:text-base ${filter === 'high'
                        ? 'bg-neutral-900 text-white'
                        : 'bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-900'
                        }`}
                >
                    High Performers
                </button>
                <button
                    onClick={() => setFilter('emerging')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all text-sm md:text-base ${filter === 'emerging'
                        ? 'bg-neutral-900 text-white'
                        : 'bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-900'
                        }`}
                >
                    Emerging Trends
                </button>
            </div>

            {/* Patterns List */}
            <div className="space-y-4">
                {filteredPatterns.length === 0 ? (
                    <div className="text-center py-12 bg-white border border-neutral-200 rounded-xl">
                        <p className="text-neutral-600">No patterns found for this filter.</p>
                    </div>
                ) : (
                    filteredPatterns.map((pattern, index) => (
                        <div
                            key={index}
                            className="bg-white border border-neutral-200 rounded-xl p-4 md:p-6 hover:border-neutral-900 hover:shadow-lg transition-all"
                        >
                            <div className="flex flex-col md:flex-row items-start justify-between mb-4 gap-4">
                                <div className="flex-1 w-full">
                                    <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3">
                                        <div className="text-xl md:text-2xl font-bold text-neutral-400">#{index + 1}</div>
                                        <div className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-medium whitespace-nowrap">
                                            Score: {pattern.successScore}
                                        </div>
                                        <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium whitespace-nowrap">
                                            {pattern.count} launches
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-4">
                                        <div className="bg-neutral-50 p-3 rounded-lg md:bg-transparent md:p-0">
                                            <div className="text-xs font-medium text-neutral-500 mb-1">TARGET ICP</div>
                                            <div className="text-sm font-medium text-neutral-900">{pattern.icp}</div>
                                        </div>
                                        <div className="bg-neutral-50 p-3 rounded-lg md:bg-transparent md:p-0">
                                            <div className="text-xs font-medium text-neutral-500 mb-1">PROBLEM</div>
                                            <div className="text-sm font-medium text-neutral-900">{pattern.problem}</div>
                                        </div>
                                        <div className="bg-neutral-50 p-3 rounded-lg md:bg-transparent md:p-0">
                                            <div className="text-xs font-medium text-neutral-500 mb-1">NICHE</div>
                                            <div className="text-sm font-medium text-neutral-900">{pattern.niche}</div>
                                        </div>
                                    </div>

                                    <div className="flex gap-6 text-sm text-neutral-600">
                                        <div>
                                            <span className="font-medium text-neutral-900">{pattern.avgVotes}</span> avg votes
                                        </div>
                                        <div>
                                            <span className="font-medium text-neutral-900">{pattern.avgComments}</span> avg comments
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {pattern.successScore > 500 && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
                                    <strong>✨ High Performer:</strong> This combination consistently gets strong engagement
                                </div>
                            )}

                            {pattern.count >= 2 && pattern.count <= 5 && (
                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm text-purple-700">
                                    <strong>🔥 Emerging Trend:</strong> Small but growing - good time to enter this space
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
