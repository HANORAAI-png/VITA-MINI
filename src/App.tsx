/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Header } from './components/Navigation/Header';
import { ResearchNotice } from './components/Sections/ResearchNotice';
import { Hero } from './components/Sections/Hero';
import { SimulatorConsole } from './components/Simulator/SimulatorConsole';
import { ArchitectureSection } from './components/Sections/ArchitectureSection';
import { PhysicsSection } from './components/Sections/PhysicsSection';
import { PhantomBenchmarksSection } from './components/Sections/PhantomBenchmarksSection';
import { TranslationalRoadmapSection } from './components/Sections/TranslationalRoadmapSection';
import { Footer } from './components/Navigation/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-[#050814] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* 3-Zone Compliant Top Navigation Bar */}
      <Header />

      {/* Mandatory Regulatory & Research Disclaimer Ribbon */}
      <ResearchNotice />

      <main className="flex-1">
        {/* Cinematic Hero Section with High-Fidelity Showcase */}
        <Hero />

        {/* Central Feature: Live VITA MINI Simulator */}
        <SimulatorConsole />

        {/* Hardware & Material Architecture */}
        <ArchitectureSection />

        {/* Propulsion Physics & Octahedral Magnetic Actuation */}
        <PhysicsSection />

        {/* In-Vitro Phantom Studies & Quantitative Benchmark Telemetry */}
        <PhantomBenchmarksSection />

        {/* Translational Research Roadmap */}
        <TranslationalRoadmapSection />
      </main>

      {/* Clean Institutional Footer */}
      <Footer />
    </div>
  );
}
