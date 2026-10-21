'use client';

import { useState } from 'react';
import type { WorkedExample } from '@/lib/amc12-core';
import { LETTERS, DIFFICULTY_LABELS } from '@/lib/amc12-core';
import { Tex } from '../shared';
import { card, pill } from '../styles';

export default function WorkedExampleCard({ example, index }: { example: WorkedExample; index: number }) {
  const [shown, setShown] = useState(0);
  const done = shown >= example.steps.length;

  return (
    <article style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'baseline' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 500 }}>
          Example {index + 1}: {example.title}
        </h3>
        <span style={pill}>{DIFFICULTY_LABELS[example.difficulty]}</span>
      </div>
      <Tex block style={{ margin: '0.8rem 0', lineHeight: 1.7 }}>{example.problem}</Tex>
      <ol style={{ listStyle: 'none', display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1.25rem', fontSize: '0.95rem' }}>
        {example.choices.map((c, i) => (
          <li key={i} style={{ color: done && LETTERS[i] === example.answer ? 'var(--success)' : undefined, fontWeight: done && LETTERS[i] === example.answer ? 600 : undefined }}>
            <span style={{ fontFamily: 'var(--font-mono)', marginRight: 6 }}>({LETTERS[i]})</span><Tex>{c}</Tex>
          </li>
        ))}
      </ol>

      <details style={{ marginTop: '0.9rem' }}>
        <summary style={{ cursor: 'pointer', fontSize: '0.88rem', color: 'var(--accent)' }}>How do I start?</summary>
        <div style={{ marginTop: 6, color: 'var(--muted)', lineHeight: 1.65, fontSize: '0.92rem' }}><Tex block>{example.approach}</Tex></div>
      </details>

      {shown > 0 && (
        <ol style={{ margin: '1.1rem 0 0', paddingLeft: 0, listStyle: 'none', display: 'grid', gap: '0.7rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          {example.steps.slice(0, shown).map((s, i) => (
            <li key={i} style={{ display: 'grid', gridTemplateColumns: '1.8rem 1fr', lineHeight: 1.65 }}>
              <span className="tech-label" style={{ color: 'var(--accent)' }}>{i + 1}</span>
              <Tex>{s}</Tex>
            </li>
          ))}
        </ol>
      )}

      {done && (
        <div style={{ marginTop: '1rem', padding: '0.8rem 1rem', borderRadius: 'var(--radius-md)', background: 'var(--success-soft)' }}>
          <strong>Answer ({example.answer}).</strong> <Tex>{example.takeaway}</Tex>
        </div>
      )}

      {done && example.alternative && (
        <div style={{ marginTop: '0.9rem', padding: '0.8rem 1rem', borderRadius: 'var(--radius-md)', background: 'var(--surface-inset)' }}>
          <div className="tech-label" style={{ fontSize: '0.7rem', color: 'var(--muted)', marginBottom: 4 }}>ANOTHER WAY</div>
          <Tex block style={{ lineHeight: 1.65, fontSize: '0.95rem' }}>{example.alternative}</Tex>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        {!done && (
          <button className="btn btn-ref-primary" onClick={() => setShown(shown + 1)}>
            {shown === 0 ? 'Show first step' : `Next step (${shown + 1}/${example.steps.length})`}
          </button>
        )}
        {!done && <button className="btn btn-ref-outline" onClick={() => setShown(example.steps.length)}>Show full solution</button>}
        {shown > 0 && <button className="btn btn-ref-outline" onClick={() => setShown(0)}>Hide</button>}
      </div>
    </article>
  );
}
