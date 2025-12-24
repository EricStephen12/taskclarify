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
            <p className="text-slate-500 text-base font-normal leading-normal">Enter your details to access your workspace and clarify your workflow.</p>
          </div>
          
          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-3 px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#185adc]/50">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M23.766 12.2764C23.766 11.4607 23.6999 10.6406 23.5588 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.2678 16.323 18.1056V21.1039H20.19C22.4608 19.0139 23.766 15.9274 23.766 12.2764Z" fill="#4285F4"></path><path d="M12.2401 24.0008C15.4766 24.0008 18.2059 22.9382 20.1945 21.1039L16.3275 18.1055C15.2517 18.8375 13.8627 19.252 12.2445 19.252C9.11388 19.252 6.45946 17.1399 5.50705 14.3003H1.5166V17.3912C3.55371 21.4434 7.7029 24.0008 12.2401 24.0008Z" fill="#34A853"></path><path d="M5.50253 14.3003C5.00236 12.8099 5.00236 11.1961 5.50253 9.70575V6.61481H1.51649C-0.18551 10.0056 -0.18551 14.0004 1.51649 17.3912L5.50253 14.3003Z" fill="#FBBC05"></path><path d="M12.2401 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208 -0.034466 12.2401 0.000808666C7.7029 0.000808666 3.55371 2.55822 1.5166 6.61481L5.50264 9.70575C6.45064 6.86173 9.10947 4.74966 12.2401 4.74966Z" fill="#EA4335"></path></svg>
              <span>Google</span>
            </button>
            <button className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-3 px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#185adc]/50">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h23v23H0z" fill="#f3f3f3"></path><path d="M1 1h10v10H1z" fill="#f35325"></path><path d="M12 1h10v10H12z" fill="#81bc06"></path><path d="M1 12h10v10H1z" fill="#05a6f0"></path><path d="M12 12h10v10H12z" fill="#ffba08"></path></svg>
              <span>Microsoft</span>
            </button>
          </div>
          
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-slate-500">Or continue with email</span>
            </div>
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
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">Turn chaotic meeting notes into actionable requirements.</h2>
            <p className="text-blue-100 text-lg leading-relaxed max-w-lg">
              Stop spending hours formatting and structuring. Let TaskClarify handle the chaos so you can focus on building.
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
