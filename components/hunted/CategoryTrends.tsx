import React from 'react';
import { CategoryInsight } from '@/lib/market-insights';
import { TrendingUp, Flame, Activity } from 'lucide-react';

interface CategoryTrendsProps {
    insights: CategoryInsight[];
}

export function CategoryTrends({ insights }: CategoryTrendsProps) {
    const getTrendIcon = (trend: 'hot' | 'growing' | 'stable') => {
        switch (trend) {
            case 'hot':
                return <Flame className="w-4 h-4 text-orange-500" />;
            case 'growing':
                return <TrendingUp className="w-4 h-4 text-green-500" />;
            default:
                return <Activity className="w-4 h-4 text-gray-500" />;
        }
    };

    const getTrendColor = (trend: 'hot' | 'growing' | 'stable') => {
        switch (trend) {
            case 'hot':
                return 'from-orange-500/20 to-red-500/20 border-orange-500/30';
            case 'growing':
                return 'from-green-500/20 to-emerald-500/20 border-green-500/30';
            default:
                return 'from-gray-500/20 to-gray-600/20 border-gray-500/30';
        }
    };

    return (
        <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Trending Categories</h3>

            <div className="grid grid-cols-1 gap-2">
                {insights.map((insight, i) => (
                    <div
                        key={insight.category}
                        className={`p-3 rounded-lg bg-gradient-to-r ${getTrendColor(insight.trend)} border`}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                {getTrendIcon(insight.trend)}
                                <span className="text-sm font-medium text-white">{insight.category}</span>
                            </div>
                            <span className="text-xs text-gray-400">{insight.productCount} launches</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">{insight.avgVotes} avg votes</span>
                            <span className="text-gray-500 truncate max-w-[120px]">Top: {insight.topProduct}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
