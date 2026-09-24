'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Sparkles, Send, ShieldAlert } from 'lucide-react';

export default function ResourceSubmitPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [exam, setExam] = useState<'SAT' | 'IB' | 'AP' | 'Other'>('SAT');
  const [subject, setSubject] = useState('Mathematics');
  const [subtopic, setSubtopic] = useState('');
  const [resourceType, setResourceType] = useState<'notes' | 'video' | 'practice' | 'cheatsheet' | 'portal' | 'pdf'>('notes');
  const [rationale, setRationale] = useState('');
  const [submittedBy, setSubmittedBy] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/forum/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          url,
          exam,
          subject,
          subtopic,
          resourceType,
          rationale,
          submittedBy,
          hp_field: honeypot,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit resource');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', paddingBottom: '4rem' }}>
      <Link
        href="/forum"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          color: 'var(--muted)',
          textDecoration: 'none',
          marginBottom: '2rem',
        }}
      >
        <ArrowLeft size={14} /> Back to Community Forum
      </Link>

      <span className="section-label">COMMUNITY REPOSITORY SUBMISSION</span>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '0.6rem' }}>Submit a Resource to the Vault</h1>
      <p style={{ color: 'var(--muted)', fontSize: '1.05rem', marginBottom: '2.5rem', lineHeight: '1.6' }}>
        Found a high-yield formula guide, video breakdown, or textbook mirror? Submit it below. Our weekly automated AI curation engine checks for live links, curriculum alignment, and standardizes the title for inclusion in The Academic Archive.
      </p>

      {success ? (
        <div className="panel" style={{ padding: '2.5rem', textAlign: 'center', border: '1px solid rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.03)' }}>
          <CheckCircle2 size={44} style={{ color: '#059669', margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Resource Submitted for Review</h2>
          <p style={{ color: 'var(--ink)', opacity: 0.9, maxWidth: '50ch', margin: '0 auto 1.5rem' }}>
            Your resource has been logged into the curation queue with status <strong>⏳ Pending Review</strong>. The automated curation pipeline will inspect it in the next weekly cycle.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <Link
              href="/forum"
              style={{
                textDecoration: 'none',
                padding: '0.65rem 1.25rem',
                background: 'var(--ink)',
                color: '#fff',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              View Submissions Tracker
            </Link>
            <button
              type="button"
              onClick={() => {
                setSuccess(false);
                setTitle('');
                setUrl('');
                setRationale('');
              }}
              style={{
                padding: '0.65rem 1.25rem',
                background: '#fff',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Submit Another Resource
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="panel" style={{ padding: '2rem' }}>
          {/* Anti-spam honeypot */}
          <input
            type="text"
            name="hp_field"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            style={{ display: 'none', position: 'absolute', opacity: 0, pointerEvents: 'none' }}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          {error && (
            <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#b91c1c', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
              {error}
            </div>
          )}

          {/* Title */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--ink)' }}>
              RESOURCE TITLE *
            </label>
            <input
              type="text"
              placeholder="e.g. Erica Meltzer SAT Grammar Complete Rules Summary"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                fontSize: '0.95rem',
              }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block', marginTop: '4px' }}>
              Our curation pipeline will automatically standardize and polish this title.
            </span>
          </div>

          {/* URL */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--ink)' }}>
              SOURCE URL (LINK OR CLOUD DRIVE) *
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                fontSize: '0.95rem',
              }}
            />
          </div>

          {/* Exam & Resource Type */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--ink)' }}>
                TARGET CURRICULUM *
              </label>
              <select
                value={exam}
                onChange={(e) => setExam(e.target.value as any)}
                className="select-input"
                style={{ width: '100%' }}
              >
                <option value="SAT">Digital SAT</option>
                <option value="IB">IB Diploma (DP)</option>
                <option value="AP">Advanced Placement (AP)</option>
                <option value="Other">Other Examination</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--ink)' }}>
                RESOURCE TYPE *
              </label>
              <select
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value as any)}
                className="select-input"
                style={{ width: '100%' }}
              >
                <option value="notes">Revision Notes & Guides</option>
                <option value="video">Video Walkthrough / Playlist</option>
                <option value="practice">Question Bank & Practice</option>
                <option value="cheatsheet">Formula & Cheat Sheet</option>
                <option value="portal">Interactive Portal / Mirror</option>
                <option value="pdf">Document / PDF</option>
              </select>
            </div>
          </div>

          {/* Subject & Subtopic */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--ink)' }}>
                SUBJECT
              </label>
              <input
                type="text"
                placeholder="e.g. Mathematics AA HL, Chemistry, Verbal"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--ink)' }}>
                SPECIFIC TOPIC
              </label>
              <input
                type="text"
                placeholder="e.g. Non-linear equations, Organic Chem"
                value={subtopic}
                onChange={(e) => setSubtopic(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  fontSize: '0.9rem',
                }}
              />
            </div>
          </div>

          {/* Submitter Rationale */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--ink)' }}>
              WHY IS THIS RESOURCE HIGH-YIELD? (RATIONALE) *
            </label>
            <textarea
              rows={4}
              placeholder="Explain why this resource is genuinely useful. What topics does it teach particularly well? How does it help on exams?"
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                fontSize: '0.9rem',
                lineHeight: '1.5',
              }}
            />
          </div>

          {/* Submitter Name */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--ink)' }}>
              YOUR NAME / CALLOUT (OPTIONAL)
            </label>
            <input
              type="text"
              placeholder="e.g. Karan S. or Anonymous"
              value={submittedBy}
              onChange={(e) => setSubmittedBy(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                fontSize: '0.9rem',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '0.85rem',
              background: 'var(--ink)',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: submitting ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <Send size={15} />
            <span>{submitting ? 'Submitting to Queue...' : 'Submit Resource for Weekly Review'}</span>
          </button>
        </form>
      )}
    </div>
  );
}
