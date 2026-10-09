import React, { useState } from 'react';
import { Layers, Shield, Sparkles, Zap, Magnet, Activity } from 'lucide-react';

interface Subsystem {
  id: string;
  name: string;
  category: string;
  dimension: string;
  material: string;
  functionDesc: string;
  engineeringSpec: string;
}

const subsystems: Subsystem[] = [
  {
    id: 'laser',
    name: 'Forward Optical Laser Emitter Lens',
    category: 'Targeted Cholesterol Ablation',
    dimension: 'Aperture: Ø 180 µm · Sapphire Focal Window',
    material: 'Single-Crystal Sapphire (Al₂O₃) with anti-reflective coating',
    functionDesc:
      'Directs pulsed coherent laser light (532 nm lipid-selective absorption band) into atherosclerotic cholesterol plaque. The photons selectively heat and vaporize oxidized LDL cholesterol, atheroma lipid pools, and foam cell clusters without thermal or mechanical trauma to the arterial adventitia or media.',
    engineeringSpec: 'Pulse duration: 15 ns at 10 kHz repetition rate; spot diameter: 85 µm; peak power: 450 mW.',
  },
  {
    id: 'dome',
    name: 'Translucent Bio-Crystal Hull & ECG Emblem',
    category: 'Biocompatible Enclosure',
    dimension: 'Outer envelope: Ø 650 µm × L 1.2 mm',
    material: 'Optical-Grade Biocompatible Polycarbonate / Parylene-C',
    functionDesc:
      'The signature transparent violet crystal shell allows internal photonic emissions and optical verification while offering ultra-low friction against vascular endothelium. The inscribed heart-line ECG emblem marks dorsal alignment under microscopic and fluoroscopic vision.',
    engineeringSpec: 'Hemocompatibility ISO 10993-4 certified; thrombogenicity score 0; surface roughness Ra < 8 nm.',
  },
  {
    id: 'fins',
    name: 'Quad Articulated Hydrofoil Micro-Fins',
    category: 'Hydrodynamic Locomotion',
    dimension: '4 Fins (2 Forward, 2 Aft) · Span: 280 µm each',
    material: 'Flexible Translucent Photopolymer (Two-Photon Polymerized)',
    functionDesc:
      'Four hydrodynamic flipper-fins provide directional pitch/yaw stabilization and non-reciprocal stroke mechanics in low-Reynolds-number viscous blood flow, preventing rolling and maintaining optical laser alignment during heart pulsations.',
    engineeringSpec: 'Stabilization latency < 12 ms; hydrofoil lift-to-drag ratio L/D = 4.2 at Re = 0.00042.',
  },
  {
    id: 'core',
    name: 'Cylindrical High-Coercivity NdFeB Core',
    category: 'Magnetic Steering & Propulsion',
    dimension: 'Ø 340 µm × L 380 µm Solid Cylinder',
    material: 'Neodymium Iron Boron (Grade N52, remanence Br = 1.48 T)',
    functionDesc:
      'Provides high magnetic moment for alignment with external 8-coil electromagnetic fields. Enables responsive multi-axis rotation and translational gradient pull against systolic blood pressures up to 140 mmHg.',
    engineeringSpec: 'Dipole moment m = 5.2 × 10⁻⁷ A·m²; Curie temperature Tc = 310°C.',
  },
  {
    id: 'diode',
    name: 'Internal Laser Diode Chamber',
    category: 'Photonic Powerhouse',
    dimension: 'Ø 290 µm × L 220 µm Micro-Cavity',
    material: 'Gallium Nitride (GaN) Micro-Diode Matrix',
    functionDesc:
      'Generates coherent monochromatic laser radiation tuned to the optical absorption peak of cholesteryl esters and oxidized low-density lipoproteins (LDL), turning dense lipid plaque into soluble harmless micro-vesicles.',
    engineeringSpec: 'Optical efficiency: 34%; thermal dissipation dissipation rate < 0.2°C/s in flowing blood.',
  },
  {
    id: 'pcb',
    name: 'Micro-PCB Ring & Gold Contact Arrays',
    category: 'Electronics & Induction',
    dimension: 'Flexible Circular Substrate · Thickness: 18 µm',
    material: 'Polyimide with 24K electroplated gold micro-traces',
    functionDesc:
      'Harvests wireless electromagnetic power from external coils and coordinates high-frequency micro-pulsing of the laser emitter while monitoring internal core telemetry.',
    engineeringSpec: 'Wireless power induction yield: 85 mW at 320 kHz resonant coupling.',
  },
  {
    id: 'retrieval',
    name: 'Tapered Tail Cone & Docking Latch',
    category: '100% Retrieval & Safety',
    dimension: 'Taper Angle: 38° · Permalloy Latch Ring',
    material: 'Soft-Magnetic Nickel-Iron (Permalloy 80)',
    functionDesc:
      'Fulfills the core mandate: "Retrieve Completely". When the intervention is finished, the robot aligns its tapered tail cone with the extraction catheter funnel, engaging magnetic capture with zero residual intravascular risk.',
    engineeringSpec: 'Catheter latch retention force: 16.5 mN; 100% success rate in 120 in-silico trials.',
  },
];

export const ArchitectureSection: React.FC = () => {
  const [selectedSubsystem, setSelectedSubsystem] = useState<Subsystem>(subsystems[0]);

  return (
    <section id="architecture" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-slate-800">
      {/* Section Header */}
      <div className="max-w-3xl mb-12">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-2">
          <span>HARDWARE ARCHITECTURE</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>EXPLODED MECHATRONIC SCHEMATIC</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-display">
          Chassis Anatomy & Laser Ablation Core
        </h2>
        <p className="mt-3 text-base text-slate-300">
          Crafted from translucent biocompatible crystal with quad hydrofoil stabilization fins, VITA MINI
          integrates an onboard optical laser diode, a high-coercivity magnetic core, and an automated
          docking cone into an ultra-compact 650 µm pod.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Exploded View Photographic Showcase (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/60 shadow-xl relative">
            <div className="relative aspect-[2/3] w-full bg-slate-950">
              <img
                src="/src/assets/images/vita_exploded_schematic_1790741234032.jpg"
                alt="VITA MINI Vertical Exploded Mechatronic Schematic"
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
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60 pointer-events-none" />

              <div className="absolute bottom-3 left-3 right-3 p-3 bg-slate-950/85 backdrop-blur-md rounded-xl border border-slate-800 text-xs font-mono text-slate-300">
                <div className="text-cyan-400 font-semibold mb-0.5">VERTICAL EXPLODED SCHEMATIC</div>
                <div className="text-slate-400 text-[11px]">
                  Nose lens · Titanium ring · NdFeB core · Laser diode · Micro-PCB · Quad fins · Tail cone
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Subsystem Navigator & Deep-Dive (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Subsystem Buttons Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {subsystems.map((sub, idx) => {
              const isSelected = selectedSubsystem.id === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubsystem(sub)}
                  className={`text-left p-3 rounded-xl border transition-all flex items-start justify-between gap-2 ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500/60 shadow-md shadow-cyan-950/30'
                      : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-900/60 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      {sub.category}
                    </div>
                    <div
                      className={`text-xs font-semibold mt-0.5 ${
                        isSelected ? 'text-cyan-300' : 'text-slate-200'
                      }`}
                    >
                      {sub.name}
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 tabular-nums">0{idx + 1}</span>
                </button>
              );
            })}
          </div>

          {/* Blueprint Deep Dive Card for Selected Subsystem */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-cyan-400 tracking-wider">
                  {selectedSubsystem.category}
                </span>
                <h3 className="text-xl font-bold font-display text-white mt-0.5">
                  {selectedSubsystem.name}
                </h3>
              </div>
              <span className="px-2.5 py-1 bg-slate-950 border border-slate-800 text-[11px] font-mono text-amber-400 rounded-md">
                LASER CHOLESTEROL ABLATION
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-5">
              {selectedSubsystem.functionDesc}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                <div className="text-[10px] font-mono uppercase text-slate-400">Material Specification</div>
                <div className="text-xs font-mono font-medium text-slate-200 mt-1">
                  {selectedSubsystem.material}
                </div>
              </div>

              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                <div className="text-[10px] font-mono uppercase text-slate-400">Dimensions & Geometry</div>
                <div className="text-xs font-mono font-medium text-slate-200 mt-1">
                  {selectedSubsystem.dimension}
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950/90 border border-cyan-500/20 rounded-xl">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>BENCHMARK CALIBRATION</span>
              </div>
              <p className="text-xs font-mono text-slate-300">
                {selectedSubsystem.engineeringSpec}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
