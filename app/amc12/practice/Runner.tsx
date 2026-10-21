'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { Letter, Problem } from '@/lib/amc12-core';
import { LETTERS, DIFFICULTY_LABELS, amcScore } from '@/lib/amc12-core';
import { Tex, recordResults, type Result } from '../shared';
import { card, pill } from '../styles';

type Kind = 'topic' | 'mixed' | 'mock';

interface Props {
  title: string;
  kind: Kind;
  problems: Problem[];
  backHref: string;
  nextHref?: string;
  timeLimitSec?: number;
  topicTitles: Record<string, string>;
}


function fmtTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function Runner({ title, kind, problems, backHref, nextHref, timeLimitSec, topicTitles }: Props) {
  const topicTitle = (id: string) => topicTitles[id] ?? id;
  const isMock = kind === 'mock';
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Letter>>({});
  // Practice modes check each answer immediately; mocks only at the end.
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [hints, setHints] = useState<Record<string, boolean>>({});
  const [finished, setFinished] = useState(false);
  const [left, setLeft] = useState(timeLimitSec ?? 0);

  const p = problems[i];

  useEffect(() => {
    if (!timeLimitSec || finished) return;
    const id = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [timeLimitSec, finished]);

  useEffect(() => {
    if (timeLimitSec && left === 0 && !finished) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left]);

  // Keyboard: A–E choose, ←/→ move, Enter checks
  useEffect(() => {
    if (finished) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.metaKey || e.ctrlKey) return;
      const k = e.key.toUpperCase();
      if ((LETTERS as string[]).includes(k)) choose(k as Letter);
      else if (e.key === 'ArrowRight') setI((x) => Math.min(problems.length - 1, x + 1));
      else if (e.key === 'ArrowLeft') setI((x) => Math.max(0, x - 1));
      else if (e.key === 'Enter' && !isMock && answers[p.id]) setChecked((c) => ({ ...c, [p.id]: true }));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  function choose(letter: Letter) {
    if (checked[p.id]) return;
    setAnswers((a) => {
      const next = { ...a };
      if (next[p.id] === letter && isMock) delete next[p.id]; // click again to leave blank
      else next[p.id] = letter;
      return next;
    });
  }

  function finish() {
    const results: Record<string, Result> = {};
    for (const q of problems) {
      if (answers[q.id]) results[q.id] = answers[q.id] === q.answer ? 'correct' : 'wrong';
    }
    recordResults(results);
    setFinished(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const stats = useMemo(() => {
    const correct = problems.filter((q) => answers[q.id] === q.answer).length;
    const blank = problems.filter((q) => !answers[q.id]).length;
    return { correct, blank, wrong: problems.length - correct - blank };
  }, [answers, problems]);

  if (finished) return <Review {...{ title, kind, problems, answers, stats, backHref, nextHref, topicTitle }} />;

  const answered = Object.keys(answers).length;
  const isChecked = !!checked[p.id];
  const chosen = answers[p.id];

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        <div>
          <Link href={backHref} className="tech-label" style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>← Back</Link>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 500 }}>{title}</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {timeLimitSec ? (
            <span style={{ ...pill, fontSize: '0.95rem', color: left < 300 ? 'var(--accent)' : 'var(--ink)' }} aria-live="polite">
              ⏱ {fmtTime(left)}
            </span>
          ) : null}
          <span style={pill}>{answered}/{problems.length} answered</span>
        </div>
      </div>

      {/* Question navigator */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '1.25rem' }}>
        {problems.map((q, j) => {
          const state = !isMock && checked[q.id] ? (answers[q.id] === q.answer ? 'right' : 'wrong') : answers[q.id] ? 'done' : 'todo';
          const bg = { right: 'var(--success-soft)', wrong: 'rgba(194,65,12,0.12)', done: 'var(--surface-inset)', todo: 'transparent' }[state];
          return (
            <button
              key={q.id}
              onClick={() => setI(j)}
              aria-label={`Question ${j + 1}`}
              aria-current={j === i}
              style={{
                width: 34, height: 34, borderRadius: 8, fontFamily: 'var(--font-mono)', fontSize: '0.8rem', cursor: 'pointer',
                border: j === i ? '1.5px solid var(--accent)' : '1px solid var(--border)', background: bg, color: 'var(--ink)',
              }}
            >
              {j + 1}
            </button>
          );
        })}
      </div>

      <article style={card}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.9rem' }}>
          <span style={pill}>Problem {i + 1}</span>
          <span style={pill}>{DIFFICULTY_LABELS[p.difficulty]}</span>
          {kind !== 'topic' && !isMock && <span style={pill}>{topicTitle(p.topicId)}</span>}
        </div>
        <Tex block style={{ fontSize: '1.05rem', lineHeight: 1.75 }}>{p.problem}</Tex>

        <div role="radiogroup" style={{ display: 'grid', gap: '0.5rem', marginTop: '1.25rem' }}>
          {p.choices.map((c, j) => {
            const L = LETTERS[j];
            const isAns = isChecked && L === p.answer;
            const isWrongPick = isChecked && L === chosen && L !== p.answer;
            return (
              <button
                key={L}
                role="radio"
                aria-checked={chosen === L}
                onClick={() => choose(L)}
                disabled={isChecked}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.9rem', textAlign: 'left', padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)', cursor: isChecked ? 'default' : 'pointer', font: 'inherit', color: 'var(--ink)',
                  border: `1.5px solid ${isAns ? 'var(--success)' : isWrongPick ? 'var(--accent)' : chosen === L ? 'var(--ink)' : 'var(--border)'}`,
                  background: isAns ? 'var(--success-soft)' : isWrongPick ? 'rgba(194,65,12,0.08)' : chosen === L ? 'var(--surface-inset)' : 'var(--surface)',
                }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, minWidth: '1.6rem' }}>({L})</span>
                <Tex>{c}</Tex>
              </button>
            );
          })}
        </div>

        {!isMock && hints[p.id] && !isChecked && (
          <div style={{ marginTop: '1rem', padding: '0.8rem 1rem', borderRadius: 'var(--radius-md)', background: 'var(--surface-inset)' }}>
            <strong>Hint: </strong><Tex>{p.hint}</Tex>
          </div>
        )}

        {isChecked && (
          <div style={{ marginTop: '1rem', padding: '1rem 1.1rem', borderRadius: 'var(--radius-md)', background: chosen === p.answer ? 'var(--success-soft)' : 'var(--surface-inset)' }}>
            <strong style={{ display: 'block', marginBottom: 6 }}>
              {chosen === p.answer ? '✓ Correct.' : `✗ The answer is (${p.answer}).`}
            </strong>
            <Tex block style={{ lineHeight: 1.7 }}>{p.solution}</Tex>
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1.25rem', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {!isMock && !isChecked && (
              <button className="btn btn-ref-primary" disabled={!chosen} onClick={() => setChecked({ ...checked, [p.id]: true })}>Check</button>
            )}
            {!isMock && !isChecked && !hints[p.id] && (
              <button className="btn btn-ref-outline" onClick={() => setHints({ ...hints, [p.id]: true })}>Hint</button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-ref-outline" disabled={i === 0} onClick={() => setI(i - 1)}>← Prev</button>
            {i < problems.length - 1 ? (
              <button className="btn btn-ref-outline" onClick={() => setI(i + 1)}>Next →</button>
            ) : (
              <button className="btn btn-ref-primary" onClick={finish}>{isMock ? 'Submit paper' : 'Finish'}</button>
            )}
          </div>
        </div>
      </article>
      <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginTop: '0.75rem' }}>
        Keys: A–E to choose{isMock ? ' (press again to clear)' : ', Enter to check'}, ←/→ to move.
        {isMock && ' Wrong answers score 0 and blanks 1.5, so leave a question blank unless you can eliminate choices.'}
      </p>
    </div>
  );
}

function Review({ title, kind, problems, answers, stats, backHref, nextHref, topicTitle }: {
  title: string; kind: Kind; problems: Problem[]; answers: Record<string, Letter>;
  stats: { correct: number; blank: number; wrong: number }; backHref: string; nextHref?: string;
  topicTitle: (id: string) => string;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const score = amcScore(stats.correct, stats.blank);
  const max = problems.length * 6;

  // Weakest topics from this attempt
  const byTopic = new Map<string, { right: number; total: number }>();
  for (const q of problems) {
    const t = byTopic.get(q.topicId) ?? { right: 0, total: 0 };
    t.total++;
    if (answers[q.id] === q.answer) t.right++;
    byTopic.set(q.topicId, t);
  }
  const weak = Array.from(byTopic.entries()).filter(([, t]) => t.right < t.total).sort((a, b) => a[1].right / a[1].total - b[1].right / b[1].total).slice(0, 3);

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', paddingBottom: '4rem' }}>
      <span className="section-label">Results</span>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 500, margin: '0.3rem 0 1rem' }}>{title}</h1>

      <div style={{ ...card, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', textAlign: 'center' }}>
        {kind === 'mock' && <Stat label="AMC score" value={`${score} / ${max}`} />}
        <Stat label="Correct" value={stats.correct} color="var(--success)" />
        <Stat label="Wrong" value={stats.wrong} color="var(--accent)" />
        <Stat label="Blank" value={stats.blank} />
      </div>

      {kind !== 'topic' && weak.length > 0 && (
        <div style={{ ...card, marginTop: '1rem' }}>
          <strong>Review next:</strong>{' '}
          {weak.map(([id, t], j) => (
            <span key={id}>
              {j > 0 && ' · '}
              <Link href={`/amc12/${id}`} style={{ color: 'var(--accent)' }}>{topicTitle(id)}</Link> ({t.right}/{t.total})
            </span>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gap: '0.5rem', marginTop: '1.5rem' }}>
        {problems.map((q, j) => {
          const a = answers[q.id];
          const mark = !a ? '–' : a === q.answer ? '✓' : '✗';
          const color = !a ? 'var(--muted)' : a === q.answer ? 'var(--success)' : 'var(--accent)';
          return (
            <div key={q.id} style={{ ...card, padding: '0.9rem 1.1rem' }}>
              <button
                onClick={() => setOpen(open === q.id ? null : q.id)}
                aria-expanded={open === q.id}
                style={{ display: 'flex', width: '100%', gap: '0.9rem', alignItems: 'center', background: 'none', border: 0, font: 'inherit', color: 'var(--ink)', cursor: 'pointer', textAlign: 'left' }}
              >
                <span style={{ color, fontWeight: 700, width: '1rem' }}>{mark}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', width: '2rem' }}>{j + 1}</span>
                <span style={{ flex: 1, color: 'var(--muted)', fontSize: '0.9rem' }}>
                  {topicTitle(q.topicId)} · you: {a ?? 'blank'} · answer: {q.answer}
                </span>
                <span style={{ color: 'var(--muted)' }}>{open === q.id ? '−' : '+'}</span>
              </button>
              {open === q.id && (
                <div style={{ marginTop: '0.9rem', borderTop: '1px solid var(--border)', paddingTop: '0.9rem', lineHeight: 1.7 }}>
                  <Tex block>{q.problem}</Tex>
                  <p style={{ margin: '0.6rem 0', fontSize: '0.92rem' }}>
                    {q.choices.map((c, k) => (
                      <span key={k} style={{ marginRight: '1rem', fontWeight: LETTERS[k] === q.answer ? 700 : 400 }}>
                        ({LETTERS[k]}) <Tex>{c}</Tex>
                      </span>
                    ))}
                  </p>
                  <Tex block>{q.solution}</Tex>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
        <Link href={backHref} className="btn btn-ref-outline">Done</Link>
        {nextHref && <Link href={nextHref} className="btn btn-ref-primary">New set →</Link>}
        <button className="btn btn-ref-outline" onClick={() => window.location.reload()}>Retry</button>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: React.ReactNode; color?: string }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color }}>{value}</div>
      <div className="tech-label" style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{label}</div>
    </div>
  );
}
