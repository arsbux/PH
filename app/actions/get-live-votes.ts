'use server';

import { fetchLatestPosts } from '@/lib/producthunt-live';

export async function getLiveVotes() {
    try {
        const { products } = await fetchLatestPosts();

        return products.map(p => ({
            id: p.id,
            name: p.name,
            votes: p.votesCount,
            comments: p.commentsCount
        }));
    } catch (error) {
        console.error('Error fetching live votes:', error);
        return [];
    }
}
