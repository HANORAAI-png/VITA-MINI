export type SimulationPhase = 'NAVIGATE' | 'TREAT' | 'RETRIEVE' | 'COMPLETED';

export type VesselPreset = 'Coronary Bifurcation' | 'Carotid Artery Plaque' | 'Microvascular Capillary';

export type VisualizationMode = 'OPTICAL_FLUORESCENCE' | 'FLUO_ANGIOGRAPHY' | 'IVUS_ULTRASOUND';

export interface Vector2D {
  x: number;
  y: number;
}

export interface TelemetryData {
  timeElapsed: number; // seconds
  posX: number; // micrometers
  posY: number; // micrometers
  depthZ: number; // micrometers
  velocity: number; // mm/s
  flowSpeed: number; // mm/s
  dragForce: number; // nano-Newtons
  magneticGradient: number; // T/m
  magneticCoilCurrents: [number, number, number]; // [Bx, By, Bz] in mT
  reynoldsNumber: number;
  temperature: number; // Celsius
  laserPowerOutput: number; // mW
  laserWavelength: number; // nm (e.g. 450nm cyan-blue / 532nm selective lipid absorption)
  wallProximity: number; // micrometers
  distanceToTarget: number; // micrometers
  distanceToCatheter: number; // micrometers
  cholesterolClearance: number; // % plaque cleared
  retrievalStatus: 'STANDBY' | 'HOMING' | 'IN_CAPTURE_CONE' | 'LATCHED';
  collisions: number;
  laserFiring: boolean;
}

export interface BloodCell {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  aspect: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  opacity: number;
}

export interface MissionLog {
  id: string;
  timestamp: string;
  duration: number;
  preset: VesselPreset;
  navSuccess: boolean;
  cholesterolRemoved: number;
  retrievalConfirmed: boolean;
  minWallClearance: number;
  avgVelocity: number;
  maxGradientApplied: number;
}
