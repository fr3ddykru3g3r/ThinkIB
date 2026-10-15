'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  ArrowRight,
  HardDrive,
  Sparkles,
  Zap,
  BookOpen,
  Calculator,
  GraduationCap,
  CheckCircle2,
  FileText,
  Award,
  Layers,
  Clock,
  Compass,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  Filter,
  X
} from 'lucide-react';
import { resourcesData } from './resources/data';
import { getSRSStats, syncFromSATVault, syncFromAMCVault } from '@/lib/srs-engine';

const subjects = [
  { name: 'Chemistry', path: '/api/v2/thinkib/chem/chemistry.html', badge: 'SL/HL' },
  { name: 'Biology', path: '/api/v2/thinkib/bio_psych/biology.html', badge: 'SL/HL' },
  { name: 'Psychology', path: '/api/v2/thinkib/bio_psych/psychology.html', badge: 'SL/HL' },
  { name: 'Business Management', path: '/api/v2/thinkib/bm_econ/businessmanagement.html', badge: 'SL/HL' },
  { name: 'Economics', path: '/api/v2/thinkib/bm_econ/economics.html', badge: 'SL/HL' },
  { name: 'History', path: '/api/v2/thinkib/history/index.html', badge: 'HL' },
  { name: 'English A', path: '/api/v2/thinkib/englisha/englishalanglit.html', badge: 'Lang/Lit' },
  { name: 'Mathematics Analysis & Approaches', path: '/api/v2/thinkib/mathanalysis/index.html', badge: 'AA' }
];

export default function PortalHome() {
  const [view, setView] = useState<'home' | 'thinkib'>('home');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'local_vault' | 'youtube' | 'quizlet' | 'portal'>('all');

  const filteredResources = useMemo(() => {
    return resourcesData.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                            item.subject.toLowerCase().includes(search.toLowerCase()) ||
                            item.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [search, categoryFilter]);

  const [srsStats, setSrsStats] = useState<{ totalCount: number; dueTodayCount: number; retentionRate: number } | null>(null);

  useEffect(() => {
    try {
      syncFromSATVault();
      syncFromAMCVault();
      setSrsStats(getSRSStats());
    } catch (e) {
      // ignore SSR
    }
  }, []);

  const openCommandPalette = () => {
    window.dispatchEvent(new CustomEvent('open-command-palette'));
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', paddingBottom: '4rem' }}>
      {/* =========================================================================
          HERO SECTION: EDITORIAL MASTHEAD & LIVE PLATFORM TELEMETRY PILLS
          ========================================================================= */}
      <div style={{ marginBottom: '3rem' }}>
        {/* Kicker & System Status Pill */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span className="section-label" style={{ margin: 0 }}>THE ARCHIVE · VOL. 2025/2026</span>
            <span
              style={{
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                padding: '0.15rem 0.55rem',
                borderRadius: '9999px',
                background: 'rgba(21, 128, 61, 0.08)',
                color: 'var(--success)',
                border: '1px solid rgba(21, 128, 61, 0.25)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
              Samsung T7 SSD Direct I/O · 0ms Latency
            </span>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--muted)' }}>
            ISSUE NO. 04 · LOCAL WORKSPACE ENGINE
          </div>
        </div>

        {/* Masthead Main Title */}
        <h1 
          style={{ 
            fontSize: '3.3rem', 
            fontWeight: 300, 
            lineHeight: 1.1, 
            letterSpacing: '-0.02em',
            marginBottom: '0.85rem',
            color: 'var(--ink)'
          }}
        >
          The Academic Studio &amp; Archive
        </h1>

        {/* Standfirst / Editorial Deck */}
        <p 
          style={{ 
            fontSize: '1.22rem', 
            color: 'var(--muted)', 
            fontFamily: 'var(--font-display)', 
            fontStyle: 'italic', 
            maxWidth: '860px', 
            lineHeight: 1.45,
            marginBottom: '1.75rem'
          }}
        >
          An editorial academic studio and zero-latency simulation engine pairing 3,786 official IB papers, 3,443 adaptive Digital SAT items, and AoPS competition mathematics with high-craft typography and exam ergonomics.
        </p>

        {/* Live Platform Telemetry Pills Strip */}
        <div 
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            marginBottom: '1.75rem',
          }}
        >
          <div
            className="glass-nav-pill"
            style={{
              padding: '0.35rem 0.75rem',
              fontSize: '0.78rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--ink)',
            }}
          >
            <span style={{ color: 'var(--accent)', fontWeight: 700 }}>3,786</span>
            <span style={{ color: 'var(--muted)' }}>Official IB Papers</span>
          </div>

          <div
            className="glass-nav-pill"
            style={{
              padding: '0.35rem 0.75rem',
              fontSize: '0.78rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--ink)',
            }}
          >
            <span style={{ color: 'var(--accent)', fontWeight: 700 }}>3,443</span>
            <span style={{ color: 'var(--muted)' }}>Adaptive SAT Items</span>
          </div>

          <div
            className="glass-nav-pill"
            style={{
              padding: '0.35rem 0.75rem',
              fontSize: '0.78rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--ink)',
            }}
          >
            <span style={{ color: '#0969da', fontWeight: 700 }}>2025</span>
            <span style={{ color: 'var(--muted)' }}>Topical Vaults &amp; Mocks</span>
          </div>

          <div
            className="glass-nav-pill"
            style={{
              padding: '0.35rem 0.75rem',
              fontSize: '0.78rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--ink)',
            }}
          >
            <span style={{ color: '#8250df', fontWeight: 700 }}>AoPS</span>
            <span style={{ color: 'var(--muted)' }}>AMC/AIME Engine</span>
          </div>

          <div
            className="glass-nav-pill"
            style={{
              padding: '0.35rem 0.75rem',
              fontSize: '0.78rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--ink)',
            }}
          >
            <span style={{ color: 'var(--success)', fontWeight: 700 }}>860 MB/s</span>
            <span style={{ color: 'var(--muted)' }}>Local NVMe Bus</span>
          </div>
        </div>

        {/* Global Interactive Search Input + Command Palette Trigger */}
        <div style={{ maxWidth: '780px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.55rem 0.85rem',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
              transition: 'all 0.2s ease',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1 }}>
              <Search size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search 3,786 papers, SAT drills, notes, mocks..."
                style={{
                  width: '100%',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--ink)',
                  fontSize: '0.94rem',
                  outline: 'none',
                  fontFamily: 'var(--font-body)',
                }}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--muted)',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={openCommandPalette}
              className="kbd-badge"
              style={{
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.25rem 0.55rem',
              }}
              title="Open Global Command Palette (⌘K)"
            >
              <span>Command Palette</span>
              <span>⌘K</span>
            </button>
          </div>

          {/* FSRS Spaced Repetition Due Today Banner */}
          {srsStats && srsStats.dueTodayCount > 0 && (
            <div 
              style={{ 
                marginTop: '0.85rem', 
                padding: '0.85rem 1.15rem', 
                borderRadius: '10px', 
                background: 'linear-gradient(135deg, rgba(194, 65, 12, 0.07) 0%, rgba(9, 105, 218, 0.07) 100%)',
                border: '1px solid rgba(194, 65, 12, 0.22)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                flexWrap: 'wrap'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Sparkles size={17} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--ink)' }}>
                    <span className="tabular-nums">{srsStats.dueTodayCount}</span> Questions Due for Active Recall (FSRS Spaced Repetition)
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>
                    Estimated retention: <span className="tabular-nums" style={{ fontWeight: 600, color: 'var(--accent)' }}>{srsStats.retentionRate}%</span> across Digital SAT &amp; Competition Vaults
                  </div>
                </div>
              </div>
              <Link 
                href="/sat/practice/drill?mode=mistakes"
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: 'var(--accent)',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.35rem 0.7rem',
                  borderRadius: '6px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                }}
              >
                Review Due Queue <ArrowRight size={13} />
              </Link>
            </div>
          )}
        </div>
      </div>

      {view === 'home' ? (
        <div>
          {/* =========================================================================
              TIER 1: INTERACTIVE PRACTICE & SIMULATION ENGINES (LARGE BENTO CARDS)
              ========================================================================= */}
          <div style={{ marginBottom: '3.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.25rem' }}>
              <div>
                <span className="section-label" style={{ margin: 0, color: 'var(--accent)' }}>TIER 1 · SIMULATION &amp; PRACTICE ENGINES</span>
                <h2 style={{ fontSize: '1.85rem', marginTop: '0.2rem', marginBottom: '0.25rem' }}>
                  Precision Exam Studios &amp; Synthesis Hubs
                </h2>
                <p style={{ fontSize: '0.95rem', color: 'var(--muted)', margin: 0 }}>
                  Adaptive testing, cross-topic Olympiad synthesis, and split-screen examination workspaces.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
              {/* 1. Digital SAT 2.0 Adaptive & Gauntlet */}
              <div 
                className="editorial-bento-card"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  minHeight: '290px',
                }}
              >
                <span className="corner-index">01</span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span 
                      style={{ 
                        fontSize: '0.7rem', 
                        fontFamily: 'var(--font-mono)', 
                        fontWeight: 700, 
                        padding: '0.15rem 0.5rem', 
                        borderRadius: '4px', 
                        background: 'rgba(194, 65, 12, 0.1)', 
                        color: 'var(--accent)',
                        letterSpacing: '0.04em'
                      }}
                    >
                      ADAPTIVE IRT · 3,443 ITEMS
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                      BLUEBOOK SPEC
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.45rem', marginBottom: '0.65rem' }}>
                    Digital SAT 2.0 Adaptive Suite
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--card-desc, #57534E)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                    Four selectable difficulty tiers: Official Adaptive, Medium Focus (600–700), Hard Mode (700+ Upper Track), and the 750+ Hard Gauntlet. Built-in Desmos shortcuts and Metacognitive Error Taxonomy.
                  </p>

                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                    <span className="badge" style={{ fontSize: '0.72rem', padding: '0.2rem 0.45rem', borderRadius: '4px', background: 'var(--surface-inset)', border: '1px solid var(--border)' }}>
                      4 Difficulty Tiers
                    </span>
                    <span className="badge" style={{ fontSize: '0.72rem', padding: '0.2rem 0.45rem', borderRadius: '4px', background: 'var(--surface-inset)', border: '1px solid var(--border)' }}>
                      Desmos Master Key
                    </span>
                    <span className="badge" style={{ fontSize: '0.72rem', padding: '0.2rem 0.45rem', borderRadius: '4px', background: 'var(--surface-inset)', border: '1px solid var(--border)' }}>
                      Bayesian IRT
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                  <Link
                    href="/sat/practice/exam"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontWeight: 600,
                      fontSize: '0.88rem',
                      color: 'var(--accent)',
                      textDecoration: 'none',
                    }}
                  >
                    Start Full Exam <ArrowRight size={14} />
                  </Link>
                  <Link
                    href="/sat"
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--muted)',
                      textDecoration: 'none',
                    }}
                  >
                    Explore SAT Hub →
                  </Link>
                </div>
              </div>

              {/* 2. AMC 12 & AIME Synthesis Hub */}
              <div 
                className="editorial-bento-card"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  minHeight: '290px',
                }}
              >
                <span className="corner-index">02</span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span 
                      style={{ 
                        fontSize: '0.7rem', 
                        fontFamily: 'var(--font-mono)', 
                        fontWeight: 700, 
                        padding: '0.15rem 0.5rem', 
                        borderRadius: '4px', 
                        background: 'rgba(130, 80, 223, 0.1)', 
                        color: '#8250df',
                        letterSpacing: '0.04em'
                      }}
                    >
                      MAA CONTEST · AOPS VOL. 1 &amp; 2
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                      8×8 MATRIX
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.45rem', marginBottom: '0.65rem' }}>
                    AMC 12 &amp; AIME Synthesis Hub
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--card-desc, #57534E)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                    Master competition mathematics from fundamental trigger signals to cross-topic Olympiad synthesis. Features the USA(J)MO Index Calculator, 8×8 Synthesis Matrix, and EV-aware game theory guessing analysis.
                  </p>

                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                    <span className="badge" style={{ fontSize: '0.72rem', padding: '0.2rem 0.45rem', borderRadius: '4px', background: 'var(--surface-inset)', border: '1px solid var(--border)' }}>
                      8 AoPS Branches
                    </span>
                    <span className="badge" style={{ fontSize: '0.72rem', padding: '0.2rem 0.45rem', borderRadius: '4px', background: 'var(--surface-inset)', border: '1px solid var(--border)' }}>
                      USA(J)MO Radar
                    </span>
                    <span className="badge" style={{ fontSize: '0.72rem', padding: '0.2rem 0.45rem', borderRadius: '4px', background: 'var(--surface-inset)', border: '1px solid var(--border)' }}>
                      EV Guessing Strategy
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                  <Link
                    href="/amc-aime"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontWeight: 600,
                      fontSize: '0.88rem',
                      color: '#8250df',
                      textDecoration: 'none',
                    }}
                  >
                    Open Synthesis Hub <ArrowRight size={14} />
                  </Link>
                  <Link
                    href="/amc-aime/simulator"
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--muted)',
                      textDecoration: 'none',
                    }}
                  >
                    Contest Simulator →
                  </Link>
                </div>
              </div>

              {/* 3. IB Split-Screen Exam Workspace */}
              <div 
                className="editorial-bento-card"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  minHeight: '290px',
                }}
              >
                <span className="corner-index">03</span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span 
                      style={{ 
                        fontSize: '0.7rem', 
                        fontFamily: 'var(--font-mono)', 
                        fontWeight: 700, 
                        padding: '0.15rem 0.5rem', 
                        borderRadius: '4px', 
                        background: 'rgba(9, 105, 218, 0.1)', 
                        color: '#0969da',
                        letterSpacing: '0.04em'
                      }}
                    >
                      EXAM STUDIO · ZERO-LATENCY T7
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                      SIDE-BY-SIDE
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.45rem', marginBottom: '0.65rem' }}>
                    IB Split-Screen Exam Studio
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--card-desc, #57534E)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                    Authentic examination ergonomics: side-by-side synchronized PDF question paper and markscheme viewer with session countdown timers, formula booklet preview, and full exam conditions.
                  </p>

                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                    <span className="badge" style={{ fontSize: '0.72rem', padding: '0.2rem 0.45rem', borderRadius: '4px', background: 'var(--surface-inset)', border: '1px solid var(--border)' }}>
                      Dual PDF Synchronizer
                    </span>
                    <span className="badge" style={{ fontSize: '0.72rem', padding: '0.2rem 0.45rem', borderRadius: '4px', background: 'var(--surface-inset)', border: '1px solid var(--border)' }}>
                      Official Timers
                    </span>
                    <span className="badge" style={{ fontSize: '0.72rem', padding: '0.2rem 0.45rem', borderRadius: '4px', background: 'var(--surface-inset)', border: '1px solid var(--border)' }}>
                      May 2025 Vault
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                  <Link
                    href="/past-papers/workspace"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontWeight: 600,
                      fontSize: '0.88rem',
                      color: '#0969da',
                      textDecoration: 'none',
                    }}
                  >
                    Launch Workspace <ArrowRight size={14} />
                  </Link>
                  <Link
                    href="/past-papers"
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--muted)',
                      textDecoration: 'none',
                    }}
                  >
                    Browse Papers →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* =========================================================================
              TIER 2: COMPLETE IB DIPLOMA VAULTS (3-COLUMN EDITORIAL GRID)
              ========================================================================= */}
          <div style={{ marginBottom: '3.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.25rem' }}>
              <div>
                <span className="section-label" style={{ margin: 0 }}>TIER 2 · COMPLETE IB DIPLOMA ARCHIVES</span>
                <h2 style={{ fontSize: '1.85rem', marginTop: '0.2rem', marginBottom: '0.25rem' }}>
                  Curriculum Vaults &amp; Revision Libraries
                </h2>
                <p style={{ fontSize: '0.95rem', color: 'var(--muted)', margin: 0 }}>
                  Direct local access to 3,786 past papers, 295 topic guides, teacher databases, and exemplar assessments.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {/* Vault 1: Past Papers 2010–2025 */}
              <Link href="/past-papers" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="editorial-bento-card" style={{ height: '100%' }}>
                  <span className="corner-index">04</span>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span className="section-label" style={{ margin: 0 }}>EXAMINATION ARCHIVE</span>
                      <span className="badge" style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'var(--surface-inset)', border: '1px solid var(--border)', color: 'var(--ink)' }}>
                        3,786 PDFs
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.45rem' }}>Past Papers 2010–2025</h3>
                    <p style={{ fontSize: '0.88rem', color: 'var(--card-desc, #57534E)', lineHeight: 1.45 }}>
                      Comprehensive repository of official past papers and markschemes spanning May 2010 to May 2025 for TZ1 and TZ2 across all IB subjects.
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, fontSize: '0.84rem', marginTop: '1.25rem', color: 'var(--ink)' }}>
                    Open Paper Vault <ArrowRight size={13} />
                  </div>
                </div>
              </Link>

              {/* Vault 2: SaveMyExams Notes */}
              <Link href="/savemyexams" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="editorial-bento-card" style={{ height: '100%' }}>
                  <span className="corner-index">05</span>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span className="section-label" style={{ margin: 0 }}>NOTES REVISION</span>
                      <span className="badge" style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'var(--surface-inset)', border: '1px solid var(--border)', color: 'var(--ink)' }}>
                        295 Guides
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.45rem' }}>SaveMyExams Notes Archive</h3>
                    <p style={{ fontSize: '0.88rem', color: 'var(--card-desc, #57534E)', lineHeight: 1.45 }}>
                      Concise topic revision guides with high-res diagrams and worked exam examples for Biology, Chemistry, Physics, Math, Econ &amp; Psych.
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, fontSize: '0.84rem', marginTop: '1.25rem', color: 'var(--ink)' }}>
                    Browse Notes Vault <ArrowRight size={13} />
                  </div>
                </div>
              </Link>

              {/* Vault 3: InThinking Mirror Portal */}
              <Link href="/thinkib" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="editorial-bento-card" style={{ height: '100%' }}>
                  <span className="corner-index">06</span>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span className="section-label" style={{ margin: 0 }}>CURRICULUM VAULT</span>
                      <span className="badge" style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'var(--surface-inset)', border: '1px solid var(--border)', color: 'var(--ink)' }}>
                        Mirror Portal
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.45rem' }}>InThinking Subject Mirror</h3>
                    <p style={{ fontSize: '0.88rem', color: 'var(--card-desc, #57534E)', lineHeight: 1.45 }}>
                      Full syllabus guides, teacher answer keys, internal assessment rubrics, and laboratory experiments directly mirrored from InThinking.
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, fontSize: '0.84rem', marginTop: '1.25rem', color: 'var(--ink)' }}>
                    Open Mirror Portal <ArrowRight size={13} />
                  </div>
                </div>
              </Link>

              {/* Vault 4: Math AA Mocks */}
              <Link href="/math-mocks" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="editorial-bento-card" style={{ height: '100%' }}>
                  <span className="corner-index">07</span>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span className="section-label" style={{ margin: 0 }}>TEST SIMULATOR</span>
                      <span className="badge" style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'var(--surface-inset)', border: '1px solid var(--border)', color: 'var(--ink)' }}>
                        61 Papers
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.45rem' }}>Math AA HL/SL Mock Papers</h3>
                    <p style={{ fontSize: '0.88rem', color: 'var(--card-desc, #57534E)', lineHeight: 1.45 }}>
                      Challenging simulated mock papers with complete step-by-step worked solutions for Analysis &amp; Approaches Paper 1, 2, and 3.
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, fontSize: '0.84rem', marginTop: '1.25rem', color: 'var(--ink)' }}>
                    Start Math Mocks <ArrowRight size={13} />
                  </div>
                </div>
              </Link>

              {/* Vault 5: IA & EE Exemplars */}
              <Link href="/exemplars" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="editorial-bento-card" style={{ height: '100%' }}>
                  <span className="corner-index">08</span>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span className="section-label" style={{ margin: 0, color: 'var(--accent)' }}>7/7 ASSESSMENT VAULT</span>
                      <span className="badge" style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'rgba(194, 65, 12, 0.08)', color: 'var(--accent)' }}>
                        Grade 7 / A
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.45rem' }}>IA &amp; EE Exemplars</h3>
                    <p style={{ fontSize: '0.88rem', color: 'var(--card-desc, #57534E)', lineHeight: 1.45 }}>
                      Scored Grade 7 Internal Assessments and Grade A Extended Essays featuring examiner criterion marks and commentary.
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, fontSize: '0.84rem', marginTop: '1.25rem', color: 'var(--accent)' }}>
                    Explore Exemplars <ArrowRight size={13} />
                  </div>
                </div>
              </Link>

              {/* Vault 6: Syllabus & RV Tracker */}
              <Link href="/syllabus-tracker" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="editorial-bento-card" style={{ height: '100%' }}>
                  <span className="corner-index">09</span>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span className="section-label" style={{ margin: 0, color: 'var(--success)' }}>INTERACTIVE CHECKLIST</span>
                      <span className="badge" style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'rgba(21, 128, 61, 0.08)', color: 'var(--success)' }}>
                        RV Linked
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.45rem' }}>Syllabus &amp; RV Tracker</h3>
                    <p style={{ fontSize: '0.88rem', color: 'var(--card-desc, #57534E)', lineHeight: 1.45 }}>
                      3-state syllabus mastery checklist across Math, Physics, Chem &amp; Bio mapped directly to free Revision Village question sets.
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, fontSize: '0.84rem', marginTop: '1.25rem', color: 'var(--success)' }}>
                    Track Syllabus <ArrowRight size={13} />
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* =========================================================================
              STUDENT RESOURCES & VERIFIED EXTERNAL PORTALS CATALOG
              ========================================================================= */}
          <div className="editorial-section">
            <span className="section-label">STUDENT RESOURCES &amp; REFERENCE VAULT</span>
            <h2>Revision Handbooks &amp; External Portals</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              Hand-curated reference documents, study decks, and channels matching <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{filteredResources.length}</span> items.
            </p>
            
            <div style={{ marginBottom: '2rem' }}>
              <div className="filter-container" style={{ margin: 0, gap: '0.5rem' }}>
                <button
                  className={`filter-btn ${categoryFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setCategoryFilter('all')}
                >
                  All Items ({resourcesData.length})
                </button>
                <button
                  className={`filter-btn ${categoryFilter === 'portal' ? 'active' : ''}`}
                  onClick={() => setCategoryFilter('portal')}
                >
                  Verified Portals
                </button>
                <button
                  className={`filter-btn ${categoryFilter === 'local_vault' ? 'active' : ''}`}
                  onClick={() => setCategoryFilter('local_vault')}
                >
                  Local PDF Vault
                </button>
                <button
                  className={`filter-btn ${categoryFilter === 'youtube' ? 'active' : ''}`}
                  onClick={() => setCategoryFilter('youtube')}
                >
                  YouTube Channels
                </button>
                <button
                  className={`filter-btn ${categoryFilter === 'quizlet' ? 'active' : ''}`}
                  onClick={() => setCategoryFilter('quizlet')}
                >
                  Quizlet Decks
                </button>
              </div>
            </div>

            {/* Resources Grid */}
            <div className="resource-grid">
              {filteredResources.map((item, idx) => (
                <div key={idx} className="resource-card">
                  <div>
                    <div className="resource-card-header">
                      <span className="resource-subject">{item.subject}</span>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {item.rating && (
                          <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.45rem', background: 'var(--accent)', color: '#fff', borderRadius: '3px', fontWeight: 600 }}>
                            {item.rating}
                          </span>
                        )}
                        <span className="resource-badge">
                          {item.category.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="resource-title">{item.name}</div>
                    <p className="resource-desc">{item.description}</p>
                  </div>
                  <div>
                    <div className="resource-meta">{item.meta}</div>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="resource-link"
                    >
                      {item.category === 'local_vault' ? 'Download PDF Document' : 'Open Resource Page'} <ArrowRight size={12} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ThinkIB Browser Panel */
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '2rem' }}>
            <div>
              <span className="section-label">INTHINKING CURRICULUM MIRROR</span>
              <h2>Subject Syllabus Guides</h2>
            </div>
            <button className="filter-btn active" onClick={() => setView('home')}>Back to Home</button>
          </div>

          <div className="portal-grid">
            {subjects.map((subj, idx) => (
              <a key={idx} href={subj.path} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="editorial-bento-card">
                  <span className="resource-subject">{subj.badge}</span>
                  <h3 style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>{subj.name}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>Open full InThinking syllabus traversal dashboard on this subject guide.</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, fontSize: '0.84rem', marginTop: '1rem', color: 'var(--accent)' }}>
                    Open Guide <ArrowRight size={13} />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

