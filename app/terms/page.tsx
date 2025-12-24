'use client';

import Link from 'next/link';

export default function Terms() {
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
          <h1 className="text-4xl font-bold text-[#111318] mb-2">Terms of Service</h1>
          <p className="text-[#636f88] mb-8">Last updated: December 2024</p>

          <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6 text-[#636f88]">
            <section>
              <h2 className="text-xl font-semibold text-[#111318] mb-3">1. Acceptance of Terms</h2>
              <p>By accessing or using TaskClarify ("Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#111318] mb-3">2. Description of Service</h2>
              <p>TaskClarify is an AI-powered tool that transforms meeting notes into structured requirements documents. The Service includes web-based access to our platform and related features.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#111318] mb-3">3. User Accounts</h2>
              <p>You must create an account to use certain features. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#111318] mb-3">4. Acceptable Use</h2>
              <p>You agree not to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Use the Service for any illegal purpose</li>
                <li>Upload malicious content or attempt to compromise our systems</li>
                <li>Share your account with others or resell access</li>
                <li>Reverse engineer or attempt to extract source code</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#111318] mb-3">5. Subscription and Billing</h2>
              <p>Paid subscriptions are billed monthly or annually. Payments are processed by Paddle, our merchant of record. By subscribing, you authorize recurring charges until you cancel.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#111318] mb-3">6. Intellectual Property</h2>
              <p>You retain ownership of content you input. We retain ownership of the Service, including all software, designs, and documentation. AI-generated outputs are provided for your use.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#111318] mb-3">7. Limitation of Liability</h2>
              <p>TaskClarify is provided "as is" without warranties. We are not liable for any indirect, incidental, or consequential damages arising from your use of the Service.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#111318] mb-3">8. Termination</h2>
              <p>We may suspend or terminate your access for violation of these terms. You may cancel your account at any time through your dashboard or by contacting support.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#111318] mb-3">9. Changes to Terms</h2>
              <p>We may update these terms from time to time. Continued use of the Service after changes constitutes acceptance of the new terms.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#111318] mb-3">10. Contact</h2>
              <p>For questions about these terms, contact us at support@taskclarify.com</p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
