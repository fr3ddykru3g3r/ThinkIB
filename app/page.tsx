'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { resourceUrl } from '@/lib/resource-url';
import WdcHome from './WdcHome';
import { isWdc } from '@/lib/site-brand';
import { Search, ArrowRight, Sparkles, X } from 'lucide-react';
import { resourcesData } from './resources/data';
import { getSRSStats, syncFromSATVault, syncFromAMCVault } from '@/lib/srs-engine';

function ArchiveHome() {
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
          HERO
          ========================================================================= */}
      <div style={{ marginBottom: '3rem' }}>
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
          The Archive
        </h1>

        {/* Standfirst / Subtitle */}
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
          3,786 IB past papers, 174 topic-by-topic question packs, adaptive Digital SAT practice and AMC 12 lessons.
        </p>

        {/* Platform Stat Pills */}
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
            <span style={{ color: 'var(--muted)' }}>SAT Questions</span>
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
            <span style={{ color: 'var(--accent)', fontWeight: 700 }}>174</span>
            <span style={{ color: 'var(--muted)' }}>Topical Packs</span>
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
                placeholder="Filter handbooks, portals and study links"
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
              className="kbd-badge hide-sm"
              style={{
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.25rem 0.55rem',
              }}
              title="Open command palette (⌘K)"
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
                    <span className="tabular-nums">{srsStats.dueTodayCount}</span> {srsStats.dueTodayCount === 1 ? 'question' : 'questions'} to review today
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>
                    {srsStats.retentionRate > 0 ? (
                      <>Estimated retention: <span className="tabular-nums" style={{ fontWeight: 600, color: 'var(--accent)' }}>{srsStats.retentionRate}%</span> across Digital SAT &amp; AMC 12</>
                    ) : (
                      <>Missed SAT and AMC 12 questions are queued here for review</>
                    )}
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
                Review now <ArrowRight size={13} />
              </Link>
            </div>
          )}
        </div>
      </div>

      <div>
          {/* =========================================================================
              TIER 1: INTERACTIVE PRACTICE & SIMULATION ENGINES (LARGE BENTO CARDS)
              ========================================================================= */}
          <div style={{ marginBottom: '3.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.25rem' }}>
              <div>
                <span className="section-label" style={{ margin: 0, color: 'var(--accent)' }}>PRACTICE &amp; EXAM WORKSPACES</span>
                <h2 style={{ fontSize: '1.85rem', marginTop: '0.2rem', marginBottom: '0.25rem' }}>
                  Practice Tests &amp; Workspaces
                </h2>
                <p style={{ fontSize: '0.95rem', color: 'var(--muted)', margin: 0 }}>
                  Adaptive tests, topical past paper packs, and split-screen exam viewers.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '1.5rem' }}>
              {/* 1. Digital SAT Practice */}
              <div 
                className="editorial-bento-card"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '1.75rem',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.45rem', marginBottom: '0.65rem' }}>
                    Digital SAT Practice
                  </h3>
                  <p style={{ fontSize: '0.92rem', color: 'var(--card-desc, #57534E)', lineHeight: 1.5, margin: 0 }}>
                    Full-length practice tests with adaptive routing, focused difficulty modes, built-in Desmos graphing calculator, and mistake review.
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1.25rem', marginTop: '1.75rem', borderTop: '1px solid var(--border)' }}>
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
                    Start Practice Test <ArrowRight size={14} />
                  </Link>
                  <Link
                    href="/sat"
                    style={{
                      fontSize: '0.84rem',
                      color: 'var(--muted)',
                      textDecoration: 'none',
                    }}
                  >
                    Explore SAT Hub →
                  </Link>
                </div>
              </div>

              {/* 2. IB Topical Past Papers (Physics • Chemistry • Mathematics) */}
              <div 
                className="editorial-bento-card"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '1.75rem',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.45rem', marginBottom: '0.65rem' }}>
                    IB Topical Past Papers
                  </h3>
                  <p style={{ fontSize: '0.92rem', color: 'var(--card-desc, #57534E)', lineHeight: 1.5, margin: 0 }}>
                    Practice past exam questions organized by topic for IB Physics, Chemistry, and Mathematics AA/AI, paired with official markschemes.
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1.25rem', marginTop: '1.75rem', borderTop: '1px solid var(--border)' }}>
                  <Link
                    href="/past-papers?tab=topicals"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontWeight: 600,
                      fontSize: '0.88rem',
                      color: '#1f883d',
                      textDecoration: 'none',
                    }}
                  >
                    Open Topical Hub <ArrowRight size={14} />
                  </Link>
                  <Link
                    href="/past-papers/workspace"
                    style={{
                      fontSize: '0.84rem',
                      color: 'var(--muted)',
                      textDecoration: 'none',
                    }}
                  >
                    Workspace →
                  </Link>
                </div>
              </div>

              {/* 3. IB Split-Screen Exam Workspace */}
              <div 
                className="editorial-bento-card"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '1.75rem',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.45rem', marginBottom: '0.65rem' }}>
                    Split-Screen Exam Workspace
                  </h3>
                  <p style={{ fontSize: '0.92rem', color: 'var(--card-desc, #57534E)', lineHeight: 1.5, margin: 0 }}>
                    Solve past papers with questions and markschemes side-by-side. Includes countdown timers and quick access to official formula booklets.
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1.25rem', marginTop: '1.75rem', borderTop: '1px solid var(--border)' }}>
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
                      fontSize: '0.84rem',
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
                <span className="section-label" style={{ margin: 0 }}>CURRICULUM VAULTS</span>
                <h2 style={{ fontSize: '1.85rem', marginTop: '0.2rem', marginBottom: '0.25rem' }}>
                  Revision Vaults &amp; Libraries
                </h2>
                <p style={{ fontSize: '0.95rem', color: 'var(--muted)', margin: 0 }}>
                  Past papers, topic revision guides, question banks, and exemplar assessments.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '1.5rem' }}>
              {/* Vault 1: Past Papers 2010–2025 */}
              <Link href="/past-papers" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="editorial-bento-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                      <span className="badge" style={{ fontSize: '0.72rem', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'var(--surface-inset)', border: '1px solid var(--border)', color: 'var(--ink)' }}>
                        3,786 PDFs
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.45rem' }}>Past Papers (2010–2025)</h3>
                    <p style={{ fontSize: '0.88rem', color: 'var(--card-desc, #57534E)', lineHeight: 1.5, margin: 0 }}>
                      Official past papers and markschemes spanning May 2010 to May 2025 for TZ1 and TZ2 across all IB subjects.
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, fontSize: '0.84rem', marginTop: '1.25rem', color: 'var(--ink)' }}>
                    Open Paper Vault <ArrowRight size={13} />
                  </div>
                </div>
              </Link>

              {/* Vault 2: SaveMyExams Notes */}
              <Link href="/savemyexams" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="editorial-bento-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                      <span className="badge" style={{ fontSize: '0.72rem', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'var(--surface-inset)', border: '1px solid var(--border)', color: 'var(--ink)' }}>
                        295 Guides
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.45rem' }}>SaveMyExams Revision Notes</h3>
                    <p style={{ fontSize: '0.88rem', color: 'var(--card-desc, #57534E)', lineHeight: 1.5, margin: 0 }}>
                      Topic revision guides with diagrams and worked exam examples for Biology, Chemistry, Physics, Math, Economics &amp; Psychology.
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, fontSize: '0.84rem', marginTop: '1.25rem', color: 'var(--ink)' }}>
                    Browse Notes Vault <ArrowRight size={13} />
                  </div>
                </div>
              </Link>

              {/* Vault 3: InThinking Mirror Portal */}
              <Link href="/thinkib" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="editorial-bento-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                      <span className="badge" style={{ fontSize: '0.72rem', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'var(--surface-inset)', border: '1px solid var(--border)', color: 'var(--ink)' }}>
                        Teacher Resources
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.45rem' }}>InThinking Subject Guides</h3>
                    <p style={{ fontSize: '0.88rem', color: 'var(--card-desc, #57534E)', lineHeight: 1.5, margin: 0 }}>
                      Curriculum guides, teacher answer keys, internal assessment rubrics, and laboratory experiments.
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, fontSize: '0.84rem', marginTop: '1.25rem', color: 'var(--ink)' }}>
                    Open Subject Guides <ArrowRight size={13} />
                  </div>
                </div>
              </Link>

              {/* Vault 4: Math AA Mocks */}
              <Link href="/math-mocks" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="editorial-bento-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                      <span className="badge" style={{ fontSize: '0.72rem', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'var(--surface-inset)', border: '1px solid var(--border)', color: 'var(--ink)' }}>
                        61 Papers
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.45rem' }}>Math AA Mock Exams</h3>
                    <p style={{ fontSize: '0.88rem', color: 'var(--card-desc, #57534E)', lineHeight: 1.5, margin: 0 }}>
                      Challenging mock papers with complete step-by-step worked solutions for Analysis &amp; Approaches Paper 1, 2, and 3.
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, fontSize: '0.84rem', marginTop: '1.25rem', color: 'var(--ink)' }}>
                    Start Math Mocks <ArrowRight size={13} />
                  </div>
                </div>
              </Link>

              {/* Vault: AMC 12 */}
              <Link href="/amc12" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="editorial-bento-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                      <span className="badge" style={{ fontSize: '0.72rem', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'var(--surface-inset)', border: '1px solid var(--border)', color: 'var(--ink)' }}>
                        12 Topics
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.45rem' }}>AMC 12</h3>
                    <p style={{ fontSize: '0.88rem', color: 'var(--card-desc, #57534E)', lineHeight: 1.5, margin: 0 }}>
                      Concept lessons, step-by-step worked examples, topic drills and timed 25-question mock papers.
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, fontSize: '0.84rem', marginTop: '1.25rem', color: 'var(--ink)' }}>
                    Start AMC 12 <ArrowRight size={13} />
                  </div>
                </div>
              </Link>

              {/* Vault 5: IA & EE Exemplars */}
              <Link href="/exemplars" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="editorial-bento-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                      <span className="badge" style={{ fontSize: '0.72rem', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(194, 65, 12, 0.08)', color: 'var(--accent)' }}>
                        Grade 7 / A
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.45rem' }}>IA &amp; EE Exemplars</h3>
                    <p style={{ fontSize: '0.88rem', color: 'var(--card-desc, #57534E)', lineHeight: 1.5, margin: 0 }}>
                      High-scoring Internal Assessments and Extended Essays with examiner criterion marks and commentary.
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, fontSize: '0.84rem', marginTop: '1.25rem', color: 'var(--accent)' }}>
                    Explore Exemplars <ArrowRight size={13} />
                  </div>
                </div>
              </Link>

              {/* Vault 6: Syllabus & RV Tracker */}
              <Link href="/syllabus-tracker" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="editorial-bento-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                      <span className="badge" style={{ fontSize: '0.72rem', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(21, 128, 61, 0.08)', color: 'var(--success)' }}>
                        Interactive Tracker
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.45rem' }}>Syllabus Tracker</h3>
                    <p style={{ fontSize: '0.88rem', color: 'var(--card-desc, #57534E)', lineHeight: 1.5, margin: 0 }}>
                      Syllabus mastery checklist across Math, Physics, Chemistry &amp; Biology mapped to Revision Village questions.
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
            <span className="section-label">HANDBOOKS &amp; STUDY LINKS</span>
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
                  Study Portals
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
                      href={resourceUrl(item.url)}
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
    </div>
  );
}


export default function PortalHome() { return isWdc ? <WdcHome/> : <ArchiveHome/>; }
