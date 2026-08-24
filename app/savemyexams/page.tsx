'use client';

import React, { useState, useMemo } from 'react';
import { BookOpen, Folder, FileText, Search, Download, ExternalLink, ChevronRight, Eye, ArrowLeft } from 'lucide-react';
import rawMap from './map.json';

interface NoteItem {
  name: string;
  path: string;
  size: number;
}

interface MapNode {
  files?: NoteItem[];
  [key: string]: any;
}

const SUBJECT_ITEMS = [
  { id: 'all', label: 'All Subjects', count: 294 },
  { id: 'Biology HL 2025', label: 'Biology HL (2025)', badge: 'Biology' },
  { id: 'Chemistry HL 2025', label: 'Chemistry HL (2025)', badge: 'Chemistry' },
  { id: 'Chemistry SL 2025', label: 'Chemistry SL (2025)', badge: 'Chemistry' },
  { id: 'Physics HL 2025', label: 'Physics HL (2025)', badge: 'Physics' },
  { id: 'Maths AA HL', label: 'Maths AA HL', badge: 'Math' },
  { id: 'Maths AA SL', label: 'Maths AA SL', badge: 'Math' },
  { id: 'Economics HL 2022', label: 'Economics HL', badge: 'Economics' },
  { id: 'Psychology HL', label: 'Psychology HL', badge: 'Psychology' }
];

export default function SaveMyExamsPage() {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [selectedNote, setSelectedNote] = useState<NoteItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const notesTree = rawMap as Record<string, MapNode>;

  // Flatten all notes for smart search
  const allNotes = useMemo(() => {
    const list: (NoteItem & { subject: string; breadcrumbs: string[] })[] = [];

    function recurse(node: MapNode, subjectName: string, pathAcc: string[]) {
      if (node.files) {
        node.files.forEach(f => {
          list.push({ ...f, subject: subjectName, breadcrumbs: pathAcc });
        });
      }
      Object.keys(node).forEach(key => {
        if (key !== 'files') {
          recurse(node[key], subjectName, [...pathAcc, key]);
        }
      });
    }

    Object.keys(notesTree).forEach(subKey => {
      recurse(notesTree[subKey], subKey, []);
    });

    return list;
  }, [notesTree]);

  // Smart Search & Filter matching
  const filteredNotes = useMemo(() => {
    const hasQuery = searchQuery.trim().length > 0;
    const hasSubject = selectedSubject !== 'all';

    if (!hasQuery && !hasSubject) return [];

    const queryTokens = searchQuery.toLowerCase().replace(/[_–\-]/g, ' ').split(/\s+/).filter(Boolean);

    return allNotes.filter(item => {
      if (hasSubject && item.subject !== selectedSubject) return false;

      if (hasQuery) {
        const cleanName = item.name.toLowerCase().replace(/[_–\-]/g, ' ');
        const cleanPath = item.breadcrumbs.join(' ').toLowerCase().replace(/[_–\-]/g, ' ');
        const matchesAll = queryTokens.every(tok => {
          if (/^\d+$/.test(tok)) {
            const regex = new RegExp(`\\b${tok}\\b`);
            return regex.test(cleanName) || regex.test(cleanPath);
          }
          return cleanName.includes(tok) || cleanPath.includes(tok);
        });
        if (!matchesAll) return false;
      }
      return true;
    });
  }, [searchQuery, selectedSubject, allNotes]);

  const isSearching = searchQuery.trim().length > 0;

  // Folder Navigation Node
  const currentNode = useMemo(() => {
    if (selectedSubject === 'all') return null;
    let node = notesTree[selectedSubject] || {};
    for (const seg of currentPath) {
      if (node[seg]) {
        node = node[seg];
      } else {
        return { files: [] };
      }
    }
    return node;
  }, [notesTree, selectedSubject, currentPath]);

  const subFolders = useMemo(() => {
    if (!currentNode) return [];
    return Object.keys(currentNode).filter(k => k !== 'files').sort();
  }, [currentNode]);

  const currentFiles = useMemo(() => {
    if (!currentNode) return [];
    return currentNode.files || [];
  }, [currentNode]);

  const getCdnUrl = (path: string) => {
    const encodedPath = path.split('/').map(encodeURIComponent).join('/');
    return `/api/savemyexams/${encodedPath}`;
  };

  return (
    <div>
      {/* Header */}
      <div className="panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <span className="tech-label">[VAULT_MOUNT: SAVEMYEXAMS_NOTES]</span>
          <h1 style={{ fontFamily: 'var(--display)', fontSize: '2.4rem', margin: '0.2rem 0' }}>SaveMyExams Revision Archive</h1>
          <p style={{ color: 'var(--ink-soft)', fontSize: '0.95rem', margin: 0 }}>Full high-resolution revision notes, diagrams, and topic summaries (2022–2025).</p>
        </div>
        <a href="/" className="filter-btn active" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <ArrowLeft size={14} /> Back to Dashboard
        </a>
      </div>

      {/* Subject Filter Pills */}
      <div className="panel" style={{ marginBottom: '1.5rem' }}>
        <span className="tech-label" style={{ display: 'block', marginBottom: '0.75rem' }}>Select Subject Vault</span>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {SUBJECT_ITEMS.map((sub) => {
            const isActive = selectedSubject === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => {
                  setSelectedSubject(sub.id);
                  setCurrentPath([]);
                }}
                className={`filter-btn ${isActive ? 'active' : ''}`}
                style={{ padding: '0.45rem 0.9rem', fontSize: '0.75rem' }}
              >
                {sub.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Input */}
      <div className="search-wrapper" style={{ marginBottom: '1.75rem' }}>
        <Search size={18} style={{ position: 'absolute', left: '1rem', color: 'var(--ink-faint)', pointerEvents: 'none' }} />
        <input
          type="text"
          placeholder="Search 270+ SaveMyExams revision notes (e.g. Organic Chemistry, Calculus, Microeconomics)..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Split Screen Directory & Viewer */}
      <div className="split-screen">
        <div className="panel browser-panel" style={{ overflowY: 'auto' }}>
          {isSearching || selectedSubject === 'all' ? (
            <div>
              <span className="tech-label" style={{ display: 'block', marginBottom: '0.75rem' }}>
                [{isSearching ? `SEARCH_RESULTS: ${filteredNotes.length}` : `ALL_NOTES_CATALOG: ${allNotes.length}`}]
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {(isSearching ? filteredNotes : allNotes.slice(0, 100)).map((item, idx) => {
                  const isActive = selectedNote?.path === item.path;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedNote(item)}
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
                        <span style={{ fontSize: '0.92rem', display: 'block', fontWeight: 600, color: isActive ? 'var(--earth)' : 'var(--ink)' }}>
                          {item.name.replace(/[_–\-]/g, ' ').replace('.pdf', '')}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--ink-faint)', letterSpacing: '0.02em' }}>
                          {item.subject} › {item.breadcrumbs.join(' › ')}
                        </span>
                      </div>
                      <ChevronRight size={14} style={{ color: isActive ? 'var(--earth)' : 'var(--ink-faint)', flexShrink: 0 }} />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--hairline)', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {currentPath.length > 0 && (
                    <button onClick={() => setCurrentPath(prev => prev.slice(0, -1))} className="filter-btn" style={{ padding: '0.25rem 0.6rem' }}>
                      ← Back
                    </button>
                  )}
                  <span className="tech-label" style={{ margin: 0 }}>
                    {selectedSubject} {currentPath.length > 0 ? `› ${currentPath.join(' › ')}` : ''}
                  </span>
                </div>
              </div>

              {/* Finder Folder Grid View */}
              {subFolders.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <span className="tech-label" style={{ display: 'block', marginBottom: '0.5rem' }}>UNIT FOLDERS ({subFolders.length})</span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.6rem' }}>
                    {subFolders.map((folder, idx) => (
                      <div
                        key={idx}
                        className="folder-grid-item"
                        onClick={() => setCurrentPath(prev => [...prev, folder])}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '1rem 0.5rem',
                          background: 'var(--paper-card)',
                          border: '1px solid var(--hairline)',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <Folder size={32} style={{ color: '#9a6a3e', strokeWidth: 1.5, marginBottom: '0.5rem' }} />
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--ink)', lineHeight: '1.2', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {folder}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Note PDF Files List */}
              {currentFiles.length > 0 && (
                <div>
                  <span className="tech-label" style={{ display: 'block', marginBottom: '0.5rem' }}>TOPIC GUIDES ({currentFiles.length})</span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.6rem' }}>
                    {currentFiles.map((file: NoteItem, idx: number) => {
                      const isActive = selectedNote?.path === file.path;
                      return (
                        <div
                          key={idx}
                          className="folder-grid-item"
                          onClick={() => setSelectedNote(file)}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '1rem 0.5rem',
                            background: isActive ? 'var(--earth-soft)' : 'var(--paper-card)',
                            border: isActive ? '1px solid rgba(154, 106, 62, 0.45)' : '1px solid var(--hairline)',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <FileText size={30} style={{ color: isActive ? 'var(--earth)' : 'var(--ink-soft)', strokeWidth: 1.5, marginBottom: '0.5rem' }} />
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isActive ? 'var(--earth)' : 'var(--ink)', lineHeight: '1.25', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {file.name.replace(/[_–\-]/g, ' ').replace('.pdf', '')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* PDF Viewer Panel */}
        <div className="viewer-panel">
          {selectedNote ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', background: 'var(--paper-panel)', borderBottom: '1px solid var(--hairline)' }}>
                <span className="tech-label" style={{ maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--ink)' }}>
                  {selectedNote.name.replace('.pdf', '')}
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <a href={getCdnUrl(selectedNote.path)} download className="filter-btn active" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none', padding: '4px 10px' }}>
                    <Download size={12} /> DOWNLOAD PDF
                  </a>
                  <a href={getCdnUrl(selectedNote.path)} target="_blank" rel="noopener noreferrer" className="filter-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none', padding: '4px 10px' }}>
                    <ExternalLink size={12} /> NEW TAB
                  </a>
                </div>
              </div>
              <iframe src={getCdnUrl(selectedNote.path)} className="viewer-iframe" title="SaveMyExams Notes Viewer" />
            </div>
          ) : (
            <div className="viewer-placeholder">
              <Eye size={44} style={{ color: 'var(--earth)', marginBottom: '1rem', opacity: 0.5 }} />
              <h3 style={{ fontFamily: 'var(--display)' }}>No Notes Mounted</h3>
              <p style={{ maxWidth: '280px', marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--ink-soft)' }}>
                Select a SaveMyExams revision guide from the left sidebar to open and study the document inline.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
