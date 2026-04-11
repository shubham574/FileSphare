'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="fixed top-0 w-full z-50 glass-nav">
      <div className="flex justify-between items-center h-16 px-8 max-w-7xl mx-auto">
        <Link href="/" className="text-xl font-bold tracking-tighter text-on-surface">
          FileSphere
        </Link>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-primary transition-colors focus:outline-none"
            aria-label="Toggle Dark Mode"
          >
            {mounted && theme === 'dark' ? (
               <span className="material-symbols-outlined text-xl">light_mode</span>
            ) : (
               <span className="material-symbols-outlined text-xl">dark_mode</span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
