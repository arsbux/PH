'use client';

import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TimeSeriesPoint } from '@/lib/analytics-engine';

interface TrendAnalysisProps {
    votesData: TimeSeriesPoint[];
    commentsData: TimeSeriesPoint[];
}

export function TrendAnalysis({ votesData, commentsData }: TrendAnalysisProps) {
    const [metric, setMetric] = useState<'votes' | 'comments'>('votes');

    const data = metric === 'votes' ? votesData : commentsData;
    const color = metric === 'votes' ? '#f97316' : '#8b5cf6'; // Orange vs Purple

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-200">Market Trend Analysis</h3>
                    <p className="text-sm text-gray-500">Track the aggregate volume of engagement over time</p>
                </div>

                {/* Controls */}
                <div className="flex bg-black/20 p-1 rounded-lg border border-white/5">
                    <button
                        onClick={() => setMetric('votes')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${metric === 'votes'
                                ? 'bg-orange-500 text-white shadow-lg'
                                : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Upvotes
                    </button>
                    <button
                        onClick={() => setMetric('comments')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${metric === 'comments'
                                ? 'bg-purple-600 text-white shadow-lg'
                                : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Comments
                    </button>
                </div>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="#666"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => {
                                const d = new Date(value);
                                return `${d.getDate()}/${d.getMonth() + 1}`;
                            }}
                        />
                        <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                            labelStyle={{ color: '#888' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={color}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorMetric)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
