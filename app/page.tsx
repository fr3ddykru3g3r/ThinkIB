'use client';

import React, { useState, useMemo } from 'react';
import { Search, ArrowRight } from 'lucide-react';
import { resourcesData } from './resources/data';

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

  return (
    <div>
      {/* Editorial Page Header */}
      <div style={{ marginBottom: '3.5rem' }}>
        <span className="section-label">CURATED DIRECTORY</span>
        <h1>The Academic Archive</h1>
        <p style={{ fontSize: '1.15rem', color: 'var(--muted)', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
          A secure, high-performance vault hosting InThinking guides, examination history, and study notes.
        </p>
      </div>

      {view === 'home' ? (
        <div>
          {/* Gateways Grid */}
          <div className="portal-grid">
            <a href="/sat" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="portal-card" style={{ borderColor: 'var(--rust)', background: 'rgba(184, 74, 57, 0.04)' }}>
                <span className="section-label" style={{ color: 'var(--rust)' }}>PRACTICE & PREP</span>
                <h3>Digital SAT Practicer</h3>
                <p>Adaptive timed exam simulations, targeted domain drills, prep books, and reference guides.</p>
                <div className="portal-card-arrow" style={{ color: 'var(--rust)' }}>
                  Launch SAT Suite <ArrowRight size={14} style={{ display: 'inline', marginLeft: '4px', verticalAlign: 'middle' }} />
                </div>
              </div>
            </a>

            <a href="/forum" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="portal-card" style={{ borderColor: 'var(--ink)', background: 'rgba(28, 28, 30, 0.02)' }}>
                <span className="section-label" style={{ color: 'var(--ink)' }}>COMMUNITY</span>
                <h3>Discussion Forum</h3>
                <p>Discuss exam problems, share solutions, and submit study resources for weekly review.</p>
                <div className="portal-card-arrow">
                  Join Discussion <ArrowRight size={14} style={{ display: 'inline', marginLeft: '4px', verticalAlign: 'middle' }} />
                </div>
              </div>
            </a>

            <a href="/savemyexams" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="portal-card">
                <span className="section-label">NOTES REVISION</span>
                <h3>SaveMyExams Notes Archive</h3>
                <p>270+ topic revision guides with diagrams and explanations for Bio, Chem, Physics, Math, Econ & Psych.</p>
                <div className="portal-card-arrow">
                  Browse Notes Vault <ArrowRight size={14} style={{ display: 'inline', marginLeft: '4px', verticalAlign: 'middle' }} />
                </div>
              </div>
            </a>

            <a href="/thinkib" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="portal-card">
                <span className="section-label">CURRICULUM VAULT</span>
                <h3>InThinking Database</h3>
                <p>Explore complete syllabus notes, teacher keys, and chemistry/biology tutorials directly from the scraped databases.</p>
                <div className="portal-card-arrow">
                  Open Database <ArrowRight size={14} style={{ display: 'inline', marginLeft: '4px', verticalAlign: 'middle' }} />
                </div>
              </div>
            </a>

            <a href="/past-papers" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="portal-card">
                <span className="section-label">EXAMINATION ARCHIVE</span>
                <h3>Past Papers Archive</h3>
                <p>Browse year-by-year past papers and markschemes (2021–2025) with a split-screen PDF previewer.</p>
                <div className="portal-card-arrow">
                  Mount Archive <ArrowRight size={14} style={{ display: 'inline', marginLeft: '4px', verticalAlign: 'middle' }} />
                </div>
              </div>
            </a>

            <a href="/math-mocks" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="portal-card">
                <span className="section-label">TEST SIMULATOR</span>
                <h3>Math Mock Simulator</h3>
                <p>Practice simulated mock papers with comprehensive worked solutions for AASL & AAHL levels.</p>
                <div className="portal-card-arrow">
                  Start Simulator <ArrowRight size={14} style={{ display: 'inline', marginLeft: '4px', verticalAlign: 'middle' }} />
                </div>
              </div>
            </a>

            <a href="/syllabus-tracker" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="portal-card" style={{ borderColor: '#059669', background: 'rgba(5, 150, 105, 0.03)' }}>
                <span className="section-label" style={{ color: '#059669' }}>INTERACTIVE CHECKLIST</span>
                <h3>Syllabus & Practice Tracker</h3>
                <p>3-state mastery checklist across Math, Physics, Chem & Bio linked directly to free Revision Village practice.</p>
                <div className="portal-card-arrow" style={{ color: '#059669' }}>
                  Track Syllabus <ArrowRight size={14} style={{ display: 'inline', marginLeft: '4px', verticalAlign: 'middle' }} />
                </div>
              </div>
            </a>

            <a href="/exemplars" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="portal-card" style={{ borderColor: 'var(--rust)', background: 'rgba(184, 74, 57, 0.03)' }}>
                <span className="section-label" style={{ color: 'var(--rust)' }}>7/7 ASSESSMENT VAULT</span>
                <h3>IA & EE Exemplars</h3>
                <p>Grade 7 sample IAs and Grade A Extended Essays with criterion rubric breakdowns and examiner rationales.</p>
                <div className="portal-card-arrow" style={{ color: 'var(--rust)' }}>
                  Explore Exemplars <ArrowRight size={14} style={{ display: 'inline', marginLeft: '4px', verticalAlign: 'middle' }} />
                </div>
              </div>
            </a>
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
                  onClick={() => setCategoryFilter('portal' as any)}
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
