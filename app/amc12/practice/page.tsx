import Link from 'next/link';
import { TOPICS, getTopic, buildMock, buildMixed, MOCK_COUNT } from '@/lib/amc12';
import Runner from './Runner';

const topicTitles = Object.fromEntries(TOPICS.map((t) => [t.id, t.title]));

export const metadata = { title: 'AMC 12 Practice | The Archive' };

export default function PracticePage({ searchParams }: { searchParams: { mode?: string; t?: string; n?: string; seed?: string } }) {
  const mode = searchParams.mode ?? 'mixed';

  if (mode === 'topic') {
    const topic = getTopic(searchParams.t ?? '');
    if (topic) {
      const problems = [...topic.problems].sort((a, b) => a.difficulty - b.difficulty);
      return <Runner topicTitles={topicTitles} key={topic.id} title={topic.title} kind="topic" backHref={`/amc12/${topic.id}`} problems={problems} />;
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
