import fs from 'fs';
import path from 'path';

export interface SATQuestion {
  questionId: string;
  pageNumber: number;
  exam: string;
  domain: string;
  skill: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  broadArchetype: string;
  conceptLabel: string;
  prompt: string;
  choices: string[];
  correctAnswer: string;
  rationale: string;
  section?: 'reading-writing' | 'math';
}

export interface SATTaxonomyDomain {
  domain: string;
  skills: {
    skill: string;
    difficulty: string;
    archetype: string;
    conceptLabel: string;
    count: number;
    originalWdcFocus?: string;
  }[];
}

export interface SATTaxonomy {
  exam: string;
  domains: SATTaxonomyDomain[];
}

const DATA_DIR = path.join(process.cwd(), 'data', 'sat');

let cachedRW: SATQuestion[] | null = null;
let cachedMath: SATQuestion[] | null = null;
let cachedRWTaxonomy: SATTaxonomy | null = null;
let cachedMathTaxonomy: SATTaxonomy | null = null;

function loadJSON<T>(filename: string): T | null {
  const filePath = path.join(DATA_DIR, filename);
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content) as T;
    }
  } catch (err) {
    console.warn(`[SAT] Could not load ${filename}:`, err);
  }
  return null;
}

export function getRWTaxonomy(): SATTaxonomy | null {
  if (!cachedRWTaxonomy) {
    cachedRWTaxonomy = loadJSON<SATTaxonomy>('sanitized-sat-rw-taxonomy.json');
  }
  return cachedRWTaxonomy;
}

export function getMathTaxonomy(): SATTaxonomy | null {
  if (!cachedMathTaxonomy) {
    cachedMathTaxonomy = loadJSON<SATTaxonomy>('sanitized-sat-math-taxonomy.json');
  }
  return cachedMathTaxonomy;
}

export function getAllRWQuestions(): SATQuestion[] {
  if (!cachedRW) {
    cachedRW = loadJSON<SATQuestion[]>('official-sat-reading-writing.json') || [];
  }
  return cachedRW;
}

export function getAllMathQuestions(): SATQuestion[] {
  if (!cachedMath) {
    cachedMath = loadJSON<SATQuestion[]>('official-sat-math.json') || [];
  }
  return cachedMath;
}

export interface QuestionFilter {
  section?: 'reading-writing' | 'math' | 'all';
  domain?: string;
  skill?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  hasChoicesOnly?: boolean;
  limit?: number;
  offset?: number;
  search?: string;
  randomize?: boolean;
}

export function querySATQuestions(filter: QuestionFilter = {}): {
  questions: SATQuestion[];
  total: number;
  taxonomy: { rw: SATTaxonomy | null; math: SATTaxonomy | null };
} {
  const rw = getAllRWQuestions();
  const math = getAllMathQuestions();

  let pool: SATQuestion[] = [];
  if (filter.section === 'reading-writing') {
    pool = [...rw];
  } else if (filter.section === 'math') {
    pool = [...math];
  } else {
    pool = [...rw, ...math];
  }

  // Filter out questions with empty choices if required
  if (filter.hasChoicesOnly) {
    pool = pool.filter(
      (q) => q.choices && q.choices.length > 0 && q.choices.some((c) => c.trim().length > 0)
    );
  }

  if (filter.difficulty) {
    pool = pool.filter((q) => q.difficulty.toLowerCase() === filter.difficulty!.toLowerCase());
  }

  if (filter.skill) {
    const s = filter.skill.toLowerCase();
    pool = pool.filter((q) => q.skill.toLowerCase().includes(s) || q.conceptLabel.toLowerCase().includes(s));
  }

  if (filter.domain) {
    const d = filter.domain.toLowerCase().trim();
    pool = pool.filter((q) => q.domain.toLowerCase().includes(d) || q.conceptLabel.toLowerCase().includes(d));
  }

  if (filter.search) {
    const q = filter.search.toLowerCase();
    pool = pool.filter(
      (item) =>
        item.prompt.toLowerCase().includes(q) ||
        item.skill.toLowerCase().includes(q) ||
        item.broadArchetype.toLowerCase().includes(q) ||
        item.questionId.toLowerCase().includes(q)
    );
  }

  const total = pool.length;

  if (filter.randomize) {
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
  }

  const offset = filter.offset || 0;
  const limit = filter.limit || 25;
  const paginated = pool.slice(offset, offset + limit);

  return {
    questions: paginated,
    total,
    taxonomy: {
      rw: getRWTaxonomy(),
      math: getMathTaxonomy(),
    },
  };
}

// ----------------------------------------------------
// FULL ADAPTIVE EXAM SIMULATOR ENGINE
// ----------------------------------------------------
export interface FullSATExamModule {
  id: string;
  section: 'reading-writing' | 'math';
  moduleNumber: 1 | 2;
  title: string;
  timeMinutes: number;
  tier: 'standard' | 'easy' | 'hard';
  questions: SATQuestion[];
}

export interface FullSATExam {
  id: string;
  name: string;
  createdAt: string;
  modules: FullSATExamModule[];
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function generateAdaptiveModule(
  section: 'reading-writing' | 'math',
  moduleNumber: 1 | 2,
  tier: 'standard' | 'easy' | 'hard' = 'standard',
  excludeIds: Set<string> = new Set()
): FullSATExamModule {
  const isRW = section === 'reading-writing';
  const allQs = isRW
    ? getAllRWQuestions().filter((q) => q.choices && q.choices.length === 4 && !excludeIds.has(q.questionId))
    : getAllMathQuestions().filter(
        (q) => ((q.choices && q.choices.some((c) => c.trim().length > 0)) || q.correctAnswer) && !excludeIds.has(q.questionId)
      );

  const easyPool = shuffle(allQs.filter((q) => q.difficulty.toLowerCase() === 'easy'));
  const medPool = shuffle(allQs.filter((q) => q.difficulty.toLowerCase() === 'medium'));
  const hardPool = shuffle(allQs.filter((q) => q.difficulty.toLowerCase() === 'hard'));

  let selected: SATQuestion[] = [];

  if (isRW) {
    // 27 Questions Total
    if (moduleNumber === 1 || tier === 'standard') {
      // Balanced Routing Module: 8 Easy, 14 Medium, 5 Hard
      selected = [
        ...easyPool.slice(0, 8),
        ...medPool.slice(0, 14),
        ...hardPool.slice(0, 5),
      ];
    } else if (tier === 'hard') {
      // Module 2 Hard Tier: 2 Easy, 11 Medium, 14 Hard
      selected = [
        ...easyPool.slice(0, 2),
        ...medPool.slice(0, 11),
        ...hardPool.slice(0, 14),
      ];
    } else {
      // Module 2 Easy Tier: 15 Easy, 10 Medium, 2 Hard
      selected = [
        ...easyPool.slice(0, 15),
        ...medPool.slice(0, 10),
        ...hardPool.slice(0, 2),
      ];
    }
  } else {
    // Math: 22 Questions Total
    if (moduleNumber === 1 || tier === 'standard') {
      // Balanced Routing Module: 6 Easy, 12 Medium, 4 Hard
      selected = [
        ...easyPool.slice(0, 6),
        ...medPool.slice(0, 12),
        ...hardPool.slice(0, 4),
      ];
    } else if (tier === 'hard') {
      // Module 2 Hard Tier: 2 Easy, 8 Medium, 12 Hard
      selected = [
        ...easyPool.slice(0, 2),
        ...medPool.slice(0, 8),
        ...hardPool.slice(0, 12),
      ];
    } else {
      // Module 2 Easy Tier: 12 Easy, 8 Medium, 2 Hard
      selected = [
        ...easyPool.slice(0, 12),
        ...medPool.slice(0, 8),
        ...hardPool.slice(0, 2),
      ];
    }
  }

  // Fallback if difficulty buckets fell short of target count
  const targetCount = isRW ? 27 : 22;
  if (selected.length < targetCount) {
    const remaining = shuffle(allQs.filter((q) => !selected.some((s) => s.questionId === q.questionId)));
    selected = [...selected, ...remaining.slice(0, targetCount - selected.length)];
  }

  // Shuffle selected questions so difficulty increases progressively or appears naturally
  selected = shuffle(selected);

  const sectionName = isRW ? 'Reading & Writing' : 'Mathematics';
  const timeMinutes = isRW ? 32 : 35;

  return {
    id: `mod-${isRW ? 'rw' : 'math'}-${moduleNumber}`,
    section,
    moduleNumber,
    title: `Section ${isRW ? '1' : '2'}: ${sectionName} — Module ${moduleNumber}`,
    timeMinutes,
    tier,
    questions: selected,
  };
}

export function generateInitialFullSATExam(): FullSATExam {
  const m1RW = generateAdaptiveModule('reading-writing', 1, 'standard');
  const usedRWIds = new Set(m1RW.questions.map((q) => q.questionId));
  // Default second module is standard until student completes Module 1
  const m2RW = generateAdaptiveModule('reading-writing', 2, 'standard', usedRWIds);

  const m1Math = generateAdaptiveModule('math', 1, 'standard');
  const usedMathIds = new Set(m1Math.questions.map((q) => q.questionId));
  const m2Math = generateAdaptiveModule('math', 2, 'standard', usedMathIds);

  return {
    id: `exam-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: 'Official Digital SAT Practice Exam',
    createdAt: new Date().toISOString(),
    modules: [m1RW, m2RW, m1Math, m2Math],
  };
}

// ----------------------------------------------------
// DIGITAL SAT EQUATING SCORING ENGINE (400 - 1600)
// ----------------------------------------------------
export function calculateSATScore(
  rwCorrect: number,
  totalRW: number,
  mathCorrect: number,
  totalMath: number,
  isRWHard: boolean = true,
  isMathHard: boolean = true
): {
  totalScore: number;
  rwScore: number;
  mathScore: number;
  percentile: number;
} {
  // Official Digital SAT Scoring with 2-Stage Adaptive Weighting:
  // If routed to Module 2 Hard: max score is 800, min score ~440.
  // If routed to Module 2 Easy: score ceiling is capped around 580-600.
  
  const rwRatio = Math.max(0, Math.min(1, rwCorrect / (totalRW || 54)));
  let rwScore: number;
  if (isRWHard) {
    // Higher curve
    rwScore = Math.round((430 + rwRatio * 370) / 10) * 10;
  } else {
    // Capped curve
    rwScore = Math.round((200 + rwRatio * 390) / 10) * 10;
    rwScore = Math.min(rwScore, 590);
  }

  const mathRatio = Math.max(0, Math.min(1, mathCorrect / (totalMath || 44)));
  let mathScore: number;
  if (isMathHard) {
    mathScore = Math.round((430 + mathRatio * 370) / 10) * 10;
  } else {
    mathScore = Math.round((200 + mathRatio * 390) / 10) * 10;
    mathScore = Math.min(mathScore, 590);
  }

  const totalScore = Math.min(1600, Math.max(400, rwScore + mathScore));

  let percentile = 50;
  if (totalScore >= 1550) percentile = 99;
  else if (totalScore >= 1500) percentile = 98;
  else if (totalScore >= 1400) percentile = 94;
  else if (totalScore >= 1300) percentile = 86;
  else if (totalScore >= 1200) percentile = 74;
  else if (totalScore >= 1100) percentile = 59;
  else if (totalScore >= 1000) percentile = 43;
  else if (totalScore >= 900) percentile = 28;
  else percentile = 15;

  return {
    totalScore,
    rwScore,
    mathScore,
    percentile,
  };
}
