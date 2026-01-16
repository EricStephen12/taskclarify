'use client';

import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Header from '../Header';

declare global {
  interface Window {
    Paddle?: {
      Initialize: (options: { token: string }) => void;
      Checkout: {
        open: (options: { items: { priceId: string; quantity: number }[]; customData?: Record<string, string> }) => void;
      };
    };
  }
}

export default function Pricing() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get current user
    async function getUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    }
    getUser();

    // Load Paddle.js
    const script = document.createElement('script');
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
    script.async = true;
    script.onload = () => {
      if (window.Paddle) {
        window.Paddle.Initialize({
          token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || ''
        });
      }
    };
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  const handleCheckout = () => {
    if (!userId) {
      // Redirect to login if not authenticated
      window.location.href = '/login?redirect=/pricing';
      return;
    }

    if (window.Paddle) {
      window.Paddle.Checkout.open({
        items: [{ priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID || '', quantity: 1 }],
        customData: { user_id: userId }
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] overflow-x-hidden">
      <Header isAuthenticated={!!userId} />

      <main className="pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#111318] mb-4">Simple, Transparent Pricing</h1>
            <p className="text-lg sm:text-xl text-[#636f88]">Start free, upgrade when you need more</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-3xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl border border-[#E5E0D5] p-6 sm:p-8 shadow-sm">
              <div className="text-lg font-semibold text-[#1A2E28] mb-2">Free</div>
              <div className="text-3xl sm:text-4xl font-bold text-[#1A2E28] mb-2">
                $0<span className="text-base sm:text-lg text-[#5C6B64] font-normal">/month</span>
              </div>
              <p className="text-[#5C6B64] mb-6">Perfect for trying out TaskClarify</p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-[#1A2E28]">
                  <span className="text-[#2E5C55]">✓</span> 5 formats per month
                </li>
                <li className="flex items-center gap-2 text-[#1A2E28]">
                  <span className="text-[#2E5C55]">✓</span> Save unlimited notes
                </li>
                <li className="flex items-center gap-2 text-[#1A2E28]">
                  <span className="text-[#2E5C55]">✓</span> Voice input
                </li>
                <li className="flex items-center gap-2 text-[#1A2E28]">
                  <span className="text-[#2E5C55]">✓</span> Export to Markdown
                </li>
              </ul>

              <Link href="/signup" className="block w-full py-3.5 sm:py-3 text-center border border-[#E5E0D5] text-[#1A2E28] font-medium rounded-xl hover:bg-[#FDFBF7] transition min-h-[44px] flex items-center justify-center">
                Download Free
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-[#1A2E28] rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl shadow-[#2E5C55]/20">
              <div className="absolute top-4 right-4 bg-[#2E5C55] px-3 py-1 rounded-full text-sm font-medium border border-[#3E6E65]">
                Popular
              </div>
              <div className="text-lg font-semibold mb-2">Pro</div>
              <div className="text-3xl sm:text-4xl font-bold mb-2">
                $9.99<span className="text-base sm:text-lg opacity-80 font-normal">/month</span>
              </div>
              <p className="opacity-90 mb-6 font-light">Unlock the full power of TaskClarify</p>

              <ul className="space-y-3 mb-8 text-[#E5E0D5]">
                <li className="flex items-center gap-2">
                  <span className="text-[#4ADE80]">✓</span> Unlimited AI Tasks (SOPs, Plans, Minutes)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#4ADE80]">✓</span> "Blame-Proof" Documentation
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#4ADE80]">✓</span> Unlimited Voice Transcriptions
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#4ADE80]">✓</span> Priority Processing (Llama 3 70B)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#4ADE80]">✓</span> Early access to new features
                </li>
              </ul>

              <button onClick={handleCheckout} className="block w-full py-3.5 sm:py-3 text-center bg-[#2E5C55] text-white font-bold rounded-xl hover:bg-[#346b63] transition min-h-[44px] shadow-lg border border-white/10">
                Upgrade Now
              </button>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-16 sm:mt-20">
            <h2 className="text-xl sm:text-2xl font-bold text-[#111318] text-center mb-6 sm:mb-8">Frequently Asked Questions</h2>
            <div className="space-y-3 sm:space-y-4 max-w-2xl mx-auto">
              <FAQ q="Can I cancel anytime?" a="Yes! You can cancel your subscription at any time. You'll keep Pro access until the end of your billing period." />
              <FAQ q="What counts as a 'format'?" a="Each time you click 'Generate Requirements Document' to process meeting notes counts as one format." />
              <FAQ q="Is my data secure?" a="Absolutely. Your notes are encrypted and only accessible to you. We never share your data." />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
      <h3 className="font-semibold text-[#111318] mb-2">{q}</h3>
      <p className="text-[#636f88] text-sm sm:text-base">{a}</p>
    </div>
  );
}
