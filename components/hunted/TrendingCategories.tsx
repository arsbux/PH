'use client';

import React from 'react';
import { useDashboard } from './DashboardContext';
import { MarketInsightsPanel } from './MarketInsightsPanel';

export function TrendingCategories({ displayDate }: { displayDate: Date }) {
    const { categoryTrendData } = useDashboard();

    // Extract unique categories from the data
    const allCategories = React.useMemo(() => {
        if (!categoryTrendData || categoryTrendData.length === 0) return [];

        const categories = new Set<string>();
        categoryTrendData.forEach(point => {
            Object.keys(point).forEach(key => {
                if (key !== 'month') {
                    categories.add(key);
                }
            });
        });

        // Sort by latest launch count
        const latest = categoryTrendData[categoryTrendData.length - 1];
        return Array.from(categories).sort((a, b) => {
            const aCount = (latest[a] as number) || 0;
            const bCount = (latest[b] as number) || 0;
            return bCount - aCount;
        }).slice(0, 10);
    }, [categoryTrendData]);

    return (
        <div className="p-6">
            {/* Market Insights Panel - Now First */}
            <MarketInsightsPanel selectedCategory={allCategories[0]} />
        </div>
    );
}
