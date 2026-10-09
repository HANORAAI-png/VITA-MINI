import React from 'react';
import { CheckCircle2, Clock, ArrowRight } from 'lucide-react';

interface Stage {
  step: string;
  title: string;
  status: 'CURRENT' | 'UPCOMING' | 'FUTURE';
  timeframe: string;
  milestones: string[];
  deliverables: string;
}

const roadmapStages: Stage[] = [
  {
    step: 'STAGE 01',
    title: 'In-Silico Simulation & Microfluidic Phantoms',
    status: 'CURRENT',
    timeframe: 'TRL 3 · Current Stage',
    milestones: [
      'Multi-physics Stokes drag & magnetic torque validation',
      'Silicone anatomical bifurcations under pulsatile flow',
      '100% microcatheter docking retrieval protocol verification',
    ],
    deliverables: 'Benchmarking dataset and interactive open simulation framework.',
  },
  {
    step: 'STAGE 02',
    title: 'Ex-Vivo Porcine Perfusion & Machine Vision',
    status: 'UPCOMING',
    timeframe: 'TRL 4 · Q3–Q4 2026',
    milestones: [
      'Pulsatile blood-perfused porcine carotid artery rigs',
      'Biplane fluoroscopic deep-learning visual tracking',
      'Hemocompatibility and platelet activation evaluation',
    ],
    deliverables: 'Ex-vivo safety dossier and ISO 10993 material biocompatibility report.',
  },
  {
    step: 'STAGE 03',
    title: 'Pre-Clinical In-Vivo Safety & Biodistribution',
    status: 'FUTURE',
    timeframe: 'TRL 5 · 2027',
    milestones: [
      'Targeted thrombolysis in porcine femoral and coronary models',
      'Zero-residual retrieval verification via micro-CT',
      '30-day chronic endothelial histology and clearance audits',
    ],
    deliverables: 'GLP animal study telemetry and FDA pre-submission review.',
  },
  {
    step: 'STAGE 04',
    title: 'Early Feasibility Study & Clinical Translation',
    status: 'FUTURE',
    timeframe: 'TRL 6+ · 2028',
    milestones: [
      'Investigational Device Exemption (IDE) protocol design',
      'Integrated clinical robotic workstation development',
      'First-in-Human (FIH) targeted microvascular intervention trials',
    ],
    deliverables: 'Clinical safety endpoint evaluation and peer-reviewed multicenter publication.',
  },
];

export const TranslationalRoadmapSection: React.FC = () => {
  return (
    <section id="roadmap" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-slate-800">
      <div className="max-w-3xl mb-12">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-2">
          <span>TRANSLATIONAL PIPELINE</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>RESEARCH TO CLINICAL HORIZON</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-display">
          Translational Research Roadmap
        </h2>
        <p className="mt-3 text-base text-slate-300">
          A disciplined multi-year roadmap advancing VITA MINI from foundational in-silico fluidics
          to rigorous GLP pre-clinical models and regulated early feasibility studies.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {roadmapStages.map((stage) => {
          const isCurrent = stage.status === 'CURRENT';
          return (
            <div
              key={stage.step}
              className={`p-6 rounded-2xl border flex flex-col justify-between transition-all ${
                isCurrent
                  ? 'bg-slate-900/90 border-cyan-500/50 shadow-lg shadow-cyan-950/20 ring-1 ring-cyan-500/30'
                  : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-900/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-3">
                  <span className="text-slate-400">{stage.step}</span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      isCurrent
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    {stage.timeframe}
                  </span>
                </div>

                <h3 className="text-lg font-bold font-display text-white mb-3">
                  {stage.title}
                </h3>

                <ul className="space-y-2 mb-6 text-xs text-slate-300">
                  {stage.milestones.map((m, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-cyan-400 mt-0.5">·</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
                <span className="text-slate-500 block mb-0.5">PRIMARY DELIVERABLE:</span>
                <span className="text-slate-300">{stage.deliverables}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
