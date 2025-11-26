import React from 'react';
import { ArrowUp, MessageSquare, ExternalLink } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    tagline: string;
    votes_count: number;
    comments_count: number;
    thumbnail_url?: string;
    ph_url: string;
    niche?: string;
}

interface TopProductsListProps {
    products: Product[];
    title?: string;
}

export function TopProductsList({ products, title = "Today's Top Launches" }: TopProductsListProps) {
    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-200">{title}</h3>
                <span className="text-xs text-gray-500 uppercase tracking-wider">Top {products.length}</span>
            </div>

            <div className="space-y-3">
                {products.map((product, index) => (
                    <a
                        key={product.id}
                        href={product.ph_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-orange-500/30 transition-all"
                    >
                        {/* Rank Badge */}
                        <div className="flex-shrink-0">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${index === 0
                                    ? 'bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/20'
                                    : 'bg-gray-800 text-gray-400'
                                }`}>
                                #{index + 1}
                            </div>
                        </div>

                        {/* Thumbnail */}
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-800 overflow-hidden">
                            {product.thumbnail_url ? (
                                <img
                                    src={product.thumbnail_url}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-sm font-bold text-gray-600">
                                    {product.name[0]}
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-gray-200 truncate">{product.name}</h4>
                                <ExternalLink className="w-3 h-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-1">{product.tagline}</p>
                            {product.niche && (
                                <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-orange-500/10 text-orange-400 rounded border border-orange-500/20">
                                    {product.niche}
                                </span>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1 text-gray-400">
                                <ArrowUp className="w-4 h-4" />
                                <span className="font-mono font-semibold">{product.votes_count}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-500">
                                <MessageSquare className="w-4 h-4" />
                                <span className="font-mono">{product.comments_count}</span>
                            </div>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}
