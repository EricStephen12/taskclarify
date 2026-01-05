'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

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
    <div className="flex min-h-screen w-full flex-row overflow-hidden">
      {/* Left Side: Login Form */}
      <div className="flex w-full flex-col justify-center bg-white px-6 py-12 lg:w-1/2 lg:px-16 xl:px-24 shadow-2xl z-10">
        <div className="w-full max-w-md mx-auto">
          {/* Logo Header */}
          <div className="mb-10 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#185adc]/10 text-[#185adc]">
              <span className="material-symbols-outlined text-2xl">auto_fix</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">TaskClarify</span>
          </div>
          
          {/* Page Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-black leading-tight tracking-[-0.033em] text-slate-900 mb-2">Welcome back</h1>
            <p className="text-slate-500 text-base font-normal leading-normal">Sign in to access your SOPs, meeting minutes, and action plans.</p>
          </div>
          
          {/* Form Inputs */}
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
            
            {/* Email Field */}
            <label className="flex flex-col mb-5">
              <span className="text-slate-900 text-sm font-medium leading-normal pb-2">Email Address</span>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input flex w-full rounded-lg border border-slate-200 bg-white text-slate-900 focus:border-[#185adc] focus:ring-1 focus:ring-[#185adc] h-12 px-4 placeholder:text-slate-400 text-base font-normal leading-normal transition-all" 
                placeholder="name@company.com" 
                required
              />
            </label>
            
            {/* Password Field */}
            <label className="flex flex-col mb-6">
              <div className="flex justify-between items-center pb-2">
                <span className="text-slate-900 text-sm font-medium leading-normal">Password</span>
                <Link className="text-[#185adc] text-sm font-medium hover:text-[#1346b0] transition-colors" href="#">Forgot password?</Link>
              </div>
              <div className="relative">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input flex w-full rounded-lg border border-slate-200 bg-white text-slate-900 focus:border-[#185adc] focus:ring-1 focus:ring-[#185adc] h-12 px-4 placeholder:text-slate-400 text-base font-normal leading-normal transition-all" 
                  placeholder="••••••••" 
                  required
                />
              </div>
            </label>
            
            {/* Submit Button */}
            <button 
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-[#185adc] hover:bg-[#1346b0] text-white text-base font-bold leading-normal tracking-[0.015em] transition-all shadow-md hover:shadow-lg focus:ring-4 focus:ring-[#185adc]/30 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span className="truncate">{loading ? 'Logging in...' : 'Log In'}</span>
            </button>
          </form>
          
          {/* Footer Sign Up Link */}
          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              New to TaskClarify?{' '}
              <Link className="text-[#185adc] font-semibold hover:underline decoration-2 underline-offset-4" href="/signup">Create an account</Link>
            </p>
          </div>
        </div>
      </div>
      
      {/* Right Side: Visual / Art */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden group">
        {/* Background Image */}
        <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay transition-transform duration-[20s] ease-in-out group-hover:scale-110" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80)' }}>
        </div>
        
        {/* Abstract Gradients/Overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#185adc]/90 to-slate-900/90 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
        
        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col justify-end p-16 h-full w-full max-w-2xl mx-auto">
          <div className="mb-6">
            <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm border border-white/20 mb-4">
              <span className="material-symbols-outlined text-sm mr-1">tips_and_updates</span>
              AI-Powered Clarity
            </span>
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">Turn chaotic notes into actionable plans.</h2>
            <p className="text-blue-100 text-lg leading-relaxed max-w-lg">
              SOPs, meeting minutes, blame-proof docs, and more. Let TaskClarify handle the chaos so you can focus on what matters.
            </p>
          </div>
          
          {/* Trusted By / Stats (Optional Trust Indicator) */}
          <div className="flex items-center gap-4 pt-6 border-t border-white/10">
            <div className="flex -space-x-3">
              <img alt="User portrait" className="h-10 w-10 rounded-full border-2 border-slate-900 object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80" />
              <img alt="User portrait" className="h-10 w-10 rounded-full border-2 border-slate-900 object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80" />
              <img alt="User portrait" className="h-10 w-10 rounded-full border-2 border-slate-900 object-cover" src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80" />
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-900 bg-white text-xs font-bold text-slate-900">
                +2k
              </div>
            </div>
            <div className="text-sm text-blue-100">
              <p className="font-medium text-white">Trusted by professionals</p>
              <p className="opacity-80">at world-class companies</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
