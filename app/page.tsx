import React from 'react';
import { getTopicVelocity } from '@/lib/charts-data';
import { HuntedSpaceLayout } from '@/components/hunted/HuntedSpaceLayout';
import { TopProductsSidebar } from '@/components/hunted/TopProductsSidebar';
import { DashboardView } from '@/components/hunted/DashboardView';
import { InsightsSidebar } from '@/components/hunted/InsightsSidebar';
import { DashboardProvider } from '@/components/hunted/DashboardContext';

// Revalidate every hour since we're showing historical data
export const revalidate = 3600;

export default async function Page() {
    // Fetch 12-month category growth trends from database
    const topicVelocityData = await getTopicVelocity(12);

    console.log(`📊 Fetched ${topicVelocityData.length} categories with 12-month trend data`);

    // Transform topic velocity data into chart format
    // Each category has timeSeriesData with monthly data points
    const categoryTrendData = topicVelocityData.flatMap(topic => {
        return topic.timeSeriesData.map(dataPoint => ({
            month: dataPoint.month,
            [topic.topic]: dataPoint.avgUpvotes,
            [`${topic.topic}_launches`]: dataPoint.launchCount,
            [`${topic.topic}_comments`]: dataPoint.avgComments,
        }));
    });

    // Get unique months and merge data
    const monthMap = new Map();
    categoryTrendData.forEach(point => {
        const existing = monthMap.get(point.month) || { month: point.month };
        monthMap.set(point.month, { ...existing, ...point });
    });

    const mergedCategoryData = Array.from(monthMap.values())
        .sort((a, b) => a.month.localeCompare(b.month))
        .map((point: any) => ({
            ...point,
            time: point.month,
            hour: 0
        }));

    // Get top categories for display
    const topCategories = topicVelocityData.slice(0, 10).map(topic => ({
        name: topic.topic,
        totalLaunches: topic.totalLaunches,
        trend: topic.trend,
        avgUpvotes: Math.round(
            topic.timeSeriesData.reduce((sum, d) => sum + d.avgUpvotes, 0) / topic.timeSeriesData.length
        )
    }));

    return (
        <DashboardProvider
            initialProducts={[]}
            initialDate={new Date()}
            initialTrendlineData={[]}
            initialCategoryTrendData={mergedCategoryData}
        >
            <DashboardView
                displayDate={new Date()}
                leftSidebar={<TopProductsSidebar />}
                rightSidebar={
                    <InsightsSidebar
                        totalVotes={0}
                        totalComments={0}
                        topProduct="Market Intelligence Platform"
                        mostPopularTopic={topCategories[0]?.name || 'AI & Machine Learning'}
                        featuredToday={topicVelocityData.reduce((sum, t) => sum + t.totalLaunches, 0)}
                        categoryInsights={[]}
                        launchInsights={[]}
                        marketGaps={[]}
                        makerStrategies={{
                            teamSizeDistribution: { solo: 0, small: 0, team: 0 },
                            avgMakersPerProduct: '0',
                            topPerformingTeamSize: 0
                        }}
                    />
                }
            />
        </DashboardProvider>
    );
}
