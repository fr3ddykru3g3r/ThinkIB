'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Concept } from '@/lib/amc12-core';
import { Tex } from '../shared';
import { card } from '../styles';

const KEY = 'thinkib:amc12-lessons-read';

function readSet(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

export default function ConceptCard({ concept, index, topicId, practiceCount }: {
  concept: Concept; index: number; topicId: string; practiceCount: number;
}) {
  const id = `${topicId}:${index}`;
  const [read, setRead] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  useEffect(() => setRead(!!readSet()[id]), [id]);

  const toggleRead = () => {
    const next = !read;
    setRead(next);
    try {
      localStorage.setItem(KEY, JSON.stringify({ ...readSet(), [id]: next }));
    } catch {
      // storage unavailable: the tick just isn't remembered
    }
  };

  return (
    <article id={`concept-${index}`} style={{ ...card, scrollMarginTop: 90 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'baseline' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 500, lineHeight: 1.15 }}>
          <span style={{ color: 'var(--accent)', marginRight: 8 }}>{index + 1}.</span><Tex>{concept.title}</Tex>
        </h2>
        <button
          onClick={toggleRead}
          aria-pressed={read}
          className="btn btn-ref-outline"
          style={{ flexShrink: 0, padding: '0.3rem 0.7rem', fontSize: '0.78rem', color: read ? 'var(--success)' : undefined }}
        >
          {read ? '✓ Read' : 'Mark read'}
        </button>
      </div>

      <Tex block style={{ lineHeight: 1.75, marginTop: '0.8rem' }}>{concept.body}</Tex>

      <div style={{ background: 'var(--surface-inset)', borderRadius: 'var(--radius-md)', padding: '0.9rem 1.1rem', marginTop: '1.1rem' }}>
        <div className="tech-label" style={{ fontSize: '0.7rem', color: 'var(--muted)', marginBottom: 6 }}>KEY FACTS</div>
        <ul style={{ paddingLeft: '1.1rem', display: 'grid', gap: 6 }}>
          {concept.keyFacts.map((f, j) => <li key={j}><Tex>{f}</Tex></li>)}
        </ul>
      </div>

      <p style={{ marginTop: '0.9rem', fontSize: '0.92rem', color: 'var(--muted)' }}>
        <strong style={{ color: 'var(--ink)' }}>Spot it: </strong><Tex>{concept.whenToUse}</Tex>
      </p>

      {concept.commonMistakes.length > 0 && (
        <div style={{ marginTop: '0.9rem', padding: '0.8rem 1.1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(194,65,12,0.3)', background: 'rgba(194,65,12,0.05)' }}>
          <div className="tech-label" style={{ fontSize: '0.7rem', color: 'var(--accent)', marginBottom: 6 }}>COMMON MISTAKES</div>
          <ul style={{ paddingLeft: '1.1rem', display: 'grid', gap: 6, fontSize: '0.92rem' }}>
            {concept.commonMistakes.map((m, j) => <li key={j}><Tex>{m}</Tex></li>)}
          </ul>
        </div>
      )}

      <div style={{ marginTop: '1.1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
        <div className="tech-label" style={{ fontSize: '0.7rem', color: 'var(--muted)', marginBottom: 6 }}>TRY IT</div>
        <Tex block style={{ lineHeight: 1.7 }}>{concept.example.problem}</Tex>
        {showSolution ? (
          <div style={{ marginTop: '0.8rem', padding: '0.8rem 1rem', borderRadius: 'var(--radius-md)', background: 'var(--success-soft)' }}>
            <Tex block style={{ lineHeight: 1.7 }}>{concept.example.solution}</Tex>
            <p style={{ marginTop: 8 }}><strong>Answer: </strong><Tex>{concept.example.answer}</Tex></p>
          </div>
        ) : (
          <button className="btn btn-ref-outline" style={{ marginTop: '0.8rem' }} onClick={() => setShowSolution(true)}>Show solution</button>
        )}
      </div>

      {practiceCount > 0 && (
        <p style={{ marginTop: '1rem', fontSize: '0.88rem' }}>
          <Link href={`/amc12/practice?mode=topic&t=${topicId}&c=${index}`} style={{ color: 'var(--accent)' }}>
            Practise this lesson ({practiceCount} {practiceCount === 1 ? 'problem' : 'problems'}) →
          </Link>
        </p>
      )}
    </article>
  );
}
