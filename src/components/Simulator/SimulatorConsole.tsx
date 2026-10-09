import React, { useState } from 'react';
import { VitaSimulator3DCanvas } from './VitaSimulator3DCanvas';
import {
  SimulationPhase,
  VesselPreset,
  VisualizationMode,
  TelemetryData,
  MissionLog,
} from '../../types/simulator';
import { soundEngine } from '../AudioEngine';
import {
  Radio,
  Volume2,
  VolumeX,
  Play,
  CheckCircle2,
  Download,
  ShieldCheck,
  Zap,
  Box,
} from 'lucide-react';

export const SimulatorConsole: React.FC = () => {
  const [phase, setPhase] = useState<SimulationPhase>('NAVIGATE');
  const [preset, setPreset] = useState<VesselPreset>('Coronary Bifurcation');
  const [visMode, setVisMode] = useState<VisualizationMode>('OPTICAL_FLUORESCENCE');
  const [gradientIntensity, setGradientIntensity] = useState<number>(1.8);
  const [isAutopilot, setIsAutopilot] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [showCompletionModal, setShowCompletionModal] = useState<boolean>(false);
  const [lastMissionSummary, setLastMissionSummary] = useState<{
    duration: number;
    maxGradient: number;
    avgWallClearance: number;
  } | null>(null);

  const [telemetry, setTelemetry] = useState<TelemetryData>({
    timeElapsed: 0,
    posX: 1125,
    posY: 2250,
    depthZ: 0,
    velocity: 0,
    flowSpeed: 1.9,
    dragForce: 0.12,
    magneticGradient: 1.8,
    magneticCoilCurrents: [20, 15, 0],
    reynoldsNumber: 0.00042,
    temperature: 37.0,
    laserPowerOutput: 0,
    laserWavelength: 532,
    wallProximity: 240,
    distanceToTarget: 7200,
    distanceToCatheter: 120,
    cholesterolClearance: 0,
    retrievalStatus: 'STANDBY',
    collisions: 0,
    laserFiring: false,
  });

  const [missionLogs, setMissionLogs] = useState<MissionLog[]>([
    {
      id: 'RUN-LASER-102',
      timestamp: '14:22:04 UTC',
      duration: 16.8,
      preset: 'Coronary Bifurcation',
      navSuccess: true,
      cholesterolRemoved: 100,
      retrievalConfirmed: true,
      minWallClearance: 142,
      avgVelocity: 1.55,
      maxGradientApplied: 2.0,
    },
  ]);

  const handleToggleSound = () => {
    const state = soundEngine.toggleSound();
    setSoundEnabled(state);
  };

  const handleMissionCompleted = (summary: {
    duration: number;
    maxGradient: number;
    avgWallClearance: number;
  }) => {
    setLastMissionSummary(summary);
    setShowCompletionModal(true);

    const newLog: MissionLog = {
      id: `RUN-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleTimeString(),
      duration: summary.duration,
      preset,
      navSuccess: true,
      cholesterolRemoved: 100,
      retrievalConfirmed: true,
      minWallClearance: summary.avgWallClearance,
      avgVelocity: 1.35,
      maxGradientApplied: summary.maxGradient,
    };

    setMissionLogs((prev) => [newLog, ...prev.slice(0, 4)]);
  };

  const downloadMissionTelemetryJSON = () => {
    const report = {
      project: 'VITA MINI — In-Silico 3D Laser Cholesterol Ablation Simulator',
      disclaimer: 'CONCEPT-STAGE RESEARCH ONLY · NOT FOR HUMAN CLINICAL USE',
      generatedAt: new Date().toISOString(),
      activePreset: preset,
      missionTelemetry: telemetry,
      lastMissionSummary,
      historicalTrials: missionLogs,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VITA_MINI_3D_SIM_LOG_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section id="simulator" className="relative py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1.5">
            <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
            <span>3D WEBGL ENGINE · REALISTIC PULSATILE VASCULAR WALLS & PIPES</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
            Live VITA MINI 3D Simulator
          </h2>
          <p className="mt-1 text-sm text-slate-400 max-w-2xl">
            Navigate through a realistic 3D arterial lumen with layered biological walls, pulsatile heart contractions,
            and floating erythrocytes. Target bad cholesterol atheroma with precision laser photo-ablation.
          </p>
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSound}
            className={`p-2 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-colors ${
              soundEnabled
                ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle synthesized telemetry audio"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{soundEnabled ? 'AUDIO ACTIVE' : 'AUDIO MUTED'}</span>
          </button>

          <button
            onClick={() => setIsAutopilot(!isAutopilot)}
            className={`px-3 py-2 rounded-lg border text-xs font-mono font-medium flex items-center gap-1.5 transition-colors ${
              isAutopilot
                ? 'bg-violet-900/60 border-violet-500/60 text-violet-200'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${isAutopilot ? 'text-violet-400' : ''}`} />
            <span>{isAutopilot ? 'AUTOPILOT DEMO' : 'MANUAL PILOT'}</span>
          </button>

          <button
            onClick={downloadMissionTelemetryJSON}
            className="p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-cyan-300 hover:border-slate-700 transition-colors"
            title="Export Mission Telemetry JSON"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Console Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 3D Viewport & Controls (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Imaging Mode and Phantom Presets Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 bg-slate-900/70 border border-slate-800 rounded-xl">
            {/* Phantom Presets */}
            <div className="flex items-center gap-1">
              <span className="text-xs font-mono text-slate-400 mr-1 hidden sm:inline">PATHOLOGY:</span>
              {(['Coronary Bifurcation', 'Carotid Artery Plaque', 'Microvascular Capillary'] as VesselPreset[]).map(
                (p) => (
                  <button
                    key={p}
                    onClick={() => setPreset(p)}
                    className={`px-2.5 py-1 text-xs font-mono rounded-md transition-colors ${
                      preset === p
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    {p.split(' ')[0]}
                  </button>
                )
              )}
            </div>

            {/* Visual Modality */}
            <div className="flex items-center gap-1">
              <span className="text-xs font-mono text-slate-400 mr-1 hidden sm:inline">MODALITY:</span>
              {(
                [
                  ['OPTICAL_FLUORESCENCE', '3D Optical'],
                  ['FLUO_ANGIOGRAPHY', '3D X-Ray Angio'],
                ] as [VisualizationMode, string][]
              ).map(([m, label]) => (
                <button
                  key={m}
                  onClick={() => setVisMode(m)}
                  className={`px-2.5 py-1 text-xs font-mono rounded-md transition-colors ${
                    visMode === m
                      ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 3D Realistic WebGL Vascular Simulator Canvas */}
          <VitaSimulator3DCanvas
            phase={phase}
            setPhase={setPhase}
            preset={preset}
            visMode={visMode}
            gradientIntensity={gradientIntensity}
            isAutopilot={isAutopilot}
            onTelemetryUpdate={setTelemetry}
            onMissionCompleted={handleMissionCompleted}
            soundEnabled={soundEnabled}
          />

          {/* Simulator Guidance Instructions */}
          <div className="p-3 bg-slate-900/50 border border-slate-800/80 rounded-lg text-xs font-mono text-slate-400 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <span className="text-slate-200 font-semibold">CONTROLS:</span>
              <span className="inline-flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">W</kbd>
                <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">A</kbd>
                <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">S</kbd>
                <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">D</kbd>
                <span>/ ARROWS to steer</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <kbd className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">SPACE</kbd>
                <span>Fire Laser Ablation</span>
              </span>
            </div>
            <div className="text-slate-500 text-[11px]">
              3D TUBULAR LUMEN · Re = 0.00042 VISCOUS REGIME
            </div>
          </div>
        </div>

        {/* Right Column: Telemetry & Actuator Deck (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Phase Status Banner */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl relative overflow-hidden">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>MISSION PROGRESSION</span>
              <span className="text-cyan-400 font-semibold">
                PHASE {phase === 'NAVIGATE' ? '1/3' : phase === 'TREAT' ? '2/3' : '3/3'}
              </span>
            </div>

            <div className="space-y-2 mt-3">
              <div
                className={`p-2.5 rounded-lg border text-xs font-mono transition-all ${
                  phase === 'NAVIGATE'
                    ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-200'
                    : 'bg-slate-950/40 border-slate-800/80 text-slate-400'
                }`}
              >
                <div className="font-semibold flex items-center justify-between">
                  <span>1. TARGET CHOLESTEROL</span>
                  {phase !== 'NAVIGATE' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Steer 3D pod through vascular lumen to plaque
                </div>
              </div>

              <div
                className={`p-2.5 rounded-lg border text-xs font-mono transition-all ${
                  phase === 'TREAT'
                    ? 'bg-amber-950/60 border-amber-500/50 text-amber-200'
                    : 'bg-slate-950/40 border-slate-800/80 text-slate-400'
                }`}
              >
                <div className="font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    2. LASER PHOTO-ABLATION
                  </span>
                  {telemetry.cholesterolClearance >= 100 && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Vaporize bad cholesterol with 532 nm laser
                </div>
                <div className="mt-2 w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                  <div
                    className="bg-amber-400 h-full transition-all duration-150"
                    style={{ width: `${telemetry.cholesterolClearance}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>Plaque Cleared:</span>
                  <span className="text-amber-300 font-bold">{telemetry.cholesterolClearance}%</span>
                </div>
              </div>

              <div
                className={`p-2.5 rounded-lg border text-xs font-mono transition-all ${
                  phase === 'RETRIEVE'
                    ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-200'
                    : phase === 'COMPLETED'
                    ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200'
                    : 'bg-slate-950/40 border-slate-800/80 text-slate-400'
                }`}
              >
                <div className="font-semibold flex items-center justify-between">
                  <span>3. RETRIEVE COMPLETELY</span>
                  {phase === 'COMPLETED' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Magnetic docking for 100% extraction
                </div>
              </div>
            </div>
          </div>

          {/* Telemetry Metric Cards */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-4">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center justify-between">
              <span>3D CALIBRATED TELEMETRY</span>
              <span className="text-[10px] text-emerald-400">● 60 FPS WEBGL</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/70">
                <div className="text-[10px] font-mono uppercase text-slate-400">Laser Emitter</div>
                <div className="text-base font-mono font-bold text-amber-300 tabular-nums">
                  {telemetry.laserPowerOutput > 0 ? '450' : 'STANDBY'}
                  {telemetry.laserPowerOutput > 0 && (
                    <span className="text-[10px] text-slate-400 font-normal ml-1">mW</span>
                  )}
                </div>
              </div>

              <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/70">
                <div className="text-[10px] font-mono uppercase text-slate-400">3D Position (X,Y,Z)</div>
                <div className="text-xs font-mono font-bold text-cyan-300 tabular-nums">
                  {telemetry.posX}, {telemetry.posY}, {telemetry.depthZ}
                  <span className="text-[10px] text-slate-400 font-normal ml-0.5">µm</span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/70">
                <div className="text-[10px] font-mono uppercase text-slate-400">Target Distance</div>
                <div className="text-base font-mono font-bold text-violet-300 tabular-nums">
                  {telemetry.distanceToTarget}
                  <span className="text-[10px] text-slate-400 font-normal ml-1">µm</span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/70">
                <div className="text-[10px] font-mono uppercase text-slate-400">Wall Clearance</div>
                <div className="text-base font-mono font-bold text-emerald-300 tabular-nums">
                  {telemetry.wallProximity}
                  <span className="text-[10px] text-slate-400 font-normal ml-1">µm</span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/70">
                <div className="text-[10px] font-mono uppercase text-slate-400">Vascular Temp</div>
                <div className="text-base font-mono font-bold text-white tabular-nums">
                  {telemetry.temperature.toFixed(1)}
                  <span className="text-[10px] text-slate-400 font-normal ml-1">°C</span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/70">
                <div className="text-[10px] font-mono uppercase text-slate-400">Viscous Drag</div>
                <div className="text-base font-mono font-bold text-slate-200 tabular-nums">
                  {telemetry.dragForce.toFixed(2)}
                  <span className="text-[10px] text-slate-400 font-normal ml-1">nN</span>
                </div>
              </div>
            </div>

            {/* Actuator & Gradient Slider */}
            <div className="pt-2 border-t border-slate-800">
              <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                <span className="text-slate-300">Magnetic Gradient Actuation:</span>
                <span className="text-cyan-400 font-semibold tabular-nums">
                  {gradientIntensity.toFixed(1)} T/m
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.1"
                value={gradientIntensity}
                onChange={(e) => setGradientIntensity(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                <span>0.5 T/m (Capillary)</span>
                <span>2.5 T/m (High Pulsatile)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mission Completion Confirmation Modal */}
      {showCompletionModal && lastMissionSummary && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-4 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold font-display text-white">
              Trial Complete: Bad Cholesterol Disintegrated & 100% Retrieved
            </h3>
            <p className="mt-1 text-xs font-mono text-slate-400">
              The targeted arterial cholesterol plaque was cleared via 3D laser photo-ablation. The VITA MINI
              microrobot docked with the extraction catheter with zero residual debris.
            </p>

            <div className="my-5 p-4 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-[10px] font-mono text-slate-400 uppercase">Trial Duration</div>
                <div className="text-lg font-mono font-bold text-white mt-0.5">
                  {lastMissionSummary.duration}s
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono text-slate-400 uppercase">Plaque Cleared</div>
                <div className="text-lg font-mono font-bold text-amber-300 mt-0.5">100%</div>
              </div>
              <div>
                <div className="text-[10px] font-mono text-slate-400 uppercase">Avg Clearance</div>
                <div className="text-lg font-mono font-bold text-emerald-300 mt-0.5">
                  {lastMissionSummary.avgWallClearance} µm
                </div>
              </div>
            </div>

            <div className="text-[11px] font-mono text-slate-400 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 mb-5">
              <strong className="text-amber-400">RESEARCH NOTICE:</strong> This trial was conducted in an
              in-silico 3D fluidic simulator reproducing microfluidic phantom dynamics. Results are conceptual and
              do not represent real human medical performance.
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={downloadMissionTelemetryJSON}
                className="px-4 py-2 text-xs font-mono font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>EXPORT DATA</span>
              </button>
              <button
                onClick={() => setShowCompletionModal(false)}
                className="px-4 py-2 text-xs font-mono font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
              >
                RETURN TO LAB
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
