'use client';
import PDFReader from '@/app/components/PDFReader';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Timer, BookOpen, CheckSquare, RotateCcw, Play, Pause, FileText } from 'lucide-react';
import rawPhysicsMap from '../physics_topicals_map.json';
import rawChemistryMap from '../chemistry_topicals_map.json';
import rawMathMap from '../math_topicals_map.json';

type RightTab = 'booklet' | 'markscheme' | 'notes';
type BookletKey = 'math-aa' | 'math-ai' | 'physics' | 'chemistry';

function resolveViewerUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  const m = rawUrl.match(/^\/vault\/((?:physics|chemistry|math)-topicals)\/(.+)$/);
  if (m) {
    return `/api/past-papers/topicals/${m[1]}/${m[2]}`;
  }
  return rawUrl;
}

export interface PaperOption {
  id: string;
  label: string;
  qp: string;
  ms: string;
  subject: BookletKey;
  maxMarks: number;
  duration: number; // minutes
}

const CHRONOLOGICAL_PAPERS: PaperOption[] = [
  { id: 'math-aa-hl-2024', label: 'Math AA HL P1 (May 2024)', qp: '/api/past-papers/2024%20Examination%20Session/May%202024%20Examination%20Session/PDFs/Mathematics/Mathematics_analysis_and_approaches_paper_1__TZ1_HL.pdf', ms: '/api/past-papers/2024%20Examination%20Session/May%202024%20Examination%20Session/PDFs/Mathematics/Mathematics_analysis_and_approaches_paper_1__TZ1_HL_markscheme.pdf', subject: 'math-aa', maxMarks: 110, duration: 120 },
  { id: 'math-aa-sl-2024', label: 'Math AA SL P1 (May 2024)', qp: '/api/past-papers/2024%20Examination%20Session/May%202024%20Examination%20Session/PDFs/Mathematics/Mathematics_analysis_and_approaches_paper_1__TZ1_SL.pdf', ms: '/api/past-papers/2024%20Examination%20Session/May%202024%20Examination%20Session/PDFs/Mathematics/Mathematics_analysis_and_approaches_paper_1__TZ1_SL_markscheme.pdf', subject: 'math-aa', maxMarks: 80, duration: 90 },
  { id: 'physics-hl-2024', label: 'Physics HL P1 (May 2024)', qp: '/api/past-papers/2024%20Examination%20Session/May%202024%20Examination%20Session/PDFs/Experimental%20sciences/Physics_paper_1__TZ1_HL.pdf', ms: '/api/past-papers/2024%20Examination%20Session/May%202024%20Examination%20Session/PDFs/Experimental%20sciences/Physics_paper_1__TZ1_HL_markscheme.pdf', subject: 'physics', maxMarks: 40, duration: 60 },
  { id: 'chem-hl-2024', label: 'Chemistry HL P2 (May 2024)', qp: '/api/past-papers/2024%20Examination%20Session/May%202024%20Examination%20Session/PDFs/Experimental%20sciences/Chemistry_paper_2__TZ1_HL.pdf', ms: '/api/past-papers/2024%20Examination%20Session/May%202024%20Examination%20Session/PDFs/Experimental%20sciences/Chemistry_paper_2__TZ1_HL_markscheme.pdf', subject: 'chemistry', maxMarks: 90, duration: 135 },
];

const PHYSICS_TOPICAL_PAPERS: PaperOption[] = [
  ...Object.values((rawPhysicsMap as any).themes || {}).map((th: any) => ({
    id: `physics-theme-${th.theme}`,
    label: `⚛️ Theme ${th.theme}: ${th.title} (Master)`,
    qp: resolveViewerUrl(th.qp_path),
    ms: resolveViewerUrl(th.ms_path),
    subject: 'physics' as BookletKey,
    maxMarks: 80,
    duration: 90
  })),
  ...Object.values((rawPhysicsMap as any).subtopics || {}).map((st: any) => ({
    id: `physics-${st.code}`,
    label: `⚛️ ${st.code}: ${st.title} (${st.total_questions} Qs)`,
    qp: resolveViewerUrl(st.qp_path),
    ms: resolveViewerUrl(st.ms_path),
    subject: 'physics' as BookletKey,
    maxMarks: Math.min(60, (st.total_questions || 20) * 2),
    duration: 60
  }))
];

const CHEMISTRY_TOPICAL_PAPERS: PaperOption[] = [
  ...Object.values((rawChemistryMap as any).themes || {}).map((th: any) => ({
    id: `chem-theme-${th.theme}`,
    label: `🧪 Theme ${th.theme}: ${th.title} (Master)`,
    qp: resolveViewerUrl(th.qp_path),
    ms: resolveViewerUrl(th.ms_path),
    subject: 'chemistry' as BookletKey,
    maxMarks: 80,
    duration: 90
  })),
  ...Object.values((rawChemistryMap as any).subtopics || {}).map((st: any) => ({
    id: `chem-${st.code}`,
    label: `🧪 ${st.code}: ${st.title} (${st.total_questions} Qs)`,
    qp: resolveViewerUrl(st.qp_path),
    ms: resolveViewerUrl(st.ms_path),
    subject: 'chemistry' as BookletKey,
    maxMarks: Math.min(60, (st.total_questions || 20) * 2),
    duration: 60
  }))
];

const MATH_TOPICAL_PAPERS: PaperOption[] = [
  ...Object.values((rawMathMap as any).themes || {}).map((th: any) => ({
    id: `math-topic-${th.theme}`,
    label: `📐 Topic ${th.theme}: ${th.title} (Master)`,
    qp: resolveViewerUrl(th.qp_path),
    ms: resolveViewerUrl(th.ms_path),
    subject: 'math-aa' as BookletKey,
    maxMarks: 100,
    duration: 120
  })),
  ...Object.values((rawMathMap as any).subtopics || {}).map((st: any) => ({
    id: `math-${st.code}`,
    label: `📐 ${st.code}: ${st.title} (${st.total_questions} Qs)`,
    qp: resolveViewerUrl(st.qp_path),
    ms: resolveViewerUrl(st.ms_path),
    subject: 'math-aa' as BookletKey,
    maxMarks: Math.min(80, (st.total_questions || 20) * 4),
    duration: 90
  }))
];

const ALL_PAPERS_MAP = new Map<string, PaperOption>();
[...CHRONOLOGICAL_PAPERS, ...PHYSICS_TOPICAL_PAPERS, ...CHEMISTRY_TOPICAL_PAPERS, ...MATH_TOPICAL_PAPERS].forEach(p => {
  ALL_PAPERS_MAP.set(p.id, p);
});

function PastPapersWorkspaceInner() {
  const searchParams = useSearchParams();

  const [selectedPaperId, setSelectedPaperId] = useState<string>('math-aa-hl-2024');
  const [customPaper, setCustomPaper] = useState<PaperOption | null>(null);

  const paper = customPaper || ALL_PAPERS_MAP.get(selectedPaperId) || CHRONOLOGICAL_PAPERS[0];

  const [customQpUrl, setCustomQpUrl] = useState<string>('');
  const [customMsUrl, setCustomMsUrl] = useState<string>('');

  const activeQpUrl = paper.qp || customQpUrl || '/vault/ib-booklets/Math_AA_Formula_Booklet.pdf';
  const activeMsUrl = paper.ms || customMsUrl || '';

  // Right pane tab
  const [activeTab, setActiveTab] = useState<RightTab>('booklet');
  const [bookletSubject, setBookletSubject] = useState<BookletKey>('math-aa');

  // Split ratio: left percent
  const [splitRatio, setSplitRatio] = useState<number>(50);

  // Official Timers: 5-min reading countdown vs main exam
  const [isReadingMode, setIsReadingMode] = useState<boolean>(false);
  const [readingTimeLeft, setReadingTimeLeft] = useState<number>(300);
  const [examTimeLeft, setExamTimeLeft] = useState<number>(paper.duration * 60);
  const [isExamRunning, setIsExamRunning] = useState<boolean>(false);

  // Markscheme Tally Counter
  const [mMarks, setMMarks] = useState<number>(0);
  const [aMarks, setAMarks] = useState<number>(0);
  const [rMarks, setRMarks] = useState<number>(0);
  const [maxMarks, setMaxMarks] = useState<number>(paper.maxMarks);

  // Scratchpad Notes
  const [studentNotes, setStudentNotes] = useState<string>('');
  useEffect(() => {
    try { setStudentNotes(localStorage.getItem('thinkib:workspace-notes') || ''); } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem('thinkib:workspace-notes', studentNotes); } catch {}
  }, [studentNotes]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Deep-link query parameters sync: ?paper=...&ms=...&subject=...&title=...
  useEffect(() => {
    const paperParam = searchParams?.get('paper');
    const msParam = searchParams?.get('ms');
    const subjectParam = searchParams?.get('subject');
    const titleParam = searchParams?.get('title');

    if (paperParam) {
      const qpResolved = resolveViewerUrl(paperParam);
      const msResolved = msParam ? resolveViewerUrl(msParam) : '';
      let subj: BookletKey = 'math-aa';
      if (subjectParam) {
        const s = subjectParam.toLowerCase();
        if (s.includes('chem')) subj = 'chemistry';
        else if (s.includes('phys')) subj = 'physics';
        else if (s.includes('ai')) subj = 'math-ai';
        else subj = 'math-aa';
      } else {
        const full = `${paperParam} ${titleParam || ''}`.toLowerCase();
        if (full.includes('chem')) subj = 'chemistry';
        else if (full.includes('phys')) subj = 'physics';
        else if (full.includes('ai')) subj = 'math-ai';
      }

      setCustomPaper({
        id: 'deep-linked-custom',
        label: titleParam || 'Deep-Linked Topical Pack',
        qp: qpResolved,
        ms: msResolved,
        subject: subj,
        maxMarks: subj === 'physics' ? 60 : subj === 'chemistry' ? 80 : 100,
        duration: 90
      });
      setSelectedPaperId('deep-linked-custom');
      if (msResolved) {
        setActiveTab('markscheme');
      }
    }
  }, [searchParams]);

  useEffect(() => {
    setExamTimeLeft(paper.duration * 60);
    setMaxMarks(paper.maxMarks);
  }, [paper.duration, paper.maxMarks, paper.subject]);

  const handleSelectPaper = (id: string) => {
    setSelectedPaperId(id);
    setCustomPaper(null);
    setMMarks(0);
    setAMarks(0);
    setRMarks(0);
    const chosen = ALL_PAPERS_MAP.get(id);
    if (chosen) {
      setExamTimeLeft(chosen.duration * 60);
      setMaxMarks(chosen.maxMarks);
      if (chosen.ms) {
        setActiveTab('markscheme');
      }
    }
  };

  // Timer Tick
  useEffect(() => {
    if (isReadingMode) {
      timerRef.current = setInterval(() => {
        setReadingTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsReadingMode(false);
            setIsExamRunning(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (isExamRunning && examTimeLeft > 0) {
      timerRef.current = setInterval(() => {
        setExamTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsExamRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // examTimeLeft is read only to decide whether to start; including it as a
    // dependency re-created the interval every tick and made the clock drift
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReadingMode, isExamRunning]);

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s.toString().padStart(2, '0')}`;
  };

  const totalScore = mMarks + aMarks + rMarks;
  const percentage = maxMarks > 0 ? (totalScore / maxMarks) * 100 : 0;

  // Grade boundaries estimation (typical IB Math AA / Sciences HL)
  let projectedGrade = 1;
  let gradeColor = '#eb5757';
  if (percentage >= 74) {
    projectedGrade = 7;
    gradeColor = '#2ea043';
  } else if (percentage >= 62) {
    projectedGrade = 6;
    gradeColor = '#0969da';
  } else if (percentage >= 50) {
    projectedGrade = 5;
    gradeColor = '#8250df';
  } else if (percentage >= 38) {
    projectedGrade = 4;
    gradeColor = '#f59f00';
  } else if (percentage >= 26) {
    projectedGrade = 3;
    gradeColor = '#e36209';
  } else if (percentage >= 14) {
    projectedGrade = 2;
    gradeColor = '#d73a49';
  }

  const startReadingPeriod = () => {
    setReadingTimeLeft(300);
    setIsReadingMode(true);
    setIsExamRunning(false);
  };

  return (
    <div className="exam-workspace" style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg, #fbfbfa)', overflow: 'hidden' }}>
      {/* Top Workspace Bar */}
      <header 
        style={{
          height: '56px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--panel, #ffffff)',
          padding: '0 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <Link 
            href="/past-papers"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--muted)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}
            className="hover:text-black"
          >
            <ArrowLeft size={16} /> Past Papers
          </Link>
          <div style={{ width: '1px', height: '16px', background: 'var(--border)' }} />
          
          <select
            value={selectedPaperId}
            onChange={(e) => handleSelectPaper(e.target.value)}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              background: 'var(--panel)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              maxWidth: '380px',
              textOverflow: 'ellipsis'
            }}
          >
            {customPaper && (
              <option value="deep-linked-custom">
                {customPaper.label}
              </option>
            )}
            <optgroup label="Sample Full Past Papers">
              {CHRONOLOGICAL_PAPERS.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </optgroup>
            <optgroup label="⚛️ IB Physics Topicals (Themes A–E & 24 Subtopics)">
              {PHYSICS_TOPICAL_PAPERS.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </optgroup>
            <optgroup label="🧪 IB Chemistry Topicals (Structure, Reactivity & 22 Subtopics)">
              {CHEMISTRY_TOPICAL_PAPERS.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </optgroup>
            <optgroup label="📐 IB Mathematics Topicals (Topics 1–5 & 25 Subtopics)">
              {MATH_TOPICAL_PAPERS.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Timers & Exam State */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isReadingMode ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(245, 159, 0, 0.15)', color: '#b07000', padding: '0.3rem 0.75rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700 }}>
              <Timer size={16} /> 5-Min Reading Period: {formatSeconds(readingTimeLeft)} (Pens Down)
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={startReadingPeriod}
                title="Start official 5-minute reading period"
                style={{
                  padding: '0.3rem 0.65rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  background: 'var(--surface, #fafafa)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                5m Reading Mode
              </button>

              <div 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  fontSize: '1rem',
                  padding: '0.3rem 0.65rem',
                  borderRadius: '6px',
                  background: 'var(--border)'
                }}
              >
                <Timer size={14} /> {formatSeconds(examTimeLeft)}
              </div>

              <button
                onClick={() => setIsExamRunning((prev) => !prev)}
                style={{
                  padding: '0.3rem 0.6rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: isExamRunning ? '#f59f00' : '#2ea043',
                  color: '#fff',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}
              >
                {isExamRunning ? <><Pause size={13} /> Pause</> : <><Play size={13} /> Start</>}
              </button>

              <button
                onClick={() => {
                  setIsExamRunning(false);
                  setIsReadingMode(false);
                  setExamTimeLeft(paper.duration * 60);
                }}
                title="Reset timer"
                style={{
                  padding: '0.3rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  cursor: 'pointer'
                }}
              >
                <RotateCcw size={14} />
              </button>
            </div>
          )}

          {/* Split Ratio Controls */}
          <div className="split-ratio-controls" style={{ display: 'flex', gap: '0.25rem', borderLeft: '1px solid var(--border)', paddingLeft: '0.75rem' }}>
            <button
              onClick={() => setSplitRatio(40)}
              style={{
                padding: '0.2rem 0.45rem',
                borderRadius: '4px',
                border: splitRatio === 40 ? '1px solid #0969da' : '1px solid var(--border)',
                background: splitRatio === 40 ? 'rgba(9, 105, 218, 0.1)' : 'transparent',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              40/60
            </button>
            <button
              onClick={() => setSplitRatio(50)}
              style={{
                padding: '0.2rem 0.45rem',
                borderRadius: '4px',
                border: splitRatio === 50 ? '1px solid #0969da' : '1px solid var(--border)',
                background: splitRatio === 50 ? 'rgba(9, 105, 218, 0.1)' : 'transparent',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              50/50
            </button>
            <button
              onClick={() => setSplitRatio(60)}
              style={{
                padding: '0.2rem 0.45rem',
                borderRadius: '4px',
                border: splitRatio === 60 ? '1px solid #0969da' : '1px solid var(--border)',
                background: splitRatio === 60 ? 'rgba(9, 105, 218, 0.1)' : 'transparent',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              60/40
            </button>
          </div>
        </div>
      </header>

      {/* Main Split Screen Area */}
      <div className="exam-workspace-panes" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        
        {/* LEFT PANE: Question Paper Viewer */}
        <div 
          style={{ 
            width: `${splitRatio}%`, 
            height: '100%', 
            borderRight: '1px solid var(--border)', 
            display: 'flex', 
            flexDirection: 'column',
            background: 'var(--panel)'
          }}
        >
          <div style={{ padding: '0.4rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg, #fbfbfa)', fontSize: '0.8rem' }}>
            <span style={{ fontWeight: 600, color: 'var(--ink)' }}>
              📄 Question Paper: {paper.label}
            </span>
            <a 
              href={activeQpUrl} 
              target="_blank" 
              rel="noreferrer" 
              style={{ color: '#0969da', textDecoration: 'none', fontWeight: 500 }}
            >
              Open Tab ↗
            </a>
          </div>

          <div style={{ flex: 1, position: 'relative' }}>
            {activeQpUrl ? (
              <PDFReader src={`${activeQpUrl}#toolbar=1`} title="Question Paper"/>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '2rem', textAlign: 'center' }}>
                <div>
                  <FileText size={36} color="var(--muted)" style={{ margin: '0 auto 1rem' }} />
                  <p style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                    Paste a Question Paper URL or select a paper from the top dropdown.
                  </p>
                  <input 
                    type="text" 
                    placeholder="https://... or /api/past-papers/..." 
                    value={customQpUrl}
                    onChange={(e) => setCustomQpUrl(e.target.value)}
                    style={{ width: '100%', maxWidth: '350px', padding: '0.4rem 0.65rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.85rem' }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANE: Dual-Tab Workspace (Booklet / Markscheme / Scratchpad) */}
        <div 
          style={{ 
            width: `${100 - splitRatio}%`, 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            background: 'var(--surface)'
          }}
        >
          {/* Tab Selector */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--panel)', padding: '0 0.5rem' }}>
            <button
              onClick={() => setActiveTab('booklet')}
              style={{
                padding: '0.65rem 1rem',
                border: 'none',
                background: 'transparent',
                borderBottom: activeTab === 'booklet' ? '2px solid #0969da' : '2px solid transparent',
                color: activeTab === 'booklet' ? '#0969da' : 'var(--muted)',
                fontWeight: activeTab === 'booklet' ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <BookOpen size={15} /> Formula Booklet
            </button>

            <button
              onClick={() => setActiveTab('markscheme')}
              style={{
                padding: '0.65rem 1rem',
                border: 'none',
                background: 'transparent',
                borderBottom: activeTab === 'markscheme' ? '2px solid #2ea043' : '2px solid transparent',
                color: activeTab === 'markscheme' ? '#2ea043' : 'var(--muted)',
                fontWeight: activeTab === 'markscheme' ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <CheckSquare size={15} /> Markscheme & Grader
            </button>

            <button
              onClick={() => setActiveTab('notes')}
              style={{
                padding: '0.65rem 1rem',
                border: 'none',
                background: 'transparent',
                borderBottom: activeTab === 'notes' ? '2px solid #8250df' : '2px solid transparent',
                color: activeTab === 'notes' ? '#8250df' : 'var(--muted)',
                fontWeight: activeTab === 'notes' ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <FileText size={15} /> Scratchpad
            </button>
          </div>

          {/* TAB 1: FORMULA BOOKLET */}
          {activeTab === 'booklet' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {/* Booklet Sub-Nav */}
              <div style={{ padding: '0.4rem 1rem', borderBottom: '1px solid var(--border)', background: 'var(--bg, #fbfbfa)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  onClick={() => setBookletSubject('math-aa')}
                  style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    border: bookletSubject === 'math-aa' ? '1px solid #0969da' : '1px solid var(--border)',
                    background: bookletSubject === 'math-aa' ? 'rgba(9, 105, 218, 0.1)' : 'transparent',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: 'var(--ink)',
                    cursor: 'pointer'
                  }}
                >
                  AA Formula Booklet
                </button>
                <button
                  onClick={() => setBookletSubject('physics')}
                  style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    border: bookletSubject === 'physics' ? '1px solid #0969da' : '1px solid var(--border)',
                    background: bookletSubject === 'physics' ? 'rgba(9, 105, 218, 0.1)' : 'transparent',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: 'var(--ink)',
                    cursor: 'pointer'
                  }}
                >
                  AA Comprehensive Sheet
                </button>
              </div>

              <div style={{ flex: 1 }}>
                <PDFReader src={
                    bookletSubject === 'physics'
                      ? '/vault/ib-booklets/Math_AA_Comprehensive_Sheet.pdf#toolbar=1'
                      : '/vault/ib-booklets/Math_AA_Formula_Booklet.pdf#toolbar=1'
                  } title="Formula Booklet"/>
              </div>
            </div>
          )}

          {/* TAB 2: MARKSCHEME & M1/A1/R1 GRADER */}
          {activeTab === 'markscheme' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {/* Score Tally & Grade Boundary Header */}
              <div 
                style={{
                  padding: '0.75rem 1rem',
                  borderBottom: '1px solid var(--border)',
                  background: 'var(--panel)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}
              >
                {/* Counters for M, A, R */}
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  {/* M Marks */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 700, color: '#0969da' }} title="Method Marks">M:</span>
                    <button onClick={() => setMMarks((p) => Math.max(0, p - 1))} style={{ width: '22px', height: '22px', borderRadius: '4px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer' }}>-</button>
                    <span style={{ fontWeight: 800, minWidth: '18px', textAlign: 'center' }}>{mMarks}</span>
                    <button onClick={() => setMMarks((p) => p + 1)} style={{ width: '22px', height: '22px', borderRadius: '4px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer' }}>+</button>
                  </div>

                  {/* A Marks */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 700, color: '#2ea043' }} title="Accuracy Marks">A:</span>
                    <button onClick={() => setAMarks((p) => Math.max(0, p - 1))} style={{ width: '22px', height: '22px', borderRadius: '4px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer' }}>-</button>
                    <span style={{ fontWeight: 800, minWidth: '18px', textAlign: 'center' }}>{aMarks}</span>
                    <button onClick={() => setAMarks((p) => p + 1)} style={{ width: '22px', height: '22px', borderRadius: '4px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer' }}>+</button>
                  </div>

                  {/* R Marks */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 700, color: '#8250df' }} title="Reasoning Marks">R:</span>
                    <button onClick={() => setRMarks((p) => Math.max(0, p - 1))} style={{ width: '22px', height: '22px', borderRadius: '4px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer' }}>-</button>
                    <span style={{ fontWeight: 800, minWidth: '18px', textAlign: 'center' }}>{rMarks}</span>
                    <button onClick={() => setRMarks((p) => p + 1)} style={{ width: '22px', height: '22px', borderRadius: '4px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer' }}>+</button>
                  </div>
                </div>

                {/* Score & Predicted Grade Banner */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Total / Max:</div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                      {totalScore} / {maxMarks} ({percentage.toFixed(1)}%)
                    </div>
                  </div>

                  <div 
                    style={{
                      background: gradeColor,
                      color: '#fff',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '8px',
                      fontWeight: 800,
                      fontSize: '1rem'
                    }}
                  >
                    Grade {projectedGrade}
                  </div>
                </div>
              </div>

              {/* Markscheme PDF Viewer */}
              <div style={{ flex: 1 }}>
                {activeMsUrl ? (
                  <PDFReader src={`${activeMsUrl}#toolbar=1`} title="Markscheme"/>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '2rem', textAlign: 'center' }}>
                    <div>
                      <CheckSquare size={36} color="var(--muted)" style={{ margin: '0 auto 1rem' }} />
                      <p style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                        Select a paper above or paste a custom Markscheme URL to grade against official M1/A1 criteria.
                      </p>
                      <input 
                        type="text" 
                        placeholder="https://... or /api/past-papers/...markscheme.pdf" 
                        value={customMsUrl}
                        onChange={(e) => setCustomMsUrl(e.target.value)}
                        style={{ width: '100%', maxWidth: '350px', padding: '0.4rem 0.65rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SCRATCHPAD NOTES */}
          {activeTab === 'notes' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '0.5rem' }}>
                Student Working & Exam Notes (Auto-saved locally):
              </div>
              <textarea
                value={studentNotes}
                onChange={(e) => setStudentNotes(e.target.value)}
                placeholder="Work through scratch algebra, write down intermediate substitution steps, or log examiner flags here..."
                style={{
                  flex: 1,
                  width: '100%',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--panel)',
                  padding: '1rem',
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                  resize: 'none',
                  outline: 'none',
                  fontFamily: 'monospace'
                }}
              />
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default function PastPapersWorkspacePage() {
  return (
    <Suspense fallback={<div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>Loading Exam Workspace…</div>}>
      <PastPapersWorkspaceInner />
    </Suspense>
  );
}
