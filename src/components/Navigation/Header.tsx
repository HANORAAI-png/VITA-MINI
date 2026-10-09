import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#050814]/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark in display face */}
        <a
          href="#"
          className="text-xl font-bold tracking-tight text-white font-display hover:text-cyan-300 transition-colors"
        >
          VITA MINI
        </a>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <a href="#simulator" className="hover:text-cyan-300 transition-colors">
            Simulator
          </a>
          <a href="#architecture" className="hover:text-cyan-300 transition-colors">
            Architecture
          </a>
          <a href="#physics" className="hover:text-cyan-300 transition-colors">
            Propulsion Physics
          </a>
          <a href="#benchmarks" className="hover:text-cyan-300 transition-colors">
            Phantom Benchmarks
          </a>
          <a href="#roadmap" className="hover:text-cyan-300 transition-colors">
            Roadmap
          </a>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          <a
            href="#simulator"
            className="px-4 py-2 text-xs font-mono font-semibold text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-sm transition-colors whitespace-nowrap"
          >
            Launch Simulator
          </a>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-b border-slate-800 px-4 py-4 space-y-3">
          <a
            href="#simulator"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-300 hover:text-cyan-300"
          >
            Simulator
          </a>
          <a
            href="#architecture"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-300 hover:text-cyan-300"
          >
            Architecture
          </a>
          <a
            href="#physics"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-300 hover:text-cyan-300"
          >
            Propulsion Physics
          </a>
          <a
            href="#benchmarks"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-300 hover:text-cyan-300"
          >
            Phantom Benchmarks
          </a>
          <a
            href="#roadmap"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-300 hover:text-cyan-300"
          >
            Roadmap
          </a>
        </div>
      )}
    </header>
  );
};
