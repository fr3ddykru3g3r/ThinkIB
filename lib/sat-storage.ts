'use client';

export type SatErrorTag = 'concept_gap' | 'examiner_trap' | 'careless_calc' | 'time_pressure';

export interface MistakeEntry {
  questionId: string;
  section: 'reading-writing' | 'math';
  domain: string;
  skill?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | string;
  correctAnswer: string;
  userAnswer: string;
  selectedAnswer?: string;
  missedAt: number; // unix timestamp
  timestamp?: number;
  attemptsCount: number;
  retryCount?: number;
  mastered: boolean;
  errorTag?: SatErrorTag;
  timeSpentMs?: number;
  prompt?: string;
  choices?: string[];
  rationale?: string;
}

export interface ExamHistoryEntry {
  reviewSessionId?: string;
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
const SEEN_KEY = 'sat_seen_ids_v1';
const SKILL_KEY = 'sat_skill_stats_v1';

// Safe localStorage accessors with SSR guards & QuotaExceededError handling
function safeGetItem(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch (err) {
    console.warn(`[sat-storage] Failed reading ${key}:`, err);
    return null;
  }
}

function safeRemoveItem(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn(`[sat-storage] Failed removing ${key}:`, err);
  }
}

function safeSetItem(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch (err: any) {
    const isQuota =
      err?.name === 'QuotaExceededError' ||
      err?.code === 22 ||
      err?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      err?.number === -2147024882;

    if (isQuota) {
      console.warn('[sat-storage] Quota exceeded. Pruning the seen-question cache...');
      try {
        // Preserve completed tests. Only the expendable seen-question cache may be pruned.
        // 2. Prune seen IDs (keep last 500)
        const rawSeen = safeGetItem(SEEN_KEY);
        if (rawSeen) {
          const seen = JSON.parse(rawSeen);
          if (Array.isArray(seen) && seen.length > 500) {
            localStorage.setItem(SEEN_KEY, JSON.stringify(seen.slice(-500)));
          }
        }
        // 3. Retry setting item
        localStorage.setItem(key, value);
      } catch (retryErr) {
        console.error('[sat-storage] Failed writing to localStorage even after pruning:', retryErr);
      }
    } else {
      console.warn(`[sat-storage] Failed writing to ${key}:`, err);
    }
  }
}

// Compact migration helper: strips prompt, choices, rationale
function compactMistake(raw: any): MistakeEntry {
  const ans = raw.userAnswer || raw.selectedAnswer || '';
  const ts = raw.missedAt || raw.timestamp || Date.now();
  const count = raw.attemptsCount || raw.retryCount || 1;

  return {
    questionId: String(raw.questionId || ''),
    section: raw.section === 'reading-writing' ? 'reading-writing' : 'math',
    domain: String(raw.domain || 'General'),
    skill: raw.skill ? String(raw.skill) : '',
    difficulty: raw.difficulty || 'Medium',
    correctAnswer: String(raw.correctAnswer || ''),
    userAnswer: ans,
    selectedAnswer: ans,
    missedAt: ts,
    timestamp: ts,
    attemptsCount: count,
    retryCount: count,
    mastered: Boolean(raw.mastered),
    errorTag: raw.errorTag,
    timeSpentMs: typeof raw.timeSpentMs === 'number' ? raw.timeSpentMs : undefined,
  };
}

export function getMistakeVault(): MistakeEntry[] {
  const raw = safeGetItem(MISTAKES_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    let needsCompaction = false;
    const compacted = parsed.map((m: any) => {
      if (m && (m.prompt !== undefined || m.choices !== undefined || m.rationale !== undefined)) {
        needsCompaction = true;
      }
      return compactMistake(m);
    });

    if (needsCompaction) {
      safeSetItem(MISTAKES_KEY, JSON.stringify(compacted));
    }
    return compacted;
  } catch (err) {
    console.warn('[sat-storage] Failed to parse mistake vault:', err);
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
  selectedAnswer?: string;
  rationale?: string;
  timeSpentMs?: number;
  errorTag?: SatErrorTag;
}): void {
  try {
    const current = getMistakeVault();
    const existingIdx = current.findIndex((m) => m.questionId === item.questionId);
    const chosenAnswer = item.userAnswer || item.selectedAnswer || '';
    const now = Date.now();

    if (existingIdx >= 0) {
      const existing = current[existingIdx];
      const newCount = (existing.attemptsCount || 1) + 1;
      current[existingIdx] = {
        ...existing,
        userAnswer: chosenAnswer,
        selectedAnswer: chosenAnswer,
        attemptsCount: newCount,
        retryCount: newCount,
        missedAt: now,
        timestamp: now,
        mastered: false,
        timeSpentMs: item.timeSpentMs ?? existing.timeSpentMs,
        errorTag: item.errorTag ?? existing.errorTag,
      };
    } else {
      current.unshift(
        compactMistake({
          questionId: item.questionId,
          section: item.section,
          domain: item.domain || 'General',
          skill: item.skill || '',
          difficulty: item.difficulty || 'Medium',
          correctAnswer: item.correctAnswer,
          userAnswer: chosenAnswer,
          selectedAnswer: chosenAnswer,
          missedAt: now,
          timestamp: now,
          attemptsCount: 1,
          retryCount: 1,
          mastered: false,
          timeSpentMs: item.timeSpentMs,
          errorTag: item.errorTag,
        })
      );
    }

    safeSetItem(MISTAKES_KEY, JSON.stringify(current));
  } catch (err) {
    console.warn('[sat-storage] Failed to save mistake:', err);
  }
}

export function markMistakeMastered(questionId: string, mastered = true): void {
  try {
    const current = getMistakeVault();
    const updated = current.map((m) =>
      m.questionId === questionId ? { ...m, mastered } : m
    );
    safeSetItem(MISTAKES_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('[sat-storage] Failed to update mistake status:', err);
  }
}

export function removeMistake(questionId: string): void {
  try {
    const current = getMistakeVault();
    const updated = current.filter((m) => m.questionId !== questionId);
    safeSetItem(MISTAKES_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('[sat-storage] Failed to remove mistake:', err);
  }
}

export function clearMistakeVault(): void {
  safeRemoveItem(MISTAKES_KEY);
}

// Exam History
export function getExamHistory(): ExamHistoryEntry[] {
  const raw = safeGetItem(EXAM_HISTORY_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('[sat-storage] Failed to load exam history:', err);
    return [];
  }
}

export function saveCompletedExam(entry: Omit<ExamHistoryEntry, 'id' | 'date'>): void {
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
    safeSetItem(EXAM_HISTORY_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.warn('[sat-storage] Failed to save exam history:', err);
  }
}

export function getSeenIds(): string[] {
  const raw = safeGetItem(SEEN_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function markSeen(ids: string[]): void {
  try {
    const set = new Set([...getSeenIds(), ...ids]);
    safeSetItem(SEEN_KEY, JSON.stringify(Array.from(set).slice(-3400)));
  } catch {
    /* quota / private mode */
  }
}

export interface SkillStat {
  section: 'reading-writing' | 'math';
  domain: string;
  skill: string;
  correct: number;
  total: number;
}

export function getSkillStats(): SkillStat[] {
  const raw = safeGetItem(SKILL_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function recordAttempts(
  items: { section: 'reading-writing' | 'math'; domain: string; skill: string; correct: boolean }[]
): void {
  if (!items.length) return;
  try {
    const stats = getSkillStats();
    for (const it of items) {
      let s = stats.find((x) => x.section === it.section && x.skill === it.skill);
      if (!s) {
        s = { section: it.section, domain: it.domain, skill: it.skill, correct: 0, total: 0 };
        stats.push(s);
      }
      s.total++;
      if (it.correct) s.correct++;
    }
    safeSetItem(SKILL_KEY, JSON.stringify(stats));
  } catch {
    /* quota / private mode */
  }
}

export function updateMistakeErrorTag(questionId: string, tag: SatErrorTag): void {
  try {
    const vault = getMistakeVault();
    const entry = vault.find((m) => m.questionId === questionId);
    if (entry) {
      entry.errorTag = tag;
      safeSetItem(MISTAKES_KEY, JSON.stringify(vault));
    }
  } catch (err) {
    console.warn('[sat-storage] Failed to update mistake error tag:', err);
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
