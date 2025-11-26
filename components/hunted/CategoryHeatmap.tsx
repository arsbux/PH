'use client';

import React, { useState } from 'react';

interface CategoryHeatmapProps {
    categories?: string[];
}

export function CategoryHeatmap({ categories }: CategoryHeatmapProps) {
    const [selectedCell, setSelectedCell] = useState<{ category: string; month: string } | null>(null);
    const [viewMode, setViewMode] = useState<'launches' | 'growth' | 'saturation'>('launches');

    // Mock data - replace with real database queries
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const categoryData = [
        { name: 'Developer Tools', data: [45, 52, 48, 61, 58, 67, 72, 68, 75, 82, 88, 95], growth: 12, saturation: 68 },
        { name: 'Artificial Intelligence', data: [38, 42, 55, 68, 82, 95, 108, 125, 142, 158, 172, 189], growth: 340, saturation: 45 },
        { name: 'Productivity', data: [52, 48, 51, 49, 53, 55, 58, 56, 61, 63, 67, 70], growth: 8, saturation: 82 },
        { name: 'Design Tools', data: [28, 32, 35, 38, 42, 45, 48, 52, 55, 58, 62, 65], growth: 18, saturation: 58 },
        { name: 'Marketing', data: [22, 25, 28, 32, 35, 38, 42, 45, 48, 52, 55, 58], growth: 22, saturation: 52 },
        { name: 'Customer Communication', data: [18, 22, 25, 28, 32, 35, 38, 42, 45, 48, 52, 55], growth: 28, saturation: 48 },
        { name: 'Analytics', data: [15, 18, 22, 25, 28, 32, 35, 38, 42, 45, 48, 52], growth: 32, saturation: 42 },
        { name: 'E-commerce', data: [12, 15, 18, 22, 25, 28, 32, 35, 38, 42, 45, 48], growth: 38, saturation: 38 },
    ];

    // Calculate color intensity based on view mode
    const getColorIntensity = (category: typeof categoryData[0], monthIndex: number) => {
        const value = category.data[monthIndex];
        const maxValue = Math.max(...categoryData.flatMap(c => c.data));
        
        switch (viewMode) {
            case 'launches':
                return value / maxValue;
            case 'growth':
                const prevValue = monthIndex > 0 ? category.data[monthIndex - 1] : category.data[monthIndex];
                const growthRate = prevValue > 0 ? (value - prevValue) / prevValue : 0;
                return Math.min(growthRate * 2, 1);
            case 'saturation':
                return category.saturation / 100;
            default:
                return 0;
        }
    };

    const getColor = (intensity: number) => {
        if (viewMode === 'saturation') {
            // Red for high saturation, green for low
            const r = Math.round(239 * intensity);
            const g = Math.round(68 * (1 - intensity) + 185 * intensity);
            const b = Math.round(68 * (1 - intensity));
            return `rgb(${r}, ${g}, ${b})`;
        } else {
            // Blue gradient for launches/growth
            const r = Math.round(59 + (139 - 59) * intensity);
            const g = Math.round(130 + (92 - 130) * intensity);
            const b = Math.round(246 + (246 - 246) * intensity);
            return `rgb(${r}, ${g}, ${b})`;
        }
    };

    return (
        <div className="bg-black/40 border border-white/10 rounded-xl p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-base font-semibold text-white">Category Distribution Heatmap</h3>
                    <p className="text-xs text-gray-400 mt-1">Visualizing market dynamics across 12 months</p>
                </div>
                
                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
                    <button
                        onClick={() => setViewMode('launches')}
                        className={`px-3 py-1.5 rounded text-xs font-medium transition ${
                            viewMode === 'launches'
                                ? 'bg-white/10 text-white'
                                : 'text-gray-400 hover:text-gray-300'
                        }`}
                    >
                        Launch Volume
                    </button>
                    <button
                        onClick={() => setViewMode('growth')}
                        className={`px-3 py-1.5 rounded text-xs font-medium transition ${
                            viewMode === 'growth'
                                ? 'bg-white/10 text-white'
                                : 'text-gray-400 hover:text-gray-300'
                        }`}
                    >
                        Growth Rate
                    </button>
                    <button
                        onClick={() => setViewMode('saturation')}
                        className={`px-3 py-1.5 rounded text-xs font-medium transition ${
                            viewMode === 'saturation'
                                ? 'bg-white/10 text-white'
                                : 'text-gray-400 hover:text-gray-300'
                        }`}
                    >
                        Market Saturation
                    </button>
                </div>
            </div>

            {/* Heatmap Grid */}
            <div className="overflow-x-auto">
                <div className="inline-block min-w-full">
                    {/* Month Headers */}
                    <div className="flex items-center mb-2">
                        <div className="w-48 flex-shrink-0" />
                        {months.map((month) => (
                            <div key={month} className="w-16 text-center">
                                <span className="text-xs font-medium text-gray-400">{month}</span>
                            </div>
                        ))}
                    </div>

                    {/* Category Rows */}
                    <div className="space-y-1">
                        {categoryData.map((category) => (
                            <div key={category.name} className="flex items-center group">
                                {/* Category Label */}
                                <div className="w-48 flex-shrink-0 pr-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-gray-200 truncate">
                                            {category.name}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            {viewMode === 'growth' && (
                                                <span className={`text-xs font-semibold ${
                                                    category.growth > 50 ? 'text-emerald-400' : 
                                                    category.growth > 20 ? 'text-blue-400' : 'text-gray-400'
                                                }`}>
                                                    +{category.growth}%
                                                </span>
                                            )}
                                            {viewMode === 'saturation' && (
                                                <span className={`text-xs font-semibold ${
                                                    category.saturation > 70 ? 'text-red-400' : 
                                                    category.saturation > 50 ? 'text-amber-400' : 'text-emerald-400'
                                                }`}>
                                                    {category.saturation}%
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Heatmap Cells */}
                                <div className="flex gap-1">
                                    {category.data.map((value, monthIndex) => {
                                        const intensity = getColorIntensity(category, monthIndex);
                                        const color = getColor(intensity);
                                        const isSelected = selectedCell?.category === category.name && 
                                                         selectedCell?.month === months[monthIndex];

                                        return (
                                            <button
                                                key={monthIndex}
                                                onClick={() => setSelectedCell({ 
                                                    category: category.name, 
                                                    month: months[monthIndex] 
                                                })}
                                                onMouseEnter={() => setSelectedCell({ 
                                                    category: category.name, 
                                                    month: months[monthIndex] 
                                                })}
                                                className={`w-16 h-10 rounded transition-all relative group/cell ${
                                                    isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110 z-10' : ''
                                                }`}
                                                style={{ backgroundColor: color }}
                                            >
                                                <span className="text-xs font-semibold text-white opacity-0 group-hover/cell:opacity-100 transition">
                                                    {value}
                                                </span>
                                                
                                                {/* Tooltip */}
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/cell:opacity-100 transition pointer-events-none z-20">
                                                    <div className="bg-gray-900 border border-white/20 rounded-lg px-3 py-2 shadow-xl whitespace-nowrap">
                                                        <div className="text-xs font-semibold text-white mb-1">
                                                            {category.name}
                                                        </div>
                                                        <div className="text-xs text-gray-300">
                                                            {months[monthIndex]}: <span className="font-semibold text-white">{value} launches</span>
                                                        </div>
                                                        {monthIndex > 0 && (
                                                            <div className="text-xs text-gray-400 mt-1">
                                                                {value > category.data[monthIndex - 1] ? '↑' : '↓'} 
                                                                {' '}
                                                                {Math.abs(value - category.data[monthIndex - 1])} vs prev
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">Low</span>
                        <div className="flex gap-1">
                            {[0.2, 0.4, 0.6, 0.8, 1.0].map((intensity) => (
                                <div
                                    key={intensity}
                                    className="w-8 h-4 rounded"
                                    style={{ backgroundColor: getColor(intensity) }}
                                />
                            ))}
                        </div>
                        <span className="text-xs text-gray-400">High</span>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <div className="text-xs text-gray-400">Hottest Category</div>
                        <div className="text-sm font-semibold text-emerald-400">Artificial Intelligence</div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-gray-400">Fastest Growing</div>
                        <div className="text-sm font-semibold text-blue-400">AI (+340% YoY)</div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-gray-400">Most Saturated</div>
                        <div className="text-sm font-semibold text-red-400">Productivity (82%)</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
