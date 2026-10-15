'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Clock, Flag, ChevronLeft, ChevronRight, Calculator, FileText, ArrowRight, Play, RotateCcw, Coffee, Check } from 'lucide-react';
import type { SATQuestion } from '@/lib/sat-types';
import type { FullSATExam, FullSATExamModule } from '@/lib/sat';
import { isAnswerCorrect, formatCorrectAnswer, isSPR } from '@/lib/sat-grading';
import { scoreExam, type ScoredItem, type SATScoreReport } from '@/lib/sat-scoring';
import { recordAttempts, saveMistake, saveCompletedExam, getExamHistory, getSeenIds, markSeen, ExamHistoryEntry } from '@/lib/sat-storage';
import QuestionBody from '@/app/components/sat/QuestionBody';
import { Rationale } from '@/app/components/sat/SATContent';
import DesmosPanel from '@/app/components/sat/DesmosPanel';
import SATReferenceGuideModal from '@/app/components/SATReferenceGuideModal';

import type { SATExamDifficultyMode, SATExamConfig } from '@/lib/sat-types';

type Phase = 'intro' | 'active' | 'review' | 'break' | 'report';
const STORAGE_KEY = 'sat_exam_v3';
const BREAK_SECONDS = 10 * 60;

interface SavedState {
  exam: FullSATExam;
  phase: Phase;
  moduleIdx: number;
  qIdx: number;
  answers: Record<string, string>;
  flags: Record<string, boolean>;
  secondsLeft: number;
  times: Record<string, number>;
  lastSaved: string;
}

const keyOf = (m: FullSATExamModule, q: SATQuestion) => `${m.id}_${q.questionId}`;
const ord = (n: number) => `${n}${[11, 12, 13].includes(n % 100) ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[n % 10] || 'th'}`;
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

interface ReviewRow {
  q: SATQuestion;
  module: FullSATExamModule;
  answer: string;
  correct: boolean;
  flagged: boolean;
  seconds: number;
}

export default function SATExamPage() {
  const [exam, setExam] = useState<FullSATExam | null>(null);
  const [phase, setPhase] = useState<Phase>('intro');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [moduleIdx, setModuleIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [struck, setStruck] = useState<Record<string, Record<string, boolean>>>({});
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [showTimer, setShowTimer] = useState(true);
  const [showCalc, setShowCalc] = useState(false);
  const [showRef, setShowRef] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [saved, setSaved] = useState<SavedState | null>(null);

  // Difficulty & Exam Configuration Options
  const [difficultyMode, setDifficultyMode] = useState<SATExamDifficultyMode>('adaptive');
  const [sectionScope, setSectionScope] = useState<'full' | 'math' | 'rw'>('full');
  const [timerMode, setTimerMode] = useState<'standard' | 'accelerated_0.8x' | 'untimed'>('standard');
  const [report, setReport] = useState<SATScoreReport | null>(null);
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [tiers, setTiers] = useState<{ rw?: string; math?: string }>({});
  const [history, setHistory] = useState<ExamHistoryEntry[]>([]);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'wrong' | 'flagged'>('wrong');
  const [openRow, setOpenRow] = useState<string | null>(null);

  const times = useRef<Record<string, number>>({});
  const qStart = useRef<number>(Date.now());
  const endsAt = useRef<number>(0);
  const submitting = useRef(false);

  const mod = exam?.modules[moduleIdx] ?? null;
  const question = mod?.questions[qIdx] ?? null;
  const curKey = mod && question ? keyOf(mod, question) : '';

  // ---- detect saved exam
  useEffect(() => {
    setHistory(getExamHistory());
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw) as SavedState;
        if (s?.exam && (s.phase === 'active' || s.phase === 'review' || s.phase === 'break')) setSaved(s);
      }
    } catch {
      /* corrupt save: ignore */
    }
  }, []);

  // ---- persist progress
  useEffect(() => {
    if (!exam || (phase !== 'active' && phase !== 'review' && phase !== 'break')) return;
    try {
      const s: SavedState = { exam, phase, moduleIdx, qIdx, answers, flags, secondsLeft, times: times.current, lastSaved: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch {
      /* quota / private mode */
    }
  }, [exam, phase, moduleIdx, qIdx, answers, flags, secondsLeft]);

  // ---- per-question timing
  const bankTime = useCallback(() => {
    if (!curKey) return;
    const dt = Math.round((Date.now() - qStart.current) / 1000);
    if (dt > 0) times.current[curKey] = (times.current[curKey] || 0) + dt;
    qStart.current = Date.now();
  }, [curKey]);

  const goTo = (i: number) => {
    bankTime();
    setQIdx(i);
    setShowGrid(false);
  };

  // ---- module submit (button or timer expiry)
  const submitModule = useCallback(async () => {
    if (!exam || !mod || submitting.current) return;
    submitting.current = true;
    bankTime();
    setBusy(true);
    setError(null);
    try {
      const modItems: ScoredItem[] = mod.questions.map((q) => ({
        difficulty: q.difficulty,
        type: q.type,
        scored: !q.pretest,
        correct: isAnswerCorrect(q, answers[keyOf(mod, q)]),
      }));
      let nextExam = exam;

      // Module 1 -> route the section's Module 2 from Module 1's scored items
      if (mod.moduleNumber === 1) {
        try {
          const res = await fetch('/api/sat/exam', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'route_module',
              section: mod.section,
              items: modItems,
              excludeIds: mod.questions.map((q) => q.questionId),
              seenIds: getSeenIds(),
              difficultyMode: exam.difficultyMode || difficultyMode,
              timerMode: exam.timerMode || timerMode,
            }),
          });
          const data = await res.json();
          if (data.success && data.module) {
            const modules = [...exam.modules];
            modules[moduleIdx + 1] = data.module;
            nextExam = { ...exam, modules };
            setExam(nextExam);
            setTiers((t) => ({ ...t, [mod.section === 'math' ? 'math' : 'rw']: data.tier }));
          }
        } catch {
          /* keep the placeholder Module 2 */
        }
      }

      const next = moduleIdx + 1;
      if (next >= nextExam.modules.length) {
        finish(nextExam);
        return;
      }
      setModuleIdx(next);
      setQIdx(0);
      setShowCalc(false);
      qStart.current = Date.now();
      if (nextExam.modules[next].section !== mod.section) {
        setSecondsLeft(BREAK_SECONDS);
        endsAt.current = Date.now() + BREAK_SECONDS * 1000;
        setPhase('break');
      } else {
        const secs = nextExam.modules[next].timeMinutes * 60;
        setSecondsLeft(secs);
        endsAt.current = Date.now() + secs * 1000;
        setPhase('active');
      }
    } finally {
      submitting.current = false;
      setBusy(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam, mod, moduleIdx, answers, bankTime, difficultyMode, timerMode]);

  const startModule = () => {
    if (!exam) return;
    const secs = exam.modules[moduleIdx].timeMinutes * 60;
    setSecondsLeft(secs);
    endsAt.current = Date.now() + secs * 1000;
    qStart.current = Date.now();
    setPhase('active');
  };

  // ---- wall-clock timer (correct even when the tab is throttled)
  useEffect(() => {
    if (phase !== 'active' && phase !== 'break') return;
    if (!endsAt.current) endsAt.current = Date.now() + secondsLeft * 1000;
    const id = setInterval(() => {
      const left = Math.max(0, Math.ceil((endsAt.current - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left <= 0) {
        clearInterval(id);
        if (phase === 'break') startModule();
        else submitModule();
      }
    }, 250);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, moduleIdx, submitModule]);

  // ---- finish & score
  const finish = (finalExam: FullSATExam) => {
    localStorage.removeItem(STORAGE_KEY);
    const rw: ScoredItem[] = [];
    const math: ScoredItem[] = [];
    const out: ReviewRow[] = [];
    const domains: Record<string, [number, number]> = {};
    for (const m of finalExam.modules) {
      for (const q of m.questions) {
        const answer = answers[keyOf(m, q)] || '';
        const correct = isAnswerCorrect(q, answer);
        (m.section === 'math' ? math : rw).push({ difficulty: q.difficulty, type: q.type, scored: !q.pretest, correct });
        if (!q.pretest) {
          const d = (domains[q.domain] ||= [0, 0]);
          d[1]++;
          if (correct) d[0]++;
        }
        out.push({ q, module: m, answer, correct, flagged: !!flags[keyOf(m, q)], seconds: times.current[keyOf(m, q)] || 0 });
        if (!correct) {
          saveMistake({ questionId: q.questionId, section: m.section, domain: q.domain, skill: q.skill, difficulty: q.difficulty, correctAnswer: q.correctAnswer, userAnswer: answer || '[Omitted]' });
        }
      }
    }
    markSeen(out.map((r) => r.q.questionId));
    recordAttempts(out.filter((r) => !r.q.pretest).map((r) => ({ section: r.module.section, domain: r.q.domain, skill: r.q.skill, correct: r.correct })));
    const rep = scoreExam(rw, math, finalExam.difficultyMode || difficultyMode);
    const avg = (sec: 'math' | 'rw') => {
      const list = out.filter((r) => (r.module.section === 'math') === (sec === 'math'));
      return list.length ? Math.round(list.reduce((a, r) => a + r.seconds, 0) / list.length) : 0;
    };
    saveCompletedExam({
      totalScore: rep.totalScore, rwScore: rep.rwScore, mathScore: rep.mathScore, percentile: rep.percentile,
      rwCorrect: rep.rwCorrect, totalRW: rep.totalRW, mathCorrect: rep.mathCorrect, totalMath: rep.totalMath,
      isRWHard: finalExam.modules[1]?.tier === 'hard', isMathHard: finalExam.modules[3]?.tier === 'hard',
      avgTimeRWSeconds: avg('rw'), avgTimeMathSeconds: avg('math'), rwRange: rep.rwRange, mathRange: rep.mathRange, domains,
    });
    setHistory(getExamHistory());
    setReport(rep);
    setRows(out);
    setPhase('report');
  };

  // ---- start / resume
  const startFresh = async () => {
    setBusy(true);
    setError(null);
    try {
      const config: SATExamConfig = {
        section: sectionScope,
        difficultyMode,
        timerMode,
      };
      const res = await fetch('/api/sat/exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'new_exam', seenIds: getSeenIds(), config }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Could not build exam');
      localStorage.removeItem(STORAGE_KEY);
      setSaved(null);
      setExam(data.exam);
      setAnswers({});
      setFlags({});
      setStruck({});
      times.current = {};
      setTiers({});
      setModuleIdx(0);
      setQIdx(0);
      const secs = data.exam.modules[0].timeMinutes * 60;
      setSecondsLeft(secs);
      endsAt.current = Date.now() + secs * 1000;
      qStart.current = Date.now();
      setPhase('active');
    } catch (e: any) {
      setError(e.message || 'Could not start the exam. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const resume = () => {
    if (!saved) return;
    setExam(saved.exam);
    setAnswers(saved.answers || {});
    setFlags(saved.flags || {});
    times.current = saved.times || {};
    setModuleIdx(saved.moduleIdx);
    setQIdx(saved.qIdx);
    setSecondsLeft(saved.secondsLeft);
    endsAt.current = Date.now() + saved.secondsLeft * 1000;
    qStart.current = Date.now();
    setPhase(saved.phase);
  };

  // ---- keyboard
  useEffect(() => {
    if (phase !== 'active' || !mod || !question) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
      if (e.key === 'ArrowRight' && qIdx < mod.questions.length - 1) goTo(qIdx + 1);
      else if (e.key === 'ArrowLeft' && qIdx > 0) goTo(qIdx - 1);
      else if (!isSPR(question) && /^[a-d]$/i.test(e.key)) setAnswers((p) => ({ ...p, [curKey]: e.key.toUpperCase() }));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, qIdx, mod, question, curKey]);

  // ---- derived
  const answeredCount = useMemo(() => (mod ? mod.questions.filter((q) => answers[keyOf(mod, q)]?.trim()).length : 0), [mod, answers]);
  const history0 = history[0];
  const rowsShown = rows.filter((r) => (reviewFilter === 'all' ? true : reviewFilter === 'wrong' ? !r.correct : r.flagged));

  const box: React.CSSProperties = { maxWidth: 1100, margin: '0 auto', paddingBottom: '4rem' };
  const btnPrimary: React.CSSProperties = { padding: '0.65rem 1.4rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 };
  const btnGhost: React.CSSProperties = { padding: '0.6rem 1.1rem', background: 'var(--surface)', color: 'var(--ink)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' };

  // ================= INTRO =================
  if (phase === 'intro') {
    return (
      <div style={{ maxWidth: 720, margin: '2rem auto' }}>
        <Link href="/sat" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--muted)', textDecoration: 'none', marginBottom: '2rem' }}>
          <ChevronLeft size={14} /> Back to SAT Portal
        </Link>
        <span className="section-label">FULL-LENGTH PRACTICE TEST</span>
        <h1 style={{ fontSize: '2.6rem', marginBottom: '0.6rem' }}>Digital SAT</h1>
        <p style={{ color: 'var(--muted)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          Built the way the real test is: two adaptive modules per section, a 10-minute break, and questions drawn from official College Board items using the published content mix.
        </p>

        {saved && (
          <div className="panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', border: '1.5px solid var(--accent)' }}>
            <strong>Test in progress</strong>
            <p style={{ margin: '0.4rem 0 1rem', fontSize: '0.9rem' }}>
              {saved.exam.modules[saved.moduleIdx]?.title}, question {saved.qIdx + 1}, {fmt(saved.secondsLeft)} left. Last saved {new Date(saved.lastSaved).toLocaleTimeString()}.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button type="button" onClick={resume} style={btnPrimary}><Play size={15} /> Resume</button>
              <button type="button" onClick={startFresh} style={btnGhost}><RotateCcw size={14} /> Discard and start over</button>
            </div>
          </div>
        )}

        {/* Configuration Controls: Section Scope & Timer */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {/* Section Scope */}
          <div className="panel" style={{ padding: '1rem 1.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
              Exam Scope
            </span>
            <div style={{ display: 'flex', gap: 6, marginTop: '0.5rem' }}>
              {([
                ['full', 'Full Test (RW + Math)'],
                ['math', 'Math Only'],
                ['rw', 'Reading & Writing Only'],
              ] as const).map(([s, label]) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSectionScope(s)}
                  style={{
                    flex: 1,
                    padding: '0.45rem 0.5rem',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    borderRadius: 6,
                    border: sectionScope === s ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                    background: sectionScope === s ? 'rgba(184, 74, 57, 0.08)' : 'var(--surface, #fff)',
                    color: sectionScope === s ? 'var(--accent)' : 'var(--ink)',
                    cursor: 'pointer',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Timer Pacing */}
          <div className="panel" style={{ padding: '1rem 1.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
              Timer &amp; Pacing
            </span>
            <div style={{ display: 'flex', gap: 6, marginTop: '0.5rem' }}>
              {([
                ['standard', 'Standard Time'],
                ['accelerated_0.8x', '⚡ 0.8x Accelerated'],
                ['untimed', 'Untimed'],
              ] as const).map(([t, label]) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTimerMode(t)}
                  style={{
                    flex: 1,
                    padding: '0.45rem 0.5rem',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    borderRadius: 6,
                    border: timerMode === t ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                    background: timerMode === t ? 'rgba(184, 74, 57, 0.08)' : 'var(--surface, #fff)',
                    color: timerMode === t ? 'var(--accent)' : 'var(--ink)',
                    cursor: 'pointer',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Difficulty Mode 4-Card Selector Grid */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
              Select Difficulty Mode
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Official College Board Quotas Preserved</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.9rem' }}>
            {[
              {
                id: 'adaptive' as const,
                title: 'Official Adaptive',
                badge: 'Bluebook Standard',
                desc: 'Standard 2-stage routing. Module 1 mixed items (30% E, 45% M, 25% H) route to Hard Module 2 if score is above threshold.',
                accent: 'var(--border)',
              },
              {
                id: 'medium' as const,
                title: 'Medium Focus',
                badge: '600–700 Builder',
                desc: '75% Medium, 25% Hard. Eliminates trivial Easy items to build rock-solid fundamentals across all domains.',
                accent: '#2563eb',
              },
              {
                id: 'hard' as const,
                title: 'Hard Mode',
                badge: '700+ Upper-Track Lock',
                desc: '25% Medium, 75% Hard. Module 2 is force-locked to the Upper Track so you always experience the 700+ difficulty ceiling.',
                accent: '#7c3aed',
              },
              {
                id: 'hard_gauntlet' as const,
                title: '750+ Gauntlet',
                badge: '100% Level-3 Hard',
                desc: '100% Hard questions across both modules with Examiner Trap priority. The ultimate high-scorer challenge.',
                accent: 'var(--rust)',
              },
            ].map((m) => {
              const active = difficultyMode === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => setDifficultyMode(m.id)}
                  style={{
                    padding: '1.1rem 1.1rem',
                    borderRadius: 8,
                    border: active ? `2px solid ${m.accent}` : '1px solid var(--border)',
                    background: active ? 'rgba(0,0,0,0.02)' : 'var(--surface, #fff)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: active ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: m.accent }}>
                        {m.badge}
                      </span>
                      {active && <span style={{ width: 8, height: 8, borderRadius: '50%', background: m.accent }} />}
                    </div>
                    <h3 style={{ fontSize: '1.05rem', margin: '0 0 0.4rem 0' }}>{m.title}</h3>
                    <p style={{ fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 1.45, margin: 0 }}>
                      {m.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel" style={{ padding: '1.25rem', marginBottom: '1.5rem', fontSize: '0.86rem', color: 'var(--ink-soft)', lineHeight: 1.6 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <span><strong>Configured Test:</strong> {sectionScope === 'full' ? 'Full Test (RW + Math)' : sectionScope === 'math' ? 'Math Only' : 'Reading & Writing Only'} · {difficultyMode === 'hard_gauntlet' ? '750+ Gauntlet' : difficultyMode === 'hard' ? 'Hard Mode' : difficultyMode === 'medium' ? 'Medium Focus' : 'Official Adaptive'} · {timerMode === 'accelerated_0.8x' ? 'Accelerated 0.8x' : timerMode === 'untimed' ? 'Untimed' : 'Standard Timing'}</span>
          </div>
        </div>

        {history0 && (
          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1.5rem' }}>
            Last attempt: <strong style={{ color: 'var(--ink)' }}>{history0.totalScore}</strong> (R&amp;W {history0.rwScore}, Math {history0.mathScore}) · {history.length} test{history.length === 1 ? '' : 's'} on this device ·{' '}
            <Link href="/sat/practice/drill?mode=mistakes" style={{ color: 'var(--accent)' }}>Review missed questions</Link>
          </p>
        )}
        {error && <p role="alert" style={{ color: '#b91c1c' }}>{error}</p>}
        {!saved && (
          <button type="button" onClick={startFresh} disabled={busy} style={{ ...btnPrimary, width: '100%', justifyContent: 'center', padding: '0.9rem', fontSize: '1rem', cursor: busy ? 'wait' : 'pointer' }}>
            {busy ? 'Building your customized test…' : `Start ${difficultyMode === 'hard_gauntlet' ? '750+ Gauntlet' : difficultyMode === 'hard' ? 'Hard Test' : difficultyMode === 'medium' ? 'Medium Focus Test' : 'Adaptive Test'}`} <ArrowRight size={16} />
          </button>
        )}
      </div>
    );
  }

  // ================= BREAK =================
  if (phase === 'break' && exam) {
    return (
      <div style={{ maxWidth: 560, margin: '5rem auto', textAlign: 'center' }}>
        <Coffee size={40} style={{ color: 'var(--accent)' }} />
        <h1 style={{ fontSize: '2.2rem', margin: '1rem 0 0.4rem' }}>Break</h1>
        <p style={{ color: 'var(--muted)' }}>Reading and Writing is done. Stretch, drink some water. Math starts automatically.</p>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '3.4rem', fontWeight: 600, margin: '1.5rem 0' }}>{fmt(secondsLeft)}</div>
        <button type="button" style={btnPrimary} onClick={startModule}>Skip break and start Math <ArrowRight size={16} /></button>
      </div>
    );
  }

  // ================= MODULE REVIEW =================
  if (phase === 'review' && exam && mod) {
    const unanswered = mod.questions.length - answeredCount;
    return (
      <div style={{ maxWidth: 720, margin: '2rem auto' }}>
        <span className="section-label">CHECK YOUR WORK</span>
        <h2 style={{ fontSize: '2rem', margin: '0.2rem 0' }}>{mod.title}</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
          {unanswered > 0 ? <strong style={{ color: '#b45309' }}>{unanswered} unanswered. </strong> : 'All questions answered. '}
          After you submit you can't come back to this module. <span style={{ fontFamily: 'var(--font-mono)' }}>{showTimer ? fmt(secondsLeft) : ''}</span>
        </p>
        <div className="panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="sat-qgrid">
            {mod.questions.map((q, i) => {
              const k = keyOf(mod, q);
              return (
                <button key={q.questionId} type="button" data-answered={!!answers[k]?.trim()} onClick={() => { setQIdx(i); qStart.current = Date.now(); setPhase('active'); }}>
                  {i + 1}
                  {flags[k] && <span className="flag" />}
                </button>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: '1.2rem', marginTop: '1rem', fontSize: '0.78rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)', flexWrap: 'wrap' }}>
            <span>solid = answered</span><span>dashed = unanswered</span><span style={{ color: 'var(--accent)' }}>■ marked for review</span>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button type="button" style={btnGhost} onClick={() => { qStart.current = Date.now(); setPhase('active'); }}>Back to questions</button>
          <button type="button" style={btnPrimary} disabled={busy} onClick={submitModule}>
            {busy ? 'Submitting…' : moduleIdx === exam.modules.length - 1 ? 'Submit and see score' : 'Submit module'}
          </button>
        </div>
      </div>
    );
  }

  // ================= ACTIVE =================
  if (phase === 'active' && exam && mod && question) {
    const lowTime = secondsLeft < 300;
    return (
      <div style={box}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', borderBottom: '1px solid var(--border)', paddingBottom: '0.9rem', marginBottom: '1.2rem' }}>
          <span className="section-label" style={{ margin: 0 }}>{mod.title.toUpperCase()}</span>
          <button type="button" onClick={() => setShowTimer((v) => !v)} aria-label={showTimer ? 'Hide timer' : 'Show timer'}
            style={{ ...btnGhost, fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.95rem', color: lowTime ? '#b91c1c' : 'var(--ink)', background: lowTime ? 'rgba(239,68,68,0.1)' : 'var(--surface)' }}>
            <Clock size={15} /> {showTimer ? fmt(secondsLeft) : 'Show time'}
          </button>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {mod.section === 'math' && <button type="button" style={btnGhost} onClick={() => setShowCalc((v) => !v)}><Calculator size={14} /> Calculator</button>}
            <button type="button" style={btnGhost} onClick={() => setShowRef(true)}><FileText size={14} /> Reference</button>
            <button
              type="button"
              style={{ ...btnGhost, border: 'none', color: 'var(--muted)' }}
              onClick={() => {
                if (confirm('Save your progress and exit? The timer is paused while you are away.')) {
                  bankTime();
                  const s: SavedState = {
                    exam,
                    phase: 'active',
                    moduleIdx,
                    qIdx,
                    answers,
                    flags,
                    secondsLeft,
                    times: times.current,
                    lastSaved: new Date().toISOString(),
                  };
                  try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
                  } catch {
                    /* ignore storage quota */
                  }
                  setSaved(s);
                  setPhase('intro');
                }
              }}
            >
              Save &amp; exit
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>Question {qIdx + 1} of {mod.questions.length}</span>
          <button type="button" onClick={() => setFlags((p) => ({ ...p, [curKey]: !p[curKey] }))}
            style={{ ...btnGhost, borderColor: flags[curKey] ? 'var(--accent)' : 'var(--border)', color: flags[curKey] ? 'var(--accent)' : 'var(--muted)' }}>
            <Flag size={13} fill={flags[curKey] ? 'currentColor' : 'none'} /> {flags[curKey] ? 'Marked for review' : 'Mark for review'}
          </button>
        </div>

        <div className="panel" style={{ padding: 'clamp(1.1rem, 3vw, 2.2rem)', marginBottom: '1.5rem' }}>
          <QuestionBody
            key={curKey}
            q={question}
            answer={answers[curKey] || ''}
            onAnswer={(a) => setAnswers((p) => ({ ...p, [curKey]: a }))}
            struck={struck[curKey] || {}}
            onStrike={(l) => setStruck((p) => ({ ...p, [curKey]: { ...(p[curKey] || {}), [l]: !p[curKey]?.[l] } }))}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', borderTop: '1px solid var(--border)', paddingTop: '1.1rem' }}>
          <button type="button" style={btnGhost} onClick={() => setShowGrid(true)}>Question grid ({answeredCount}/{mod.questions.length})</button>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" style={{ ...btnGhost, opacity: qIdx === 0 ? 0.5 : 1 }} disabled={qIdx === 0} onClick={() => goTo(qIdx - 1)}><ChevronLeft size={15} /> Back</button>
            {qIdx < mod.questions.length - 1 ? (
              <button type="button" style={btnPrimary} onClick={() => goTo(qIdx + 1)}>Next <ChevronRight size={15} /></button>
            ) : (
              <button type="button" style={btnPrimary} onClick={() => { bankTime(); setPhase('review'); }}>Review module <Check size={15} /></button>
            )}
          </div>
        </div>

        {showGrid && (
          <div role="dialog" aria-label="Question grid" onClick={() => setShowGrid(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'grid', placeItems: 'center', zIndex: 1000, padding: 16 }}>
            <div className="panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560, width: '100%', padding: '1.6rem', background: 'var(--surface)' }}>
              <h3 style={{ marginTop: 0 }}>{mod.title}</h3>
              <div className="sat-qgrid">
                {mod.questions.map((q, i) => (
                  <button key={q.questionId} type="button" data-answered={!!answers[keyOf(mod, q)]?.trim()} data-current={i === qIdx} onClick={() => goTo(i)}>
                    {i + 1}{flags[keyOf(mod, q)] && <span className="flag" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {showCalc && <DesmosPanel onClose={() => setShowCalc(false)} questionId={question?.questionId} />}
        <SATReferenceGuideModal isOpen={showRef} onClose={() => setShowRef(false)} defaultTab={mod.section === 'math' ? 'math' : 'english'} />
      </div>
    );
  }

  // ================= REPORT =================
  if (phase === 'report' && report) {
    const domains = history0?.domains || {};
    const range = (r: [number, number]) => `${r[0]}–${r[1]}`;
    return (
      <div style={{ maxWidth: 860, margin: '2rem auto', paddingBottom: '4rem' }}>
        <span className="section-label">SCORE REPORT</span>
        <h1 style={{ fontSize: '2.4rem', marginBottom: '0.4rem' }}>Your estimated SAT score</h1>
        <p style={{ color: 'var(--muted)', marginBottom: '1.8rem', fontSize: '0.9rem' }}>
          An estimate from a model of the Digital SAT's adaptive scoring; your real score can differ by roughly ±30 points per section.
        </p>

        {/* Mode & Projected Accuracy Banner */}
        {report.equivalentAdaptiveAccuracy && (
          <div
            className="panel"
            style={{
              padding: '1.25rem 1.5rem',
              marginBottom: '1.5rem',
              background: 'rgba(37, 99, 235, 0.05)',
              border: '1.5px solid rgba(37, 99, 235, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.4rem', flexWrap: 'wrap' }}>
              <span className="section-label" style={{ margin: 0, color: 'var(--accent)' }}>
                DIFFICULTY-ADJUSTED IRT CALIBRATION
              </span>
              <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', background: 'var(--accent)', color: '#fff', padding: '1px 6px', borderRadius: 4 }}>
                {report.difficultyMode ? report.difficultyMode.toUpperCase().replace('_', ' ') : 'ADAPTIVE'}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem', fontSize: '0.88rem', color: 'var(--ink)' }}>
              <div>
                <strong>Reading &amp; Writing:</strong> {report.equivalentAdaptiveAccuracy.rw}
              </div>
              <div>
                <strong>Math:</strong> {report.equivalentAdaptiveAccuracy.math}
              </div>
            </div>
          </div>
        )}

        <div className="panel" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ textAlign: 'center' }}>
            <span className="tech-label">TOTAL</span>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '4.2rem', fontWeight: 700, lineHeight: 1.1 }}>{report.totalScore}</div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--muted)' }}>400–1600 · about {ord(report.percentile)} percentile</span>
          </div>
          {[['READING & WRITING', report.rwScore, report.rwRange, report.rwCorrect, report.totalRW, tiers.rw], ['MATH', report.mathScore, report.mathRange, report.mathCorrect, report.totalMath, tiers.math]].map(([label, sc, rg, c, t, tier]) => (
            <div key={label as string} style={{ textAlign: 'center' }}>
              <span className="tech-label">{label as string}</span>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 600, color: 'var(--accent)' }}>{sc as number}</div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--muted)' }}>
                {range(rg as [number, number])} · {c as number}/{t as number} correct{tier ? ` · ${tier === 'hard' ? 'harder' : 'easier'} Module 2` : ''}
              </span>
            </div>
          ))}
        </div>

        {Object.keys(domains).length > 0 && (
          <div className="panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ marginTop: 0 }}>Where you lost points</h3>
            {Object.entries(domains).sort((a, b) => a[1][0] / a[1][1] - b[1][0] / b[1][1]).map(([d, [c, t]]) => (
              <div key={d} style={{ marginBottom: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                  <span>{d}</span><span style={{ fontFamily: 'var(--font-mono)' }}>{c}/{t}</span>
                </div>
                <div style={{ height: 8, background: 'var(--surface-inset)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${(c / t) * 100}%`, height: '100%', background: c / t >= 0.75 ? '#059669' : c / t >= 0.5 ? '#d97706' : '#dc2626' }} />
                </div>
              </div>
            ))}
            <p style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: '0.8rem 0 0' }}>Unscored trial questions are excluded.</p>
          </div>
        )}

        <div className="panel" style={{ padding: '1.2rem 1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: '0.9rem' }}>{rows.filter((r) => !r.correct).length} missed questions were saved to your Mistake Vault.</span>
          <Link href="/sat/practice/drill?mode=mistakes" style={{ ...btnPrimary, textDecoration: 'none' }}>Drill mistakes <ArrowRight size={14} /></Link>
        </div>

        <h3>Review every question</h3>
        <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', flexWrap: 'wrap' }}>
          {(['wrong', 'flagged', 'all'] as const).map((f) => (
            <button key={f} type="button" onClick={() => setReviewFilter(f)} style={{ ...btnGhost, fontWeight: reviewFilter === f ? 700 : 400, borderColor: reviewFilter === f ? 'var(--ink)' : 'var(--border)' }}>
              {f === 'wrong' ? `Incorrect (${rows.filter((r) => !r.correct).length})` : f === 'flagged' ? `Marked (${rows.filter((r) => r.flagged).length})` : `All (${rows.length})`}
            </button>
          ))}
        </div>
        {rowsShown.length === 0 && <p style={{ color: 'var(--muted)' }}>Nothing in this view.</p>}
        {rowsShown.map((r) => {
          const id = `${r.module.id}_${r.q.questionId}`;
          const open = openRow === id;
          const idx = r.module.questions.findIndex((x) => x.questionId === r.q.questionId) + 1;
          return (
            <div key={id} className="panel" style={{ marginBottom: 10, padding: 0 }}>
              <button type="button" onClick={() => setOpenRow(open ? null : id)} aria-expanded={open}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '0.85rem 1.1rem', background: 'none', border: 'none', color: 'var(--ink)', cursor: 'pointer', textAlign: 'left', font: 'inherit' }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', display: 'grid', placeItems: 'center', background: r.correct ? '#059669' : '#dc2626', color: '#fff', fontSize: 12, flexShrink: 0 }}>{r.correct ? '✓' : '✕'}</span>
                <span style={{ flex: 1, fontSize: '0.88rem' }}>
                  <strong>{r.module.title} · Q{idx}</strong> · {r.q.skill} · {r.q.difficulty}
                  {r.q.pretest && <span style={{ marginLeft: 8, fontSize: '0.72rem', padding: '1px 6px', borderRadius: 4, background: 'var(--surface-inset)' }}>unscored</span>}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--muted)' }}>{r.seconds}s</span>
              </button>
              {open && (
                <div style={{ padding: '0.5rem 1.4rem 1.4rem', borderTop: '1px solid var(--border)' }}>
                  <div style={{ margin: '1rem 0' }}>
                    <QuestionBody q={r.q} answer={r.answer} onAnswer={() => {}} reveal struck={{}} onStrike={() => {}} split={false} />
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.84rem', marginBottom: '0.8rem' }}>
                    Your answer: <strong>{r.answer || 'blank'}</strong> · Correct: <strong>{formatCorrectAnswer(r.q)}</strong>
                  </div>
                  <Rationale q={r.q} />
                </div>
              )}
            </div>
          );
        })}

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', margin: '2rem 0' }}>
          <button type="button" style={btnPrimary} onClick={() => { setPhase('intro'); setReport(null); }}>Take another test</button>
          <Link href="/sat/practice/drill" style={{ ...btnGhost, textDecoration: 'none' }}>Targeted practice</Link>
        </div>

        {history.length > 1 && (
          <div className="panel" style={{ padding: '1.4rem' }}>
            <h3 style={{ marginTop: 0 }}>Your last {Math.min(5, history.length)} tests</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', fontFamily: 'var(--font-mono)' }}>
              <thead><tr style={{ textAlign: 'left', color: 'var(--muted)' }}><th>Date</th><th>Total</th><th>R&amp;W</th><th>Math</th></tr></thead>
              <tbody>
                {history.slice(0, 5).map((h) => (
                  <tr key={h.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.5rem 0' }}>{h.date}</td><td style={{ fontWeight: 700, color: 'var(--accent)' }}>{h.totalScore}</td><td>{h.rwScore}</td><td>{h.mathScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted)' }}>Loading…</div>;
}
