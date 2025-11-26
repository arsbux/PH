'use client';

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart, ComposedChart } from 'recharts';
import { MarketGapAnalysis } from './MarketGapAnalysis';

interface MarketInsightsPanelProps {
    selectedCategory?: string;
}

type TimeRange = '7d' | '30d' | '90d' | '1y' | '2y';
type MetricType = 'launches' | 'engagement' | 'success' | 'revenue';

export function MarketInsightsPanel({ selectedCategory }: MarketInsightsPanelProps) {
    const [timeRange, setTimeRange] = useState<TimeRange>('30d');
    const [selectedMetric, setSelectedMetric] = useState<MetricType>('launches');
    const [showPredictions, setShowPredictions] = useState(true);

    // Mock data - replace with real database queries
    const categoryGrowthData = [
        { month: 'Jan', launches: 45, avgVotes: 120 },
        { month: 'Feb', launches: 52, avgVotes: 135 },
        { month: 'Mar', launches: 48, avgVotes: 128 },
        { month: 'Apr', launches: 61, avgVotes: 145 },
        { month: 'May', launches: 58, avgVotes: 152 },
        { month: 'Jun', launches: 67, avgVotes: 168 },
    ];

    const launchTimingData = [
        { time: '12 AM', success: 45 },
        { time: '3 AM', success: 78 },
        { time: '6 AM', success: 92 },
        { time: '9 AM', success: 65 },
        { time: '12 PM', success: 88 },
        { time: '3 PM', success: 72 },
        { time: '6 PM', success: 58 },
        { time: '9 PM', success: 51 },
    ];

    const competitorStrategies = [
        { name: 'Early Launch (12-6 AM PST)', count: 234, successRate: 78 },
        { name: 'Weekend Launch', count: 156, successRate: 65 },
        { name: 'Maker Engagement', count: 312, successRate: 82 },
        { name: 'Video Demo', count: 289, successRate: 75 },
        { name: 'Free Tier Offer', count: 401, successRate: 88 },
    ];

    const marketSegments = [
        { name: 'B2B SaaS', value: 3200, color: '#10b981' },
        { name: 'Consumer Apps', value: 2100, color: '#3b82f6' },
        { name: 'Dev Tools', value: 1800, color: '#8b5cf6' },
        { name: 'Design Tools', value: 1500, color: '#f59e0b' },
        { name: 'Other', value: 1905, color: '#6b7280' },
    ];

    const topPerformers = [
        { name: 'nao', votes: 345, comments: 93, engagement: 4.2, category: 'AI Tools' },
        { name: 'Hatable', values: 284, comments: 47, engagement: 3.8, category: 'Social' },
        { name: 'Claude Opus 4.5', votes: 232, comments: 38, engagement: 3.5, category: 'AI' },
    ];

    // Predictive data with forecasting
    const predictiveData = [
        { month: 'Jan', actual: 45, predicted: null, confidence: null },
        { month: 'Feb', actual: 52, predicted: null, confidence: null },
        { month: 'Mar', actual: 48, predicted: null, confidence: null },
        { month: 'Apr', actual: 61, predicted: null, confidence: null },
        { month: 'May', actual: 58, predicted: null, confidence: null },
        { month: 'Jun', actual: 67, predicted: null, confidence: null },
        { month: 'Jul', actual: null, predicted: 72, confidence: 85 },
        { month: 'Aug', actual: null, predicted: 78, confidence: 78 },
        { month: 'Sep', actual: null, predicted: 75, confidence: 72 },
    ];

    // Granular performance metrics
    const performanceMetrics = [
        { metric: 'Avg Time to 100 Votes', value: '4.2 hrs', trend: '+12%', good: true },
        { metric: 'Maker Response Rate', value: '78%', trend: '+5%', good: true },
        { metric: 'Weekend vs Weekday', value: '1.3x', trend: '-2%', good: false },
        { metric: 'Video Demo Impact', value: '+45%', trend: '+8%', good: true },
        { metric: 'First Comment Speed', value: '8 min', trend: '-15%', good: true },
        { metric: 'Hunter Influence', value: '2.1x', trend: '+3%', good: true },
    ];

    // Competitive benchmarking
    const benchmarkData = [
        { category: 'Your Product', votes: 156, comments: 42, engagement: 3.2, percentile: 65 },
        { category: 'Top 10%', votes: 280, comments: 78, engagement: 4.5, percentile: 90 },
        { category: 'Top 25%', votes: 195, comments: 52, engagement: 3.8, percentile: 75 },
        { category: 'Median', votes: 120, comments: 28, engagement: 2.5, percentile: 50 },
    ];

    // Expert insights
    const expertInsights = [
        {
            title: 'AI Tools Surge',
            insight: 'AI category grew 340% YoY. Products with "AI-powered" in tagline get 2.3x more votes.',
            confidence: 94,
            source: 'Analyzed 1,247 launches'
        },
        {
            title: 'Maker Engagement Critical',
            insight: 'Products where makers respond within 30min get 82% more upvotes.',
            confidence: 89,
            source: 'Based on 3,421 launches'
        },
        {
            title: 'Pricing Strategy',
            insight: 'Free tier + $29-49/mo paid plan has highest conversion (23% avg).',
            confidence: 91,
            source: 'Revenue data from 892 products'
        },
    ];

    return (
        <div className="space-y-6 p-6 bg-black">
            {/* Market Gap Analysis */}
            <MarketGapAnalysis />









        </div>
    );
}
