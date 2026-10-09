import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { SimulationPhase, VesselPreset, VisualizationMode, TelemetryData } from '../../types/simulator';
import { soundEngine } from '../AudioEngine';
import { Eye, RotateCcw, Video, Compass, Zap } from 'lucide-react';

interface VitaSimulator3DCanvasProps {
  phase: SimulationPhase;
  setPhase: (phase: SimulationPhase) => void;
  preset: VesselPreset;
  visMode: VisualizationMode;
  gradientIntensity: number;
  isAutopilot: boolean;
  onTelemetryUpdate: (data: TelemetryData) => void;
  onMissionCompleted: (summary: { duration: number; maxGradient: number; avgWallClearance: number }) => void;
  soundEnabled: boolean;
}

export const VitaSimulator3DCanvas: React.FC<VitaSimulator3DCanvasProps> = ({
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
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Camera view modes: 'CINEMATIC' | 'FOLLOW' | 'ISOMETRIC'
  const [cameraView, setCameraView] = useState<'CINEMATIC' | 'FOLLOW' | 'ISOMETRIC'>('CINEMATIC');

  // Robot state
  const robotStateRef = useRef({
    pos: new THREE.Vector3(-14, 0.2, 0),
    vel: new THREE.Vector3(0, 0, 0),
    rotY: 0,
    rotZ: 0,
    finOsc: 0,
    temperature: 37.0,
    collisions: 0,
    latched: false,
    laserFiring: false,
    laserIntensity: 0,
  });

  // Target plaque state
  const plaqueStateRef = useRef({
    pos: new THREE.Vector3(12, -1.8, 0.5),
    initialRadius: 2.2,
    remainingPct: 100,
    mesh: null as THREE.Mesh | null,
    glowLight: null as THREE.PointLight | null,
  });

  // Input states
  const steeringRef = useRef({
    up: false,
    down: false,
    left: false,
    right: false,
    forward: false,
    backward: false,
    forceX: 0,
    forceY: 0,
    forceZ: 0,
  });

  const isFiringLaserRef = useRef<boolean>(false);
  const startTimeRef = useRef<number>(Date.now());
  const minClearanceRef = useRef<number>(999);
  const wallClearanceSumRef = useRef<number>(0);
  const framesSampledRef = useRef<number>(0);
  const lastPingTimeRef = useRef<number>(0);

  // Trigger laser ablation
  const triggerLaserAblation = useCallback(() => {
    const robot = robotStateRef.current;
    const plaque = plaqueStateRef.current;
    const dist = robot.pos.distanceTo(plaque.pos);

    if (dist < 10.0 && plaque.remainingPct > 0) {
      isFiringLaserRef.current = true;
      robot.laserFiring = true;
      soundEngine.playLaserAblation();

      setTimeout(() => {
        isFiringLaserRef.current = false;
        robot.laserFiring = false;
      }, 400);
    }
  }, []);

  // Keyboard navigation listeners
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
      if (e.code === 'KeyQ') {
        steeringRef.current.backward = true;
        steered = true;
      }
      if (e.code === 'KeyE') {
        steeringRef.current.forward = true;
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
      if (e.code === 'KeyQ') steeringRef.current.backward = false;
      if (e.code === 'KeyE') steeringRef.current.forward = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [soundEnabled, triggerLaserAblation]);

  // Reset function
  const handleReset = useCallback(() => {
    robotStateRef.current.pos.set(-14, 0.2, 0);
    robotStateRef.current.vel.set(0, 0, 0);
    robotStateRef.current.rotY = 0;
    robotStateRef.current.rotZ = 0;
    robotStateRef.current.finOsc = 0;
    robotStateRef.current.temperature = 37.0;
    robotStateRef.current.collisions = 0;
    robotStateRef.current.latched = false;
    robotStateRef.current.laserFiring = false;
    robotStateRef.current.laserIntensity = 0;

    plaqueStateRef.current.remainingPct = 100;
    if (plaqueStateRef.current.mesh) {
      plaqueStateRef.current.mesh.scale.set(1, 1, 1);
      plaqueStateRef.current.mesh.visible = true;
    }

    minClearanceRef.current = 999;
    wallClearanceSumRef.current = 0;
    framesSampledRef.current = 0;
    startTimeRef.current = Date.now();
    isFiringLaserRef.current = false;
    setPhase('NAVIGATE');
  }, [setPhase]);

  // Main Three.js Scene Setup & Render Loop
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Dimensions
    let width = container.clientWidth || 800;
    let height = container.clientHeight || 450;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(visMode === 'FLUO_ANGIOGRAPHY' ? 0x090d16 : 0x030611);
    scene.fog = new THREE.FogExp2(visMode === 'FLUO_ANGIOGRAPHY' ? 0x090d16 : 0x030611, 0.015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 14, 26);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // --- 3D LIGHTING RIG (Biological Studio Lighting) ---
    const ambientLight = new THREE.AmbientLight(0x38bdf8, 0.45);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
    keyLight.position.set(15, 25, 20);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xa855f7, 2.2);
    rimLight.position.set(-20, -10, -15);
    scene.add(rimLight);

    const vascularFillLight = new THREE.PointLight(0xbe123c, 3.5, 45);
    vascularFillLight.position.set(0, 0, 0);
    scene.add(vascularFillLight);

    // --- 3D REALISTIC VASCULAR WALLS & BLOOD PIPES ---
    // Procedural blood pipe curve: Main trunk with bifurcation
    const vesselGroup = new THREE.Group();
    scene.add(vesselGroup);

    // Main vessel spline
    const mainCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-18, 0.5, 0),
      new THREE.Vector3(-10, 0, 0.2),
      new THREE.Vector3(-2, -0.3, -0.1),
      new THREE.Vector3(5, -0.6, 0.4),
      new THREE.Vector3(12, -1.8, 0.2),
      new THREE.Vector3(18, -2.4, 0),
    ]);

    // Secondary branched vessel curve
    const branchCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.4, 0),
      new THREE.Vector3(6, 1.8, -0.8),
      new THREE.Vector3(12, 3.2, -1.2),
      new THREE.Vector3(18, 4.0, -1.5),
    ]);

    // Vessel wall materials
    // 1. Endothelial Lumen Interior (wet glistening vascular tissue)
    const intimaMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x881337, // Deep arterial crimson
      emissive: 0x4c0519,
      emissiveIntensity: 0.35,
      roughness: 0.25,
      metalness: 0.05,
      clearcoat: 0.9,
      clearcoatRoughness: 0.15,
      transmission: 0.35,
      thickness: 1.5,
      side: THREE.BackSide, // Visible from inside the pipe
      transparent: true,
      opacity: 0.92,
    });

    // 2. Tunica Media / Adventitia Exterior (translucent outer muscular sheath)
    const adventitiaMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x991b1b,
      emissive: 0x2e0811,
      roughness: 0.4,
      metalness: 0.1,
      transmission: 0.5,
      transparent: true,
      opacity: 0.35,
      side: THREE.FrontSide,
      wireframe: false,
    });

    // Outer architectural rings / collagen bands
    const ringWireMaterial = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.2,
      wireframe: true,
    });

    const pipeRadius = 4.2;
    const tubeGeometry = new THREE.TubeGeometry(mainCurve, 64, pipeRadius, 24, false);
    const branchGeometry = new THREE.TubeGeometry(branchCurve, 40, pipeRadius * 0.75, 20, false);

    // Inner lumen meshes
    const innerTube = new THREE.Mesh(tubeGeometry, intimaMaterial);
    const innerBranch = new THREE.Mesh(branchGeometry, intimaMaterial);
    vesselGroup.add(innerTube);
    vesselGroup.add(innerBranch);

    // Outer translucent muscular sheath
    const outerTube = new THREE.Mesh(
      new THREE.TubeGeometry(mainCurve, 64, pipeRadius + 0.3, 24, false),
      adventitiaMaterial
    );
    const outerBranch = new THREE.Mesh(
      new THREE.TubeGeometry(branchCurve, 40, pipeRadius * 0.75 + 0.25, 20, false),
      adventitiaMaterial
    );
    vesselGroup.add(outerTube);
    vesselGroup.add(outerBranch);

    // Structural micro-metric guide rings along vessel pipe
    const ringGeom = new THREE.TubeGeometry(mainCurve, 32, pipeRadius + 0.4, 12, false);
    const guideRings = new THREE.Mesh(ringGeom, ringWireMaterial);
    vesselGroup.add(guideRings);

    // --- 3D ATHEROSCLEROTIC BAD CHOLESTEROL PLAQUE ---
    const plaqueGroup = new THREE.Group();
    plaqueGroup.position.copy(plaqueStateRef.current.pos);
    scene.add(plaqueGroup);

    // Deformed organic atheroma geometry
    const plaqueGeometry = new THREE.DodecahedronGeometry(plaqueStateRef.current.initialRadius, 3);
    // Deform vertices for realistic irregular plaque bump
    const posAttr = plaqueGeometry.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vy = posAttr.getY(i);
      const vz = posAttr.getZ(i);
      const noise = 1 + Math.sin(vx * 3) * 0.15 + Math.cos(vy * 3) * 0.12;
      posAttr.setXYZ(i, vx * noise, vy * (noise * 0.85), vz * noise);
    }
    plaqueGeometry.computeVertexNormals();

    const plaqueMaterial = new THREE.MeshStandardMaterial({
      color: 0xfacc15, // Cholesterol lipid gold
      emissive: 0xca8a04,
      emissiveIntensity: 0.3,
      roughness: 0.65,
      metalness: 0.15,
      bumpScale: 0.1,
    });

    const plaqueMesh = new THREE.Mesh(plaqueGeometry, plaqueMaterial);
    plaqueGroup.add(plaqueMesh);
    plaqueStateRef.current.mesh = plaqueMesh;

    // Plaque internal illumination
    const plaqueGlow = new THREE.PointLight(0xfef08a, 1.2, 10);
    plaqueGroup.add(plaqueGlow);
    plaqueStateRef.current.glowLight = plaqueGlow;

    // --- 3D VITA MINI MICROROBOT (MATCHING TRANSLUCENT VIOLET POD) ---
    const robotGroup = new THREE.Group();
    robotGroup.position.copy(robotStateRef.current.pos);
    scene.add(robotGroup);

    // 1. Crystal Bio-Polymer Outer Capsule Hull
    const hullGeometry = new THREE.CapsuleGeometry(0.75, 1.3, 16, 24);
    hullGeometry.rotateZ(Math.PI / 2); // Align forward along X-axis

    const crystalHullMat = new THREE.MeshPhysicalMaterial({
      color: 0xc4b5fd, // Translucent lavender/violet crystal
      emissive: 0x6d28d9,
      emissiveIntensity: 0.25,
      roughness: 0.12,
      metalness: 0.05,
      transmission: 0.72,
      thickness: 0.8,
      transparent: true,
      opacity: 0.88,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      ior: 1.48,
    });
    const hullMesh = new THREE.Mesh(hullGeometry, crystalHullMat);
    robotGroup.add(hullMesh);

    // 2. Internal Cylindrical Mechatronics & Magnetic Core
    const coreGeometry = new THREE.CylinderGeometry(0.48, 0.48, 1.0, 16);
    coreGeometry.rotateZ(Math.PI / 2);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Deep slate mechatronics
      metalness: 0.9,
      roughness: 0.25,
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMat);
    robotGroup.add(coreMesh);

    // Internal violet laser resonance diode
    const diodeGeom = new THREE.SphereGeometry(0.28, 12, 12);
    const diodeMat = new THREE.MeshBasicMaterial({ color: 0xa855f7 });
    const diodeMesh = new THREE.Mesh(diodeGeom, diodeMat);
    robotGroup.add(diodeMesh);

    // 3. Front CNC Titanium Collar & Laser Emitter Lens
    const collarGeom = new THREE.CylinderGeometry(0.55, 0.55, 0.18, 16);
    collarGeom.rotateZ(Math.PI / 2);
    collarGeom.translate(0.95, 0, 0);
    const collarMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.95,
      roughness: 0.2,
    });
    const collarMesh = new THREE.Mesh(collarGeom, collarMat);
    robotGroup.add(collarMesh);

    // Glowing cyan/electric blue sapphire lens aperture
    const lensGeom = new THREE.SphereGeometry(0.24, 16, 16);
    lensGeom.translate(1.05, 0, 0);
    const lensMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const lensMesh = new THREE.Mesh(lensGeom, lensMat);
    robotGroup.add(lensMesh);

    // Onboard emitter light
    const robotSpotLight = new THREE.PointLight(0x06b6d4, 1.8, 12);
    robotSpotLight.position.set(1.2, 0, 0);
    robotGroup.add(robotSpotLight);

    // 4. Quad Articulated Translucent Hydrofoil Fins (2 Forward, 2 Aft)
    const finGroupLF = new THREE.Group(); // Left forward
    const finGroupRF = new THREE.Group(); // Right forward
    const finGroupLA = new THREE.Group(); // Left aft
    const finGroupRA = new THREE.Group(); // Right aft

    const finGeom = new THREE.ConeGeometry(0.35, 0.9, 12);
    finGeom.scale(1, 0.2, 1); // Flatten into hydrofoil blade
    finGeom.rotateX(Math.PI / 2);

    const finMat = new THREE.MeshPhysicalMaterial({
      color: 0xa855f7,
      transmission: 0.65,
      roughness: 0.2,
      transparent: true,
      opacity: 0.85,
    });

    const finMeshLF = new THREE.Mesh(finGeom, finMat);
    const finMeshRF = new THREE.Mesh(finGeom, finMat);
    const finMeshLA = new THREE.Mesh(finGeom, finMat);
    const finMeshRA = new THREE.Mesh(finGeom, finMat);

    finMeshLF.position.set(0, 0, 0.45);
    finMeshRF.position.set(0, 0, -0.45);
    finMeshLA.position.set(0, 0, 0.4);
    finMeshRA.position.set(0, 0, -0.4);

    finGroupLF.position.set(0.25, 0, 0.55);
    finGroupRF.position.set(0.25, 0, -0.55);
    finGroupLA.position.set(-0.55, 0, 0.5);
    finGroupRA.position.set(-0.55, 0, -0.5);

    finGroupLF.add(finMeshLF);
    finGroupRF.add(finMeshRF);
    finGroupLA.add(finMeshLA);
    finGroupRA.add(finMeshRA);

    robotGroup.add(finGroupLF);
    robotGroup.add(finGroupRF);
    robotGroup.add(finGroupLA);
    robotGroup.add(finGroupRA);

    // --- 3D VOLUMETRIC LASER ABLATION BEAM ---
    const laserGroup = new THREE.Group();
    scene.add(laserGroup);
    laserGroup.visible = false;

    // Laser core cylinder
    const laserCoreGeom = new THREE.CylinderGeometry(0.08, 0.08, 1, 12);
    laserCoreGeom.rotateZ(Math.PI / 2);
    const laserCoreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const laserCoreMesh = new THREE.Mesh(laserCoreGeom, laserCoreMat);
    laserGroup.add(laserCoreMesh);

    // Laser corona cylinder
    const laserCoronaGeom = new THREE.CylinderGeometry(0.25, 0.25, 1, 12);
    laserCoronaGeom.rotateZ(Math.PI / 2);
    const laserCoronaMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.7,
    });
    const laserCoronaMesh = new THREE.Mesh(laserCoronaGeom, laserCoronaMat);
    laserGroup.add(laserCoronaMesh);

    // Laser dynamic light casting on 3D vessel wall
    const laserImpactLight = new THREE.PointLight(0x38bdf8, 3.5, 8);
    laserGroup.add(laserImpactLight);

    // --- 3D BLOOD CELLS (ERYTHROCYTES) ---
    const rbcCount = 45;
    const rbcMeshes: THREE.Mesh[] = [];
    const rbcVelocities: { speed: number; rotSpeedX: number; rotSpeedY: number }[] = [];

    // Biconcave disk geometry
    const rbcGeom = new THREE.CylinderGeometry(0.28, 0.28, 0.12, 12);
    rbcGeom.scale(1, 0.6, 1);
    const rbcMat = new THREE.MeshPhysicalMaterial({
      color: 0x991b1b,
      roughness: 0.35,
      metalness: 0.1,
      clearcoat: 0.8,
    });

    for (let i = 0; i < rbcCount; i++) {
      const mesh = new THREE.Mesh(rbcGeom, rbcMat);
      const t = Math.random();
      const point = mainCurve.getPoint(t);
      mesh.position.set(
        point.x + (Math.random() - 0.5) * 4.5,
        point.y + (Math.random() - 0.5) * 4.5,
        point.z + (Math.random() - 0.5) * 4.5
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      scene.add(mesh);
      rbcMeshes.push(mesh);
      rbcVelocities.push({
        speed: 0.08 + Math.random() * 0.12,
        rotSpeedX: (Math.random() - 0.5) * 0.05,
        rotSpeedY: (Math.random() - 0.5) * 0.05,
      });
    }

    // --- 3D EXTRACTION CATHETER DOCKING SHEATH ---
    const catheterGroup = new THREE.Group();
    catheterGroup.position.set(-16.5, 0.5, 0);
    scene.add(catheterGroup);

    // Catheter funnel
    const cathGeom = new THREE.CylinderGeometry(1.6, 0.9, 3.5, 20, 1, true);
    cathGeom.rotateZ(Math.PI / 2);
    const cathMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.85,
      roughness: 0.3,
      side: THREE.DoubleSide,
    });
    const cathMesh = new THREE.Mesh(cathGeom, cathMat);
    catheterGroup.add(cathMesh);

    // Gold radiopaque marker ring
    const goldRingGeom = new THREE.TorusGeometry(1.3, 0.12, 12, 24);
    goldRingGeom.rotateY(Math.PI / 2);
    const goldRingMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95, roughness: 0.15 });
    const goldRing = new THREE.Mesh(goldRingGeom, goldRingMat);
    goldRing.position.set(1.5, 0, 0);
    catheterGroup.add(goldRing);

    // --- ANIMATION LOOP ---
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      const robot = robotStateRef.current;
      const plaque = plaqueStateRef.current;

      // Pulsatile biological heart expansion on vessel walls
      const heartPulse = Math.sin(time * 3.4) * 0.04;
      vesselGroup.scale.set(1 + heartPulse, 1 + heartPulse, 1 + heartPulse);

      // --- AUTOPILOT VS MANUAL ---
      if (isAutopilot && !robot.latched) {
        if (phase === 'NAVIGATE' || phase === 'TREAT') {
          const targetPos = plaque.pos.clone().add(new THREE.Vector3(-4.0, 0.3, 0));
          const diff = targetPos.clone().sub(robot.pos);
          const dist = diff.length();

          if (dist > 1.2) {
            diff.normalize();
            steeringRef.current.forceX = diff.x * 0.85;
            steeringRef.current.forceY = diff.y * 0.85;
            steeringRef.current.forceZ = diff.z * 0.85;
          } else {
            steeringRef.current.forceX = 0;
            steeringRef.current.forceY = 0;
            steeringRef.current.forceZ = 0;
            if (plaque.remainingPct > 0) {
              triggerLaserAblation();
            }
          }
        } else if (phase === 'RETRIEVE') {
          const dockPos = new THREE.Vector3(-15.0, 0.5, 0);
          const diff = dockPos.clone().sub(robot.pos);
          const dist = diff.length();

          if (dist > 0.8) {
            diff.normalize();
            steeringRef.current.forceX = diff.x * 0.95;
            steeringRef.current.forceY = diff.y * 0.95;
            steeringRef.current.forceZ = diff.z * 0.95;
          } else {
            robot.latched = true;
          }
        }
      } else if (!isAutopilot) {
        let fx = 0;
        let fy = 0;
        let fz = 0;
        if (steeringRef.current.left) fx -= 1;
        if (steeringRef.current.right) fx += 1;
        if (steeringRef.current.up) fy += 1;
        if (steeringRef.current.down) fy -= 1;
        if (steeringRef.current.forward) fz -= 1;
        if (steeringRef.current.backward) fz += 1;

        const mag = Math.hypot(fx, fy, fz);
        if (mag > 0) {
          steeringRef.current.forceX = (fx / mag) * 0.85;
          steeringRef.current.forceY = (fy / mag) * 0.85;
          steeringRef.current.forceZ = (fz / mag) * 0.85;
        } else {
          steeringRef.current.forceX *= 0.85;
          steeringRef.current.forceY *= 0.85;
          steeringRef.current.forceZ *= 0.85;
        }
      }

      // --- PHYSICS UPDATE (LOW REYNOLDS NUMBER DAMPING) ---
      if (!robot.latched) {
        const magAcc = gradientIntensity * 1.5;
        const dragFactor = 0.84;
        const flowForceX = 0.12 * (1 + heartPulse * 4); // Hemodynamic push

        robot.vel.x = (robot.vel.x + steeringRef.current.forceX * magAcc * delta * 5 + flowForceX * delta) * dragFactor;
        robot.vel.y = (robot.vel.y + steeringRef.current.forceY * magAcc * delta * 5) * dragFactor;
        robot.vel.z = (robot.vel.z + steeringRef.current.forceZ * magAcc * delta * 5) * dragFactor;

        robot.pos.add(robot.vel);

        // Vessel pipe wall boundaries
        const rBoundX = Math.max(-16, Math.min(16, robot.pos.x));
        const rBoundY = Math.max(-3.0, Math.min(3.0, robot.pos.y));
        const rBoundZ = Math.max(-3.0, Math.min(3.0, robot.pos.z));

        if (robot.pos.x !== rBoundX || robot.pos.y !== rBoundY || robot.pos.z !== rBoundZ) {
          robot.pos.set(rBoundX, rBoundY, rBoundZ);
          robot.collisions += 1;
          soundEngine.playWallCollision();
        }

        robotGroup.position.copy(robot.pos);

        // Smooth orientation alignment with velocity vector
        const speed = robot.vel.length();
        robot.finOsc += 0.2 + speed * 0.5;

        // Animate hydrofoil flipper fins
        const finAngle = Math.sin(robot.finOsc) * 0.35;
        finGroupLF.rotation.y = finAngle;
        finGroupRF.rotation.y = -finAngle;
        finGroupLA.rotation.y = -finAngle;
        finGroupRA.rotation.y = finAngle;

        if (speed > 0.02) {
          const targetRotZ = Math.atan2(robot.vel.y, robot.vel.x);
          const targetRotY = -Math.atan2(robot.vel.z, robot.vel.x);
          robotGroup.rotation.z = THREE.MathUtils.lerp(robotGroup.rotation.z, targetRotZ, 0.15);
          robotGroup.rotation.y = THREE.MathUtils.lerp(robotGroup.rotation.y, targetRotY, 0.15);
        }
      }

      // --- LASER PHOTO-ABLATION OF BAD CHOLESTEROL ---
      const distToPlaque = robot.pos.distanceTo(plaque.pos);
      const isFiring = isFiringLaserRef.current || (phase === 'TREAT' && distToPlaque < 7.5);

      if (isFiring && plaque.remainingPct > 0) {
        laserGroup.visible = true;
        robot.laserIntensity = Math.min(1.0, robot.laserIntensity + 0.15);
        plaque.remainingPct = Math.max(0, plaque.remainingPct - 0.75);
        robot.temperature = Math.min(40.8, robot.temperature + 0.05);

        // Position and stretch 3D laser cylinder from snout to plaque
        const startPoint = robot.pos.clone().add(new THREE.Vector3(1.2, 0, 0));
        const targetPoint = plaque.pos.clone();
        const laserDist = startPoint.distanceTo(targetPoint);
        const midPoint = startPoint.clone().add(targetPoint).multiplyScalar(0.5);

        laserGroup.position.copy(midPoint);
        laserGroup.scale.set(laserDist, 1, 1);
        laserGroup.lookAt(targetPoint);
        laserGroup.rotateY(Math.PI / 2);

        laserImpactLight.position.copy(targetPoint);
        laserImpactLight.intensity = 2.5 + Math.sin(time * 30) * 1.5;

        // Scale plaque down as it disintegrates
        if (plaque.mesh) {
          const scale = Math.max(0.1, plaque.remainingPct / 100);
          plaque.mesh.scale.set(scale, scale, scale);
        }

        if (plaque.remainingPct <= 0 && phase !== 'RETRIEVE' && phase !== 'COMPLETED') {
          setPhase('RETRIEVE');
          soundEngine.playSteerPulse();
        }
      } else {
        laserGroup.visible = false;
        robot.laserIntensity = Math.max(0, robot.laserIntensity - 0.08);
        robot.temperature = Math.max(37.0, robot.temperature - 0.02);
      }

      if (distToPlaque < 8.0 && phase === 'NAVIGATE') {
        setPhase('TREAT');
      }

      // --- RETRIEVAL DOCKING ---
      const dockDistance = robot.pos.distanceTo(new THREE.Vector3(-15.0, 0.5, 0));
      if (phase === 'RETRIEVE' && dockDistance < 2.0 && !robot.latched) {
        robot.latched = true;
        robot.pos.set(-15.0, 0.5, 0);
        robotGroup.position.copy(robot.pos);
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

      // --- FLOWING 3D BLOOD CELLS ---
      rbcMeshes.forEach((mesh, idx) => {
        const vel = rbcVelocities[idx];
        mesh.position.x += vel.speed * (1 + heartPulse * 3);
        mesh.rotation.x += vel.rotSpeedX;
        mesh.rotation.y += vel.rotSpeedY;

        // Reset if flowed past the end
        if (mesh.position.x > 18) {
          mesh.position.x = -18;
          mesh.position.y = (Math.random() - 0.5) * 3.5;
          mesh.position.z = (Math.random() - 0.5) * 3.5;
        }
      });

      // --- CAMERA CHOREOGRAPHY ---
      if (cameraView === 'FOLLOW') {
        // Follow-camera looking forward through the 3D lumen
        const followPos = robot.pos.clone().add(new THREE.Vector3(-6.5, 1.8, 0.2));
        camera.position.lerp(followPos, 0.1);
        camera.lookAt(robot.pos.clone().add(new THREE.Vector3(8.0, 0, 0)));
      } else if (cameraView === 'ISOMETRIC') {
        camera.position.lerp(new THREE.Vector3(-2, 18, 18), 0.08);
        camera.lookAt(0, 0, 0);
      } else {
        // Cinematic Orbit (smooth hovering around the vessel)
        const orbitAngle = time * 0.15;
        const targetCamX = Math.sin(orbitAngle) * 4.0;
        const targetCamY = 12 + Math.cos(orbitAngle) * 2.5;
        camera.position.lerp(new THREE.Vector3(targetCamX, targetCamY, 24), 0.05);
        camera.lookAt(robot.pos.x * 0.4, 0, 0);
      }

      renderer.render(scene, camera);

      // --- TELEMETRY BROADCAST ---
      const timeElapsed = (Date.now() - startTimeRef.current) / 1000;
      const speedMmS = robot.vel.length() * 1.8;
      const dragForce = 6 * Math.PI * 0.0035 * 0.000325 * (speedMmS * 0.001) * 1e9;
      const wallProxUm = Math.round((pipeRadius - Math.hypot(robot.pos.y, robot.pos.z)) * 50);

      wallClearanceSumRef.current += wallProxUm;
      framesSampledRef.current += 1;

      const telemetry: TelemetryData = {
        timeElapsed: Math.round(timeElapsed * 10) / 10,
        posX: Math.round((robot.pos.x + 15) * 250),
        posY: Math.round(robot.pos.y * 250),
        depthZ: Math.round(robot.pos.z * 250),
        velocity: Math.round(speedMmS * 100) / 100,
        flowSpeed: Math.round((1.8 + heartPulse * 4) * 100) / 100,
        dragForce: Math.round(dragForce * 100) / 100,
        magneticGradient: gradientIntensity,
        magneticCoilCurrents: [
          Math.round((steeringRef.current.forceX * 35 + 20) * 10) / 10,
          Math.round((steeringRef.current.forceY * 35 + 15) * 10) / 10,
          Math.round((steeringRef.current.forceZ * 25) * 10) / 10,
        ],
        reynoldsNumber: 0.00042,
        temperature: Math.round(robot.temperature * 10) / 10,
        laserPowerOutput: isFiring ? 450 : 0,
        laserWavelength: 532,
        wallProximity: Math.max(10, wallProxUm),
        distanceToTarget: Math.round(distToPlaque * 250),
        distanceToCatheter: Math.round(dockDistance * 250),
        cholesterolClearance: Math.round(100 - plaque.remainingPct),
        retrievalStatus: robot.latched
          ? 'LATCHED'
          : phase === 'RETRIEVE'
          ? dockDistance < 4.0
            ? 'IN_CAPTURE_CONE'
            : 'HOMING'
          : 'STANDBY',
        collisions: robot.collisions,
        laserFiring: isFiring,
      };

      onTelemetryUpdate(telemetry);
    };

    animId = requestAnimationFrame(animate);

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 800;
      height = container.clientHeight || 450;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container) container.innerHTML = '';
    };
  }, [
    phase,
    setPhase,
    preset,
    visMode,
    gradientIntensity,
    isAutopilot,
    cameraView,
    onTelemetryUpdate,
    onMissionCompleted,
    triggerLaserAblation,
  ]);

  // Touch and Mouse directional control pad
  const handlePadDirection = (dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'CENTER') => {
    if (dir === 'UP') {
      steeringRef.current.forceY = 0.85;
      steeringRef.current.forceX = 0;
    } else if (dir === 'DOWN') {
      steeringRef.current.forceY = -0.85;
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
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-[#030611] shadow-2xl">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full aspect-[16/9] min-h-[380px] sm:min-h-[460px] block cursor-grab active:cursor-grabbing" />

      {/* Top Left: 3D Telemetry HUD Label */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
        <span className="text-[11px] font-mono tracking-wider text-slate-200 uppercase bg-slate-950/80 px-2.5 py-1 rounded-md border border-slate-800">
          3D ARTERIAL LUMEN SIMULATOR · REAL-TIME PULSATILE WALLS
        </span>
      </div>

      {/* Top Right: Camera Viewport Switcher */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md p-1 rounded-lg border border-slate-800">
        <span className="text-[10px] font-mono text-slate-400 px-2 hidden sm:inline">3D CAM:</span>
        <button
          onClick={() => setCameraView('CINEMATIC')}
          className={`px-2.5 py-1 text-xs font-mono rounded-md transition-colors ${
            cameraView === 'CINEMATIC'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Cinematic
        </button>
        <button
          onClick={() => setCameraView('FOLLOW')}
          className={`px-2.5 py-1 text-xs font-mono rounded-md transition-colors ${
            cameraView === 'FOLLOW'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Follow-Cam
        </button>
        <button
          onClick={() => setCameraView('ISOMETRIC')}
          className={`px-2.5 py-1 text-xs font-mono rounded-md transition-colors ${
            cameraView === 'ISOMETRIC'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Isometric
        </button>
      </div>

      {/* Bottom Floating Interactive Action Bar */}
      <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
        {phase === 'TREAT' && (
          <button
            onClick={triggerLaserAblation}
            className="px-4 py-2 text-xs font-mono font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg shadow-xl shadow-amber-500/20 transition-all animate-pulse flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>FIRE LASER ABLATION [SPACE]</span>
          </button>
        )}

        {phase === 'RETRIEVE' && (
          <div className="px-3.5 py-1.5 text-xs font-mono bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 rounded-lg">
            NAVIGATE BACK TO EXTRACTION DOCK
          </div>
        )}

        <button
          onClick={handleReset}
          className="px-3 py-1.5 text-xs font-mono bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg transition-colors flex items-center gap-1.5"
          title="Reset Simulation Trial"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>RESET TRIAL</span>
        </button>
      </div>

      {/* On-screen touch/mouse directional D-Pad */}
      <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-1 bg-slate-950/85 backdrop-blur-md p-2 rounded-xl border border-slate-800">
        <button
          onMouseDown={() => handlePadDirection('LEFT')}
          onMouseUp={() => handlePadDirection('CENTER')}
          onTouchStart={() => handlePadDirection('LEFT')}
          onTouchEnd={() => handlePadDirection('CENTER')}
          className="w-8 h-8 text-xs font-mono font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg flex items-center justify-center transition-colors"
        >
          ←
        </button>
        <div className="flex flex-col gap-1">
          <button
            onMouseDown={() => handlePadDirection('UP')}
            onMouseUp={() => handlePadDirection('CENTER')}
            onTouchStart={() => handlePadDirection('UP')}
            onTouchEnd={() => handlePadDirection('CENTER')}
            className="w-8 h-8 text-xs font-mono font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg flex items-center justify-center transition-colors"
          >
            ↑
          </button>
          <button
            onMouseDown={() => handlePadDirection('DOWN')}
            onMouseUp={() => handlePadDirection('CENTER')}
            onTouchStart={() => handlePadDirection('DOWN')}
            onTouchEnd={() => handlePadDirection('CENTER')}
            className="w-8 h-8 text-xs font-mono font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg flex items-center justify-center transition-colors"
          >
            ↓
          </button>
        </div>
        <button
          onMouseDown={() => handlePadDirection('RIGHT')}
          onMouseUp={() => handlePadDirection('CENTER')}
          onTouchStart={() => handlePadDirection('RIGHT')}
          onTouchEnd={() => handlePadDirection('CENTER')}
          className="w-8 h-8 text-xs font-mono font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg flex items-center justify-center transition-colors"
        >
          →
        </button>
      </div>
    </div>
  );
};
