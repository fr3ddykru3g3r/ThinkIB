import fs from 'fs';
import path from 'path';
import type { SATQuestion } from './sat-types';

export type { SATQuestion } from './sat-types';

const DATA_DIR = path.join(process.cwd(), 'data', 'sat');

let cachedRW: SATQuestion[] | null = null;
let cachedMath: SATQuestion[] | null = null;
let byId: Map<string, SATQuestion> | null = null;

function loadJSON<T>(filename: string): T | null {
  const filePath = path.join(DATA_DIR, filename);
  try {
    if (fs.existsSync(filePath)) return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
  } catch (err) {
    console.warn(`[SAT] Could not load ${filename}:`, err);
  }
  return null;
}

/** Drop the handful of items whose choices couldn't be recovered from the PDF, rather than show blank options. */
function isUsable(q: SATQuestion): boolean {
  if (q.type === 'spr') return !!q.correctAnswer;
  if (!q.choices || q.choices.length !== 4 || !'ABCD'.includes(q.correctAnswer)) return false;
  return q.choices.every((c, i) => c.trim() || (q.choiceMedia?.[i]?.length ?? 0) > 0);
}

export function getAllRWQuestions(): SATQuestion[] {
  if (!cachedRW) cachedRW = (loadJSON<SATQuestion[]>('official-sat-reading-writing.json') || []).filter(isUsable);
  return cachedRW;
}

export function getAllMathQuestions(): SATQuestion[] {
  if (!cachedMath) cachedMath = (loadJSON<SATQuestion[]>('official-sat-math.json') || []).filter(isUsable);
  return cachedMath;
}

export function getQuestionsByIds(ids: string[]): SATQuestion[] {
  if (!byId) {
    byId = new Map();
    for (const q of [...getAllRWQuestions(), ...getAllMathQuestions()]) byId.set(q.questionId, q);
  }
  return ids.map((id) => byId!.get(id)).filter((q): q is SATQuestion => !!q);
}

// ----------------------------------------------------------------------------
// Blueprint (College Board Digital SAT test specifications)
// ----------------------------------------------------------------------------
export const RW_DOMAIN_ORDER = ['Craft and Structure', 'Information and Ideas', 'Standard English Conventions', 'Expression of Ideas'];
export const MATH_DOMAIN_ORDER = ['Algebra', 'Advanced Math', 'Problem-Solving and Data Analysis', 'Geometry and Trigonometry'];

// Order in which Bluebook presents skills inside a domain.
const SKILL_ORDER = [
  'Words in Context', 'Text Structure and Purpose', 'Cross-Text Connections',
  'Central Ideas and Details', 'Command of Evidence', 'Inferences',
  'Boundaries', 'Form, Structure, and Sense',
  'Rhetorical Synthesis', 'Transitions',
  'Linear equations in one variable', 'Linear functions', 'Linear equations in two variables',
  'Systems of two linear equations in two variables', 'Linear inequalities in one or two variables',
  'Equivalent expressions', 'Nonlinear equations in one variable and systems of equations in two variables', 'Nonlinear functions',
  'Ratios, rates, proportional relationships, and units', 'Percentages', 'One-variable data: Distributions and measures of center and spread',
  'Two-variable data: Models and scatterplots', 'Probability and conditional probability',
  'Inference from sample statistics and margin of error', 'Evaluating statistical claims: Observational studies and experiments',
  'Area and volume', 'Lines, angles, and triangles', 'Right triangles and trigonometry', 'Circles',
];

type Tier = 'standard' | 'easy' | 'hard';
type DiffCounts = { Easy: number; Medium: number; Hard: number };

/** Questions per module (scored + 2 unscored pretest), as on the real test. */
const RW_MODULE = { total: 27, minutes: 32 };
const MATH_MODULE = { total: 22, minutes: 35 };

// Domain mix per module: C&S ~28%, I&I ~26%, SEC ~26%, EOI ~20% (R&W);
// Algebra ~35%, Adv. Math ~35%, PSDA ~15%, Geo/Trig ~15% (Math).
const RW_DOMAIN_QUOTA: Record<string, number> = {
  'Craft and Structure': 8, 'Information and Ideas': 7, 'Standard English Conventions': 7, 'Expression of Ideas': 5,
};
const MATH_DOMAIN_QUOTA: [Record<string, number>, Record<string, number>] = [
  { Algebra: 8, 'Advanced Math': 7, 'Problem-Solving and Data Analysis': 3, 'Geometry and Trigonometry': 4 },
  { Algebra: 7, 'Advanced Math': 8, 'Problem-Solving and Data Analysis': 4, 'Geometry and Trigonometry': 3 },
];

// Module 1 is a broad mix; Module 2 leans harder or easier depending on routing.
const DIFF_SHARE: Record<Tier, [number, number, number]> = {
  standard: [0.3, 0.5, 0.2],
  easy: [0.55, 0.38, 0.07],
  hard: [0.08, 0.37, 0.55],
};

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Largest-remainder split of n items across the tier's difficulty shares. */
function splitDifficulty(n: number, tier: Tier): DiffCounts {
  const shares = DIFF_SHARE[tier];
  const raw = shares.map((s) => s * n);
  const base = raw.map(Math.floor);
  let left = n - base.reduce((a, b) => a + b, 0);
  const order = raw.map((r, i) => [r - base[i], i] as const).sort((a, b) => b[0] - a[0]);
  for (const [, i] of order) {
    if (left <= 0) break;
    base[i]++;
    left--;
  }
  return { Easy: base[0], Medium: base[1], Hard: base[2] };
}

const DIFF_FALLBACK: Record<string, string[]> = {
  Easy: ['Easy', 'Medium', 'Hard'],
  Medium: ['Medium', 'Easy', 'Hard'],
  Hard: ['Hard', 'Medium', 'Easy'],
};

export interface FullSATExamModule {
  id: string;
  section: 'reading-writing' | 'math';
  moduleNumber: 1 | 2;
  title: string;
  timeMinutes: number;
  tier: Tier;
  questions: SATQuestion[];
}

export interface FullSATExam {
  id: string;
  name: string;
  createdAt: string;
  modules: FullSATExamModule[];
}

export function generateAdaptiveModule(
  section: 'reading-writing' | 'math',
  moduleNumber: 1 | 2,
  tier: Tier = 'standard',
  excludeIds: Set<string> = new Set(),
  seenIds: Set<string> = new Set()
): FullSATExamModule {
  const isRW = section === 'reading-writing';
  const spec = isRW ? RW_MODULE : MATH_MODULE;
  const effectiveTier: Tier = moduleNumber === 1 ? 'standard' : tier;
  const domainOrder = isRW ? RW_DOMAIN_ORDER : MATH_DOMAIN_ORDER;
  const quota = isRW ? RW_DOMAIN_QUOTA : MATH_DOMAIN_QUOTA[moduleNumber - 1];

  const all = (isRW ? getAllRWQuestions() : getAllMathQuestions()).filter((q) => !excludeIds.has(q.questionId));

  // buckets[domain][difficulty] = questions, never-seen first so repeat takers get fresh items
  const buckets = new Map<string, Map<string, SATQuestion[]>>();
  for (const d of domainOrder) buckets.set(d, new Map([['Easy', []], ['Medium', []], ['Hard', []]]));
  const unseen = shuffle(all.filter((q) => !seenIds.has(q.questionId)));
  const seen = shuffle(all.filter((q) => seenIds.has(q.questionId)));
  for (const q of [...unseen, ...seen]) buckets.get(q.domain)?.get(q.difficulty)?.push(q);

  // Difficulty is planned across the whole module first, then spread over domains,
  // so a module's overall Easy/Medium/Hard mix matches its tier.
  const modulePlan = splitDifficulty(spec.total, effectiveTier);
  const remaining: DiffCounts = { ...modulePlan };

  const picked: SATQuestion[] = [];
  for (const domain of domainOrder) {
    const n = quota[domain];
    const b = buckets.get(domain)!;
    // proportional share of remaining difficulty budget for this domain
    const share: DiffCounts = { Easy: 0, Medium: 0, Hard: 0 };
    const totalRemaining = remaining.Easy + remaining.Medium + remaining.Hard;
    const want = (['Easy', 'Medium', 'Hard'] as const).map((d) => [d, (remaining[d] / Math.max(1, totalRemaining)) * n] as const);
    let assigned = 0;
    for (const [d, w] of want) {
      share[d] = Math.min(Math.floor(w), remaining[d]);
      assigned += share[d];
    }
    const byFrac = [...want].sort((a, b2) => (b2[1] % 1) - (a[1] % 1));
    let guard = 0;
    while (assigned < n && guard++ < 12) {
      for (const [d] of byFrac) {
        if (assigned >= n) break;
        if (share[d] < remaining[d]) {
          share[d]++;
          assigned++;
        }
      }
      if (guard > 6 && assigned < n) {
        share.Medium += n - assigned;
        assigned = n;
      }
    }
    for (const d of ['Easy', 'Medium', 'Hard'] as const) {
      for (let i = 0; i < share[d]; i++) {
        const src = DIFF_FALLBACK[d].find((k) => (b.get(k) || []).length > 0);
        if (!src) continue;
        picked.push(b.get(src)!.shift()!);
        if (remaining[src as keyof DiffCounts] > 0) remaining[src as keyof DiffCounts]--;
      }
    }
  }

  // If a domain ran dry, top up from anywhere so the module is always full-length.
  if (picked.length < spec.total) {
    const have = new Set(picked.map((q) => q.questionId));
    for (const q of shuffle(all)) {
      if (picked.length >= spec.total) break;
      if (!have.has(q.questionId)) picked.push(q);
    }
  }

  // Bluebook order: by domain, then skill group, easier before harder inside a skill.
  const diffRank: Record<string, number> = { Easy: 0, Medium: 1, Hard: 2 };
  const skillRank = (s: string) => {
    const i = SKILL_ORDER.indexOf(s);
    return i < 0 ? 999 : i;
  };
  picked.sort(
    (a, b) =>
      domainOrder.indexOf(a.domain) - domainOrder.indexOf(b.domain) ||
      skillRank(a.skill) - skillRank(b.skill) ||
      diffRank[a.difficulty] - diffRank[b.difficulty]
  );

  // Two unscored pretest items per module, indistinguishable to the student.
  const pretestIdx = new Set(shuffle(picked.map((_, i) => i)).slice(0, 2));
  const questions = picked.map((q, i) => ({ ...q, pretest: pretestIdx.has(i) }));

  return {
    id: `mod-${isRW ? 'rw' : 'math'}-${moduleNumber}`,
    section,
    moduleNumber,
    title: `${isRW ? 'Reading and Writing' : 'Math'}: Module ${moduleNumber}`,
    timeMinutes: spec.minutes,
    tier: effectiveTier,
    questions,
  };
}

export function generateInitialFullSATExam(seenIds: Set<string> = new Set()): FullSATExam {
  const m1RW = generateAdaptiveModule('reading-writing', 1, 'standard', new Set(), seenIds);
  const m1Math = generateAdaptiveModule('math', 1, 'standard', new Set(), seenIds);
  // Placeholders: the real Module 2 is generated after Module 1 is submitted (adaptive routing).
  const m2RW = generateAdaptiveModule('reading-writing', 2, 'standard', new Set(m1RW.questions.map((q) => q.questionId)), seenIds);
  const m2Math = generateAdaptiveModule('math', 2, 'standard', new Set(m1Math.questions.map((q) => q.questionId)), seenIds);

  return {
    id: `exam-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: 'Digital SAT Practice Exam',
    createdAt: new Date().toISOString(),
    modules: [m1RW, m2RW, m1Math, m2Math],
  };
}

// ----------------------------------------------------------------------------
// Question search / drills
// ----------------------------------------------------------------------------
export interface QuestionFilter {
  section?: 'reading-writing' | 'math' | 'all';
  domain?: string;
  skill?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  type?: 'mcq' | 'spr';
  limit?: number;
  offset?: number;
  search?: string;
  randomize?: boolean;
  excludeIds?: string[];
}

export interface FacetSkill {
  skill: string;
  count: number;
}
export interface FacetDomain {
  domain: string;
  count: number;
  skills: FacetSkill[];
}

export function getFacets(): { rw: FacetDomain[]; math: FacetDomain[] } {
  const build = (qs: SATQuestion[], order: string[]): FacetDomain[] => {
    const map = new Map<string, Map<string, number>>();
    for (const q of qs) {
      if (!map.has(q.domain)) map.set(q.domain, new Map());
      const m = map.get(q.domain)!;
      m.set(q.skill, (m.get(q.skill) || 0) + 1);
    }
    return order
      .filter((d) => map.has(d))
      .map((d) => {
        const skills = Array.from(map.get(d)!.entries()).map(([skill, count]) => ({ skill, count }));
        skills.sort((a, b) => SKILL_ORDER.indexOf(a.skill) - SKILL_ORDER.indexOf(b.skill));
        return { domain: d, count: skills.reduce((a, s) => a + s.count, 0), skills };
      });
  };
  return { rw: build(getAllRWQuestions(), RW_DOMAIN_ORDER), math: build(getAllMathQuestions(), MATH_DOMAIN_ORDER) };
}

export function querySATQuestions(filter: QuestionFilter = {}) {
  const rw = getAllRWQuestions();
  const math = getAllMathQuestions();
  let pool: SATQuestion[] =
    filter.section === 'reading-writing' ? [...rw] : filter.section === 'math' ? [...math] : [...rw, ...math];

  if (filter.difficulty) pool = pool.filter((q) => q.difficulty === filter.difficulty);
  if (filter.type) pool = pool.filter((q) => (q.type || 'mcq') === filter.type);
  if (filter.domain) pool = pool.filter((q) => q.domain === filter.domain);
  if (filter.skill) pool = pool.filter((q) => q.skill === filter.skill);
  if (filter.excludeIds?.length) {
    const ex = new Set(filter.excludeIds);
    pool = pool.filter((q) => !ex.has(q.questionId));
  }
  if (filter.search) {
    const s = filter.search.toLowerCase();
    pool = pool.filter((q) => q.prompt.toLowerCase().includes(s) || q.skill.toLowerCase().includes(s) || q.questionId.startsWith(s));
  }

  const total = pool.length;
  if (filter.randomize) pool = shuffle(pool);

  const offset = filter.offset || 0;
  const limit = Math.min(filter.limit || 25, 100);
  return { questions: pool.slice(offset, offset + limit), total };
}
