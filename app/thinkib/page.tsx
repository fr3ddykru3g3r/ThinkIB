'use client';
import WebEmbed from '../components/WebEmbed';
import { resourceUrl } from '@/lib/resource-url';

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
          <span className="section-label" style={{ marginBottom: '0.4rem' }}>CURRICULUM VAULT</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', margin: '0.2rem 0' }}>
            InThinking Subject Portals
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.95rem', margin: 0 }}>
            Browse the subject library, search for a topic, and open the resource below.
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
              <Compass size={12} /> {isExplorerOpen ? 'Hide topic search' : 'Find a topic'}
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

      {isExplorerOpen && <section className="topic-browser" aria-label="Find a subject topic">
        <div className="topic-browser-controls"><label><span>Find a topic</span><input type="search" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder={`Search ${selectedSubject.name}…`}/></label>
        {selectedSubject.id==='mathanalysis'&&<label><span>Topic area</span><select value={selectedMathCategory} onChange={e=>setSelectedMathCategory(e.target.value)}>{MATH_CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></label>}</div>
        {selectedSubject.id==='mathanalysis'?<><p className="result-count" role="status">{mathTopics.length} topics · choose one to open it below</p><div className="topic-result-list">{mathTopics.map(topic=><button key={topic.path} onClick={()=>loadTopic(topic.path)} aria-pressed={currentPath===topic.path}><span>{topic.title.replace(/^DP Maths: Analysis & Approaches: /,'')}</span><small>{topic.category} →</small></button>)}</div>{!mathTopics.length&&<p className="empty-state">No topics match this search. Try a broader term.</p>}</>:searchQuery.trim()?<div className="topic-result-list">{generalSearchResults.map(t=><button key={t.path} onClick={()=>loadTopic(t.path)}>{t.title}<span>→</span></button>)}{!generalSearchResults.length&&<p>No matches. Try the subject index below.</p>}</div>:<p className="result-count">Search by topic, or browse the subject index below.</p>}
      </section>}

      {/* Full Web Page Viewer Frame */}
      <div className="panel" style={{ padding: '0.5rem', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.45rem 0.85rem', borderBottom: '1px solid var(--border)', background: 'var(--surface-raised, var(--panel-light))', marginBottom: '0.5rem', borderRadius: '10px 10px 0 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.72rem', padding: '2px 8px', background: 'var(--rust)', color: '#fff', borderRadius: '6px', fontWeight: 600 }}>
              Viewing
            </span>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink)' }}>
              {selectedSubject.name}
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

        <WebEmbed key={key} src={resourceUrl(iframeSrc)} title={selectedSubject.name}/>

      </div>
    </div>
  );
}
