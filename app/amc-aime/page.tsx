'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  GitMerge, 
  Timer, 
  Compass, 
  Sparkles, 
  Calculator, 
  ArrowRight, 
  Award, 
  CheckCircle2, 
  Layers,
  ChevronRight,
  HelpCircle,
  TrendingUp,
  Target
} from 'lucide-react';
import { getAllDomains, getAllPastProblems, getAllSynthesisRecipes } from '@/lib/amc-aime';
import MathView from '@/app/components/MathView';

export default function AMCAIMEHubPage() {
  const domains = getAllDomains();
  const problems = getAllPastProblems();
  const recipes = getAllSynthesisRecipes();

  const [amcScoreInput, setAmcScoreInput] = useState<number>(96);
  const [aimeScoreInput, setAimeScoreInput] = useState<number>(7);

  const calculatedUsamoIndex = amcScoreInput + 10 * aimeScoreInput;
  const usamoCutoffEstimate = 225;
  const usajmoCutoffEstimate = 205;
  const mopHonorThreshold = 240;

  const setPreset = (amc: number, aime: number) => {
    setAmcScoreInput(amc);
    setAimeScoreInput(aime);
  };

  // Gauge percentage (0 to 300 scale)
  const gaugePercent = Math.min(100, Math.max(0, (calculatedUsamoIndex / 300) * 100));

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)', paddingBottom: '5rem' }}>
      {/* =========================================================================
          TOP HERO SECTION (EDITORIAL MASTHEAD & QUICK PORTALS)
          ========================================================================= */}
      <div 
        style={{
          borderBottom: '1px solid var(--border)',
          background: 'linear-gradient(180deg, rgba(194, 65, 12, 0.04) 0%, rgba(0, 0, 0, 0) 100%)',
          padding: '2.5rem 1.5rem 2.25rem',
        }}
      >
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0.75rem', borderRadius: '9999px', background: 'rgba(194, 65, 12, 0.08)', color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.85rem', border: '1px solid rgba(194, 65, 12, 0.2)' }}>
            <Sparkles size={14} />
            MAA Contest Engine • AoPS Volumes 1 &amp; 2 Curriculum
          </div>
          <h1 
            style={{ 
              fontFamily: 'var(--font-display, Cormorant Garamond, serif)', 
              fontSize: '2.85rem', 
              fontWeight: 700, 
              lineHeight: 1.15,
              marginBottom: '0.75rem' 
            }}
          >
            AMC 12 &amp; AIME Concept-to-Synthesis Hub
          </h1>
          <p style={{ maxWidth: '820px', fontSize: '1.1rem', color: 'var(--muted)', lineHeight: 1.5, marginBottom: '2rem' }}>
            Master competition mathematics from fundamental trigger signals to cross-topic Olympiad synthesis. 
            Deconstruct authentic contest problems, explore multi-domain bridge identities, and train with EV-aware game theory scoring.
          </p>

          {/* Quick Hub Navigation Bento Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.25rem' }}>
            {/* Card 1: Anatomy Deconstructor */}
            <Link 
              href="/amc-aime/learn/polynomials"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="editorial-bento-card" style={{ height: '100%' }}>
                <span className="corner-index">01</span>
                <div>
                  <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(9, 105, 218, 0.1)', color: '#0969da', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                    <BookOpen size={19} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.45rem' }}>Anatomy Deconstructor</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--card-desc, #57534E)', lineHeight: 1.45 }}>
                    4-stage problem breakdowns: stem signal detection, synthesis bridges, progressive step-by-step KaTeX reveals, and dual solution paths.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#0969da', fontWeight: 600, fontSize: '0.85rem', marginTop: '1.25rem' }}>
                  Explore Curriculum <ArrowRight size={14} />
                </div>
              </div>
            </Link>

            {/* Card 2: 8x8 Synthesis Matrix */}
            <Link 
              href="/amc-aime/synthesis"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="editorial-bento-card" style={{ height: '100%' }}>
                <span className="corner-index">02</span>
                <div>
                  <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(130, 80, 223, 0.1)', color: '#8250df', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                    <GitMerge size={19} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.45rem' }}>8×8 Synthesis Matrix</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--card-desc, #57534E)', lineHeight: 1.45 }}>
                    Interactive topic intersections. Discover the bridge identities connecting Number Theory &amp; Logs, Geometry &amp; Complex bash, and more.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#8250df', fontWeight: 600, fontSize: '0.85rem', marginTop: '1.25rem' }}>
                  Launch Matrix <ArrowRight size={14} />
                </div>
              </div>
            </Link>

            {/* Card 3: Contest Simulator */}
            <Link 
              href="/amc-aime/simulator"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="editorial-bento-card" style={{ height: '100%' }}>
                <span className="corner-index">03</span>
                <div>
                  <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(194, 65, 12, 0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                    <Timer size={19} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.45rem' }}>Contest Simulator</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--card-desc, #57534E)', lineHeight: 1.45 }}>
                    Authentic AMC 12 (75 min, +6 correct, +1.5 blank) with live EV guessing analysis, and AIME (180 min, 3-digit integers).
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent)', fontWeight: 600, fontSize: '0.85rem', marginTop: '1.25rem' }}>
                  Start Timed Exam <ArrowRight size={14} />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ maxWidth: '1240px', margin: '2.5rem auto 0', padding: '0 1.5rem' }}>
        
        {/* =========================================================================
            USA(J)MO INDEX CALCULATOR & QUALIFICATION RADAR (TACTILE INSTRUMENT PANEL)
            ========================================================================= */}
        <div 
          className="editorial-bento-card"
          style={{
            padding: '2rem 2.25rem',
            marginBottom: '3.5rem',
            background: 'var(--surface)',
          }}
        >
          {/* Instrument Header & Status Pills */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div 
                style={{ 
                  width: '42px', 
                  height: '42px', 
                  borderRadius: '10px', 
                  background: 'rgba(245, 158, 11, 0.1)', 
                  color: '#f59e0b', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}
              >
                <Award size={22} />
              </div>
              <div>
                <span className="section-label" style={{ margin: 0, color: 'var(--accent)' }}>TACTILE INSTRUMENT PANEL</span>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 700, margin: '0.15rem 0' }}>
                  USA(J)MO Index Calculator &amp; Qualification Radar
                </h2>
                <div style={{ fontSize: '0.86rem', color: 'var(--muted)' }}>
                  <MathView content="Official Formula: $\text{Index} = \text{AMC 12} + 10 \times \text{AIME}$" />
                </div>
              </div>
            </div>

            {/* Live Qualification Status Pills */}
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div 
                className="badge tabular-nums"
                style={{ 
                  background: calculatedUsamoIndex >= usamoCutoffEstimate 
                    ? 'rgba(21, 128, 61, 0.1)' 
                    : 'var(--surface-inset)', 
                  color: calculatedUsamoIndex >= usamoCutoffEstimate ? 'var(--success)' : 'var(--muted)', 
                  border: calculatedUsamoIndex >= usamoCutoffEstimate ? '1px solid rgba(21, 128, 61, 0.3)' : '1px solid var(--border)',
                  padding: '0.35rem 0.75rem', 
                  borderRadius: '8px', 
                  fontSize: '0.82rem', 
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: calculatedUsamoIndex >= usamoCutoffEstimate ? 'var(--success)' : 'var(--muted)' }} />
                USAMO (~225): {calculatedUsamoIndex >= usamoCutoffEstimate ? '★ QUALIFIED' : `-${usamoCutoffEstimate - calculatedUsamoIndex} pts`}
              </div>

              <div 
                className="badge tabular-nums"
                style={{ 
                  background: calculatedUsamoIndex >= usajmoCutoffEstimate 
                    ? 'rgba(9, 105, 218, 0.1)' 
                    : 'var(--surface-inset)', 
                  color: calculatedUsamoIndex >= usajmoCutoffEstimate ? '#0969da' : 'var(--muted)', 
                  border: calculatedUsamoIndex >= usajmoCutoffEstimate ? '1px solid rgba(9, 105, 218, 0.3)' : '1px solid var(--border)',
                  padding: '0.35rem 0.75rem', 
                  borderRadius: '8px', 
                  fontSize: '0.82rem', 
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: calculatedUsamoIndex >= usajmoCutoffEstimate ? '#0969da' : 'var(--muted)' }} />
                USAJMO (~205): {calculatedUsamoIndex >= usajmoCutoffEstimate ? '● QUALIFIED' : `-${usajmoCutoffEstimate - calculatedUsamoIndex} pts`}
              </div>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Calibration Presets:
            </span>
            <button
              type="button"
              onClick={() => setPreset(96, 5)}
              className="badge"
              style={{ padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.74rem', background: 'var(--surface-inset)', border: '1px solid var(--border)', color: 'var(--ink)', cursor: 'pointer' }}
            >
              AIME Qualifier (96 + 5 = 146)
            </button>
            <button
              type="button"
              onClick={() => setPreset(114, 8)}
              className="badge"
              style={{ padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.74rem', background: 'var(--surface-inset)', border: '1px solid var(--border)', color: 'var(--ink)', cursor: 'pointer' }}
            >
              Distinguished (114 + 8 = 194)
            </button>
            <button
              type="button"
              onClick={() => setPreset(115, 9)}
              className="badge"
              style={{ padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.74rem', background: 'rgba(9, 105, 218, 0.08)', border: '1px solid rgba(9, 105, 218, 0.25)', color: '#0969da', cursor: 'pointer', fontWeight: 600 }}
            >
              USAJMO Target (115 + 9 = 205)
            </button>
            <button
              type="button"
              onClick={() => setPreset(125, 10)}
              className="badge"
              style={{ padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.74rem', background: 'rgba(21, 128, 61, 0.08)', border: '1px solid rgba(21, 128, 61, 0.25)', color: 'var(--success)', cursor: 'pointer', fontWeight: 600 }}
            >
              USAMO Target (125 + 10 = 225)
            </button>
            <button
              type="button"
              onClick={() => setPreset(132, 12)}
              className="badge"
              style={{ padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.74rem', background: 'rgba(194, 65, 12, 0.08)', border: '1px solid rgba(194, 65, 12, 0.25)', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}
            >
              MOP Elite (132 + 12 = 252)
            </button>
          </div>

          {/* Interactive Dual Sliders & Composite Readout */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'center' }}>
            {/* Slider 1: AMC 12 Score */}
            <div style={{ background: 'var(--surface-inset)', padding: '1.25rem 1.4rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.65rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink)' }}>
                  Projected AMC 12 Score:
                </label>
                <span className="tabular-nums" style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#0969da' }}>
                  {amcScoreInput} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--muted)' }}>/ 150</span>
                </span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="150" 
                step="1.5"
                value={amcScoreInput}
                onChange={(e) => setAmcScoreInput(parseFloat(e.target.value))}
                className="instrument-slider"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)', marginTop: '0.6rem' }}>
                <span>0 Min</span>
                <span style={{ color: amcScoreInput >= 90 ? '#0969da' : 'var(--muted)', fontWeight: amcScoreInput >= 90 ? 700 : 400 }}>~90 (AIME Cutoff)</span>
                <span>150 Perfect</span>
              </div>
            </div>

            {/* Slider 2: AIME Score */}
            <div style={{ background: 'var(--surface-inset)', padding: '1.25rem 1.4rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.65rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink)' }}>
                  Projected AIME Score:
                </label>
                <span className="tabular-nums" style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#8250df' }}>
                  {aimeScoreInput} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--muted)' }}>/ 15</span>
                </span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="15" 
                step="1"
                value={aimeScoreInput}
                onChange={(e) => setAimeScoreInput(parseInt(e.target.value))}
                className="instrument-slider"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)', marginTop: '0.6rem' }}>
                <span>0 Min</span>
                <span style={{ color: aimeScoreInput >= 7 ? '#8250df' : 'var(--muted)', fontWeight: aimeScoreInput >= 7 ? 700 : 400 }}>7 (Honors)</span>
                <span>15 Max</span>
              </div>
            </div>

            {/* Digital Composite Readout */}
            <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--surface-inset)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                Composite USA(J)MO Index
              </div>
              <div 
                className="tabular-nums"
                style={{ 
                  fontSize: '3rem', 
                  fontWeight: 800, 
                  fontFamily: 'var(--font-display)',
                  color: calculatedUsamoIndex >= usamoCutoffEstimate 
                    ? 'var(--success)' 
                    : calculatedUsamoIndex >= usajmoCutoffEstimate 
                      ? '#0969da' 
                      : 'var(--accent)', 
                  lineHeight: 1.1,
                  margin: '0.2rem 0'
                }}
              >
                {calculatedUsamoIndex}
              </div>
              <div className="tabular-nums" style={{ fontSize: '0.76rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                {amcScoreInput} + (10 × {aimeScoreInput}) = {calculatedUsamoIndex} pts
              </div>
            </div>
          </div>

          {/* Interactive Qualification Radar Gauge Track */}
          <div style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
                Qualification Scale Radar (0 to 300 Max)
              </span>
              <span className="tabular-nums" style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: 600 }}>
                {Math.round(gaugePercent)}% of Maximum Index
              </span>
            </div>

            {/* Gauge Bar with Cutoff Indicator Markers */}
            <div style={{ position: 'relative', height: '14px', borderRadius: '9999px', background: 'var(--surface-inset)', border: '1px solid var(--border)', overflow: 'hidden' }}>
              {/* Dynamic Fill Bar */}
              <div 
                style={{ 
                  height: '100%', 
                  width: `${gaugePercent}%`, 
                  background: calculatedUsamoIndex >= usamoCutoffEstimate 
                    ? 'linear-gradient(90deg, #0969da 0%, var(--success) 100%)' 
                    : calculatedUsamoIndex >= usajmoCutoffEstimate 
                      ? 'linear-gradient(90deg, #f59e0b 0%, #0969da 100%)' 
                      : 'linear-gradient(90deg, var(--accent) 0%, #f59e0b 100%)', 
                  borderRadius: '9999px',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                }} 
              />
            </div>

            {/* Threshold Pin Markers */}
            <div style={{ position: 'relative', height: '24px', marginTop: '0.35rem', fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>
              {/* USAJMO Threshold Marker (205 / 300 = 68.3%) */}
              <div style={{ position: 'absolute', left: '68.3%', transform: 'translateX(-50%)', textAlign: 'center', color: calculatedUsamoIndex >= 205 ? '#0969da' : 'var(--muted)', fontWeight: 600 }}>
                ▲ USAJMO (~205)
              </div>
              {/* USAMO Threshold Marker (225 / 300 = 75%) */}
              <div style={{ position: 'absolute', left: '75%', transform: 'translateX(-50%)', textAlign: 'center', color: calculatedUsamoIndex >= 225 ? 'var(--success)' : 'var(--muted)', fontWeight: 600 }}>
                ▲ USAMO (~225)
              </div>
              {/* MOP Threshold Marker (240 / 300 = 80%) */}
              <div style={{ position: 'absolute', left: '80%', transform: 'translateX(-50%)', textAlign: 'center', color: calculatedUsamoIndex >= 240 ? 'var(--accent)' : 'var(--muted)', fontWeight: 600 }}>
                ▲ MOP (~240)
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            8 CURRICULUM DOMAINS MASTERY SECTION (CRISP EDITORIAL CARDS)
            ========================================================================= */}
        <div style={{ marginBottom: '3.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <span className="section-label" style={{ margin: 0, color: 'var(--accent)' }}>AOPS &amp; MAA CURRICULUM</span>
              <h2 style={{ fontSize: '1.85rem', marginTop: '0.2rem', marginBottom: '0.2rem' }}>
                8 Core Competition Branches
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'var(--muted)', margin: 0 }}>
                Systematic mastery trajectories categorized by competition domain with trigger signals and subtopic deconstructions.
              </p>
            </div>
            <span className="badge tabular-nums" style={{ fontSize: '0.8rem', fontWeight: 600, padding: '0.25rem 0.65rem', borderRadius: '6px', background: 'var(--surface-inset)', border: '1px solid var(--border)', color: 'var(--ink)' }}>
              8 Core Domains • {domains.reduce((acc, d) => acc + d.subtopics.length, 0)} Subtopics
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
            {domains.map((domain, idx) => {
              const cornerNum = String(idx + 1).padStart(2, '0');
              return (
                <div 
                  key={domain.id}
                  className="editorial-bento-card"
                  style={{
                    background: 'var(--surface)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <span className="corner-index">{cornerNum}</span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                        {domain.id}
                      </span>
                      <span className="badge tabular-nums" style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'var(--surface-inset)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
                        {domain.subtopics.length} subtopics
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.45rem', lineHeight: 1.25 }}>
                      {domain.title}
                    </h3>
                    <p style={{ fontSize: '0.86rem', color: 'var(--card-desc, #57534E)', lineHeight: 1.45, marginBottom: '1.25rem' }}>
                      {domain.description}
                    </p>

                    <div style={{ marginBottom: '1.25rem' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
                        Key Subtopics &amp; AoPS References:
                      </div>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                        {domain.subtopics.map((sub) => (
                          <li key={sub.id} style={{ fontSize: '0.84rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                            <CheckCircle2 size={15} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <div>
                              <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{sub.title}</span>
                              <span style={{ display: 'block', fontSize: '0.73rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                                {sub.aopsVolRef}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link 
                      href={`/amc-aime/learn/${domain.id}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: 'var(--accent)',
                        textDecoration: 'none'
                      }}
                    >
                      Open Deconstructor <ChevronRight size={15} />
                    </Link>
                    <Link
                      href={`/amc-aime/synthesis?domain=${domain.id}`}
                      style={{
                        fontSize: '0.76rem',
                        color: 'var(--muted)',
                        textDecoration: 'none'
                      }}
                    >
                      View Synthesis Bridges →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            EXPECTED VALUE & GAME THEORY STRATEGY GUIDE (TACTILE INSTRUMENT SURFACES)
            ========================================================================= */}
        <div 
          className="editorial-bento-card"
          style={{
            background: 'var(--surface)',
            padding: '2rem 2.25rem',
            marginBottom: '3rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(9, 105, 218, 0.1)', color: '#0969da', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calculator size={20} />
            </div>
            <div>
              <span className="section-label" style={{ margin: 0, color: 'var(--accent)' }}>GAME THEORY &amp; EXPECTED VALUE</span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>
                AMC 12 Decision Matrix: Guess vs. Blank
              </h2>
            </div>
          </div>

          <p style={{ fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.5, marginBottom: '1.5rem', maxWidth: '78ch' }}>
            The AMC 12 awards <strong style={{ color: 'var(--ink)' }}>+6 points</strong> for a correct answer, <strong style={{ color: 'var(--ink)' }}>+1.5 points</strong> for leaving a question blank, 
            and <strong style={{ color: 'var(--ink)' }}>0 points</strong> for an incorrect response. Because leaving a question blank yields guaranteed value, blind guessing is penalized by design.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '1.15rem', background: 'rgba(239, 68, 68, 0.04)' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>0 Choices Eliminated (5 Left)</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.35rem 0' }}>
                <MathView content="$\mathbb{E}[\text{guess}] = 1.20\text{ pts}$" />
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 1.4 }}>
                1.20 &lt; 1.50 pts. Blind guessing yields an expected loss of 0.30 points per problem. <strong style={{ color: '#ef4444' }}>LEAVE BLANK.</strong>
              </p>
            </div>

            <div style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '1.15rem', background: 'rgba(245, 158, 11, 0.04)' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>1 Choice Eliminated (4 Left)</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.35rem 0' }}>
                <MathView content="$\mathbb{E}[\text{guess}] = 1.50\text{ pts}$" />
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 1.4 }}>
                1.50 = 1.50 pts. Mathematically neutral EV. Blank is strictly preferred to minimize score variance unless closing a cutoff deficit.
              </p>
            </div>

            <div style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '1.15rem', background: 'rgba(21, 128, 61, 0.04)' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>2 Choices Eliminated (3 Left)</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.35rem 0' }}>
                <MathView content="$\mathbb{E}[\text{guess}] = 2.00\text{ pts}$" />
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 1.4 }}>
                2.00 &gt; 1.50 pts. +0.50 expected gain. <strong style={{ color: 'var(--success)' }}>MATHEMATICALLY FAVORABLE TO GUESS.</strong>
              </p>
            </div>

            <div style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '1.15rem', background: 'rgba(9, 105, 218, 0.04)' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0969da', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>3 Choices Eliminated (2 Left)</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.35rem 0' }}>
                <MathView content="$\mathbb{E}[\text{guess}] = 3.00\text{ pts}$" />
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 1.4 }}>
                3.00 &gt;&gt; 1.50 pts. 50/50 coin flip gives twice the blank value. <strong style={{ color: '#0969da' }}>ALWAYS GUESS.</strong>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
