import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#03060f] border-t border-slate-800/80 py-12 px-4 sm:px-6 lg:px-8 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <a href="#" className="text-lg font-bold font-display text-white tracking-tight">
            VITA MINI
          </a>
          <p className="mt-1 text-slate-400 max-w-md">
            Target Precisely. Treat Locally. Retrieve Completely.
            <br />
            An open academic research project in sub-millimeter medical microrobotics and magnetic navigation.
          </p>
        </div>

        <div className="flex flex-wrap gap-6 text-slate-400">
          <a href="#simulator" className="hover:text-white transition-colors">
            Simulator
          </a>
          <a href="#architecture" className="hover:text-white transition-colors">
            Architecture
          </a>
          <a href="#physics" className="hover:text-white transition-colors">
            Propulsion Physics
          </a>
          <a href="#benchmarks" className="hover:text-white transition-colors">
            Phantom Benchmarks
          </a>
          <a href="#roadmap" className="hover:text-white transition-colors">
            Roadmap
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] text-slate-400">
        <p>
          &copy; {new Date().getFullYear()} VITA MINI Research Group. Concept-stage research platform. Not approved for human clinical use.
        </p>
        <p className="font-mono text-slate-400">
          IN-SILICO & PHANTOM BENCHMARK · ISO 13485 RESEARCH QUALITY PRINCIPLES
        </p>
      </div>
    </footer>
  );
};
