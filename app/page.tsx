import Link from 'next/link';
import Header from './Header';

export default function Home() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f6f8]">
      <Header />

      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <Hero />
        {/* How It Works */}
        <HowItWorks />
        {/* Founder Story */}
        <FounderStory />
        {/* CTA */}
        <CTA />
      </main>

      <Footer />
    </div>
  );
}


function Hero() {
  return (
    <section className="relative overflow-hidden py-12 sm:py-20 lg:py-32 bg-[#FDFBF7]">
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-green-100 blur-3xl opacity-40 pointer-events-none"></div>
      <div className="absolute top-1/2 -right-24 h-96 w-96 rounded-full bg-stone-100 blur-3xl opacity-60 pointer-events-none"></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="flex flex-col gap-6 sm:gap-8 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E5E0D5] bg-white/50 backdrop-blur-sm px-3 py-1 text-xs font-medium text-[#4A5D50] shadow-sm w-fit">
              <span className="flex h-2 w-2 rounded-full bg-[#2E5C55] animate-pulse"></span>
              New: AI-Powered SOPs & "Blame-Proof" Docs
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[4rem] font-black leading-[1.1] tracking-tight text-[#1A2E28]">
              Turn Chaos Into <br />
              <span className="text-[#2E5C55] relative inline-block">
                Clarity
                <svg className="absolute -bottom-2 w-full h-3 text-[#2E5C55]/20" preserveAspectRatio="none" viewBox="0 0 100 10">
                  <path d="M0 5 Q 50 10 100 5" fill="none" stroke="currentColor" strokeWidth="3" />
                </svg>
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#5C6B64] leading-relaxed max-w-lg">
              Stop guessing. TaskClarify's AI transforms messy voice notes and brain dumps into clear Implementation Plans, SOPs, and Action Items instantly.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link href="/signup" className="flex h-12 items-center justify-center rounded-lg bg-[#2E5C55] px-8 text-base font-semibold text-white shadow-lg shadow-[#2E5C55]/20 hover:bg-[#234A42] hover:translate-y-[-1px] transition-all duration-200 w-full sm:w-auto">
                Download for iOS
              </Link>
              <Link href="/pricing" className="flex h-12 items-center justify-center rounded-lg border border-[#E5E0D5] bg-white/80 backdrop-blur-sm px-8 text-base font-semibold text-[#1A2E28] hover:bg-[#F0F4F2] hover:border-[#2E5C55]/30 transition-all duration-200 w-full sm:w-auto">
                View Pricing
              </Link>
            </div>
          </div>

          {/* App Preview */}
          <AppPreview />
        </div>
      </div>
    </section>
  );
}


function AppPreview() {
  return (
    <div className="relative h-[350px] sm:h-[450px] lg:h-[600px] flex items-center justify-center mt-8 lg:mt-0">
      <div className="relative w-full max-w-md lg:max-w-none aspect-[4/5] sm:aspect-square lg:aspect-auto h-full max-h-[500px]">
        {/* Organic Blobs behind preview */}
        <div className="absolute top-6 right-6 sm:top-10 sm:right-10 w-full h-full bg-[#E8E6DF] rounded-2xl -rotate-6 transform origin-bottom-right z-0 border border-[#D8D4CC]"></div>
        <div className="absolute top-3 right-3 sm:top-5 sm:right-5 w-full h-full bg-[#F2F0E9] rounded-2xl -rotate-3 transform origin-bottom-right z-10 border border-[#E5E0D5] shadow-sm"></div>
        <div className="absolute inset-0 bg-[#FAFAFA] rounded-2xl shadow-2xl border border-gray-100 z-20 overflow-hidden flex flex-col">
          {/* Window Header */}
          <div className="h-12 border-b border-gray-100 flex items-center px-4 gap-2 bg-white">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#E57373]"></div>
              <div className="w-3 h-3 rounded-full bg-[#FFD54F]"></div>
              <div className="w-3 h-3 rounded-full bg-[#81C784]"></div>
            </div>
            <div className="ml-4 h-2 w-24 bg-gray-100 rounded-full"></div>
            <div className="ml-auto flex items-center gap-2">
              <div className="h-2 w-8 bg-green-50 rounded-full"></div>
            </div>
          </div>
          {/* Content */}
          <div className="p-6 flex flex-col gap-6 flex-1 bg-[#FDFBF7]">
            {/* Mock Chat Bubble */}
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#2E5C55] flex items-center justify-center text-white font-bold text-xs">TC</div>
              <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-[#F0EFE9] max-w-[85%]">
                <p className="text-sm text-[#2C3E36]">I've analyzed your voice note. It sounds like you need a <span className="font-semibold text-[#2E5C55]">Project Implementation Plan</span>.</p>
              </div>
            </div>

            {/* Mock Result Card */}
            <div className="bg-white rounded-xl border border-[#EFEEE9] shadow-sm overflow-hidden">
              <div className="bg-[#F2F7F5] p-3 border-b border-[#E8F0ED] flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🌿</span>
                  <span className="text-sm font-bold text-[#1A2E28]">Mobile App Launch</span>
                </div>
                <span className="text-xs bg-[#E0F2F1] text-[#00695C] px-2 py-0.5 rounded-full font-medium">Strategy</span>
              </div>
              <div className="p-4 space-y-3">
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-[#8C9E96] uppercase">Immediate Action</div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border-2 border-[#2E5C55] flex items-center justify-center text-[10px] text-[#2E5C55]">✓</div>
                    <span className="text-sm text-[#3E4E46]">Fix navigation bug on iOS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border-2 border-gray-300"></div>
                    <span className="text-sm text-[#3E4E46]">Set up RevenueCat for payments</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-50">
                  <div className="text-xs font-semibold text-[#8C9E96] uppercase mb-1">Risk Analysis</div>
                  <div className="text-xs text-[#BC544B] bg-[#FDF3F2] p-2 rounded border border-[#F8E6E5]">
                    ⚠ Apple Review might fail due to missing subscription links.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


function HowItWorks() {
  return (
    <section className="py-16 sm:py-24 bg-[#F5F4F0]" id="how-it-works">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-[#2E5C55] font-semibold tracking-wide uppercase text-sm mb-3">The Process</h2>
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#111318] tracking-tight mb-4">From Voice Note to SOP in Seconds</h3>
          <p className="text-[#5C6B64] text-base sm:text-lg">Don't have time to type? Just talk. TaskClarify transforms your rambling thoughts into perfectly structured documents right on your phone.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative">
          <StepCard
            num="1"
            icon="🎙️"
            title="Speak Your Mind"
            desc="Tap the microphone and just talk. Record meetings, brain dumps, or instructions while you're on the go."
            preview={
              <div className="mt-auto bg-[#FDFBF7] rounded-lg p-3 border border-[#E5E0D5] font-mono text-xs text-[#5C6B64] h-32 overflow-hidden relative flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#FDFBF7]/90 z-10"></div>
                {/* Voice Waveform Mock */}
                <div className="flex gap-1 items-center h-12">
                  {[1, 3, 2, 5, 3, 6, 4, 7, 3, 5, 2, 4, 1].map((h, i) => (
                    <div key={i} className="w-1 bg-[#2E5C55] rounded-full animate-pulse" style={{ height: `${h * 4}px`, animationDelay: `${i * 0.1}s` }}></div>
                  ))}
                </div>
              </div>
            }
          />
          <StepCard
            num="2"
            icon="🧠"
            title="AI Understands"
            desc="Our smart engine detects if your voice note is a software spec, business SOP, or marketing plan automatically."
            preview={
              <div className="mt-auto bg-[#1A2E28] rounded-lg p-3 border border-[#2E5C55] flex items-center justify-center h-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#2E5C55]/20 to-emerald-500/20 z-0"></div>
                <div className="z-10 flex flex-col items-center gap-2">
                  <span className="text-white text-3xl animate-pulse">✨</span>
                  <div className="h-1 w-16 bg-[#2E5C55] rounded-full overflow-hidden">
                    <div className="h-full bg-[#4ADE80] w-1/2 animate-pulse"></div>
                  </div>
                  <span className="text-[10px] text-[#8C9E96] uppercase tracking-widest">Processing Audio</span>
                </div>
              </div>
            }
          />
          <StepCard
            num="3"
            icon="✅"
            title="Get Results"
            desc="Receive perfectly formatted action plans, SOPs, or meeting minutes instantly in the palm of your hand."
            preview={
              <div className="mt-auto bg-white rounded-lg p-3 border border-[#E5E0D5] shadow-sm h-32 overflow-hidden flex flex-col gap-2">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                  <div className="w-2 h-2 rounded-full bg-[#2E5C55]"></div>
                  <span className="text-[10px] font-bold text-[#1A2E28]">ACTION PLAN</span>
                </div>
                <div className="h-2 w-3/4 bg-[#F0F4F2] rounded-full"></div>
                <div className="h-2 w-full bg-[#F5F7F6] rounded-full"></div>
                <div className="h-2 w-1/2 bg-[#F5F7F6] rounded-full"></div>
              </div>
            }
          />
        </div>
      </div>
    </section>
  );
}


function StepCard({ num, icon, title, desc, preview }: { num: string; icon: string; title: string; desc: string; preview: React.ReactNode }) {
  return (
    <div className="group relative flex flex-col bg-white rounded-2xl p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.02),0_2px_4px_-1px_rgba(0,0,0,0.02)] border border-[#E5E0D5] hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05),0_4px_6px_-2px_rgba(0,0,0,0.025)] transition-all duration-300">
      <div className="absolute -top-4 -right-4 w-12 h-12 bg-[#F2F7F5] rounded-full flex items-center justify-center text-[#2E5C55] font-bold text-xl border-4 border-white shadow-sm">
        {num}
      </div>
      <div className="h-12 w-12 rounded-lg bg-[#F2F7F5] flex items-center justify-center text-2xl mb-6 group-hover:bg-[#2E5C55] group-hover:text-white transition-colors duration-300">
        {icon}
      </div>
      <h4 className="text-xl font-bold text-[#111318] mb-2">{title}</h4>
      <p className="text-[#636f88] text-sm mb-6">{desc}</p>
      {preview}
    </div>
  );
}

function FounderStory() {
  return (
    <section className="py-16 sm:py-24 bg-[#FDFBF7] relative overflow-hidden" id="founder">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
          <div className="lg:col-span-5 relative order-2 lg:order-1">
            <div className="aspect-[3/4] w-full max-w-sm mx-auto lg:max-w-none rounded-[3rem] rounded-tr-[5rem] rounded-bl-[5rem] overflow-hidden bg-[#E8E6DF] relative shadow-2xl shadow-[#2E5C55]/10 border-8 border-white">
              <img
                src="/boss.png"
                alt="Founder talking to team"
                className="w-full h-full object-cover grayscale-[20%] sepia-[10%]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2E5C55]/20 to-transparent opacity-60"></div>
            </div>

            {/* Nature Decorative Elements */}
            <div className="absolute -bottom-6 -left-6 text-6xl opacity-20 rotate-[-15deg] pointer-events-none">🌿</div>
            <div className="absolute -top-6 -right-6 text-6xl opacity-20 rotate-[15deg] pointer-events-none">🍃</div>
          </div>

          <div className="lg:col-span-7 lg:pl-12 mt-8 lg:mt-0 order-1 lg:order-2">
            <h2 className="text-sm font-bold tracking-widest text-[#2E5C55] uppercase mb-4 flex items-center gap-2">
              <span className="w-8 h-px bg-[#2E5C55]"></span>
              Founder's Story
            </h2>
            <h3 className="text-2xl sm:text-3xl md:text-5xl font-black text-[#1A2E28] leading-[1.1] mb-6 sm:mb-8 font-serif italic">
              "I built TaskClarify because I was tired of guessing."
            </h3>

            <div className="space-y-4 sm:space-y-6 text-[#5C6B64]">
              <p className="leading-relaxed text-base sm:text-lg">
                I'm 22, managing a complex platform with <strong className="text-[#2E5C55] font-semibold">180 users including VIPs</strong>. My boss would explain features and I'd think I understood... then realize halfway through building that I missed key details.
              </p>
              <p className="leading-relaxed text-base sm:text-lg">
                I spent <strong className="text-[#2E5C55] font-semibold">3 weeks building a feature nobody asked for</strong>. The meeting notes said "add user preferences." I built an entire settings page with 20+ options. Turns out, they just wanted a "remember my language" checkbox. 🤦‍♂️
              </p>
              <p className="leading-relaxed text-base sm:text-lg bg-white/60 p-4 rounded-xl border-l-4 border-[#2E5C55] italic">
                That's when I realized: <strong className="text-[#1A2E28] font-semibold">the problem isn't coding—it's understanding what to code.</strong>
              </p>
              <p className="leading-relaxed text-base sm:text-lg">
                TaskClarify forces you to identify unclear points BEFORE you start building. No more "that's not what I meant" moments.
              </p>
            </div>

            <div className="mt-8 sm:mt-10 flex items-center gap-4">
              <div className="flex -space-x-2">
                <div className="h-10 w-10 rounded-full bg-[#1A2E28] border-2 border-[#FDFBF7] flex items-center justify-center text-white font-bold text-xs">EC</div>
              </div>
              <div>
                <p className="text-lg font-bold text-[#1A2E28]">Eric</p>
                <p className="text-sm text-[#5C6B64]">Founder & Developer</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-16 sm:py-24 bg-white relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#E5E0D5] to-transparent"></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[3rem] bg-[#1A2E28] p-8 sm:p-16 text-center shadow-2xl shadow-[#2E5C55]/20 relative overflow-hidden">
          {/* Abstract Nature Shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#2E5C55] rounded-full blur-[80px] opacity-40 translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#4ADE80] rounded-full blur-[80px] opacity-10 -translate-x-1/2 translate-y-1/2"></div>

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6 font-serif">Ready to find Clarity?</h2>
            <p className="text-lg sm:text-xl text-[#BCDBD3] max-w-2xl mx-auto mb-10 font-light">
              Join thousands of professionals who transform messy voice notes into actionable plans every day.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="flex h-14 items-center justify-center rounded-2xl bg-[#FDFBF7] px-10 text-lg font-bold text-[#1A2E28] shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 w-full sm:w-auto">
                Download for iOS
              </Link>
              <Link href="/pricing" className="flex h-14 items-center justify-center rounded-2xl border border-white/20 bg-white/5 px-10 text-lg font-semibold text-white hover:bg-white/10 transition-colors duration-200 w-full sm:w-auto">
                View Pricing
              </Link>
            </div>
            <p className="mt-6 text-sm text-[#BCDBD3] opacity-60">No credit card required for free plan.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#111318] text-gray-400 py-12 sm:py-16 border-t border-[#1F2E29]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2E5C55]/20 text-[#2E5C55]">
                <svg className="w-5 h-5 text-[#4ADE80]" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <span className="text-lg font-bold tracking-tight text-white">TaskClarify</span>
            </div>
            <p className="text-sm mb-6 text-[#8C9E96]">Build tasks rightly. Turn messy notes into clear action plans.</p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-1 text-sm">
              <li><Link href="/#how-it-works" className="hover:text-white transition-colors inline-flex items-center min-h-[44px]">How It Works</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors inline-flex items-center min-h-[44px]">Pricing</Link></li>
              <li><Link href="/signup" className="hover:text-white transition-colors inline-flex items-center min-h-[44px]">Get Started</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-1 text-sm">
              <li><Link href="/terms" className="hover:text-white transition-colors inline-flex items-center min-h-[44px]">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors inline-flex items-center min-h-[44px]">Privacy Policy</Link></li>
              <li><Link href="/refund" className="hover:text-white transition-colors inline-flex items-center min-h-[44px]">Refund Policy</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Account</h3>
            <ul className="space-y-1 text-sm">
              <li><Link href="/login" className="hover:text-white transition-colors inline-flex items-center min-h-[44px]">Login</Link></li>
              <li><Link href="/signup" className="hover:text-white transition-colors inline-flex items-center min-h-[44px]">Sign Up</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors inline-flex items-center min-h-[44px]">Dashboard</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-gray-800 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <div>© {new Date().getFullYear()} TaskClarify. All rights reserved.</div>
          <div className="flex gap-4 sm:gap-6">
            <Link href="/terms" className="hover:text-white transition-colors inline-flex items-center min-h-[44px]">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition-colors inline-flex items-center min-h-[44px]">Privacy</Link>
            <Link href="/refund" className="hover:text-white transition-colors inline-flex items-center min-h-[44px]">Refund</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}