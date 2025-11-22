'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Target,
  BarChart3,
  TrendingUp,
  AlertCircle,
  Zap,
  Box
} from 'lucide-react';
import {
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import {
  getTopCategories,
  getMarketGapMatrix,
  type MarketGapMatrix
} from '@/lib/charts-data';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [topCategories, setTopCategories] = useState<any[]>([]);
  const [marketGaps, setMarketGaps] = useState<MarketGapMatrix[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [categories, gapData] = await Promise.all([
        getTopCategories('launches'),
        getMarketGapMatrix()
      ]);

      // Sort categories alphabetically
      const sortedCategories = categories.sort((a, b) => a.category.localeCompare(b.category));

      setTopCategories(sortedCategories);
      setMarketGaps(gapData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
    setLoading(false);
  };

  const getQuadrantColor = (quadrant: string) => {
    switch (quadrant) {
      case 'blue-ocean': return '#10b981'; // Green
      case 'red-ocean': return '#ef4444'; // Red
      case 'emerging': return '#f59e0b'; // Yellow
      case 'niche': return '#9ca3af'; // Gray
      default: return '#6b7280';
    }
  };

  const quadrants = {
    'blue-ocean': marketGaps.filter(m => m.quadrant === 'blue-ocean'),
    'red-ocean': marketGaps.filter(m => m.quadrant === 'red-ocean'),
    'emerging': marketGaps.filter(m => m.quadrant === 'emerging'),
    'niche': marketGaps.filter(m => m.quadrant === 'niche'),
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading market intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Market Intelligence
          </h1>
          <p className="text-gray-600">
            Real-time analysis of market trends and opportunities.
          </p>
        </div>

        {/* 1. CATEGORY VOLUME CHART (Line Chart) */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                Category Volume
              </h2>
              <p className="text-gray-500 mt-1 text-sm font-medium">
                Total number of products launched per category.
              </p>
            </div>
          </div>

          <div className="p-8">
            <div className="h-[300px] md:h-[450px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={topCategories} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis
                    dataKey="category"
                    stroke="#9ca3af"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    dy={10}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip
                    cursor={{ stroke: '#e5e7eb', strokeWidth: 2 }}
                    content={({ active, payload }) => {
                      if (active && payload && payload[0]) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-4 border border-gray-100 rounded-xl shadow-xl">
                            <div className="font-bold text-gray-900 mb-2 text-lg">{data.category}</div>
                            <div className="flex items-center gap-3 text-sm">
                              <div className="flex flex-col">
                                <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Products</span>
                                <span className="font-bold text-blue-600 text-lg">{data.launches}</span>
                              </div>
                              <div className="w-px h-8 bg-gray-100"></div>
                              <div className="flex flex-col">
                                <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Engagement</span>
                                <span className="font-bold text-green-600 text-lg">{data.avgEngagement}</span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="linear"
                    dataKey="launches"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 6, fill: '#2563eb', stroke: '#fff', strokeWidth: 3 }}
                    activeDot={{ r: 8, fill: '#2563eb', stroke: '#fff', strokeWidth: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 2. MARKET GAP FINDER - Where to Build */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Target className="w-6 h-6 text-gray-900" />
              Market Gap Analysis
            </h2>
            <p className="text-gray-500 mt-1 text-sm font-medium">
              Launch Volume vs. Demand (Avg Upvotes)
            </p>
          </div>
          <div className="p-6">
            <div className="h-[400px] md:h-[500px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 80, left: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    type="number"
                    dataKey="launchVolume"
                    name="Launch Volume"
                    stroke="#9ca3af"
                    label={{ value: 'Launch Volume (Competition) →', position: 'bottom', offset: 60, style: { fill: '#6b7280', fontWeight: 'bold' } }}
                  />
                  <YAxis
                    type="number"
                    dataKey="avgUpvotes"
                    name="Avg Upvotes"
                    stroke="#9ca3af"
                    label={{ value: '← Avg Upvotes (Demand)', angle: -90, position: 'left', offset: 60, style: { fill: '#6b7280', fontWeight: 'bold' } }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload[0]) {
                        const data = payload[0].payload as MarketGapMatrix;
                        return (
                          <div className="bg-white p-4 border-2 border-gray-200 rounded-lg shadow-xl">
                            <div className="font-bold text-gray-900 mb-2">{data.category}</div>
                            <div className="text-sm space-y-1">
                              <div>Launch Volume: <span className="font-semibold">{data.launchVolume}</span></div>
                              <div>Avg Upvotes: <span className="font-semibold">{data.avgUpvotes}</span></div>
                              <div>Quadrant: <span className="font-semibold capitalize">{data.quadrant.replace('-', ' ')}</span></div>
                              <div className="pt-2 border-t border-gray-200">
                                <span className="text-xs font-semibold text-green-600">Opportunity Score: {data.opportunityScore}</span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter data={marketGaps.slice(0, 30)}>
                    {marketGaps.slice(0, 30).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getQuadrantColor(entry.quadrant)} />
                    ))}
                  </Scatter>
                  {/* Reference lines for quadrants */}
                  <ReferenceLine x={marketGaps.length > 0 ? marketGaps.reduce((sum, m) => sum + m.launchVolume, 0) / marketGaps.length : 0} stroke="#9ca3af" strokeDasharray="5 5" />
                  <ReferenceLine y={marketGaps.length > 0 ? marketGaps.reduce((sum, m) => sum + m.avgUpvotes, 0) / marketGaps.length : 0} stroke="#9ca3af" strokeDasharray="5 5" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* Quadrant Breakdown Lists */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

              {/* Blue Ocean */}
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900">Blue Ocean</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">High Demand • Low Comp</span>
                  </div>
                  <span className="ml-auto bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">{quadrants['blue-ocean'].length}</span>
                </div>
                <div className="space-y-2">
                  {quadrants['blue-ocean'].map(item => (
                    <Link
                      href={`/desk/niche/${encodeURIComponent(item.category)}`}
                      key={item.category}
                      className="group flex items-center justify-between p-2 rounded hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
                    >
                      <span className="text-sm text-gray-700 font-medium group-hover:text-blue-600 truncate">{item.category}</span>
                      <TrendingUp className="w-3 h-3 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ))}
                  {quadrants['blue-ocean'].length === 0 && <div className="text-sm text-gray-400 italic">No categories found</div>}
                </div>
              </div>

              {/* Red Ocean */}
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900">Red Ocean</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">High Demand • High Comp</span>
                  </div>
                  <span className="ml-auto bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">{quadrants['red-ocean'].length}</span>
                </div>
                <div className="space-y-2">
                  {quadrants['red-ocean'].map(item => (
                    <Link
                      href={`/desk/niche/${encodeURIComponent(item.category)}`}
                      key={item.category}
                      className="group flex items-center justify-between p-2 rounded hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
                    >
                      <span className="text-sm text-gray-700 font-medium group-hover:text-blue-600 truncate">{item.category}</span>
                      <AlertCircle className="w-3 h-3 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ))}
                  {quadrants['red-ocean'].length === 0 && <div className="text-sm text-gray-400 italic">No categories found</div>}
                </div>
              </div>

              {/* Emerging */}
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900">Emerging</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">Low Demand • High Comp</span>
                  </div>
                  <span className="ml-auto bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full">{quadrants['emerging'].length}</span>
                </div>
                <div className="space-y-2">
                  {quadrants['emerging'].map(item => (
                    <Link
                      href={`/desk/niche/${encodeURIComponent(item.category)}`}
                      key={item.category}
                      className="group flex items-center justify-between p-2 rounded hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
                    >
                      <span className="text-sm text-gray-700 font-medium group-hover:text-blue-600 truncate">{item.category}</span>
                      <Zap className="w-3 h-3 text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ))}
                  {quadrants['emerging'].length === 0 && <div className="text-sm text-gray-400 italic">No categories found</div>}
                </div>
              </div>

              {/* Niche */}
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                  <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900">Niche</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">Low Demand • Low Comp</span>
                  </div>
                  <span className="ml-auto bg-gray-100 text-gray-700 text-xs font-bold px-2 py-0.5 rounded-full">{quadrants['niche'].length}</span>
                </div>
                <div className="space-y-2">
                  {quadrants['niche'].map(item => (
                    <Link
                      href={`/desk/niche/${encodeURIComponent(item.category)}`}
                      key={item.category}
                      className="group flex items-center justify-between p-2 rounded hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
                    >
                      <span className="text-sm text-gray-700 font-medium group-hover:text-blue-600 truncate">{item.category}</span>
                      <Box className="w-3 h-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ))}
                  {quadrants['niche'].length === 0 && <div className="text-sm text-gray-400 italic">No categories found</div>}
                </div>
              </div>

            </div>
          </div>
        </div>


      </div>
    </div>
  );
}
