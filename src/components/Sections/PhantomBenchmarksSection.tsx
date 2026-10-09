import React from 'react';
import { CheckCircle2, FileSpreadsheet, Sparkles, Award } from 'lucide-react';

export const PhantomBenchmarksSection: React.FC = () => {
  return (
    <section id="benchmarks" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-slate-800">
      <div className="max-w-3xl mb-12">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-2">
          <span>EMPIRICAL BENCHMARKING</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>SILICONE ARTERIAL ATHEROMA MODELS</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-display">
          In-Vitro Phantom Studies & Cholesterol Removal Benchmarks
        </h2>
        <p className="mt-3 text-base text-slate-300">
          VITA MINI has been evaluated in anatomically accurate silicone vascular phantoms replicating human
          coronary and carotid bifurcations lined with synthetic atherosclerotic bad cholesterol plaques
          under pulsatile blood flow.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
        {/* Left Column: Vascular Phantom Imagery (6 cols) */}
        <div className="lg:col-span-6">
          <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/60 shadow-xl relative">
            <div className="relative aspect-[4/3] w-full bg-slate-950">
              <img
                src="/src/assets/images/vita_vascular_phantom_1790697026245.jpg"
                alt="Silicone microvascular phantom channel showing fluorescent contrast dye and streamlines"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.classList.add('flex', 'items-center', 'justify-center', 'bg-slate-950');
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80 pointer-events-none" />

              <div className="absolute bottom-3 left-3 right-3 p-3 bg-slate-950/85 backdrop-blur-md rounded-xl border border-slate-800 text-xs font-mono text-slate-300">
                <div className="text-cyan-400 font-semibold mb-0.5">3D SILICONE ARTERIAL PHANTOM RIG</div>
                <div className="text-slate-400 text-[11px]">
                  Refractive-index matched blood analogue with synthetic cholesterol plaque deposits.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Radar Calibration Chart (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-4 border-b border-slate-800 pb-3">
            <span className="text-cyan-400 font-semibold uppercase">BENCHMARK RADAR CALIBRATION</span>
            <span>N = 120 TRIALS</span>
          </div>

          {/* SVG Radar Chart */}
          <div className="flex items-center justify-center py-4">
            <svg viewBox="0 0 300 260" className="w-full max-w-[320px] overflow-visible">
              {[0.2, 0.4, 0.6, 0.8, 1.0].map((level, i) => (
                <polygon
                  key={i}
                  points="150,30 245,95 210,210 90,210 55,95"
                  transform={`scale(${level})`}
                  transform-origin="150 130"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="1"
                  strokeDasharray={i === 4 ? 'none' : '3 3'}
                />
              ))}

              <line x1="150" y1="130" x2="150" y2="30" stroke="#475569" strokeWidth="1" />
              <line x1="150" y1="130" x2="245" y2="95" stroke="#475569" strokeWidth="1" />
              <line x1="150" y1="130" x2="210" y2="210" stroke="#475569" strokeWidth="1" />
              <line x1="150" y1="130" x2="90" y2="210" stroke="#475569" strokeWidth="1" />
              <line x1="150" y1="130" x2="55" y2="95" stroke="#475569" strokeWidth="1" />

              {/* Data polygon (Cholesterol clearance: 98%, Retrieval: 100%, Laser Containment: 96%, Wall Safety: 94%, Targeting: 98%) */}
              <polygon
                points="150,34 240,99 210,210 94,204 60,98"
                fill="rgba(6, 182, 212, 0.25)"
                stroke="#06b6d4"
                strokeWidth="2.5"
              />

              <circle cx="150" cy="34" r="4" fill="#38bdf8" />
              <circle cx="240" cy="99" r="4" fill="#38bdf8" />
              <circle cx="210" cy="210" r="4" fill="#38bdf8" />
              <circle cx="94" cy="204" r="4" fill="#38bdf8" />
              <circle cx="60" cy="98" r="4" fill="#38bdf8" />

              <text x="150" y="18" textAnchor="middle" fill="#f1f5f9" fontSize="10" fontFamily="monospace">
                Plaque Vaporization (98%)
              </text>
              <text x="255" y="98" textAnchor="start" fill="#f1f5f9" fontSize="10" fontFamily="monospace">
                Target Lock (98%)
              </text>
              <text
                x="215"
                y="228"
                textAnchor="middle"
                fill="#34d399"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
              >
                100% Retrieval
              </text>
              <text x="85" y="228" textAnchor="middle" fill="#f1f5f9" fontSize="10" fontFamily="monospace">
                Thermal Safety (96%)
              </text>
              <text x="45" y="98" textAnchor="end" fill="#f1f5f9" fontSize="10" fontFamily="monospace">
                Endothelial Wall (94%)
              </text>
            </svg>
          </div>

          <p className="text-xs text-slate-400 mt-2 text-center">
            Evaluated across 120 in-silico trials with flow speeds ranging from 0.8 mm/s to 4.5 mm/s.
          </p>
        </div>
      </div>

      {/* Quantitative Empirical Benchmark Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold font-mono uppercase text-white">
              Benchmarking Telemetry Matrix
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500">STANDARDIZED EMPIRICAL METRICS</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/70 text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Evaluation Parameter</th>
                <th className="py-3 px-4">Sample Size (N)</th>
                <th className="py-3 px-4">Measured Outcome</th>
                <th className="py-3 px-4">Clinical Benchmark</th>
                <th className="py-3 px-4">Result Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-3.5 px-4 font-semibold text-white">Catheter Docking Retrieval Rate</td>
                <td className="py-3.5 px-4 tabular-nums">120 trials</td>
                <td className="py-3.5 px-4 font-bold text-emerald-400 tabular-nums">100% (120/120)</td>
                <td className="py-3.5 px-4 text-slate-400">&ge; 99.0%</td>
                <td className="py-3.5 px-4">
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>ZERO RESIDUAL DETECTED</span>
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-white">Bad Cholesterol Plaque Reduction</td>
                <td className="py-3.5 px-4 tabular-nums">120 trials</td>
                <td className="py-3.5 px-4 font-bold text-amber-300 tabular-nums">98.2% Clearance</td>
                <td className="py-3.5 px-4 text-slate-400">&ge; 75.0% Lumen Gain</td>
                <td className="py-3.5 px-4">
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>LUMEN RESTORED</span>
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-white">Laser Spot Accuracy</td>
                <td className="py-3.5 px-4 tabular-nums">120 trials</td>
                <td className="py-3.5 px-4 font-bold text-cyan-300 tabular-nums">&plusmn; 14.2 µm</td>
                <td className="py-3.5 px-4 text-slate-400">&le; &plusmn; 50.0 µm</td>
                <td className="py-3.5 px-4">
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>MICRON PRECISION</span>
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-white">Tissue Peak Temperature</td>
                <td className="py-3.5 px-4 tabular-nums">60 laser firings</td>
                <td className="py-3.5 px-4 font-bold text-slate-200 tabular-nums">40.8 &plusmn; 0.4°C</td>
                <td className="py-3.5 px-4 text-slate-400">&le; 43.0°C (thermal cap)</td>
                <td className="py-3.5 px-4">
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>SAFE PHOTOTHERMAL ZONE</span>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
