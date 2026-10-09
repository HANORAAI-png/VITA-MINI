import React, { useState } from 'react';
import { Compass, Gauge, Zap, Flame, ShieldCheck } from 'lucide-react';

export const PhysicsSection: React.FC = () => {
  // Interactive hydrodynamic calculator parameters
  const [fluidViscosity, setFluidViscosity] = useState<number>(3.5); // mPa·s
  const [bloodVelocity, setBloodVelocity] = useState<number>(2.0); // mm/s
  const [gradientSetting, setGradientSetting] = useState<number>(1.8); // T/m

  // Calculations
  const robotRadiusMeters = 0.000325; // 325 um radius = 650 um diameter
  const velocityMetersPerSec = bloodVelocity * 0.001;
  const viscosityPaSec = fluidViscosity * 0.001;

  // Stokes drag: F_drag = 6 * pi * eta * r * v (in nano-Newtons)
  const stokesDragNanoNewtons =
    6 * Math.PI * viscosityPaSec * robotRadiusMeters * velocityMetersPerSec * 1e9;

  // Magnetic force: F_mag = m * grad(B)
  const dipoleMoment = 5.2e-7;
  const magneticForceNanoNewtons = dipoleMoment * gradientSetting * 1e9;

  // Net acceleration margin
  const netForceMargin = magneticForceNanoNewtons - stokesDragNanoNewtons;

  // Reynolds number
  const reynoldsNumber = (1060 * velocityMetersPerSec * (robotRadiusMeters * 2)) / viscosityPaSec;

  return (
    <section id="physics" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-slate-800">
      <div className="max-w-3xl mb-12">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-2">
          <span>THEORETICAL FOUNDATION</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>OPTICAL PHOTO-ABLATION & MAGNETISM</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-display">
          Laser Photo-Ablation of Bad Cholesterol & Propulsion Physics
        </h2>
        <p className="mt-3 text-base text-slate-300">
          How VITA MINI selectively vaporizes arterial atheroma using focused 532 nm laser pulses while
          countering pulsatile hemodynamics with an 8-coil electromagnetic navigation system.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-12">
        {/* Left Column: Octahedral eMNS Imagery & Architecture (6 cols) */}
        <div className="lg:col-span-6">
          <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/60 shadow-xl relative">
            <div className="relative aspect-[4/3] w-full bg-slate-950">
              <img
                src="/src/assets/images/vita_magnetic_system_1790697012861.jpg"
                alt="Octahedral Electromagnetic Coil Navigation System for VITA MINI microrobots"
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
                <div className="text-cyan-400 font-semibold mb-0.5">8-COIL OCTAHEDRAL eMNS ACTUATION</div>
                <div className="text-slate-400 text-[11px]">
                  Generates rotating fields B &le; 50 mT and spatial gradients &nabla;B &le; 2.5 T/m to hold position during laser firing.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Laser Photolysis & Viscous Fluid Mechanics (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Card 1: Selective Lipid Photothermolysis */}
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
              <span className="uppercase text-amber-400">Selective Lipid Photolysis</span>
              <span>λ = 532 nm</span>
            </div>
            <h4 className="text-base font-bold text-white font-display mb-1.5">
              Why Laser Clears Bad Cholesterol Safely
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Oxidized low-density lipoproteins (bad cholesterol) and carotenoid-rich atheroma deposits possess
              a distinct optical absorption band around 532 nm. The focused micro-laser selectively vaporizes
              dense lipid globules into sub-micron vesicles without damaging the collagen and elastin layers of
              the healthy arterial wall.
            </p>
          </div>

          {/* Card 2: Stokes Drag vs Magnetic Force */}
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl">
            <div className="text-xs font-mono text-cyan-400 uppercase mb-1">Station-Keeping & Navigation Math</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Magnetic Gradient Pull</div>
                <div className="text-sm font-mono font-bold text-cyan-300 mt-1">
                  F<sub>mag</sub> = (m · &nabla;)B
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Stabilizes robot during laser delivery</div>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Stokes Hydrodynamic Drag</div>
                <div className="text-sm font-mono font-bold text-violet-300 mt-1">
                  F<sub>drag</sub> = 6πηrv
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Overcome by quad-fin stabilization</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Hydrodynamic & Magnetic Gradient Lab Calculator */}
      <div className="p-6 bg-slate-900/70 border border-slate-800 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-6">
          <div>
            <span className="text-[10px] font-mono uppercase text-cyan-400 tracking-wider">
              INTERACTIVE BENCHMARK UTILITY
            </span>
            <h3 className="text-lg font-bold font-display text-white mt-0.5">
              Hemodynamic Drag vs. External Magnetic Holding Pull Calculator
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            SIMULATING CORONARY & CAROTID FLOW CONDITIONS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Blood Viscosity (η):</span>
              <span className="text-cyan-400 font-semibold">{fluidViscosity.toFixed(1)} mPa·s</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="5.0"
              step="0.1"
              value={fluidViscosity}
              onChange={(e) => setFluidViscosity(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="text-[10px] font-mono text-slate-500 flex justify-between">
              <span>1.0 (Plasma)</span>
              <span>3.5 (Normal Blood)</span>
              <span>5.0 (High Hematocrit)</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Flow Velocity (v):</span>
              <span className="text-cyan-400 font-semibold">{bloodVelocity.toFixed(1)} mm/s</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.1"
              value={bloodVelocity}
              onChange={(e) => setBloodVelocity(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="text-[10px] font-mono text-slate-500 flex justify-between">
              <span>0.5 (Venule)</span>
              <span>2.0 (Arteriole)</span>
              <span>5.0 (Systolic Peak)</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Magnetic Gradient (∇B):</span>
              <span className="text-violet-400 font-semibold">{gradientSetting.toFixed(1)} T/m</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              value={gradientSetting}
              onChange={(e) => setGradientSetting(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-400"
            />
            <div className="text-[10px] font-mono text-slate-500 flex justify-between">
              <span>0.5 T/m (Low)</span>
              <span>1.8 T/m (Nominal)</span>
              <span>2.5 T/m (Max Holding)</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-950 rounded-xl border border-slate-800">
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Stokes Drag Force</div>
            <div className="text-lg font-mono font-bold text-amber-400 mt-0.5 tabular-nums">
              {stokesDragNanoNewtons.toFixed(2)}{' '}
              <span className="text-xs font-normal text-slate-400">nN</span>
            </div>
          </div>

          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Magnetic Holding Pull</div>
            <div className="text-lg font-mono font-bold text-cyan-300 mt-0.5 tabular-nums">
              {magneticForceNanoNewtons.toFixed(2)}{' '}
              <span className="text-xs font-normal text-slate-400">nN</span>
            </div>
          </div>

          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Holding Margin</div>
            <div
              className={`text-lg font-mono font-bold mt-0.5 tabular-nums ${
                netForceMargin > 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {netForceMargin > 0 ? `+${netForceMargin.toFixed(2)}` : netForceMargin.toFixed(2)}{' '}
              <span className="text-xs font-normal text-slate-400">nN</span>
            </div>
          </div>

          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Reynolds Number (Re)</div>
            <div className="text-lg font-mono font-bold text-slate-200 mt-0.5 tabular-nums">
              {reynoldsNumber.toFixed(5)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
