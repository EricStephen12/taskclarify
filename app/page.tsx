import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f6f8]">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-gray-100 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#185adc]/10 text-[#185adc]">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-[#111318]">TaskClarify</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a className="text-sm font-medium text-[#636f88] hover:text-[#185adc] transition-colors" href="#how-it-works">How it Works</a>
            <Link className="text-sm font-medium text-[#636f88] hover:text-[#185adc] transition-colors" href="/pricing">Pricing</Link>
            <a className="text-sm font-medium text-[#636f88] hover:text-[#185adc] transition-colors" href="#founder">About</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link className="hidden md:flex h-9 items-center px-4 text-sm font-medium text-[#111318] hover:bg-gray-100 rounded-lg transition-colors" href="/login">Log in</Link>
            <Link className="flex h-9 items-center rounded-lg bg-[#185adc] px-4 text-sm font-medium text-white shadow-sm hover:bg-[#1244a8] transition-all hover:shadow-[0_0_15px_rgba(24,90,220,0.3)]" href="/signup">Get Started</Link>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <Hero />
        {/* Trust Bar */}
        <TrustBar />
        {/* How It Works */}
        <HowItWorks />
        {/* Founder Story */}
        <FounderStory />
        {/* Features */}
        <Features />
        {/* CTA */}
        <CTA />
      </main>

      <Footer />
    </div>
  );
}


function Hero() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-100 blur-3xl opacity-50 pointer-events-none"></div>
      <div className="absolute top-1/2 -right-24 h-96 w-96 rounded-full bg-indigo-50 blur-3xl opacity-60 pointer-events-none"></div>
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="flex flex-col gap-8 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-[#636f88] shadow-sm w-fit">
              <span className="flex h-2 w-2 rounded-full bg-[#185adc] animate-pulse"></span>
              New: v2.0 AI Engine Live
            </div>
            
            <h1 className="text-5xl lg:text-[4rem] font-black leading-[1.1] tracking-tight text-[#111318]">
              Stop Building the <br/>
              <span className="text-[#185adc] relative inline-block">
                Wrong Thing
                <svg className="absolute -bottom-2 w-full h-3 text-[#185adc]/30" preserveAspectRatio="none" viewBox="0 0 100 10">
                  <path d="M0 5 Q 50 10 100 5" fill="none" stroke="currentColor" strokeWidth="3"/>
                </svg>
              </span>
            </h1>
            
            <p className="text-lg text-[#636f88] leading-relaxed max-w-lg">
              Turn messy meeting notes into clear, actionable requirements in seconds using advanced AI. Don't let ambiguity kill your product momentum.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link href="/signup" className="flex h-12 items-center justify-center rounded-lg bg-[#185adc] px-8 text-base font-semibold text-white shadow-lg shadow-[#185adc]/25 hover:bg-[#1244a8] hover:translate-y-[-1px] transition-all duration-200">
                Start for Free
              </Link>
              <Link href="#how-it-works" className="flex h-12 items-center justify-center rounded-lg border border-gray-200 bg-white px-8 text-base font-semibold text-[#111318] hover:bg-gray-50 hover:border-gray-300 transition-all duration-200">
                View Demo
              </Link>
            </div>
            
            <div className="flex items-center gap-4 pt-4 text-sm text-[#636f88]">
              <div className="flex -space-x-2">
                {['👩‍💻', '🧑‍💼', '👨‍💻', '👩‍🎨', '🧑‍🔬'].map((emoji, i) => (
                  <div key={i} className="inline-flex h-8 w-8 items-center justify-center rounded-full ring-2 ring-white bg-gradient-to-br from-blue-100 to-indigo-100 text-sm">
                    {emoji}
                  </div>
                ))}
              </div>
              <span>Loved by 2,000+ developers</span>
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
    <div className="relative lg:h-[600px] flex items-center justify-center">
      <div className="relative w-full aspect-square lg:aspect-auto h-full max-h-[500px]">
        <div className="absolute top-10 right-10 w-full h-full bg-gray-100 rounded-2xl -rotate-6 transform origin-bottom-right z-0 border border-gray-200"></div>
        <div className="absolute top-5 right-5 w-full h-full bg-gray-50 rounded-2xl -rotate-3 transform origin-bottom-right z-10 border border-gray-200 shadow-sm"></div>
        <div className="absolute inset-0 bg-white rounded-2xl shadow-2xl border border-gray-100 z-20 overflow-hidden flex flex-col">
          {/* Window Header */}
          <div className="h-12 border-b border-gray-100 flex items-center px-4 gap-2 bg-gray-50/50">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="ml-4 h-2 w-24 bg-gray-200 rounded-full"></div>
          </div>
          {/* Content */}
          <div className="p-6 flex flex-col gap-6 flex-1">
            <div className="flex justify-between items-start">
              <div>
                <div className="h-6 w-48 bg-gray-900 rounded-md mb-2"></div>
                <div className="h-4 w-32 bg-gray-200 rounded-md"></div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Completed</span>
            </div>
            <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[#185adc] text-sm">✨</span>
                <span className="text-xs font-bold text-[#185adc] uppercase tracking-wider">AI Analysis</span>
              </div>
              <div className="space-y-2">
                <div className="h-2 w-full bg-blue-200/50 rounded-full"></div>
                <div className="h-2 w-5/6 bg-blue-200/50 rounded-full"></div>
                <div className="h-2 w-4/6 bg-blue-200/50 rounded-full"></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex gap-3 items-start p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors">
                <div className="mt-1 w-4 h-4 rounded border border-gray-300"></div>
                <div className="flex-1">
                  <div className="h-4 w-3/4 bg-gray-800 rounded mb-1.5"></div>
                  <div className="h-3 w-full bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="flex gap-3 items-start p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors">
                <div className="mt-1 w-4 h-4 rounded border border-gray-300"></div>
                <div className="flex-1">
                  <div className="h-4 w-1/2 bg-gray-800 rounded mb-1.5"></div>
                  <div className="h-3 w-5/6 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


function TrustBar() {
  return (
    <section className="border-y border-gray-100 bg-white py-8">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
        <p className="text-sm font-medium text-[#636f88] mb-6">TRUSTED BY PRODUCT TEAMS AT</p>
        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          {['ACME Corp', 'GlobalTech', 'Nebula', 'Starlight', 'Umbrella'].map((name, i) => (
            <div key={i} className="font-bold text-xl text-gray-400 flex items-center gap-2">
              <div className={`w-6 h-6 bg-gray-400 ${i === 1 ? 'rounded-full border-4 border-gray-400 bg-transparent' : i === 2 ? 'rotate-45' : i === 3 ? 'border-b-4 border-gray-400 bg-transparent' : 'rounded-sm'}`}></div>
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="py-24 bg-[#f6f6f8]" id="how-it-works">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-[#185adc] font-semibold tracking-wide uppercase text-sm mb-3">The Process</h2>
          <h3 className="text-3xl md:text-4xl font-bold text-[#111318] tracking-tight mb-4">From Chaos to Clarity in 3 Steps</h3>
          <p className="text-[#636f88] text-lg">Our AI analyzes your raw notes, identifies key requirements, and formats them into developer-ready specifications instantly.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <StepCard 
            num="1" 
            icon="📋" 
            title="Paste Notes" 
            desc="Simply copy your messy meeting notes, brain dumps, or Slack threads into the editor."
            preview={
              <div className="mt-auto bg-gray-50 rounded-lg p-3 border border-gray-100 font-mono text-xs text-gray-500 h-32 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50/90 z-10"></div>
                <p>Meeting w/ Sarah:</p>
                <p>- Needs a login button top right</p>
                <p>- Dark mode is a must have!!</p>
                <p>- Maybe add email notifs?</p>
                <p>- Deadline: next friday...</p>
              </div>
            }
          />
          <StepCard 
            num="2" 
            icon="🧠" 
            title="AI Processing" 
            desc="Our context-aware engine analyzes intent, technical details, and user flows."
            preview={
              <div className="mt-auto bg-gray-900 rounded-lg p-3 border border-gray-800 flex items-center justify-center h-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#185adc]/20 to-purple-500/20 z-0"></div>
                <div className="z-10 flex flex-col items-center gap-2">
                  <span className="text-white text-3xl animate-pulse">✨</span>
                  <div className="h-1 w-16 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-[#185adc] w-1/2 animate-pulse"></div>
                  </div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest">Thinking</span>
                </div>
              </div>
            }
          />
          <StepCard 
            num="3" 
            icon="✅" 
            title="View Results" 
            desc="Receive perfectly formatted user stories and acceptance criteria ready for your development team."
            preview={
              <div className="mt-auto bg-white rounded-lg p-3 border border-gray-200 shadow-sm h-32 overflow-hidden flex flex-col gap-2">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-[10px] font-bold text-gray-800">TICKET-104</span>
                </div>
                <div className="h-2 w-3/4 bg-gray-200 rounded-full"></div>
                <div className="h-2 w-full bg-gray-100 rounded-full"></div>
                <div className="h-2 w-1/2 bg-gray-100 rounded-full"></div>
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
    <div className="group relative flex flex-col bg-white rounded-2xl p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.02),0_2px_4px_-1px_rgba(0,0,0,0.02)] border border-gray-100 hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05),0_4px_6px_-2px_rgba(0,0,0,0.025)] transition-all duration-300">
      <div className="absolute -top-4 -right-4 w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-[#185adc] font-bold text-xl border-4 border-white shadow-sm">
        {num}
      </div>
      <div className="h-12 w-12 rounded-lg bg-gray-50 flex items-center justify-center text-2xl mb-6 group-hover:bg-[#185adc] group-hover:text-white transition-colors duration-300">
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
    <section className="py-24 bg-white relative overflow-hidden" id="founder">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 relative">
            <div className="aspect-[4/5] w-full rounded-2xl overflow-hidden bg-gradient-to-br from-[#185adc] to-purple-600 relative shadow-2xl flex items-center justify-center">
              <div className="text-[120px]">👨‍💻</div>
            </div>
            <div className="absolute -bottom-8 -right-8 h-24 w-24 bg-[#185adc] text-white rounded-full flex items-center justify-center text-6xl font-serif z-20 shadow-[0_0_15px_rgba(24,90,220,0.3)]">
              "
            </div>
          </div>
          
          <div className="lg:col-span-7 lg:pl-12">
            <h2 className="text-sm font-bold tracking-widest text-[#636f88] uppercase mb-4">Founder's Story</h2>
            <h3 className="text-3xl md:text-5xl font-bold text-[#111318] leading-tight mb-8">
              "I built TaskClarify because I was tired of guessing."
            </h3>
            
            <div className="space-y-6 text-[#636f88]">
              <p className="leading-relaxed text-lg">
                I'm 22, managing a complex platform with <strong className="text-[#111318] font-medium">180 users including VIPs</strong>. My boss would explain features and I'd think I understood... then realize halfway through building that I missed key details.
              </p>
              <p className="leading-relaxed text-lg">
                I spent <strong className="text-[#111318] font-medium">3 weeks building a feature nobody asked for</strong>. The meeting notes said "add user preferences." I built an entire settings page with 20+ options. Turns out, they just wanted a "remember my language" checkbox. 🤦‍♂️
              </p>
              <p className="leading-relaxed text-lg">
                That's when I realized: <strong className="text-[#111318] font-medium">the problem isn't coding—it's understanding what to code.</strong>
              </p>
              <p className="leading-relaxed text-lg">
                TaskClarify forces you to identify unclear points BEFORE you start building. No more "that's not what I meant" moments.
              </p>
            </div>
            
            <div className="mt-10 flex items-center gap-4">
              <div>
                <p className="text-lg font-bold text-[#111318]">Eric</p>
                <p className="text-sm text-[#636f88]">Founder & Developer</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


function Features() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="max-w-2xl mb-16">
          <h2 className="text-4xl font-bold tracking-tight text-[#111318]">Everything You Need to Ship Fast</h2>
          <p className="mt-4 text-lg text-[#636f88]">From ambiguous notes to production-ready specs. Our AI handles the heavy lifting so your team can focus on building.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: "📝",
              title: "Smart Parsing",
              description: "Transforms messy notes into structured requirements with contextual understanding."
            },
            {
              icon: "🔍",
              title: "Ambiguity Detection",
              description: "Identifies unclear points and asks clarifying questions before development begins."
            },
            {
              icon: "🔄",
              title: "Real-time Sync",
              description: "Updates requirements instantly as your notes evolve during the project lifecycle."
            },
            {
              icon: "🎯",
              title: "Acceptance Criteria",
              description: "Generates testable acceptance criteria for every user story automatically."
            },
            {
              icon: "📊",
              title: "Impact Analysis",
              description: "Estimates development effort and identifies dependencies for each requirement."
            },
            {
              icon: "🔌",
              title: "Tool Integration",
              description: "Exports directly to Jira, Linear, Notion, and your favorite project management tools."
            }
          ].map((feature, index) => (
            <div key={index} className="flex flex-col bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-gray-200 transition-colors duration-200">
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-[#111318] mb-2">{feature.title}</h3>
              <p className="text-[#636f88] flex-1">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-[#185adc] to-purple-600 p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Ship Better Products?</h2>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-8">Join thousands of teams that turn ambiguous requirements into clear action plans.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="flex h-12 items-center justify-center rounded-lg bg-white px-8 text-base font-semibold text-[#185adc] shadow-lg hover:translate-y-[-2px] transition-transform duration-200">
              Start Free Trial
            </Link>
            <Link href="#" className="flex h-12 items-center justify-center rounded-lg border border-white/30 bg-transparent px-8 text-base font-semibold text-white hover:bg-white/10 transition-colors duration-200">
              Schedule Demo
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#111318] text-gray-400 py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#185adc]/10 text-[#185adc]">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              </div>
              <span className="text-lg font-bold tracking-tight text-white">TaskClarify</span>
            </div>
            <p className="text-sm mb-6">Turn messy notes into clear requirements. Build the right thing, faster.</p>
            <div className="flex gap-4">
              {['twitter', 'github', 'linkedin'].map((social, i) => (
                <a key={i} href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">{social}</span>
                  <div className="h-5 w-5 bg-gray-600 rounded"></div>
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-3 text-sm">
              {['Features', 'How It Works', 'Pricing', 'Integrations'].map((item, i) => (
                <li key={i}>
                  <a href="#" className="hover:text-white transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-3 text-sm">
              {['Documentation', 'Blog', 'Community', 'Support'].map((item, i) => (
                <li key={i}>
                  <a href="#" className="hover:text-white transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-3 text-sm">
              {['About', 'Careers', 'Contact', 'Legal'].map((item, i) => (
                <li key={i}>
                  <a href="#" className="hover:text-white transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="pt-8 mt-8 border-t border-gray-800 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <div>© 2023 TaskClarify. All rights reserved.</div>
          <div className="flex gap-6">
            {['Terms', 'Privacy', 'Cookies'].map((item, i) => (
              <a key={i} href="#" className="hover:text-white transition-colors">{item}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}