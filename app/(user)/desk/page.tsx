'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Target,
  Sparkles,
  ArrowRight
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
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from 'recharts';
import {
  getTopicVelocity,
  getMarketGapMatrix,
  type TopicVelocityData,
  type MarketGapMatrix
} from '@/lib/charts-data';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [topicVelocity, setTopicVelocity] = useState<TopicVelocityData[]>([]);
  const [marketGaps, setMarketGaps] = useState<MarketGapMatrix[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [velocityData, gapData] = await Promise.all([
        getTopicVelocity(12),
        getMarketGapMatrix()
      ]);

      setTopicVelocity(velocityData);
      setMarketGaps(gapData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
    setLoading(false);
  };

  // Prepare line chart data for velocity
  const prepareVelocityChartData = () => {
    if (topicVelocity.length === 0) return [];

    const allMonths = new Set<string>();
    topicVelocity.forEach((topic: TopicVelocityData) => {
      topic.timeSeriesData.forEach(d => allMonths.add(d.month));
    });

    const sortedMonths = Array.from(allMonths).sort();

    return sortedMonths.map(month => {
      const dataPoint: any = { month: month.substring(5) };
      topicVelocity.slice(0, 5).forEach((topic: TopicVelocityData) => {
        const monthData = topic.timeSeriesData.find(d => d.month === month);
        dataPoint[topic.topic] = monthData?.launchCount || 0;
      });
      return dataPoint;
    });
  };

  const velocityChartData = prepareVelocityChartData();
  const topicColors = ['#3b82f6', '#10b981', '#f97316', '#8b5cf6', '#ef4444'];

  const getQuadrantColor = (quadrant: string) => {
    switch (quadrant) {
      case 'blue-ocean': return '#10b981'; // Green
      case 'red-ocean': return '#ef4444'; // Red
      case 'emerging': return '#f59e0b'; // Yellow
      case 'niche': return '#9ca3af'; // Gray
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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

        {/* 1. TOPIC/TAG VELOCITY - What's Trending */}
        {/* 1. TOPIC/TAG VELOCITY - What's Trending */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-gray-900" />
                Topic Velocity
              </h2>
              <p className="text-gray-500 mt-1 text-sm font-medium">
                Launch frequency trends (Last 12 Months)
              </p>
            </div>
            <div className="flex gap-2">
              {topicVelocity.slice(0, 3).map((topic, i) => (
                <div key={topic.topic} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 border border-gray-100">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: topicColors[i] }}></div>
                  <span className="text-xs font-medium text-gray-600">{topic.topic}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={velocityChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      padding: '12px'
                    }}
                    itemStyle={{ fontSize: '12px', fontWeight: 500 }}
                    labelStyle={{ color: '#9ca3af', marginBottom: '8px', fontSize: '11px' }}
                  />
                  {topicVelocity.slice(0, 5).map((topic: TopicVelocityData, index: number) => (
                    <Line
                      key={topic.topic}
                      type="monotone"
                      dataKey={topic.topic}
                      stroke={topicColors[index]}
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                      strokeOpacity={0.9}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Minimalist Trend Cards */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
              {topicVelocity.slice(0, 5).map((topic: TopicVelocityData, index: number) => {
                const growthRate = Math.round(((topic.timeSeriesData.slice(-1)[0]?.launchCount || 0) / (topic.timeSeriesData[0]?.launchCount || 1) - 1) * 100);
                const isPositive = growthRate > 0;

                return (
                  <Link
                    key={topic.topic}
                    href={`/desk/niche/${encodeURIComponent(topic.topic)}`}
                    className="group p-4 rounded-xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: topicColors[index] }}></div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {isPositive ? '+' : ''}{growthRate}%
                      </span>
                    </div>
                    <div className="text-sm font-bold text-gray-900 mb-1 truncate group-hover:text-blue-600 transition-colors">
                      {topic.topic}
                    </div>
                    <div className="text-xs text-gray-400 font-medium">
                      {topic.totalLaunches} launches
                    </div>
                  </Link>
                );
              })}
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
            <ResponsiveContainer width="100%" height={500}>
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

            {/* Quadrant Legend */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="font-semibold text-gray-900 text-sm">Blue Ocean</span>
                </div>
                <p className="text-xs text-gray-500">Low competition, High demand</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="font-semibold text-gray-900 text-sm">Red Ocean</span>
                </div>
                <p className="text-xs text-gray-500">High competition, High demand</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="font-semibold text-gray-900 text-sm">Emerging</span>
                </div>
                <p className="text-xs text-gray-500">High competition, Low demand</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                  <span className="font-semibold text-gray-900 text-sm">Niche</span>
                </div>
                <p className="text-xs text-gray-500">Low competition, Low demand</p>
              </div>
            </div>

            {/* Top Blue Ocean Opportunities */}
            <div className="mt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">🎯 Top Blue Ocean Opportunities</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {marketGaps.filter(m => m.quadrant === 'blue-ocean').slice(0, 3).map((gap, index) => (
                  <Link
                    key={gap.category}
                    href={`/desk/niche/${encodeURIComponent(gap.category)}`}
                    className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-gray-900">#{index + 1} Opportunity</span>
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                    <div className="text-lg font-bold text-gray-900 mb-1 truncate">{gap.category}</div>
                    <div className="text-xs text-gray-500">
                      {gap.launchVolume} products  • {gap.avgUpvotes} avg upvotes
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}
