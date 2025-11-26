'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MainChartProps {
    data: any[];
}

export function MainChart({ data }: MainChartProps) {
    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-200">Today's top 10 products</h2>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                        <span className="text-xs text-gray-400">Trendlines</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gray-600" />
                        <span className="text-xs text-gray-400">Time</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-[400px] w-full bg-white/5 rounded-2xl border border-white/10 p-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{
                            top: 10,
                            right: 30,
                            left: 0,
                            bottom: 0,
                        }}
                    >
                        <defs>
                            <linearGradient id="colorVotes" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="votes"
                            stroke="#f97316"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorVotes)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Product Chips */}
            <div className="mt-6 flex flex-wrap gap-2">
                {data.map((item, i) => (
                    <div key={i} className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs text-gray-400 hover:border-orange-500/50 hover:text-white transition-colors cursor-pointer">
                        {item.name} <span className="text-[10px] opacity-50 ml-1">{i + 1}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
