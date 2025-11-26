import React from 'react';
import { MarketGap } from '@/lib/market-insights';
import { Sparkles, AlertCircle } from 'lucide-react';

interface MarketOpportunitiesProps {
    gaps: MarketGap[];
}

export function MarketOpportunities({ gaps }: MarketOpportunitiesProps) {
    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'low':
                return 'text-green-400 bg-green-500/10 border-green-500/30';
            case 'medium':
                return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
            default:
                return 'text-red-400 bg-red-500/10 border-red-500/30';
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-semibold text-gray-300">Market Opportunities</h3>
            </div>

            {gaps.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-20" />
                    <p className="text-xs">Analyzing market gaps...</p>
                </div>
            ) : (
                gaps.map((gap, i) => (
                    <div
                        key={i}
                        className="p-3 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20"
                    >
                        <div className="flex items-start justify-between mb-2">
                            <h4 className="text-sm font-semibold text-white">{gap.category}</h4>
                            <span className={`text-[10px] px-2 py-0.5 rounded border uppercase tracking-wider ${getDifficultyColor(gap.difficulty)}`}>
                                {gap.difficulty}
                            </span>
                        </div>

                        <p className="text-xs text-purple-300 mb-2">{gap.opportunity}</p>
                        <p className="text-xs text-gray-400 leading-relaxed">{gap.reasoning}</p>
                    </div>
                ))
            )}

            {gaps.length > 0 && (
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <p className="text-xs text-yellow-200 leading-relaxed">
                        <strong>Pro Tip:</strong> Focus on "Low" difficulty opportunities for quick wins. These categories have proven demand but less competition today.
                    </p>
                </div>
            )}
        </div>
    );
}
