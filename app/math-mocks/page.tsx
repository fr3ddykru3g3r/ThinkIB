'use client';

import React, { useState, useMemo } from 'react';
import { Search, Download, ExternalLink, FileText, Eye, ArrowLeft, BookOpen } from 'lucide-react';
import IBBookletViewerModal from '@/app/components/IBBookletViewerModal';

const HANDBOOKS = [
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
  }
];

const AAHL_MOCKS = [
  "AAHL P1 B Questions.pdf", "AAHL P1 B Worked Solutions.pdf", "AAHL P1 C Questions.pdf", "AAHL P1 C Worked solutions.pdf",
  "AAHL P1 D Questions.pdf", "AAHL P1 D Worked Solutions.pdf", "AAHL P1 E Questions.pdf", "AAHL P1 E Worked solutions.pdf",
  "AAHL P1 F Questions.pdf", "AAHL P1 F Worked solutions.pdf", "AAHL P2 A Questions.pdf", "AAHL P2 A Worked Solutions.pdf",
  "AAHL P2 B Questions.pdf", "AAHL P2 B Worked Solutions.pdf", "AAHL P2 C Markscheme.pdf", "AAHL P2 C Questions.pdf",
  "AAHL P2 C Worked solutions.pdf", "AAHL P2 D Questions.pdf", "AAHL P2 D Worked Solutions.pdf", "AAHL P2 E Questions.pdf",
  "AAHL P2 E Worked solutions.pdf", "AAHL P2 F Questions.pdf", "AAHL P2 F Worked solutions.pdf", "AAHL P3 A Questions.pdf",
  "AAHL P3 A Worked Solutions.pdf", "AAHL P3 B Questions.pdf", "AAHL P3 B Worked solutions.pdf", "AAHL P3 C Questions.pdf",
  "AAHL P3 C Worked Solutions.pdf", "AAHL P3 D Questions.pdf", "AAHL P3 D Worked Solutions.pdf", "AAHL P3 E Questions.pdf",
  "AAHL P3 E Worked solutions.pdf", "AAHL P3 F Questions.pdf", "AAHL P3 F Worked Solutions.pdf"
].map(f => ({
  name: f.replace('.pdf', ''),
  category: f.toLowerCase().includes('worked') || f.toLowerCase().includes('mark') ? 'Worked Solution' : 'Question Paper',
  level: 'HL' as const,
  src: `/vault/math-mocks/AAHL/${encodeURIComponent(f)}`
}));

const AASL_MOCKS = [
  "AASL P1 A Markscheme.pdf", "AASL P1 A Questions.pdf", "AASL P1 A Worked Solutions.pdf", "AASL P1 B Questions.pdf",
  "AASL P1 B Worked Solutions.pdf", "AASL P1 C Questions.pdf", "AASL P1 C Worked Solutions.pdf", "AASL P1 D Questions.pdf",
  "AASL P1 D Worked solutions.pdf", "AASL P1 E Questions.pdf", "AASL P1 E Worked solutions.pdf", "AASL P1 F Questions.pdf",
  "AASL P1 F Worked solutions.pdf", "AASL P2 A Markcheme.pdf", "AASL P2 A Questions.pdf", "AASL P2 A Worked Solutions.pdf",
  "AASL P2 B Questions.pdf", "AASL P2 B Worked Solutions.pdf", "AASL P2 C Questions.pdf", "AASL P2 C Worked Solutions.pdf",
  "AASL P2 D Questions.pdf", "AASL P2 D Worked solutions.pdf", "AASL P2 E Questions.pdf", "AASL P2 E Worked solutions.pdf",
  "AASL P2 F Questions.pdf", "AASL P2 F Worked solutions.pdf"
].map(f => ({
  name: f.replace('.pdf', ''),
  category: f.toLowerCase().includes('worked') || f.toLowerCase().includes('mark') ? 'Worked Solution' : 'Question Paper',
  level: 'SL' as const,
  src: `/vault/math-mocks/AASL/${encodeURIComponent(f)}`
}));

const ALL_MOCK_DOCUMENTS = [...HANDBOOKS, ...AAHL_MOCKS, ...AASL_MOCKS];

export default function MathMocksBrowser() {
  const [levelFilter, setLevelFilter] = useState<'ALL' | 'HL' | 'SL' | 'HANDBOOKS'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'PAPERS' | 'SOLUTIONS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<typeof ALL_MOCK_DOCUMENTS[0] | null>(ALL_MOCK_DOCUMENTS[0]);
  const [showBookletModal, setShowBookletModal] = useState(false);

  const filteredDocs = useMemo(() => {
    return ALL_MOCK_DOCUMENTS.filter(item => {
      if (levelFilter === 'HANDBOOKS' && !item.category.includes('Guide') && !item.category.includes('Sheet') && !item.category.includes('Booklet')) return false;
      if (levelFilter === 'HL' && item.level !== 'HL') return false;
      if (levelFilter === 'SL' && item.level !== 'SL') return false;

      if (categoryFilter === 'PAPERS' && item.category !== 'Question Paper') return false;
      if (categoryFilter === 'SOLUTIONS' && item.category !== 'Worked Solution') return false;

      const q = searchQuery.toLowerCase().trim();
      if (q) {
        return item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
      }
      return true;
    });
  }, [levelFilter, categoryFilter, searchQuery]);

  return (
    <div>
      {/* Header */}
      <div className="panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <span className="tech-label">[DATABASE_MOUNT: INTHINKING_MATH_SIMULATOR]</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', margin: '0.2rem 0' }}>Mathematics Mock Simulator</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.95rem', margin: 0 }}>
            61 genuine InThinking mock papers (Papers 1, 2 & 3), step-by-step worked solutions, and formula handbooks for AA SL & HL.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <button
            onClick={() => setShowBookletModal(true)}
            className="filter-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', background: 'var(--panel-light)', borderColor: 'var(--rust)', color: 'var(--rust)', fontWeight: 600 }}
          >
            <BookOpen size={14} /> Official Formula Booklets
          </button>
          <a href="/" className="filter-btn active" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ArrowLeft size={14} /> Back to Dashboard
          </a>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="panel" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {(['ALL', 'HL', 'SL', 'HANDBOOKS'] as const).map(lvl => (
            <button
              key={lvl}
              className={`filter-btn ${levelFilter === lvl ? 'active' : ''}`}
              onClick={() => setLevelFilter(lvl)}
              style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}
            >
              {lvl === 'ALL' ? 'All Mocks & Guides (65)' : lvl === 'HL' ? 'Analysis & Approaches HL (35)' : lvl === 'SL' ? 'Analysis & Approaches SL (26)' : 'Handbooks & Formulae (4)'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-wrapper" style={{ flex: 1, minWidth: '240px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', color: 'var(--muted)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search mock question sheets (e.g. AAHL P1 C, AASL P2 Worked Solutions)..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {(['ALL', 'PAPERS', 'SOLUTIONS'] as const).map(cat => (
              <button
                key={cat}
                className={`filter-btn ${categoryFilter === cat ? 'active' : ''}`}
                onClick={() => setCategoryFilter(cat)}
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
              >
                {cat === 'ALL' ? 'All Types' : cat === 'PAPERS' ? 'Question Papers' : 'Worked Solutions'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Directory Split Screen */}
      <div className="split-screen" style={{ height: 'calc(100vh - 270px)', minHeight: '620px' }}>
        <div className="panel browser-panel" style={{ overflowY: 'auto' }}>
          <span className="tech-label" style={{ display: 'block', marginBottom: '0.75rem' }}>
            [MOCK_PAPERS_CATALOG: {filteredDocs.length}]
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {filteredDocs.map((doc, idx) => {
              const isActive = selectedDoc?.src === doc.src;
              const isSolution = doc.category === 'Worked Solution';
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDoc(doc)}
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
                      <span style={{ fontSize: '0.68rem', padding: '1px 5px', borderRadius: '3px', background: isSolution ? '#059669' : isActive ? 'var(--rust)' : 'rgba(28,28,30,0.06)', color: isSolution || isActive ? '#fff' : 'var(--muted)', fontWeight: 600 }}>
                        {doc.category}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                        [{doc.level}]
                      </span>
                    </div>
                    <span style={{ fontSize: '0.88rem', fontWeight: isActive ? 600 : 500, color: 'var(--ink)', display: 'block', lineHeight: '1.25' }}>
                      {doc.name}
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
          {selectedDoc ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', background: 'var(--panel-light)', borderBottom: '1px solid var(--border)' }}>
                <span className="tech-label" style={{ maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selectedDoc.name}
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <a href={selectedDoc.src} download className="filter-btn active" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none', padding: '4px 10px', fontSize: '0.75rem' }}>
                    <Download size={12} /> DOWNLOAD
                  </a>
                  <a href={selectedDoc.src} target="_blank" rel="noopener noreferrer" className="filter-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none', padding: '4px 10px', fontSize: '0.75rem' }}>
                    <ExternalLink size={12} /> NEW TAB
                  </a>
                </div>
              </div>
              <iframe src={selectedDoc.src} className="viewer-iframe" title="Math Mock Document Viewer" />
            </div>
          ) : (
            <div className="viewer-placeholder">
              <Eye size={44} style={{ color: 'var(--rust)', marginBottom: '1rem', opacity: 0.5 }} />
              <h3>No Mock Paper Mounted</h3>
              <p style={{ maxWidth: '280px', marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--muted)' }}>
                Select an InThinking mock examination paper, worked solutions sheet, or handbook from the catalog.
              </p>
            </div>
          )}
        </div>
      </div>

      <IBBookletViewerModal
        isOpen={showBookletModal}
        onClose={() => setShowBookletModal(false)}
        defaultSubject="math-aa"
      />
    </div>
  );
}
