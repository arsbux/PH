'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';
import {
    Trophy, Calendar, TrendingUp, MessageCircle, ArrowUp,
    Activity, Info, Search, Hash, Zap, Globe
} from 'lucide-react';
import { HuntedSpaceLayout } from '@/components/hunted/HuntedSpaceLayout';
import {
    getTopicVelocity,
    getFeatureCorrelation,
    mapNicheToCategory,
    type TopicVelocityData,
    type FeatureCorrelation,
    CATEGORY_MAPPING
} from '@/lib/charts-data';

// --- Types ---
interface Product {
    id: string;
    name: string;
    tagline: string;
    votes_count: number;
    comments_count: number;
    thumbnail_url: string | null;
    launched_at: string;
    website_url: string | null;
}

// --- Helper Components ---

const ProductCard = ({ product, rank, isToday = false }: { product: Product; rank: number; isToday?: boolean }) => (
    <div className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-colors group border border-transparent hover:border-white/10">
        <div className={`flex-shrink-0 w-6 text-center font-bold ${rank <= 3 ? 'text-orange-500' : 'text-gray-600'
            }`}>
            #{rank}
        </div>

        <div className="relative flex-shrink-0 w-10 h-10 bg-white/10 rounded-lg overflow-hidden border border-white/10">
            {product.thumbnail_url ? (
                <img src={product.thumbnail_url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <Globe size={16} />
                </div>
            )}
            {isToday && (
                <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-black"></div>
            )}
        </div>

        <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-200 truncate group-hover:text-white">
                {product.name}
            </h4>
            <p className="text-xs text-gray-500 truncate">{product.tagline}</p>
        </div>

        <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1 text-xs font-medium text-orange-500">
                <ArrowUp size={12} />
                {product.votes_count}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-600">
                <MessageCircle size={10} />
                {product.comments_count}
            </div>
        </div>
    </div>
);

const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: any, title: string, subtitle?: string }) => (
    <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
            <Icon className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-bold text-white">{title}</h2>
        </div>
        {subtitle && <p className="text-sm text-gray-500 ml-7">{subtitle}</p>}
    </div>
);

// --- Main Page Component ---

export default function CategoryPage() {
    const params = useParams();
    const niche = decodeURIComponent(params.slug as string);
    const category = mapNicheToCategory(niche);

    const [loading, setLoading] = useState(true);
    const [trendData, setTrendData] = useState<TopicVelocityData | null>(null);
    const [correlations, setCorrelations] = useState<FeatureCorrelation[]>([]);
    const [topHistorical, setTopHistorical] = useState<Product[]>([]);
    const [topToday, setTopToday] = useState<Product[]>([]);
    const [stats, setStats] = useState({ total: 0, avgVotes: 0, avgComments: 0 });

    const supabase = createClientComponentClient();

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Trend Data
                const allTrends = await getTopicVelocity(12);
                const categoryTrend = allTrends.find(t => t.topic === category);
                setTrendData(categoryTrend || null);

                // 2. Fetch Correlations
                const correlationData = await getFeatureCorrelation(category); // Use category for better matching
                setCorrelations(correlationData);

                // Determine tags to search for
                let searchTags = [niche];

                // If niche is an aggregate category, find all sub-niches
                const subNiches = Object.entries(CATEGORY_MAPPING)
                    .filter(([_, cat]) => cat === niche)
                    .map(([key]) => key);

                if (subNiches.length > 0) {
                    searchTags = [...searchTags, ...subNiches];
                }

                // 3. Fetch Top Products (Historical)
                const { data: historicalData } = await supabase
                    .from('ph_launches')
                    .select('*')
                    .overlaps('topics', searchTags)
                    .order('votes_count', { ascending: false })
                    .limit(5);

                if (historicalData) setTopHistorical(historicalData);

                // 4. Fetch Top Products (Today)
                // Define "Today" as last 24 hours for simplicity, or just today's date
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const { data: todayData } = await supabase
                    .from('ph_launches')
                    .select('*')
                    .overlaps('topics', searchTags)
                    .gte('launched_at', today.toISOString())
                    .order('votes_count', { ascending: false })
                    .limit(5);

                if (todayData) setTopToday(todayData);

                // 5. Calculate Stats (if we have historical data)
                if (historicalData) {
                    // This is a rough estimate based on top 5, ideally we'd do an aggregate query
                    // For now, let's use the trend data for averages if available
                    if (categoryTrend) {
                        // Calculate weighted averages from time series data
                        const totalVotes = categoryTrend.timeSeriesData.reduce((sum, d) => sum + (d.avgUpvotes * d.launchCount), 0);
                        const totalComments = categoryTrend.timeSeriesData.reduce((sum, d) => sum + (d.avgComments * d.launchCount), 0);
                        const totalLaunches = categoryTrend.totalLaunches;

                        setStats({
                            total: totalLaunches,
                            avgVotes: totalLaunches > 0 ? Math.round(totalVotes / totalLaunches) : 0,
                            avgComments: totalLaunches > 0 ? Math.round(totalComments / totalLaunches) : 0
                        });
                    }
                }

            } catch (error) {
                console.error("Error loading category data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (niche) loadData();
    }, [niche, category]);

    // --- Layout Sections ---

    const LeftSidebar = () => (
        <div className="p-4 space-y-8">
            {/* Top Today */}
            <div>
                <SectionHeader
                    icon={Calendar}
                    title="Top Today"
                    subtitle="Best performing launches in the last 24h"
                />
                <div className="space-y-1">
                    {topToday.length > 0 ? (
                        topToday.map((p, i) => <ProductCard key={p.id} product={p} rank={i + 1} isToday />)
                    ) : (
                        <div className="p-4 text-center text-gray-500 bg-white/5 rounded-xl border border-dashed border-white/10">
                            <p className="text-sm">No launches today yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Top Historical */}
            <div>
                <SectionHeader
                    icon={Trophy}
                    title="All-Time Legends"
                    subtitle={`Highest voted ${niche} products ever`}
                />
                <div className="space-y-1">
                    {topHistorical.map((p, i) => (
                        <ProductCard key={p.id} product={p} rank={i + 1} />
                    ))}
                </div>
            </div>
        </div>
    );

    const CenterContent = () => (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div className="border-b border-white/10 pb-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-900/20">
                        <Hash className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">{niche}</h1>
                        <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
                            <span>Category: {category}</span>
                            <span>•</span>
                            <span>{stats.total} products tracked</span>
                        </div>
                    </div>
                </div>
                <p className="text-gray-300 text-lg leading-relaxed max-w-3xl">
                    Explore the latest trends, top performing products, and market insights for the
                    <span className="text-white font-semibold"> {niche}</span> ecosystem.
                    Analyze historical performance and discover what drives success in this category.
                </p>
            </div>

            {/* Timeline Chart */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <SectionHeader
                    icon={Activity}
                    title="Market Volume & Engagement"
                    subtitle="12-month trend of launches, votes, and comments"
                />
                <div className="h-[350px] w-full">
                    {trendData ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData.timeSeriesData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    stroke="#666"
                                    tick={{ fill: '#666', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    yAxisId="left"
                                    stroke="#666"
                                    tick={{ fill: '#666', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    stroke="#666"
                                    tick={{ fill: '#666', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="avgUpvotes"
                                    name="Avg Upvotes"
                                    stroke="#f97316"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#f97316' }}
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="launchCount"
                                    name="Launches"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    dot={false}
                                />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="avgComments"
                                    name="Avg Comments"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-500">
                            Loading chart data...
                        </div>
                    )}
                </div>
            </div>

            {/* Feature Correlation */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <SectionHeader
                    icon={Zap}
                    title="Keyword Impact Analysis"
                    subtitle="Which keywords in descriptions correlate with higher upvotes?"
                />

                <div className="grid grid-cols-1 gap-4">
                    {correlations.slice(0, 8).map((item, idx) => (
                        <div key={item.keyword} className="relative">
                            <div className="flex items-center justify-between mb-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400 w-4">#{idx + 1}</span>
                                    <span className="font-mono text-white bg-white/10 px-2 py-0.5 rounded">
                                        "{item.keyword}"
                                    </span>
                                    <span className="text-gray-500 text-xs">
                                        ({item.occurrences} uses)
                                    </span>
                                </div>
                                <div className={`font-bold ${item.uplift > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {item.uplift > 0 ? '+' : ''}{item.uplift}% impact
                                </div>
                            </div>

                            {/* Bar Chart Visual */}
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden flex">
                                <div
                                    className={`h-full rounded-full ${item.uplift > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                                    style={{ width: `${Math.min(Math.abs(item.uplift), 100)}%` }}
                                />
                            </div>

                            <div className="flex justify-between mt-1 text-xs text-gray-600">
                                <span>Avg w/o: {item.avgUpvotesWithout}</span>
                                <span>Avg w/: {item.avgUpvotesWithKeyword}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const RightSidebar = () => (
        <div className="p-4 space-y-6">
            {/* Quick Stats */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                    Category Stats
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="text-2xl font-bold text-white">{stats.total}</div>
                        <div className="text-xs text-gray-500">Total Products</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-orange-500">{stats.avgVotes}</div>
                        <div className="text-xs text-gray-500">Avg Upvotes</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-blue-500">{stats.avgComments}</div>
                        <div className="text-xs text-gray-500">Avg Comments</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-green-500">
                            {trendData?.trend === 'rising' ? 'High' : 'Normal'}
                        </div>
                        <div className="text-xs text-gray-500">Current Trend</div>
                    </div>
                </div>
            </div>

            {/* About Section */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                    <Info className="w-4 h-4 text-blue-400" />
                    <h3 className="font-semibold text-white">About {category}</h3>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">
                    This category encompasses products related to {niche.toLowerCase()}.
                    The data shows a {trendData?.trend || 'stable'} trend in launch volume over the last 12 months.
                    Products in this space typically require strong community engagement to succeed.
                </p>
            </div>
        </div>
    );

    if (loading && !trendData) {
        return (
            <div className="h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500">Analyzing {niche} ecosystem...</p>
                </div>
            </div>
        );
    }

    return (
        <HuntedSpaceLayout
            leftSidebar={<LeftSidebar />}
            centerContent={<CenterContent />}
            rightSidebar={<RightSidebar />}
        />
    );
}
