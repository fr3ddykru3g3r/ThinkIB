'use client';

import React, { useState } from 'react';
import { ArrowLeft, ExternalLink, RefreshCw, Maximize2, Sparkles, BookOpen, Layers } from 'lucide-react';

interface SubjectEntry {
  id: string;
  name: string;
  badge: string;
  path: string;
  description: string;
}

const INTHINKING_SUBJECTS: SubjectEntry[] = [
  {
    id: 'chem',
    name: 'Chemistry',
    badge: 'SL / HL',
    path: 'chem/chemistry.html',
    description: 'Complete 2025 structure and reactivity guides, reaction mechanisms, and worked questions.'
  },
  {
    id: 'biology',
    name: 'Biology',
    badge: 'SL / HL',
    path: 'bio_psych/biology.html',
    description: 'Unity & Diversity, Form & Function, Interaction, and Continuity syllabus websites.'
  },
  {
    id: 'psychology',
    name: 'Psychology',
    badge: 'SL / HL',
    path: 'bio_psych/psychology.html',
    description: 'Biological, Cognitive, and Sociocultural approach study guides and empirical evaluation.'
  },
  {
    id: 'business',
    name: 'Business Management',
    badge: 'SL / HL',
    path: 'bm_econ/businessmanagement.html',
    description: 'Business organization, HRM, finance, marketing, and operations modules.'
  },
  {
    id: 'economics',
    name: 'Economics',
    badge: 'SL / HL',
    path: 'bm_econ/economics.html',
    description: 'Microeconomics, Macroeconomics, and Global Trade evaluation guides.'
  },
  {
    id: 'history',
    name: 'History',
    badge: 'HL',
    path: 'history/index.html',
    description: 'Authoritarian states, 20th Century conflicts, and regional historical options.'
  },
  {
    id: 'englisha',
    name: 'English A (Lang/Lit)',
    badge: 'Paper 1 & 2',
    path: 'englisha/englishalanglit.html',
    description: 'Guided textual analysis strategies and comparative essay structures.'
  },
  {
    id: 'mathanalysis',
    name: 'Mathematics AA',
    badge: 'SL / HL',
    path: 'mathanalysis/index.html',
    description: 'Calculus, algebra, and vectors syllabus websites with interactive tools.'
  },
  {
    id: 'englishb',
    name: 'English B',
    badge: 'SL / HL',
    path: 'englishb/englishb/index.html',
    description: 'Language acquisition, text types, listening advice, and speaking tasks.'
  }
];

const GITHUB_PAGES_BASE = 'https://fr3ddykru3g3r.github.io/ThinkIB-Websites';

export default function ThinkIBPage() {
  const [selectedSubject, setSelectedSubject] = useState<SubjectEntry>(INTHINKING_SUBJECTS[0]);
  const [key, setKey] = useState(0);

  const iframeSrc = `${GITHUB_PAGES_BASE}/${selectedSubject.path}`;

  const reloadIframe = () => setKey(k => k + 1);

  return (
    <div>
      {/* Header */}
      <div className="panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <span className="tech-label">[VAULT_MOUNT: INTHINKING_OFFICIAL_WEBSITES]</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', margin: '0.2rem 0' }}>InThinking Subject Portals</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.95rem', margin: 0 }}>
            Full scraped InThinking website mirrors with interactive navigation trees, topic explanations, and practice banks.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <a href="/" className="filter-btn active" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ArrowLeft size={14} /> Back to Dashboard
          </a>
        </div>
      </div>

      {/* Subject Navigation Bar */}
      <div className="panel" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <span className="tech-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Layers size={13} /> Select InThinking Subject Portal
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={reloadIframe} className="filter-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', padding: '3px 8px' }}>
              <RefreshCw size={12} /> Reload Frame
            </button>
            <a
              href={iframeSrc}
              target="_blank"
              rel="noopener noreferrer"
              className="filter-btn active"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none', fontSize: '0.75rem', padding: '3px 10px' }}
            >
              <ExternalLink size={12} /> Open Full InThinking Tab
            </a>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
          {INTHINKING_SUBJECTS.map((sub) => {
            const isActive = selectedSubject.id === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => setSelectedSubject(sub)}
                className={`filter-btn ${isActive ? 'active' : ''}`}
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
              >
                {sub.name} <span style={{ opacity: 0.7, fontSize: '0.7rem', marginLeft: '4px' }}>[{sub.badge}]</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Full Web Page Viewer Frame */}
      <div className="panel" style={{ padding: '0.5rem', background: '#ffffff', borderRadius: '6px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0.75rem', borderBottom: '1px solid var(--border)', background: 'var(--panel-light)', marginBottom: '0.5rem', borderRadius: '4px 4px 0 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.72rem', padding: '1px 6px', background: 'var(--rust)', color: '#fff', borderRadius: '3px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              LIVE_VIEW
            </span>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink)' }}>
              {selectedSubject.name} — InThinking Mirror
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
            {selectedSubject.path}
          </span>
        </div>

        <iframe
          key={key}
          src={iframeSrc}
          style={{
            width: '100%',
            height: 'calc(100vh - 280px)',
            minHeight: '680px',
            border: 'none',
            borderRadius: '0 0 4px 4px',
            background: '#ffffff'
          }}
          title={`InThinking - ${selectedSubject.name}`}
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
      </div>
    </div>
  );
}
