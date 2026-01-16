'use client';

import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Ensure user has a profile
    if (data.user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single();

      // If no profile exists, create one
      if (profileError || !profile) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            is_pro: false
          });

        if (insertError) {
          console.error('Failed to create user profile:', insertError);
        }
      }
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="min-h-screen w-full flex bg-[#FDFBF7] items-center justify-center p-4">
      <div className="w-full max-w-5xl flex rounded-3xl overflow-hidden shadow-2xl shadow-[#2E5C55]/10 bg-white border border-[#E5E0D5]">

        {/* Left Side: Form */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
          <div className="mb-10 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2E5C55]/10 text-[#2E5C55]">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-[#1A2E28]">TaskClarify</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-[#1A2E28] mb-2 font-serif">Welcome back</h1>
            <p className="text-[#5C6B64] text-base">Sign in to manage your subscription.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <label className="block">
              <span className="text-[#1A2E28] text-sm font-semibold mb-2 block">Email Address</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-[#E5E0D5] bg-[#FDFBF7] px-4 h-12 text-[#1A2E28] focus:border-[#2E5C55] focus:ring-1 focus:ring-[#2E5C55] outline-none transition-all placeholder:text-[#8C9E96]"
                placeholder="name@example.com"
                required
              />
            </label>

            <label className="block">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[#1A2E28] text-sm font-semibold">Password</span>
                <Link className="text-[#2E5C55] text-sm font-medium hover:underline" href="#">Forgot password?</Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-[#E5E0D5] bg-[#FDFBF7] px-4 h-12 text-[#1A2E28] focus:border-[#2E5C55] focus:ring-1 focus:ring-[#2E5C55] outline-none transition-all placeholder:text-[#8C9E96]"
                placeholder="••••••••"
                required
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl h-12 bg-[#2E5C55] hover:bg-[#234A42] text-white font-bold transition-all shadow-lg shadow-[#2E5C55]/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-[#5C6B64]">
            New to TaskClarify?{' '}
            <Link className="text-[#2E5C55] font-bold hover:underline" href="/signup">Create an account</Link>
          </div>
        </div>

        {/* Right Side: Simple Brand Feature */}
        <div className="hidden lg:flex w-1/2 bg-[#1A2E28] relative overflow-hidden items-center justify-center p-12 text-center">
          {/* Nature Blobs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#2E5C55] rounded-full blur-[80px] opacity-40 translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#4ADE80] rounded-full blur-[80px] opacity-10 -translate-x-1/2 translate-y-1/2"></div>

          <div className="relative z-10 max-w-sm">
            <h2 className="text-3xl font-bold text-white mb-6 font-serif italic leading-tight">"From Chaos to Clarity"</h2>
            <p className="text-[#BCDBD3] text-lg leading-relaxed mb-8">
              Stop typing. Just speak. Let our AI transform your voice notes into structured implementation plans.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2E5C55]/30 border border-[#2E5C55] text-[#E5E0D5] text-sm font-medium">
              <span>✨</span> Now with "Blame-Proof" Docs
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

