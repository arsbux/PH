'use client';

import React from 'react';
import { useDashboard } from './DashboardContext';

export function TopProductsSidebar() {
    const { products, chartColors } = useDashboard();
    const [sortBy, setSortBy] = React.useState<'votes' | 'comments' | 'velocity'>('votes');

    // Sort products based on selected metric
    const sortedProducts = React.useMemo(() => {
        return [...products].sort((a, b) => {
            switch (sortBy) {
                case 'votes':
                    return (b.votes_count || 0) - (a.votes_count || 0);
                case 'comments':
                    return (b.comments_count || 0) - (a.comments_count || 0);
                case 'velocity':
                    // Mock velocity calculation
                    return ((b.votes_count || 0) / 6) - ((a.votes_count || 0) / 6);
                default:
                    return 0;
            }
        });
    }, [products, sortBy]);

    return (
        <div className="flex flex-col h-full bg-black">
            {/* Header */}
            <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-semibold text-white">Top 10 products</h2>
                </div>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-white/30 cursor-pointer"
                >
                    <option value="votes">By rank ↑↓</option>
                    <option value="velocity">By velocity</option>
                    <option value="comments">By comments</option>
                </select>
            </div>

            {/* Products List */}
            <div className="flex-1 overflow-y-auto">
                {sortedProducts.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <p className="text-sm">Loading products...</p>
                    </div>
                ) : (
                    <div className="p-2 space-y-1">
                        {sortedProducts.map((product, index) => {
                            const originalIndex = products.findIndex(p => p.id === product.id);
                            const color = chartColors[originalIndex % chartColors.length];
                            const rank = index + 1;

                            return (
                                <a
                                    key={product.id}
                                    href={product.ph_url || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-all"
                                >
                                    {/* Rank */}
                                    <div className="flex-shrink-0 w-6 text-center">
                                        <span className={`text-sm font-bold ${rank <= 3 ? 'text-orange-400' : 'text-gray-500'}`}>
                                            {rank}
                                        </span>
                                    </div>

                                    {/* Thumbnail */}
                                    <div 
                                        className="w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden"
                                        style={{ backgroundColor: color + '20' }}
                                    >
                                        {product.thumbnail_url ? (
                                            <img 
                                                src={product.thumbnail_url} 
                                                alt={product.name} 
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">
                                                {product.name[0]}
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-medium text-gray-200 truncate group-hover:text-white transition-colors">
                                            {product.name}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-0.5">
                                            <span className="text-xs text-gray-500 font-mono">{product.votes_count}</span>
                                            <span className="text-xs text-gray-600">•</span>
                                            <span className="text-xs text-gray-500 font-mono">{product.comments_count}</span>
                                        </div>
                                    </div>

                                    {/* Color indicator */}
                                    <div 
                                        className="w-1 h-8 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: color }}
                                    />
                                </a>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
