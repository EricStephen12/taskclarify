'use client';

import Link from 'next/link';
import { useState } from 'react';

interface HeaderProps {
  isAuthenticated?: boolean;
  onLogout?: () => void;
}

export default function Header({ isAuthenticated, onLogout }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = () => setMobileMenuOpen(false);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-[#E5E0D5] bg-[#FDFBF7]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2E5C55]/10 text-[#2E5C55]">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-[#1A2E28]">TaskClarify</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link className="text-sm font-medium text-[#5C6B64] hover:text-[#2E5C55] transition-colors" href="/#how-it-works">How it Works</Link>
          <Link className="text-sm font-medium text-[#5C6B64] hover:text-[#2E5C55] transition-colors" href="/pricing">Pricing</Link>
          <Link className="text-sm font-medium text-[#5C6B64] hover:text-[#2E5C55] transition-colors" href="/#founder">About</Link>
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="hidden md:block text-sm font-medium text-[#1A2E28] hover:text-[#2E5C55]">
                Dashboard
              </Link>
              <button
                onClick={onLogout}
                className="h-9 items-center rounded-lg bg-[#E5E0D5]/50 px-4 text-sm font-medium text-[#1A2E28] hover:bg-[#E5E0D5] transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <>
              <Link className="hidden md:flex h-9 items-center px-4 text-sm font-medium text-[#1A2E28] hover:bg-[#E5E0D5]/50 rounded-lg transition-colors" href="/login">Log in</Link>
              <Link className="hidden sm:flex h-9 items-center rounded-lg bg-[#2E5C55] px-4 text-sm font-medium text-white shadow-sm hover:bg-[#234A42] transition-all hover:shadow-[0_0_15px_rgba(46,92,85,0.3)]" href="/signup">Download</Link>
            </>
          )}

          {/* Hamburger Menu Button - Mobile Only */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center w-11 h-11 rounded-lg hover:bg-[#E5E0D5]/50 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6 text-[#1A2E28]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-[#1A2E28]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-[#FDFBF7] z-40 border-t border-[#E5E0D5]">
          <nav className="flex flex-col p-4 space-y-2">
            <Link
              href="/#how-it-works"
              onClick={handleNavClick}
              className="flex items-center h-12 px-4 text-base font-medium text-[#1A2E28] hover:bg-[#E5E0D5]/30 rounded-lg transition-colors"
            >
              How it Works
            </Link>
            <Link
              href="/pricing"
              onClick={handleNavClick}
              className="flex items-center h-12 px-4 text-base font-medium text-[#1A2E28] hover:bg-[#E5E0D5]/30 rounded-lg transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/#founder"
              onClick={handleNavClick}
              className="flex items-center h-12 px-4 text-base font-medium text-[#1A2E28] hover:bg-[#E5E0D5]/30 rounded-lg transition-colors"
            >
              About
            </Link>
            <hr className="my-2 border-[#E5E0D5]" />

            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={handleNavClick}
                  className="flex items-center h-12 px-4 text-base font-medium text-[#1A2E28] hover:bg-[#E5E0D5]/30 rounded-lg transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => { handleNavClick(); onLogout?.(); }}
                  className="flex w-full items-center h-12 px-4 text-base font-medium text-[#5C6B64] hover:bg-[#E5E0D5]/30 rounded-lg transition-colors text-left"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={handleNavClick}
                  className="flex items-center h-12 px-4 text-base font-medium text-[#5C6B64] hover:bg-[#E5E0D5]/30 rounded-lg transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  onClick={handleNavClick}
                  className="flex items-center justify-center h-12 px-4 text-base font-medium text-white bg-[#2E5C55] hover:bg-[#234A42] rounded-lg transition-colors"
                >
                  Download
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
