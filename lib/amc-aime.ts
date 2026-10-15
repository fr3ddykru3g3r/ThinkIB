/**
 * lib/amc-aime.ts
 * Core types, data loaders, synthesis matching engine, and contest scoring
 * for the AMC 12 and AIME Concept-to-Synthesis Platform.
 */

import rawCurriculumTopics from '@/data/amc-aime/curriculum-topics.json';
import rawPastProblems from '@/data/amc-aime/past-problems.json';
import rawSynthesisRecipes from '@/data/amc-aime/synthesis-recipes.json';

export type ContestType = 'AMC12A' | 'AMC12B' | 'AIME_I' | 'AIME_II';

export interface AMCStage {
  stage: number;
  title: string;
  guidance: string;
}

export interface AMCProblemDeconstruction {
  problemId: string;
  contest: ContestType;
  year: number;
  problemNumber: number;
  stemLatex: string;
  stages: AMCStage[];
}

export interface AMCSubtopic {
  id: string;
  title: string;
  aopsVolRef: string;
  conceptTheory: string;
  triggerSignals: string[];
  realProblemDeconstruction?: AMCProblemDeconstruction;
  synthesisConnections: string[];
}

export interface AMCDomain {
  id: string;
  title: string;
  icon: string;
  description: string;
  subtopics: AMCSubtopic[];
}

export interface AMCTriggerClue {
  quoteFromStem: string;
  meaning: string;
}

export interface AMCProgressiveStep {
  stepTitle: string;
  hintQuestion: string;
  workLatex: string;
}

export interface AMCAlternativeSolution {
  methodName: string;
  whenToPrefer: string;
  fullSolutionLatex: string;
}

export interface AMCContestProblem {
  id: string;
  contest: ContestType;
  year: number;
  problemNumber: number;
  difficultyRating: number; // 1.0 - 7.0
  primaryTopic: string;
  secondaryTopics: string[];
  isCrossTopicSynthesis: boolean;
  statementLatex: string;
  choices?: string[]; // Empty or 5 choices for AMC 12
  correctAnswer: string; // 'A'-'E' or 3-digit string '000'-'999' for AIME
  anatomy?: {
    triggerClues: AMCTriggerClue[];
    synthesisBridge: string;
    cruxStep: string;
  };
  progressiveSteps?: AMCProgressiveStep[];
  alternativeSolutions?: AMCAlternativeSolution[];
  commonTraps?: string[];
}

export interface AMCSynthesisRecipe {
  domainA: string;
  domainB: string;
  title: string;
  coreBridgeIdentity: string;
  tacticalAdvice: string;
  yieldFrequency: string;
}

export interface AMC12ScoreReport {
  correctCount: number;
  blankCount: number;
  wrongCount: number;
  totalScore: number;
  maxScore: number;
  percentileEstimate: number;
  qualifiedForAIME: boolean;
  historicalCutoffRange: string;
  advice: string;
}

export interface AIMEScoreReport {
  correctCount: number;
  totalQuestions: number;
  score: number;
  usamoIndexWithAMC12?: (amc12Score: number) => number;
  honorableMentionEligible: boolean;
}

// Data Getters
export function getAllDomains(): AMCDomain[] {
  return rawCurriculumTopics as AMCDomain[];
}

export function getDomainById(id: string): AMCDomain | undefined {
  return getAllDomains().find((d) => d.id === id);
}

export function getSubtopicById(domainId: string, subtopicId: string): AMCSubtopic | undefined {
  const domain = getDomainById(domainId);
  return domain?.subtopics.find((s) => s.id === subtopicId);
}

export interface ProblemFilterOptions {
  contest?: ContestType | 'ALL';
  topic?: string;
  maxDifficulty?: number;
  minDifficulty?: number;
  onlySynthesis?: boolean;
}

export function getAllPastProblems(filter?: ProblemFilterOptions): AMCContestProblem[] {
  let list = rawPastProblems as AMCContestProblem[];
  if (!filter) return list;

  if (filter.contest && filter.contest !== 'ALL') {
    list = list.filter((p) => p.contest === filter.contest);
  }
  if (filter.topic && filter.topic !== 'ALL') {
    list = list.filter(
      (p) =>
        p.primaryTopic.toLowerCase().includes(filter.topic!.toLowerCase()) ||
        p.secondaryTopics.some((st) => st.toLowerCase().includes(filter.topic!.toLowerCase()))
    );
  }
  if (filter.minDifficulty !== undefined) {
    list = list.filter((p) => p.difficultyRating >= filter.minDifficulty!);
  }
  if (filter.maxDifficulty !== undefined) {
    list = list.filter((p) => p.difficultyRating <= filter.maxDifficulty!);
  }
  if (filter.onlySynthesis) {
    list = list.filter((p) => p.isCrossTopicSynthesis);
  }
  return list;
}

export function getPastProblemById(id: string): AMCContestProblem | undefined {
  return (rawPastProblems as AMCContestProblem[]).find((p) => p.id === id);
}

export function getAllSynthesisRecipes(): AMCSynthesisRecipe[] {
  return rawSynthesisRecipes as AMCSynthesisRecipe[];
}

export function getSynthesisRecipesForDomain(domainId: string): AMCSynthesisRecipe[] {
  return getAllSynthesisRecipes().filter(
    (r) => r.domainA === domainId || r.domainB === domainId
  );
}

export function getSynthesisRecipeBetween(domainA: string, domainB: string): AMCSynthesisRecipe | undefined {
  return getAllSynthesisRecipes().find(
    (r) =>
      (r.domainA === domainA && r.domainB === domainB) ||
      (r.domainA === domainB && r.domainB === domainA)
  );
}

/**
 * AMC 12 Scoring Engine
 * +6 for correct, +1.5 for blank, 0 for wrong. Max = 150.
 * AIME cutoff historically oscillates between 85.5 and 94.5 (median ~90).
 */
export function calculateAMC12Score(
  correctCount: number,
  blankCount: number,
  wrongCount: number
): AMC12ScoreReport {
  const totalScore = correctCount * 6 + blankCount * 1.5;
  const maxScore = 150;
  const qualifiedForAIME = totalScore >= 90;

  // Empirical percentile mapping for AMC 12
  let percentileEstimate = 50;
  if (totalScore >= 120) percentileEstimate = 99.5;
  else if (totalScore >= 105) percentileEstimate = 98;
  else if (totalScore >= 90) percentileEstimate = 95;
  else if (totalScore >= 75) percentileEstimate = 85;
  else if (totalScore >= 60) percentileEstimate = 70;
  else percentileEstimate = Math.max(10, Math.round((totalScore / 60) * 60));

  let advice = '';
  if (totalScore >= 100) {
    advice = 'Solid AIME qualifier! Focus on high-number synthesis (AMC 12 #19–25 & AIME #6–12).';
  } else if (qualifiedForAIME) {
    advice = 'Borderline AIME qualification range. Tighten your Expected Value guessing rules on questions 13–18.';
  } else {
    advice = 'Target 12+ correct answers and protect blanks (1.5 pts each) instead of low-probability random guesses.';
  }

  return {
    correctCount,
    blankCount,
    wrongCount,
    totalScore,
    maxScore,
    percentileEstimate,
    qualifiedForAIME,
    historicalCutoffRange: '88.5 – 93.0',
    advice,
  };
}

/**
 * AIME Scoring Engine
 * 15 integer questions (000–999). 1 pt each.
 */
export function calculateAIMEScore(correctCount: number, totalQuestions = 15): AIMEScoreReport {
  return {
    correctCount,
    totalQuestions,
    score: correctCount,
    usamoIndexWithAMC12: (amc12Score: number) => amc12Score + 10 * correctCount,
    honorableMentionEligible: correctCount >= 7,
  };
}

/**
 * USA(J)MO Index Calculator
 * Index = AMC 12 Score + 10 * AIME Score
 * Typically:
 * USAMO threshold: ~220 - 240
 * USAJMO threshold: ~195 - 215
 */
export function calculateUSAMOIndex(amc12Score: number, aimeScore: number) {
  const index = amc12Score + 10 * aimeScore;
  const usamoTarget = 225;
  const usajmoTarget = 205;

  return {
    index,
    usamoTarget,
    usajmoTarget,
    qualifiesUSAMO: index >= usamoTarget,
    qualifiesUSAJMO: index >= usajmoTarget,
    deltaToUSAMO: usamoTarget - index,
  };
}

/**
 * Expected Value Analysis for AMC 12 Guessing
 * 5 options total. If you eliminate k choices:
 * EV(guess) = (1 / (5 - k)) * 6
 * Value of blank = 1.5
 */
export function calculateGuessingEV(eliminatedChoicesCount: number): {
  ev: number;
  blankValue: number;
  recommendGuess: boolean;
  rationale: string;
} {
  const remaining = Math.max(1, 5 - eliminatedChoicesCount);
  const ev = 6 / remaining;
  const blankValue = 1.5;

  if (eliminatedChoicesCount === 0) {
    return {
      ev,
      blankValue,
      recommendGuess: false,
      rationale: 'Random guess EV = 1.20 pts < 1.5 pts blank. LEAVE BLANK.',
    };
  } else if (eliminatedChoicesCount === 1) {
    return {
      ev,
      blankValue,
      recommendGuess: false,
      rationale: '1 eliminated (4 left): EV = 1.50 pts == 1.5 pts blank. Neutral, blank safer for variance.',
    };
  } else if (eliminatedChoicesCount === 2) {
    return {
      ev,
      blankValue,
      recommendGuess: true,
      rationale: '2 eliminated (3 left): EV = 2.00 pts > 1.5 pts blank. Mathematically favorable GUESS.',
    };
  } else {
    return {
      ev,
      blankValue,
      recommendGuess: true,
      rationale: `${eliminatedChoicesCount} eliminated: EV = ${ev.toFixed(2)} pts >> 1.5 pts blank. STRONG GUESS.`,
    };
  }
}
