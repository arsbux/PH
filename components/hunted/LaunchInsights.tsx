import React from 'react';
import { LaunchInsight } from '@/lib/market-insights';
import { Lightbulb, Clock, MessageCircle, Target } from 'lucide-react';

interface LaunchInsightsProps {
    insights: LaunchInsight[];
}

export function LaunchInsights({ insights }: LaunchInsightsProps) {
    const getIcon = (type: string) => {
        switch (type) {
            case 'timing':
                return <Clock className="w-4 h-4 text-blue-400" />;
            case 'messaging':
                return <MessageCircle className="w-4 h-4 text-purple-400" />;
            case 'engagement':
                return <Target className="w-4 h-4 text-green-400" />;
            default:
                return <Lightbulb className="w-4 h-4 text-yellow-400" />;
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-yellow-400" />
                <h3 className="text-sm font-semibold text-gray-300">Launch Insights</h3>
            </div>

            {insights.map((insight, i) => (
                <div
                    key={i}
                    className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-yellow-500/30 transition-colors"
                >
                    <div className="flex items-start gap-2 mb-2">
                        {getIcon(insight.type)}
                        <div className="flex-1">
                            <h4 className="text-sm font-semibold text-white mb-1">{insight.title}</h4>
                            <p className="text-xs text-gray-400 leading-relaxed">{insight.description}</p>
                        </div>
                    </div>

                    <div className="mt-2 p-2 bg-black/30 rounded border border-white/5">
                        <p className="text-xs text-green-400 font-medium">💡 Action: {insight.actionable}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
