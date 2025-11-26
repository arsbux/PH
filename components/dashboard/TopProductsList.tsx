import React from 'react';
import { ArrowUp, MessageSquare, Zap } from 'lucide-react';

interface Product {
    id: string;
    rank: number;
    name: string;
    votes: number;
    comments: number;
    velocity: number;
    thumbnail_url?: string;
    description: string;
}

interface TopProductsListProps {
    products: Product[];
}

export function TopProductsList({ products }: TopProductsListProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-200">Top 10 products</h2>
                <span className="text-xs text-gray-500 uppercase tracking-wider">By rank ↓</span>
            </div>

            <div className="flex items-center justify-between px-2 text-xs text-gray-500 mb-2">
                <span>Product</span>
                <div className="flex gap-4">
                    <ArrowUp className="w-3 h-3" />
                    <MessageSquare className="w-3 h-3" />
                    <Zap className="w-3 h-3" />
                </div>
            </div>

            <div className="space-y-2">
                {products.map((product) => (
                    <div
                        key={product.id}
                        className="group relative flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-transparent hover:border-white/10 cursor-pointer"
                    >
                        {/* Rank */}
                        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-orange-500 to-purple-600 rounded-r opacity-0 group-hover:opacity-100 transition-opacity" />

                        <span className="text-xs font-mono text-gray-500 w-4">{product.rank}</span>

                        {/* Icon */}
                        <div className="w-8 h-8 rounded-lg bg-gray-800 overflow-hidden flex-shrink-0">
                            {product.thumbnail_url ? (
                                <img src={product.thumbnail_url} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-600">
                                    {product.name[0]}
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-200 truncate">{product.name}</h3>
                            <p className="text-xs text-gray-500 truncate">{product.description}</p>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-xs font-mono">
                            <span className="text-white font-bold w-8 text-right">{product.votes}</span>
                            <span className="text-gray-400 w-6 text-right">{product.comments}</span>
                            <span className="text-gray-600 w-6 text-right">{product.velocity}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
