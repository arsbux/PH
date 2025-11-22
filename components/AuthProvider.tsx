'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    // Define which routes require authentication
    const protectedRoutes = ['/desk', '/admin'];
    const isProtected = protectedRoutes.some(route => pathname?.startsWith(route));

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      // ONLY redirect if on a protected route without a session
      if (mounted && !session && isProtected) {
        router.push('/login?next=' + pathname);
      }
      if (mounted) {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Only redirect on sign out
      if (mounted && event === 'SIGNED_OUT' && isProtected) {
        router.push('/login');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-neutral-400">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
