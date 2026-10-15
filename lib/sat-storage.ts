'use client';

export type SatErrorTag = 'concept_gap' | 'examiner_trap' | 'careless_calc' | 'time_pressure';

export interface MistakeEntry {
  questionId: string;
  section: 'reading-writing' | 'math';
  domain: string;
  skill?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | string;
  /** Legacy (pre-2026-09) entries stored full content; new entries only keep the id and re-fetch. */
  prompt?: string;
  choices?: string[];
  correctAnswer: string;
  userAnswer: string;
  rationale?: string;
  missedAt: number; // unix timestamp
  attemptsCount: number;
  mastered: boolean;
  errorTag?: SatErrorTag;
}

export interface ExamHistoryEntry {
  id: string;
  date: string;
  totalScore: number;
  rwScore: number;
  mathScore: number;
  percentile: number;
  rwCorrect: number;
  totalRW: number;
  mathCorrect: number;
  totalMath: number;
  isRWHard: boolean;
  isMathHard: boolean;
  avgTimeRWSeconds?: number;
  avgTimeMathSeconds?: number;
  rwRange?: [number, number];
  mathRange?: [number, number];
  /** domain -> [correct, total] */
  domains?: Record<string, [number, number]>;
}

const MISTAKES_KEY = 'sat_mistake_vault_v1';
const EXAM_HISTORY_KEY = 'sat_exam_history_v1';

export function getMistakeVault(): MistakeEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(MISTAKES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('Failed to load mistake vault', err);
    return [];
  }
}

export function saveMistake(item: {
  questionId: string;
  section: 'reading-writing' | 'math';
  domain: string;
  skill?: string;
  difficulty?: string;
  prompt?: string;
  choices?: string[];
  correctAnswer: string;
  userAnswer: string;
  rationale?: string;
}): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getMistakeVault();
    const existingIdx = current.findIndex((m) => m.questionId === item.questionId);

    if (existingIdx >= 0) {
      // Update existing mistake
      current[existingIdx] = {
        ...current[existingIdx],
        userAnswer: item.userAnswer,
        attemptsCount: current[existingIdx].attemptsCount + 1,
        missedAt: Date.now(),
        mastered: false,
      };
    } else {
      // Add new mistake
      current.unshift({
        questionId: item.questionId,
        section: item.section,
        domain: item.domain || 'General',
        skill: item.skill || '',
        difficulty: item.difficulty || 'Medium',
        correctAnswer: item.correctAnswer,
        userAnswer: item.userAnswer,
        missedAt: Date.now(),
        attemptsCount: 1,
        mastered: false,
      });
    }

    localStorage.setItem(MISTAKES_KEY, JSON.stringify(current));
  } catch (err) {
    console.warn('Failed to save mistake', err);
  }
}

export function markMistakeMastered(questionId: string, mastered = true): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getMistakeVault();
    const updated = current.map((m) =>
      m.questionId === questionId ? { ...m, mastered } : m
    );
    localStorage.setItem(MISTAKES_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to update mistake status', err);
  }
}

export function removeMistake(questionId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getMistakeVault();
    const updated = current.filter((m) => m.questionId !== questionId);
    localStorage.setItem(MISTAKES_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to remove mistake', err);
  }
}

export function clearMistakeVault(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(MISTAKES_KEY);
  } catch (err) {
    console.warn('Failed to clear mistake vault', err);
  }
}

// Exam History
export function getExamHistory(): ExamHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(EXAM_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('Failed to load exam history', err);
    return [];
  }
}

export function saveCompletedExam(entry: Omit<ExamHistoryEntry, 'id' | 'date'>): void {
  if (typeof window === 'undefined') return;
  try {
    const history = getExamHistory();
    const newEntry: ExamHistoryEntry = {
      ...entry,
      id: `exam_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    history.unshift(newEntry);
    // Keep last 30 exams
    const trimmed = history.slice(0, 30);
    localStorage.setItem(EXAM_HISTORY_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.warn('Failed to save exam history', err);
  }
}

// Questions already shown in a practice test, so new tests prefer fresh items
const SEEN_KEY = 'sat_seen_ids_v1';

export function getSeenIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) || '[]');
  } catch {
    return [];
  }
}

export function markSeen(ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    const set = new Set([...getSeenIds(), ...ids]);
    localStorage.setItem(SEEN_KEY, JSON.stringify(Array.from(set).slice(-3400)));
  } catch {
    /* quota / private mode */
  }
}

// Per-skill accuracy, fed by drills and full tests; powers the "weakest skills" panel
const SKILL_KEY = 'sat_skill_stats_v1';
export interface SkillStat { section: 'reading-writing' | 'math'; domain: string; skill: string; correct: number; total: number }

export function getSkillStats(): SkillStat[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(SKILL_KEY) || '[]');
  } catch {
    return [];
  }
}

export function recordAttempts(items: { section: 'reading-writing' | 'math'; domain: string; skill: string; correct: boolean }[]): void {
  if (typeof window === 'undefined' || !items.length) return;
  try {
    const stats = getSkillStats();
    for (const it of items) {
      let s = stats.find((x) => x.section === it.section && x.skill === it.skill);
      if (!s) stats.push((s = { section: it.section, domain: it.domain, skill: it.skill, correct: 0, total: 0 }));
      s.total++;
      if (it.correct) s.correct++;
    }
    localStorage.setItem(SKILL_KEY, JSON.stringify(stats));
  } catch {
    /* quota / private mode */
  }
}

export function updateMistakeErrorTag(questionId: string, tag: SatErrorTag): void {
  if (typeof window === 'undefined') return;
  try {
    const vault = getMistakeVault();
    const entry = vault.find((m) => m.questionId === questionId);
    if (entry) {
      entry.errorTag = tag;
      localStorage.setItem(MISTAKES_KEY, JSON.stringify(vault));
    }
  } catch (err) {
    console.warn('Failed to update mistake error tag', err);
  }
}

export function getMistakeErrorTagStats(): Record<SatErrorTag, number> {
  const stats: Record<SatErrorTag, number> = {
    concept_gap: 0,
    examiner_trap: 0,
    careless_calc: 0,
    time_pressure: 0,
  };
  const vault = getMistakeVault();
  vault.forEach((m) => {
    if (m.errorTag && stats[m.errorTag] !== undefined) {
      stats[m.errorTag]++;
    }
  });
  return stats;
}
