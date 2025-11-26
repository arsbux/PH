'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendlineData } from '@/lib/vote-snapshots';
import { useDashboard } from './DashboardContext';

interface Product {
    id: string;
    name: string;
    votes_count: number;
    comments_count: number;
}

interface TrendChartProps {
    products: Product[];
    displayDate: Date;
    trendlineData: TrendlineData[]; // Real historical data
}

const CHART_COLORS = [
    '#3b82f6', // blue
    '#a855f7', // purple
    '#f59e0b', // amber
    '#10b981', // emerald
    '#ef4444', // red
    '#8b5cf6', // violet
    '#06b6d4', // cyan
    '#f97316', // orange
    '#ec4899', // pink
    '#14b8a6'  // teal
];

// Custom tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
                <p className="text-xs text-gray-400 mb-2">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-white font-medium">{entry.name}:</span>
                        <span className="text-gray-300">{entry.value} votes</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

// Helper to get midnight PST for today
function getMidnightPST(): Date {
    const now = new Date();
    // Convert to PST (UTC-8 or UTC-7 for PDT)
    const pstOffset = -8 * 60; // PST is UTC-8
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const pstTime = new Date(utc + (pstOffset * 60000));

    // Set to midnight
    pstTime.setHours(0, 0, 0, 0);

    // Convert back to local time
    return new Date(pstTime.getTime() - (pstOffset * 60000) + (now.getTimezoneOffset() * 60000));
}

// Generate time points from midnight PST to current time
function generateTimeAxis(): { time: string; hour: number }[] {
    const midnightPST = getMidnightPST();
    const now = new Date();
    const points: { time: string; hour: number }[] = [];

    // Generate points from midnight to current time every 30 minutes
    let current = new Date(midnightPST);

    while (current <= now) {
        const hours = current.getHours();
        const minutes = current.getMinutes();
        const timeStr = `${hours}:${minutes.toString().padStart(2, '0')}`;
        const hourDecimal = hours + (minutes / 60);

        points.push({ time: timeStr, hour: hourDecimal });

        // Increment by 30 minutes
        current = new Date(current.getTime() + (30 * 60 * 1000));
    }

    // Add current time if not already included
    const nowStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    if (points.length === 0 || points[points.length - 1].time !== nowStr) {
        points.push({
            time: nowStr,
            hour: now.getHours() + (now.getMinutes() / 60)
        });
    }

    return points;
}

export function TrendChart({ displayDate }: { displayDate: Date }) {
    const { products, setProducts, chartColors: CHART_COLORS, trendlineData } = useDashboard();
    const [isLive, setIsLive] = React.useState(true);
    const [hiddenProducts, setHiddenProducts] = React.useState<Set<string>>(new Set());
    const [liveChartData, setLiveChartData] = useState<any[]>([]);

    const toggleProduct = (productId: string) => {
        setHiddenProducts(prev => {
            const newSet = new Set(prev);
            if (newSet.has(productId)) {
                newSet.delete(productId);
            } else {
                newSet.add(productId);
            }
            return newSet;
        });
    };

    // Poll for live updates every 30 seconds
    useEffect(() => {
        const fetchAndUpdateData = async () => {
            try {
                // Generate time axis from midnight PST to now
                const timeAxis = generateTimeAxis();

                // Fetch live votes from API
                const response = await fetch('/api/live-votes');
                if (!response.ok) throw new Error('Failed to fetch live votes');

                const data = await response.json();
                const liveProducts = data.products || [];

                // Create chart data with time axis
                const enrichedData = timeAxis.map(point => {
                    const dataPoint: any = { time: point.time, hour: point.hour };

                    // For each product, add current vote count
                    // In production, you'd interpolate based on launch time
                    products.forEach(product => {
                        const liveProduct = liveProducts.find((p: any) => p.id === product.id);
                        dataPoint[product.name] = liveProduct?.votes || product.votes_count || 0;
                        dataPoint[`${product.name}_comments`] = liveProduct?.comments || product.comments_count || 0;
                    });

                    return dataPoint;
                });

                setLiveChartData(enrichedData);

                // Update products with latest votes
                if (liveProducts.length > 0) {
                    setProducts(products.map(p => {
                        const update = liveProducts.find((lp: any) => lp.id === p.id);
                        return update ? { ...p, votes_count: update.votes, comments_count: update.comments } : p;
                    }));
                }
            } catch (error) {
                console.error('Error fetching live data:', error);
            }
        };

        // Initial fetch
        fetchAndUpdateData();

        // Poll every 30 seconds
        const interval = setInterval(fetchAndUpdateData, 30000);

        return () => clearInterval(interval);
    }, [products, setProducts]);

    // Use live data if available, fallback to trendline data
    const chartData = liveChartData.length > 0 ? liveChartData : trendlineData;

    const [viewMode, setViewMode] = React.useState<'trendlines' | 'velocity' | 'comments'>('trendlines');

    // Calculate velocity data (votes per hour)
    const velocityData = React.useMemo(() => {
        if (!chartData || chartData.length < 2) return [];

        return chartData.map((point, i) => {
            if (i === 0) {
                const velocityPoint: any = { ...point };
                products.forEach(p => velocityPoint[p.name] = 0);
                return velocityPoint;
            }

            const prevPoint = chartData[i - 1];
            const velocityPoint: any = { ...point };

            products.forEach(p => {
                const current = (point[p.name] as number) || 0;
                const prev = (prevPoint[p.name] as number) || 0;
                velocityPoint[p.name] = Math.max(0, current - prev);
            });

            return velocityPoint;
        });
    }, [chartData, products]);

    // Calculate comments data
    const commentsData = React.useMemo(() => {
        if (!chartData) return [];
        return chartData.map(point => {
            const commentPoint: any = { time: point.time, hour: point.hour };
            products.forEach(p => {
                commentPoint[p.name] = point[`${p.name}_comments`] || 0;
            });
            return commentPoint;
        });
    }, [chartData, products]);

    const activeData = React.useMemo(() => {
        switch (viewMode) {
            case 'velocity': return velocityData;
            case 'comments': return commentsData;
            default: return chartData || [];
        }
    }, [viewMode, chartData, velocityData, commentsData]);

    const hasData = activeData.length > 0;

    return (
        <div className="p-6">
            {/* Header Controls */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">Today's top 10 products</h2>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-black/40 rounded-full px-3 py-1.5 border border-white/10">
                        <div className={`w-2 h-2 rounded-full ${viewMode === 'trendlines' ? 'bg-white' : 'bg-white/30'}`} />
                        <button
                            onClick={() => setViewMode('trendlines')}
                            className={`text-xs font-medium transition-colors ${viewMode === 'trendlines' ? 'text-white' : 'text-gray-400 hover:text-gray-300'}`}
                        >
                            Trendlines
                        </button>
                    </div>
                    <div className="flex items-center gap-2 bg-black/40 rounded-full px-3 py-1.5 border border-white/10">
                        <div className={`w-2 h-2 rounded-full ${viewMode === 'velocity' ? 'bg-white' : 'bg-white/30'}`} />
                        <button
                            onClick={() => setViewMode('velocity')}
                            className={`text-xs font-medium transition-colors ${viewMode === 'velocity' ? 'text-white' : 'text-gray-400 hover:text-gray-300'}`}
                        >
                            Time
                        </button>
                    </div>
                    <button className="p-2 hover:bg-white/5 rounded-lg transition text-gray-400 hover:text-white">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Main Chart */}
            <div className="relative bg-black/20 border border-white/[0.08] rounded-xl p-6 mb-6" style={{ height: '400px' }}>
                {!hasData ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <div className="w-16 h-16 mb-4 rounded-full bg-white/5 flex items-center justify-center">
                            <svg className="w-8 h-8 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <p className="text-sm font-medium text-gray-400">Waiting for data...</p>
                        <p className="text-xs text-gray-600 mt-1">Snapshots run every 5 minutes</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={activeData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                            <CartesianGrid
                                strokeDasharray="5 5"
                                stroke="#ffffff"
                                vertical={false}
                                strokeOpacity={0.08}
                            />
                            <XAxis
                                dataKey="time"
                                stroke="transparent"
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: '#666' }}
                                dy={8}
                            />
                            <YAxis
                                yAxisId="left"
                                orientation="right"
                                stroke="transparent"
                                fontSize={15}
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: '#888', fontWeight: 700 }}
                                width={45}
                                domain={[0, 'auto']}
                                dx={-5}
                            />
                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={{ stroke: '#ffffff10', strokeWidth: 1 }}
                            />
                            {products.slice(0, 10).map((product, index) => (
                                <Line
                                    key={product.id}
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey={product.name}
                                    hide={hiddenProducts.has(product.id)}
                                    stroke={CHART_COLORS[index]}
                                    strokeWidth={2.5}
                                    dot={false}
                                    activeDot={{ r: 5, fill: CHART_COLORS[index], stroke: '#000', strokeWidth: 2 }}
                                    animationDuration={800}
                                    animationEasing="ease-in-out"
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Product Legend Chips */}
            <div className="flex flex-wrap gap-2">
                {products.map((product, index) => {
                    const isHidden = hiddenProducts.has(product.id);
                    return (
                        <button
                            key={product.id}
                            onClick={() => toggleProduct(product.id)}
                            className={`group flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${isHidden
                                ? 'border-white/10 bg-transparent opacity-40 hover:opacity-60'
                                : 'border-white/20 bg-white/5 hover:bg-white/10'
                                }`}
                            style={{
                                borderColor: isHidden ? undefined : CHART_COLORS[index] + '40',
                                backgroundColor: isHidden ? undefined : CHART_COLORS[index] + '10'
                            }}
                        >
                            <span className={`text-xs font-medium transition-colors ${isHidden ? 'text-gray-500' : 'text-gray-200'}`}>
                                {product.name}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
