'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg group-hover:scale-110 transition-transform">
              ♾
            </div>
            <span className="text-white font-bold text-xl tracking-tight">
              File<span className="text-violet-400">Sphere</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">
              All Tools
            </Link>
            <Link href="/#features" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">
              Features
            </Link>
            <a
              href="mailto:support@example.com"
              className="text-slate-300 hover:text-white transition-colors text-sm font-medium"
            >
              Support
            </a>
            <Link
              href="/"
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all hover:shadow-lg hover:shadow-violet-500/25 active:scale-95"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-slate-300 hover:text-white p-2 rounded-lg hover:bg-white/10"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-white/10 mt-2 pt-4 space-y-2 animate-fade-in">
            <Link href="/" className="block text-slate-300 hover:text-white py-2 px-3 rounded-lg hover:bg-white/10 transition-colors">
              All Tools
            </Link>
            <Link href="/" className="block text-slate-300 hover:text-white py-2 px-3 rounded-lg hover:bg-white/10 transition-colors">
              Features
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
