'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Zap, ArrowRight, Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage('Account created! Signing you in...');
        // Auto sign in after sign up if possible, or just let them know
        setTimeout(() => {
          // Attempt login immediately after signup for smoother UX if email confirmation isn't strictly enforced blocking
          handleLoginDirect();
        }, 1000);
      } else {
        await handleLoginDirect();
      }
    } catch (error: any) {
      setMessage(error.message);
      setLoading(false);
    }
  }

  async function handleLoginDirect() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    window.location.href = '/desk';
  }

  async function handleGoogleLogin() {
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/desk`,
      },
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA]">
      <div className="w-full max-w-[400px] px-6">
        {/* Logo & Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 relative rounded-xl mb-6 shadow-xl shadow-black/10 overflow-hidden">
            <Image src="/Favicon.png" alt="Logo" fill className="object-cover" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
            Product Huntr
          </h1>
          <p className="text-gray-500 text-lg">
            {isSignUp ? 'Create your analyst account' : 'Welcome back, analyst'}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-[0_2px_40px_-12px_rgba(0,0,0,0.1)] border border-gray-100 p-8">
          <form onSubmit={handleAuth} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-900 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                placeholder="name@company.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-900 uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {message && (
              <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${message.includes('created')
                ? 'bg-green-50 text-green-700 border border-green-100'
                : 'bg-red-50 text-red-700 border border-red-100'
                }`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3.5 rounded-xl font-semibold hover:bg-gray-900 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider font-medium">
              <span className="px-4 bg-white text-gray-400">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </button>
        </div>

        {/* Toggle */}
        <div className="text-center mt-8">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setMessage('');
            }}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium"
          >
            {isSignUp ? (
              <>Already have an account? <span className="underline decoration-gray-300 underline-offset-4">Sign in</span></>
            ) : (
              <>Don't have an account? <span className="underline decoration-gray-300 underline-offset-4">Create one</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
