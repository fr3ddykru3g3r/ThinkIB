'use client';

import React, { useState } from 'react';
import { ArrowLeft, BookOpen, ExternalLink } from 'lucide-react';

const subjects = [
  { name: 'Chemistry', path: '/api/v2/thinkib/chem/chemistry.html', badge: 'SL/HL' },
  { name: 'Biology', path: '/api/v2/thinkib/bio_psych/biology.html', badge: 'SL/HL' },
  { name: 'Psychology', path: '/api/v2/thinkib/bio_psych/psychology.html', badge: 'SL/HL' },
  { name: 'Business Management', path: '/api/v2/thinkib/bm_econ/businessmanagement.html', badge: 'SL/HL' },
  { name: 'Economics', path: '/api/v2/thinkib/bm_econ/economics.html', badge: 'SL/HL' },
  { name: 'History', path: '/api/v2/thinkib/history/index.html', badge: 'HL' },
  { name: 'English A', path: '/api/v2/thinkib/englisha/englishalanglit.html', badge: 'Lang/Lit' },
  { name: 'Mathematics Analysis & Approaches', path: '/api/v2/thinkib/mathanalysis/index.html', badge: 'AA' }
];

export default function ThinkIBPage() {
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]);

  return (
    <div>
      {/* Header */}
      <div className="panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <span className="tech-label">[DATABASE_MOUNT: INTHINKING_SCRAPED_ARCHIVE]</span>
          <h1 style={{ fontFamily: 'var(--display)', fontSize: '2.4rem', margin: '0.2rem 0' }}>InThinking Syllabus Database</h1>
          <p style={{ color: 'var(--ink-soft)', fontSize: '0.95rem', margin: 0 }}>Scraped syllabus notes, teacher guides, worked keys, and interactive tutorials.</p>
        </div>
        <a href="/" className="filter-btn active" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <ArrowLeft size={14} /> Back to Dashboard
        </a>
      </div>

      {/* Subject Filter Bar */}
      <div className="panel" style={{ marginBottom: '1.5rem' }}>
        <span className="tech-label" style={{ display: 'block', marginBottom: '0.75rem' }}>Select Subject Guide</span>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {subjects.map((sub, idx) => {
            const isActive = selectedSubject.name === sub.name;
            return (
              <button
                key={idx}
                onClick={() => setSelectedSubject(sub)}
                className={`filter-btn ${isActive ? 'active' : ''}`}
                style={{ padding: '0.45rem 0.9rem', fontSize: '0.75rem' }}
              >
                {sub.name} <span style={{ opacity: 0.7, fontSize: '0.7rem', marginLeft: '4px' }}>[{sub.badge}]</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Split Viewer Frame */}
      <div className="panel" style={{ padding: 0, overflow: 'hidden', height: 'calc(100vh - 280px)', minHeight: '650px', border: '1px solid var(--hairline)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.25rem', background: 'var(--paper-panel)', borderBottom: '1px solid var(--hairline)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <BookOpen size={16} style={{ color: 'var(--earth)' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--ink)' }}>{selectedSubject.name} — InThinking Master Site</span>
          </div>
          <a
            href={selectedSubject.path}
            target="_blank"
            rel="noopener noreferrer"
            className="filter-btn active"
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', padding: '4px 10px' }}
          >
            <ExternalLink size={12} /> Open Standalone Tab
          </a>
        </div>
        <iframe
          src={selectedSubject.path}
          style={{ width: '100%', height: 'calc(100% - 45px)', border: 'none', background: '#fff' }}
          title={`${selectedSubject.name} InThinking Database`}
        />
      </div>
    </div>
  );
}
