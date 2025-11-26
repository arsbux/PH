/**
 * Product Hunt Live API Client
 * Fetches real-time data directly from Product Hunt GraphQL API
 */

const PH_API_URL = 'https://api.producthunt.com/v2/api/graphql';

export interface PHProduct {
  id: string;
  name: string;
  tagline: string;
  description: string;
  votesCount: number;
  commentsCount: number;
  createdAt: string;
  website: string;
  url: string;
  thumbnail?: {
    url: string;
  };
  topics: Array<{
    name: string;
  }>;
  makers: Array<{
    name: string;
    username: string;
  }>;
}

/**
 * Fetch today's top posts from Product Hunt
 */
export async function fetchTodaysPosts(): Promise<PHProduct[]> {
  const token = process.env.PRODUCT_HUNT_API_TOKEN;

  if (!token) {
    console.error('PRODUCT_HUNT_API_TOKEN not found in environment');
    return [];
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const query = `
    query($postedAfter: DateTime!) {
      posts(order: VOTES, postedAfter: $postedAfter, first: 40) {
        edges {
          node {
            id
            name
            tagline
            description
            votesCount
            commentsCount
            createdAt
            website
            url
            thumbnail {
              url
            }
            topics {
              edges {
                node {
                  name
                }
              }
            }
            makers {
              name
              username
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(PH_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: {
          postedAfter: today.toISOString(),
        },
      }),
      next: { revalidate: 60 } // Cache for 1 minute
    });

    if (!response.ok) {
      throw new Error(`Product Hunt API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      return [];
    }

    return data.data.posts.edges.map((edge: any) => ({
      id: edge.node.id,
      name: edge.node.name,
      tagline: edge.node.tagline,
      description: edge.node.description || '',
      votesCount: edge.node.votesCount || 0,
      commentsCount: edge.node.commentsCount || 0,
      createdAt: edge.node.createdAt,
      website: edge.node.website || '',
      url: edge.node.url,
      thumbnail: edge.node.thumbnail,
      topics: edge.node.topics?.edges?.map((t: any) => ({ name: t.node.name })) || [],
      makers: edge.node.makers || [],
    }));
  } catch (error) {
    console.error('Error fetching from Product Hunt:', error);
    return [];
  }
}

/**
 * Fetch posts from a specific date
 */
export async function fetchPostsForDate(date: Date): Promise<PHProduct[]> {
  const token = process.env.PRODUCT_HUNT_API_TOKEN;

  if (!token) {
    console.error('PRODUCT_HUNT_API_TOKEN not found');
    return [];
  }

  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);

  const query = `
    query($postedAfter: DateTime!, $postedBefore: DateTime!) {
      posts(order: VOTES, postedAfter: $postedAfter, postedBefore: $postedBefore, first: 40) {
        edges {
          node {
            id
            name
            tagline
            description
            votesCount
            commentsCount
            createdAt
            website
            url
            thumbnail {
              url
            }
            topics {
              edges {
                node {
                  name
                }
              }
            }
            makers {
              name
              username
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(PH_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: {
          postedAfter: startDate.toISOString(),
          postedBefore: endDate.toISOString(),
        },
      }),
      next: { revalidate: 300 } // Cache for 5 minutes for historical data
    });

    if (!response.ok) {
      throw new Error(`Product Hunt API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      return [];
    }

    return data.data.posts.edges.map((edge: any) => ({
      id: edge.node.id,
      name: edge.node.name,
      tagline: edge.node.tagline,
      description: edge.node.description || '',
      votesCount: edge.node.votesCount || 0,
      commentsCount: edge.node.commentsCount || 0,
      createdAt: edge.node.createdAt,
      website: edge.node.website || '',
      url: edge.node.url,
      thumbnail: edge.node.thumbnail,
      topics: edge.node.topics?.edges?.map((t: any) => ({ name: t.node.name })) || [],
      makers: edge.node.makers || [],
    }));
  } catch (error) {
    console.error('Error fetching from Product Hunt:', error);
    return [];
  }
}

/**
 * Fetch posts from the latest available date (today, or fallback to yesterday if empty)
 * This ensures we always show data even if it's early morning
 */
export async function fetchLatestPosts(): Promise<{ products: PHProduct[], date: Date }> {
  // Try up to 3 days back
  for (let daysBack = 0; daysBack < 3; daysBack++) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - daysBack);

    const products = await fetchPostsForDate(targetDate);

    // If we found products, return them with the date
    if (products.length > 0) {
      console.log(`Found ${products.length} products from ${targetDate.toLocaleDateString()}`);
      return { products, date: targetDate };
    }
  }

  // No data found in last 3 days, return empty
  return { products: [], date: new Date() };
}
