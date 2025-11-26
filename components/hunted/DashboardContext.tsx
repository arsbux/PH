'use client';

import React, { createContext, useContext, useState, useMemo } from 'react';
import { TrendlineData } from '@/lib/vote-snapshots';
import { CategoryTrendlineData } from '@/lib/category-trends';

export interface DashboardProduct {
    id: string;
    name: string;
    tagline: string;
    votes_count: number;
    comments_count: number;
    thumbnail_url?: string;
    ph_url?: string;
    topics?: string[];
}

interface DashboardContextType {
    products: DashboardProduct[];
    setProducts: (products: DashboardProduct[]) => void;
    currentDate: Date;
    setCurrentDate: (date: Date) => void;
    chartColors: string[];
    trendlineData: TrendlineData[];
    setTrendlineData: (data: TrendlineData[]) => void;
    categoryTrendData: CategoryTrendlineData[];
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const CHART_COLORS = [
    '#3b82f6', // blue
    '#a855f7', // purple
    '#f59e0b', // amber
    '#10b981', // emerald
    '#ef4444', // red
    '#8b5cf6', // violet
    '#06b6d4', // cyan
    '#f97316', // orange
    '#ec4899', // pink
    '#14b8a6'  // teal
];

export function DashboardProvider({
    children,
    initialProducts,
    initialDate,
    initialTrendlineData,
    initialCategoryTrendData = []
}: {
    children: React.ReactNode;
    initialProducts: DashboardProduct[];
    initialDate: Date;
    initialTrendlineData: TrendlineData[];
    initialCategoryTrendData?: CategoryTrendlineData[];
}) {
    const [products, setProducts] = useState<DashboardProduct[]>(initialProducts);
    const [currentDate, setCurrentDate] = useState<Date>(initialDate);
    const [trendlineData, setTrendlineData] = useState<TrendlineData[]>(initialTrendlineData);

    const categoryTrendData = useMemo(() => {
        // If we have pre-calculated category trend data (e.g. from historical API), use it
        if (initialCategoryTrendData && initialCategoryTrendData.length > 0) {
            return initialCategoryTrendData;
        }

        // Generate category trend data from product trendline data
        // DashboardProduct has topics as string[], which generateCategoryTrendData handles
        if (!trendlineData || trendlineData.length === 0 || !products || products.length === 0) {
            return [];
        }

        // Create a map of product name to primary category
        const productPrimaryCategory = new Map<string, string>();
        products.forEach(p => {
            const primaryTopic = p.topics && p.topics.length > 0 ? p.topics[0] : 'Other';
            productPrimaryCategory.set(p.name, primaryTopic);
        });

        // Transform product trendline data into category trendline data
        return trendlineData.map(dataPoint => {
            const categoryPoint: CategoryTrendlineData = {
                time: dataPoint.time,
                hour: dataPoint.hour
            };

            // Aggregate votes by category
            const categoryVotes = new Map<string, number>();
            const categoryComments = new Map<string, number>();

            // Go through each product in this data point
            Object.keys(dataPoint).forEach(key => {
                if (key === 'time' || key === 'hour') return;

                if (key.endsWith('_comments')) {
                    const productName = key.replace('_comments', '');
                    const category = productPrimaryCategory.get(productName);
                    if (category && category !== 'Other') {
                        const commentCount = dataPoint[key] as number;
                        categoryComments.set(category, (categoryComments.get(category) || 0) + commentCount);
                    }
                } else {
                    const category = productPrimaryCategory.get(key);
                    if (category && category !== 'Other') {
                        const voteCount = dataPoint[key] as number;
                        categoryVotes.set(category, (categoryVotes.get(category) || 0) + voteCount);
                    }
                }
            });

            categoryVotes.forEach((votes, category) => {
                categoryPoint[category] = votes;
            });

            categoryComments.forEach((comments, category) => {
                categoryPoint[`${category}_comments`] = comments;
            });

            return categoryPoint;
        });
    }, [trendlineData, products, initialCategoryTrendData]);

    return (
        <DashboardContext.Provider value={{
            products,
            setProducts,
            currentDate,
            setCurrentDate,
            chartColors: CHART_COLORS,
            trendlineData,
            setTrendlineData,
            categoryTrendData
        }}>
            {children}
        </DashboardContext.Provider>
    );
}

export function useDashboard() {
    const context = useContext(DashboardContext);
    if (context === undefined) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
}
