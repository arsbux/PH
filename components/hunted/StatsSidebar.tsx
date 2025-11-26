import React from 'react';
import { ArrowUp, MessageCircle, Flame, Clock } from 'lucide-react';

interface StatsSidebarProps {
    totalVotes: number;
    totalComments: number;
    topProduct: string;
    mostPopularTopic: string;
    featuredToday: number;
}

export function StatsSidebar({ totalVotes, totalComments, topProduct, mostPopularTopic, featuredToday }: StatsSidebarProps) {
    return (
        <div className="p-4">
            <h2 className="text-sm font-semibold text-gray-300 mb-4">Today's top 10 stats</h2>

            <div className="space-y-3">
                {/* Most Upvotes */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
                        <span className="uppercase tracking-wider flex items-center gap-1">
                            <ArrowUp className="w-3 h-3" />
                            Most upvotes
                        </span>
                    </div>
                    <div className="text-2xl font-bold text-white">{Math.max(...[totalVotes / 10 || 0])}</div>
                </div>

                {/* Upvotes Asked */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
                        <span className="uppercase tracking-wider flex items-center gap-1">
                            <ArrowUp className="w-3 h-3" />
                            Upvotes asked
                        </span>
                        <span className="text-orange-500">ⓘ</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{Math.round(totalVotes / 24)} u/h</div>
                </div>

                {/* Total Upvotes */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
                        <span className="uppercase tracking-wider flex items-center gap-1">
                            <ArrowUp className="w-3 h-3" />
                            Total upvotes
                        </span>
                    </div>
                    <div className="text-2xl font-bold text-white">{totalVotes}</div>
                </div>

                {/* Most Comments */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
                        <span className="uppercase tracking-wider flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            Most comments
                        </span>
                    </div>
                    <div className="text-2xl font-bold text-white">{Math.max(...[totalComments / 10 || 0])}</div>
                </div>

                {/* Total Comments */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
                        <span className="uppercase tracking-wider flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            Total comments
                        </span>
                    </div>
                    <div className="text-2xl font-bold text-white">{totalComments}</div>
                </div>

                {/* #1 Product */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <div className="text-[10px] text-gray-500 mb-1 uppercase tracking-wider flex items-center gap-1">
                        <Flame className="w-3 h-3" />
                        #1 replied to #1
                    </div>
                    <div className="text-sm font-bold text-white truncate">{topProduct}</div>
                </div>

                {/* Featured Today */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <div className="text-[10px] text-gray-500 mb-1 uppercase tracking-wider flex items-center gap-1">
                        <Flame className="w-3 h-3" />
                        Featured today
                    </div>
                    <div className="text-2xl font-bold text-white">{featuredToday}</div>
                </div>

                {/* Retrieved Today */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <div className="text-[10px] text-gray-500 mb-1 uppercase tracking-wider flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Retrieved today
                    </div>
                    <div className="text-2xl font-bold text-white">0</div>
                </div>

                {/* Most Popular Topic */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <div className="text-[10px] text-gray-500 mb-2 text-center uppercase tracking-wider">
                        Most popular topic
                    </div>
                    <div className="text-lg font-bold text-center text-white">
                        {mostPopularTopic}
                    </div>
                </div>

                {/* Sponsored Card */}
                <div className="mt-6 bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                            <span className="font-bold text-white text-sm">MP</span>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-white mb-1">MarketPulse Pro</h4>
                            <p className="text-xs text-blue-200 leading-relaxed">
                                Get real-time analytics and trend predictions. <span className="text-blue-300 underline cursor-pointer">Learn more →</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
