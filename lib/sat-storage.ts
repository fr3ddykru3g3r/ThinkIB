'use client';

export interface MistakeEntry {
  questionId: string;
  section: 'reading-writing' | 'math';
  domain: string;
  skill?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | string;
  prompt: string;
  choices?: string[];
  correctAnswer: string;
  userAnswer: string;
  rationale: string;
  missedAt: number; // unix timestamp
  attemptsCount: number;
  mastered: boolean;
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
  prompt: string;
  choices?: string[];
  correctAnswer: string;
  userAnswer: string;
  rationale: string;
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
        prompt: item.prompt,
        choices: item.choices || [],
        correctAnswer: item.correctAnswer,
        userAnswer: item.userAnswer,
        rationale: item.rationale || '',
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
