import React from 'react';
import { CategoryTrend } from '@/lib/analytics-engine';
import { Trophy, TrendingUp, MessageCircle, ArrowUp } from 'lucide-react';

interface CategoryOverviewProps {
    categories: CategoryTrend[];
}

export function CategoryOverview({ categories }: CategoryOverviewProps) {
    const top3 = categories.slice(0, 3);
    const rest = categories.slice(3, 10); // Show top 10 in table

    return (
        <div className="space-y-8">
            {/* Top 3 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {top3.map((cat, index) => (
                    <div
                        key={cat.name}
                        className={`relative p-6 rounded-2xl border ${index === 0
                                ? 'bg-gradient-to-br from-orange-500/10 to-purple-600/10 border-orange-500/30'
                                : 'bg-white/5 border-white/10'
                            }`}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400'
                                    }`}>
                                    #{index + 1}
                                </div>
                                <h3 className="font-bold text-lg text-gray-200 truncate max-w-[120px]">{cat.name}</h3>
                            </div>
                            {index === 0 && <Trophy className="w-5 h-5 text-orange-500" />}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Votes</div>
                                <div className="text-xl font-mono font-bold text-white">{cat.total_votes.toLocaleString()}</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Launches</div>
                                <div className="text-xl font-mono font-bold text-white">{cat.launch_count}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Ranking Table */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-200">Category Rankings</h3>
                    <span className="text-xs text-gray-500">Based on 30-day performance</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="text-gray-500 border-b border-white/5">
                                <th className="px-6 py-3 font-medium">Rank</th>
                                <th className="px-6 py-3 font-medium">Category</th>
                                <th className="px-6 py-3 font-medium text-right">Heat Score</th>
                                <th className="px-6 py-3 font-medium text-right">Votes</th>
                                <th className="px-6 py-3 font-medium text-right">Comments</th>
                                <th className="px-6 py-3 font-medium text-right">Launches</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {rest.map((cat, i) => (
                                <tr key={cat.name} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 text-gray-500">#{i + 4}</td>
                                    <td className="px-6 py-4 font-medium text-gray-300">{cat.name}</td>
                                    <td className="px-6 py-4 text-right font-mono text-orange-400">{cat.heat_score.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right text-gray-400">{cat.total_votes.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right text-gray-400">{cat.total_comments.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right text-gray-400">{cat.launch_count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
