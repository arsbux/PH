import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
    try {
        // Fetch last 30 days of data
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data, error } = await supabase
            .from('analytics_visits')
            .select('*')
            .gte('created_at', thirtyDaysAgo.toISOString())
            .order('created_at', { ascending: true });

        if (error) throw error;

        const visits = data || [];

        // Aggregation
        const timeline: Record<string, number> = {};
        const pages: Record<string, number> = {};
        const devices: Record<string, number> = {};
        const countries: Record<string, number> = {};

        visits.forEach(visit => {
            // Timeline (Hour)
            const date = new Date(visit.created_at);
            // Format: YYYY-MM-DD HH:00
            const key = date.toISOString().slice(0, 13) + ':00:00.000Z';
            timeline[key] = (timeline[key] || 0) + 1;

            // Pages
            const path = visit.page_path || '/';
            pages[path] = (pages[path] || 0) + 1;

            // Devices
            const device = visit.device_type || 'unknown';
            devices[device] = (devices[device] || 0) + 1;

            // Countries
            const country = visit.country || 'Unknown';
            countries[country] = (countries[country] || 0) + 1;
        });

        // Format for Recharts
        const timelineData = Object.entries(timeline)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));

        const pagesData = Object.entries(pages)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);

        const devicesData = Object.entries(devices)
            .map(([name, value]) => ({ name, value }));

        const countriesData = Object.entries(countries)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);

        return NextResponse.json({
            timeline: timelineData,
            pages: pagesData,
            devices: devicesData,
            countries: countriesData,
            totalVisits: visits.length,
            avgDuration: Math.round(visits.reduce((acc, v) => acc + (v.duration_seconds || 0), 0) / (visits.length || 1))
        });

    } catch (error: any) {
        console.error('Analytics Fetch Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
