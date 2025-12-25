'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = () => setMobileMenuOpen(false);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-gray-100 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#185adc]/10 text-[#185adc]">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-[#111318]">TaskClarify</span>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <a className="text-sm font-medium text-[#636f88] hover:text-[#185adc] transition-colors" href="#how-it-works">How it Works</a>
          <Link className="text-sm font-medium text-[#636f88] hover:text-[#185adc] transition-colors" href="/pricing">Pricing</Link>
          <a className="text-sm font-medium text-[#636f88] hover:text-[#185adc] transition-colors" href="#founder">About</a>
        </nav>
        
        <div className="flex items-center gap-3">
          <Link className="hidden md:flex h-9 items-center px-4 text-sm font-medium text-[#111318] hover:bg-gray-100 rounded-lg transition-colors" href="/login">Log in</Link>
          <Link className="hidden sm:flex h-9 items-center rounded-lg bg-[#185adc] px-4 text-sm font-medium text-white shadow-sm hover:bg-[#1244a8] transition-all hover:shadow-[0_0_15px_rgba(24,90,220,0.3)]" href="/signup">Get Started</Link>
          
          {/* Hamburger Menu Button - Mobile Only */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center w-11 h-11 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6 text-[#111318]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-[#111318]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-white z-40">
          <nav className="flex flex-col p-4 space-y-2">
            <a 
              href="#how-it-works" 
              onClick={handleNavClick}
              className="flex items-center h-12 px-4 text-base font-medium text-[#111318] hover:bg-gray-50 rounded-lg transition-colors"
            >
              How it Works
            </a>
            <Link 
              href="/pricing" 
              onClick={handleNavClick}
              className="flex items-center h-12 px-4 text-base font-medium text-[#111318] hover:bg-gray-50 rounded-lg transition-colors"
            >
              Pricing
            </Link>
            <a 
              href="#founder" 
              onClick={handleNavClick}
              className="flex items-center h-12 px-4 text-base font-medium text-[#111318] hover:bg-gray-50 rounded-lg transition-colors"
            >
              About
            </a>
            <hr className="my-2 border-gray-100" />
            <Link 
              href="/login" 
              onClick={handleNavClick}
              className="flex items-center h-12 px-4 text-base font-medium text-[#636f88] hover:bg-gray-50 rounded-lg transition-colors"
            >
              Log in
            </Link>
            <Link 
              href="/signup" 
              onClick={handleNavClick}
              className="flex items-center justify-center h-12 px-4 text-base font-medium text-white bg-[#185adc] hover:bg-[#1244a8] rounded-lg transition-colors"
            >
              Get Started
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
