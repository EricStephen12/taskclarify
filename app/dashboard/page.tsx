'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '../Header';

export default function Dashboard() {
  const [usage, setUsage] = useState<{ isPro: boolean; used: number; limit: number; remaining: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchUsage() {
      try {
        const res = await fetch('/api/usage');
        if (res.ok) {
          const data = await res.json();
          setUsage(data);
        }
      } catch (err) {
        console.error('Failed to fetch usage:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsage();
  }, []);

  const handleLogout = async () => {
    const { createClient } = await import('@/lib/supabase');
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const openCustomerPortal = () => {
    // Basic link to Paddle support or customer portal if configured
    // For now, we'll just redirect to a generic help page or alert
    alert("To manage your subscription, please check your email for the Paddle receipt or contact support.");
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] relative overflow-hidden">
      {/* Background Decor - Same as Hero for consistency */}
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-green-100 blur-3xl opacity-40 pointer-events-none"></div>
      <div className="absolute top-1/2 -right-24 h-96 w-96 rounded-full bg-stone-100 blur-3xl opacity-60 pointer-events-none"></div>

      <Header isAuthenticated={true} onLogout={handleLogout} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 pt-24 relative z-10">
        <div className="space-y-6">
          {/* Welcome / Status Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h1 className="text-2xl font-bold text-[#111318] mb-2">My Account</h1>
            <p className="text-gray-500 mb-6">Manage your subscription and access the mobile app.</p>

            <div className="bg-[#F8F7F4] rounded-xl p-4 flex items-center justify-between mb-6 border border-[#E5E0D5]">
              <div>
                <div className="text-sm text-[#5C6B64] font-medium uppercase tracking-wide">Current Plan</div>
                <div className="flex items-center gap-2 mt-1">
                  {loading ? (
                    <span className="text-gray-400">Loading...</span>
                  ) : usage?.isPro ? (
                    <>
                      <span className="text-xl font-bold text-[#2E5C55]">Pro Member</span>
                      <span className="bg-[#2E5C55]/10 text-[#2E5C55] text-xs font-bold px-2 py-0.5 rounded-full">ACTIVE</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl font-bold text-[#1A2E28]">Free Tier</span>
                      <Link href="/pricing" className="text-sm text-[#2E5C55] hover:underline ml-2">Upgrade Now</Link>
                    </>
                  )}
                </div>
              </div>
            </div>

            {usage?.isPro && (
              <div className="flex justify-end">
                <button onClick={openCustomerPortal} className="text-sm text-[#5C6B64] hover:text-[#2E5C55] underline">
                  Manage Subscription
                </button>
              </div>
            )}
          </div>

          {/* Download App Card */}
          <div className="bg-gradient-to-br from-[#2E5C55] to-[#1F3F3A] rounded-2xl shadow-lg p-8 text-white relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold mb-3">Download the Mobile App</h2>
                <p className="text-white/80 mb-6 text-lg">
                  TaskClarify is built for your phone. Record voice notes, generate SOPs, and get clarity on the go.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                  <a href="#" className="bg-[#FDFBF7] text-[#2E5C55] px-6 py-3 rounded-xl font-bold hover:bg-white transition shadow-md">
                    Download for iOS
                  </a>
                  <a href="#" className="bg-[#ffffff]/10 border border-white/20 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/20 transition">
                    Download for Android
                  </a>
                </div>
              </div>
              {/* QR Code Placeholder */}
              <div className="bg-white p-4 rounded-xl shadow-inner rotate-3 md:rotate-0">
                <div className="w-32 h-32 bg-gray-200 flex items-center justify-center text-gray-400 text-xs text-center p-2">
                  QR Code Placeholder
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}