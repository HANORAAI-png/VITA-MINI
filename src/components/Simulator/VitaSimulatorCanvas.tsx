import React, { useEffect, useRef, useCallback } from 'react';
import { SimulationPhase, VesselPreset, VisualizationMode, TelemetryData, BloodCell } from '../../types/simulator';
import { soundEngine } from '../AudioEngine';

interface VitaSimulatorCanvasProps {
  phase: SimulationPhase;
  setPhase: (phase: SimulationPhase) => void;
  preset: VesselPreset;
  visMode: VisualizationMode;
  gradientIntensity: number; // T/m (0.5 - 2.5)
  isAutopilot: boolean;
  onTelemetryUpdate: (data: TelemetryData) => void;
  onMissionCompleted: (summary: { duration: number; maxGradient: number; avgWallClearance: number }) => void;
  soundEnabled: boolean;
}

export const VitaSimulatorCanvas: React.FC<VitaSimulatorCanvasProps> = ({
  phase,
  setPhase,
  preset,
  visMode,
  gradientIntensity,
  isAutopilot,
  onTelemetryUpdate,
  onMissionCompleted,
  soundEnabled,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Robot State matching uploaded VITA MINI design
  const robotRef = useRef({
    x: 90,
    y: 180,
    vx: 0,
    vy: 0,
    rotation: 0,
    finOscillation: 0,
    length: 32, // capsule length
    width: 18, // capsule width
    temperature: 37.0, // °C
    collisions: 0,
    latched: false,
    laserFiring: false,
    laserIntensity: 0,
    trail: [] as { x: number; y: number; alpha: number }[],
  });

  // Target: Atherosclerotic LDL Cholesterol Plaque
  const plaqueRef = useRef({
    x: 670,
    y: 275,
    radius: 40,
    initialVolume: 100, // %
    remainingVolume: 100, // %
    clearedPercentage: 0,
    vaporSparks: [] as { x: number; y: number; vx: number; vy: number; life: number; color: string }[],
  });

  // Catheter retrieval dock
  const catheterRef = useRef({
    x: 75,
    y: 110,
    width: 55,
    height: 70,
    latched: false,
  });

  // Input states
  const steeringRef = useRef({
    up: false,
    down: false,
    left: false,
    right: false,
    forceX: 0,
    forceY: 0,
  });

  // Flow and Blood Cells
  const bloodCellsRef = useRef<BloodCell[]>([]);
  const startTimeRef = useRef<number>(Date.now());
  const minClearanceRef = useRef<number>(999);
  const wallClearanceSumRef = useRef<number>(0);
  const framesSampledRef = useRef<number>(0);
  const lastPingTimeRef = useRef<number>(0);
  const isFiringLaserRef = useRef<boolean>(false);

  // Initialize Blood Cells
  useEffect(() => {
    const cells: BloodCell[] = [];
    const count = 50;
    for (let i = 0; i < count; i++) {
      cells.push({
        x: Math.random() * 800,
        y: 100 + Math.random() * 220,
        vx: 1.4 + Math.random() * 2.0,
        vy: (Math.random() - 0.5) * 0.35,
        radius: 4.5 + Math.random() * 3,
        aspect: 0.55 + Math.random() * 0.35,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.08,
        color: Math.random() > 0.12 ? '#be123c' : '#991b1b',
        opacity: 0.35 + Math.random() * 0.35,
      });
    }
    bloodCellsRef.current = cells;
  }, [preset]);

  const triggerLaserAblation = useCallback(() => {
    const robot = robotRef.current;
    const plaque = plaqueRef.current;
    const dist = Math.hypot(robot.x - plaque.x, robot.y - plaque.y);

    if (dist < 110 && plaque.remainingVolume > 0) {
      isFiringLaserRef.current = true;
      robot.laserFiring = true;
      soundEngine.playLaserAblation();

      // Add laser photo-thermal ablation vapor sparks
      for (let i = 0; i < 8; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = 1.2 + Math.random() * 3.5;
        plaque.vaporSparks.push({
          x: plaque.x + (Math.random() - 0.5) * 20,
          y: plaque.y + (Math.random() - 0.5) * 20,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          life: 1.0,
          color: Math.random() > 0.4 ? '#38bdf8' : '#c084fc',
        });
      }

      setTimeout(() => {
        isFiringLaserRef.current = false;
        robot.laserFiring = false;
      }, 350);
    }
  }, []);

  // Handle Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let steered = false;
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        steeringRef.current.up = true;
        steered = true;
      }
      if (['ArrowDown', 'KeyS'].includes(e.code)) {
        steeringRef.current.down = true;
        steered = true;
      }
      if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        steeringRef.current.left = true;
        steered = true;
      }
      if (['ArrowRight', 'KeyD'].includes(e.code)) {
        steeringRef.current.right = true;
        steered = true;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        triggerLaserAblation();
      }
      if (steered && soundEnabled) {
        soundEngine.playSteerPulse();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) steeringRef.current.up = false;
      if (['ArrowDown', 'KeyS'].includes(e.code)) steeringRef.current.down = false;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) steeringRef.current.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) steeringRef.current.right = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [soundEnabled, triggerLaserAblation]);

  // Reset simulator
  const handleReset = useCallback(() => {
    robotRef.current = {
      x: 90,
      y: 180,
      vx: 0,
      vy: 0,
      rotation: 0,
      finOscillation: 0,
      length: 32,
      width: 18,
      temperature: 37.0,
      collisions: 0,
      latched: false,
      laserFiring: false,
      laserIntensity: 0,
      trail: [],
    };
    plaqueRef.current.remainingVolume = 100;
    plaqueRef.current.clearedPercentage = 0;
    plaqueRef.current.vaporSparks = [];
    minClearanceRef.current = 999;
    wallClearanceSumRef.current = 0;
    framesSampledRef.current = 0;
    startTimeRef.current = Date.now();
    isFiringLaserRef.current = false;
    setPhase('NAVIGATE');
  }, [setPhase]);

  // Main Canvas Render & Physics Loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const render = () => {
      time += 0.025;
      const robot = robotRef.current;
      const plaque = plaqueRef.current;
      const catheter = catheterRef.current;
      const w = canvas.width;
      const h = canvas.height;

      // Hemodynamic pulse
      const pulse = Math.sin(time * 3.2);
      const baseFlowSpeed =
        preset === 'Coronary Bifurcation' ? 1.9 : preset === 'Carotid Artery Plaque' ? 2.3 : 1.1;
      const currentFlow = baseFlowSpeed * (1 + 0.35 * pulse);

      // --- AUTOPILOT LOGIC ---
      if (isAutopilot && !robot.latched) {
        if (phase === 'NAVIGATE' || phase === 'TREAT') {
          const dx = plaque.x - 45 - robot.x;
          const dy = plaque.y - robot.y;
          const dist = Math.hypot(dx, dy);

          if (dist > 35) {
            steeringRef.current.forceX = (dx / dist) * 0.75;
            steeringRef.current.forceY = (dy / dist) * 0.75;
          } else {
            steeringRef.current.forceX = 0;
            steeringRef.current.forceY = 0;
            if (plaque.remainingVolume > 0) {
              triggerLaserAblation();
            }
          }
        } else if (phase === 'RETRIEVE') {
          const dx = catheter.x + 20 - robot.x;
          const dy = catheter.y + 35 - robot.y;
          const dist = Math.hypot(dx, dy);

          if (dist > 15) {
            steeringRef.current.forceX = (dx / dist) * 0.85;
            steeringRef.current.forceY = (dy / dist) * 0.85;
          } else {
            robot.latched = true;
          }
        }
      } else if (!isAutopilot) {
        let fx = 0;
        let fy = 0;
        if (steeringRef.current.left) fx -= 1;
        if (steeringRef.current.right) fx += 1;
        if (steeringRef.current.up) fy -= 1;
        if (steeringRef.current.down) fy += 1;

        const mag = Math.hypot(fx, fy);
        if (mag > 0) {
          steeringRef.current.forceX = (fx / mag) * 0.8;
          steeringRef.current.forceY = (fy / mag) * 0.8;
        } else {
          steeringRef.current.forceX *= 0.8;
          steeringRef.current.forceY *= 0.8;
        }
      }

      // --- PHYSICS UPDATE (LOW REYNOLDS NUMBER WITH FIN OSCILLATION) ---
      if (!robot.latched) {
        const magneticAcc = gradientIntensity * 1.6;
        const dragFactor = 0.82;

        const fluidDragX = currentFlow * 0.28;
        const fluidDragY = Math.sin(time * 2 + robot.x * 0.01) * 0.08;

        robot.vx = (robot.vx + steeringRef.current.forceX * magneticAcc + fluidDragX) * dragFactor;
        robot.vy = (robot.vy + steeringRef.current.forceY * magneticAcc + fluidDragY) * dragFactor;

        robot.x += robot.vx;
        robot.y += robot.vy;

        const speed = Math.hypot(robot.vx, robot.vy);
        robot.finOscillation += 0.25 + speed * 0.45; // Fin flutter

        if (speed > 0.1) {
          robot.rotation = Math.atan2(robot.vy, robot.vx);
        }

        if (time % 0.1 < 0.03) {
          robot.trail.push({ x: robot.x, y: robot.y, alpha: 0.6 });
          if (robot.trail.length > 25) robot.trail.shift();
        }
      }

      robot.trail.forEach((p) => {
        p.alpha *= 0.95;
      });

      // --- VESSEL BOUNDARY AND WALL SHEAR ---
      const getVesselBounds = (x: number) => {
        let top = 80;
        let bottom = 320;

        if (preset === 'Coronary Bifurcation') {
          if (x < 330) {
            top = 110 + Math.sin(x * 0.009) * 20;
            bottom = 290 + Math.sin(x * 0.009) * 20;
          } else {
            if (robot.y < 200) {
              top = 65 + Math.sin(x * 0.008) * 15;
              bottom = 185 + Math.sin(x * 0.008) * 15;
            } else {
              top = 215 + Math.sin(x * 0.008) * 15;
              bottom = 345 + Math.sin(x * 0.008) * 15;
            }
          }
        } else if (preset === 'Carotid Artery Plaque') {
          top = 100 + Math.sin(x * 0.006) * 25 + pulse * 4;
          bottom = 300 + Math.sin(x * 0.006) * 25 - pulse * 4;
        } else {
          top = 95 + Math.sin(x * 0.015) * 35;
          bottom = 305 + Math.sin(x * 0.015) * 35;
        }

        return { top, bottom };
      };

      const bounds = getVesselBounds(robot.x);
      const wallMargin = 15;
      let collided = false;

      if (robot.y - robot.width / 2 < bounds.top + wallMargin) {
        robot.y = bounds.top + wallMargin + robot.width / 2;
        robot.vy = Math.abs(robot.vy) * 0.3;
        collided = true;
      }
      if (robot.y + robot.width / 2 > bounds.bottom - wallMargin) {
        robot.y = bounds.bottom - wallMargin - robot.width / 2;
        robot.vy = -Math.abs(robot.vy) * 0.3;
        collided = true;
      }

      if (robot.x < 30) {
        robot.x = 30;
        robot.vx = 0;
      }
      if (robot.x > w - 30) {
        robot.x = w - 30;
        robot.vx = 0;
      }

      if (collided) {
        robot.collisions += 1;
        soundEngine.playWallCollision();
      }

      const distToTop = Math.abs(robot.y - bounds.top);
      const distToBottom = Math.abs(bounds.bottom - robot.y);
      const currentWallProximity = Math.min(distToTop, distToBottom) * 12.5;

      if (currentWallProximity < minClearanceRef.current) {
        minClearanceRef.current = currentWallProximity;
      }
      wallClearanceSumRef.current += currentWallProximity;
      framesSampledRef.current += 1;

      // --- TARGET INTERACTION & LASER CHOLESTEROL ABLATION ---
      const distToPlaque = Math.hypot(robot.x - plaque.x, robot.y - plaque.y);
      const distToCatheter = Math.hypot(robot.x - (catheter.x + 20), robot.y - (catheter.y + 35));

      if (Date.now() - lastPingTimeRef.current > 1200 && phase === 'NAVIGATE') {
        const ratio = distToPlaque / 700;
        soundEngine.playTargetPing(ratio);
        lastPingTimeRef.current = Date.now();
      }

      // Laser firing breakdown of bad cholesterol
      if (isFiringLaserRef.current || (phase === 'TREAT' && distToPlaque < 100)) {
        plaque.remainingVolume = Math.max(0, plaque.remainingVolume - 0.85);
        plaque.clearedPercentage = 100 - plaque.remainingVolume;
        robot.temperature = Math.min(40.8, robot.temperature + 0.06);
        robot.laserIntensity = Math.min(1.0, robot.laserIntensity + 0.15);

        if (plaque.remainingVolume <= 0 && phase !== 'RETRIEVE' && phase !== 'COMPLETED') {
          setPhase('RETRIEVE');
          soundEngine.playSteerPulse();
        }
      } else {
        robot.laserIntensity = Math.max(0, robot.laserIntensity - 0.08);
        robot.temperature = Math.max(37.0, robot.temperature - 0.02);
      }

      if (distToPlaque < 95 && phase === 'NAVIGATE') {
        setPhase('TREAT');
      }

      // --- RETRIEVAL & LATCHING ---
      if (phase === 'RETRIEVE' && distToCatheter < 35 && !robot.latched) {
        robot.latched = true;
        robot.x = catheter.x + 20;
        robot.y = catheter.y + 35;
        robot.vx = 0;
        robot.vy = 0;
        soundEngine.playDockLatch();
        setPhase('COMPLETED');

        const avgWallClearance =
          framesSampledRef.current > 0
            ? Math.round(wallClearanceSumRef.current / framesSampledRef.current)
            : 180;

        onMissionCompleted({
          duration: Math.round((Date.now() - startTimeRef.current) / 1000),
          maxGradient: gradientIntensity,
          avgWallClearance,
        });
      }

      // --- UPDATE BLOOD CELLS & VAPOR SPARKS ---
      bloodCellsRef.current.forEach((cell) => {
        cell.x += cell.vx * currentFlow * 0.9;
        cell.y += cell.vy + Math.sin(time + cell.x * 0.02) * 0.3;
        cell.rotation += cell.rotationSpeed;

        if (cell.x > w + 20) {
          cell.x = -20;
          cell.y = 100 + Math.random() * 220;
        }
      });

      // Update vapor sparks
      plaque.vaporSparks = plaque.vaporSparks.filter((s) => s.life > 0);
      plaque.vaporSparks.forEach((s) => {
        s.x += s.vx;
        s.y += s.vy;
        s.life -= 0.04;
      });

      // --- RENDERING CANVAS ---
      if (visMode === 'OPTICAL_FLUORESCENCE') {
        ctx.fillStyle = '#050814';
        ctx.fillRect(0, 0, w, h);
      } else if (visMode === 'FLUO_ANGIOGRAPHY') {
        ctx.fillStyle = '#0a0d18';
        ctx.fillRect(0, 0, w, h);
      } else {
        ctx.fillStyle = '#02040a';
        ctx.fillRect(0, 0, w, h);
      }

      // Micro-scale grid
      ctx.strokeStyle = visMode === 'FLUO_ANGIOGRAPHY' ? 'rgba(148, 163, 184, 0.07)' : 'rgba(30, 41, 59, 0.35)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // --- DRAW VESSEL WALLS & LUMEN ---
      ctx.save();
      ctx.beginPath();
      for (let x = 0; x <= w; x += 10) {
        const b = getVesselBounds(x);
        if (x === 0) ctx.moveTo(x, b.top);
        else ctx.lineTo(x, b.top);
      }
      for (let x = w; x >= 0; x -= 10) {
        const b = getVesselBounds(x);
        ctx.lineTo(x, b.bottom);
      }
      ctx.closePath();

      if (visMode === 'OPTICAL_FLUORESCENCE') {
        const lumenGrad = ctx.createLinearGradient(0, 80, 0, 320);
        lumenGrad.addColorStop(0, 'rgba(88, 28, 135, 0.12)');
        lumenGrad.addColorStop(0.5, 'rgba(15, 23, 42, 0.65)');
        lumenGrad.addColorStop(1, 'rgba(30, 58, 138, 0.15)');
        ctx.fillStyle = lumenGrad;
        ctx.fill();

        ctx.strokeStyle = 'rgba(6, 182, 212, 0.55)';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      } else if (visMode === 'FLUO_ANGIOGRAPHY') {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(226, 232, 240, 0.45)';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        ctx.fillStyle = 'rgba(10, 15, 29, 0.85)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      ctx.restore();

      // Flow streamlines
      if (visMode !== 'FLUO_ANGIOGRAPHY') {
        ctx.save();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
        ctx.lineWidth = 1;
        ctx.setLineDash([8, 14]);
        ctx.lineDashOffset = -time * 50 * currentFlow;

        for (let lineY of [145, 175, 205, 235, 265]) {
          ctx.beginPath();
          for (let x = 0; x <= w; x += 30) {
            const b = getVesselBounds(x);
            const clampedY = Math.min(b.bottom - 20, Math.max(b.top + 20, lineY));
            if (x === 0) ctx.moveTo(x, clampedY);
            else ctx.lineTo(x, clampedY);
          }
          ctx.stroke();
        }
        ctx.restore();
      }

      // Blood cells
      bloodCellsRef.current.forEach((cell) => {
        const b = getVesselBounds(cell.x);
        if (cell.y > b.top + 8 && cell.y < b.bottom - 8) {
          ctx.save();
          ctx.translate(cell.x, cell.y);
          ctx.rotate(cell.rotation);
          ctx.scale(1, cell.aspect);

          ctx.beginPath();
          ctx.arc(0, 0, cell.radius, 0, Math.PI * 2);

          if (visMode === 'OPTICAL_FLUORESCENCE') {
            ctx.fillStyle = cell.color;
            ctx.globalAlpha = cell.opacity;
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0, 0, cell.radius * 0.45, 0, Math.PI * 2);
            ctx.fillStyle = '#4c0519';
            ctx.fill();
          } else if (visMode === 'FLUO_ANGIOGRAPHY') {
            ctx.fillStyle = 'rgba(148, 163, 184, 0.25)';
            ctx.fill();
          } else {
            ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
            ctx.fill();
          }
          ctx.restore();
        }
      });

      // --- CATHETER DOCKING RETRIEVAL SHEATH ---
      ctx.save();
      const cathX = catheter.x;
      const cathY = catheter.y;

      const cathGrad = ctx.createLinearGradient(cathX - 60, cathY, cathX + 35, cathY + 70);
      cathGrad.addColorStop(0, '#1e293b');
      cathGrad.addColorStop(0.5, '#334155');
      cathGrad.addColorStop(1, '#0f172a');

      ctx.fillStyle = cathGrad;
      ctx.beginPath();
      ctx.moveTo(cathX - 80, cathY + 10);
      ctx.lineTo(cathX + 10, cathY + 10);
      ctx.lineTo(cathX + 38, cathY - 5);
      ctx.lineTo(cathX + 38, cathY + 75);
      ctx.lineTo(cathX + 10, cathY + 60);
      ctx.lineTo(cathX - 80, cathY + 60);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = phase === 'RETRIEVE' ? '#06b6d4' : '#64748b';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (phase === 'RETRIEVE' || phase === 'COMPLETED') {
        const beaconPulse = (time * 3) % 1;
        ctx.beginPath();
        ctx.arc(cathX + 25, cathY + 35, 15 + beaconPulse * 40, -Math.PI / 2, Math.PI / 2);
        ctx.strokeStyle = `rgba(6, 182, 212, ${1 - beaconPulse})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(cathX + 10, cathY + 10, 4, 50);
      }

      ctx.fillStyle = phase === 'RETRIEVE' ? '#22d3ee' : '#94a3b8';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText('EXTRACTION PORT', cathX - 60, cathY + 5);
      ctx.restore();

      // --- DRAW ATHEROSCLEROTIC CHOLESTEROL PLAQUE ---
      if (plaque.remainingVolume > 0) {
        ctx.save();
        ctx.translate(plaque.x, plaque.y);

        const currentScale = 0.35 + (plaque.remainingVolume / 100) * 0.65;
        const curRadius = plaque.radius * currentScale;

        // Plaque gradient (lipid-rich yellow/amber core with fibrous cap)
        const plaqueGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, curRadius);
        plaqueGrad.addColorStop(0, '#fef08a'); // Soft lipid/cholesterol core (bright yellow)
        plaqueGrad.addColorStop(0.5, '#eab308'); // Dense atheroma
        plaqueGrad.addColorStop(0.85, '#ca8a04'); // Fibrous lipid border
        plaqueGrad.addColorStop(1, 'rgba(161, 98, 7, 0.2)');

        ctx.fillStyle = plaqueGrad;
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 2; a += 0.2) {
          const rOffset = Math.sin(a * 5 + time * 1.5) * 2.5;
          const r = curRadius + rOffset;
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r;
          if (a === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(234, 179, 8, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Plaque label
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = '#fef08a';
        ctx.fillText(`BAD CHOLESTEROL [${Math.round(plaque.remainingVolume)}%]`, -65, -curRadius - 16);
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`ATHEROMA DEPOSIT`, -50, -curRadius - 5);

        ctx.restore();
      }

      // Draw Laser Vaporization Sparks
      plaque.vaporSparks.forEach((s) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2.5 * s.life, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = s.life;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      });

      // --- DRAW LASER BEAM IF FIRING ---
      if (isFiringLaserRef.current || robot.laserFiring || robot.laserIntensity > 0.05) {
        ctx.save();
        const beamStartX = robot.x + Math.cos(robot.rotation) * (robot.length / 2);
        const beamStartY = robot.y + Math.sin(robot.rotation) * (robot.length / 2);
        const targetX = plaque.x;
        const targetY = plaque.y;

        // Outer violet laser corona
        ctx.strokeStyle = `rgba(168, 85, 247, ${robot.laserIntensity * 0.7})`;
        ctx.lineWidth = 6 + Math.sin(time * 30) * 2;
        ctx.beginPath();
        ctx.moveTo(beamStartX, beamStartY);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();

        // Core focused electric cyan laser beam
        ctx.strokeStyle = `rgba(56, 189, 248, ${robot.laserIntensity * 0.95})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(beamStartX, beamStartY);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();

        // High intensity white center line
        ctx.strokeStyle = `rgba(255, 255, 255, ${robot.laserIntensity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(beamStartX, beamStartY);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();

        // Focal ablation plasma glow at impact site
        ctx.beginPath();
        ctx.arc(targetX, targetY, 10 + Math.sin(time * 40) * 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.fill();

        ctx.restore();
      }

      // --- DRAW TRAIL ---
      if (robot.trail.length > 1) {
        ctx.save();
        for (let i = 1; i < robot.trail.length; i++) {
          const p1 = robot.trail[i - 1];
          const p2 = robot.trail[i];
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(196, 181, 253, ${p2.alpha * 0.35})`;
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }
        ctx.restore();
      }

      // --- DRAW VITA MINI MICROROBOT (MATCHING UPLOADED DESIGN) ---
      ctx.save();
      ctx.translate(robot.x, robot.y);
      ctx.rotate(robot.rotation);

      const rLen = robot.length;
      const rWid = robot.width;
      const finAngle = Math.sin(robot.finOscillation) * 0.28;

      // 1. QUAD TRANSLUCENT HYDROFOIL FINS (2 forward, 2 aft)
      const drawFin = (fx: number, fy: number, angleOffset: number, finLen: number, finWid: number) => {
        ctx.save();
        ctx.translate(fx, fy);
        ctx.rotate(angleOffset);

        ctx.beginPath();
        // Teardrop hydrofoil blade shape
        ctx.ellipse(0, 0, finLen, finWid, 0, 0, Math.PI * 2);

        // Translucent violet crystal material
        const finGrad = ctx.createLinearGradient(-finLen, -finWid, finLen, finWid);
        finGrad.addColorStop(0, 'rgba(216, 180, 254, 0.7)'); // Light lavender
        finGrad.addColorStop(0.7, 'rgba(168, 85, 247, 0.4)');
        finGrad.addColorStop(1, 'rgba(139, 92, 246, 0.85)');

        ctx.fillStyle = finGrad;
        ctx.fill();
        ctx.strokeStyle = 'rgba(233, 213, 255, 0.9)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      };

      // Upper forward fin
      drawFin(-4, -rWid / 2 - 5, -0.45 + finAngle, 9, 4.5);
      // Lower forward fin
      drawFin(-4, rWid / 2 + 5, 0.45 - finAngle, 9, 4.5);
      // Upper aft fin
      drawFin(-rLen / 2 + 5, -rWid / 2 - 4, -0.65 - finAngle, 8, 4);
      // Lower aft fin
      drawFin(-rLen / 2 + 5, rWid / 2 + 4, 0.65 + finAngle, 8, 4);

      // 2. TRANSLUCENT BIO-CRYSTAL POD HULL
      ctx.shadowColor = '#818cf8';
      ctx.shadowBlur = 10;

      // Outer hull gradient (crystal violet with internal transparency)
      const hullGrad = ctx.createRadialGradient(2, -3, 2, 0, 0, rLen / 2 + 2);
      hullGrad.addColorStop(0, 'rgba(238, 242, 255, 0.95)'); // Specular highlight
      hullGrad.addColorStop(0.3, 'rgba(196, 181, 253, 0.65)'); // Translucent lavender
      hullGrad.addColorStop(0.75, 'rgba(147, 51, 234, 0.45)'); // Violet crystal
      hullGrad.addColorStop(1, 'rgba(91, 33, 182, 0.7)');

      ctx.fillStyle = hullGrad;
      ctx.beginPath();
      ctx.roundRect(-rLen / 2, -rWid / 2, rLen, rWid, rWid / 2);
      ctx.fill();
      ctx.shadowBlur = 0; // reset

      // Hull outer glass perimeter line
      ctx.strokeStyle = 'rgba(224, 231, 255, 0.85)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // 3. INTERNAL PRECISION CHASSIS & CYLINDRICAL CORE (VISIBLE THROUGH CRYSTAL)
      // Cylindrical NdFeB core & microelectronics stack
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(-rLen / 2 + 6, -rWid / 2 + 3.5, rLen - 16, rWid - 7, 2);
      ctx.fill();

      // Laser resonance diode chamber
      ctx.fillStyle = '#7c3aed';
      ctx.beginPath();
      ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Internal gold micro-circuit traces
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-6, -3);
      ctx.lineTo(6, -3);
      ctx.moveTo(-6, 3);
      ctx.lineTo(6, 3);
      ctx.stroke();

      // 4. HEART-LINE SIGNATURE EMBLEM ON DORSAL POD
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.9)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      // Mini ECG heart motif
      ctx.moveTo(-4, -1);
      ctx.lineTo(-2, -1);
      ctx.lineTo(-1, -3);
      ctx.lineTo(1, 3);
      ctx.lineTo(2, -1);
      ctx.lineTo(4, -1);
      ctx.stroke();

      // 5. FRONT METALLIC COLLAR & OPTICAL LASER LENS APERTURE
      // CNC Titanium collar
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(rLen / 2 - 4, -rWid / 2 + 2, 3, rWid - 4);

      // Optical Laser Lens Bezel
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(rLen / 2 - 1, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Glowing Electric Blue / Cyan Laser Emitter Core
      ctx.fillStyle = isFiringLaserRef.current ? '#38bdf8' : '#0284c7';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = isFiringLaserRef.current ? 12 : 5;
      ctx.beginPath();
      ctx.arc(rLen / 2 - 1, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.restore();

      // --- CANVAS SCALE & STATUS OVERLAY ---
      ctx.save();
      // Scale bar
      ctx.strokeStyle = 'rgba(241, 245, 249, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(25, h - 25);
      ctx.lineTo(65, h - 25);
      ctx.moveTo(25, h - 29);
      ctx.lineTo(25, h - 21);
      ctx.moveTo(65, h - 29);
      ctx.lineTo(65, h - 21);
      ctx.stroke();

      ctx.fillStyle = 'rgba(241, 245, 249, 0.7)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText('100 µm', 28, h - 32);

      // Mission Phase Banner
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.6)';
      ctx.lineWidth = 1;
      ctx.roundRect(w / 2 - 145, 15, 290, 28, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle =
        phase === 'NAVIGATE'
          ? '#38bdf8'
          : phase === 'TREAT'
          ? '#eab308'
          : phase === 'RETRIEVE'
          ? '#22d3ee'
          : '#10b981';
      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      const phaseLabel =
        phase === 'NAVIGATE'
          ? 'PHASE 1: TARGET CHOLESTEROL'
          : phase === 'TREAT'
          ? 'PHASE 2: LASER PHOTO-ABLATION'
          : phase === 'RETRIEVE'
          ? 'PHASE 3: COMPLETE RETRIEVAL'
          : 'MISSION COMPLETE: 100% RETRIEVED';
      ctx.fillText(phaseLabel, w / 2, 33);
      ctx.textAlign = 'left';

      ctx.restore();

      // --- EMIT REAL-TIME TELEMETRY DATA ---
      const timeElapsed = (Date.now() - startTimeRef.current) / 1000;
      const robotSpeed = Math.hypot(robot.vx, robot.vy) * 0.18;
      const dragForce = 6 * Math.PI * 0.0035 * 0.000325 * (robotSpeed * 0.001) * 1e9;

      const telemetry: TelemetryData = {
        timeElapsed: Math.round(timeElapsed * 10) / 10,
        posX: Math.round(robot.x * 12.5),
        posY: Math.round(robot.y * 12.5),
        depthZ: Math.round(Math.sin(time * 0.8) * 45),
        velocity: Math.round(robotSpeed * 100) / 100,
        flowSpeed: Math.round(currentFlow * 100) / 100,
        dragForce: Math.round(dragForce * 100) / 100,
        magneticGradient: gradientIntensity,
        magneticCoilCurrents: [
          Math.round((steeringRef.current.forceX * 35 + 20) * 10) / 10,
          Math.round((steeringRef.current.forceY * 35 + 15) * 10) / 10,
          Math.round((Math.sin(time) * 12) * 10) / 10,
        ],
        reynoldsNumber: 0.00042,
        temperature: Math.round(robot.temperature * 10) / 10,
        laserPowerOutput: isFiringLaserRef.current ? 450 : 0,
        laserWavelength: 532,
        wallProximity: Math.round(currentWallProximity),
        distanceToTarget: Math.round(distToPlaque * 12.5),
        distanceToCatheter: Math.round(distToCatheter * 12.5),
        cholesterolClearance: Math.round(plaque.clearedPercentage),
        retrievalStatus: robot.latched
          ? 'LATCHED'
          : phase === 'RETRIEVE'
          ? distToCatheter < 60
            ? 'IN_CAPTURE_CONE'
            : 'HOMING'
          : 'STANDBY',
        collisions: robot.collisions,
        laserFiring: isFiringLaserRef.current,
      };

      onTelemetryUpdate(telemetry);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [
    phase,
    setPhase,
    preset,
    visMode,
    gradientIntensity,
    isAutopilot,
    onTelemetryUpdate,
    onMissionCompleted,
    triggerLaserAblation,
  ]);

  const handlePadDirection = (dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'CENTER') => {
    if (dir === 'UP') {
      steeringRef.current.forceY = -0.85;
      steeringRef.current.forceX = 0;
    } else if (dir === 'DOWN') {
      steeringRef.current.forceY = 0.85;
      steeringRef.current.forceX = 0;
    } else if (dir === 'LEFT') {
      steeringRef.current.forceX = -0.85;
      steeringRef.current.forceY = 0;
    } else if (dir === 'RIGHT') {
      steeringRef.current.forceX = 0.85;
      steeringRef.current.forceY = 0;
    } else {
      steeringRef.current.forceX = 0;
      steeringRef.current.forceY = 0;
    }
    if (soundEnabled && dir !== 'CENTER') soundEngine.playSteerPulse();
  };

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-800 bg-[#050814] shadow-2xl">
      {/* Simulation Watermark / Research Disclaimer Label */}
      <div className="absolute top-3 left-4 z-10 pointer-events-none flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <span className="text-[11px] font-mono tracking-wider text-slate-300 uppercase">
          VITA MINI CHOLESTEROL LASER SIMULATOR · PHANTOM BENCHMARK v2.1
        </span>
      </div>

      {/* Primary HTML5 Canvas */}
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        className="w-full h-auto block aspect-[2/1] cursor-crosshair"
      />

      {/* Bottom Floating Interactive Action Bar */}
      <div className="absolute bottom-3 right-4 z-10 flex items-center gap-2">
        {phase === 'TREAT' && (
          <button
            onClick={triggerLaserAblation}
            className="px-3.5 py-1.5 text-xs font-mono font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-md shadow-lg transition-all animate-pulse flex items-center gap-1.5"
          >
            <span>⚡ FIRE LASER ABLATION [SPACE]</span>
          </button>
        )}

        {phase === 'RETRIEVE' && (
          <div className="px-3 py-1.5 text-xs font-mono bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 rounded-md">
            NAVIGATE BACK TO EXTRACTION PORT
          </div>
        )}

        <button
          onClick={handleReset}
          className="px-2.5 py-1.5 text-xs font-mono bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-md transition-colors"
          title="Reset Simulation Trial"
        >
          RESET TRIAL
        </button>
      </div>

      {/* On-screen touch/mouse directional D-Pad */}
      <div className="absolute bottom-3 left-4 z-10 hidden sm:flex items-center gap-1 bg-slate-950/80 p-1.5 rounded-lg border border-slate-800">
        <button
          onMouseDown={() => handlePadDirection('LEFT')}
          onMouseUp={() => handlePadDirection('CENTER')}
          onTouchStart={() => handlePadDirection('LEFT')}
          onTouchEnd={() => handlePadDirection('CENTER')}
          className="w-7 h-7 text-xs font-mono font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 rounded flex items-center justify-center transition-colors"
        >
          ←
        </button>
        <div className="flex flex-col gap-1">
          <button
            onMouseDown={() => handlePadDirection('UP')}
            onMouseUp={() => handlePadDirection('CENTER')}
            onTouchStart={() => handlePadDirection('UP')}
            onTouchEnd={() => handlePadDirection('CENTER')}
            className="w-7 h-7 text-xs font-mono font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 rounded flex items-center justify-center transition-colors"
          >
            ↑
          </button>
          <button
            onMouseDown={() => handlePadDirection('DOWN')}
            onMouseUp={() => handlePadDirection('CENTER')}
            onTouchStart={() => handlePadDirection('DOWN')}
            onTouchEnd={() => handlePadDirection('CENTER')}
            className="w-7 h-7 text-xs font-mono font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 rounded flex items-center justify-center transition-colors"
          >
            ↓
          </button>
        </div>
        <button
          onMouseDown={() => handlePadDirection('RIGHT')}
          onMouseUp={() => handlePadDirection('CENTER')}
          onTouchStart={() => handlePadDirection('RIGHT')}
          onTouchEnd={() => handlePadDirection('CENTER')}
          className="w-7 h-7 text-xs font-mono font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 rounded flex items-center justify-center transition-colors"
        >
          →
        </button>
      </div>
    </div>
  );
};
