import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TOPICS, getTopic, DIFFICULTY_LABELS } from '@/lib/amc12';
import { Tex, TopicProgress } from '../shared';
import { card, pill } from '../styles';
import WorkedExampleCard from './WorkedExampleCard';

export function generateStaticParams() {
  return TOPICS.map((t) => ({ topic: t.id }));
}

export function generateMetadata({ params }: { params: { topic: string } }) {
  const t = getTopic(params.topic);
  return { title: t ? `${t.title} — AMC 12 | The Archive` : 'AMC 12 | The Archive' };
}

export default function TopicPage({ params }: { params: { topic: string } }) {
  const topic = getTopic(params.topic);
  if (!topic) notFound();
  const idx = TOPICS.indexOf(topic);
  const next = TOPICS[idx + 1];
  const counts = [1, 2, 3, 4, 5].map((d) => topic.problems.filter((p) => p.difficulty === d).length);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '2.5rem', maxWidth: 860, margin: '0 auto', paddingBottom: '4rem' }}>
      <header>
        <Link href="/amc12" className="tech-label" style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>← AMC 12 topics</Link>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', fontWeight: 500, lineHeight: 1.05, margin: '0.75rem 0 0.6rem' }}>
          {topic.title}
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '1.05rem' }}>{topic.summary}</p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', margin: '1rem 0 1.25rem' }}>
          <span style={pill}>{topic.examWeight}</span>
          <span style={pill}>{topic.concepts.length} lessons</span>
          <span style={pill}>{topic.problems.length} practice problems</span>
        </div>
        <nav aria-label="On this page" style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.9rem' }}>
          <a href="#concepts" style={{ color: 'var(--accent)' }}>1 · Concepts</a>
          <a href="#examples" style={{ color: 'var(--accent)' }}>2 · Worked examples</a>
          <a href="#practice" style={{ color: 'var(--accent)' }}>3 · Practice</a>
        </nav>
      </header>

      <section id="concepts" style={{ scrollMarginTop: 90 }}>
        <span className="section-label">1 · Concepts</span>
        <div style={{ display: 'grid', gap: '1rem', marginTop: '0.75rem' }}>
          {topic.concepts.map((c, i) => (
            <article key={i} style={card}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.55rem', fontWeight: 500, marginBottom: '0.6rem' }}>
                <span style={{ color: 'var(--accent)', marginRight: 8 }}>{i + 1}.</span>{c.title}
              </h2>
              <Tex block style={{ lineHeight: 1.7 }}>{c.body}</Tex>
              <div style={{ background: 'var(--surface-inset)', borderRadius: 'var(--radius-md)', padding: '0.9rem 1.1rem', marginTop: '1rem' }}>
                <div className="tech-label" style={{ fontSize: '0.7rem', color: 'var(--muted)', marginBottom: 6 }}>KEY FACTS</div>
                <ul style={{ paddingLeft: '1.1rem', display: 'grid', gap: 6 }}>
                  {c.keyFacts.map((f, j) => <li key={j}><Tex>{f}</Tex></li>)}
                </ul>
              </div>
              <p style={{ marginTop: '0.9rem', fontSize: '0.92rem', color: 'var(--muted)' }}>
                <strong style={{ color: 'var(--ink)' }}>When to use it: </strong><Tex>{c.whenToUse}</Tex>
              </p>
            </article>
          ))}
        </div>
      </section>

      <section id="examples" style={{ scrollMarginTop: 90 }}>
        <span className="section-label">2 · Worked examples</span>
        <p style={{ color: 'var(--muted)', fontSize: '0.92rem', margin: '0.4rem 0 0.75rem' }}>
          Try each one first, then reveal the solution one step at a time.
        </p>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {topic.workedExamples.map((ex, i) => <WorkedExampleCard key={i} index={i} example={ex} />)}
        </div>
      </section>

      <section id="practice" style={{ ...card, scrollMarginTop: 90 }}>
        <span className="section-label">3 · Practice</span>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 500, margin: '0.4rem 0 0.6rem' }}>
          {topic.problems.length} problems, easy → hard
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {counts.map((n, d) => n > 0 && <span key={d} style={pill}>{n} × {DIFFICULTY_LABELS[d + 1]}</span>)}
        </div>
        <div style={{ maxWidth: 320, marginBottom: '1.25rem' }}>
          <TopicProgress ids={topic.problems.map((p) => p.id)} />
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href={`/amc12/practice?mode=topic&t=${topic.id}`} className="btn btn-ref-primary">Practise {topic.title}</Link>
          {next && <Link href={`/amc12/${next.id}`} className="btn btn-ref-outline">Next topic: {next.title} →</Link>}
        </div>
      </section>
    </div>
  );
}
