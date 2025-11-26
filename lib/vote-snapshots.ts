import { createClient } from '@supabase/supabase-js';

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

/**
 * Get the most recent date that has snapshot data
 */
export async function getMostRecentSnapshotDate(): Promise<Date | null> {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase
        .from('vote_snapshots')
        .select('snapshot_date')
        .order('snapshot_date', { ascending: false })
        .limit(1);

    if (error || !data || data.length === 0) {
        console.error('❌ Error fetching most recent snapshot date:', error);
        return null;
    }

    console.log('📅 Most recent snapshot date in DB:', data[0].snapshot_date);
    return new Date(data[0].snapshot_date);
}

/**
 * Fetch vote snapshots for a specific date
 */
export async function getVoteSnapshots(date: Date): Promise<VoteSnapshot[]> {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const dateStr = date.toISOString().split('T')[0];

    console.log('🔍 Fetching snapshots for date:', dateStr);

    const { data, error } = await supabase
        .from('vote_snapshots')
        .select('*')
        .eq('snapshot_date', dateStr)
        .order('snapshot_time', { ascending: true });

    if (error) {
        console.error('❌ Error fetching snapshots:', error);
        return [];
    }

    console.log(`✅ Found ${data?.length || 0} snapshots`);
    return data || [];
}

import { PHProduct } from './producthunt-live';

/**
 * Transform snapshots into smooth trendline chart data with interpolation
 * Uses product launch times to create realistic growth curves from 0
 */
export function transformSnapshotsToChartData(snapshots: VoteSnapshot[], products: PHProduct[]): TrendlineData[] {
    if (snapshots.length === 0) return [];

    // Create a map of launch times
    const launchTimes = new Map<string, Date>();
    products.forEach(p => {
        launchTimes.set(p.name, new Date(p.createdAt));
    });

    // Group snapshots by product
    const productSnapshots = new Map<string, VoteSnapshot[]>();

    snapshots.forEach(snap => {
        if (!productSnapshots.has(snap.product_name)) {
            productSnapshots.set(snap.product_name, []);
        }
        productSnapshots.get(snap.product_name)!.push(snap);
    });

    // Find the time range
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Find the earliest launch time to start the chart from there
    let minLaunchHour = 24;
    launchTimes.forEach(date => {
        const h = date.getHours();
        if (h < minLaunchHour) minLaunchHour = h;
    });

    // Default to 0 if no launch times found
    if (minLaunchHour === 24) minLaunchHour = 0;

    // Create hourly data points from launch time to current time
    const chartData: TrendlineData[] = [];

    for (let hour = minLaunchHour; hour <= currentHour; hour++) {
        const dataPoint: TrendlineData = {
            time: `${hour}:00`,
            hour: hour
        };

        // For each product, interpolate the vote count at this hour
        productSnapshots.forEach((snaps, productName) => {
            const launchTime = launchTimes.get(productName);

            // If product hasn't launched yet at this hour, votes are 0
            if (launchTime && hour < launchTime.getHours()) {
                dataPoint[productName] = 0;
                dataPoint[`${productName}_comments`] = 0;
                return;
            }

            // Find snapshots before and after this hour
            let voteCount = 0;
            let commentCount = 0;
            let foundSnapshot = false;

            for (const snap of snaps) {
                const snapHour = new Date(snap.snapshot_time).getHours();
                const snapMinute = new Date(snap.snapshot_time).getMinutes();
                const snapDecimalHour = snapHour + (snapMinute / 60);
                const targetDecimalHour = hour;

                if (snapDecimalHour <= targetDecimalHour) {
                    // Use the latest snapshot up to this hour
                    voteCount = snap.votes_count;
                    commentCount = snap.comments_count;
                    foundSnapshot = true;
                }
            }

            // If we have no snapshots yet (early morning gap), interpolate from launch
            if (!foundSnapshot && launchTime) {
                // Find the first actual snapshot we have
                const firstSnap = snaps[0];
                if (firstSnap) {
                    const firstSnapTime = new Date(firstSnap.snapshot_time);
                    const firstSnapDecimal = firstSnapTime.getHours() + (firstSnapTime.getMinutes() / 60);
                    const launchDecimal = launchTime.getHours() + (launchTime.getMinutes() / 60);

                    // Linear interpolation: 0 at launch -> firstSnap.votes at firstSnapTime
                    if (hour >= launchDecimal && hour <= firstSnapDecimal) {
                        const progress = (hour - launchDecimal) / (firstSnapDecimal - launchDecimal);
                        voteCount = Math.floor(firstSnap.votes_count * progress);
                        commentCount = Math.floor(firstSnap.comments_count * progress);
                    }
                }
            }

            dataPoint[productName] = voteCount;
            dataPoint[`${productName}_comments`] = commentCount;
        });

        chartData.push(dataPoint);
    }

    // Add current time as final point if we're not on an exact hour
    if (currentMinute > 0) {
        const dataPoint: TrendlineData = {
            time: `${currentHour}:${currentMinute.toString().padStart(2, '0')}`,
            hour: currentHour + (currentMinute / 60)
        };

        productSnapshots.forEach((snaps, productName) => {
            // Get the very latest vote count
            const latest = snaps[snaps.length - 1];
            dataPoint[productName] = latest?.votes_count || 0;
        });

        chartData.push(dataPoint);
    }

    // Trim leading "dead air" (where all votes are 0)
    // We want to start the chart exactly when the first product launches/gets a vote
    let firstActiveIndex = 0;

    for (let i = 0; i < chartData.length; i++) {
        const point = chartData[i];
        const totalVotes = Object.entries(point)
            .filter(([key]) => key !== 'time' && key !== 'hour')
            .reduce((sum, [_, val]) => sum + (val as number), 0);

        if (totalVotes > 0) {
            // Found the first activity!
            // We want to keep the point *before* this one (the launch anchor at 0)
            // so the line rises from 0 instead of starting mid-air
            firstActiveIndex = Math.max(0, i - 1);
            break;
        }
    }

    // If we found activity, slice the array. 
    // If no activity yet (all 0), show the last few hours or just the current status
    if (firstActiveIndex > 0) {
        return chartData.slice(firstActiveIndex);
    }

    // If we're late in the day but somehow all votes are 0 (unlikely), 
    // or if it's very early, just return the relevant window
    return chartData;
}

/**
 * Get latest snapshot for each product (current votes)
 */
export async function getLatestSnapshots(date: Date): Promise<Map<string, VoteSnapshot>> {
    const snapshots = await getVoteSnapshots(date);
    const latest = new Map<string, VoteSnapshot>();

    snapshots.forEach(snap => {
        const existing = latest.get(snap.product_id);
        if (!existing || new Date(snap.snapshot_time) > new Date(existing.snapshot_time)) {
            latest.set(snap.product_id, snap);
        }
    });

    return latest;
}
