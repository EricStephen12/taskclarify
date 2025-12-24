'use client';

import Link from 'next/link';

export default function Refund() {
  return (
    <div className="min-h-screen bg-[#f6f6f8]">
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
        </div>
      </header>

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-[#111318] mb-2">Refund Policy</h1>
          <p className="text-[#636f88] mb-8">Last updated: December 2024</p>

          <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6 text-[#636f88]">
            <section>
              <h2 className="text-xl font-semibold text-[#111318] mb-3">Our Commitment</h2>
              <p>We want you to be completely satisfied with TaskClarify. If you're not happy with your purchase, we offer a straightforward refund policy.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#111318] mb-3">14-Day Money-Back Guarantee</h2>
              <p>If you're not satisfied with TaskClarify Pro, you can request a full refund within 14 days of your initial purchase. No questions asked.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#111318] mb-3">How to Request a Refund</h2>
              <p>To request a refund:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Email us at support@taskclarify.com with your account email</li>
                <li>Include "Refund Request" in the subject line</li>
                <li>We'll process your refund within 5-7 business days</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#111318] mb-3">Subscription Cancellation</h2>
              <p>You can cancel your subscription at any time from your dashboard. When you cancel:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>You'll retain Pro access until the end of your billing period</li>
                <li>No further charges will be made</li>
                <li>Your account will revert to the Free plan</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#111318] mb-3">Refund Eligibility</h2>
              <p className="mb-2">Refunds are available for:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>First-time purchases within 14 days</li>
                <li>Technical issues that prevent use of the Service</li>
                <li>Accidental duplicate charges</li>
              </ul>
              <p className="mt-3">Refunds may not be available for:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Requests made after 14 days</li>
                <li>Accounts that have violated our Terms of Service</li>
                <li>Repeated refund requests from the same user</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#111318] mb-3">Payment Processing</h2>
              <p>All payments are processed by Paddle, our merchant of record. Refunds will be credited to your original payment method. Processing times may vary depending on your bank or payment provider.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#111318] mb-3">Contact Us</h2>
              <p>If you have questions about our refund policy or need assistance, please contact us at support@taskclarify.com</p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
