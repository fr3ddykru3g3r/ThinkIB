'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { TOPICS, getTopic, buildMock, buildMixed, MOCK_COUNT } from '@/lib/amc12';
import { DIFFICULTY_LABELS } from '@/lib/amc12-core';
import Runner from './Runner';

const topicTitles = Object.fromEntries(TOPICS.map((t) => [t.id, t.title]));



function PracticeContent() {
  const searchParams = Object.fromEntries(useSearchParams().entries());
  const mode = searchParams.mode ?? 'mixed';

  if (mode === 'topic') {
    const topic = getTopic(searchParams.t ?? '');
    if (topic) {
      const min = parseInt(searchParams.min ?? '1', 10) || 1;
      const max = parseInt(searchParams.max ?? '5', 10) || 5;
      const concept = searchParams.c !== undefined ? parseInt(searchParams.c, 10) : NaN;
      let problems = topic.problems.filter((p) => p.difficulty >= min && p.difficulty <= max);
      let label = topic.title;
      if (!Number.isNaN(concept) && topic.concepts[concept]) {
        problems = problems.filter((p) => p.concepts.includes(concept));
        label = `${topic.title}: ${topic.concepts[concept].title}`;
      } else if (min > 1 || max < 5) {
        label = `${topic.title} (${min === max ? DIFFICULTY_LABELS[min].split(' · ')[0] : `levels ${min}–${max}`})`;
      }
      problems = [...problems].sort((a, b) => a.difficulty - b.difficulty);
      if (problems.length > 0) {
        return <Runner topicTitles={topicTitles} key={`${topic.id}-${min}-${max}-${searchParams.c ?? ''}`} title={label} kind="topic" backHref={`/amc12/${topic.id}`} problems={problems} />;
      }
    }
  }

  if (mode === 'mock') {
    const n = Math.min(MOCK_COUNT, Math.max(1, parseInt(searchParams.n ?? '1', 10) || 1));
    return <Runner topicTitles={topicTitles} key={`mock-${n}`} title={`Mock paper ${n}`} kind="mock" backHref="/amc12" problems={buildMock(n)} timeLimitSec={75 * 60} />;
  }

  if (mode === 'mixed') {
    const seed = parseInt(searchParams.seed ?? '', 10) || 1;
    return (
      <Runner topicTitles={topicTitles} key={`mixed-${seed}`} title="Mixed drill" kind="mixed" backHref="/amc12" problems={buildMixed(10, seed)} nextHref={`/amc12/practice?mode=mixed&seed=${seed + 1}`} />
    );
  }

  return (
    <div style={{ textAlign: 'center', padding: '4rem 0' }}>
      <p>That practice set doesn&apos;t exist.</p>
      <Link href="/amc12" className="btn btn-ref-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>Back to AMC 12</Link>
    </div>
  );
}

export default function PracticePage() { return <Suspense fallback={<p>Loading practice…</p>}><PracticeContent/></Suspense>; }
