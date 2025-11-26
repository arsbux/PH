import React from 'react';
import { Lightbulb, TrendingDown, Target } from 'lucide-react';

interface Opportunity {
    type: 'low_competition' | 'high_demand' | 'emerging';
    category: string;
    insight: string;
    metric: string;
}

interface MarketOpportunitiesProps {
    opportunities: Opportunity[];
}

export function MarketOpportunities({ opportunities }: MarketOpportunitiesProps) {
    const getIcon = (type: Opportunity['type']) => {
        switch (type) {
            case 'low_competition':
                return <TrendingDown className="w-5 h-5 text-green-400" />;
            case 'high_demand':
                return <Target className="w-5 h-5 text-orange-400" />;
            case 'emerging':
                return <Lightbulb className="w-5 h-5 text-purple-400" />;
        }
    };

    const getLabel = (type: Opportunity['type']) => {
        switch (type) {
            case 'low_competition':
                return 'Low Competition';
            case 'high_demand':
                return 'High Demand';
            case 'emerging':
                return 'Emerging Trend';
        }
    };

    const getColor = (type: Opportunity['type']) => {
        switch (type) {
            case 'low_competition':
                return 'from-green-400/20 to-emerald-600/20 border-green-500/30';
            case 'high_demand':
                return 'from-orange-400/20 to-red-600/20 border-orange-500/30';
            case 'emerging':
                return 'from-purple-400/20 to-pink-600/20 border-purple-500/30';
        }
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                <h3 className="text-lg font-semibold text-gray-200">Market Opportunities</h3>
            </div>

            <div className="space-y-4">
                {opportunities.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p className="text-sm">Analyzing market data...</p>
                    </div>
                ) : (
                    opportunities.map((opp, i) => (
                        <div
                            key={i}
                            className={`p-4 rounded-xl bg-gradient-to-br ${getColor(opp.type)} border`}
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-0.5">
                                    {getIcon(opp.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            {getLabel(opp.type)}
                                        </span>
                                        <span className="text-xs font-mono text-gray-500">{opp.metric}</span>
                                    </div>
                                    <h4 className="font-semibold text-white mb-1">{opp.category}</h4>
                                    <p className="text-sm text-gray-300">{opp.insight}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {opportunities.length > 0 && (
                <div className="mt-6 pt-6 border-t border-white/10">
                    <p className="text-xs text-gray-500 text-center">
                        🎯 These opportunities are identified based on launch volume, engagement patterns, and market gaps
                    </p>
                </div>
            )}
        </div>
    );
}
