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
} from 'lucide-react';
import MathView from '@/app/components/MathView';

interface Flashcard {
  id: string;
  front: string;
  frontHint?: string;
  back: string;
  backExample?: string;
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
        category: 'Punctuation',
        tag: 'Punctuation',
      },
      {
        id: 'sg-2',
        front: 'What is the strict rule for using a Colon (:)?',
        frontHint: 'Requirements before and after the colon',
        back: 'The clause BEFORE a colon MUST be a complete independent sentence.\n\nThe clause after the colon can be an explanation, list, single word, or elaboration.',
        backExample: 'Correct: She needed one quality to pass: determination.\nIncorrect: The required ingredients are: flour, yeast, and water. (Before is not independent)',
        category: 'Punctuation',
        tag: 'Punctuation',
      },
      {
        id: 'sg-3',
        front: 'What is a Misplaced or Dangling Modifier?',
        frontHint: 'Introductory participial phrase modifying the wrong subject',
        back: 'An introductory descriptive phrase MUST be immediately followed by the noun it actually describes.',
        backExample: 'Dangling: Walking through the forest, the trees were beautiful. (The trees weren’t walking!)\nCorrect: Walking through the forest, Elena admired the beautiful trees.',
        category: 'Syntax & Modifiers',
        tag: 'Modifiers',
      },
      {
        id: 'sg-4',
        front: 'Apostrophe Rules: Its vs It’s vs Its’',
        frontHint: 'Possession vs Contraction',
        back: '• It’s = It is (or It has) [Contraction]\n• Its = Belonging to it [Possessive pronoun - no apostrophe!]\n• Its’ = DOES NOT EXIST in the English language.',
        backExample: 'Correct: The spacecraft rotated on its axis because it’s out of fuel.',
        category: 'Apostrophes',
        tag: 'Apostrophes',
      },
      {
        id: 'sg-5',
        front: 'Non-Essential Clauses (Parenthetical Information)',
        frontHint: 'Pairs of commas, dashes, or parentheses',
        back: 'If information can be removed without altering the grammatical core of the sentence, it must be set off by matching punctuation:\n• Two commas: The scientist, who was late, arrived.\n• Two dashes: The scientist—who was late—arrived.\n• Never mix a comma and a dash!',
        backExample: 'Incorrect: Dr. Vance, an astronomer—discovered a new comet.\nCorrect: Dr. Vance—an astronomer—discovered a new comet.',
        category: 'Punctuation',
        tag: 'Punctuation',
      },
      {
        id: 'sg-6',
        front: 'Subject-Verb Agreement with Prepositional Distractors',
        frontHint: 'Finding the true subject across prepositional phrases',
        back: 'The subject of a sentence is NEVER inside a prepositional phrase (e.g., "of...", "in...", "with..."). Ignore modifying phrases to find the real subject.',
        backExample: 'Example: The collection of rare coins (was / were) preserved.\nTrue subject is "collection" (singular) -> "was preserved".',
        category: 'Agreement',
        tag: 'Subject-Verb',
      },
      {
        id: 'sg-7',
        front: 'Transition Words: Categorization Strategy',
        frontHint: 'Continuance vs Contrast vs Causation',
        back: 'Group transitions by direction:\n1. Continuance: Furthermore, moreover, in addition\n2. Contrast: However, nevertheless, conversely, on the other hand\n3. Cause/Effect: Consequently, therefore, thus, as a result\n\nIf two options belong to the exact same category and tone, both are usually wrong.',
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
        category: 'Geometry',
        tag: 'Circles',
      },
      {
        id: 'sm-2',
        front: 'Quadratic Vertex Form & Axis of Symmetry',
        frontHint: 'Finding vertex (h, k) and maximum/minimum',
        back: 'y = a(x - h)^2 + k\n\n• Vertex is at (h, k)\n• Axis of symmetry: x = h\n• In standard form y = ax^2 + bx + c:\nh = -b / (2a)\nk = f(-b / (2a))',
        category: 'Algebra',
        tag: 'Quadratics',
      },
      {
        id: 'sm-3',
        front: 'The Discriminant & Number of Real Solutions',
        frontHint: 'For ax^2 + bx + c = 0',
        back: 'Discriminant: \\Delta = b^2 - 4ac\n\n• If \\Delta > 0: Exactly 2 distinct real solutions (2 x-intercepts)\n• If \\Delta = 0: Exactly 1 real solution (vertex touches x-axis)\n• If \\Delta < 0: No real solutions (0 x-intercepts)',
        category: 'Algebra',
        tag: 'Quadratics',
      },
      {
        id: 'sm-4',
        front: 'Vieta’s Formulas (Sum & Product of Quadratic Roots)',
        frontHint: 'For ax^2 + bx + c = 0 with roots r1 and r2',
        back: 'Sum of roots: r_1 + r_2 = -\\frac{b}{a}\n\nProduct of roots: r_1 \\cdot r_2 = \\frac{c}{a}',
        backExample: 'For 3x^2 - 12x + 5 = 0:\nSum of solutions = -(-12) / 3 = 4 (found in 2 seconds without quadratic formula!).',
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
    if (currentIndex < deckCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      setCurrentIndex(deckCards.length - 1);
    }
  };

  const shuffleDeck = () => {
    setIsFlipped(false);
    const shuffled = [...deckCards].sort(() => Math.random() - 0.5);
    setDeckCards(shuffled);
    setCurrentIndex(0);
  };

  const masteredCount = deckCards.filter((c) => masteredMap[c.id]).length;
  const progressPercent = Math.round((masteredCount / deckCards.length) * 100);

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
            background: isFlipped ? 'rgba(184, 74, 57, 0.03)' : '#ffffff',
            borderColor: isFlipped ? 'rgba(184, 74, 57, 0.3)' : 'var(--border)',
            transition: 'all 0.25s ease',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
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
                  gap: '4px',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '4px',
                  border: isMastered ? '1px solid #059669' : '1px solid var(--border)',
                  background: isMastered ? '#ecfdf5' : '#fff',
                  color: isMastered ? '#059669' : 'var(--muted)',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                }}
              >
                {isMastered ? <Check size={12} /> : null}
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
                  <p style={{ color: 'var(--muted)', fontSize: '0.92rem', fontStyle: 'italic', margin: 0 }}>
                    Hint: {currentCard.frontHint}
                  </p>
                )}
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '1.05rem', lineHeight: '1.7', color: 'var(--ink)', whiteSpace: 'pre-wrap', marginBottom: '1.25rem' }}>
                  <MathView content={currentCard?.back || ''} />
                </div>
                {currentCard?.backExample && (
                  <div style={{ background: 'rgba(128,128,128,0.08)', padding: '0.85rem 1rem', borderRadius: '6px', fontSize: '0.86rem', color: 'var(--ink)', fontFamily: 'var(--font-mono)', whiteSpace: 'pre-wrap' }}>
                    {currentCard.backExample}
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
            padding: '0.6rem 1rem',
            background: 'var(--panel-light, #fff)',
            color: 'var(--ink)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            fontSize: '0.85rem',
            cursor: 'pointer',
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
              padding: '0.65rem 1.25rem',
              background: 'var(--panel-light, #fff)',
              color: 'var(--ink)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              fontSize: '0.88rem',
              cursor: 'pointer',
            }}
          >
            <ChevronLeft size={16} /> Prev
          </button>

          <button
            type="button"
            onClick={() => setIsFlipped(!isFlipped)}
            style={{
              padding: '0.65rem 1.4rem',
              background: 'var(--ink)',
              color: 'var(--bg, #fff)',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
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
              padding: '0.65rem 1.25rem',
              background: 'var(--panel-light, #fff)',
              color: 'var(--ink)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              fontSize: '0.88rem',
              cursor: 'pointer',
            }}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
