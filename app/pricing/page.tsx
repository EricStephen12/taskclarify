'use client';

import Link from 'next/link';
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

export default function Pricing() {
  const [loading, setLoading] = useState(false);
  
  const handleCheckout = async () => {
    setLoading(true);
    
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
      });
      
      const { sessionId, error } = await res.json();
      
      if (error) {
        console.error('Checkout error:', error);
        alert('Failed to initiate checkout. Please try again.');
        setLoading(false);
        return;
      }
      
      // Redirect to Stripe Checkout
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      
      if (!stripe) {
        console.error('Failed to load Stripe');
        alert('Failed to load payment processor. Please try again.');
        setLoading(false);
        return;
      }
      
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId,
      });
      
      if (stripeError) {
        console.error('Stripe error:', stripeError);
        alert('Payment error. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Failed to initiate checkout. Please try again.');
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          TaskClarify
        </Link>
        <div className="flex gap-4">
          <Link href="/login" className="px-4 py-2 text-gray-600 hover:text-gray-900 transition">
            Login
          </Link>
          <Link href="/signup" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
            Get Started
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-600">Start free, upgrade when you need more</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <div className="text-lg font-semibold text-gray-900 mb-2">Free</div>
            <div className="text-4xl font-bold text-gray-900 mb-2">
              $0<span className="text-lg text-gray-500 font-normal">/month</span>
            </div>
            <p className="text-gray-600 mb-6">Perfect for trying out TaskClarify</p>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-gray-700">
                <span className="text-green-500">✓</span> 5 formats per month
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <span className="text-green-500">✓</span> Save unlimited notes
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <span className="text-green-500">✓</span> Confirmation messages
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <span className="text-green-500">✓</span> Basic support
              </li>
            </ul>

            <Link
              href="/signup"
              className="block w-full py-3 text-center border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition"
            >
              Get Started Free
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-white/20 px-3 py-1 rounded-full text-sm">
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
                <span className="text-green-300">✓</span> Confirmation messages
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-300">✓</span> Priority support
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-300">✓</span> Early access to features
              </li>
            </ul>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="block w-full py-3 text-center bg-white text-indigo-600 font-medium rounded-xl hover:bg-gray-100 transition disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Upgrade to Pro'}
            </button>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4 max-w-2xl mx-auto">
            <FAQ 
              q="Can I cancel anytime?" 
              a="Yes! You can cancel your subscription at any time. You'll keep Pro access until the end of your billing period." 
            />
            <FAQ 
              q="What counts as a 'format'?" 
              a="Each time you click 'Format with AI' to process meeting notes counts as one format." 
            />
            <FAQ 
              q="Is my data secure?" 
              a="Absolutely. Your notes are encrypted and only accessible to you. We never share your data." 
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="font-semibold text-gray-900 mb-2">{q}</h3>
      <p className="text-gray-600">{a}</p>
    </div>
  );
}
