import { siteBrand } from '@/lib/site-brand';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TOPICS, getTopic, DIFFICULTY_LABELS } from '@/lib/amc12';
import { Tex, TopicProgress } from '../shared';
import { card, pill } from '../styles';
import WorkedExampleCard from './WorkedExampleCard';
import ConceptCard from './ConceptCard';
import VideoEmbed from './VideoEmbed';
import DeepDive from '../DeepDive';

export function generateStaticParams() {
  return TOPICS.map((t) => ({ topic: t.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ topic: string }> }) {
  const t = getTopic((await params).topic);
  return { title: t ? `${t.title} — AMC 12 | ${siteBrand.name}` : `AMC 12 | ${siteBrand.name}` };
}

const tocLink = { color: 'var(--muted)', fontSize: '0.85rem', display: 'block', padding: '0.2rem 0' } as const;
const tocHead = { margin: '1rem 0 0.4rem', fontWeight: 600, fontSize: '0.8rem' } as const;

export default async function TopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const topic = getTopic((await params).topic);
  if (!topic) notFound();
  const next = TOPICS[TOPICS.indexOf(topic) + 1];
  const prereqs = topic.prerequisites.map((id) => getTopic(id)).filter((t) => !!t);
  const counts = [1, 2, 3, 4, 5].map((d) => topic.problems.filter((p) => p.difficulty === d).length);
  const base = `/amc12/practice?mode=topic&t=${topic.id}`;

  return (
    <div className="amc-topic-layout">
      <aside className="amc-toc" aria-label="On this page">
        <Link href="/amc12" className="tech-label" style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>← All topics</Link>
        <div style={tocHead}>Lessons</div>
        {topic.concepts.map((c, i) => (
          <a key={i} href={`#concept-${i}`} style={tocLink}>{i + 1}. <Tex>{c.title}</Tex></a>
        ))}
        <div style={tocHead}>More</div>
        <a href="#deep-dive" style={tocLink}>Method workshop</a>
        <a href="#strategies" style={tocLink}>Contest strategies</a>
        <a href="#examples" style={tocLink}>Worked examples</a>
        {topic.videos.length > 0 && <a href="#videos" style={tocLink}>Videos</a>}
        <a href="#practice" style={tocLink}>Practice</a>
      </aside>

      <div style={{ minWidth: 0, display: 'grid', gap: '2.5rem' }}>
        <header>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', fontWeight: 500, lineHeight: 1.05, margin: '0 0 0.6rem' }}>
            <Tex>{topic.title}</Tex>
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '1.05rem' }}>{topic.summary}</p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', margin: '1rem 0' }}>
            <span style={pill}>{topic.examWeight}</span>
            <span style={pill}>{topic.concepts.length} lessons</span>
            <span style={pill}>{topic.workedExamples.length} worked examples</span>
            <span style={pill}>{topic.problems.length} practice problems</span>
            {topic.videos.length > 0 && <span style={pill}>{topic.videos.length} videos</span>}
          </div>
          <Tex block style={{ lineHeight: 1.75 }}>{topic.overview}</Tex>
          {prereqs.length > 0 && (
            <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--muted)' }}>
              Helpful first:{' '}
              {prereqs.map((p, i) => (
                <span key={p!.id}>{i > 0 && ', '}<Link href={`/amc12/${p!.id}`} style={{ color: 'var(--accent)' }}><Tex>{p!.title}</Tex></Link></span>
              ))}
            </p>
          )}
        </header>

        <section>
          <span className="section-label">Lessons</span>
          <div style={{ display: 'grid', gap: '1rem', marginTop: '0.75rem' }}>
            {topic.concepts.map((c, i) => (
              <ConceptCard key={i} index={i} concept={c} topicId={topic.id} practiceCount={topic.problems.filter((p) => p.concepts.includes(i)).length} />
            ))}
          </div>
        </section>

        <DeepDive topicId={topic.id}/>

        <section id="strategies" style={{ scrollMarginTop: 90 }}>
          <span className="section-label">Contest strategies</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '0.75rem', marginTop: '0.75rem' }}>
            {topic.strategies.map((s, i) => (
              <div key={i} style={{ ...card, padding: '1.1rem' }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>{s.name}</div>
                <Tex block style={{ fontSize: '0.92rem', color: 'var(--muted)', lineHeight: 1.65 }}>{s.description}</Tex>
              </div>
            ))}
          </div>
        </section>

        <section id="examples" style={{ scrollMarginTop: 90 }}>
          <span className="section-label">Worked examples</span>
          <p style={{ color: 'var(--muted)', fontSize: '0.92rem', margin: '0.4rem 0 0.75rem' }}>
            Try each one first. &ldquo;How do I start?&rdquo; gives the way in; then reveal the solution one step at a time.
          </p>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {topic.workedExamples.map((ex, i) => <WorkedExampleCard key={i} index={i} example={ex} />)}
          </div>
        </section>

        {topic.videos.length > 0 && (
          <section id="videos" style={{ scrollMarginTop: 90 }}>
            <span className="section-label">Videos</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '1rem', marginTop: '0.75rem' }}>
              {topic.videos.map((v) => <VideoEmbed key={v.youtubeId} video={v} />)}
            </div>
          </section>
        )}

        <section id="practice" style={{ ...card, scrollMarginTop: 90 }}>
          <span className="section-label">Practice</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 500, margin: '0.4rem 0 0.6rem' }}>
            {topic.problems.length} problems, easy to hard
          </h2>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {counts.map((n, d) => n > 0 && <span key={d} style={pill}>{n} × {DIFFICULTY_LABELS[d + 1]}</span>)}
          </div>
          <div style={{ maxWidth: 320, marginBottom: '1.25rem' }}>
            <TopicProgress ids={topic.problems.map((p) => p.id)} />
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <Link href={base} className="btn btn-ref-primary">All {topic.problems.length} problems</Link>
            <Link href={`${base}&min=1&max=2`} className="btn btn-ref-outline">Warm-up (#1–10)</Link>
            <Link href={`${base}&min=3&max=3`} className="btn btn-ref-outline">Medium (#11–15)</Link>
            <Link href={`${base}&min=4&max=5`} className="btn btn-ref-outline">Hard (#16–25)</Link>
          </div>
          {next && (
            <p style={{ marginTop: '1.25rem', fontSize: '0.92rem' }}>
              Next topic: <Link href={`/amc12/${next.id}`} style={{ color: 'var(--accent)' }}><Tex>{next.title}</Tex> →</Link>
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
