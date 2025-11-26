import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export interface CategoryTrend {
    name: string;
    total_votes: number;
    total_comments: number;
    launch_count: number;
    heat_score: number; // Custom metric: (votes * 1) + (comments * 2)
    growth_rate?: number; // Percentage growth vs previous period
}

export interface TimeSeriesPoint {
    date: string;
    value: number;
}

/**
 * Get trending categories based on recent launches
 * @param days Number of days to look back
 */
export async function getTrendingCategories(days: number = 30): Promise<CategoryTrend[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: launches, error } = await supabase
        .from('ph_launches')
        .select('ai_analysis, topics, votes_count, comments_count, launched_at')
        .gte('launched_at', startDate.toISOString());

    if (error || !launches) {
        console.error('Error fetching trending categories:', error);
        return [];
    }

    const categoryMap = new Map<string, CategoryTrend>();

    launches.forEach(launch => {
        // Extract niche from ai_analysis JSONB, fallback to first topic
        let category = 'Other';
        if (launch.ai_analysis && typeof launch.ai_analysis === 'object' && 'niche' in launch.ai_analysis) {
            category = (launch.ai_analysis as any).niche;
        } else if (launch.topics && Array.isArray(launch.topics) && launch.topics.length > 0) {
            category = launch.topics[0];
        }

        // Normalize category name
        category = String(category).trim();

        if (!categoryMap.has(category)) {
            categoryMap.set(category, {
                name: category,
                total_votes: 0,
                total_comments: 0,
                launch_count: 0,
                heat_score: 0
            });
        }

        const stats = categoryMap.get(category)!;
        stats.total_votes += launch.votes_count || 0;
        stats.total_comments += launch.comments_count || 0;
        stats.launch_count += 1;
    });

    // Calculate Heat Score and convert to array
    const trends = Array.from(categoryMap.values()).map(cat => ({
        ...cat,
        heat_score: (cat.total_votes) + (cat.total_comments * 2) + (cat.launch_count * 10)
    }));

    // Sort by Heat Score descending
    return trends.sort((a, b) => b.heat_score - a.heat_score);
}

/**
 * Get growth trends for a specific metric over time
 */
export async function getGrowthTrends(
    metric: 'votes' | 'comments',
    timeframe: 'biweekly' | 'monthly'
): Promise<TimeSeriesPoint[]> {
    const days = timeframe === 'biweekly' ? 14 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: launches, error } = await supabase
        .from('ph_launches')
        .select(`votes_count, comments_count, launched_at`)
        .gte('launched_at', startDate.toISOString())
        .order('launched_at', { ascending: true });

    if (error || !launches) return [];

    // Group by Date
    const dailyMap = new Map<string, number>();

    // Initialize all days with 0 to ensure continuous line
    for (let i = 0; i <= days; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        dailyMap.set(dateStr, 0);
    }

    launches.forEach(launch => {
        const dateStr = new Date(launch.launched_at).toISOString().split('T')[0];
        const value = metric === 'votes' ? (launch.votes_count || 0) : (launch.comments_count || 0);

        if (dailyMap.has(dateStr)) {
            dailyMap.set(dateStr, dailyMap.get(dateStr)! + value);
        }
    });

    return Array.from(dailyMap.entries()).map(([date, value]) => ({
        date,
        value
    }));
}

export interface MarketOpportunity {
    type: 'low_competition' | 'high_demand' | 'emerging';
    category: string;
    insight: string;
    metric: string;
}

/**
 * Detect market opportunities based on category analysis
 */
export async function detectMarketOpportunities(days: number = 30): Promise<MarketOpportunity[]> {
    const categories = await getTrendingCategories(days);
    const opportunities: MarketOpportunity[] = [];

    // Low Competition: Categories with high engagement but low launch count
    const lowCompetition = categories.filter(cat =>
        cat.launch_count < 5 && cat.heat_score > 100
    );

    lowCompetition.slice(0, 2).forEach(cat => {
        opportunities.push({
            type: 'low_competition',
            category: cat.name,
            insight: `Only ${cat.launch_count} launches but ${cat.total_votes} total votes. Low competition, high interest.`,
            metric: `${cat.launch_count} launches`
        });
    });

    // High Demand: Categories with lots of engagement
    const highDemand = categories.filter(cat =>
        cat.total_votes > 500 && cat.total_comments > 100
    );

    highDemand.slice(0, 2).forEach(cat => {
        opportunities.push({
            type: 'high_demand',
            category: cat.name,
            insight: `${cat.total_votes} votes across ${cat.launch_count} launches. Proven market demand.`,
            metric: `${cat.total_votes} votes`
        });
    });

    // Emerging: Categories with recent growth (comparing last 2 weeks vs previous 2 weeks)
    // For now, we'll identify categories with moderate activity as "emerging"
    const emerging = categories.filter(cat =>
        cat.launch_count >= 3 && cat.launch_count <= 10 && cat.heat_score > 50
    );

    emerging.slice(0, 1).forEach(cat => {
        opportunities.push({
            type: 'emerging',
            category: cat.name,
            insight: `${cat.launch_count} launches in the last ${days} days. Growing interest.`,
            metric: `${cat.launch_count} launches`
        });
    });

    return opportunities;
}

/**
 * Get today's top product launches
 */
export async function getTodaysTopLaunches(limit: number = 10) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fallback: get the most recent launches if today is empty
    const { data: launches, error } = await supabase
        .from('ph_launches')
        .select('*')
        .order('launched_at', { ascending: false })
        .limit(50);

    if (error || !launches || launches.length === 0) {
        return [];
    }

    // Get the date of the most recent launch
    const latestDate = new Date(launches[0].launched_at);
    const latestDayStr = latestDate.toISOString().split('T')[0];

    // Filter for that day and sort by votes
    return launches
        .filter(l => l.launched_at.startsWith(latestDayStr))
        .sort((a, b) => (b.votes_count || 0) - (a.votes_count || 0))
        .slice(0, limit);
}

