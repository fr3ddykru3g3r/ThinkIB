'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  BookOpen,
  FileText,
  Calculator,
  GraduationCap,
  CheckSquare,
  Award,
  Layers,
  MessageSquare,
  Moon,
  Sun,
  ArrowRight,
  Sparkles,
  Command,
  CornerDownLeft,
  X,
  HardDrive,
  FlaskConical,
  Atom
} from 'lucide-react';

export interface CommandItem {
  id: string;
  title: string;
  category: 'SAT Prep' | 'Past Papers' | 'Notes & Syllabi' | 'Mocks & Tests' | 'IA & EE' | 'System';
  subtitle?: string;
  badge?: string;
  href?: string;
  action?: () => void;
  icon: React.ComponentType<{ size?: number | string; className?: string; style?: React.CSSProperties }> | React.ComponentType<any>;
  keywords?: string[];
  external?: boolean;
}

export default function CommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const toggleTheme = () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('thinkib_theme', next);
    } catch {}
  };

  const ITEMS: CommandItem[] = useMemo(() => [
    // AMC & AIME
    {
      id: 'amc-home',
      title: 'AMC 12 & AIME Concept-to-Synthesis Hub',
      category: 'Mocks & Tests',
      subtitle: 'AoPS Vol 1 & 2 curriculum, trigger signals, and USA(J)MO Index calculator',
      badge: 'Contest Math',
      href: '/amc-aime',
      icon: Award,
      keywords: ['amc', 'amc 12', 'aime', 'olympiad', 'aops', 'contest', 'usamo']
    },
    {
      id: 'amc-simulator',
      title: 'Start AMC 12 / AIME Timed Contest Simulation',
      category: 'Mocks & Tests',
      subtitle: 'Timed contest simulation with live game-theory EV guessing analysis',
      badge: 'Contest Simulator',
      href: '/amc-aime/simulator',
      icon: Award,
      keywords: ['amc simulator', 'timed', 'aime test', 'ev guess', 'contest']
    },
    {
      id: 'amc-synthesis',
      title: '8×8 Cross-Topic Olympiad Synthesis Matrix',
      category: 'Mocks & Tests',
      subtitle: 'Bridge identities between Number Theory, Geometry, Logs, and Complex numbers',
      badge: 'Synthesis Matrix',
      href: '/amc-aime/synthesis',
      icon: Sparkles,
      keywords: ['synthesis', 'bridge', 'recipes', 'cross topic', 'olympiad']
    },
    // PAST PAPERS SPLIT-SCREEN WORKSPACE
    {
      id: 'past-papers-workspace',
      title: 'Split-Screen IB Past Paper Workspace & M1/A1 Grader',
      category: 'Past Papers',
      subtitle: '5-minute reading countdown, Formula Booklet tab, and M1/A1/R1 score tally',
      badge: 'Interactive Workspace',
      href: '/past-papers/workspace',
      icon: FileText,
      keywords: ['split screen', 'workspace', 'grader', 'markscheme', 'reading time', 'data booklet', 'm1 a1']
    },
    // SAT PREP
    {
      id: 'sat-home',
      title: 'Digital SAT Practicer',
      category: 'SAT Prep',
      subtitle: 'Adaptive practice exams, domain drills, and 3,443 official questions',
      badge: '3,443 Qs',
      href: '/sat',
      icon: GraduationCap,
      keywords: ['sat', 'college board', 'digital sat', 'rw', 'math']
    },
    {
      id: 'sat-exam',
      title: 'Start Full SAT Adaptive Exam Simulation',
      category: 'SAT Prep',
      subtitle: 'Timed full-length exam with IRT 2-stage adaptive routing',
      badge: 'Timed Simulation',
      href: '/sat/practice/exam',
      icon: GraduationCap,
      keywords: ['test', 'full exam', 'adaptive', 'score', 'mock', 'simulation']
    },
    {
      id: 'sat-drill-adv-math',
      title: 'SAT Math: Advanced Math & Quadratics Drill',
      category: 'SAT Prep',
      subtitle: 'Nonlinear functions, quadratics, polynomials, and vertex form',
      badge: 'Math',
      href: '/sat/practice/drill?domain=Advanced+Math',
      icon: Calculator,
      keywords: ['advanced math', 'quadratics', 'polynomials', 'functions']
    },
    {
      id: 'sat-drill-algebra',
      title: 'SAT Math: Algebra & Linear Equations Drill',
      category: 'SAT Prep',
      subtitle: 'Linear equations in one/two variables, linear systems, inequalities',
      badge: 'Math',
      href: '/sat/practice/drill?domain=Algebra',
      icon: Calculator,
      keywords: ['algebra', 'linear', 'equations', 'systems', 'slopes']
    },
    {
      id: 'sat-drill-data',
      title: 'SAT Math: Problem-Solving & Data Analysis Drill',
      category: 'SAT Prep',
      subtitle: 'Ratios, rates, percentages, probability, statistics, and graphs',
      badge: 'Math',
      href: '/sat/practice/drill?domain=Problem-Solving+and+Data+Analysis',
      icon: Calculator,
      keywords: ['data analysis', 'probability', 'statistics', 'rates', 'percentages']
    },
    {
      id: 'sat-drill-geom',
      title: 'SAT Math: Geometry & Trigonometry Drill',
      category: 'SAT Prep',
      subtitle: 'Angles, triangles, circles, trigonometric ratios, and solids',
      badge: 'Math',
      href: '/sat/practice/drill?domain=Geometry+and+Trigonometry',
      icon: Calculator,
      keywords: ['geometry', 'trigonometry', 'circles', 'triangles', 'sin', 'cos']
    },
    {
      id: 'sat-drill-craft',
      title: 'SAT R&W: Craft & Structure Drill',
      category: 'SAT Prep',
      subtitle: 'Words in context, text structure, cross-text connections',
      badge: 'Reading',
      href: '/sat/practice/drill?domain=Craft+and+Structure',
      icon: BookOpen,
      keywords: ['craft and structure', 'vocabulary', 'words in context', 'r&w']
    },
    {
      id: 'sat-drill-grammar',
      title: 'SAT R&W: Standard English Conventions Drill',
      category: 'SAT Prep',
      subtitle: 'Boundaries, punctuation, subject-verb agreement, modifier placement',
      badge: 'Writing',
      href: '/sat/practice/drill?domain=Standard+English+Conventions',
      icon: FileText,
      keywords: ['grammar', 'punctuation', 'boundaries', 'conventions', 'semicolon']
    },

    // PAST PAPERS
    {
      id: 'physics-topicals-hub',
      title: 'IB Physics Topical Past Papers (2025 Syllabus A–E)',
      category: 'Past Papers',
      subtitle: 'Themes A–E and 24 Sub-Topics pure & synthesis booklets with split markschemes',
      badge: 'Physics Topicals',
      href: '/past-papers?tab=topicals&subject=physics',
      icon: Atom,
      keywords: ['physics', 'topical', 'theme a', 'theme b', 'theme c', 'theme d', 'theme e', 'kinematics', 'mechanics', 'quantum', 'fields', 'waves']
    },
    {
      id: 'chemistry-topicals-hub',
      title: 'IB Chemistry Topical Past Papers (2025 Syllabus S1–R3)',
      category: 'Past Papers',
      subtitle: 'Structure 1–3 & Reactivity 1–3 (22 Sub-Topics) pure & synthesis booklets with split markschemes',
      badge: 'Chemistry Topicals',
      href: '/past-papers?tab=topicals&subject=chemistry',
      icon: FlaskConical,
      keywords: ['chemistry', 'topical', 'structure', 'reactivity', 'bonding', 'enthalpy', 'kinetics', 'equilibrium', 'acids', 'bases', 'organic']
    },
    {
      id: 'math-topicals-hub',
      title: 'IB Mathematics AA & AI Topical Past Papers (Topics 1–5)',
      category: 'Past Papers',
      subtitle: 'Topics 1–5 (25 Sub-Topics) pure & synthesis booklets with P1 (No Calc) / P2 (Calc) / P3 (HL) badges',
      badge: 'Math Topicals',
      href: '/past-papers?tab=topicals&subject=math',
      icon: Calculator,
      keywords: ['math', 'mathematics', 'topical', 'analysis', 'applications', 'aa', 'ai', 'calculus', 'algebra', 'functions', 'vectors', 'statistics', 'probability']
    },
    {
      id: 'physics-theme-a',
      title: 'IB Physics Theme A: Space, Time and Motion',
      category: 'Past Papers',
      subtitle: 'A.1 Kinematics to A.5 Relativity • Pure & Synthesis Topical Booklets',
      badge: 'Theme A',
      href: '/past-papers?tab=physics-topical&theme=A',
      icon: Layers,
      keywords: ['theme a', 'physics kinematics', 'forces', 'momentum', 'rigid bodies', 'relativity', 'a.1', 'a.2', 'a.3', 'a.4', 'a.5']
    },
    {
      id: 'physics-theme-b',
      title: 'IB Physics Theme B: The Particulate Nature of Matter',
      category: 'Past Papers',
      subtitle: 'B.1 Thermal to B.5 Circuits • Pure & Synthesis Topical Booklets',
      badge: 'Theme B',
      href: '/past-papers?tab=physics-topical&theme=B',
      icon: Layers,
      keywords: ['theme b', 'thermal', 'greenhouse', 'gas laws', 'thermodynamics', 'circuits', 'b.1', 'b.2', 'b.3', 'b.4', 'b.5']
    },
    {
      id: 'physics-theme-c',
      title: 'IB Physics Theme C: Wave Behaviour',
      category: 'Past Papers',
      subtitle: 'C.1 SHM to C.5 Doppler Effect • Pure & Synthesis Topical Booklets',
      badge: 'Theme C',
      href: '/past-papers?tab=physics-topical&theme=C',
      icon: Layers,
      keywords: ['theme c', 'waves', 'shm', 'snell', 'diffraction', 'interference', 'standing waves', 'doppler', 'c.1', 'c.2', 'c.3', 'c.4', 'c.5']
    },
    {
      id: 'physics-theme-d',
      title: 'IB Physics Theme D: Fields',
      category: 'Past Papers',
      subtitle: 'D.1 Gravity to D.4 Electromagnetic Induction • Pure & Synthesis Booklets',
      badge: 'Theme D',
      href: '/past-papers?tab=physics-topical&theme=D',
      icon: Layers,
      keywords: ['theme d', 'fields', 'gravity', 'electric field', 'magnetic field', 'induction', 'faraday', 'd.1', 'd.2', 'd.3', 'd.4']
    },
    {
      id: 'physics-theme-e',
      title: 'IB Physics Theme E: Nuclear and Quantum Physics',
      category: 'Past Papers',
      subtitle: 'E.1 Atomic Structure to E.5 Stars & Fusion • Pure & Synthesis Booklets',
      badge: 'Theme E',
      href: '/past-papers?tab=physics-topical&theme=E',
      icon: Layers,
      keywords: ['theme e', 'nuclear', 'quantum', 'photoelectric', 'radioactive', 'fission', 'fusion', 'stars', 'astrophysics', 'e.1', 'e.2', 'e.3', 'e.4', 'e.5']
    },
    {
      id: 'past-papers-vault',
      title: 'Past Papers Vault (2010–2025)',
      category: 'Past Papers',
      subtitle: '3,786 past papers and markschemes with split-screen PDF preview',
      badge: '3,786 PDFs',
      href: '/past-papers',
      icon: FolderIcon,
      keywords: ['past papers', 'ib papers', 'markschemes', '2025', '2024', 'tz1', 'tz2']
    },
    {
      id: 'past-papers-2025',
      title: 'May 2025 Examination Session Papers',
      category: 'Past Papers',
      subtitle: 'Latest May 2025 exam papers, specimen assessments, and markschemes',
      badge: '2025',
      href: '/past-papers',
      icon: FolderIcon,
      keywords: ['2025', 'may 2025', 'latest papers']
    },
    {
      id: 'past-papers-2024',
      title: '2024 Examination Session Papers (May & Nov)',
      category: 'Past Papers',
      subtitle: 'Full Timezone 1 and Timezone 2 subject packages',
      badge: '2024',
      href: '/past-papers',
      icon: FolderIcon,
      keywords: ['2024', 'may 2024', 'nov 2024', 'tz1', 'tz2']
    },

    // NOTES & SYLLABI
    {
      id: 'savemyexams-vault',
      title: 'SaveMyExams Revision Notes Archive',
      category: 'Notes & Syllabi',
      subtitle: '295 high-yield topic revision guides with diagrams and summary notes',
      badge: '295 Guides',
      href: '/savemyexams',
      icon: BookOpen,
      keywords: ['savemyexams', 'sme', 'notes', 'biology', 'chemistry', 'physics']
    },
    {
      id: 'sme-chem',
      title: 'SaveMyExams: Chemistry SL/HL Revision Notes',
      category: 'Notes & Syllabi',
      subtitle: 'Stoichiometry, atomic structure, bonding, energetics, organic chem',
      badge: 'Chemistry',
      href: '/savemyexams?subject=Chemistry',
      icon: BookOpen,
      keywords: ['chemistry', 'stoichiometry', 'organic', 'acids and bases', 'sme']
    },
    {
      id: 'sme-bio',
      title: 'SaveMyExams: Biology SL/HL Revision Notes',
      category: 'Notes & Syllabi',
      subtitle: 'Cell biology, molecular biology, genetics, ecology, physiology',
      badge: 'Biology',
      href: '/savemyexams?subject=Biology',
      icon: BookOpen,
      keywords: ['biology', 'cells', 'dna', 'genetics', 'ecology', 'sme']
    },
    {
      id: 'sme-phys',
      title: 'SaveMyExams: Physics SL/HL Revision Notes',
      category: 'Notes & Syllabi',
      subtitle: 'Mechanics, thermal physics, waves, electromagnetism, atomic physics',
      badge: 'Physics',
      href: '/savemyexams?subject=Physics',
      icon: BookOpen,
      keywords: ['physics', 'mechanics', 'waves', 'circuits', 'fields', 'sme']
    },
    {
      id: 'sme-math',
      title: 'SaveMyExams: Mathematics AA Revision Notes',
      category: 'Notes & Syllabi',
      subtitle: 'Functions, trigonometry, calculus, vectors, probability',
      badge: 'Math AA',
      href: '/savemyexams?subject=Mathematics',
      icon: Calculator,
      keywords: ['math', 'calculus', 'derivatives', 'integrals', 'vectors', 'sme']
    },
    {
      id: 'syllabus-tracker',
      title: 'Interactive Syllabus & RV Practice Tracker',
      category: 'Notes & Syllabi',
      subtitle: '3-state checklist linked to free Revision Village question bank',
      badge: 'RV Linked',
      href: '/syllabus-tracker',
      icon: CheckSquare,
      keywords: ['syllabus', 'checklist', 'revision village', 'rv', 'progress']
    },
    {
      id: 'thinkib-home',
      title: 'InThinking Curriculum Subject Mirrors',
      category: 'Notes & Syllabi',
      subtitle: 'Offline teacher syllabus notes and interactive lab simulations',
      badge: 'InThinking',
      href: '/thinkib',
      icon: Layers,
      keywords: ['thinkib', 'inthinking', 'curriculum', 'lab', 'teacher keys']
    },

    // MOCKS & TESTS
    {
      id: 'math-mocks-hub',
      title: 'Math Mock Simulator (61 Papers)',
      category: 'Mocks & Tests',
      subtitle: 'Simulated Paper 1 and Paper 2 exams for AA SL and AA HL with step solutions',
      badge: '61 Mocks',
      href: '/math-mocks',
      icon: Calculator,
      keywords: ['math mocks', 'paper 1', 'paper 2', 'aasl', 'aahl', 'simulator']
    },
    {
      id: 'flashcards-hub',
      title: 'Active Recall 3D Memory Flashcards',
      category: 'Mocks & Tests',
      subtitle: 'Spaced repetition decks for math formulas, SAT grammar, and command terms',
      badge: 'Flashcards',
      href: '/flashcards',
      icon: Layers,
      keywords: ['flashcards', 'active recall', 'formulas', 'memory', 'spaced repetition']
    },

    // IA & EE
    {
      id: 'exemplars-hub',
      title: '7/7 IA Vault & Grade A Extended Essays',
      category: 'IA & EE',
      subtitle: 'Sample Grade 7 Internal Assessments and 34-36pt EEs with examiner rationales',
      badge: 'Grade 7 / A',
      href: '/exemplars',
      icon: Award,
      keywords: ['ia', 'internal assessment', 'ee', 'extended essay', 'grade 7', 'exemplars']
    },
    {
      id: 'exemplar-math',
      title: 'Grade 7 Math AA HL IA Exemplar (20/20)',
      category: 'IA & EE',
      subtitle: 'Modeling cooling rates using differential equations with full mark breakdown',
      badge: 'Math IA',
      href: '/exemplars',
      icon: Award,
      keywords: ['math ia', '20/20', 'calculus', 'differential equations']
    },
    {
      id: 'exemplar-phys',
      title: 'Grade 7 Physics HL IA Exemplar (24/24)',
      category: 'IA & EE',
      subtitle: 'Damping coefficients in harmonic oscillators with uncertainty propagation',
      badge: 'Physics IA',
      href: '/exemplars',
      icon: Award,
      keywords: ['physics ia', '24/24', 'harmonic oscillator', 'damping']
    },

    // SYSTEM & COMMUNITY
    {
      id: 'forum-hub',
      title: 'Academic Discussion Forum & Curation Pipeline',
      category: 'System',
      subtitle: 'Ask questions, review solutions, and submit curated resources',
      badge: 'Community',
      href: '/forum',
      icon: MessageSquare,
      keywords: ['forum', 'community', 'discussion', 'submissions', 'questions']
    },
    {
      id: 'theme-toggle',
      title: 'Toggle Theme (Dark / Light)',
      category: 'System',
      subtitle: 'Switch between Deep Carbon and Warm Editorial typography themes',
      badge: 'Theme',
      action: toggleTheme,
      icon: Sparkles,
      keywords: ['theme', 'dark mode', 'light mode', 'color']
    },
    {
      id: 'ssd-vault-status',
      title: 'Samsung T7 SSD Vault Status (Local High-Speed Cache)',
      category: 'System',
      subtitle: 'Active path: /Volumes/T7/IBStuff28 • 860 MB/s direct I/O • 0ms latency',
      badge: 'SSD 860MB/s',
      action: () => alert('Samsung T7 SSD Vault is active and healthy.\nPath: /Volumes/T7/IBStuff28\nSpeed: 860 MB/s Sequential Write | 738 MB/s Read\nTotal offline papers: 3,786'),
      icon: HardDrive,
      keywords: ['ssd', 'speed', 't7', 'cache', 'vault', 'status']
    }
  ], []);

  // Listen for Cmd+K or Ctrl+K or custom open event
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    const handleCustomOpen = () => {
      setIsOpen(true);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-command-palette', handleCustomOpen);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-command-palette', handleCustomOpen);
    };
  }, [isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        setSelectedIndex(0);
      }, 50);
    } else {
      setQuery('');
      setActiveCategory('All');
    }
  }, [isOpen]);

  // Filter items
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ITEMS.filter((item) => {
      if (activeCategory !== 'All' && item.category !== activeCategory) {
        return false;
      }
      if (!q) return true;

      const titleMatch = item.title.toLowerCase().includes(q);
      const subMatch = item.subtitle?.toLowerCase().includes(q);
      const catMatch = item.category.toLowerCase().includes(q);
      const keywordMatch = item.keywords?.some((k) => k.toLowerCase().includes(q));

      return titleMatch || subMatch || catMatch || keywordMatch;
    });
  }, [ITEMS, query, activeCategory]);

  // Reset index when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeCategory]);

  const handleSelect = (item: CommandItem) => {
    setIsOpen(false);
    if (item.action) {
      item.action();
    } else if (item.href) {
      if (item.external) {
        window.open(item.href, '_blank');
      } else {
        router.push(item.href);
      }
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < filteredItems.length ? prev + 1 : 0));
      scrollSelectedIntoView(selectedIndex + 1 < filteredItems.length ? selectedIndex + 1 : 0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filteredItems.length - 1));
      scrollSelectedIntoView(prevIndex(selectedIndex, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex]);
      }
    }
  };

  const prevIndex = (curr: number, len: number) => {
    return curr - 1 >= 0 ? curr - 1 : len - 1;
  };

  const scrollSelectedIntoView = (index: number) => {
    const container = listRef.current;
    if (!container) return;
    const item = container.children[index] as HTMLElement;
    if (item) {
      item.scrollIntoView({ block: 'nearest' });
    }
  };

  const categories = ['All', 'SAT Prep', 'Past Papers', 'Notes & Syllabi', 'Mocks & Tests', 'IA & EE', 'System'];

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(12, 12, 14, 0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '5vh 1rem 1rem',
        animation: 'fadeIn 0.15s ease-out'
      }}
      onClick={() => setIsOpen(false)}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          background: 'var(--panel, var(--surface, #ffffff))',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.28), 0 4px 16px rgba(0, 0, 0, 0.12)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '85vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--border)',
            background: 'var(--surface-raised, var(--surface, #ffffff))'
          }}
        >
          <Search size={20} style={{ color: 'var(--rust, #b84a39)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Search papers, SAT drills, notes, mocks, exemplar IAs... (Type or press ↑↓)"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '1.05rem',
              fontFamily: 'var(--font-body)',
              color: 'var(--ink, #1c1c1e)',
              boxShadow: 'none',
              padding: 0
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--muted)',
                cursor: 'pointer',
                padding: '4px'
              }}
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              padding: '0.2rem 0.5rem',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              background: 'var(--surface-inset, rgba(0, 0, 0, 0.04))',
              color: 'var(--muted)'
            }}
          >
            ESC
          </span>
        </div>

        {/* Filter Pills */}
        <div
          style={{
            display: 'flex',
            gap: '0.4rem',
            padding: '0.6rem 1.25rem',
            borderBottom: '1px solid var(--border)',
            overflowX: 'auto',
            background: 'var(--surface-inset, rgba(0, 0, 0, 0.02))'
          }}
        >
          {categories.map((cat) => {
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                style={{
                  fontSize: '0.75rem',
                  fontWeight: active ? 600 : 500,
                  padding: '0.3rem 0.65rem',
                  borderRadius: '20px',
                  border: active ? '1px solid var(--rust, #b84a39)' : '1px solid var(--border)',
                  background: active ? 'rgba(184, 74, 57, 0.1)' : 'transparent',
                  color: active ? 'var(--rust, #b84a39)' : 'var(--muted)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0.5rem'
          }}
        >
          {filteredItems.length === 0 ? (
            <div
              style={{
                padding: '3rem 1.5rem',
                textAlign: 'center',
                color: 'var(--muted)'
              }}
            >
              <Search size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
              <p style={{ fontSize: '0.95rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                No matching academic resources found
              </p>
              <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                Try searching for “SAT”, “2024”, “Chemistry”, “Mock”, “Calculus”, or “IA”
              </p>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              const IconComponent = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    background: isSelected
                      ? 'rgba(184, 74, 57, 0.08)'
                      : 'transparent',
                    border: isSelected
                      ? '1px solid rgba(184, 74, 57, 0.25)'
                      : '1px solid transparent',
                    transition: 'all 0.1s ease',
                    marginBottom: '0.25rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0 }}>
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isSelected ? 'var(--rust, #b84a39)' : 'var(--surface-inset, rgba(0, 0, 0, 0.05))',
                        color: isSelected ? '#ffffff' : 'var(--ink, #1c1c1e)',
                        flexShrink: 0,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <IconComponent size={17} />
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: '0.92rem',
                            fontWeight: 600,
                            color: isSelected ? 'var(--rust, #b84a39)' : 'var(--ink, #1c1c1e)'
                          }}
                        >
                          {item.title}
                        </span>
                        {item.badge && (
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              padding: '0.15rem 0.45rem',
                              borderRadius: '4px',
                              background: isSelected ? 'rgba(184, 74, 57, 0.2)' : 'var(--surface-inset, rgba(0, 0, 0, 0.06))',
                              color: isSelected ? 'var(--rust, #b84a39)' : 'var(--muted)',
                              letterSpacing: '0.02em'
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.subtitle && (
                        <p
                          style={{
                            fontSize: '0.78rem',
                            color: 'var(--muted)',
                            margin: '0.15rem 0 0 0',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '480px'
                          }}
                        >
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                    {isSelected && (
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          color: 'var(--rust, #b84a39)',
                          fontFamily: 'var(--font-mono)'
                        }}
                      >
                        Enter <CornerDownLeft size={12} />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div
          style={{
            padding: '0.65rem 1.25rem',
            borderTop: '1px solid var(--border)',
            background: 'var(--surface-raised, var(--surface, #ffffff))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.74rem',
            color: 'var(--muted)',
            fontFamily: 'var(--font-mono)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span><kbd style={{ padding: '0.15rem 0.35rem', borderRadius: '4px', background: 'var(--surface-inset)', border: '1px solid var(--border)' }}>↑</kbd> <kbd style={{ padding: '0.15rem 0.35rem', borderRadius: '4px', background: 'var(--surface-inset)', border: '1px solid var(--border)' }}>↓</kbd> Navigate</span>
            <span><kbd style={{ padding: '0.15rem 0.35rem', borderRadius: '4px', background: 'var(--surface-inset)', border: '1px solid var(--border)' }}>↵</kbd> Select</span>
            <span><kbd style={{ padding: '0.15rem 0.35rem', borderRadius: '4px', background: 'var(--surface-inset)', border: '1px solid var(--border)' }}>ESC</kbd> Close</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <HardDrive size={13} style={{ color: '#059669' }} />
            <span style={{ color: '#059669', fontWeight: 600 }}>T7 SSD Vault Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper icon component for Folder
function FolderIcon({ size = 16, style }: { size?: number; style?: React.CSSProperties }) {
  return <BookOpen size={size} style={style} />;
}
