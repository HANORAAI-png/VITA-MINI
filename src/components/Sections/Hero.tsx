import React from 'react';
import { ArrowRight, Zap, ShieldCheck } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 border-b border-slate-800">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-violet-600/15 via-cyan-500/15 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Mission Narrative & CTAs (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-start">
            {/* Clean unboxed domain metadata kicker */}
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-4 tracking-wide">
              <span>MEDICAL MICROROBOTICS</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>ARTERIAL LASER ABLATION</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>RESEARCH CONCEPT</span>
            </div>

            {/* Display Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-display text-balance leading-[1.1]">
              Target Precisely.{' '}
              <span className="bg-gradient-to-r from-violet-400 via-sky-300 to-amber-300 bg-clip-text text-transparent">
                Laser Ablate Bad Cholesterol.
              </span>{' '}
              Retrieve Completely.
            </h1>

            {/* Sub-headline */}
            <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              VITA MINI is a sub-millimeter untethered medical microrobotic platform engineered for targeted
              arterial plaque intervention. Encased in a biocompatible translucent crystal chassis with four
              hydrofoil fins, it navigates complex blood vessels and fires a precision micro-laser to
              selectively dissolve oxidized LDL cholesterol deposits, restoring arterial blood flow before
              docking for complete extraction.
            </p>

            {/* Action buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#simulator"
                className="px-6 py-3 text-sm font-semibold text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-lg hover:shadow-cyan-500/20 transition-all flex items-center gap-2 group"
              >
                <span>Engage Live Simulator</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>

              <a
                href="#architecture"
                className="px-6 py-3 text-sm font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors"
              >
                Laser Pod Architecture
              </a>
            </div>

            {/* Micro-specs inline telemetry strip */}
            <div className="mt-10 pt-6 border-t border-slate-800/80 w-full grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
              <div>
                <div className="text-[11px] font-mono uppercase text-slate-400">Scale Envelope</div>
                <div className="text-xl font-mono font-bold text-white mt-0.5 tabular-nums">
                  650 <span className="text-xs font-normal text-slate-400">µm</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Micro-vessel access</div>
              </div>

              <div>
                <div className="text-[11px] font-mono uppercase text-slate-400">Target Therapy</div>
                <div className="text-xl font-mono font-bold text-amber-300 mt-0.5 tabular-nums">
                  Micro-Laser
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Bad cholesterol removal</div>
              </div>

              <div>
                <div className="text-[11px] font-mono uppercase text-slate-400">Locomotion</div>
                <div className="text-xl font-mono font-bold text-violet-300 mt-0.5 tabular-nums">
                  Quad-Fin
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Hydrofoil stabilization</div>
              </div>

              <div>
                <div className="text-[11px] font-mono uppercase text-slate-400">Retrieval Efficacy</div>
                <div className="text-xl font-mono font-bold text-emerald-400 mt-0.5 tabular-nums">
                  100%
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Zero residual debris</div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero High-Fidelity Render Showcase (5 cols) */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/60 shadow-2xl">
              {/* Generated Hero Image featuring VITA MINI laser chassis */}
              <div className="relative aspect-[3/4] w-full bg-slate-950 overflow-hidden">
                <img
                  src="/src/assets/images/vita_mini_laser_pod_1790741223385.jpg"
                  alt="VITA MINI Translucent Laser Microrobot with 4 Hydrofoil Fins"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.classList.add('flex', 'items-center', 'justify-center', 'bg-slate-950');
                    }
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050814] via-transparent to-transparent opacity-70 pointer-events-none" />

                {/* Overlaid Micro-HUD badge */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-slate-300 bg-slate-950/85 backdrop-blur-md px-3.5 py-2 rounded-lg border border-slate-800">
                  <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    VITA MINI LASER POD
                  </span>
                  <span className="text-amber-400 font-mono">532nm Photonic Emitter</span>
                </div>
              </div>

              {/* Hardware Highlights under image */}
              <div className="p-4 grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80">
                  <div className="text-slate-400 text-[10px] uppercase">Chassis Material</div>
                  <div className="text-white font-semibold mt-0.5">Bio-Crystal Polymer</div>
                  <div className="text-slate-500 text-[10px] mt-0.5">Optical transparency</div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80">
                  <div className="text-slate-400 text-[10px] uppercase">Laser Ablation</div>
                  <div className="text-amber-300 font-semibold mt-0.5">LDL Plaque Removal</div>
                  <div className="text-slate-500 text-[10px] mt-0.5">Thermal safety cap 41°C</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
