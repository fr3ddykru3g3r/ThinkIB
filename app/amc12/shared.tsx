'use client';

import React, { useEffect, useState } from 'react';
import MathView from '../components/MathView';

/** Math-aware text for AMC content: money is written `\$`, plain text is escaped. */
export function Tex({ children, block = false, style }: { children: string; block?: boolean; style?: React.CSSProperties }) {
  if (!block) return <MathView content={children} currency={false} escapeHtml style={style} />;
  return (
    <div style={style}>
      {children.split(/\n\s*\n/).map((para, i) => (
        <p key={i} style={{ margin: i ? '0.85em 0 0' : 0 }}>
          <MathView content={para} currency={false} escapeHtml />
        </p>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Progress: last result per problem id, kept in this browser only.
// ---------------------------------------------------------------------------

export type Result = 'correct' | 'wrong';
const KEY = 'thinkib:amc12-progress';

export function readProgress(): Record<string, Result> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

export function recordResults(results: Record<string, Result>) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...readProgress(), ...results }));
  } catch {
    // storage unavailable (private mode): progress just isn't saved
  }
}

export function useProgress() {
  const [progress, setProgress] = useState<Record<string, Result>>({});
  useEffect(() => setProgress(readProgress()), []);
  return progress;
}

export function TopicProgress({ ids }: { ids: string[] }) {
  const progress = useProgress();
  const solved = ids.filter((id) => progress[id] === 'correct').length;
  const attempted = ids.filter((id) => progress[id]).length;
  const pct = Math.round((solved / ids.length) * 100);
  return (
    <div>
      <div style={{ height: 4, borderRadius: 4, background: 'var(--surface-inset)', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--success)', transition: 'width .4s' }} />
      </div>
      <div className="tech-label" style={{ marginTop: 6, fontSize: '0.7rem', color: 'var(--muted)' }}>
        {attempted ? `${solved}/${ids.length} solved` : `${ids.length} problems`}
      </div>
    </div>
  );
}
