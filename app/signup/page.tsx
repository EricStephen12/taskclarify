'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Initialize user profile
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          is_pro: false
        });
      
      if (profileError) {
        console.error('Failed to create user profile:', profileError);
      }
    }

    // Redirect to dashboard after successful signup
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="flex min-h-screen w-full flex-row overflow-hidden font-display antialiased bg-background-light text-[#111318]">
      {/* Left Side: Brand & Value Prop (Visible on Large Screens) */}
      <div className="hidden lg:flex w-1/2 relative bg-slate-900 flex-col justify-end p-12 overflow-hidden group">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay transition-transform duration-[20s] ease-in-out group-hover:scale-110" 
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80)' }}
        ></div>
        
        {/* Abstract Gradients/Overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#185adc]/90 to-slate-900/90 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
        
        {/* Content */}
        <div className="relative z-10 max-w-lg">
          <div className="mb-8">
            <div className="flex items-center gap-3 text-white mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white backdrop-blur-sm">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold leading-tight tracking-tight">TaskClarify</h2>
            </div>
            
            <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm border border-white/20 mb-4">
              <span className="mr-1">✨</span>
              AI-Powered Productivity
            </span>
            
            <h1 className="text-white tracking-tight text-4xl lg:text-5xl font-bold leading-tight mb-6">
              Turn chaos into clarity.
            </h1>
            
            <p className="text-blue-100 text-lg font-normal leading-relaxed mb-8">
              Join thousands of professionals transforming messy notes into actionable plans — SOPs, meeting minutes, blame-proof docs, and more.
            </p>
          </div>
          
          {/* Testimonial / Trust Indicator */}
          <div className="flex items-center gap-4 pt-6 border-t border-white/10">
            <div className="flex -space-x-3">
              <img alt="User" className="h-10 w-10 rounded-full border-2 border-slate-900 object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" />
              <img alt="User" className="h-10 w-10 rounded-full border-2 border-slate-900 object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" />
              <img alt="User" className="h-10 w-10 rounded-full border-2 border-slate-900 object-cover" src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" />
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
      
      {/* Right Side: Sign Up Form */}
      <div className="w-full lg:w-1/2 flex flex-col h-full bg-white overflow-y-auto">
        <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-20 xl:px-24">
          {/* Mobile Logo (Visible only on small screens) */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex items-center gap-3 text-[#111318]">
              <div className="size-8 text-primary">
                <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" fillRule="evenodd"></path>
                  <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fillRule="evenodd"></path>
                </svg>
              </div>
              <h2 className="text-xl font-bold">TaskClarify</h2>
            </div>
          </div>
          
          {/* Header */}
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-[#111318] mb-2 tracking-tight">Create your account</h2>
            <p className="text-[#636f88] text-base">Start turning chaos into clarity today. 5 free formats/month.</p>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
            
            {/* Email Field */}
            <label className="flex flex-col w-full">
              <p className="text-[#111318] text-sm font-medium leading-normal pb-2">Email Address</p>
              <input 
                autoFocus
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input flex w-full min-w-0 resize-none overflow-hidden rounded-lg text-[#111318] placeholder:text-[#636f88] bg-white border border-[#dcdfe5] focus:border-primary focus:ring-1 focus:ring-primary focus:outline-0 h-12 p-3 text-base font-normal leading-normal transition-all" 
                placeholder="name@company.com" 
                required 
              />
            </label>
            
            {/* Password Field */}
            <label className="flex flex-col w-full">
              <div className="flex justify-between items-center pb-2">
                <p className="text-[#111318] text-sm font-medium leading-normal">Password</p>
              </div>
              <div className="relative flex w-full items-center rounded-lg">
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input flex w-full min-w-0 resize-none overflow-hidden rounded-lg text-[#111318] placeholder:text-[#636f88] bg-white border border-[#dcdfe5] focus:border-primary focus:ring-1 focus:ring-primary focus:outline-0 h-12 p-3 pr-12 text-base font-normal leading-normal transition-all" 
                  placeholder="••••••••••••" 
                  required 
                />
                <div 
                  className="absolute right-0 top-0 bottom-0 flex items-center pr-3 text-[#636f88] cursor-pointer hover:text-primary transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </div>
              </div>
              <div className="mt-2 flex gap-2">
                <div className="h-1 flex-1 rounded-full bg-[#f0f2f4] overflow-hidden">
                  <div className={`h-full w-${password.length > 0 ? password.length > 4 ? password.length > 8 ? 'full' : '3/4' : '1/2' : '1/4'} ${password.length > 8 ? 'bg-green-400' : password.length > 4 ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
                </div>
                <div className="h-1 flex-1 rounded-full bg-[#f0f2f4]"></div>
                <div className="h-1 flex-1 rounded-full bg-[#f0f2f4]"></div>
                <div className="h-1 flex-1 rounded-full bg-[#f0f2f4]"></div>
              </div>
              <p className="text-xs text-[#636f88] mt-1">Must contain at least 8 characters</p>
            </label>
            
            {/* Confirm Password Field */}
            <label className="flex flex-col w-full">
              <p className="text-[#111318] text-sm font-medium leading-normal pb-2">Confirm Password</p>
              <div className="relative flex w-full items-center rounded-lg">
                <input 
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input flex w-full min-w-0 resize-none overflow-hidden rounded-lg text-[#111318] placeholder:text-[#636f88] bg-white border border-[#dcdfe5] focus:border-primary focus:ring-1 focus:ring-primary focus:outline-0 h-12 p-3 pr-12 text-base font-normal leading-normal transition-all" 
                  placeholder="••••••••••••" 
                  required 
                />
                <div className="absolute right-0 top-0 bottom-0 flex items-center pr-3 text-[#636f88] cursor-pointer hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">visibility</span>
                </div>
              </div>
            </label>
            
            {/* Submit Button */}
            <button 
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-[#185adc] hover:bg-[#1346b0] text-white text-base font-bold leading-normal tracking-[0.015em] transition-all shadow-md hover:shadow-lg focus:ring-4 focus:ring-[#185adc]/30 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span className="truncate">{loading ? 'Creating account...' : 'Create Account'}</span>
            </button>
            
            <p className="text-xs text-[#636f88] text-center mt-4">
              By signing up, you agree to our <Link href="/terms" className="text-[#185adc] hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-[#185adc] hover:underline">Privacy Policy</Link>.
            </p>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-[#636f88] text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-[#185adc] font-semibold hover:underline decoration-2 underline-offset-4">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
