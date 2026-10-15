'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight, RotateCcw, Sparkles, BookOpen, Printer, Lightbulb, Calculator, CheckCircle2, XCircle } from 'lucide-react';
import type { SATQuestion } from '@/lib/sat-types';
import { isAnswerCorrect, formatCorrectAnswer, isSPR, validateSPR } from '@/lib/sat-grading';
import { getSocraticHints } from '@/lib/socratic-hints';
import { getDesmosShortcutForQuestion } from '@/lib/desmos-shortcuts';
import { recordAttempts, saveMistake, getMistakeVault, markMistakeMastered, removeMistake, clearMistakeVault, MistakeEntry, updateMistakeErrorTag, SatErrorTag } from '@/lib/sat-storage';
import QuestionBody from '@/app/components/sat/QuestionBody';
import { Rationale } from '@/app/components/sat/SATContent';
import DesmosPanel, { dispatchDesmosLoad } from '@/app/components/sat/DesmosPanel';
import SATReferenceGuideModal from '@/app/components/SATReferenceGuideModal';
import PrintableWorksheetModal from '@/app/components/PrintableWorksheetModal';

interface Facet { domain: string; count: number; skills: { skill: string; count: number }[] }
type Section = 'reading-writing' | 'math';

export default function DrillPage() {
  const [mode, setMode] = useState<'standard' | 'mistakes'>('standard');
  const [section, setSection] = useState<Section>('reading-writing');
  const [domain, setDomain] = useState('');
  const [skill, setSkill] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [type, setType] = useState('');
  const [facets, setFacets] = useState<{ rw: Facet[]; math: Facet[] }>({ rw: [], math: [] });

  const [questions, setQuestions] = useState<SATQuestion[]>([]);
  const [total, setTotal] = useState(0);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const [vault, setVault] = useState<MistakeEntry[]>([]);

  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState(false);
  const [struck, setStruck] = useState<Record<string, boolean>>({});
  const [hintLevel, setHintLevel] = useState(0);
  const [showStrategy, setShowStrategy] = useState(false);
  const [showCalc, setShowCalc] = useState(false);
  const [showRef, setShowRef] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [answered, setAnswered] = useState(0);

  const [errorTag, setErrorTag] = useState<SatErrorTag | null>(null);

  const resetQuestionState = () => {
    setAnswer('');
    setChecked(false);
    setStruck({});
    setHintLevel(0);
    setShowStrategy(false);
    setErrorTag(null);
  };

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    if (sp.get('mode') === 'mistakes') setMode('mistakes');
    const sec = sp.get('section');
    if (sec === 'math' || sec === 'reading-writing') setSection(sec);
    if (sp.get('domain')) setDomain(sp.get('domain')!);
    if (sp.get('skill')) setSkill(sp.get('skill')!);
    setVault(getMistakeVault());
  }, []);

  useEffect(() => {
    const ctl = new AbortController();
    (async () => {
      setLoading(true);
      setError(null);
      setIdx(0);
      resetQuestionState();
      try {
        let url: string;
        if (mode === 'mistakes') {
          const v = getMistakeVault().filter((m) => m.section === section && !m.mastered);
          setVault(getMistakeVault());
          if (!v.length) {
            setQuestions([]);
            setTotal(0);
            setLoading(false);
            return;
          }
          url = `/api/sat/questions?ids=${v.slice(0, 100).map((m) => m.questionId).join(',')}`;
        } else {
          const p = new URLSearchParams({ section, limit: '40', randomize: 'true' });
          if (domain) p.set('domain', domain);
          if (skill) p.set('skill', skill);
          if (difficulty) p.set('difficulty', difficulty);
          if (type) p.set('type', type);
          url = `/api/sat/questions?${p}`;
        }
        const res = await fetch(url, { signal: ctl.signal });
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Could not load questions');
        setQuestions(data.questions || []);
        setTotal(data.total ?? data.questions?.length ?? 0);
        if (data.facets) setFacets(data.facets);
      } catch (e: any) {
        if (e.name !== 'AbortError') setError(e.message || 'Could not reach the question bank.');
      } finally {
        if (!ctl.signal.aborted) setLoading(false);
      }
    })();
    return () => ctl.abort();
  }, [mode, section, domain, skill, difficulty, type, reload]);

  const q = questions[idx] ?? null;
  const domainFacets = section === 'math' ? facets.math : facets.rw;
  const skillOptions = domainFacets.find((d) => d.domain === domain)?.skills ?? [];
  const hints = useMemo(() => (q ? getSocraticHints(q) : null), [q]);
  const shortcut = useMemo(() => (q && q.section === 'math' ? getDesmosShortcutForQuestion(q) : null), [q]);

  const canCheck = q ? (isSPR(q) ? validateSPR(answer).ok : !!answer) : false;

  const check = () => {
    if (!q || checked || !canCheck) return;
    setChecked(true);
    const ok = isAnswerCorrect(q, answer);
    setAnswered((n) => n + 1);
    recordAttempts([{ section: q.section || section, domain: q.domain, skill: q.skill, correct: ok }]);
    if (ok) {
      setCorrectCount((n) => n + 1);
      if (mode === 'mistakes') {
        markMistakeMastered(q.questionId, true);
        setVault(getMistakeVault());
      }
    } else {
      saveMistake({ questionId: q.questionId, section: q.section || section, domain: q.domain, skill: q.skill, difficulty: q.difficulty, correctAnswer: q.correctAnswer, userAnswer: answer });
      setVault(getMistakeVault());
    }
  };

  const move = useCallback((d: number) => {
    setIdx((i) => Math.min(Math.max(0, i + d), Math.max(0, questions.length - 1)));
    resetQuestionState();
  }, [questions.length]);

  // keyboard: A-D to choose, Enter to check / next
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (!q || (t && (t.tagName === 'INPUT' || t.tagName === 'SELECT'))) return;
      if (!checked && !isSPR(q) && /^[a-d]$/i.test(e.key)) setAnswer(e.key.toUpperCase());
      else if (e.key === 'Enter') (checked ? move(1) : check());
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, checked, answer, move]);

  const pill: React.CSSProperties = { padding: '0.45rem 0.8rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--ink)', fontSize: '0.82rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 };
  const primary: React.CSSProperties = { ...pill, background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: 600, padding: '0.65rem 1.4rem', fontSize: '0.9rem' };
  const vaultCount = (s: Section) => vault.filter((m) => m.section === s && !m.mastered).length;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: '5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: '1.2rem' }}>
        <Link href="/sat" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--muted)', textDecoration: 'none' }}>
          <ArrowLeft size={14} /> SAT portal
        </Link>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {questions.length > 0 && <button type="button" style={pill} onClick={() => setShowPrint(true)}><Printer size={13} /> Worksheet PDF ({questions.length})</button>}
          {answered > 0 && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--muted)' }}>
              Session: <strong style={{ color: 'var(--ink)' }}>{correctCount}/{answered}</strong> ({Math.round((correctCount / answered) * 100)}%)
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', borderBottom: '1px solid var(--border)', marginBottom: '1.2rem' }}>
        {([['standard', 'Practice by topic'], ['mistakes', `Mistake vault (${vault.filter((m) => !m.mastered).length})`]] as const).map(([m, label]) => (
          <button key={m} type="button" onClick={() => setMode(m)} className={`filter-btn ${mode === m ? 'active' : ''}`} style={{ fontSize: '0.92rem', paddingBottom: '0.6rem' }}>{label}</button>
        ))}
      </div>

      <div className="panel" style={{ padding: '1rem 1.2rem', marginBottom: '1.5rem', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        {(['reading-writing', 'math'] as const).map((s) => (
          <button key={s} type="button" className={`filter-btn ${section === s ? 'active' : ''}`} onClick={() => { setSection(s); setDomain(''); setSkill(''); }} style={{ fontSize: '0.88rem' }}>
            {s === 'math' ? 'Math' : 'Reading & Writing'}{mode === 'mistakes' ? ` (${vaultCount(s)})` : ''}
          </button>
        ))}
        {mode === 'standard' ? (
          <>
            <select className="select-input" aria-label="Domain" value={domain} onChange={(e) => { setDomain(e.target.value); setSkill(''); }} style={{ fontSize: '0.82rem' }}>
              <option value="">All domains</option>
              {domainFacets.map((d) => <option key={d.domain} value={d.domain}>{d.domain} ({d.count})</option>)}
            </select>
            {skillOptions.length > 0 && (
              <select className="select-input" aria-label="Skill" value={skill} onChange={(e) => setSkill(e.target.value)} style={{ fontSize: '0.82rem' }}>
                <option value="">All skills</option>
                {skillOptions.map((s) => <option key={s.skill} value={s.skill}>{s.skill} ({s.count})</option>)}
              </select>
            )}
            <select className="select-input" aria-label="Difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} style={{ fontSize: '0.82rem' }}>
              <option value="">Any difficulty</option><option>Easy</option><option>Medium</option><option>Hard</option>
            </select>
            {section === 'math' && (
              <select className="select-input" aria-label="Question type" value={type} onChange={(e) => setType(e.target.value)} style={{ fontSize: '0.82rem' }}>
                <option value="">Multiple choice + grid-in</option><option value="mcq">Multiple choice</option><option value="spr">Grid-in only</option>
              </select>
            )}
            <button type="button" style={pill} onClick={() => setReload((n) => n + 1)}><RotateCcw size={13} /> New set</button>
            <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{total.toLocaleString()} matching</span>
          </>
        ) : (
          vault.length > 0 && (
            <button type="button" style={{ ...pill, marginLeft: 'auto', color: 'var(--rust)' }} onClick={() => { if (confirm('Clear your whole mistake vault?')) { clearMistakeVault(); setVault([]); setQuestions([]); } }}>
              Clear vault
            </button>
          )
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--muted)' }}>Loading questions…</div>
      ) : error ? (
        <div className="panel" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <XCircle size={40} style={{ color: 'var(--rust)' }} />
          <h3>Couldn't load questions</h3>
          <p style={{ color: 'var(--muted)' }}>{error}</p>
          <button type="button" style={primary} onClick={() => setReload((n) => n + 1)}>Try again</button>
        </div>
      ) : !q ? (
        <div className="panel" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
          <h3>{mode === 'mistakes' ? 'Nothing left to review here' : 'No questions match these filters'}</h3>
          <p style={{ color: 'var(--muted)', maxWidth: 460, margin: '0.5rem auto 1.2rem' }}>
            {mode === 'mistakes' ? 'Questions you get wrong in drills and full tests land here until you answer them correctly.' : 'Try widening the domain, skill or difficulty.'}
          </p>
          <button type="button" style={primary} onClick={() => (mode === 'mistakes' ? setMode('standard') : (setDomain(''), setSkill(''), setDifficulty(''), setType('')))}>
            {mode === 'mistakes' ? 'Practice by topic' : 'Reset filters'}
          </button>
        </div>
      ) : (
        <div className="panel" style={{ padding: 'clamp(1.1rem, 3vw, 2.2rem)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', borderBottom: '1px solid var(--border)', paddingBottom: '0.9rem', marginBottom: '1.3rem', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Question {idx + 1} of {questions.length} · {q.questionId}</span>
            <span style={{ color: 'var(--muted)' }}>{q.domain} · {q.skill} · <strong style={{ color: q.difficulty === 'Hard' ? '#b91c1c' : q.difficulty === 'Medium' ? '#b45309' : '#047857' }}>{q.difficulty}</strong></span>
          </div>

          <QuestionBody key={q.questionId} q={q} answer={answer} onAnswer={setAnswer} reveal={checked} struck={struck} onStrike={(l) => setStruck((p) => ({ ...p, [l]: !p[l] }))} />

          {hintLevel > 0 && hints && !checked && (
            <div style={{ marginTop: '1.4rem', padding: '1rem 1.2rem', borderRadius: 10, background: 'rgba(245,158,11,0.09)', border: '1px solid rgba(245,158,11,0.35)', fontSize: '0.9rem', lineHeight: 1.55 }}>
              <div><strong>Hint 1 · {hints.level1Concept.title}.</strong> {hints.level1Concept.description}</div>
              {hintLevel > 1 && <div style={{ marginTop: 8 }}><strong>Hint 2 · {hints.level2Elimination.title}.</strong> {hints.level2Elimination.description}</div>}
              {hintLevel > 2 && <div style={{ marginTop: 8 }}><strong>Hint 3 · {hints.level3Setup.title}.</strong> {hints.level3Setup.firstStep}</div>}
              {hintLevel < 3 && <button type="button" style={{ ...pill, marginTop: 10 }} onClick={() => setHintLevel((l) => l + 1)}>Show next hint</button>}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center', borderTop: '1px solid var(--border)', marginTop: '1.6rem', paddingTop: '1.2rem' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" style={{ ...pill, opacity: idx === 0 ? 0.5 : 1 }} disabled={idx === 0} onClick={() => move(-1)}><ChevronLeft size={15} /> Previous</button>
              <button type="button" style={{ ...pill, opacity: idx >= questions.length - 1 ? 0.5 : 1 }} disabled={idx >= questions.length - 1} onClick={() => move(1)}>Next <ChevronRight size={15} /></button>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              {!checked && <button type="button" style={pill} onClick={() => setHintLevel((l) => Math.max(1, l))}><Lightbulb size={14} style={{ color: '#d97706' }} /> Hint</button>}
              {section === 'math' && <button type="button" style={pill} onClick={() => setShowCalc((v) => !v)}><Calculator size={14} /> Calculator</button>}
              <button type="button" style={pill} onClick={() => setShowRef(true)}><BookOpen size={14} /> Reference</button>
              {!checked ? (
                <button type="button" style={{ ...primary, opacity: canCheck ? 1 : 0.5, cursor: canCheck ? 'pointer' : 'not-allowed' }} disabled={!canCheck} onClick={check}>Check answer</button>
              ) : mode === 'mistakes' ? (
                <button type="button" style={pill} onClick={() => { removeMistake(q.questionId); setVault(getMistakeVault()); setQuestions((qs) => qs.filter((x) => x.questionId !== q.questionId)); resetQuestionState(); setIdx((i) => Math.max(0, Math.min(i, questions.length - 2))); }}>Remove from vault</button>
              ) : null}
            </div>
          </div>

          {checked && (
            <div style={{ marginTop: '1.6rem', padding: '1.3rem 1.5rem', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface-inset)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, marginBottom: '0.8rem', color: isAnswerCorrect(q, answer) ? '#059669' : '#dc2626' }}>
                {isAnswerCorrect(q, answer) ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                {isAnswerCorrect(q, answer) ? 'Correct' : `Not quite. The answer is ${formatCorrectAnswer(q)}`}
              </div>
              {!isAnswerCorrect(q, answer) && (
                <div style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px dashed var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted)' }}>Root cause:</span>
                  <button
                    type="button"
                    style={{ ...pill, fontSize: '0.78rem', background: errorTag === 'concept_gap' ? 'rgba(37,99,235,0.12)' : 'transparent', borderColor: errorTag === 'concept_gap' ? 'var(--accent)' : 'var(--border)' }}
                    onClick={() => { setErrorTag('concept_gap'); updateMistakeErrorTag(q.questionId, 'concept_gap'); }}
                  >
                    🧠 Concept Gap
                  </button>
                  <button
                    type="button"
                    style={{ ...pill, fontSize: '0.78rem', background: errorTag === 'examiner_trap' ? 'rgba(245,158,11,0.12)' : 'transparent', borderColor: errorTag === 'examiner_trap' ? '#f59e0b' : 'var(--border)' }}
                    onClick={() => { setErrorTag('examiner_trap'); updateMistakeErrorTag(q.questionId, 'examiner_trap'); }}
                  >
                    🪤 Examiner Trap
                  </button>
                  <button
                    type="button"
                    style={{ ...pill, fontSize: '0.78rem', background: errorTag === 'careless_calc' ? 'rgba(239,68,68,0.12)' : 'transparent', borderColor: errorTag === 'careless_calc' ? '#ef4444' : 'var(--border)' }}
                    onClick={() => { setErrorTag('careless_calc'); updateMistakeErrorTag(q.questionId, 'careless_calc'); }}
                  >
                    🔢 Careless Execution
                  </button>
                  <button
                    type="button"
                    style={{ ...pill, fontSize: '0.78rem', background: errorTag === 'time_pressure' ? 'rgba(130,80,223,0.12)' : 'transparent', borderColor: errorTag === 'time_pressure' ? '#8250df' : 'var(--border)' }}
                    onClick={() => { setErrorTag('time_pressure'); updateMistakeErrorTag(q.questionId, 'time_pressure'); }}
                  >
                    ⏱️ Time Pressure
                  </button>
                </div>
              )}
              <Rationale q={q} />
              {(hints?.examinerTrap?.explanation || shortcut) && (
                <div style={{ marginTop: '1rem' }}>
                  <button type="button" style={pill} onClick={() => setShowStrategy((v) => !v)}><Sparkles size={13} /> {showStrategy ? 'Hide' : 'Show'} test-taking strategy</button>
                  {showStrategy && (
                    <div style={{ marginTop: 10, fontSize: '0.88rem', lineHeight: 1.6 }}>
                      {hints?.examinerTrap?.explanation && <p style={{ margin: '0 0 8px' }}><strong>Watch for:</strong> {hints.examinerTrap.explanation}</p>}
                      {shortcut && (
                        <div style={{ margin: '8px 0 0', padding: '10px 12px', background: 'rgba(37,99,235,0.05)', borderRadius: 8, border: '1px solid rgba(37,99,235,0.15)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, flexWrap: 'wrap', gap: 6 }}>
                            <strong>{shortcut.title}:</strong>
                            <button
                              type="button"
                              style={{ ...pill, fontSize: '0.78rem', background: 'var(--accent)', color: '#fff', border: 'none' }}
                              onClick={() => {
                                setShowCalc(true);
                                dispatchDesmosLoad(shortcut.autoLoadExpressions);
                              }}
                            >
                              <Sparkles size={12} /> ⚡ Load in Desmos
                            </button>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.85rem' }}>{shortcut.proTip || shortcut.triggerPatternExplanation}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {showCalc && <DesmosPanel onClose={() => setShowCalc(false)} questionId={q?.questionId} />}
      <SATReferenceGuideModal isOpen={showRef} onClose={() => setShowRef(false)} defaultTab={section === 'math' ? 'math' : 'english'} />
      <PrintableWorksheetModal isOpen={showPrint} onClose={() => setShowPrint(false)} questions={questions}
        title={mode === 'mistakes' ? 'Mistake Review Worksheet' : `${section === 'math' ? 'Math' : 'Reading & Writing'} Practice Worksheet`}
        subtitle={domain ? `Domain: ${domain}${skill ? ` · ${skill}` : ''}` : 'Official College Board questions'} />
    </div>
  );
}
