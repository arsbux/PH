/**
 * Whop SDK Wrapper
 * 
 * This file provides helper functions to interact with the Whop API
 * for membership verification, user data, and subscription management.
 */

const WHOP_API_BASE = 'https://api.whop.com/v2';

export interface WhopUser {
    id: string;
    email: string;
    username: string;
    profile_pic_url?: string;
}

export interface WhopMembership {
    id: string;
    user_id: string;
    product_id: string;
    plan_id: string;
    status: 'active' | 'past_due' | 'canceled' | 'trialing';
    created_at: string;
    expires_at: string | null;
}

/**
 * Check if a user has an active membership
 */
export async function hasActiveMembership(userId: string): Promise<boolean> {
    try {
        const membership = await getUserMembership(userId);
        return membership?.status === 'active' || membership?.status === 'trialing';
    } catch (error) {
        console.error('Error checking membership:', error);
        return false;
    }
}

/**
 * Get user's membership details
 */
export async function getUserMembership(userId: string): Promise<WhopMembership | null> {
    const apiKey = process.env.WHOP_API_KEY;

    if (!apiKey) {
        throw new Error('WHOP_API_KEY not configured');
    }

    try {
        const response = await fetch(`${WHOP_API_BASE}/memberships?user_id=${userId}`, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Whop API error: ${response.statusText}`);
        }

        const data = await response.json();

        // Return the first active membership for our product
        const membership = data.data?.find((m: WhopMembership) =>
            m.product_id === process.env.WHOP_PRODUCT_ID
        );

        return membership || null;
    } catch (error) {
        console.error('Error fetching membership:', error);
        return null;
    }
}

/**
 * Get user details from Whop
 */
export async function getWhopUser(userId: string): Promise<WhopUser | null> {
    const apiKey = process.env.WHOP_API_KEY;

    if (!apiKey) {
        throw new Error('WHOP_API_KEY not configured');
    }

    try {
        const response = await fetch(`${WHOP_API_BASE}/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Whop API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.data || null;
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
}

/**
 * Verify a Whop OAuth token
 */
export async function verifyWhopToken(token: string): Promise<WhopUser | null> {
    try {
        const response = await fetch(`${WHOP_API_BASE}/me`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        return data.data || null;
    } catch (error) {
        console.error('Error verifying token:', error);
        return null;
    }
}

/**
 * Generate Whop checkout URL with redirect
 */
export function getWhopCheckoutUrl(redirectUrl?: string): string {
    const productId = process.env.WHOP_PRODUCT_ID;

    if (!productId) {
        throw new Error('WHOP_PRODUCT_ID not configured');
    }

    // Whop checkout format: direct plan checkout URL
    let checkoutUrl = `https://whop.com/checkout/${productId}`;

    // Add redirect parameter if provided
    if (redirectUrl) {
        checkoutUrl += `?redirect_url=${encodeURIComponent(redirectUrl)}`;
    }

    return checkoutUrl;
}

/**
 * Generate Whop OAuth URL
 */
export function getWhopOAuthUrl(redirectUri: string): string {
    const clientId = process.env.WHOP_CLIENT_ID;

    if (!clientId) {
        throw new Error('WHOP_CLIENT_ID not configured');
    }

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'user:read memberships:read',
    });

    return `https://whop.com/oauth/authorize?${params.toString()}`;
}

/**
 * Exchange OAuth code for access token
 */
export async function exchangeCodeForToken(code: string, redirectUri: string): Promise<string | null> {
    const clientId = process.env.WHOP_CLIENT_ID;
    const clientSecret = process.env.WHOP_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error('Whop OAuth credentials not configured');
    }

    try {
        const response = await fetch('https://whop.com/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                code,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
            }),
        });

        if (!response.ok) {
            throw new Error(`Token exchange failed: ${response.statusText}`);
        }

        const data = await response.json();
        return data.access_token || null;
    } catch (error) {
        console.error('Error exchanging code for token:', error);
        return null;
    }
}
