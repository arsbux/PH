import { createClient } from '@supabase/supabase-js';
import { PHProduct } from './producthunt-live';

export interface VoteSnapshot {
    product_id: string;
    product_name: string;
    votes_count: number;
    comments_count: number;
    snapshot_time: string;
}

export interface TrendlineData {
    time: string; // Hour like "0:00", "1:00", "2:00"
    hour: number; // Numeric hour for sorting
    [key: string]: number | string; // Product vote/comment counts (e.g. "Product A", "Product A_comments")
}

export interface CategoryTrendlineData {
    time: string;
    hour: number;
    [categoryName: string]: number | string; // Category totals
}

/**
 * Transform snapshots to category-based trendline data
 */
export function transformSnapshotsToCategoryData(
    snapshots: VoteSnapshot[],
    products: PHProduct[]
): CategoryTrendlineData[] {
    if (snapshots.length === 0) return [];

    // Create a map of product ID to categories
    const productCategories = new Map<string, string[]>();
    products.forEach(p => {
        const topics = p.topics && p.topics.length > 0
            ? p.topics.map(t => typeof t === 'string' ? t : t.name)
            : ['Other'];
        productCategories.set(p.id, topics);
    });

    // Group snapshots by hour
    const hourlySnapshots = new Map<number, VoteSnapshot[]>();

    snapshots.forEach(snap => {
        const snapTime = new Date(snap.snapshot_time);
        const hour = snapTime.getHours();
        if (!hourlySnapshots.has(hour)) {
            hourlySnapshots.set(hour, []);
        }
        hourlySnapshots.get(hour)!.push(snap);
    });

    // Find the min and max hours
    const hours = Array.from(hourlySnapshots.keys()).sort((a, b) => a - b);
    if (hours.length === 0) return [];

    const minHour = Math.min(...hours);
    const maxHour = Math.max(...hours);

    // Build trendline data
    const chartData: CategoryTrendlineData[] = [];

    for (let hour = minHour; hour <= maxHour; hour++) {
        const dataPoint: CategoryTrendlineData = {
            time: `${hour}:00`,
            hour
        };

        // Get the most recent snapshot for each product up to this hour
        const productLatestVotes = new Map<string, { votes: number; comments: number }>();

        // Look through all hours up to current hour to get latest snapshot for each product
        for (let h = minHour; h <= hour; h++) {
            const snapshotsAtHour = hourlySnapshots.get(h) || [];
            snapshotsAtHour.forEach(snap => {
                productLatestVotes.set(snap.product_id, {
                    votes: snap.votes_count,
                    comments: snap.comments_count
                });
            });
        }

        // Aggregate by category
        const categoryStats = new Map<string, { votes: number; comments: number }>();

        productLatestVotes.forEach((voteCounts, productId) => {
            const categories = productCategories.get(productId) || ['Other'];

            categories.forEach(category => {
                if (!categoryStats.has(category)) {
                    categoryStats.set(category, { votes: 0, comments: 0 });
                }
                const stats = categoryStats.get(category)!;
                stats.votes += voteCounts.votes;
                stats.comments += voteCounts.comments;
            });
        });

        // Add to dataPoint
        categoryStats.forEach((stats, categoryName) => {
            dataPoint[categoryName] = stats.votes;
            dataPoint[`${categoryName}_comments`] = stats.comments;
        });

        chartData.push(dataPoint);
    }

    return chartData;
}
