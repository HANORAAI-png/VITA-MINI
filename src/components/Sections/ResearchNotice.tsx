import React from 'react';
import { AlertCircle } from 'lucide-react';

export const ResearchNotice: React.FC = () => {
  return (
    <div className="bg-amber-950/40 border-y border-amber-500/30 px-4 py-2.5 text-slate-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-mono text-amber-300 font-semibold tracking-wide uppercase">
            CONCEPT-STAGE RESEARCH PROJECT
          </span>
          <span className="text-slate-400 hidden md:inline">·</span>
          <span className="text-slate-300 hidden md:inline">
            VITA MINI is an academic microrobotics research initiative, NOT a clinically validated medical device.
            All simulations are conceptual in-silico models and do not represent real human clinical performance.
          </span>
        </div>
        <span className="text-[11px] font-mono text-amber-400/80 whitespace-nowrap hidden sm:inline">
          TRL 3 · IN-SILICO PHANTOM VALIDATION
        </span>
      </div>
    </div>
  );
};
