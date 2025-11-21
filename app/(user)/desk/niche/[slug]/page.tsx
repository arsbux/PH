'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Target,
    TrendingUp,
    ArrowLeft,
    ArrowRight,
    BarChart3,
    MessageCircle,
    Award,
    AlertCircle,
    Activity
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import {
    getNicheSuccessHistogram,
    getProductScatterData,
    getFeatureCorrelation,
    type NicheHistogramData,
    type ProductScatterPoint,
    type FeatureCorrelation
} from '@/lib/charts-data';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function NicheDetailPage() {
    const params = useParams();
    const router = useRouter();
    const niche = decodeURIComponent(params.slug as string);

    const [loading, setLoading] = useState(true);
    const [histogramData, setHistogramData] = useState<NicheHistogramData | null>(null);
    const [scatterData, setScatterData] = useState<ProductScatterPoint[]>([]);
    const [correlationData, setCorrelationData] = useState<FeatureCorrelation[]>([]);
    const [topProducts, setTopProducts] = useState<any[]>([]);
    const [allProducts, setAllProducts] = useState<any[]>([]);
    const [showingAll, setShowingAll] = useState(false);
    const [loadingAll, setLoadingAll] = useState(false);

    const supabase = createClientComponentClient();

    useEffect(() => {
        if (niche) {
            loadNicheData();
        }
    }, [niche]);

    const loadNicheData = async () => {
        setLoading(true);
        try {
            const [histogram, scatter, correlation] = await Promise.all([
                getNicheSuccessHistogram(niche),
                getProductScatterData(niche),
                getFeatureCorrelation(niche)
            ]);

            setHistogramData(histogram);
            setScatterData(scatter);
            setCorrelationData(correlation);

            // Load top 10 products
            const { data: products } = await supabase
                .from('ph_launches')
                .select('name, votes_count, comments_count, ai_analysis, launched_at, thumbnail_url, tagline, website_url')
                .not('ai_analysis', 'is', null)
                .order('votes_count', { ascending: false })
                .limit(100); // Get more to filter

            if (products) {
                const filtered = products.filter(p => p.ai_analysis?.niche === niche).slice(0, 10);
                setTopProducts(filtered);
            }
        } catch (error) {
            console.error('Error loading niche data:', error);
        }
        setLoading(false);
    };

    const loadAllProducts = async () => {
        setLoadingAll(true);
        try {
            // Fetch all products in this niche
            const { data: products } = await supabase
                .from('ph_launches')
                .select('name, votes_count, comments_count, ai_analysis, launched_at, thumbnail_url, tagline, website_url')
                .not('ai_analysis', 'is', null)
                .order('votes_count', { ascending: false });

            if (products) {
                const filtered = products.filter(p => p.ai_analysis?.niche === niche);
                setAllProducts(filtered);
                setShowingAll(true);
            }
        } catch (error) {
            console.error('Error loading all products:', error);
        }
        setLoadingAll(false);
    };

    const getTypeColor = (type: ProductScatterPoint['productType']) => {
        switch (type) {
            case 'Community Darling': return '#10b981'; // green
            case 'Pure Utility': return '#3b82f6'; // blue
            case 'Niche Product': return '#f59e0b'; // orange
            case 'Low Engagement': return '#9ca3af'; // gray
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Analyzing {niche}...</p>
                </div>
            </div>
        );
    }

    if (!histogramData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center bg-white rounded-xl p-8 border border-gray-200 max-w-md">
                    <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Niche Not Found</h2>
                    <p className="text-gray-600 mb-6">
                        We don't have enough data for "{niche}" yet.
                    </p>
                    <Link
                        href="/desk/niche"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Niches
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
            <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
                {/* Header */}
                <div>
                    <Link
                        href="/desk/niche"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Niches
                    </Link>
                    <div className="flex items-center gap-3 mb-3">
                        <Target className="w-10 h-10 text-blue-600" />
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{niche}</h1>
                    </div>
                    <p className="text-gray-600 text-lg">
                        Deep dive into the {niche} niche — success patterns, competition levels, and what works
                    </p>
                </div>

                {/* TOP 3 PLAYERS - REDESIGNED */}
                {topProducts.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Top Players in {niche}
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">Most upvoted products</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {topProducts.slice(0, 3).map((product, index) => (
                                <div
                                    key={product.name}
                                    className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex gap-4 mb-4">
                                        {/* Product Logo - Left Side */}
                                        {product.thumbnail_url && (
                                            <div className="flex-shrink-0">
                                                <div className="w-16 h-16 bg-white rounded-lg border border-gray-200 flex items-center justify-center p-2 shadow-sm">
                                                    <img
                                                        src={product.thumbnail_url}
                                                        alt={product.name}
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Product Name & Description - Right Side */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
                                                {product.name}
                                            </h3>

                                            {product.tagline && (
                                                <p className="text-sm text-gray-600 line-clamp-2">
                                                    {product.tagline}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Metrics */}
                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500 flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                                Upvotes
                                            </span>
                                            <span className="font-bold text-gray-900">
                                                {product.votes_count.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500 flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                Comments
                                            </span>
                                            <span className="font-bold text-gray-900">
                                                {product.comments_count}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500">Launched</span>
                                            <span className="text-gray-600">
                                                {new Date(product.launched_at).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Visit Button */}
                                    {product.website_url && (
                                        <a
                                            href={product.website_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full py-2.5 bg-gray-900 text-white text-center rounded-lg font-medium hover:bg-gray-800 transition-colors inline-flex items-center justify-center gap-2"
                                        >
                                            Visit Website
                                            <ArrowRight className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Key Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <div className="text-sm text-gray-600 mb-1">Total Products</div>
                        <div className="text-3xl font-bold text-gray-900">{histogramData.stats.total}</div>
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <div className="text-sm text-gray-600 mb-1">Median Upvotes</div>
                        <div className="text-3xl font-bold text-blue-600">{histogramData.stats.median}</div>
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <div className="text-sm text-gray-600 mb-1">Top 10% (P90)</div>
                        <div className="text-3xl font-bold text-orange-600">{histogramData.stats.p90}</div>
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <div className="text-sm text-gray-600 mb-1">Top 1% (P99)</div>
                        <div className="text-3xl font-bold text-green-600">{histogramData.stats.p99}</div>
                    </div>
                </div>




                {/* Performance Scatter Plot */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <MessageCircle className="w-6 h-6 text-blue-600" />
                            Engagement Patterns (Upvotes vs. Comments)
                        </h2>
                        <p className="text-gray-600 mt-1 text-sm">
                            Different product types attract different engagement patterns
                        </p>
                    </div>
                    <div className="p-6">
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={[...scatterData].sort((a, b) => a.votes - b.votes)} margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#9ca3af"
                                    fontSize={10}
                                    tickLine={false}
                                    angle={-45}
                                    textAnchor="end"
                                    height={100}
                                />
                                <YAxis
                                    stroke="#9ca3af"
                                    fontSize={12}
                                    tickLine={false}
                                    label={{ value: 'Engagement Metrics', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
                                />
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload[0]) {
                                            const data = payload[0].payload as ProductScatterPoint;
                                            return (
                                                <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg max-w-xs">
                                                    <div className="font-bold text-gray-900 mb-2 truncate">{data.name}</div>
                                                    <div className="text-sm space-y-1">
                                                        <div>Type: <span className="font-semibold">{data.productType}</span></div>
                                                        <div>Upvotes: <span className="font-semibold">{data.votes}</span></div>
                                                        <div>Comments: <span className="font-semibold">{data.comments}</span></div>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Legend />
                                <Line
                                    type="natural"
                                    dataKey="votes"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    dot={false}
                                    activeDot={{ r: 6 }}
                                    name="Upvotes"
                                />
                                <Line
                                    type="natural"
                                    dataKey="comments"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    dot={false}
                                    activeDot={{ r: 6 }}
                                    name="Comments"
                                />
                            </LineChart>
                        </ResponsiveContainer>

                        {/* Legend */}
                        <div className="mt-6 flex flex-wrap gap-4 justify-center">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                                <span className="text-sm text-gray-600">Community Darling (High votes + comments)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                                <span className="text-sm text-gray-600">Pure Utility (High votes, low comments)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                                <span className="text-sm text-gray-600">Niche Product</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feature Correlation */}
                {correlationData.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Award className="w-6 h-6 text-blue-600" />
                                Feature/Language Correlation
                            </h2>
                            <p className="text-gray-600 mt-1 text-sm">
                                Which keywords in descriptions correlate with higher upvotes?
                            </p>
                        </div>
                        <div className="p-6">
                            <div className="space-y-3">
                                {correlationData.map((feature, index) => (
                                    <div
                                        key={feature.keyword}
                                        className={`p-4 rounded-lg border-2 ${feature.uplift > 20
                                            ? 'bg-green-50 border-green-200'
                                            : feature.uplift > 0
                                                ? 'bg-blue-50 border-blue-200'
                                                : 'bg-red-50 border-red-200'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                                                    <span className="text-lg">
                                                        {index + 1}. "{feature.keyword}"
                                                    </span>
                                                    <span className="text-xs px-2 py-1 bg-white rounded-full border border-gray-200">
                                                        {feature.occurrences} mentions
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    With keyword: <span className="font-semibold">{feature.avgUpvotesWithKeyword} avg</span>
                                                    {' • '}
                                                    Without: <span className="font-semibold">{feature.avgUpvotesWithout} avg</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-2xl font-bold ${feature.uplift > 0 ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                    {feature.uplift > 0 ? '+' : ''}{feature.uplift}%
                                                </div>
                                                <div className="text-xs text-gray-600">uplift</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
                                <p className="text-sm text-orange-900">
                                    <strong>💡 Pro Tip:</strong> Mentioning "{correlationData[0]?.keyword}" in your description
                                    correlates with a {correlationData[0]?.uplift > 0 ? '+' : ''}{correlationData[0]?.uplift}% boost in upvotes for this niche!
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Top Products */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-gray-50">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Award className="w-6 h-6 text-yellow-500" />
                            Top {showingAll ? allProducts.length : 10} Products in {niche}
                        </h2>
                        <p className="text-gray-500 mt-1 text-sm">
                            {showingAll ? 'All products sorted by upvotes' : 'Highest performing products in this category'}
                        </p>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {(showingAll ? allProducts : topProducts).map((product, index) => (
                            <div key={product.name} className="p-6 hover:bg-gray-50/50 transition-all group">
                                <div className="flex items-start gap-6">
                                    {/* Rank Badge */}
                                    <div className="flex-shrink-0">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                            index === 1 ? 'bg-gray-100 text-gray-700' :
                                                index === 2 ? 'bg-orange-100 text-orange-700' :
                                                    'bg-gray-50 text-gray-500'
                                            }`}>
                                            #{index + 1}
                                        </div>
                                    </div>

                                    {/* Thumbnail */}
                                    {product.thumbnail_url && (
                                        <div className="flex-shrink-0">
                                            <img
                                                src={product.thumbnail_url}
                                                alt={product.name}
                                                className="w-20 h-20 rounded-xl object-cover border-2 border-gray-100 group-hover:border-blue-200 transition-colors"
                                            />
                                        </div>
                                    )}

                                    {/* Product Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                                                {product.name}
                                            </h3>

                                            {/* Launch Date Badge */}
                                            <span className="flex-shrink-0 text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full font-medium border border-blue-100">
                                                📅 {new Date(product.launched_at).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>

                                        {/* Tagline */}
                                        {product.tagline && (
                                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                {product.tagline}
                                            </p>
                                        )}

                                        {/* Stats */}
                                        <div className="flex items-center gap-6 text-sm">
                                            <span className="flex items-center gap-1.5 font-semibold text-orange-600">
                                                <span className="text-orange-600">▲</span>
                                                {product.votes_count.toLocaleString()} upvotes
                                            </span>
                                            <span className="flex items-center gap-1.5 text-gray-600">
                                                <MessageCircle className="w-4 h-4" />
                                                {product.comments_count} comments
                                            </span>
                                            {product.website_url && (
                                                <a
                                                    href={product.website_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium ml-auto"
                                                >
                                                    Visit Website →
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Show All Button */}
                    {!showingAll && (
                        <div className="p-6 border-t border-gray-100 bg-gray-50">
                            <button
                                onClick={loadAllProducts}
                                disabled={loadingAll}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                            >
                                {loadingAll ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Loading all products...
                                    </>
                                ) : (
                                    <>
                                        <TrendingUp className="w-5 h-5" />
                                        Show All Products in {niche}
                                    </>
                                )}
                            </button>
                            <p className="text-center text-xs text-gray-500 mt-3">
                                Load the complete list of all products in this category
                            </p>
                        </div>
                    )}

                    {/* Showing All Message */}
                    {showingAll && (
                        <div className="p-6 border-t border-gray-100 bg-green-50">
                            <p className="text-center text-sm text-green-800 font-medium">
                                ✓ Showing all {allProducts.length} products in {niche}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
