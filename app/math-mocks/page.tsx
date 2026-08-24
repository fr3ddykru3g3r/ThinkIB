'use client';

import React, { useState, useMemo } from 'react';
import { Search, Download, ExternalLink, FileText, Eye, ArrowLeft, BookOpen } from 'lucide-react';

const MOCK_SUITE = [
  {
    name: 'IB Math AA HL Ultimate Revision Handbook',
    category: 'Master Guide',
    level: 'HL',
    src: '/local-vault/IB_Math_AA_HL_Ultimate_Handbook.pdf'
  },
  {
    name: 'Mathematics AA HL Comprehensive Formula Sheet & Proofs',
    category: 'Formula Sheet',
    level: 'HL',
    src: '/local-vault/AA_HL_comprehensive_formula_sheet.pdf'
  },
  {
    name: 'IB Mathematics Analysis & Approaches Subject Guide',
    category: 'Official Guide',
    level: 'SL/HL',
    src: '/local-vault/Mathematics_Analysis_and_Approaches_Subject_Guide.pdf'
  },
  {
    name: 'Official Mathematics AA Formula Booklet (Clean Copy)',
    category: 'Formula Booklet',
    level: 'SL/HL',
    src: '/local-vault/aa_formula_booklet.pdf'
  },
  {
    name: 'Math AA HL 2025 Paper 1 (May Session TZ1)',
    category: 'Exam Mock',
    level: 'HL',
    src: '/api/past-papers/Mathematics/Mathematics_analysis_and_approaches_paper_1_TZ1_HL.pdf'
  },
  {
    name: 'Math AA HL 2025 Paper 1 Markscheme (May Session TZ1)',
    category: 'Worked Solution',
    level: 'HL',
    src: '/api/past-papers/Mathematics/Mathematics_analysis_and_approaches_paper_1_TZ1_HL_markscheme.pdf'
  },
  {
    name: 'Math AA HL 2025 Paper 2 (May Session TZ1)',
    category: 'Exam Mock',
    level: 'HL',
    src: '/api/past-papers/Mathematics/Mathematics_analysis_and_approaches_paper_2_TZ1_HL.pdf'
  },
  {
    name: 'Math AA HL 2025 Paper 2 Markscheme (May Session TZ1)',
    category: 'Worked Solution',
    level: 'HL',
    src: '/api/past-papers/Mathematics/Mathematics_analysis_and_approaches_paper_2_TZ1_HL_markscheme.pdf'
  },
  {
    name: 'Math AA HL 2025 Paper 3 Extended Investigation (TZ1)',
    category: 'Exam Mock',
    level: 'HL',
    src: '/api/past-papers/Mathematics/Mathematics_analysis_and_approaches_paper_3_TZ1_HL.pdf'
  },
  {
    name: 'Math AA HL 2025 Paper 3 Markscheme (TZ1)',
    category: 'Worked Solution',
    level: 'HL',
    src: '/api/past-papers/Mathematics/Mathematics_analysis_and_approaches_paper_3_TZ1_HL_markscheme.pdf'
  },
  {
    name: 'Math AA SL 2025 Paper 1 (May Session TZ1)',
    category: 'Exam Mock',
    level: 'SL',
    src: '/api/past-papers/Mathematics/Mathematics_analysis_and_approaches_paper_1_TZ1_SL.pdf'
  },
  {
    name: 'Math AA SL 2025 Paper 1 Markscheme (May Session TZ1)',
    category: 'Worked Solution',
    level: 'SL',
    src: '/api/past-papers/Mathematics/Mathematics_analysis_and_approaches_paper_1_TZ1_SL_markscheme.pdf'
  },
  {
    name: 'Math AA SL 2025 Paper 2 (May Session TZ1)',
    category: 'Exam Mock',
    level: 'SL',
    src: '/api/past-papers/Mathematics/Mathematics_analysis_and_approaches_paper_2_TZ1_SL.pdf'
  },
  {
    name: 'Math AA SL 2025 Paper 2 Markscheme (May Session TZ1)',
    category: 'Worked Solution',
    level: 'SL',
    src: '/api/past-papers/Mathematics/Mathematics_analysis_and_approaches_paper_2_TZ1_SL_markscheme.pdf'
  }
];

export default function MathMocksBrowser() {
  const [levelFilter, setLevelFilter] = useState<'ALL' | 'HL' | 'SL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMock, setSelectedMock] = useState<typeof MOCK_SUITE[0] | null>(MOCK_SUITE[0]);

  const filteredMocks = useMemo(() => {
    return MOCK_SUITE.filter(item => {
      const matchesLevel = levelFilter === 'ALL' || item.level === levelFilter || item.level === 'SL/HL';
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q || item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
      return matchesLevel && matchesQuery;
    });
  }, [levelFilter, searchQuery]);

  return (
    <div>
      {/* Header */}
      <div className="panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <span className="tech-label">[DATABASE_MOUNT: INTHINKING_MATH_SIMULATOR]</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', margin: '0.2rem 0' }}>Mathematics Mock Simulator</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.95rem', margin: 0 }}>
            Mock question papers, step-by-step worked markschemes, formula sheets, and comprehensive AA HL handbooks.
          </p>
        </div>
        <a href="/" className="filter-btn active" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <ArrowLeft size={14} /> Back to Dashboard
        </a>
      </div>

      {/* Tabs and Search Bar */}
      <div className="panel" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {(['ALL', 'HL', 'SL'] as const).map(lvl => (
            <button
              key={lvl}
              className={`filter-btn ${levelFilter === lvl ? 'active' : ''}`}
              onClick={() => setLevelFilter(lvl)}
              style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}
            >
              {lvl === 'ALL' ? 'All Resources' : `Analysis & Approaches ${lvl}`}
            </button>
          ))}
        </div>

        <div className="search-wrapper">
          <Search size={18} style={{ position: 'absolute', left: '1rem', color: 'var(--muted)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search mock question sheets, worked solutions, or formula booklets..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Directory Split Screen */}
      <div className="split-screen" style={{ height: 'calc(100vh - 270px)', minHeight: '620px' }}>
        <div className="panel browser-panel" style={{ overflowY: 'auto' }}>
          <span className="tech-label" style={{ display: 'block', marginBottom: '0.75rem' }}>
            [AVAILABLE_DOCUMENTS: {filteredMocks.length}]
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {filteredMocks.map((file, idx) => {
              const isActive = selectedMock?.src === file.src;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedMock(file)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem 0.9rem',
                    background: isActive ? 'rgba(184, 74, 57, 0.08)' : 'var(--panel-light)',
                    color: 'var(--ink)',
                    border: isActive ? '1.5px solid var(--rust)' : '1px solid var(--border)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ overflow: 'hidden', paddingRight: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '2px' }}>
                      <span style={{ fontSize: '0.68rem', padding: '1px 5px', borderRadius: '3px', background: isActive ? 'var(--rust)' : 'rgba(28,28,30,0.06)', color: isActive ? '#fff' : 'var(--muted)', fontWeight: 600 }}>
                        {file.category}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                        [{file.level}]
                      </span>
                    </div>
                    <span style={{ fontSize: '0.88rem', fontWeight: isActive ? 600 : 500, color: 'var(--ink)', display: 'block', lineHeight: '1.25' }}>
                      {file.name}
                    </span>
                  </div>
                  <FileText size={14} style={{ color: isActive ? 'var(--rust)' : 'var(--muted)', flexShrink: 0 }} />
                </div>
              );
            })}
          </div>
        </div>

        {/* PDF Viewer Panel */}
        <div className="viewer-panel">
          {selectedMock ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', background: 'var(--panel-light)', borderBottom: '1px solid var(--border)' }}>
                <span className="tech-label" style={{ maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selectedMock.name}
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <a href={selectedMock.src} download className="filter-btn active" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none', padding: '4px 10px', fontSize: '0.75rem' }}>
                    <Download size={12} /> DOWNLOAD
                  </a>
                  <a href={selectedMock.src} target="_blank" rel="noopener noreferrer" className="filter-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none', padding: '4px 10px', fontSize: '0.75rem' }}>
                    <ExternalLink size={12} /> NEW TAB
                  </a>
                </div>
              </div>
              <iframe src={selectedMock.src} className="viewer-iframe" title="Math Mock Viewer" />
            </div>
          ) : (
            <div className="viewer-placeholder">
              <Eye size={44} style={{ color: 'var(--rust)', marginBottom: '1rem', opacity: 0.5 }} />
              <h3>No Document Mounted</h3>
              <p style={{ maxWidth: '280px', marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--muted)' }}>
                Select a mock examination paper, worked solutions sheet, or handbook from the directory sidebar.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
