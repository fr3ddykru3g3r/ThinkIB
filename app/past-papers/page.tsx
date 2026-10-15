'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ChevronRight,
  FileText,
  Search,
  Download,
  ExternalLink,
  SlidersHorizontal,
  Eye,
  ArrowLeft,
  BookOpen,
  HelpCircle,
  Layers,
  Sparkles,
  Columns,
  CheckCircle2,
  Atom,
  FlaskConical,
  Calculator,
  Clock,
  Zap,
  Info,
  ChevronDown
} from 'lucide-react';
import rawMap from './map.json';
import rawPhysicsMap from './physics_topicals_map.json';
import rawChemistryMap from './chemistry_topicals_map.json';
import rawMathMap from './math_topicals_map.json';
import IBBookletViewerModal from '@/app/components/IBBookletViewerModal';
import IBCommandTermsModal from '@/app/components/IBCommandTermsModal';
import IBPDFViewerModal, { CustomPDFDoc } from '@/app/components/IBPDFViewerModal';

interface FileInfo {
  name: string;
  path: string[];
}

interface MapNode {
  files?: string[];
  [key: string]: any;
}

const IB_SUBJECTS = [
  { label: 'All Subjects', value: '' },
  { label: 'Chemistry', value: 'chemistry' },
  { label: 'Biology', value: 'biology' },
  { label: 'Physics', value: 'physics' },
  { label: 'Mathematics', value: 'math' },
  { label: 'Business Management', value: 'business' },
  { label: 'Economics', value: 'economics' },
  { label: 'History', value: 'history' },
  { label: 'English', value: 'english' },
  { label: 'Psychology', value: 'psychology' },
  { label: 'Geography', value: 'geography' },
  { label: 'Computer Science', value: 'computer' },
  { label: 'Environmental Systems', value: 'environmental' }
];

const PAPER_TYPES = [
  { label: 'All Document Types', value: '' },
  { label: 'Paper 1 (P1)', value: 'paper1' },
  { label: 'Paper 2 (P2)', value: 'paper2' },
  { label: 'Paper 3 (P3)', value: 'paper3' },
  { label: 'Markscheme / MS', value: 'markscheme' }
];

const YEARS = [
  { label: 'All Years', value: '' },
  ...Array.from({ length: 16 }, (_, i) => {
    const year = 2025 - i;
    return { label: `${year}`, value: `${year}` };
  })
];

const THEME_ACCENTS: Record<string, { color: string; bg: string; border: string }> = {
  // Physics Themes A-E
  A: { color: '#0969da', bg: 'rgba(9, 105, 218, 0.08)', border: 'rgba(9, 105, 218, 0.25)' },
  B: { color: '#b84a39', bg: 'rgba(184, 74, 57, 0.08)', border: 'rgba(184, 74, 57, 0.25)' },
  C: { color: '#1f883d', bg: 'rgba(31, 136, 61, 0.08)', border: 'rgba(31, 136, 61, 0.25)' },
  D: { color: '#8250df', bg: 'rgba(130, 80, 223, 0.08)', border: 'rgba(130, 80, 223, 0.25)' },
  E: { color: '#cf222e', bg: 'rgba(207, 34, 46, 0.08)', border: 'rgba(207, 34, 46, 0.25)' },
  // Chemistry Structure & Reactivity
  S1: { color: '#0969da', bg: 'rgba(9, 105, 218, 0.08)', border: 'rgba(9, 105, 218, 0.25)' },
  S2: { color: '#1f883d', bg: 'rgba(31, 136, 61, 0.08)', border: 'rgba(31, 136, 61, 0.25)' },
  S3: { color: '#8250df', bg: 'rgba(130, 80, 223, 0.08)', border: 'rgba(130, 80, 223, 0.25)' },
  R1: { color: '#b84a39', bg: 'rgba(184, 74, 57, 0.08)', border: 'rgba(184, 74, 57, 0.25)' },
  R2: { color: '#d97706', bg: 'rgba(217, 119, 6, 0.08)', border: 'rgba(217, 119, 6, 0.25)' },
  R3: { color: '#cf222e', bg: 'rgba(207, 34, 46, 0.08)', border: 'rgba(207, 34, 46, 0.25)' },
  // Mathematics Topics 1-5
  T1: { color: '#0969da', bg: 'rgba(9, 105, 218, 0.08)', border: 'rgba(9, 105, 218, 0.25)' },
  T2: { color: '#b84a39', bg: 'rgba(184, 74, 57, 0.08)', border: 'rgba(184, 74, 57, 0.25)' },
  T3: { color: '#1f883d', bg: 'rgba(31, 136, 61, 0.08)', border: 'rgba(31, 136, 61, 0.25)' },
  T4: { color: '#d97706', bg: 'rgba(217, 119, 6, 0.08)', border: 'rgba(217, 119, 6, 0.25)' },
  T5: { color: '#8250df', bg: 'rgba(130, 80, 223, 0.08)', border: 'rgba(130, 80, 223, 0.25)' }
};

export type TopicalSubject = 'physics' | 'chemistry' | 'math';

interface SubjectConfig {
  id: TopicalSubject;
  name: string;
  tagline: string;
  shortBadge: string;
  title: string;
  description: string;
  bookletTitle: string;
  bookletSubject: 'physics' | 'chemistry' | 'math-aa';
  unitPrefix: string;
  accentColor: string;
  icon: any;
  totalSubtopicsLabel: string;
  subtopicFocusLabel: string;
  masterBookletsLabel: string;
  masterBookletsSub: string;
  legacyExclusionLabel: string;
  defaultVaultDir: string;
}

const SUBJECT_CONFIGS: Record<TopicalSubject, SubjectConfig> = {
  physics: {
    id: 'physics',
    name: 'IB Physics',
    tagline: '2025 IB PHYSICS SYLLABUS • THEMES A–E',
    shortBadge: '24 Topics • 5 Themes',
    title: 'IB Physics Topical Papers',
    description: 'Questions and official markschemes (2016–2025) organized by the current syllabus into Themes A–E and sub-topics A.1–E.5, with retired syllabus content excluded.',
    bookletTitle: 'IB Physics Data Booklet',
    bookletSubject: 'physics',
    unitPrefix: 'Theme',
    accentColor: '#0969da',
    icon: Atom,
    totalSubtopicsLabel: '24 Sub-Topics',
    subtopicFocusLabel: 'A.1 to E.5 Focus Papers',
    masterBookletsLabel: '5 Themes',
    masterBookletsSub: 'Complete Theme Papers',
    legacyExclusionLabel: 'Outdated Syllabus Excluded',
    defaultVaultDir: 'physics-topicals'
  },
  chemistry: {
    id: 'chemistry',
    name: 'IB Chemistry',
    tagline: '2025 IB CHEMISTRY SYLLABUS • STRUCTURE & REACTIVITY',
    shortBadge: '22 Topics • 6 Themes',
    title: 'IB Chemistry Topical Papers',
    description: 'Questions and official markschemes (2016–2025) organized by the current syllabus into Structure (S1–S3) and Reactivity (R1–R3), with retired legacy options removed.',
    bookletTitle: 'IB Chemistry Data Booklet',
    bookletSubject: 'chemistry',
    unitPrefix: 'Theme',
    accentColor: '#1f883d',
    icon: FlaskConical,
    totalSubtopicsLabel: '22 Sub-Topics',
    subtopicFocusLabel: 'S1.1 to R3.4 Focus Papers',
    masterBookletsLabel: '6 Themes',
    masterBookletsSub: 'Structure 1–3 & Reactivity 1–3',
    legacyExclusionLabel: 'Outdated Options Excluded',
    defaultVaultDir: 'chemistry-topicals'
  },
  math: {
    id: 'math',
    name: 'IB Mathematics',
    tagline: 'IB MATHEMATICS (AA & AI SL/HL) • TOPICS 1–5',
    shortBadge: '25 Topics • 5 Topics',
    title: 'IB Mathematics Topical Papers',
    description: 'Questions and official markschemes (2016–2025) categorized across Topics 1–5 for AA and AI, broken down by Paper 1, Paper 2, and Paper 3.',
    bookletTitle: 'IB Math Formula Booklet',
    bookletSubject: 'math-aa',
    unitPrefix: 'Topic',
    accentColor: '#8250df',
    icon: Calculator,
    totalSubtopicsLabel: '25 Sub-Topics',
    subtopicFocusLabel: 'T1.1 to T5.5 Focus Papers',
    masterBookletsLabel: '5 Topics',
    masterBookletsSub: 'Complete Topic Papers',
    legacyExclusionLabel: 'Pre-2020 Syllabus Excluded',
    defaultVaultDir: 'math-topicals'
  }
};

const getThemeAccent = (themeKey: string, themeMeta?: any) => {
  if (themeMeta?.color) {
    return {
      color: themeMeta.color,
      bg: themeMeta.accent || `${themeMeta.color}15`,
      border: `${themeMeta.color}40`
    };
  }
  if (THEME_ACCENTS[themeKey]) return THEME_ACCENTS[themeKey];
  return { color: '#0969da', bg: 'rgba(9, 105, 218, 0.08)', border: 'rgba(9, 105, 218, 0.25)' };
};

function PastPapersBrowserContent() {
  const searchParams = useSearchParams();

  // Primary Navigation Mode: 'archive' vs 'topical'
  const [activeTab, setActiveTab] = useState<'archive' | 'topical'>('topical');
  const [topicalSubject, setTopicalSubject] = useState<TopicalSubject>('physics');

  // Archive Browser State
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [paperTypeFilter, setPaperTypeFilter] = useState('');
  const [showBookletModal, setShowBookletModal] = useState(false);
  const [showCommandTermsModal, setShowCommandTermsModal] = useState(false);

  // Topical Browser State
  const [activeThemeFilter, setActiveThemeFilter] = useState<string>('ALL');
  const [topicalSearch, setTopicalSearch] = useState('');
  const [hlOnlyFilter, setHlOnlyFilter] = useState(false);

  // PDF Viewer Modal State
  const [viewerModalOpen, setViewerModalOpen] = useState(false);
  const [viewerDoc, setViewerDoc] = useState<CustomPDFDoc | undefined>(undefined);
  const [viewerSplitView, setViewerSplitView] = useState(false);

  // Check URL parameters reactively on change and on mount
  useEffect(() => {
    if (!searchParams) return;
    const tabParam = searchParams.get('tab');
    const subjParam = searchParams.get('subject');
    const themeParam = searchParams.get('theme');

    if (tabParam === 'physics-topical') {
      setActiveTab('topical');
      setTopicalSubject('physics');
    } else if (tabParam === 'chemistry-topical') {
      setActiveTab('topical');
      setTopicalSubject('chemistry');
    } else if (tabParam === 'math-topical') {
      setActiveTab('topical');
      setTopicalSubject('math');
    } else if (tabParam === 'archive') {
      setActiveTab('archive');
    } else if (tabParam === 'topical' || tabParam === 'topicals') {
      setActiveTab('topical');
    }

    if (subjParam) {
      const s = subjParam.toLowerCase();
      if (s === 'physics' || s === 'chemistry' || s === 'math') {
        setTopicalSubject(s as TopicalSubject);
      }
    }

    if (themeParam) {
      setActiveThemeFilter(themeParam.toUpperCase());
    }
  }, [searchParams]);

  const mapData = rawMap as MapNode;
  const physicsData = (rawPhysicsMap as any) || { themes: {}, subtopics: {} };
  const chemistryData = (rawChemistryMap as any) || { themes: {}, subtopics: {} };
  const mathData = (rawMathMap as any) || { themes: {}, subtopics: {} };

  const currentTopicalData = useMemo(() => {
    if (topicalSubject === 'chemistry') return chemistryData;
    if (topicalSubject === 'math') return mathData;
    return physicsData;
  }, [topicalSubject, physicsData, chemistryData, mathData]);

  const currentConfig = SUBJECT_CONFIGS[topicalSubject];

  // Flatten all archive files for searching & filtering
  const allFiles = useMemo(() => {
    const list: FileInfo[] = [];
    function recurse(node: MapNode, pathAcc: string[]) {
      if (node.files) {
        node.files
          .filter(f => !f.toLowerCase().endsWith('.html') && !f.toLowerCase().endsWith('.htm'))
          .forEach(file => {
            list.push({ name: file, path: [...pathAcc, file] });
          });
      }
      Object.keys(node).forEach(key => {
        if (key !== 'files' && key.toLowerCase() !== 'html') {
          recurse(node[key], [...pathAcc, key]);
        }
      });
    }
    recurse(mapData, []);
    return list;
  }, [mapData]);

  // Combined Search & Multi-Filter Logic for Archive
  const filteredSearch = useMemo(() => {
    const hasQuery = searchQuery.trim().length > 0;
    const hasSubject = subjectFilter.length > 0;
    const hasYear = yearFilter.length > 0;
    const hasPaperType = paperTypeFilter.length > 0;

    if (!hasQuery && !hasSubject && !hasYear && !hasPaperType) {
      return [];
    }

    const queryClean = searchQuery.toLowerCase().replace(/[_–\-]/g, ' ').trim();
    const queryTokens = queryClean.split(/\s+/).filter(Boolean);
    const sub = subjectFilter.toLowerCase();
    const yr = yearFilter.toLowerCase();

    return allFiles.filter(file => {
      const cleanName = file.name.toLowerCase().replace(/[_–\-]/g, ' ');
      const cleanPath = file.path.join(' ').toLowerCase().replace(/[_–\-]/g, ' ');

      if (hasSubject && !cleanPath.includes(sub) && !cleanName.includes(sub)) return false;
      if (hasYear && !cleanPath.includes(yr) && !cleanName.includes(yr)) return false;

      if (hasPaperType) {
        const typeMatch = (
          (paperTypeFilter === 'paper1' && (cleanName.includes('paper 1') || cleanName.includes('p1') || cleanName.includes('paper_1'))) ||
          (paperTypeFilter === 'paper2' && (cleanName.includes('paper 2') || cleanName.includes('p2') || cleanName.includes('paper_2'))) ||
          (paperTypeFilter === 'paper3' && (cleanName.includes('paper 3') || cleanName.includes('p3') || cleanName.includes('paper_3'))) ||
          (paperTypeFilter === 'markscheme' && (cleanName.includes('markscheme') || cleanName.includes('ms') || cleanName.includes('mark scheme')))
        );
        if (!typeMatch) return false;
      }

      if (hasQuery) {
        const matchesQuery = queryTokens.every(token => {
          if (/^\d+$/.test(token)) {
            const regex = new RegExp(`\\b${token}\\b`);
            return regex.test(cleanName) || regex.test(cleanPath);
          }
          return cleanName.includes(token) || cleanPath.includes(token);
        });
        if (!matchesQuery) return false;
      }

      return true;
    });
  }, [allFiles, searchQuery, subjectFilter, yearFilter, paperTypeFilter]);

  const isSearching = searchQuery.trim().length > 0 || subjectFilter.length > 0 || yearFilter.length > 0 || paperTypeFilter.length > 0;

  // Folder navigation tree for Archive
  const currentNode = useMemo(() => {
    let node = mapData;
    for (const segment of currentPath) {
      if (node[segment]) {
        node = node[segment];
      } else {
        return { files: [] };
      }
    }
    return node;
  }, [mapData, currentPath]);

  const folders = useMemo(() => {
    return Object.keys(currentNode)
      .filter(key => key !== 'files' && key.toLowerCase() !== 'html' && !key.toLowerCase().endsWith('.html'))
      .sort();
  }, [currentNode]);

  const files = useMemo(() => {
    return (currentNode.files || []).filter(f => !f.toLowerCase().endsWith('.html') && !f.toLowerCase().endsWith('.htm'));
  }, [currentNode]);

  const handleFolderClick = (folder: string) => {
    setCurrentPath(prev => [...prev, folder]);
  };

  const handleBackClick = () => {
    setCurrentPath(prev => prev.slice(0, -1));
  };

  const selectFile = (filePath: string[]) => {
    const encoded = filePath.map(encodeURIComponent).join('/');
    setSelectedFile(`/api/past-papers/${encoded}`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSubjectFilter('');
    setYearFilter('');
    setPaperTypeFilter('');
  };

  // Open viewer modal helper
  const openViewer = (doc: CustomPDFDoc, splitView: boolean = false) => {
    setViewerDoc(doc);
    setViewerSplitView(splitView);
    setViewerModalOpen(true);
  };

  // Filtered Subtopics for Topical Tab
  const displayedThemes = useMemo(() => {
    const themeKeys = Object.keys(currentTopicalData.themes || {});
    const activeKeys = activeThemeFilter === 'ALL' ? themeKeys : [activeThemeFilter];
    const sQuery = topicalSearch.trim().toLowerCase();

    return activeKeys.map(themeKey => {
      const themeMeta = currentTopicalData.themes?.[themeKey] || {
        theme: themeKey,
        title: `${currentConfig.unitPrefix} ${themeKey}`,
        description: '',
        total_questions: 0,
        pure_count: 0,
        intra_mixed_count: 0,
        cross_synthesis_count: 0,
        qp_path: `/vault/${currentConfig.defaultVaultDir}/Theme_${themeKey}_Master.pdf`,
        ms_path: `/vault/${currentConfig.defaultVaultDir}/Theme_${themeKey}_Master_MS.pdf`
      };

      // Collect subtopics belonging to this theme
      const subtopicList = Object.values(currentTopicalData.subtopics || {})
        .filter((st: any) => st.theme === themeKey)
        .filter((st: any) => {
          if (hlOnlyFilter && !st.hl_only) return false;
          if (sQuery) {
            const matchCode = (st.code || '').toLowerCase().includes(sQuery);
            const matchTitle = (st.title || '').toLowerCase().includes(sQuery);
            const matchDesc = (st.description || '').toLowerCase().includes(sQuery);
            return matchCode || matchTitle || matchDesc;
          }
          return true;
        });

      return {
        ...themeMeta,
        filteredSubtopics: subtopicList
      };
    });
  }, [currentTopicalData, activeThemeFilter, topicalSearch, hlOnlyFilter, currentConfig]);

  return (
    <div>
      {/* Header Panel */}
      <div className="panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <span className="section-label" style={{ marginBottom: '0.4rem' }}>OFFICIAL EXAMINATION ARCHIVE & TOPICAL HUB</span>
          <h1 style={{ fontFamily: 'var(--display)', fontSize: '2.4rem', margin: '0.2rem 0' }}>Past Examinations Vault</h1>
          <p style={{ color: 'var(--ink-soft)', fontSize: '0.95rem', margin: 0 }}>
            Official examination papers across 16 sessions (2010–2025) and Topical Booklets for Physics, Chemistry, and Mathematics (AA & AI).
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <a
            href="/past-papers/workspace"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: '#0969da',
              color: '#ffffff',
              padding: '0.45rem 0.9rem',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}
          >
            <Zap size={14} /> Split-Screen Workspace
          </a>
          <a href="/" className="filter-btn active" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ArrowLeft size={14} /> Back to Dashboard
          </a>
        </div>
      </div>

      {/* Primary Tab Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--hairline)', paddingBottom: '0.75rem' }}>
        <button
          onClick={() => setActiveTab('topical')}
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            border: activeTab === 'topical' ? '1px solid #0969da' : '1px solid var(--border)',
            background: activeTab === 'topical' ? '#0969da' : 'var(--panel)',
            color: activeTab === 'topical' ? '#ffffff' : 'var(--ink)',
            fontWeight: 700,
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: activeTab === 'topical' ? '0 4px 12px rgba(9, 105, 218, 0.25)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          <Zap size={16} /> Topical Past Paper Hub (Physics • Chemistry • Math)
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 800,
              background: activeTab === 'topical' ? '#ffffff' : 'rgba(9, 105, 218, 0.12)',
              color: activeTab === 'topical' ? '#0969da' : '#0969da',
              padding: '1px 6px',
              borderRadius: '10px'
            }}
          >
            3 Subjects • 71 Topics
          </span>
        </button>

        <button
          onClick={() => setActiveTab('archive')}
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            border: activeTab === 'archive' ? '1px solid #0969da' : '1px solid var(--border)',
            background: activeTab === 'archive' ? '#0969da' : 'var(--panel)',
            color: activeTab === 'archive' ? '#ffffff' : 'var(--ink)',
            fontWeight: 600,
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease'
          }}
        >
          <FileText size={16} /> Chronological Exam Vault (2010–2025)
        </button>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: MULTI-SUBJECT TOPICAL PAST PAPERS HUB (PHYSICS, CHEMISTRY, MATH)   */}
      {/* ========================================================================= */}
      {activeTab === 'topical' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Subject Switcher Pill Bar */}
          <div
            className="panel"
            style={{
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
              background: 'var(--panel)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                SELECT SUBJECT:
              </span>

              {/* Physics Pill */}
              <button
                type="button"
                onClick={() => { setTopicalSubject('physics'); setActiveThemeFilter('ALL'); }}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: topicalSubject === 'physics' ? '1.5px solid #0969da' : '1px solid var(--border)',
                  background: topicalSubject === 'physics' ? 'rgba(9, 105, 218, 0.1)' : 'var(--surface)',
                  color: topicalSubject === 'physics' ? '#0969da' : 'var(--ink)',
                  fontWeight: topicalSubject === 'physics' ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  boxShadow: topicalSubject === 'physics' ? '0 2px 8px rgba(9, 105, 218, 0.2)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <Atom size={16} />
                <span>IB Physics (Themes A–E)</span>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '10px',
                    background: topicalSubject === 'physics' ? '#0969da' : 'var(--border)',
                    color: topicalSubject === 'physics' ? '#ffffff' : 'var(--ink-soft)'
                  }}
                >
                  24 Topics
                </span>
              </button>

              {/* Chemistry Pill */}
              <button
                type="button"
                onClick={() => { setTopicalSubject('chemistry'); setActiveThemeFilter('ALL'); }}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: topicalSubject === 'chemistry' ? '1.5px solid #1f883d' : '1px solid var(--border)',
                  background: topicalSubject === 'chemistry' ? 'rgba(31, 136, 61, 0.1)' : 'var(--surface)',
                  color: topicalSubject === 'chemistry' ? '#1f883d' : 'var(--ink)',
                  fontWeight: topicalSubject === 'chemistry' ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  boxShadow: topicalSubject === 'chemistry' ? '0 2px 8px rgba(31, 136, 61, 0.2)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <FlaskConical size={16} />
                <span>IB Chemistry (Structure & Reactivity)</span>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '10px',
                    background: topicalSubject === 'chemistry' ? '#1f883d' : 'var(--border)',
                    color: topicalSubject === 'chemistry' ? '#ffffff' : 'var(--ink-soft)'
                  }}
                >
                  22 Topics
                </span>
              </button>

              {/* Mathematics Pill */}
              <button
                type="button"
                onClick={() => { setTopicalSubject('math'); setActiveThemeFilter('ALL'); }}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: topicalSubject === 'math' ? '1.5px solid #8250df' : '1px solid var(--border)',
                  background: topicalSubject === 'math' ? 'rgba(130, 80, 223, 0.1)' : 'var(--surface)',
                  color: topicalSubject === 'math' ? '#8250df' : 'var(--ink)',
                  fontWeight: topicalSubject === 'math' ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  boxShadow: topicalSubject === 'math' ? '0 2px 8px rgba(130, 80, 223, 0.2)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <Calculator size={16} />
                <span>IB Mathematics (AA & AI Topics 1–5)</span>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '10px',
                    background: topicalSubject === 'math' ? '#8250df' : 'var(--border)',
                    color: topicalSubject === 'math' ? '#ffffff' : 'var(--ink-soft)'
                  }}
                >
                  25 Topics
                </span>
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--ink-faint)', fontWeight: 600 }}>
                Active Syllabus: <strong style={{ color: currentConfig.accentColor }}>{currentConfig.name}</strong>
              </span>
            </div>
          </div>

          {/* Hero Banner with Stats */}
          <div
            className="panel"
            style={{
              background: `linear-gradient(135deg, ${currentConfig.accentColor}08 0%, rgba(130, 80, 223, 0.04) 100%)`,
              border: `1px solid ${currentConfig.accentColor}35`,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem' }}>
              <div>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: currentConfig.accentColor,
                    background: `${currentConfig.accentColor}15`,
                    padding: '3px 8px',
                    borderRadius: '12px',
                    marginBottom: '0.5rem'
                  }}
                >
                  <Sparkles size={12} /> {currentConfig.tagline}
                </span>
                <h2 style={{ fontFamily: 'var(--display)', fontSize: '1.85rem', margin: '0.2rem 0' }}>
                  {currentConfig.title}
                </h2>
                <p style={{ color: 'var(--ink-soft)', fontSize: '0.92rem', maxWidth: '820px', lineHeight: 1.5, margin: 0 }}>
                  {currentConfig.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setShowBookletModal(true)}
                  style={{
                    padding: '0.55rem 0.95rem',
                    borderRadius: '8px',
                    border: `1px solid ${currentConfig.accentColor}55`,
                    background: `${currentConfig.accentColor}10`,
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: currentConfig.accentColor,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <BookOpen size={14} /> {currentConfig.bookletTitle}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCommandTermsModal(true)}
                  style={{
                    padding: '0.55rem 0.95rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'var(--surface)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: 'var(--ink)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <HelpCircle size={14} style={{ color: 'var(--rust)' }} /> Command Terms
                </button>
              </div>
            </div>

            {/* Quick Stats Ribbon */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1rem',
                marginTop: '1.25rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--hairline)'
              }}
            >
              <div style={{ padding: '0.5rem', background: 'var(--paper-card)', borderRadius: '6px', border: '1px solid var(--hairline)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--ink-faint)', textTransform: 'uppercase', fontWeight: 600 }}>Total Questions</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: currentConfig.accentColor, marginTop: '2px' }}>
                  {currentTopicalData.total_questions_harvested ? currentTopicalData.total_questions_harvested.toLocaleString() : '2,500+'}
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>Harvested & Classified</span>
              </div>
              <div style={{ padding: '0.5rem', background: 'var(--paper-card)', borderRadius: '6px', border: '1px solid var(--hairline)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--ink-faint)', textTransform: 'uppercase', fontWeight: 600 }}>Pure Sub-Topics</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1f883d', marginTop: '2px' }}>
                  {currentConfig.totalSubtopicsLabel}
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{currentConfig.subtopicFocusLabel}</span>
              </div>
              <div style={{ padding: '0.5rem', background: 'var(--paper-card)', borderRadius: '6px', border: '1px solid var(--hairline)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--ink-faint)', textTransform: 'uppercase', fontWeight: 600 }}>Master Booklets</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#8250df', marginTop: '2px' }}>
                  {currentConfig.masterBookletsLabel}
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{currentConfig.masterBookletsSub}</span>
              </div>
              <div style={{ padding: '0.5rem', background: 'var(--paper-card)', borderRadius: '6px', border: '1px solid var(--hairline)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--ink-faint)', textTransform: 'uppercase', fontWeight: 600 }}>Retired Exclusions</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#cf222e', marginTop: '2px' }}>
                  {currentTopicalData.total_excluded_legacy ? `${currentTopicalData.total_excluded_legacy} Excluded` : 'Clean Sliced'}
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{currentConfig.legacyExclusionLabel}</span>
              </div>
            </div>
          </div>

          {/* Filtering Controls */}
          <div className="panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            {/* Theme Filter Tabs */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setActiveThemeFilter('ALL')}
                className={`filter-btn ${activeThemeFilter === 'ALL' ? 'active' : ''}`}
                style={{ padding: '0.4rem 0.9rem', fontSize: '0.82rem', fontWeight: 600 }}
              >
                All {Object.keys(currentTopicalData.themes || {}).length} {topicalSubject === 'math' ? 'Topics' : 'Themes'}
              </button>
              {Object.keys(currentTopicalData.themes || {}).map(themeKey => {
                const meta = currentTopicalData.themes[themeKey];
                const accent = getThemeAccent(themeKey, meta);
                const isActive = activeThemeFilter === themeKey;
                return (
                  <button
                    key={themeKey}
                    onClick={() => setActiveThemeFilter(themeKey)}
                    className={`filter-btn ${isActive ? 'active' : ''}`}
                    style={{
                      padding: '0.4rem 0.9rem',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      borderColor: isActive ? accent.color : undefined,
                      color: isActive ? '#fff' : undefined,
                      background: isActive ? accent.color : undefined
                    }}
                  >
                    {currentConfig.unitPrefix} {themeKey}
                  </button>
                );
              })}
            </div>

            {/* Search Input & HL Toggle */}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="search-wrapper" style={{ width: '280px' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.85rem', color: 'var(--ink-faint)', pointerEvents: 'none' }} />
                <input
                  type="text"
                  placeholder="Filter sub-topics... (e.g. Doppler, Kinetics)"
                  className="search-input"
                  style={{ padding: '0.45rem 0.85rem 0.45rem 2.2rem', fontSize: '0.82rem' }}
                  value={topicalSearch}
                  onChange={(e) => setTopicalSearch(e.target.value)}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--ink)', cursor: 'pointer', fontWeight: 500 }}>
                <input
                  type="checkbox"
                  checked={hlOnlyFilter}
                  onChange={(e) => setHlOnlyFilter(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                HL Only Topics
              </label>
            </div>
          </div>

          {/* Master Themes & Sub-Topics Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {displayedThemes.map(theme => {
              const accent = getThemeAccent(theme.theme, theme);
              return (
                <div
                  key={theme.theme}
                  className="panel"
                  style={{
                    padding: '1.5rem',
                    borderLeft: `5px solid ${accent.color}`,
                    background: 'var(--panel)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
                  }}
                >
                  {/* Master Theme Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--hairline)', paddingBottom: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            letterSpacing: '0.04em',
                            background: accent.bg,
                            color: accent.color,
                            border: `1px solid ${accent.border}`,
                            padding: '2px 8px',
                            borderRadius: '6px'
                          }}
                        >
                          {currentConfig.unitPrefix.toUpperCase()} {theme.theme}
                        </span>
                        <h3 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800, color: 'var(--ink)' }}>
                          {theme.title}
                        </h3>
                      </div>
                      <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.88rem', color: 'var(--ink-soft)' }}>
                        {theme.description}
                      </p>
                      <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.74rem', color: 'var(--muted)', background: 'var(--surface)', padding: '2px 7px', borderRadius: '4px', border: '1px solid var(--hairline)' }}>
                          <strong>{theme.total_questions ?? 0}</strong> Total Questions
                        </span>
                        <span style={{ fontSize: '0.74rem', color: 'var(--muted)', background: 'var(--surface)', padding: '2px 7px', borderRadius: '4px', border: '1px solid var(--hairline)' }}>
                          <strong>{theme.pure_count ?? 0}</strong> Pure Sub-Topic
                        </span>
                        <span style={{ fontSize: '0.74rem', color: 'var(--muted)', background: 'var(--surface)', padding: '2px 7px', borderRadius: '4px', border: '1px solid var(--hairline)' }}>
                          <strong>{theme.intra_mixed_count ?? 0}</strong> Intra-Topic Mixed
                        </span>
                        <span style={{ fontSize: '0.74rem', color: 'var(--muted)', background: 'var(--surface)', padding: '2px 7px', borderRadius: '4px', border: '1px solid var(--hairline)' }}>
                          <strong>{theme.cross_synthesis_count ?? 0}</strong> Cross-Topic Synthesis
                        </span>
                      </div>
                    </div>

                    {/* Master Actions */}
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <button
                        onClick={() =>
                          openViewer(
                            {
                              id: `theme-${theme.theme}`,
                              title: `${currentConfig.unitPrefix} ${theme.theme}: ${theme.title}`,
                              subtitle: `All Sub-Topics & Synthesis Questions`,
                              url: theme.qp_path,
                              msUrl: theme.ms_path,
                              badge: `${currentConfig.unitPrefix} ${theme.theme}`,
                              category: 'topical'
                            },
                            false
                          )
                        }
                        style={{
                          background: accent.color,
                          color: '#ffffff',
                          border: 'none',
                          padding: '0.55rem 1rem',
                          borderRadius: '6px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: `0 2px 8px ${accent.border}`
                        }}
                      >
                        <FileText size={14} /> Question Paper
                      </button>

                      <button
                        onClick={() =>
                          openViewer(
                            {
                              id: `theme-${theme.theme}-split`,
                              title: `${currentConfig.unitPrefix} ${theme.theme}: ${theme.title}`,
                              subtitle: `Question Paper + Official Markscheme`,
                              url: theme.qp_path,
                              msUrl: theme.ms_path,
                              badge: `Split-View`,
                              category: 'topical'
                            },
                            true
                          )
                        }
                        style={{
                          background: 'var(--surface)',
                          color: accent.color,
                          border: `1px solid ${accent.border}`,
                          padding: '0.55rem 0.95rem',
                          borderRadius: '6px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Columns size={14} /> Split-View
                      </button>

                      <Link
                        href={`/past-papers/workspace?paper=${encodeURIComponent(theme.qp_path)}&ms=${encodeURIComponent(theme.ms_path)}&subject=${topicalSubject}&title=${encodeURIComponent(`${currentConfig.unitPrefix} ${theme.theme}: ${theme.title}`)}`}
                        style={{
                          background: 'var(--surface)',
                          color: 'var(--ink)',
                          border: '1px solid var(--border)',
                          padding: '0.55rem 0.95rem',
                          borderRadius: '6px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          textDecoration: 'none'
                        }}
                        title="Open timed split-screen workspace"
                      >
                        <Zap size={14} /> Workspace
                      </Link>

                      <a
                        href={theme.qp_path}
                        download
                        className="filter-btn"
                        title={`Download ${currentConfig.unitPrefix} ${theme.theme} PDF`}
                        style={{ padding: '0.55rem 0.75rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                      >
                        <Download size={14} />
                      </a>
                    </div>
                  </div>

                  {/* Sub-Topics Matrix Grid */}
                  <div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700, display: 'block', marginBottom: '0.85rem' }}>
                      SUB-TOPICS IN {currentConfig.unitPrefix.toUpperCase()} {theme.theme} ({theme.filteredSubtopics.length} AVAILABLE)
                    </span>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '0.9rem' }}>
                      {theme.filteredSubtopics.map((st: any) => {
                        return (
                          <div
                            key={st.code}
                            style={{
                              background: 'var(--paper-card)',
                              border: '1px solid var(--hairline)',
                              borderRadius: '8px',
                              padding: '1rem',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                                <span
                                  style={{
                                    fontSize: '0.85rem',
                                    fontWeight: 800,
                                    color: accent.color,
                                    fontFamily: 'var(--font-mono)'
                                  }}
                                >
                                  {st.code}
                                </span>
                                <div style={{ display: 'flex', gap: '0.3rem' }}>
                                  {st.hl_only ? (
                                    <span
                                      style={{
                                        fontSize: '0.68rem',
                                        fontWeight: 800,
                                        background: 'rgba(207, 34, 46, 0.12)',
                                        color: '#cf222e',
                                        padding: '1px 6px',
                                        borderRadius: '4px'
                                      }}
                                    >
                                      HL Only
                                    </span>
                                  ) : (
                                    <span
                                      style={{
                                        fontSize: '0.68rem',
                                        fontWeight: 700,
                                        background: 'rgba(31, 136, 61, 0.12)',
                                        color: '#1f883d',
                                        padding: '1px 6px',
                                        borderRadius: '4px'
                                      }}
                                    >
                                      SL + HL
                                    </span>
                                  )}
                                  <span
                                    style={{
                                      fontSize: '0.68rem',
                                      fontWeight: 600,
                                      background: 'var(--surface)',
                                      color: 'var(--ink)',
                                      border: '1px solid var(--hairline)',
                                      padding: '1px 6px',
                                      borderRadius: '4px'
                                    }}
                                  >
                                    {st.total_questions || 0} Qs
                                  </span>
                                </div>
                              </div>

                              <h4 style={{ margin: '0.1rem 0 0.4rem 0', fontSize: '1.05rem', fontWeight: 700, color: 'var(--ink)' }}>
                                {st.title}
                              </h4>
                              <p
                                style={{
                                  margin: '0 0 0.5rem 0',
                                  fontSize: '0.8rem',
                                  color: 'var(--ink-soft)',
                                  lineHeight: 1.45,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  minHeight: '3.5rem'
                                }}
                              >
                                {st.description}
                              </p>
                              {topicalSubject === 'math' ? (
                                <div style={{ fontSize: '0.74rem', color: 'var(--ink-faint)', marginBottom: '0.2rem' }}>
                                  {st.sl_count ?? 0} SL · {st.hl_count ?? 0} HL · {st.total_questions ?? 0} total questions
                                </div>
                              ) : (
                                <div style={{ fontSize: '0.74rem', color: 'var(--ink-faint)', marginBottom: '0.2rem' }}>
                                  {st.mcq_count ?? 0} MCQs · {st.frq_count ?? 0} FRQs · {st.total_questions ?? 0} total questions
                                </div>
                              )}
                            </div>

                            {/* Sub-Topic Action Buttons */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.9rem', paddingTop: '0.75rem', borderTop: '1px solid var(--hairline)' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem' }}>
                                <button
                                  type="button"
                                  onClick={() =>
                                    openViewer(
                                      {
                                        id: `subtopic-${st.code}`,
                                        title: `${st.code}: ${st.title}`,
                                        subtitle: st.description,
                                        url: st.qp_path,
                                        msUrl: st.ms_path,
                                        badge: `${st.code}`,
                                        category: 'topical'
                                      },
                                      false
                                    )
                                  }
                                  style={{
                                    background: 'var(--surface)',
                                    border: '1px solid var(--hairline)',
                                    color: 'var(--ink)',
                                    padding: '0.48rem 0.5rem',
                                    borderRadius: '6px',
                                    fontSize: '0.78rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  <FileText size={13} style={{ flexShrink: 0 }} /> Question Paper
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    openViewer(
                                      {
                                        id: `subtopic-${st.code}-split`,
                                        title: `${st.code}: ${st.title}`,
                                        subtitle: `Question Paper + Official Markscheme`,
                                        url: st.qp_path,
                                        msUrl: st.ms_path,
                                        badge: `${st.code} Split`,
                                        category: 'topical'
                                      },
                                      true
                                    )
                                  }
                                  style={{
                                    background: accent.bg,
                                    border: `1px solid ${accent.border}`,
                                    color: accent.color,
                                    padding: '0.48rem 0.5rem',
                                    borderRadius: '6px',
                                    fontSize: '0.78rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  <Columns size={13} style={{ flexShrink: 0 }} /> Split-View
                                </button>
                              </div>

                              <div style={{ display: 'flex', gap: '0.45rem' }}>
                                <Link
                                  href={`/past-papers/workspace?paper=${encodeURIComponent(st.qp_path)}&ms=${encodeURIComponent(st.ms_path)}&subject=${topicalSubject}&title=${encodeURIComponent(`${st.code}: ${st.title}`)}`}
                                  style={{
                                    flex: 1,
                                    background: 'var(--surface)',
                                    border: '1px solid var(--hairline)',
                                    color: 'var(--ink-soft)',
                                    padding: '0.42rem 0.6rem',
                                    borderRadius: '6px',
                                    fontSize: '0.76rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    textDecoration: 'none',
                                    whiteSpace: 'nowrap'
                                  }}
                                  title="Open timed split-screen workspace"
                                >
                                  <Zap size={13} style={{ flexShrink: 0 }} /> Workspace
                                </Link>

                                <a
                                  href={st.qp_path}
                                  download
                                  className="filter-btn"
                                  title="Download Question Paper PDF"
                                  style={{
                                    padding: '0.42rem 0.75rem',
                                    textDecoration: 'none',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '6px',
                                    color: 'var(--ink-soft)',
                                    border: '1px solid var(--hairline)'
                                  }}
                                >
                                  <Download size={13} />
                                </a>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: CHRONOLOGICAL ARCHIVE (2010–2025)                                 */}
      {/* ========================================================================= */}
      {activeTab === 'archive' && (
        <>
          {/* Grid Inputs & Filters */}
          <div className="panel" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              <div className="search-wrapper">
                <Search size={18} style={{ position: 'absolute', left: '1rem', color: 'var(--ink-faint)', pointerEvents: 'none' }} />
                <input
                  type="text"
                  placeholder="Search 4,400+ past papers... (e.g. Chemistry HL TZ1)"
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span className="tech-label">Subject</span>
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="select-input"
                  style={{ width: '190px' }}
                >
                  {IB_SUBJECTS.map((sub, idx) => (
                    <option key={idx} value={sub.value}>{sub.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span className="tech-label">Year</span>
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="select-input"
                  style={{ width: '130px' }}
                >
                  {YEARS.map((yr, idx) => (
                    <option key={idx} value={yr.value}>{yr.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span className="tech-label">Paper Type</span>
                <select
                  value={paperTypeFilter}
                  onChange={(e) => setPaperTypeFilter(e.target.value)}
                  className="select-input"
                  style={{ width: '190px' }}
                >
                  {PAPER_TYPES.map((type, idx) => (
                    <option key={idx} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => setShowBookletModal(true)}
                style={{
                  alignSelf: 'flex-end',
                  padding: '0.55rem 0.95rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--ink)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <BookOpen size={14} style={{ color: 'var(--accent)' }} /> Official Formula Booklets
              </button>

              <button
                type="button"
                onClick={() => setShowCommandTermsModal(true)}
                style={{
                  alignSelf: 'flex-end',
                  padding: '0.55rem 0.95rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--ink)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <HelpCircle size={14} style={{ color: 'var(--rust)' }} /> Command Terms & Rules
              </button>

              {isSearching && (
                <button
                  onClick={clearFilters}
                  className="filter-btn active"
                  style={{ alignSelf: 'flex-end', padding: '0.5rem 1rem' }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Directory Split Screen */}
          <div className="split-screen">
            <div className="panel browser-panel" style={{ overflowY: 'auto' }}>
              {isSearching ? (
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 500, display: 'block', marginBottom: '0.75rem' }}>
                    {filteredSearch.length} examinations found
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {filteredSearch.length === 0 ? (
                      <div style={{ color: 'var(--ink-faint)', textAlign: 'center', padding: '2rem 0', fontSize: '0.85rem' }}>
                        No papers matching search parameters.
                      </div>
                    ) : (
                      filteredSearch.slice(0, 100).map((file, idx) => {
                        const isActive = selectedFile === `/api/past-papers/${file.path.map(encodeURIComponent).join('/')}`;
                        return (
                          <div
                            key={idx}
                            onClick={() => selectFile(file.path)}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '0.75rem 0.9rem',
                              background: isActive ? 'var(--earth-soft)' : 'var(--paper-card)',
                              color: 'var(--ink)',
                              border: isActive ? '1px solid rgba(154, 106, 62, 0.45)' : '1px solid var(--hairline)',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '0.5rem' }}>
                              <span style={{ fontSize: '0.9rem', display: 'block', fontWeight: 600, color: isActive ? 'var(--earth)' : 'var(--ink)' }}>
                                {file.name.replace(/_/g, ' ')}
                              </span>
                              <span style={{ fontSize: '0.72rem', color: 'var(--ink-faint)', letterSpacing: '0.02em' }}>
                                {file.path.slice(0, -1).join(' › ').replace(/_/g, ' ')}
                              </span>
                            </div>
                            <ChevronRight size={14} style={{ color: isActive ? 'var(--earth)' : 'var(--ink-faint)', flexShrink: 0 }} />
                          </div>
                        );
                      })
                    )}
                    {filteredSearch.length > 100 && (
                      <div style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--muted)' }}>
                        + {filteredSearch.length - 100} more papers. Refine search filters.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--hairline)', paddingBottom: '0.75rem' }}>
                    <span className="section-label" style={{ margin: 0 }}>
                      {currentPath.length > 0 ? currentPath.join(' › ') : 'Examination Subjects'}
                    </span>
                    {currentPath.length > 0 && (
                      <button onClick={handleBackClick} className="filter-btn" style={{ padding: '0.2rem 0.6rem' }}>
                        ← Back
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {folders.map((folder, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleFolderClick(folder)}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.75rem 0.9rem',
                          background: 'var(--paper-card)',
                          border: '1px solid var(--hairline)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--ink)' }}>{folder}</span>
                        <ChevronRight size={14} style={{ color: 'var(--ink-faint)' }} />
                      </div>
                    ))}

                    {files.map((file, idx) => {
                      const isActive = selectedFile === `/api/past-papers/${[...currentPath, file].map(encodeURIComponent).join('/')}`;
                      return (
                        <div
                          key={idx}
                          onClick={() => selectFile([...currentPath, file])}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.75rem 0.9rem',
                            background: isActive ? 'var(--earth-soft)' : 'var(--paper-card)',
                            color: 'var(--ink)',
                            border: isActive ? '1px solid rgba(154, 106, 62, 0.45)' : '1px solid var(--hairline)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span style={{ fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: isActive ? 600 : 400, color: isActive ? 'var(--earth)' : 'var(--ink)' }}>
                            {file.replace(/_/g, ' ')}
                          </span>
                          <FileText size={14} style={{ color: isActive ? 'var(--earth)' : 'var(--ink-faint)', flexShrink: 0 }} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* PDF Viewer Panel */}
            <div className="viewer-panel">
              {selectedFile ? (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', background: 'var(--paper-panel)', borderBottom: '1px solid var(--hairline)' }}>
                    <span className="tech-label" style={{ maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--ink)' }}>
                      {decodeURIComponent(selectedFile.split('/').pop() || '')}
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <Link
                        href={`/past-papers/workspace?paper=${encodeURIComponent(selectedFile)}&title=${encodeURIComponent(decodeURIComponent(selectedFile.split('/').pop() || ''))}`}
                        className="filter-btn"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none', padding: '4px 10px' }}
                        title="Open timed split-screen workspace"
                      >
                        <Zap size={12} /> Workspace
                      </Link>
                      <a href={selectedFile} download className="filter-btn active" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none', padding: '4px 10px' }}>
                        <Download size={12} /> Download
                      </a>
                      <a href={selectedFile} target="_blank" rel="noopener noreferrer" className="filter-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none', padding: '4px 10px' }}>
                        <ExternalLink size={12} /> New Tab
                      </a>
                    </div>
                  </div>
                  <iframe src={selectedFile} className="viewer-iframe" title="PDF Viewer" />
                </div>
              ) : (
                <div className="viewer-placeholder">
                  <Eye size={44} style={{ color: 'var(--earth)', marginBottom: '1rem', opacity: 0.5 }} />
                  <h3 style={{ fontFamily: 'var(--display)', fontSize: '1.4rem' }}>No Examination Paper Selected</h3>
                  <p style={{ maxWidth: '320px', marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--ink-soft)' }}>
                    Select a past examination paper or markscheme from the directory on the left to preview and study the document inline.
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* MODALS */}
      {/* 1. Topical / Custom Document Split-Screen Viewer */}
      <IBPDFViewerModal
        isOpen={viewerModalOpen}
        onClose={() => setViewerModalOpen(false)}
        customDoc={viewerDoc}
        initialSplitView={viewerSplitView}
        subject={topicalSubject}
      />

      {/* 2. Official Formula Booklets Modal */}
      <IBBookletViewerModal
        isOpen={showBookletModal}
        onClose={() => setShowBookletModal(false)}
        defaultSubject={currentConfig.bookletSubject}
        key={`${topicalSubject}-${showBookletModal}`}
      />

      {/* 3. Command Terms Modal */}
      <IBCommandTermsModal
        isOpen={showCommandTermsModal}
        onClose={() => setShowCommandTermsModal(false)}
      />

      {/* Floating Data Booklet Quick Launcher */}
      <button
        type="button"
        onClick={() => setShowBookletModal(true)}
        aria-label={`Open ${currentConfig.name} Booklet`}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 8000,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'linear-gradient(135deg, #1f883d 0%, #15803d 100%)',
          color: '#ffffff',
          border: '1.5px solid rgba(255, 255, 255, 0.25)',
          borderRadius: '50px',
          padding: '12px 20px',
          fontSize: '0.88rem',
          fontWeight: 700,
          boxShadow: '0 8px 24px rgba(21, 128, 61, 0.4), 0 2px 6px rgba(0,0,0,0.2)',
          cursor: 'pointer',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 12px 28px rgba(21, 128, 61, 0.5), 0 4px 8px rgba(0,0,0,0.25)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(21, 128, 61, 0.4), 0 2px 6px rgba(0,0,0,0.2)';
        }}
      >
        <BookOpen size={16} />
        <span>Open {currentConfig.name} Booklet</span>
      </button>
    </div>
  );
}

export default function PastPapersBrowser() {
  return (
    <Suspense
      fallback={
        <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid var(--hairline)', borderTopColor: 'var(--earth)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem auto' }} />
            <p style={{ color: 'var(--ink-soft)', fontSize: '0.9rem' }}>Loading examination vaults & topicals...</p>
          </div>
        </div>
      }
    >
      <PastPapersBrowserContent />
    </Suspense>
  );
}
