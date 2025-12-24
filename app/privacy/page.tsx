'use client';

import Link from 'next/link';

export default function Privacy() {
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
          <h1 className="text-4xl font-bold text-[#111318] mb-2">Privacy Policy</h1>
          <p className="text-[#636f88] mb-8">Last updated: December 2024</p>

          <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6 text-[#636f88]">
            <section>
              <h2 className="text-xl font-semibold text-[#111318] mb-3">1. Information We Collect</h2>
              <p className="mb-2">We collect information you provide directly:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Account information (email, name)</li>
                <li>Meeting notes and content you input</li>
                <li>Payment information (processed by Paddle)</li>
                <li>Usage data and preferences</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#111318] mb-3">2. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>To provide and improve our Service</li>
                <li>To process your transactions</li>
                <li>To send service-related communications</li>
                <li>To respond to your requests and support needs</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#111318] mb-3">3. Data Processing</h2>
              <p>Your meeting notes are processed by AI to generate requirements documents. We use Groq's AI services for processing. Your content is not used to train AI models.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#111318] mb-3">4. Data Storage and Security</h2>
              <p>Your data is stored securely using Supabase infrastructure. We implement industry-standard security measures including encryption in transit and at rest.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#111318] mb-3">5. Data Sharing</h2>
              <p>We do not sell your personal information. We may share data with:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Service providers (Paddle for payments, Supabase for hosting)</li>
                <li>Legal authorities when required by law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#111318] mb-3">6. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Access your personal data</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Export your data</li>
                <li>Opt out of marketing communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#111318] mb-3">7. Cookies</h2>
              <p>We use essential cookies for authentication and session management. We do not use tracking cookies for advertising purposes.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#111318] mb-3">8. Data Retention</h2>
              <p>We retain your data while your account is active. Upon account deletion, your data is removed within 30 days, except where retention is required by law.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#111318] mb-3">9. Changes to This Policy</h2>
              <p>We may update this policy periodically. We will notify you of significant changes via email or through the Service.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#111318] mb-3">10. Contact</h2>
              <p>For privacy-related inquiries, contact us at privacy@taskclarify.com</p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
