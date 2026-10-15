'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Timer, 
  BookOpen, 
  CheckSquare, 
  Maximize2, 
  Minimize2, 
  Volume2, 
  RotateCcw, 
  Play, 
  Pause, 
  HelpCircle, 
  Sliders, 
  FileText,
  Calculator,
  Atom,
  FlaskConical,
  Award,
  AlertCircle
} from 'lucide-react';
import MathView from '@/app/components/MathView';

type RightTab = 'booklet' | 'markscheme' | 'notes';
type BookletKey = 'math-aa' | 'math-ai' | 'physics' | 'chemistry';

const SAMPLE_PAPERS = [
  { label: 'Math AA HL P1 (May 2024)', qp: '/api/past-papers/Mathematics/2024/May/Math_AA_HL_paper_1_TZ1.pdf', ms: '/api/past-papers/Mathematics/2024/May/Math_AA_HL_paper_1_TZ1_markscheme.pdf', maxMarks: 110, duration: 120 },
  { label: 'Math AA SL P1 (May 2024)', qp: '/api/past-papers/Mathematics/2024/May/Math_AA_SL_paper_1_TZ1.pdf', ms: '/api/past-papers/Mathematics/2024/May/Math_AA_SL_paper_1_TZ1_markscheme.pdf', maxMarks: 80, duration: 90 },
  { label: 'Physics HL P1 (May 2024)', qp: '/api/past-papers/Physics/2024/May/Physics_HL_paper_1_TZ1.pdf', ms: '/api/past-papers/Physics/2024/May/Physics_HL_paper_1_TZ1_markscheme.pdf', maxMarks: 40, duration: 60 },
  { label: 'Chemistry HL P2 (May 2024)', qp: '/api/past-papers/Chemistry/2024/May/Chemistry_HL_paper_2_TZ1.pdf', ms: '/api/past-papers/Chemistry/2024/May/Chemistry_HL_paper_2_TZ1_markscheme.pdf', maxMarks: 90, duration: 135 },
  { label: 'Custom Document / URL', qp: '', ms: '', maxMarks: 100, duration: 90 },
];

export default function PastPapersWorkspacePage() {
  const [selectedPaperIdx, setSelectedPaperIdx] = useState<number>(0);
  const paper = SAMPLE_PAPERS[selectedPaperIdx];

  const [customQpUrl, setCustomQpUrl] = useState<string>('');
  const [customMsUrl, setCustomMsUrl] = useState<string>('');

  const activeQpUrl = paper.qp || customQpUrl || '/vault/ib-booklets/Math_AA_Formula_Booklet.pdf';
  const activeMsUrl = paper.ms || customMsUrl || '';

  // Right pane tab
  const [activeTab, setActiveTab] = useState<RightTab>('booklet');
  const [bookletSubject, setBookletSubject] = useState<BookletKey>('math-aa');

  // Split ratio: left percent
  const [splitRatio, setSplitRatio] = useState<number>(50); // 50 means 50% left, 50% right

  // Official Timers: 5-min reading countdown vs main exam
  const [isReadingMode, setIsReadingMode] = useState<boolean>(false);
  const [readingTimeLeft, setReadingTimeLeft] = useState<number>(300); // 5 mins = 300s
  const [examTimeLeft, setExamTimeLeft] = useState<number>(paper.duration * 60);
  const [isExamRunning, setIsExamRunning] = useState<boolean>(false);

  // Markscheme Tally Counter
  const [mMarks, setMMarks] = useState<number>(0);
  const [aMarks, setAMarks] = useState<number>(0);
  const [rMarks, setRMarks] = useState<number>(0);
  const [maxMarks, setMaxMarks] = useState<number>(paper.maxMarks);

  // Scratchpad Notes
  const [studentNotes, setStudentNotes] = useState<string>('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setExamTimeLeft(paper.duration * 60);
    setMaxMarks(paper.maxMarks);
  }, [selectedPaperIdx, paper.duration, paper.maxMarks]);

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
  }, [isReadingMode, isExamRunning, examTimeLeft]);

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
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg, #fbfbfa)', overflow: 'hidden' }}>
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
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted, #666)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}
            className="hover:text-black"
          >
            <ArrowLeft size={16} /> Past Papers
          </Link>
          <div style={{ width: '1px', height: '16px', background: 'var(--border)' }} />
          
          <select
            value={selectedPaperIdx}
            onChange={(e) => setSelectedPaperIdx(parseInt(e.target.value))}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              background: 'var(--panel)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {SAMPLE_PAPERS.map((p, idx) => (
              <option key={idx} value={idx}>{p.label}</option>
            ))}
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
          <div style={{ display: 'flex', gap: '0.25rem', borderLeft: '1px solid var(--border)', paddingLeft: '0.75rem' }}>
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
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        
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
              <iframe
                src={`${activeQpUrl}#toolbar=1`}
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="Question Paper"
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '2rem', textAlign: 'center' }}>
                <div>
                  <FileText size={36} color="var(--text-muted, #888)" style={{ margin: '0 auto 1rem' }} />
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted, #666)' }}>
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
                color: activeTab === 'booklet' ? '#0969da' : 'var(--text-muted, #666)',
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
                color: activeTab === 'markscheme' ? '#2ea043' : 'var(--text-muted, #666)',
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
                color: activeTab === 'notes' ? '#8250df' : 'var(--text-muted, #666)',
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
                    cursor: 'pointer'
                  }}
                >
                  Math AA
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
                    cursor: 'pointer'
                  }}
                >
                  Physics
                </button>
                <button
                  onClick={() => setBookletSubject('chemistry')}
                  style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    border: bookletSubject === 'chemistry' ? '1px solid #0969da' : '1px solid var(--border)',
                    background: bookletSubject === 'chemistry' ? 'rgba(9, 105, 218, 0.1)' : 'transparent',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Chemistry
                </button>
              </div>

              <div style={{ flex: 1 }}>
                <iframe
                  src={
                    bookletSubject === 'math-aa'
                      ? '/vault/ib-booklets/Math_AA_Formula_Booklet.pdf#toolbar=1'
                      : bookletSubject === 'physics'
                        ? '/vault/ib-booklets/Math_AA_Comprehensive_Sheet.pdf#toolbar=1'
                        : '/vault/ib-booklets/Math_AA_Formula_Booklet.pdf#toolbar=1'
                  }
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  title="Formula Booklet"
                />
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
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #666)' }}>Total / Max:</div>
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
                  <iframe
                    src={`${activeMsUrl}#toolbar=1`}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    title="Markscheme"
                  />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '2rem', textAlign: 'center' }}>
                    <div>
                      <CheckSquare size={36} color="var(--text-muted, #888)" style={{ margin: '0 auto 1rem' }} />
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted, #666)' }}>
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
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted, #666)', marginBottom: '0.5rem' }}>
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
