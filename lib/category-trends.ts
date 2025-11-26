import { PHProduct } from './producthunt-live';
import { TrendlineData } from './vote-snapshots';

export interface CategoryTrendlineData {
    time: string;
    hour: number;
    [categoryName: string]: number | string;
}

/**
 * Generate category trendline data by aggregating product trendline data
 * This ensures both charts share the exact same time axis
 */
export function generateCategoryTrendData(
    productTrendData: TrendlineData[] | undefined | null,
    products: PHProduct[] | undefined | null
): CategoryTrendlineData[] {
    if (!productTrendData || !products || productTrendData.length === 0 || products.length === 0) return [];

    // Create a map of product name to primary category
    const productPrimaryCategory = new Map<string, string>();
    products.forEach(p => {
        const primaryTopic = p.topics && p.topics.length > 0
            ? (typeof p.topics[0] === 'string' ? p.topics[0] : p.topics[0].name)
            : 'Other';
        productPrimaryCategory.set(p.name, primaryTopic);
    });

    // Transform product trendline data into category trendline data
    const categoryData: CategoryTrendlineData[] = productTrendData.map(dataPoint => {
        const categoryPoint: CategoryTrendlineData = {
            time: dataPoint.time,
            hour: dataPoint.hour
        };

        // Aggregate votes by category
        const categoryVotes = new Map<string, number>();
        const categoryComments = new Map<string, number>();

        // Go through each product in this data point
        Object.keys(dataPoint).forEach(key => {
            // Skip meta fields
            if (key === 'time' || key === 'hour') return;

            // Check if this is a comment count field
            if (key.endsWith('_comments')) {
                const productName = key.replace('_comments', '');
                const category = productPrimaryCategory.get(productName);
                if (category && category !== 'Other') {
                    const commentCount = dataPoint[key] as number;
                    categoryComments.set(category, (categoryComments.get(category) || 0) + commentCount);
                }
            } else {
                // This is a vote count field
                const category = productPrimaryCategory.get(key);
                if (category && category !== 'Other') {
                    const voteCount = dataPoint[key] as number;
                    categoryVotes.set(category, (categoryVotes.get(category) || 0) + voteCount);
                }
            }
        });

        // Add aggregated category data to this time point
        categoryVotes.forEach((votes, category) => {
            categoryPoint[category] = votes;
        });

        categoryComments.forEach((comments, category) => {
            categoryPoint[`${category}_comments`] = comments;
        });

        return categoryPoint;
    });

    return categoryData;
}
