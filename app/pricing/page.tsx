'use client';

import Link from 'next/link';
import { useEffect } from 'react';

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
  useEffect(() => {
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
    if (window.Paddle) {
      window.Paddle.Checkout.open({
        items: [{ priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID || '', quantity: 1 }],
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f6f8]">
      {/* Nav */}
      <header className="fixed top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#185adc]/10 text-[#185adc]">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"/>
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-[#111318]">TaskClarify</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-[#636f88] hover:text-[#111318] transition">Login</Link>
            <Link href="/signup" className="px-4 py-2 bg-[#185adc] text-white rounded-lg text-sm font-medium hover:bg-[#1244a8] transition">Get Started</Link>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-[#111318] mb-4">Simple, Transparent Pricing</h1>
            <p className="text-xl text-[#636f88]">Start free, upgrade when you need more</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
              <div className="text-lg font-semibold text-[#111318] mb-2">Free</div>
              <div className="text-4xl font-bold text-[#111318] mb-2">
                $0<span className="text-lg text-[#636f88] font-normal">/month</span>
              </div>
              <p className="text-[#636f88] mb-6">Perfect for trying out TaskClarify</p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-[#111318]">
                  <span className="text-green-500">✓</span> 5 formats per month
                </li>
                <li className="flex items-center gap-2 text-[#111318]">
                  <span className="text-green-500">✓</span> Save unlimited notes
                </li>
                <li className="flex items-center gap-2 text-[#111318]">
                  <span className="text-green-500">✓</span> Voice input
                </li>
                <li className="flex items-center gap-2 text-[#111318]">
                  <span className="text-green-500">✓</span> Export to Markdown
                </li>
              </ul>

              <Link href="/signup" className="block w-full py-3 text-center border border-gray-300 text-[#111318] font-medium rounded-xl hover:bg-gray-50 transition">
                Get Started Free
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-[#185adc] rounded-2xl p-8 text-white relative overflow-hidden shadow-xl shadow-[#185adc]/25">
              <div className="absolute top-4 right-4 bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                Popular
              </div>
              <div className="text-lg font-semibold mb-2">Pro</div>
              <div className="text-4xl font-bold mb-2">
                $9<span className="text-lg opacity-80 font-normal">/month</span>
              </div>
              <p className="opacity-90 mb-6">For professionals who need more</p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <span className="text-green-300">✓</span> Unlimited formats
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-300">✓</span> Save unlimited notes
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-300">✓</span> Voice input
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-300">✓</span> Priority support
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-300">✓</span> Early access to features
                </li>
              </ul>

              <button onClick={handleCheckout} className="block w-full py-3 text-center bg-white text-[#185adc] font-medium rounded-xl hover:bg-gray-100 transition">
                Upgrade to Pro
              </button>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-20">
            <h2 className="text-2xl font-bold text-[#111318] text-center mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4 max-w-2xl mx-auto">
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
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="font-semibold text-[#111318] mb-2">{q}</h3>
      <p className="text-[#636f88]">{a}</p>
    </div>
  );
}
