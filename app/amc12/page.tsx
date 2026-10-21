import Link from 'next/link';
import { TOPICS, ALL_PROBLEMS, MOCK_COUNT } from '@/lib/amc12';
import { TopicProgress } from './shared';
import { card, pill } from './styles';

export const metadata = {
  title: 'AMC 12 — Learn & Practise | The Archive',
  description: 'AMC 12 concepts, worked examples, topic practice and timed 25-question mock papers.',
};

export default function AMC12Hub() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: '4rem' }}>
      <span className="section-label">Competition maths</span>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.4rem, 5vw, 3.4rem)', fontWeight: 500, lineHeight: 1.05, margin: '0.4rem 0 0.8rem' }}>
        AMC 12
      </h1>
      <p style={{ color: 'var(--muted)', maxWidth: 640, fontSize: '1.05rem' }}>
        Learn each topic from the ground up, study worked examples step by step, then practise by topic
        or sit a full timed paper. {ALL_PROBLEMS.length} original problems, each answer checked by computation.
      </p>

      {/* Practice modes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', margin: '2.25rem 0 3rem' }}>
        <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <span style={pill}>25 questions · 75 min</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 500 }}>Full mock paper</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.92rem', flex: 1 }}>
            Ordered easy → hard like the real contest, timed, scored 6 / 1.5 / 0.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {Array.from({ length: MOCK_COUNT }, (_, i) => (
              <Link key={i} href={`/amc12/practice?mode=mock&n=${i + 1}`} className={`btn ${i === 0 ? 'btn-ref-primary' : 'btn-ref-outline'}`}>
                Mock {i + 1}
              </Link>
            ))}
          </div>
        </div>
        <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <span style={pill}>10 questions · untimed</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 500 }}>Mixed drill</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.92rem', flex: 1 }}>
            A random set across every topic, with hints and instant feedback.
          </p>
          <div>
            <Link href="/amc12/practice?mode=mixed" className="btn btn-ref-primary">Start drill</Link>
          </div>
        </div>
        <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <span style={pill}>Past papers</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 500 }}>Official contests</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.92rem', flex: 1 }}>
            Real AMC 12 papers with community solutions on the AoPS wiki. Do them timed once you finish the mocks.
          </p>
          <div>
            <a href="https://artofproblemsolving.com/wiki/index.php/AMC_12_Problems_and_Solutions" target="_blank" rel="noreferrer" className="btn btn-ref-outline">
              Open AoPS archive ↗
            </a>
          </div>
        </div>
      </div>

      {/* Topics */}
      <span className="section-label">Topics</span>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', marginTop: '0.75rem' }}>
        {TOPICS.map((t, i) => (
          <Link key={t.id} href={`/amc12/${t.id}`} style={{ ...card, display: 'flex', flexDirection: 'column', gap: '0.6rem' }} className="amc-topic-card">
            <span className="tech-label" style={{ color: 'var(--accent)', fontSize: '0.72rem' }}>{String(i + 1).padStart(2, '0')}</span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', fontWeight: 500, lineHeight: 1.15 }}>{t.title}</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.88rem', flex: 1 }}>{t.summary}</p>
            <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
              {t.concepts.length} lessons · {t.workedExamples.length} examples · {t.problems.length} problems{t.videos.length ? ` · ${t.videos.length} videos` : ''}
            </span>
            <TopicProgress ids={t.problems.map((p) => p.id)} />
          </Link>
        ))}
      </div>
    </div>
  );
}
