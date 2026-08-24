'use client';

import React, { useState, useMemo } from 'react';
import { Search, Download, ExternalLink, FileText, Eye, ArrowLeft } from 'lucide-react';

const AAHL_FILES = [
  "AAHL P1 B Questions.pdf", "AAHL P1 B Worked Solutions.pdf", "AAHL P1 C Questions.pdf", "AAHL P1 C Worked solutions.pdf",
  "AAHL P1 D Questions.pdf", "AAHL P1 D Worked Solutions.pdf", "AAHL P1 E Questions.pdf", "AAHL P1 E Worked solutions.pdf",
  "AAHL P1 F Questions.pdf", "AAHL P1 F Worked solutions.pdf", "AAHL P2 A Questions.pdf", "AAHL P2 A Worked Solutions.pdf",
  "AAHL P2 B Questions.pdf", "AAHL P2 B Worked Solutions.pdf", "AAHL P2 C Markscheme.pdf", "AAHL P2 C Questions.pdf",
  "AAHL P2 C Worked solutions.pdf", "AAHL P2 D Questions.pdf", "AAHL P2 D Worked Solutions.pdf", "AAHL P2 E Questions.pdf",
  "AAHL P2 E Worked solutions.pdf", "AAHL P2 F Questions.pdf", "AAHL P2 F Worked solutions.pdf", "AAHL P3 A Questions.pdf",
  "AAHL P3 A Worked Solutions.pdf", "AAHL P3 B Questions.pdf", "AAHL P3 B Worked solutions.pdf", "AAHL P3 C Questions.pdf",
  "AAHL P3 C Worked Solutions.pdf", "AAHL P3 D Questions.pdf", "AAHL P3 D Worked Solutions.pdf", "AAHL P3 E Questions.pdf",
  "AAHL P3 E Worked solutions.pdf", "AAHL P3 F Questions.pdf", "AAHL P3 F Worked Solutions.pdf"
];

const AASL_FILES = [
  "AASL P1 A Markscheme.pdf", "AASL P1 A Questions.pdf", "AASL P1 A Worked Solutions.pdf", "AASL P1 B Questions.pdf",
  "AASL P1 B Worked Solutions.pdf", "AASL P1 C Questions.pdf", "AASL P1 C Worked Solutions.pdf", "AASL P1 D Questions.pdf",
  "AASL P1 D Worked solutions.pdf", "AASL P1 E Questions.pdf", "AASL P1 E Worked solutions.pdf", "AASL P1 F Questions.pdf",
  "AASL P1 F Worked solutions.pdf", "AASL P2 A Markcheme.pdf", "AASL P2 A Questions.pdf", "AASL P2 A Worked Solutions.pdf",
  "AASL P2 B Questions.pdf", "AASL P2 B Worked Solutions.pdf", "AASL P2 C Questions.pdf", "AASL P2 C Worked Solutions.pdf",
  "AASL P2 D Questions.pdf", "AASL P2 D Worked solutions.pdf", "AASL P2 E Questions.pdf", "AASL P2 E Worked solutions.pdf",
  "AASL P2 F Questions.pdf", "AASL P2 F Worked solutions.pdf"
];

export default function MathMocksBrowser() {
  const [level, setLevel] = useState<'HL' | 'SL'>('HL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const allFiles = useMemo(() => {
    const list = level === 'HL' ? AAHL_FILES : AASL_FILES;
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(f => f.toLowerCase().includes(q));
  }, [level, searchQuery]);

  const selectMock = (fileName: string) => {
    const folder = level === 'HL' ? 'AAHL' : 'AASL';
    const filePath = `InThinking Math mocks/${folder}/${fileName}`;
    setSelectedFile(`/api/v2/thinkib/${encodeURIComponent(filePath)}`);
  };

  return (
    <div>
      {/* Header */}
      <div className="panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <span className="tech-label">[DATABASE_MOUNT: INTHINKING_MOCKS]</span>
          <h1 style={{ fontFamily: 'var(--display)', fontSize: '2.4rem', margin: '0.2rem 0' }}>Mathematics Mock Simulator</h1>
          <p style={{ color: 'var(--ink-soft)', fontSize: '0.95rem', margin: 0 }}>Simulated exam papers and comprehensive worked solutions for Analysis & Approaches.</p>
        </div>
        <a href="/" className="filter-btn active" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <ArrowLeft size={14} /> Back to Dashboard
        </a>
      </div>

      {/* Tabs and Search Bar */}
      <div className="panel" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          <button
            className={`filter-btn ${level === 'HL' ? 'active' : ''}`}
            onClick={() => { setLevel('HL'); setSelectedFile(null); }}
          >
            Analysis & Approaches HL
          </button>
          <button
            className={`filter-btn ${level === 'SL' ? 'active' : ''}`}
            onClick={() => { setLevel('SL'); setSelectedFile(null); }}
          >
            Analysis & Approaches SL
          </button>
        </div>

        <div className="search-wrapper">
          <Search size={18} style={{ position: 'absolute', left: '1rem', color: 'var(--ink-faint)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search mock question sheets or worked solutions..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Directory Split Screen */}
      <div className="split-screen">
        <div className="panel browser-panel" style={{ overflowY: 'auto' }}>
          <span className="tech-label" style={{ display: 'block', marginBottom: '0.75rem' }}>[MOCK_DOCUMENTS: {allFiles.length}]</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {allFiles.map((file, idx) => {
              const folder = level === 'HL' ? 'AAHL' : 'AASL';
              const filePath = `InThinking Math mocks/${folder}/${file}`;
              const isActive = selectedFile === `/api/v2/thinkib/${encodeURIComponent(filePath)}`;
              return (
                <div
                  key={idx}
                  onClick={() => selectMock(file)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem 0.9rem',
                    background: isActive ? 'var(--earth-soft)' : 'var(--paper-card)',
                    color: 'var(--ink)',
                    border: isActive ? '1px solid rgba(154, 106, 62, 0.45)' : '1px solid var(--hairline)',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: isActive ? 600 : 400, color: isActive ? 'var(--earth)' : 'var(--ink)' }}>
                    {file.replace('.pdf', '')}
                  </span>
                  <FileText size={14} style={{ color: isActive ? 'var(--earth)' : 'var(--ink-faint)', flexShrink: 0 }} />
                </div>
              );
            })}
          </div>
        </div>

        {/* PDF Viewer Panel */}
        <div className="viewer-panel">
          {selectedFile ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', background: 'var(--paper-panel)', borderBottom: '1px solid var(--hairline)' }}>
                <span className="tech-label" style={{ maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--ink)' }}>
                  {decodeURIComponent(selectedFile.split('/').pop() || '')}
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <a href={selectedFile} download className="filter-btn active" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none', padding: '4px 10px' }}>
                    <Download size={12} /> DOWNLOAD
                  </a>
                  <a href={selectedFile} target="_blank" rel="noopener noreferrer" className="filter-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none', padding: '4px 10px' }}>
                    <ExternalLink size={12} /> NEW TAB
                  </a>
                </div>
              </div>
              <iframe src={selectedFile} className="viewer-iframe" title="PDF Viewer" />
            </div>
          ) : (
            <div className="viewer-placeholder">
              <Eye size={44} style={{ color: 'var(--earth)', marginBottom: '1rem', opacity: 0.5 }} />
              <h3 style={{ fontFamily: 'var(--display)' }}>No Document Mounted</h3>
              <p style={{ maxWidth: '280px', marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--ink-soft)' }}>
                Select a mock exam sheet or worked solutions paper from the sidebar list to render it in the viewport.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
