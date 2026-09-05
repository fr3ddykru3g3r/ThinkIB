'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  ArrowLeft, 
  ExternalLink, 
  RefreshCw, 
  Layers, 
  Search, 
  BookOpen, 
  Home, 
  Compass, 
  ChevronDown, 
  ChevronUp, 
  GraduationCap
} from 'lucide-react';
import mathTopicsData from './math_topics.json';
import topicsIndexData from './topics_index.json';

interface SubjectEntry {
  id: string;
  name: string;
  badge: string;
  path: string;
  description: string;
}

interface TopicItem {
  id?: string;
  title: string;
  category?: string;
  path: string;
}

// English B is completely removed
const INTHINKING_SUBJECTS: SubjectEntry[] = [
  {
    id: 'mathanalysis',
    name: 'Mathematics AA',
    badge: 'SL / HL',
    path: 'mathanalysis/index.html',
    description: 'Calculus, algebra, and vectors syllabus websites with interactive tools & 61 mocks.'
  },
  {
    id: 'chem',
    name: 'Chemistry',
    badge: 'SL / HL',
    path: 'chem/chemistry.html',
    description: 'Complete structure and reactivity guides, reaction mechanisms, and worked questions.'
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
  }
];

const MATH_CATEGORIES = [
  'All',
  '1. Number & Algebra',
  '2. Functions',
  '3. Geometry & Trigonometry',
  '4. Statistics & Probability',
  '5. Calculus',
  'Problems of the Week',
  'Challenge Problems',
  'IA - Exploration',
  'Exams & Assessment',
  'Toolkit & Technology'
];

export default function ThinkIBPage() {
  const [selectedSubject, setSelectedSubject] = useState<SubjectEntry>(INTHINKING_SUBJECTS[0]);
  const [currentPath, setCurrentPath] = useState<string>(INTHINKING_SUBJECTS[0].path);
  const [key, setKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMathCategory, setSelectedMathCategory] = useState('All');
  const [isExplorerOpen, setIsExplorerOpen] = useState(true);

  // Listen for search events dispatched from inside the iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'THINKIB_SEARCH' && event.data.query) {
        setSearchQuery(event.data.query);
        setIsExplorerOpen(true);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleSubjectChange = (sub: SubjectEntry) => {
    setSelectedSubject(sub);
    setCurrentPath(sub.path);
    setSearchQuery('');
    setSelectedMathCategory('All');
    setKey(k => k + 1);
  };

  // Uses same-origin proxy to eliminate cross-origin blocks and 404s
  const iframeSrc = `/api/v2/thinkib/${currentPath}`;
  const externalSrc = `https://fr3ddykru3g3r.github.io/ThinkIB-Websites/${currentPath}`;

  const reloadIframe = () => setKey(k => k + 1);

  const resetToHome = () => {
    setCurrentPath(selectedSubject.path);
    setKey(k => k + 1);
  };

  const loadTopic = (topicPath: string) => {
    setCurrentPath(topicPath);
    setKey(k => k + 1);
  };

  // Math AA specific filtered topics
  const mathTopics = useMemo(() => {
    let list = (mathTopicsData as TopicItem[]);
    if (selectedMathCategory !== 'All') {
      list = list.filter(t => t.category === selectedMathCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(t => 
        t.title.toLowerCase().includes(q) || 
        (t.category && t.category.toLowerCase().includes(q))
      );
    }
    return list;
  }, [selectedMathCategory, searchQuery]);

  // General subject topics for search
  const generalSearchResults = useMemo(() => {
    if (!searchQuery.trim() || selectedSubject.id === 'mathanalysis') return [];
    const key = selectedSubject.id === 'business' || selectedSubject.id === 'economics' ? 'bm_econ' :
                selectedSubject.id === 'biology' || selectedSubject.id === 'psychology' ? 'bio_psych' :
                selectedSubject.id;
    const items = ((topicsIndexData as Record<string, TopicItem[]>)[key] || []);
    const q = searchQuery.toLowerCase();
    return items.filter(t => t.title.toLowerCase().includes(q)).slice(0, 20);
  }, [searchQuery, selectedSubject]);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Top Header */}
      <div className="panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <span className="tech-label">[VAULT_MOUNT: INTHINKING_OFFICIAL_WEBSITES]</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', margin: '0.2rem 0' }}>
            InThinking Subject Portals
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.95rem', margin: 0 }}>
            Scraped InThinking interactive website archives with full syllabus guides, worked problems, and authentic question banks.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <a 
            href="/math-mocks" 
            className="filter-btn" 
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', borderColor: 'var(--rust)', color: 'var(--rust)', fontWeight: 600 }}
          >
            <GraduationCap size={15} /> 61 Math Mocks & Solutions
          </a>
          <a href="/" className="filter-btn active" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ArrowLeft size={14} /> Back to Dashboard
          </a>
        </div>
      </div>

      {/* Subject Navigation Bar */}
      <div className="panel" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <span className="tech-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Layers size={13} /> Select Subject Portal
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => setIsExplorerOpen(!isExplorerOpen)} 
              className={`filter-btn ${isExplorerOpen ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', padding: '4px 10px' }}
            >
              <Compass size={12} /> {isExplorerOpen ? 'Hide Topic Explorer' : 'Show Topic Explorer'}
              {isExplorerOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
            <button onClick={resetToHome} className="filter-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', padding: '4px 10px' }}>
              <Home size={12} /> Subject Home
            </button>
            <button onClick={reloadIframe} className="filter-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', padding: '4px 10px' }}>
              <RefreshCw size={12} /> Reload Frame
            </button>
            <a
              href={externalSrc}
              target="_blank"
              rel="noopener noreferrer"
              className="filter-btn active"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none', fontSize: '0.75rem', padding: '4px 12px' }}
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
                onClick={() => handleSubjectChange(sub)}
                className={`filter-btn ${isActive ? 'active' : ''}`}
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
              >
                {sub.name} <span style={{ opacity: 0.7, fontSize: '0.7rem', marginLeft: '4px' }}>[{sub.badge}]</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Topic Explorer & Instant Search Drawer */}
      {isExplorerOpen && (
        <div className="panel" style={{ marginBottom: '1.25rem', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="tech-label" style={{ margin: 0 }}>
                {selectedSubject.name.toUpperCase()} TOPIC EXPLORER
              </span>
              {selectedSubject.id === 'mathanalysis' && (
                <span style={{ fontSize: '0.75rem', background: 'rgba(184, 74, 57, 0.1)', color: 'var(--rust)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                  96 Scraped Modules + 18 POTWs
                </span>
              )}
            </div>

            {/* Quick Search Input */}
            <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
              <input
                type="text"
                placeholder={`Search ${selectedSubject.name} topics...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px 6px 32px',
                  borderRadius: '4px',
                  border: '1px solid var(--border)',
                  background: 'var(--panel-light)',
                  color: 'var(--ink)',
                  fontSize: '0.82rem',
                  outline: 'none',
                  fontFamily: 'var(--font-body)'
                }}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.75rem' }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Math AA Specific Category Filter Pills */}
          {selectedSubject.id === 'mathanalysis' && (
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              {MATH_CATEGORIES.map((cat) => {
                const isSelected = selectedMathCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedMathCategory(cat)}
                    style={{
                      background: isSelected ? 'var(--rust)' : 'transparent',
                      color: isSelected ? '#ffffff' : 'var(--muted)',
                      border: isSelected ? '1px solid var(--rust)' : '1px solid var(--border)',
                      padding: '3px 9px',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                      fontWeight: isSelected ? 600 : 400,
                      transition: 'var(--transition-smooth)'
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          )}

          {/* Math AA Topic Grid */}
          {selectedSubject.id === 'mathanalysis' ? (
            <div>
              <div 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                  gap: '0.6rem',
                  maxHeight: '260px',
                  overflowY: 'auto',
                  paddingRight: '6px'
                }}
              >
                {mathTopics.map((topic) => {
                  const isCurrent = currentPath === topic.path;
                  return (
                    <button
                      key={topic.path}
                      onClick={() => loadTopic(topic.path)}
                      style={{
                        textAlign: 'left',
                        padding: '0.55rem 0.75rem',
                        background: isCurrent ? 'rgba(184, 74, 57, 0.08)' : 'var(--panel-light)',
                        border: isCurrent ? '1px solid var(--rust)' : '1px solid var(--border)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'var(--transition-smooth)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.2rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.68rem', color: 'var(--rust)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                          {topic.category}
                        </span>
                        {isCurrent && (
                          <span style={{ fontSize: '0.65rem', background: 'var(--rust)', color: '#fff', padding: '1px 5px', borderRadius: '3px' }}>
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--ink)', lineHeight: '1.25' }}>
                        {topic.title}
                      </span>
                    </button>
                  );
                })}
              </div>
              {mathTopics.length === 0 && (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--muted)', fontSize: '0.85rem' }}>
                  No matching topics found for "{searchQuery}". Try a different keyword like "calculus", "sequences", or "potw".
                </div>
              )}
            </div>
          ) : (
            /* General Subject Search Dropdown */
            <div>
              {searchQuery.trim() ? (
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block', marginBottom: '0.5rem' }}>
                    Matching topics for "{searchQuery}":
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.5rem', maxHeight: '220px', overflowY: 'auto' }}>
                    {generalSearchResults.map((t) => (
                      <button
                        key={t.path}
                        onClick={() => loadTopic(t.path)}
                        style={{
                          textAlign: 'left',
                          padding: '0.5rem 0.75rem',
                          background: 'var(--panel-light)',
                          border: '1px solid var(--border)',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          color: 'var(--ink)'
                        }}
                      >
                        <BookOpen size={12} style={{ display: 'inline', marginRight: '6px', color: 'var(--rust)' }} />
                        {t.title}
                      </button>
                    ))}
                  </div>
                  {generalSearchResults.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--muted)', fontSize: '0.85rem' }}>
                      No direct title matches found. Use the subject landing page and side tree in the viewer below.
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ fontSize: '0.82rem', color: 'var(--muted)', padding: '0.5rem 0' }}>
                  💡 Use the search box above to instantly jump to specific {selectedSubject.name} topics, or navigate through the official menu inside the interactive viewer below.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Full Web Page Viewer Frame */}
      <div className="panel" style={{ padding: '0.5rem', background: '#ffffff', borderRadius: '6px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.45rem 0.85rem', borderBottom: '1px solid var(--border)', background: 'var(--panel-light)', marginBottom: '0.5rem', borderRadius: '4px 4px 0 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.72rem', padding: '2px 7px', background: 'var(--rust)', color: '#fff', borderRadius: '3px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              LIVE_VIEW
            </span>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink)' }}>
              {selectedSubject.name} — InThinking Mirror
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
              {currentPath}
            </span>
            <button 
              onClick={resetToHome} 
              style={{ background: 'none', border: 'none', color: 'var(--rust)', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline' }}
            >
              Reset to Home
            </button>
          </div>
        </div>

        <iframe
          key={key}
          src={iframeSrc}
          style={{
            width: '100%',
            height: 'calc(100vh - 280px)',
            minHeight: '720px',
            border: 'none',
            borderRadius: '0 0 4px 4px',
            background: '#ffffff'
          }}
          title={`InThinking - ${selectedSubject.name}`}
        />
      </div>
    </div>
  );
}
