'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CategoryProfileProps {
    categoryName: string;
    onBack?: () => void;
}

export function CategoryProfile({ categoryName, onBack }: CategoryProfileProps) {
    const router = useRouter();
    
    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.back();
        }
    };
    // Mock data - replace with real database queries
    const topProductsThisMonth = [
        { 
            name: 'CatDoes v3', 
            tagline: 'Team of AI agents building your software', 
            votes: 168, 
            comments: 16, 
            logo: '🤖',
            rank: 5
        },
        { 
            name: 'Speakmac', 
            tagline: 'The offline dictation tool for Mac', 
            votes: 161, 
            comments: 17, 
            logo: '🎤',
            rank: 6
        },
        { 
            name: 'Raydian', 
            tagline: 'The next frontier of AI reasoning', 
            votes: 163, 
            comments: 33, 
            logo: '⚡',
            rank: 7
        },
    ];

    const top10Products = [
        { name: 'CatDoes v3', tagline: 'Team of AI agents building your software', votes: 168, comments: 16, logo: '🤖', rank: 1 },
        { name: 'Speakmac', tagline: 'The offline dictation tool for Mac', votes: 161, comments: 17, logo: '🎤', rank: 2 },
        { name: 'Raydian', tagline: 'The next frontier of AI reasoning', votes: 163, comments: 33, logo: '⚡', rank: 3 },
        { name: 'Product Huntr', tagline: 'Use product hunt data to find ideas', votes: 145, comments: 8, logo: '🎯', rank: 4 },
        { name: 'Sketch Copenhagen', tagline: 'Liquid Glass redesign for modern teams', votes: 120, comments: 5, logo: '🎨', rank: 5 },
        { name: 'FlickNote - AI Voice', tagline: 'Speak your thoughts, AI does the rest', votes: 117, comments: 11, logo: '🎙️', rank: 6 },
        { name: 'Haxiom', tagline: 'Next-gen development platform', votes: 110, comments: 9, logo: '⚙️', rank: 7 },
        { name: 'DevTools Pro', tagline: 'Professional developer toolkit', votes: 98, comments: 7, logo: '🛠️', rank: 8 },
        { name: 'CodeMaster AI', tagline: 'AI-powered code generation', votes: 92, comments: 12, logo: '💻', rank: 9 },
        { name: 'BuildFast', tagline: 'Ship products 10x faster', votes: 87, comments: 6, logo: '🚀', rank: 10 },
    ];

    // Multi-product trendline data matching the screenshot
    const productTrendData = [
        { time: '50', catdoes: 60, speakmac: 58, raydian: 55, producthuntr: 52, sketch: 50, flicknote: 48, haxiom: 45 },
        { time: '75', catdoes: 75, speakmac: 72, raydian: 70, producthuntr: 68, sketch: 65, flicknote: 62, haxiom: 58 },
        { time: '100', catdoes: 95, speakmac: 90, raydian: 88, producthuntr: 85, sketch: 82, flicknote: 78, haxiom: 72 },
        { time: '125', catdoes: 115, speakmac: 108, raydian: 105, producthuntr: 100, sketch: 95, flicknote: 92, haxiom: 85 },
        { time: '150', catdoes: 145, speakmac: 135, raydian: 130, producthuntr: 118, sketch: 112, flicknote: 108, haxiom: 98 },
        { time: '175', catdoes: 168, speakmac: 161, raydian: 163, producthuntr: 145, sketch: 120, flicknote: 117, haxiom: 110 },
    ];

    const products = [
        { key: 'catdoes', name: 'CatDoes v3', color: '#ef4444', rank: 5 },
        { key: 'speakmac', name: 'Speakmac', color: '#f97316', rank: 6 },
        { key: 'raydian', name: 'Raydian', color: '#f59e0b', rank: 7 },
        { key: 'producthuntr', name: 'Product Huntr', color: '#eab308', rank: 8 },
        { key: 'sketch', name: 'Sketch Copenhagen', color: '#84cc16', rank: 9 },
        { key: 'flicknote', name: 'FlickNote - AI Voice', color: '#22d3ee', rank: 10 },
        { key: 'haxiom', name: 'Haxiom', color: '#6366f1', rank: 11 },
    ];

    const keywordData = [
        { keyword: 'AI-powered', correlation: 0.89, avgVotes: 245, count: 156 },
        { keyword: 'automation', correlation: 0.82, avgVotes: 198, count: 134 },
        { keyword: 'productivity', correlation: 0.76, avgVotes: 176, count: 189 },
        { keyword: 'open-source', correlation: 0.71, avgVotes: 165, count: 98 },
        { keyword: 'real-time', correlation: 0.68, avgVotes: 152, count: 112 },
    ];

    return (
        <div className="h-screen bg-[#0a0a0a] text-white flex flex-col overflow-hidden">
            {/* Header */}
            <header className="h-16 border-b border-white/10 bg-black/50 backdrop-blur-sm flex-shrink-0 z-50">
                <div className="h-full px-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 text-gray-400 hover:text-white transition"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span className="text-sm">Back</span>
                        </button>
                        <div className="h-6 w-px bg-white/10" />
                        <div>
                            <h1 className="text-lg font-bold text-white">{categoryName}</h1>
                        </div>
                    </div>
                    
                    <nav className="hidden md:flex items-center gap-6 text-sm">
                        <a href="#" className="text-white font-medium">Best</a>
                        <a href="#" className="text-gray-400 hover:text-white transition">Top</a>
                        <a href="#" className="text-gray-400 hover:text-white transition">Favorites</a>
                        <a href="#" className="text-gray-400 hover:text-white transition">Stats</a>
                    </nav>
                </div>
            </header>

            {/* 3-Column Layout */}
            <div className="flex-1 grid grid-cols-12 overflow-hidden">

                {/* Left Sidebar - Category Overview */}
                <aside className="col-span-3 border-r border-white/10 bg-black overflow-y-auto custom-scrollbar">
                    <div className="p-6">
                        {/* Category Header */}
                        <div className="mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-3xl mb-4">
                                🚀
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">{categoryName}</h2>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                Use product hunt data to find ideas and uncover hidden opportunities in this niche
                            </p>
                        </div>

                        {/* Category Description */}
                        <div className="mb-6">
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">About This Category</h3>
                            <p className="text-sm text-gray-300 leading-relaxed mb-4">
                                {categoryName} is one of the most active categories on Product Hunt, featuring innovative tools 
                                and platforms that help developers and teams build better products faster.
                            </p>
                            <p className="text-sm text-gray-300 leading-relaxed">
                                This niche has seen consistent growth with an average of 42 new launches per month, 
                                making it a competitive but rewarding space for new products.
                            </p>
                        </div>

                        {/* Key Stats */}
                        <div className="mb-6">
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Key Statistics</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between py-2 border-b border-white/5">
                                    <span className="text-sm text-gray-400">Total Products</span>
                                    <span className="text-sm font-semibold text-white">1,247</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-white/5">
                                    <span className="text-sm text-gray-400">Avg Upvotes</span>
                                    <span className="text-sm font-semibold text-white">156</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-white/5">
                                    <span className="text-sm text-gray-400">Monthly Launches</span>
                                    <span className="text-sm font-semibold text-white">42</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-white/5">
                                    <span className="text-sm text-gray-400">Success Rate</span>
                                    <span className="text-sm font-semibold text-emerald-400">68%</span>
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-sm text-gray-400">Competition Level</span>
                                    <span className="text-sm font-semibold text-orange-400">High</span>
                                </div>
                            </div>
                        </div>

                        {/* Featured on */}
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <div className="text-xs text-gray-400 mb-1">Product of the Day</div>
                            <div className="text-lg font-bold text-orange-400 mb-3">8th Place</div>
                            <div className="text-xs text-gray-400 mb-1">Featured on</div>
                            <div className="text-sm font-semibold text-white">November 25th, 2025</div>
                        </div>
                    </div>
                </aside>

                {/* Center Content - Charts */}
                <main className="col-span-6 bg-[#0a0a0a] overflow-y-auto custom-scrollbar">
                    <div className="p-6 space-y-6">

                        {/* Top 3 Products This Month */}
                        <div className="bg-black/20 border border-white/[0.08] rounded-xl p-6">
                            <div className="mb-5">
                                <h2 className="text-lg font-semibold text-white mb-1">Top 3 Products This Month</h2>
                                <p className="text-sm text-gray-400">Highest performing launches in {categoryName}</p>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                {topProductsThisMonth.map((product, index) => (
                                    <div
                                        key={product.name}
                                        className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition group"
                                    >
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-2xl flex-shrink-0">
                                                {product.logo}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                                        index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                                                        index === 1 ? 'bg-gray-400/20 text-gray-300' :
                                                        'bg-orange-500/20 text-orange-400'
                                                    }`}>
                                                        #{product.rank}
                                                    </span>
                                                </div>
                                                <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-orange-400 transition">
                                                    {product.name}
                                                </h3>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-400 mb-3 line-clamp-2">{product.tagline}</p>
                                        <div className="flex items-center gap-3 text-xs">
                                            <div className="flex items-center gap-1">
                                                <svg className="w-3.5 h-3.5 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                                </svg>
                                                <span className="text-white font-semibold">{product.votes}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                </svg>
                                                <span className="text-gray-300 font-medium">{product.comments}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Product Upvotes vs the next 3 - Multi-line Chart */}
                        <div className="bg-black/20 border border-white/[0.08] rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-white mb-1">Product upvotes vs the next 3</h2>
                                    <p className="text-sm text-gray-400">Real-time performance comparison</p>
                                </div>
                                <button className="p-2 hover:bg-white/5 rounded-lg transition text-gray-400 hover:text-white">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                    </svg>
                                </button>
                            </div>
                            <div style={{ height: '350px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={productTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                                        <defs>
                                            {products.map(product => (
                                                <linearGradient key={product.key} id={`gradient-${product.key}`} x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={product.color} stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor={product.color} stopOpacity={0}/>
                                                </linearGradient>
                                            ))}
                                        </defs>
                                        <CartesianGrid 
                                            strokeDasharray="3 3" 
                                            stroke="#ffffff" 
                                            vertical={false} 
                                            strokeOpacity={0.05}
                                        />
                                        <XAxis 
                                            dataKey="time" 
                                            stroke="transparent"
                                            fontSize={11}
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fill: '#666' }}
                                        />
                                        <YAxis 
                                            orientation="right"
                                            stroke="transparent"
                                            fontSize={14}
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fill: '#888', fontWeight: 700 }}
                                            width={45}
                                            domain={[40, 180]}
                                        />
                                        <Tooltip
                                            contentStyle={{ 
                                                backgroundColor: '#0a0a0a', 
                                                border: '1px solid rgba(255,255,255,0.1)', 
                                                borderRadius: '8px',
                                                padding: '8px 12px'
                                            }}
                                            labelStyle={{ color: '#999', fontSize: '11px' }}
                                        />
                                        {products.map(product => (
                                            <Line
                                                key={product.key}
                                                type="monotone"
                                                dataKey={product.key}
                                                stroke={product.color}
                                                strokeWidth={2.5}
                                                dot={false}
                                                activeDot={{ r: 5, fill: product.color, stroke: '#000', strokeWidth: 2 }}
                                            />
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                            {/* Product Legend */}
                            <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
                                {products.map(product => (
                                    <button
                                        key={product.key}
                                        className="px-3 py-1.5 rounded-lg border transition hover:bg-white/5"
                                        style={{ 
                                            borderColor: product.color,
                                            backgroundColor: `${product.color}15`
                                        }}
                                    >
                                        <span className="text-xs font-medium" style={{ color: product.color }}>
                                            {product.name} {product.rank}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Keyword Correlation */}
                        <div className="bg-black/20 border border-white/[0.08] rounded-xl p-6">
                            <div className="mb-4">
                                <h2 className="text-lg font-semibold text-white mb-1">High-Impact Keywords</h2>
                                <p className="text-sm text-gray-400">Keywords in descriptions that correlate with higher upvotes</p>
                            </div>
                            <div className="space-y-3">
                                {keywordData.map((keyword, index) => (
                                    <div key={keyword.keyword} className="flex items-center gap-4">
                                        <div className="w-8 text-center">
                                            <span className={`text-sm font-bold ${
                                                index < 3 ? 'text-emerald-400' : 'text-gray-500'
                                            }`}>
                                                {index + 1}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-medium text-white">{keyword.keyword}</span>
                                                    <span className="text-xs text-gray-500">({keyword.count} products)</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-xs text-gray-400">Avg: <span className="text-white font-semibold">{keyword.avgVotes}</span> votes</span>
                                                    <span className="text-xs font-semibold text-emerald-400">
                                                        {(keyword.correlation * 100).toFixed(0)}% correlation
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="w-full bg-white/5 rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-2 rounded-full transition-all"
                                                    style={{ width: `${keyword.correlation * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </main>

                {/* Right Sidebar - Top 10 Products */}
                <aside className="col-span-3 border-l border-white/10 bg-black overflow-y-auto custom-scrollbar">
                    <div className="p-4">
                        <div className="mb-4">
                            <h3 className="text-sm font-semibold text-white mb-1">Top 10 Products</h3>
                            <p className="text-xs text-gray-400">Best performing in {categoryName}</p>
                        </div>
                        <div className="space-y-2">
                            {top10Products.map((product) => (
                                <div
                                    key={product.name}
                                    className="bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 hover:border-white/20 transition group cursor-pointer"
                                >
                                    <div className="flex items-start gap-3 mb-2">
                                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-xl flex-shrink-0">
                                            {product.logo}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                                    product.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                                                    product.rank === 2 ? 'bg-gray-400/20 text-gray-300' :
                                                    product.rank === 3 ? 'bg-orange-500/20 text-orange-400' :
                                                    'bg-white/10 text-gray-400'
                                                }`}>
                                                    #{product.rank}
                                                </span>
                                            </div>
                                            <h4 className="text-sm font-semibold text-white group-hover:text-orange-400 transition">
                                                {product.name}
                                            </h4>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400 mb-2 line-clamp-2 leading-relaxed">{product.tagline}</p>
                                    <div className="flex items-center gap-3 text-xs">
                                        <div className="flex items-center gap-1">
                                            <svg className="w-3.5 h-3.5 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                            </svg>
                                            <span className="text-white font-semibold">{product.votes}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                            <span className="text-gray-300 font-medium">{product.comments}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
