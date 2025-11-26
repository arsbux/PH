import { PHProduct } from './producthunt-live';

export interface CategoryInsight {
    category: string;
    productCount: number;
    totalVotes: number;
    avgVotes: number;
    topProduct: string;
    trend: 'hot' | 'growing' | 'stable';
}

export interface LaunchInsight {
    type: 'timing' | 'messaging' | 'engagement' | 'category';
    title: string;
    description: string;
    examples: string[];
    actionable: string;
}

export interface MarketGap {
    category: string;
    opportunity: string;
    reasoning: string;
    difficulty: 'low' | 'medium' | 'high';
}

/**
 * Analyze categories to find trending topics
 */
export function analyzeCategoryTrends(products: PHProduct[]): CategoryInsight[] {
    const categoryMap = new Map<string, {
        products: PHProduct[];
        totalVotes: number;
    }>();

    // Group by category (using first topic as proxy)
    products.forEach(product => {
        const category = product.topics[0]?.name || 'Other';

        if (!categoryMap.has(category)) {
            categoryMap.set(category, { products: [], totalVotes: 0 });
        }

        const catData = categoryMap.get(category)!;
        catData.products.push(product);
        catData.totalVotes += product.votesCount;
    });

    // Convert to insights
    const insights: CategoryInsight[] = [];

    categoryMap.forEach((data, category) => {
        const avgVotes = data.totalVotes / data.products.length;
        const topProduct = data.products.sort((a, b) => b.votesCount - a.votesCount)[0];

        // Determine trend based on avg engagement
        let trend: 'hot' | 'growing' | 'stable' = 'stable';
        if (avgVotes > 300) trend = 'hot';
        else if (avgVotes > 150) trend = 'growing';

        insights.push({
            category,
            productCount: data.products.length,
            totalVotes: data.totalVotes,
            avgVotes: Math.round(avgVotes),
            topProduct: topProduct.name,
            trend
        });
    });

    return insights.sort((a, b) => b.totalVotes - a.totalVotes).slice(0, 8);
}

/**
 * Extract actionable launch insights from top performers
 */
export function extractLaunchInsights(products: PHProduct[]): LaunchInsight[] {
    const insights: LaunchInsight[] = [];
    const topProducts = products.slice(0, 10);

    // Timing Insight
    const launchTimes = products.map(p => new Date(p.createdAt).getHours());
    const mostCommonHour = launchTimes.sort((a, b) =>
        launchTimes.filter(v => v === a).length - launchTimes.filter(v => v === b).length
    ).pop() || 0;

    insights.push({
        type: 'timing',
        title: 'Optimal Launch Time',
        description: `${launchTimes.filter(h => h === mostCommonHour).length} products launched around ${mostCommonHour}:00 UTC`,
        examples: topProducts.slice(0, 3).map(p => p.name),
        actionable: `Launch between ${mostCommonHour - 1}:00 - ${mostCommonHour + 1}:00 UTC for maximum early visibility`
    });

    // Messaging Insight - Tagline length
    const avgTaglineLength = Math.round(
        products.reduce((acc, p) => acc + p.tagline.length, 0) / products.length
    );

    insights.push({
        type: 'messaging',
        title: 'Tagline Sweet Spot',
        description: `Top products use ~${avgTaglineLength} character taglines`,
        examples: topProducts.slice(0, 2).map(p => `"${p.tagline}"`),
        actionable: `Keep your tagline concise (${avgTaglineLength - 10}-${avgTaglineLength + 10} chars) and benefit-focused`
    });

    // Engagement Insight
    const avgCommentRatio = products.reduce((acc, p) =>
        acc + (p.commentsCount / (p.votesCount || 1)), 0
    ) / products.length;

    const topEngagers = products
        .filter(p => (p.commentsCount / (p.votesCount || 1)) > avgCommentRatio)
        .slice(0, 3);

    insights.push({
        type: 'engagement',
        title: 'Comment Engagement',
        description: `Products with ${Math.round(avgCommentRatio * 100)}%+ comment rate see 2x visibility`,
        examples: topEngagers.map(p => `${p.name} (${p.commentsCount} comments)`),
        actionable: 'Reply to every comment in first 2 hours. Ask engaging questions in your description'
    });

    // Category Insight
    const hotCategories = analyzeCategoryTrends(products)
        .filter(c => c.trend === 'hot')
        .slice(0, 3);

    insights.push({
        type: 'category',
        title: 'Hot Categories Today',
        description: `${hotCategories.map(c => c.category).join(', ')} are trending`,
        examples: hotCategories.map(c => c.topProduct),
        actionable: `If your product fits these categories, emphasize it in your tagline`
    });

    return insights;
}

/**
 * Identify market gaps and opportunities
 */
export function detectMarketGaps(products: PHProduct[]): MarketGap[] {
    const gaps: MarketGap[] = [];

    // Analyze topic distribution
    const topicCounts = new Map<string, number>();
    products.forEach(p => {
        p.topics.forEach(t => {
            topicCounts.set(t.name, (topicCounts.get(t.name) || 0) + 1);
        });
    });

    // Find underserved categories (1-2 products only)
    const underserved = Array.from(topicCounts.entries())
        .filter(([_, count]) => count === 1 || count === 2)
        .slice(0, 5);

    underserved.forEach(([topic, count]) => {
        gaps.push({
            category: topic,
            opportunity: `Low Competition (${count} product${count > 1 ? 's' : ''} today)`,
            reasoning: 'Limited launches = less noise, easier to stand out',
            difficulty: 'low'
        });
    });

    // High engagement categories = proven demand
    const categoryInsights = analyzeCategoryTrends(products);
    const highDemand = categoryInsights.filter(c => c.avgVotes > 200 && c.productCount < 3);

    highDemand.forEach(cat => {
        gaps.push({
            category: cat.category,
            opportunity: `High Demand, Low Supply (${cat.avgVotes} avg votes)`,
            reasoning: 'Proven interest but few alternatives today',
            difficulty: 'medium'
        });
    });

    return gaps.slice(0, 6);
}

/**
 * Analyze maker strategies from top products
 */
export function analyzeMakerStrategies(products: PHProduct[]) {
    const topProducts = products.slice(0, 10);

    return {
        teamSizeDistribution: {
            solo: topProducts.filter(p => p.makers.length === 1).length,
            small: topProducts.filter(p => p.makers.length >= 2 && p.makers.length <= 3).length,
            team: topProducts.filter(p => p.makers.length > 3).length
        },
        avgMakersPerProduct: (topProducts.reduce((acc, p) => acc + p.makers.length, 0) / topProducts.length).toFixed(1),
        topPerformingTeamSize: topProducts[0]?.makers.length || 1
    };
}
