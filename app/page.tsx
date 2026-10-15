'use client';

import React, { useState, useMemo } from 'react';
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
  MessageSquare
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

  React.useEffect(() => {
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
    <div>
      {/* Editorial Page Header & Hero */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.65rem' }}>
          <span className="section-label" style={{ margin: 0 }}>ACADEMIC ARCHIVE & TEST SUITE</span>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '0.15rem 0.55rem',
              borderRadius: '20px',
              background: 'rgba(5, 150, 105, 0.1)',
              color: '#059669',
              border: '1px solid rgba(5, 150, 105, 0.25)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669', display: 'inline-block' }} />
            T7 SSD Vault Active
          </span>
        </div>

        <h1 style={{ marginBottom: '0.75rem' }}>The Academic Archive</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--muted)', fontFamily: 'var(--font-display)', fontStyle: 'italic', maxWidth: '820px', lineHeight: 1.45 }}>
          A private, ultra-high-speed educational repository hosting 3,786 past papers, 3,443 official SAT questions, 295 revision guides, and 61 full math mocks — running locally with zero latency.
        </p>

        {/* Quick Launch Search Input (Triggers Command Palette) */}
        <div style={{ marginTop: '1.5rem', maxWidth: '680px' }}>
          <div
            onClick={openCommandPalette}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              background: 'var(--surface-raised, var(--surface, #ffffff))',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              cursor: 'pointer',
              transition: 'border-color 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Search size={18} style={{ color: 'var(--rust, #b84a39)' }} />
              <span style={{ color: 'var(--muted)', fontSize: '0.92rem' }}>
                Quick search 3,786 papers, SAT drills, notes, mocks...
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <kbd style={{ fontSize: '0.72rem', padding: '0.15rem 0.45rem', borderRadius: '6px', background: 'var(--surface-inset)', border: '1px solid var(--border)', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                ⌘K
              </kbd>
            </div>
          </div>

          {/* FSRS Spaced Repetition Due Today Banner */}
          {srsStats && srsStats.dueTodayCount > 0 && (
            <div 
              style={{ 
                marginTop: '0.85rem', 
                padding: '0.75rem 1rem', 
                borderRadius: '10px', 
                background: 'linear-gradient(135deg, rgba(184, 74, 57, 0.08) 0%, rgba(9, 105, 218, 0.08) 100%)',
                border: '1px solid rgba(184, 74, 57, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                flexWrap: 'wrap'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={16} color="var(--rust, #b84a39)" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                    {srsStats.dueTodayCount} Questions Due for Active Recall (FSRS Engine)
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                    Estimated retention: {srsStats.retentionRate}% across SAT & Contest Vaults
                  </div>
                </div>
              </div>
              <Link 
                href="/sat/practice/drill?mode=mistakes"
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: 'var(--rust, #b84a39)',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                Review Now <ArrowRight size={12} />
              </Link>
            </div>
          )}

          {/* Quick jump pills */}
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
            <Link
              href="/amc-aime"
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '0.25rem 0.6rem',
                borderRadius: '6px',
                background: 'rgba(130, 80, 223, 0.08)',
                color: '#8250df',
                border: '1px solid rgba(130, 80, 223, 0.25)'
              }}
            >
              🏆 AMC / AIME Hub
            </Link>
            <Link
              href="/past-papers/workspace"
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '0.25rem 0.6rem',
                borderRadius: '6px',
                background: 'rgba(9, 105, 218, 0.08)',
                color: '#0969da',
                border: '1px solid rgba(9, 105, 218, 0.25)'
              }}
            >
              ⚡ Split-Screen Exam
            </Link>
            <Link
              href="/sat/practice/exam"
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '0.25rem 0.6rem',
                borderRadius: '6px',
                background: 'rgba(184, 74, 57, 0.08)',
                color: 'var(--rust)',
                border: '1px solid rgba(184, 74, 57, 0.2)'
              }}
            >
              ⚡ Full SAT Exam
            </Link>
            <Link
              href="/past-papers"
              style={{
                fontSize: '0.75rem',
                fontWeight: 500,
                padding: '0.25rem 0.6rem',
                borderRadius: '6px',
                background: 'var(--surface-inset)',
                color: 'var(--ink)',
                border: '1px solid var(--border)'
              }}
            >
              📚 May 2025 Papers
            </Link>
            <Link
              href="/math-mocks"
              style={{
                fontSize: '0.75rem',
                fontWeight: 500,
                padding: '0.25rem 0.6rem',
                borderRadius: '6px',
                background: 'var(--surface-inset)',
                color: 'var(--ink)',
                border: '1px solid var(--border)'
              }}
            >
              📐 Math AA HL Mocks
            </Link>
            <Link
              href="/savemyexams"
              style={{
                fontSize: '0.75rem',
                fontWeight: 500,
                padding: '0.25rem 0.6rem',
                borderRadius: '6px',
                background: 'var(--surface-inset)',
                color: 'var(--ink)',
                border: '1px solid var(--border)'
              }}
            >
              📝 SaveMyExams Notes
            </Link>
            <Link
              href="/syllabus-tracker"
              style={{
                fontSize: '0.75rem',
                fontWeight: 500,
                padding: '0.25rem 0.6rem',
                borderRadius: '6px',
                background: 'var(--surface-inset)',
                color: 'var(--ink)',
                border: '1px solid var(--border)'
              }}
            >
              🎯 Syllabus Tracker
            </Link>
          </div>
        </div>

        {/* Live SSD Vault Telemetry Strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.75rem',
            marginTop: '2rem',
            padding: '1rem',
            borderRadius: '12px',
            background: 'var(--surface-raised, var(--surface, #ffffff))',
            border: '1px solid var(--border)'
          }}
        >
          <div style={{ padding: '0.5rem' }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
              Past Papers Vault
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--ink)', marginTop: '0.2rem' }}>
              3,786
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.15rem' }}>
              Years 2010–2025 • TZ1/TZ2
            </div>
          </div>

          <div style={{ padding: '0.5rem' }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
              Digital SAT Suite
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--rust)', marginTop: '0.2rem' }}>
              3,443
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.15rem' }}>
              Official Items • Adaptive IRT
            </div>
          </div>

          <div style={{ padding: '0.5rem' }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
              SaveMyExams Notes
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--ink)', marginTop: '0.2rem' }}>
              295
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.15rem' }}>
              High-Yield Guides • 6 Subjects
            </div>
          </div>

          <div style={{ padding: '0.5rem' }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
              Math Mock Papers
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--ink)', marginTop: '0.2rem' }}>
              61
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.15rem' }}>
              Full Worked PDF Solutions
            </div>
          </div>

          <div style={{ padding: '0.5rem' }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
              SSD Throughput
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#059669', marginTop: '0.2rem' }}>
              860 MB/s
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.15rem' }}>
              Direct Samsung T7 I/O • 0ms Latency
            </div>
          </div>
        </div>
      </div>

      {view === 'home' ? (
        <div>
          {/* Gateways Grid */}
          <div className="portal-grid">
            <Link href="/sat" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="portal-card" style={{ borderColor: 'var(--rust)', background: 'rgba(184, 74, 57, 0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className="section-label" style={{ color: 'var(--rust)', margin: 0 }}>PRACTICE & PREP</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'var(--rust)', color: '#fff' }}>
                    3,443 Qs
                  </span>
                </div>
                <h3>Digital SAT Practicer</h3>
                <p>Adaptive timed exam simulations, targeted domain drills, prep books, Socratic hints, and printable worksheets.</p>
                <div className="portal-card-arrow" style={{ color: 'var(--rust)' }}>
                  Launch SAT Suite <ArrowRight size={14} style={{ display: 'inline', marginLeft: '4px', verticalAlign: 'middle' }} />
                </div>
              </div>
            </Link>

            <Link href="/past-papers" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="portal-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className="section-label" style={{ margin: 0 }}>EXAMINATION ARCHIVE</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'var(--surface-inset)', border: '1px solid var(--border)', color: 'var(--ink)' }}>
                    3,786 PDFs
                  </span>
                </div>
                <h3>Past Papers Archive</h3>
                <p>Browse year-by-year past papers and markschemes (2010–2025) with a split-screen PDF previewer.</p>
                <div className="portal-card-arrow">
                  Open Archive <ArrowRight size={14} style={{ display: 'inline', marginLeft: '4px', verticalAlign: 'middle' }} />
                </div>
              </div>
            </Link>

            <Link href="/savemyexams" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="portal-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className="section-label" style={{ margin: 0 }}>NOTES REVISION</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'var(--surface-inset)', border: '1px solid var(--border)', color: 'var(--ink)' }}>
                    295 Guides
                  </span>
                </div>
                <h3>SaveMyExams Notes Archive</h3>
                <p>295 topic revision guides with diagrams and explanations for Bio, Chem, Physics, Math, Econ & Psych.</p>
                <div className="portal-card-arrow">
                  Browse Notes Vault <ArrowRight size={14} style={{ display: 'inline', marginLeft: '4px', verticalAlign: 'middle' }} />
                </div>
              </div>
            </Link>

            <Link href="/math-mocks" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="portal-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className="section-label" style={{ margin: 0 }}>TEST SIMULATOR</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'var(--surface-inset)', border: '1px solid var(--border)', color: 'var(--ink)' }}>
                    61 Papers
                  </span>
                </div>
                <h3>Math Mock Simulator</h3>
                <p>Practice simulated mock papers with comprehensive worked solutions for AASL & AAHL levels.</p>
                <div className="portal-card-arrow">
                  Start Simulator <ArrowRight size={14} style={{ display: 'inline', marginLeft: '4px', verticalAlign: 'middle' }} />
                </div>
              </div>
            </Link>

            <Link href="/syllabus-tracker" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="portal-card" style={{ borderColor: '#059669', background: 'rgba(5, 150, 105, 0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className="section-label" style={{ color: '#059669', margin: 0 }}>INTERACTIVE CHECKLIST</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'rgba(5, 150, 105, 0.1)', color: '#059669' }}>
                    RV Linked
                  </span>
                </div>
                <h3>Syllabus & Practice Tracker</h3>
                <p>3-state mastery checklist across Math, Physics, Chem & Bio linked directly to free Revision Village practice.</p>
                <div className="portal-card-arrow" style={{ color: '#059669' }}>
                  Track Syllabus <ArrowRight size={14} style={{ display: 'inline', marginLeft: '4px', verticalAlign: 'middle' }} />
                </div>
              </div>
            </Link>

            <Link href="/exemplars" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="portal-card" style={{ borderColor: 'var(--rust)', background: 'rgba(184, 74, 57, 0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className="section-label" style={{ color: 'var(--rust)', margin: 0 }}>7/7 ASSESSMENT VAULT</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'rgba(184, 74, 57, 0.1)', color: 'var(--rust)' }}>
                    Grade 7 / A
                  </span>
                </div>
                <h3>IA & EE Exemplars</h3>
                <p>Grade 7 sample IAs and Grade A Extended Essays with criterion rubric breakdowns and examiner rationales.</p>
                <div className="portal-card-arrow" style={{ color: 'var(--rust)' }}>
                  Explore Exemplars <ArrowRight size={14} style={{ display: 'inline', marginLeft: '4px', verticalAlign: 'middle' }} />
                </div>
              </div>
            </Link>

            <Link href="/flashcards" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="portal-card" style={{ borderColor: '#0284c7', background: 'rgba(2, 132, 199, 0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className="section-label" style={{ color: '#0284c7', margin: 0 }}>ACTIVE RECALL</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'rgba(2, 132, 199, 0.1)', color: '#0284c7' }}>
                    3D Flip
                  </span>
                </div>
                <h3>Memory Flashcards</h3>
                <p>Interactive 3D retrieval flip-cards for math formulas, SAT grammar conventions, and IB command terms.</p>
                <div className="portal-card-arrow" style={{ color: '#0284c7' }}>
                  Study Flashcards <ArrowRight size={14} style={{ display: 'inline', marginLeft: '4px', verticalAlign: 'middle' }} />
                </div>
              </div>
            </Link>

            <Link href="/forum" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="portal-card" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className="section-label" style={{ margin: 0 }}>COMMUNITY</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'var(--surface-inset)', border: '1px solid var(--border)', color: 'var(--ink)' }}>
                    Open
                  </span>
                </div>
                <h3>Discussion Forum</h3>
                <p>Discuss exam problems, share solutions, and submit study resources for curated weekly review.</p>
                <div className="portal-card-arrow">
                  Join Discussion <ArrowRight size={14} style={{ display: 'inline', marginLeft: '4px', verticalAlign: 'middle' }} />
                </div>
              </div>
            </Link>

            <Link href="/thinkib" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="portal-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className="section-label" style={{ margin: 0 }}>CURRICULUM VAULT</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'var(--surface-inset)', border: '1px solid var(--border)', color: 'var(--ink)' }}>
                    Mirror
                  </span>
                </div>
                <h3>InThinking Database</h3>
                <p>Explore complete syllabus notes, teacher keys, and chemistry/biology tutorials directly from subject databases.</p>
                <div className="portal-card-arrow">
                  Open Database <ArrowRight size={14} style={{ display: 'inline', marginLeft: '4px', verticalAlign: 'middle' }} />
                </div>
              </div>
            </Link>
          </div>

          {/* Resources Catalog */}
          <div className="editorial-section">
            <span className="section-label">STUDENT RESOURCES & VAULT</span>
            <h2>Revision Handbooks & External Portals</h2>
            
            <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
              <div className="search-wrapper">
                <Search size={20} style={{ position: 'absolute', left: '1rem', color: 'var(--muted)', pointerEvents: 'none' }} />
                <input
                  type="text"
                  placeholder="Search resources by topic, code, or subject..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="filter-container">
                <button
                  className={`filter-btn ${categoryFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setCategoryFilter('all')}
                >
                  All Items
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
                          <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'var(--rust)', color: '#fff', borderRadius: '2px', fontWeight: 600 }}>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid var(--ink)', paddingBottom: '1rem', marginBottom: '2rem' }}>
            <h2>Subject Syllabus Guides</h2>
            <button className="filter-btn active" onClick={() => setView('home')}>Back to Home</button>
          </div>

          <div className="portal-grid">
            {subjects.map((subj, idx) => (
              <a key={idx} href={subj.path} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="portal-card">
                  <span className="resource-subject">{subj.badge}</span>
                  <h3 style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>{subj.name}</h3>
                  <p style={{ fontSize: '0.95rem' }}>Open full InThinking syllabus traversal dashboard on this subject guide.</p>
                  <div className="portal-card-arrow">Open Guide</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
