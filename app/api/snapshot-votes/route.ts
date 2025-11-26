import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fetchLatestPosts } from '@/lib/producthunt-live';

// This route snapshots current vote counts for today's top products
// Should be called every 5-10 minutes via cron job

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for execution

export async function POST(req: NextRequest) {
    try {
        // Verify cron secret (optional but recommended)
        const authHeader = req.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Initialize Supabase
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Fetch current data from Product Hunt (latest available date)
        const { products, date } = await fetchLatestPosts();


        if (products.length === 0) {
            return NextResponse.json({
                message: 'No products found for today',
                count: 0
            });
        }

        // Use the actual date from the fetched products
        const snapshotDate = new Date(date);
        snapshotDate.setHours(0, 0, 0, 0);

        // Prepare snapshots for ALL products (not just top 10)
        const sortedProducts = products.sort((a, b) => b.votesCount - a.votesCount);

        const snapshots = sortedProducts.map(product => ({
            product_id: product.id,
            product_name: product.name,
            votes_count: product.votesCount,
            comments_count: product.commentsCount,
            snapshot_date: snapshotDate.toISOString().split('T')[0],
            snapshot_time: new Date().toISOString()
        }));

        // Insert snapshots into database
        const { data, error } = await supabase
            .from('vote_snapshots')
            .insert(snapshots);

        if (error) {
            console.error('Error inserting snapshots:', error);
            return NextResponse.json({
                error: 'Database error',
                details: error.message
            }, { status: 500 });
        }

        console.log(`✅ Snapshot saved: ${snapshots.length} products at ${new Date().toISOString()}`);

        return NextResponse.json({
            success: true,
            count: snapshots.length,
            timestamp: new Date().toISOString(),
            products: sortedProducts.slice(0, 10).map(p => ({ id: p.id, name: p.name, votes: p.votesCount }))
        });

    } catch (error: any) {
        console.error('Snapshot error:', error);
        return NextResponse.json({
            error: 'Failed to create snapshot',
            message: error.message
        }, { status: 500 });
    }
}

// Allow GET for manual testing
export async function GET() {
    return NextResponse.json({
        message: 'Use POST to create a snapshot',
        usage: 'curl -X POST -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-domain.com/api/snapshot-votes'
    });
}
