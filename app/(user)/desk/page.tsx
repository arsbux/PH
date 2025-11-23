'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Target,
  BarChart3,
  TrendingUp,
  AlertCircle,
  Zap,
  Box,
  MessageCircle,
  ArrowRight
} from 'lucide-react';
import {
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  Legend,
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
  getYesterdayLaunchesData,
  type MarketGapMatrix,
  type YesterdayData
} from '@/lib/charts-data';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [topCategories, setTopCategories] = useState<any[]>([]);
  const [marketGaps, setMarketGaps] = useState<MarketGapMatrix[]>([]);
  const [yesterdayData, setYesterdayData] = useState<YesterdayData | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [categories, gapData, yesterday] = await Promise.all([
        getTopCategories('launches'),
        getMarketGapMatrix(),
        getYesterdayLaunchesData()
      ]);

      // Sort categories alphabetically
      const sortedCategories = categories.sort((a, b) => a.category.localeCompare(b.category));

      setTopCategories(sortedCategories);
      setMarketGaps(gapData);
      setYesterdayData(yesterday);
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

        {/* YESTERDAY'S SNAPSHOT - BENTO GRID */}
        {yesterdayData && (
          <div className="space-y-6 mt-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Zap className="w-6 h-6 text-gray-900" />
                  Yesterday's Pulse
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Market activity from the last 24 hours
                </p>
              </div>
              <div className="flex gap-2">
                <div className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                  {yesterdayData.metrics.totalLaunches} Launches
                </div>
                <div className="px-3 py-1 bg-purple-50 rounded-full text-xs font-medium text-purple-700">
                  {yesterdayData.metrics.aiPercentage}% AI
                </div>
                <Link
                  href={`/desk/daily-analysis?date=${new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`}
                  className="px-4 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-gray-800 transition-colors flex items-center gap-1.5"
                >
                  View Full Analysis
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Chart Card - Takes up 4 columns */}
              <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col h-[600px]">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Category Split</h3>
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  <div className="space-y-5">
                    {yesterdayData.chartData.map((item, index) => {
                      const percentage = Math.round((item.value / yesterdayData.metrics.totalLaunches) * 100);
                      const yesterday = new Date();
                      yesterday.setDate(yesterday.getDate() - 1);
                      const dateStr = yesterday.toISOString().split('T')[0];

                      return (
                        <Link
                          key={index}
                          href={`/desk/daily-analysis?date=${dateStr}`}
                          className="block group cursor-pointer"
                        >
                          <div className="flex justify-between items-end mb-2">
                            <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
                              {item.name}
                            </span>
                            <span className="text-xs font-bold text-gray-900 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100 group-hover:bg-gray-100 transition-colors">
                              {percentage}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-1000 ease-out relative group-hover:opacity-80"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: item.color
                              }}
                            />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* List Card - Takes up 8 columns */}
              <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-[600px] overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                  <h3 className="text-lg font-bold text-gray-900">Top Performers</h3>
                  <div className="flex gap-2">
                    <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">Sorted by Upvotes</span>
                  </div>
                </div>
                <div className="overflow-y-auto flex-1 p-0 divide-y divide-gray-50 custom-scrollbar">
                  {yesterdayData.topLaunches.map((product, index) => (
                    <div key={index} className="p-5 hover:bg-gray-50/80 transition-all group">
                      <div className="flex items-start gap-5">
                        {/* Rank */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold border ${index === 0 ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                          index === 1 ? 'bg-gray-50 text-gray-700 border-gray-200' :
                            index === 2 ? 'bg-orange-50 text-orange-700 border-orange-100' :
                              'bg-white text-gray-400 border-gray-100'
                          }`}>
                          #{index + 1}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-4 mb-1">
                            <div className="flex items-center gap-3">
                              {product.thumbnail_url && (
                                <img
                                  src={product.thumbnail_url}
                                  alt={product.name}
                                  className="w-6 h-6 rounded-md object-cover"
                                />
                              )}
                              <h3 className="font-bold text-gray-900 text-base group-hover:text-blue-600 transition-colors truncate">
                                {product.name}
                              </h3>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1.5 text-sm font-bold text-gray-900 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                                ▲ {product.votes.toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <p className="text-sm text-gray-500 line-clamp-1 mb-2 pl-[36px]">
                            {product.tagline}
                          </p>

                          <div className="flex items-center gap-4 pl-[36px]">
                            <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
                              <MessageCircle className="w-3 h-3" />
                              {product.comments}
                            </span>
                            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                              {product.niche}
                            </span>
                            {product.website_url && (
                              <a
                                href={product.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-medium text-gray-400 hover:text-gray-900 ml-auto flex items-center gap-1 transition-colors"
                              >
                                Visit <ArrowRight className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TRENDS CHART */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-gray-900" />
                Category Volume
              </h3>
              <p className="text-sm text-gray-500 mt-1">Historical launch volume trends</p>
            </div>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={topCategories}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis
                  dataKey="category"
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  dataKey="launches" // Assuming 'launches' is the value for launches in topCategories
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dx={-10}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  itemStyle={{ color: '#111827', fontWeight: 600 }}
                  formatter={(value, name, props) => [`${value} launches`, props.payload.category]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="launches"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
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
                  {/* Quadrant Lines */}
                  <ReferenceLine x={50} stroke="#e5e7eb" strokeDasharray="3 3" />
                  <ReferenceLine y={50} stroke="#e5e7eb" strokeDasharray="3 3" />
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
