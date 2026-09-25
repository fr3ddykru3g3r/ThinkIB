'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Check,
  X,
  Volume2,
  Lightbulb,
  AlertTriangle,
} from 'lucide-react';
import MathView from '@/app/components/MathView';

interface Flashcard {
  id: string;
  front: string;
  frontHint?: string;
  back: string;
  backExample?: string;
  examinerTrap?: string;
  category: string;
  tag: string;
}

interface Deck {
  id: string;
  title: string;
  description: string;
  exam: 'SAT' | 'IB' | 'General';
  cards: Flashcard[];
}

const DECKS: Deck[] = [
  {
    id: 'sat-grammar',
    title: 'SAT Grammar & Conventions Master Deck',
    description: 'High-frequency punctuation, modifier, and syntax rules tested on the digital SAT.',
    exam: 'SAT',
    cards: [
      {
        id: 'sg-1',
        front: 'What makes a Comma Splice, and how do you fix it?',
        frontHint: 'Connecting two independent clauses (complete sentences)',
        back: 'A comma splice occurs when two independent clauses are joined with only a comma. \n\nFix with one of 4 methods:\n1. Period: Clause 1. Clause 2.\n2. Semicolon: Clause 1; Clause 2.\n3. Comma + FANBOYS: Clause 1, and Clause 2.\n4. Subordination: Although Clause 1, Clause 2.',
        backExample: 'Incorrect: The experiment succeeded, the hypothesis was verified.\nCorrect: The experiment succeeded; the hypothesis was verified.',
        examinerTrap: 'Assuming a comma can connect any two thoughts if there is a natural pause in speech. On the SAT, a comma alone between two independent clauses is an automatic comma splice.',
        category: 'Punctuation',
        tag: 'Punctuation',
      },
      {
        id: 'sg-2',
        front: 'What is the strict rule for using a Colon (:)?',
        frontHint: 'Requirements before and after the colon',
        back: 'The clause BEFORE a colon MUST be a complete independent sentence.\n\nThe clause after the colon can be an explanation, list, single word, or elaboration.',
        backExample: 'Correct: She needed one quality to pass: determination.\nIncorrect: The required ingredients are: flour, yeast, and water. (Before is not independent)',
        examinerTrap: 'Placing a colon after verbs like "such as", "including", or "are". A colon can ONLY follow a clause that could stand alone as a complete sentence.',
        category: 'Punctuation',
        tag: 'Punctuation',
      },
      {
        id: 'sg-3',
        front: 'What is a Misplaced or Dangling Modifier?',
        frontHint: 'Introductory participial phrase modifying the wrong subject',
        back: 'An introductory descriptive phrase MUST be immediately followed by the noun it actually describes.',
        backExample: 'Dangling: Walking through the forest, the trees were beautiful. (The trees weren’t walking!)\nCorrect: Walking through the forest, Elena admired the beautiful trees.',
        examinerTrap: 'Assuming the modifier describes the overall situation rather than the specific physical noun that must directly follow the comma.',
        category: 'Syntax & Modifiers',
        tag: 'Modifiers',
      },
      {
        id: 'sg-4',
        front: 'Apostrophe Rules: Its vs It’s vs Its’',
        frontHint: 'Possession vs Contraction',
        back: '• It’s = It is (or It has) [Contraction]\n• Its = Belonging to it [Possessive pronoun - no apostrophe!]\n• Its’ = DOES NOT EXIST in the English language.',
        backExample: 'Correct: The spacecraft rotated on its axis because it’s out of fuel.',
        examinerTrap: 'Assuming possessive "its" needs an apostrophe because nouns do (e.g. John’s). Possessive pronouns (his, hers, its, ours) NEVER use apostrophes.',
        category: 'Apostrophes',
        tag: 'Apostrophes',
      },
      {
        id: 'sg-5',
        front: 'Non-Essential Clauses (Parenthetical Information)',
        frontHint: 'Pairs of commas, dashes, or parentheses',
        back: 'If information can be removed without altering the grammatical core of the sentence, it must be set off by matching punctuation:\n• Two commas: The scientist, who was late, arrived.\n• Two dashes: The scientist—who was late—arrived.\n• Never mix a comma and a dash!',
        backExample: 'Incorrect: Dr. Vance, an astronomer—discovered a new comet.\nCorrect: Dr. Vance—an astronomer—discovered a new comet.',
        examinerTrap: 'Mismatched punctuation: opening with a comma and closing with a dash, or putting commas around essential identifying names.',
        category: 'Punctuation',
        tag: 'Punctuation',
      },
      {
        id: 'sg-6',
        front: 'Subject-Verb Agreement with Prepositional Distractors',
        frontHint: 'Finding the true subject across prepositional phrases',
        back: 'The subject of a sentence is NEVER inside a prepositional phrase (e.g., "of...", "in...", "with..."). Ignore modifying phrases to find the real subject.',
        backExample: 'Example: The collection of rare coins (was / were) preserved.\nTrue subject is "collection" (singular) -> "was preserved".',
        examinerTrap: 'Matching the verb to the noun right before it (coins) instead of the true subject (collection).',
        category: 'Agreement',
        tag: 'Subject-Verb',
      },
      {
        id: 'sg-7',
        front: 'Transition Words: Categorization Strategy',
        frontHint: 'Continuance vs Contrast vs Causation',
        back: 'Group transitions by direction:\n1. Continuance: Furthermore, moreover, in addition\n2. Contrast: However, nevertheless, conversely, on the other hand\n3. Cause/Effect: Consequently, therefore, thus, as a result\n\nIf two options belong to the exact same category and tone, both are usually wrong.',
        examinerTrap: 'Choosing "however" whenever a surprising fact appears, even when the following sentence simply explains or elaborates rather than contradicts.',
        category: 'Transitions',
        tag: 'Transitions',
      },
    ],
  },
  {
    id: 'sat-math',
    title: 'SAT Math Essential Theorems & Formulas',
    description: 'Circle equations, vertex forms, Vieta’s formulas, and key theorems.',
    exam: 'SAT',
    cards: [
      {
        id: 'sm-1',
        front: 'Standard Equation of a Circle & Center/Radius',
        frontHint: 'Given center (h, k) and radius r',
        back: '(x - h)^2 + (y - k)^2 = r^2\n\n• Center is at (h, k) — note the negative signs!\n• Radius is r (square root of the right side).',
        backExample: 'If (x + 3)^2 + (y - 5)^2 = 36:\nCenter = (-3, 5), Radius = √36 = 6.',
        examinerTrap: 'Forgetting that the constant term equals r², not r. If the equation ends in = 36, the radius is 6, not 36!',
        category: 'Geometry',
        tag: 'Circles',
      },
      {
        id: 'sm-2',
        front: 'Quadratic Vertex Form & Axis of Symmetry',
        frontHint: 'Finding vertex (h, k) and maximum/minimum',
        back: 'y = a(x - h)^2 + k\n\n• Vertex is at (h, k)\n• Axis of symmetry: x = h\n• In standard form y = ax^2 + bx + c:\nh = -b / (2a)\nk = f(-b / (2a))',
        examinerTrap: 'Confusing "where the maximum occurs" (x-value) with "what the maximum value is" (y-value). Also watch out for inverted signs: (x - 4)² means h = +4, NOT -4.',
        category: 'Algebra',
        tag: 'Quadratics',
      },
      {
        id: 'sm-3',
        front: 'The Discriminant & Number of Real Solutions',
        frontHint: 'For ax^2 + bx + c = 0',
        back: 'Discriminant: \\Delta = b^2 - 4ac\n\n• If \\Delta > 0: Exactly 2 distinct real solutions (2 x-intercepts)\n• If \\Delta = 0: Exactly 1 real solution (vertex touches x-axis)\n• If \\Delta < 0: No real solutions (0 x-intercepts)',
        examinerTrap: 'Forgetting that when asked for "at least one real solution", the condition is discriminant >= 0 (both >0 and =0 qualify).',
        category: 'Algebra',
        tag: 'Quadratics',
      },
      {
        id: 'sm-4',
        front: 'Vieta’s Formulas (Sum & Product of Quadratic Roots)',
        frontHint: 'For ax^2 + bx + c = 0 with roots r1 and r2',
        back: 'Sum of roots: r_1 + r_2 = -\\frac{b}{a}\n\nProduct of roots: r_1 \\cdot r_2 = \\frac{c}{a}',
        backExample: 'For 3x^2 - 12x + 5 = 0:\nSum of solutions = -(-12) / 3 = 4 (found in 2 seconds without quadratic formula!).',
        examinerTrap: 'Dropping the negative sign in the sum of roots formula -b/a, or confusing sum (-b/a) with product (+c/a).',
        category: 'Advanced Math',
        tag: 'Vieta',
      },
      {
        id: 'sm-5',
        front: 'Special Right Triangles (30-60-90 & 45-45-90)',
        frontHint: 'Side ratios given on the SAT reference sheet',
        back: '• 45-45-90 Triangle: Sides in ratio x : x : x√2\n• 30-60-90 Triangle: Sides in ratio x : x√3 : 2x\n\n(Opposite 30° is x, opposite 60° is x√3, hypotenuse opposite 90° is 2x).',
        category: 'Geometry',
        tag: 'Triangles',
      },
      {
        id: 'sm-6',
        front: 'Exponential Growth and Decay Formula',
        frontHint: 'Initial amount a and rate r',
        back: 'y = a(1 \\pm r)^t\n\n• Growth: y = a(1 + r)^t\n• Decay: y = a(1 - r)^t\n• a = initial value at t = 0\n• (1 + r) is the growth factor; (1 - r) is the decay factor.',
        category: 'Algebra',
        tag: 'Exponentials',
      },
    ],
  },
  {
    id: 'ib-command-terms',
    title: 'IB DP Command Terms & Assessment Criteria',
    description: 'Examiner expectations for "Evaluate", "To what extent", "Discuss", etc.',
    exam: 'IB',
    cards: [
      {
        id: 'ib-1',
        front: 'Command Term: "Evaluate"',
        frontHint: 'Assessment Objective 3 (High Mark Bands)',
        back: 'Make an appraisal by weighing up the strengths and limitations.\n\nMust include:\n• Analysis of both positive and negative aspects.\n• Evidence supporting each side.\n• A justified, supported conclusion weighing which factors are most significant.',
        category: 'Assessment Criteria',
        tag: 'Command Terms',
      },
      {
        id: 'ib-2',
        front: 'Command Term: "To what extent"',
        frontHint: 'Common in History, Economics, and Essay Papers',
        back: 'Consider the merits or otherwise of an argument or concept.\n\nMust include:\n• Clear judgment of the degree to which a statement is valid.\n• Alternative viewpoints and counterclaims.\n• Nuanced final verdict (never a simple binary yes/no).',
        category: 'Assessment Criteria',
        tag: 'Command Terms',
      },
      {
        id: 'ib-3',
        front: 'Command Term: "Discuss"',
        frontHint: 'Balanced presentation of perspectives',
        back: 'Offer a considered and balanced review that includes a range of arguments, factors, or hypotheses.\n\nOpinions or conclusions should be presented clearly and supported by appropriate evidence.',
        category: 'Assessment Criteria',
        tag: 'Command Terms',
      },
      {
        id: 'ib-4',
        front: 'Command Term: "Examine"',
        frontHint: 'Deep structural investigation',
        back: 'Consider an argument or concept in a way that uncovers the assumptions and interrelationships of the issue.',
        category: 'Assessment Criteria',
        tag: 'Command Terms',
      },
      {
        id: 'ib-5',
        front: 'Command Term: "Justify"',
        frontHint: 'Giving valid reasons for a choice or conclusion',
        back: 'Give valid reasons or evidence to support an answer or conclusion.\n\nRequired whenever an examiner asks you to defend your methodological decision, calculation, or hypothesis.',
        category: 'Assessment Criteria',
        tag: 'Command Terms',
      },
    ],
  },
];

export default function FlashcardsPage() {
  const [selectedDeckId, setSelectedDeckId] = useState<string>('sat-grammar');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showCardHint, setShowCardHint] = useState(false);
  const [masteredMap, setMasteredMap] = useState<Record<string, boolean>>({});
  const [deckCards, setDeckCards] = useState<Flashcard[]>(DECKS[0].cards);

  const activeDeck = DECKS.find((d) => d.id === selectedDeckId) || DECKS[0];

  // Load mastered state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('thinkib_flashcards_mastered');
      if (saved) {
        setMasteredMap(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load flashcard state', e);
    }
  }, []);

  // Update deck cards when selected deck changes
  useEffect(() => {
    setDeckCards(activeDeck.cards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowCardHint(false);
  }, [selectedDeckId]);

  const currentCard = deckCards[currentIndex] || deckCards[0];
  const isMastered = !!masteredMap[currentCard?.id];

  const toggleMastered = (cardId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updated = { ...masteredMap, [cardId]: !masteredMap[cardId] };
    setMasteredMap(updated);
    try {
      localStorage.setItem('thinkib_flashcards_mastered', JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to persist mastered state', err);
    }
  };

  const handleNext = () => {
    setIsFlipped(false);
    setShowCardHint(false);
    if (currentIndex < deckCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setShowCardHint(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      setCurrentIndex(deckCards.length - 1);
    }
  };

  const shuffleDeck = () => {
    setIsFlipped(false);
    setShowCardHint(false);
    const shuffled = [...deckCards].sort(() => Math.random() - 0.5);
    setDeckCards(shuffled);
    setCurrentIndex(0);
  };

  const masteredCount = deckCards.filter((c) => masteredMap[c.id]).length;
  const progressPercent = Math.round((masteredCount / deckCards.length) * 100);

  // Keyboard navigation: Space to flip, ArrowLeft to prev, ArrowRight to next
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === 'ArrowLeft' || e.key === 'ArrowLeft') {
        e.preventDefault();
        setIsFlipped(false);
        setShowCardHint(false);
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : deckCards.length - 1));
      } else if (e.code === 'ArrowRight' || e.key === 'ArrowRight') {
        e.preventDefault();
        setIsFlipped(false);
        setShowCardHint(false);
        setCurrentIndex((prev) => (prev < deckCards.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deckCards.length]);

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', paddingBottom: '5rem' }}>
      {/* Top Breadcrumb */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            color: 'var(--muted)',
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={14} /> Back to Directory
        </Link>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--muted)' }}>
          Mastery: <strong style={{ color: 'var(--ink)' }}>{masteredCount}/{deckCards.length}</strong> ({progressPercent}%)
        </div>
      </div>

      <span className="section-label">ACTIVE RECALL ENGINE</span>
      <h1 style={{ fontSize: '2.4rem', marginBottom: '0.5rem' }}>High-Yield Memory Decks</h1>
      <p style={{ color: 'var(--muted)', fontSize: '1.05rem', marginBottom: '2rem' }}>
        Master high-frequency formulas, grammar rules, and IB command terms through active spaced retrieval.
      </p>

      {/* Deck Selector Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        {DECKS.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setSelectedDeckId(d.id)}
            className={`filter-btn ${selectedDeckId === d.id ? 'active' : ''}`}
            style={{ fontSize: '0.86rem', padding: '0.5rem 1rem' }}
          >
            <span>{d.title}</span>
          </button>
        ))}
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: '4px', background: 'var(--border)', borderRadius: '2px', marginBottom: '2rem', overflow: 'hidden' }}>
        <div
          style={{
            width: `${progressPercent}%`,
            height: '100%',
            background: 'var(--accent)',
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      {/* Flashcard 3D Perspective Container */}
      <div
        style={{
          perspective: '1200px',
          minHeight: '360px',
          cursor: 'pointer',
          marginBottom: '1.5rem',
        }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className="panel"
          style={{
            position: 'relative',
            minHeight: '360px',
            padding: '2.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: isFlipped ? 'var(--surface-hover)' : 'var(--surface)',
            borderColor: isFlipped ? 'var(--accent)' : 'var(--border)',
            borderRadius: '12px',
            transition: 'all 0.25s ease',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          }}
        >
          {/* Card Top Meta */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <span className="section-label" style={{ margin: 0 }}>
              {isFlipped ? 'ANSWER / PRINCIPLE' : 'CARD PROMPT'} • {currentCard?.tag}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--muted)' }}>
                {currentIndex + 1} of {deckCards.length}
              </span>
              <button
                type="button"
                onClick={(e) => toggleMastered(currentCard.id, e)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  border: isMastered ? '1px solid #10b981' : '1px solid var(--border)',
                  background: isMastered ? 'rgba(16, 185, 129, 0.15)' : 'var(--surface-hover)',
                  color: isMastered ? '#10b981' : 'var(--ink)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {isMastered ? <Check size={13} /> : null}
                <span>{isMastered ? 'Mastered' : 'Mark Mastered'}</span>
              </button>
            </div>
          </div>

          {/* Card Body */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {!isFlipped ? (
              <div>
                <h2 style={{ fontSize: '1.65rem', marginBottom: '1rem', lineHeight: '1.4', fontFamily: 'var(--font-display)' }}>
                  <MathView content={currentCard?.front || ''} />
                </h2>
                {currentCard?.frontHint && (
                  <div style={{ marginTop: '0.85rem' }} onClick={(e) => e.stopPropagation()}>
                    {showCardHint ? (
                      <div style={{ background: 'rgba(234, 179, 8, 0.12)', border: '1px solid rgba(234, 179, 8, 0.35)', borderRadius: '6px', padding: '0.65rem 0.9rem', color: '#92400e', fontSize: '0.86rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>💡 <strong>Socratic Clue:</strong> {currentCard.frontHint}</span>
                        <button
                          type="button"
                          onClick={() => setShowCardHint(false)}
                          style={{ background: 'transparent', border: 'none', color: '#92400e', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, padding: '2px 6px' }}
                        >
                          Hide
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowCardHint(true)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          background: 'rgba(234, 179, 8, 0.12)',
                          border: '1px solid rgba(234, 179, 8, 0.35)',
                          color: '#b45309',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <Lightbulb size={13} />
                        <span>Need a Socratic Hint?</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '1.05rem', lineHeight: '1.7', color: 'var(--ink)', whiteSpace: 'pre-wrap', marginBottom: '1.25rem' }}>
                  <MathView content={currentCard?.back || ''} />
                </div>
                {currentCard?.backExample && (
                  <div style={{ background: 'rgba(128,128,128,0.08)', padding: '0.85rem 1rem', borderRadius: '6px', fontSize: '0.86rem', color: 'var(--ink)', fontFamily: 'var(--font-mono)', whiteSpace: 'pre-wrap', marginBottom: currentCard?.examinerTrap ? '1rem' : 0 }}>
                    {currentCard.backExample}
                  </div>
                )}
                {currentCard?.examinerTrap && (
                  <div style={{
                    marginTop: '1rem',
                    background: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '6px',
                    padding: '0.75rem 1rem',
                    fontSize: '0.84rem',
                    color: 'var(--ink)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#b45309', fontWeight: 700, fontSize: '0.82rem', marginBottom: '3px' }}>
                      <AlertTriangle size={14} /> EXAMINER TRAP & COMMON MISCONCEPTION
                    </div>
                    <div style={{ lineHeight: '1.5' }}>{currentCard.examinerTrap}</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card Bottom Hint */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1.5rem', fontSize: '0.78rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
            <span>Click card or press Space to {isFlipped ? 'flip back' : 'reveal answer'}</span>
            <span>Use ← and → arrow keys to navigate</span>
          </div>
        </div>
      </div>

      {/* Control Actions Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <button
          type="button"
          onClick={shuffleDeck}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0.65rem 1.15rem',
            background: 'var(--surface)',
            color: 'var(--ink)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            fontSize: '0.86rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Shuffle size={14} /> Shuffle Deck
        </button>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={handlePrev}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.65rem 1.35rem',
              background: 'var(--surface)',
              color: 'var(--ink)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              fontSize: '0.88rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <ChevronLeft size={16} /> Prev
          </button>

          <button
            type="button"
            onClick={() => setIsFlipped(!isFlipped)}
            style={{
              padding: '0.65rem 1.5rem',
              background: 'var(--accent)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
              transition: 'transform 0.15s ease',
            }}
          >
            {isFlipped ? 'Show Front' : 'Flip Card'}
          </button>

          <button
            type="button"
            onClick={handleNext}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.65rem 1.35rem',
              background: 'var(--surface)',
              color: 'var(--ink)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              fontSize: '0.88rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
