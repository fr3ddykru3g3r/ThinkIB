'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  Download,
  BookOpen,
  FileText,
  Columns,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Layers,
  Sparkles
} from 'lucide-react';
import IBBookletViewerModal from './IBBookletViewerModal';

export interface PDFDocument {
  id: string;
  title: string;
  subtitle: string;
  url: string;
  msUrl?: string;
  page?: number;
  size: string;
  category: 'student_work' | 'textbook' | 'topical';
  badge?: string;
}

export interface CustomPDFDoc {
  id?: string;
  title: string;
  subtitle: string;
  url: string;
  msUrl?: string;
  size?: string;
  badge?: string;
  category?: 'student_work' | 'textbook' | 'topical';
}

export const EE_VAULT_DOCUMENTS: PDFDocument[] = [
  {
    id: 'sevenoaks',
    title: 'Prized Writing: Sevenoaks School IB Extended Essays',
    subtitle: '10 Authentic Full-Text Grade A (4,000-word) Student EEs with Supervisor Comments',
    url: '/vault/ee-guides/sevenoaks-prized-ees-2015.pdf',
    size: '7.9 MB (284 Pages)',
    category: 'student_work'
  },
  {
    id: 'hodder-2025',
    title: 'Extended Essay for the IB Diploma: Skills for Success',
    subtitle: 'Paul Hoang & Joseph Koszary • Hodder Education (2025 Edition)',
    url: '/vault/ee-guides/ee-hodder-2025-hoang.pdf',
    size: '76.7 MB (Official Textbook)',
    category: 'textbook'
  },
  {
    id: 'oxford-2025',
    title: 'Extended Essay Course Companion',
    subtitle: 'Kosta Lekanides • Oxford University Press (2025 Edition)',
    url: '/vault/ee-guides/ee-oxford-2025-lekanides.pdf',
    size: '79.1 MB (Official Course Companion)',
    category: 'textbook'
  }
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activeDocId?: string;
  page?: number;
  customDoc?: CustomPDFDoc;
  initialSplitView?: boolean;
}

export default function IBPDFViewerModal({
  isOpen,
  onClose,
  activeDocId = 'sevenoaks',
  page,
  customDoc,
  initialSplitView = false
}: Props) {
  const [selectedDocId, setSelectedDocId] = useState<string>(activeDocId);
  const [currentPage, setCurrentPage] = useState<number | undefined>(page);
  const [isSplitView, setIsSplitView] = useState<boolean>(initialSplitView);
  const [activeTab, setActiveTab] = useState<'qp' | 'ms'>('qp');
  const [showFormulaBooklet, setShowFormulaBooklet] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showScorecard, setShowScorecard] = useState<boolean>(false);
  const [currentScore, setCurrentScore] = useState<{ m: number; a: number; r: number }>({ m: 0, a: 0, r: 0 });
  const [selectedMistakes, setSelectedMistakes] = useState<string[]>([]);
  const [questionScores, setQuestionScores] = useState<{ id: number; total: number; m: number; a: number; r: number; mistakes: string[] }[]>([]);
  const [questionNumber, setQuestionNumber] = useState<number>(1);

  // Sync if props change
  useEffect(() => {
    setSelectedDocId(activeDocId);
    setCurrentPage(page);
    if (customDoc?.msUrl && initialSplitView) {
      setIsSplitView(true);
    } else {
      setIsSplitView(initialSplitView);
    }
    setActiveTab('qp');
  }, [activeDocId, page, customDoc, initialSplitView]);

  if (!isOpen) return null;

  // Document determination
  const currentDoc: PDFDocument = customDoc
    ? {
        id: customDoc.id || 'custom',
        title: customDoc.title,
        subtitle: customDoc.subtitle,
        url: customDoc.url,
        msUrl: customDoc.msUrl,
        size: customDoc.size || 'Vector PDF',
        category: customDoc.category || 'topical',
        badge: customDoc.badge
      }
    : EE_VAULT_DOCUMENTS.find(d => d.id === selectedDocId) || EE_VAULT_DOCUMENTS[0];

  const qpSource = currentPage ? `${currentDoc.url}#page=${currentPage}` : currentDoc.url;
  const msSource = currentDoc.msUrl || '';

  const hasMarkscheme = Boolean(currentDoc.msUrl);

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99990,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isFullscreen ? '0' : '1.25rem'
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: isFullscreen ? '100vw' : isSplitView ? '1500px' : '1200px',
            height: isFullscreen ? '100vh' : '92vh',
            background: 'var(--panel)',
            border: isFullscreen ? 'none' : '1px solid var(--border)',
            borderRadius: isFullscreen ? '0' : '10px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
            transition: 'max-width 0.2s ease'
          }}
        >
          {/* Top Header Bar */}
          <div
            style={{
              padding: '0.75rem 1.25rem',
              borderBottom: '1px solid var(--border)',
              background: 'var(--panel-light)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}
          >
            {/* Left side title & badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '7px',
                  background: 'rgba(9, 105, 218, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0969da'
                }}
              >
                {currentDoc.category === 'topical' ? <Layers size={18} /> : <BookOpen size={18} />}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: 'var(--ink)' }}>
                    {currentDoc.title}
                  </h3>
                  {currentDoc.badge && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        background: 'rgba(9, 105, 218, 0.12)',
                        color: '#0969da',
                        border: '1px solid rgba(9, 105, 218, 0.3)',
                        padding: '1px 8px',
                        borderRadius: '12px'
                      }}
                    >
                      {currentDoc.badge}
                    </span>
                  )}
                  {currentPage && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        background: 'var(--rust)',
                        color: '#fff',
                        padding: '1px 6px',
                        borderRadius: '6px'
                      }}
                    >
                      Page {currentPage}
                    </span>
                  )}
                </div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--muted)' }}>
                  {currentDoc.subtitle} • {currentDoc.size}
                </p>
              </div>
            </div>

            {/* Right side action controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
              {/* Quick toggle EE docs if no customDoc */}
              {!customDoc && (
                <div style={{ display: 'flex', gap: '0.3rem', marginRight: '0.5rem' }}>
                  {EE_VAULT_DOCUMENTS.map(doc => (
                    <button
                      key={doc.id}
                      onClick={() => {
                        setSelectedDocId(doc.id);
                        setCurrentPage(undefined);
                      }}
                      className={`filter-btn ${selectedDocId === doc.id ? 'active' : ''}`}
                      style={{
                        padding: '0.3rem 0.6rem',
                        fontSize: '0.72rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      <FileText size={12} />
                      {doc.id === 'sevenoaks' ? 'Sevenoaks EEs' : doc.id === 'hodder-2025' ? 'Hodder 2025' : 'Oxford 2025'}
                    </button>
                  ))}
                </div>
              )}

              {/* Mode switch for single view vs split view */}
              {hasMarkscheme && (
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', padding: '2px' }}>
                  <button
                    onClick={() => {
                      setIsSplitView(false);
                      setActiveTab('qp');
                    }}
                    style={{
                      border: 'none',
                      background: !isSplitView && activeTab === 'qp' ? '#0969da' : 'transparent',
                      color: !isSplitView && activeTab === 'qp' ? '#ffffff' : 'var(--ink)',
                      padding: '0.3rem 0.65rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    Question Paper
                  </button>
                  <button
                    onClick={() => {
                      setIsSplitView(false);
                      setActiveTab('ms');
                    }}
                    style={{
                      border: 'none',
                      background: !isSplitView && activeTab === 'ms' ? '#0969da' : 'transparent',
                      color: !isSplitView && activeTab === 'ms' ? '#ffffff' : 'var(--ink)',
                      padding: '0.3rem 0.65rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    Markscheme
                  </button>
                  <button
                    onClick={() => setIsSplitView(true)}
                    style={{
                      border: 'none',
                      background: isSplitView ? '#0969da' : 'transparent',
                      color: isSplitView ? '#ffffff' : 'var(--ink)',
                      padding: '0.3rem 0.65rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Columns size={13} /> Split-View
                  </button>
                </div>
              )}

              {/* IB Physics Data Booklet Quick-Toggle */}
              <button
                type="button"
                onClick={() => setShowFormulaBooklet(true)}
                style={{
                  border: '1px solid rgba(31, 136, 61, 0.4)',
                  background: 'rgba(31, 136, 61, 0.08)',
                  color: '#1f883d',
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
                title="Open Official IB Physics Formula & Data Booklet in quick-reference modal"
              >
                <BookOpen size={13} /> Data Booklet
              </button>

              {/* Interactive IB Grader Scorecard Toggle */}
              <button
                type="button"
                onClick={() => setShowScorecard((v) => !v)}
                style={{
                  border: '1px solid rgba(147, 51, 234, 0.4)',
                  background: showScorecard ? '#9333ea' : 'rgba(147, 51, 234, 0.08)',
                  color: showScorecard ? '#ffffff' : '#9333ea',
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
                title="Open interactive IB Self-Grader Scorecard (+M1/+A1/+R1 marks)"
              >
                <Sparkles size={13} /> Scorecard
              </button>

              {/* Fullscreen Toggle */}
              <button
                onClick={() => setIsFullscreen(prev => !prev)}
                className="filter-btn"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                style={{ padding: '0.35rem 0.55rem' }}
              >
                {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              </button>

              {/* Download link */}
              <a
                href={isSplitView ? currentDoc.url : activeTab === 'ms' ? msSource : currentDoc.url}
                download
                className="filter-btn active"
                title="Download active document"
                style={{
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.75rem',
                  padding: '0.35rem 0.65rem'
                }}
              >
                <Download size={13} /> Download
              </a>

              {/* Close Button */}
              <button
                onClick={onClose}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* PDF Viewer Body */}
          <div style={{ flex: 1, position: 'relative', background: '#222326', display: 'flex', overflow: 'hidden' }}>
            {/* Split Screen Mode */}
            {isSplitView && hasMarkscheme ? (
              <>
                {/* Left Pane: Question Paper */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', borderRight: '2px solid #3c3d42' }}>
                  <div
                    style={{
                      padding: '0.35rem 0.75rem',
                      background: '#1a1b1e',
                      borderBottom: '1px solid #333',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.74rem',
                      color: '#c9d1d9'
                    }}
                  >
                    <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#58a6ff' }} />
                      QUESTION PAPER
                    </span>
                    <a
                      href={qpSource}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#58a6ff', textDecoration: 'none', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '3px' }}
                    >
                      <ExternalLink size={11} /> Open New Tab
                    </a>
                  </div>
                  <iframe
                    src={qpSource}
                    title="Question Paper"
                    style={{
                      width: '100%',
                      flex: 1,
                      border: 'none',
                      display: 'block'
                    }}
                  />
                </div>

                {/* Right Pane: Markscheme */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div
                    style={{
                      padding: '0.35rem 0.75rem',
                      background: '#1a1b1e',
                      borderBottom: '1px solid #333',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.74rem',
                      color: '#c9d1d9'
                    }}
                  >
                    <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f0883e' }} />
                      OFFICIAL MARKSCHEME SOLUTIONS
                    </span>
                    <a
                      href={msSource}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#f0883e', textDecoration: 'none', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '3px' }}
                    >
                      <ExternalLink size={11} /> Open New Tab
                    </a>
                  </div>
                  <iframe
                    src={msSource}
                    title="Markscheme Solutions"
                    style={{
                      width: '100%',
                      flex: 1,
                      border: 'none',
                      display: 'block'
                    }}
                  />
                </div>
              </>
            ) : (
              /* Single Document Full-Width Mode */
              <div style={{ width: '100%', height: '100%' }}>
                <iframe
                  src={activeTab === 'ms' && msSource ? msSource : qpSource}
                  title={currentDoc.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    display: 'block'
                  }}
                />
              </div>
            )}

            {/* Floating IB Self-Grader Scorecard */}
            {showScorecard && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  right: '16px',
                  zIndex: 100,
                  background: 'var(--panel)',
                  border: '1.5px solid var(--border)',
                  borderRadius: '12px',
                  boxShadow: '0 12px 36px rgba(0,0,0,0.45)',
                  width: '360px',
                  maxWidth: 'calc(100% - 32px)',
                  padding: '14px',
                  backdropFilter: 'blur(10px)',
                  color: 'var(--ink)',
                }}
              >
                {/* Scorecard Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={14} style={{ color: '#9333ea' }} />
                    <strong style={{ fontSize: '0.88rem' }}>IB Self-Grader Scorecard</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', background: 'rgba(147, 51, 234, 0.1)', color: '#9333ea', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                      Q{questionNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowScorecard(false)}
                      style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 2 }}
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>

                {/* Marks Awarding Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setCurrentScore((s) => ({ ...s, m: s.m + 1 }))}
                    onContextMenu={(e) => { e.preventDefault(); setCurrentScore((s) => ({ ...s, m: Math.max(0, s.m - 1) })); }}
                    title="Click: +M1 Method mark (Right-click to decrement)"
                    style={{
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      color: '#2563eb',
                      borderRadius: '8px',
                      padding: '8px 4px',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <div>+M1 Method</div>
                    <div style={{ fontSize: '1.1rem', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{currentScore.m}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentScore((s) => ({ ...s, a: s.a + 1 }))}
                    onContextMenu={(e) => { e.preventDefault(); setCurrentScore((s) => ({ ...s, a: Math.max(0, s.a - 1) })); }}
                    title="Click: +A1 Answer mark (Right-click to decrement)"
                    style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: '#059669',
                      borderRadius: '8px',
                      padding: '8px 4px',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <div>+A1 Answer</div>
                    <div style={{ fontSize: '1.1rem', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{currentScore.a}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentScore((s) => ({ ...s, r: s.r + 1 }))}
                    onContextMenu={(e) => { e.preventDefault(); setCurrentScore((s) => ({ ...s, r: Math.max(0, s.r - 1) })); }}
                    title="Click: +R1 Reasoning mark (Right-click to decrement)"
                    style={{
                      background: 'rgba(245, 158, 11, 0.1)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      color: '#d97706',
                      borderRadius: '8px',
                      padding: '8px 4px',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <div>+R1 Reason</div>
                    <div style={{ fontSize: '1.1rem', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{currentScore.r}</div>
                  </button>
                </div>

                {/* Mistake classification categories */}
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '5px', textTransform: 'uppercase' }}>
                    Mistake Classification
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {(['Algebraic Slip', 'Sig Figs / Rounding', 'Command Term Mismatch', 'Concept Gap'] as const).map((tag) => {
                      const isSelected = selectedMistakes.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            setSelectedMistakes((prev) =>
                              prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                            );
                          }}
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            border: isSelected ? '1px solid #ef4444' : '1px solid var(--border)',
                            background: isSelected ? 'rgba(239, 68, 68, 0.12)' : 'var(--surface)',
                            color: isSelected ? '#dc2626' : 'var(--ink)',
                            cursor: 'pointer',
                          }}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Question summary & Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.78rem' }}>
                    <span style={{ color: 'var(--muted)' }}>Q{questionNumber}: </span>
                    <strong style={{ fontSize: '0.92rem' }}>{currentScore.m + currentScore.a + currentScore.r} marks</strong>
                    {questionScores.length > 0 && (
                      <span style={{ color: 'var(--muted)', marginLeft: 6 }}>
                        (Total: {questionScores.reduce((acc, q) => acc + q.total, 0) + currentScore.m + currentScore.a + currentScore.r})
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentScore({ m: 0, a: 0, r: 0 });
                        setSelectedMistakes([]);
                      }}
                      style={{
                        padding: '4px 8px',
                        fontSize: '0.72rem',
                        background: 'transparent',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        color: 'var(--muted)',
                        cursor: 'pointer',
                      }}
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const total = currentScore.m + currentScore.a + currentScore.r;
                        setQuestionScores((prev) => [
                          ...prev,
                          { id: questionNumber, total, ...currentScore, mistakes: [...selectedMistakes] },
                        ]);
                        setQuestionNumber((n) => n + 1);
                        setCurrentScore({ m: 0, a: 0, r: 0 });
                        setSelectedMistakes([]);
                      }}
                      style={{
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: '#9333ea',
                        border: 'none',
                        borderRadius: '4px',
                        color: '#ffffff',
                        cursor: 'pointer',
                      }}
                    >
                      Next Q &rarr;
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Footer Hint */}
          <div
            style={{
              padding: '0.45rem 1.25rem',
              background: 'var(--panel-light)',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.72rem',
              color: 'var(--muted)'
            }}
          >
            <span>
              💡 <strong>Tip:</strong> Use <strong>Split-View</strong> to cross-reference questions and markscheme criteria simultaneously.
            </span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>
              ThinkIB Physics Topical Examination Archive (2025 Syllabus)
            </span>
          </div>
        </div>
      </div>

      {/* IB Physics Data Booklet Quick-Toggle Modal */}
      <IBBookletViewerModal
        isOpen={showFormulaBooklet}
        onClose={() => setShowFormulaBooklet(false)}
        defaultSubject="physics"
      />
    </>
  );
}
