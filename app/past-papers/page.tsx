'use client';

import React, { useState, useMemo } from 'react';
import { ChevronRight, FileText, Search, Download, ExternalLink, SlidersHorizontal, Eye, ArrowLeft, BookOpen, HelpCircle } from 'lucide-react';
import rawMap from './map.json';
import IBBookletViewerModal from '@/app/components/IBBookletViewerModal';
import IBCommandTermsModal from '@/app/components/IBCommandTermsModal';

interface FileInfo {
  name: string;
  path: string[];
}

interface MapNode {
  files?: string[];
  [key: string]: any;
}

const IB_SUBJECTS = [
  { label: 'All Subjects', value: '' },
  { label: 'Chemistry', value: 'chemistry' },
  { label: 'Biology', value: 'biology' },
  { label: 'Physics', value: 'physics' },
  { label: 'Mathematics', value: 'math' },
  { label: 'Business Management', value: 'business' },
  { label: 'Economics', value: 'economics' },
  { label: 'History', value: 'history' },
  { label: 'English', value: 'english' },
  { label: 'Psychology', value: 'psychology' },
  { label: 'Geography', value: 'geography' },
  { label: 'Computer Science', value: 'computer' },
  { label: 'Environmental Systems', value: 'environmental' }
];

const PAPER_TYPES = [
  { label: 'All Document Types', value: '' },
  { label: 'Paper 1 (P1)', value: 'paper1' },
  { label: 'Paper 2 (P2)', value: 'paper2' },
  { label: 'Paper 3 (P3)', value: 'paper3' },
  { label: 'Markscheme / MS', value: 'markscheme' }
];

const YEARS = [
  { label: 'All Years', value: '' },
  ...Array.from({ length: 16 }, (_, i) => {
    const year = 2025 - i;
    return { label: `${year}`, value: `${year}` };
  })
];

export default function PastPapersBrowser() {
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter States
  const [subjectFilter, setSubjectFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [paperTypeFilter, setPaperTypeFilter] = useState('');
  const [showBookletModal, setShowBookletModal] = useState(false);
  const [showCommandTermsModal, setShowCommandTermsModal] = useState(false);

  const mapData = rawMap as MapNode;

  // Flatten all files for searching & filtering
  const allFiles = useMemo(() => {
    const list: FileInfo[] = [];
    
    function recurse(node: MapNode, pathAcc: string[]) {
      if (node.files) {
        node.files
          .filter(f => !f.toLowerCase().endsWith('.html') && !f.toLowerCase().endsWith('.htm'))
          .forEach(file => {
            list.push({ name: file, path: [...pathAcc, file] });
          });
      }
      Object.keys(node).forEach(key => {
        if (key !== 'files' && key.toLowerCase() !== 'html') {
          recurse(node[key], [...pathAcc, key]);
        }
      });
    }

    recurse(mapData, []);
    return list;
  }, [mapData]);

  // Combined Search & Multi-Filter Logic
  const filteredSearch = useMemo(() => {
    const hasQuery = searchQuery.trim().length > 0;
    const hasSubject = subjectFilter.length > 0;
    const hasYear = yearFilter.length > 0;
    const hasPaperType = paperTypeFilter.length > 0;

    if (!hasQuery && !hasSubject && !hasYear && !hasPaperType) {
      return [];
    }

    const queryClean = searchQuery.toLowerCase().replace(/[_–\-]/g, ' ').trim();
    const queryTokens = queryClean.split(/\s+/).filter(Boolean);
    const sub = subjectFilter.toLowerCase();
    const yr = yearFilter.toLowerCase();

    return allFiles.filter(file => {
      const cleanName = file.name.toLowerCase().replace(/[_–\-]/g, ' ');
      const cleanPath = file.path.join(' ').toLowerCase().replace(/[_–\-]/g, ' ');

      if (hasSubject && !cleanPath.includes(sub) && !cleanName.includes(sub)) return false;
      if (hasYear && !cleanPath.includes(yr) && !cleanName.includes(yr)) return false;

      if (hasPaperType) {
        const typeMatch = (
          (paperTypeFilter === 'paper1' && (cleanName.includes('paper 1') || cleanName.includes('p1') || cleanName.includes('paper_1'))) ||
          (paperTypeFilter === 'paper2' && (cleanName.includes('paper 2') || cleanName.includes('p2') || cleanName.includes('paper_2'))) ||
          (paperTypeFilter === 'paper3' && (cleanName.includes('paper 3') || cleanName.includes('p3') || cleanName.includes('paper_3'))) ||
          (paperTypeFilter === 'markscheme' && (cleanName.includes('markscheme') || cleanName.includes('ms') || cleanName.includes('mark scheme')))
        );
        if (!typeMatch) return false;
      }

      if (hasQuery) {
        const matchesQuery = queryTokens.every(token => {
          if (/^\d+$/.test(token)) {
            const regex = new RegExp(`\\b${token}\\b`);
            return regex.test(cleanName) || regex.test(cleanPath);
          }
          return cleanName.includes(token) || cleanPath.includes(token);
        });
        if (!matchesQuery) return false;
      }

      return true;
    });
  }, [allFiles, searchQuery, subjectFilter, yearFilter, paperTypeFilter]);

  const isSearching = searchQuery.trim().length > 0 || subjectFilter.length > 0 || yearFilter.length > 0 || paperTypeFilter.length > 0;

  // Folder navigation tree
  const currentNode = useMemo(() => {
    let node = mapData;
    for (const segment of currentPath) {
      if (node[segment]) {
        node = node[segment];
      } else {
        return { files: [] };
      }
    }
    return node;
  }, [mapData, currentPath]);

  const folders = useMemo(() => {
    return Object.keys(currentNode)
      .filter(key => key !== 'files' && key.toLowerCase() !== 'html' && !key.toLowerCase().endsWith('.html'))
      .sort();
  }, [currentNode]);

  const files = useMemo(() => {
    return (currentNode.files || []).filter(f => !f.toLowerCase().endsWith('.html') && !f.toLowerCase().endsWith('.htm'));
  }, [currentNode]);

  const handleFolderClick = (folder: string) => {
    setCurrentPath(prev => [...prev, folder]);
  };

  const handleBackClick = () => {
    setCurrentPath(prev => prev.slice(0, -1));
  };

  const selectFile = (filePath: string[]) => {
    const encoded = filePath.map(encodeURIComponent).join('/');
    setSelectedFile(`/api/past-papers/${encoded}`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSubjectFilter('');
    setYearFilter('');
    setPaperTypeFilter('');
  };

  return (
    <div>
      {/* Header */}
      <div className="panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <span className="tech-label">[VAULT_MOUNT: PAST_PAPERS]</span>
          <h1 style={{ fontFamily: 'var(--display)', fontSize: '2.4rem', margin: '0.2rem 0' }}>Past Examinations Vault</h1>
          <p style={{ color: 'var(--ink-soft)', fontSize: '0.95rem', margin: 0 }}>Examination papers, markschemes, and audio files across 16 examination sessions (2010–2025).</p>
        </div>
        <a href="/" className="filter-btn active" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <ArrowLeft size={14} /> Back to Dashboard
        </a>
      </div>

      {/* Grid Inputs & Filters */}
      <div className="panel" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          <div className="search-wrapper">
            <Search size={18} style={{ position: 'absolute', left: '1rem', color: 'var(--ink-faint)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search 4,400+ past papers... (e.g. Chemistry HL TZ1)"
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span className="tech-label">Subject</span>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="select-input"
              style={{ width: '190px' }}
            >
              {IB_SUBJECTS.map((sub, idx) => (
                <option key={idx} value={sub.value}>{sub.label}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span className="tech-label">Year</span>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="select-input"
              style={{ width: '130px' }}
            >
              {YEARS.map((yr, idx) => (
                <option key={idx} value={yr.value}>{yr.label}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span className="tech-label">Paper Type</span>
            <select
              value={paperTypeFilter}
              onChange={(e) => setPaperTypeFilter(e.target.value)}
              className="select-input"
              style={{ width: '190px' }}
            >
              {PAPER_TYPES.map((type, idx) => (
                <option key={idx} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setShowBookletModal(true)}
            style={{
              alignSelf: 'flex-end',
              padding: '0.55rem 0.95rem',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              background: '#fff',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: 'var(--ink)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <BookOpen size={14} style={{ color: 'var(--accent)' }} /> Official Formula Booklets
          </button>

          <button
            type="button"
            onClick={() => setShowCommandTermsModal(true)}
            style={{
              alignSelf: 'flex-end',
              padding: '0.55rem 0.95rem',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              background: '#fff',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: 'var(--ink)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <HelpCircle size={14} style={{ color: 'var(--rust)' }} /> Command Terms & Rules
          </button>

          {isSearching && (
            <button
              onClick={clearFilters}
              className="filter-btn active"
              style={{ alignSelf: 'flex-end', padding: '0.5rem 1rem' }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Directory Split Screen */}
      <div className="split-screen">
        <div className="panel browser-panel" style={{ overflowY: 'auto' }}>
          {isSearching ? (
            <div>
              <span className="tech-label" style={{ display: 'block', marginBottom: '0.75rem' }}>
                [SEARCH_RESULTS: {filteredSearch.length}]
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {filteredSearch.length === 0 ? (
                  <div style={{ color: 'var(--ink-faint)', textAlign: 'center', padding: '2rem 0', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                    No papers matching search parameters.
                  </div>
                ) : (
                  filteredSearch.slice(0, 100).map((file, idx) => {
                    const isActive = selectedFile === `/api/past-papers/${file.path.map(encodeURIComponent).join('/')}`;
                    return (
                      <div
                        key={idx}
                        onClick={() => selectFile(file.path)}
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
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '0.5rem' }}>
                          <span style={{ fontSize: '0.9rem', display: 'block', fontWeight: 600, color: isActive ? 'var(--earth)' : 'var(--ink)' }}>
                            {file.name.replace(/_/g, ' ')}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--ink-faint)', letterSpacing: '0.02em' }}>
                            {file.path.slice(0, -1).join(' › ').replace(/_/g, ' ')}
                          </span>
                        </div>
                        <ChevronRight size={14} style={{ color: isActive ? 'var(--earth)' : 'var(--ink-faint)', flexShrink: 0 }} />
                      </div>
                    );
                  })
                )}
                {filteredSearch.length > 100 && (
                  <div className="tech-label" style={{ textAlign: 'center', marginTop: '0.75rem' }}>
                    + {filteredSearch.length - 100} MORE RESULTS. REFINE FILTERS.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--hairline)', paddingBottom: '0.75rem' }}>
                <span className="tech-label">[DIRECTORY: {currentPath.length > 0 ? currentPath.join(' / ') : 'ROOT'}]</span>
                {currentPath.length > 0 && (
                  <button onClick={handleBackClick} className="filter-btn" style={{ padding: '0.2rem 0.6rem' }}>
                    ← Back
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {folders.map((folder, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleFolderClick(folder)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem 0.9rem',
                      background: 'var(--paper-card)',
                      border: '1px solid var(--hairline)',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--ink)' }}>{folder}</span>
                    <ChevronRight size={14} style={{ color: 'var(--ink-faint)' }} />
                  </div>
                ))}

                {files.map((file, idx) => {
                  const isActive = selectedFile === `/api/past-papers/${[...currentPath, file].map(encodeURIComponent).join('/')}`;
                  return (
                    <div
                      key={idx}
                      onClick={() => selectFile([...currentPath, file])}
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
                        {file.replace(/_/g, ' ')}
                      </span>
                      <FileText size={14} style={{ color: isActive ? 'var(--earth)' : 'var(--ink-faint)', flexShrink: 0 }} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
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
                Select an examination paper or markscheme from the directory sidebar to load it in the viewport.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* IB FORMULA & DATA BOOKLET VIEWER */}
      <IBBookletViewerModal
        isOpen={showBookletModal}
        onClose={() => setShowBookletModal(false)}
      />

      {/* IB COMMAND TERMS & MARKSCHEME MATRIX */}
      <IBCommandTermsModal
        isOpen={showCommandTermsModal}
        onClose={() => setShowCommandTermsModal(false)}
      />
    </div>
  );
}
