import { SATQuestion } from './sat';

export interface DistractorTrap {
  choice: string;
  reason: string;
}

export interface SocraticHintLadder {
  level1Concept: {
    title: string;
    description: string;
    formulaOrRule?: string;
  };
  level2Elimination: {
    title: string;
    description: string;
    pitfallAvoidance: string;
  };
  level3Setup: {
    title: string;
    description: string;
    firstStep: string;
  };
  examinerTrap: {
    headline: string;
    explanation: string;
    psychologicalTrigger: string;
  };
  distractorTraps: DistractorTrap[];
}

/**
 * Normalizes common OCR artifacts found in test prep rationales
 */
function cleanRationaleText(text: string): string {
  return text
    .replace(/i\s*n\s*corr\s*ect/gi, 'incorrect')
    .replace(/nee\s*ded/gi, 'needed')
    .replace(/so\s*lutions/gi, 'solutions')
    .replace(/equ\s*ation/gi, 'equation')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Parses out distractor traps and explanations from official College Board rationale text.
 */
export function extractExaminerTraps(
  rationale: string,
  domain: string = '',
  skill: string = ''
): { primaryTrap: string; traps: DistractorTrap[] } {
  const cleaned = cleanRationaleText(rationale || '');
  const traps: DistractorTrap[] = [];

  // Match: Choice [A-D] is incorrect (because|and|since|as|due to)... up until the next Choice or end
  const choiceRegex = /Choice\s+([A-D])\s+is\s+incorrect\s+(?:because\s+|and\s+may\s+result\s+from\s+|since\s+)?([^.]+?\.)/gi;
  let match;
  while ((match = choiceRegex.exec(cleaned)) !== null) {
    const choice = match[1].toUpperCase();
    const reason = match[2].trim();
    if (!traps.some((t) => t.choice === choice)) {
      traps.push({ choice, reason });
    }
  }

  // Construct primary trap
  let primaryTrap = '';
  if (traps.length > 0) {
    primaryTrap = `Distractor Option ${traps[0].choice}: ${traps[0].reason}`;
  } else {
    // Fallback based on domain/skill archetype
    const dLower = domain.toLowerCase();
    const sLower = skill.toLowerCase();
    if (dLower.includes('algebra') || sLower.includes('linear')) {
      primaryTrap = 'Common Trap: Solving for intermediate variable x when the question actually asks for an expression like (2x + 5) or (x + y).';
    } else if (dLower.includes('advanced math') || sLower.includes('quadratic')) {
      primaryTrap = 'Common Trap: Forgetting that parabolas have vertex x = -b/(2a) or dropping the negative sign when calculating the discriminant b² - 4ac.';
    } else if (dLower.includes('conventions') || sLower.includes('boundaries')) {
      primaryTrap = 'Common Trap: Comma splice — joining two independent clauses with only a comma, or placing unnecessary commas between a subject and its verb.';
    } else if (dLower.includes('expression') || sLower.includes('transitions')) {
      primaryTrap = 'Common Trap: Selecting a transition before evaluating clause polarity (contrast vs. cause/effect vs. continuation).';
    } else {
      primaryTrap = 'Common Trap: Failing to read the exact question stem condition (e.g., "least" vs. "greatest", or units of measurement).';
    }
  }

  return { primaryTrap, traps };
}

/**
 * Builds a 3-tier Socratic Hint Ladder + Examiner Misconception Warning for any SAT question.
 */
export function getSocraticHints(q: SATQuestion): SocraticHintLadder {
  const isMath = q.section === 'math' || (q.exam && q.exam.toLowerCase().includes('math'));
  const promptLower = (q.prompt || '').toLowerCase();
  const domainLower = (q.domain || '').toLowerCase();
  const skillLower = (q.skill || '').toLowerCase();
  const archetypeLower = (q.broadArchetype || '').toLowerCase();

  const { primaryTrap, traps } = extractExaminerTraps(q.rationale, q.domain, q.skill);

  // Default Math Hint Ladder
  if (isMath) {
    // 1. Systems of Equations
    if (promptLower.includes('system') || archetypeLower.includes('system') || skillLower.includes('two variables')) {
      return {
        level1Concept: {
          title: 'System Intersections & Equivalence',
          description: 'A solution to a system of equations corresponds to the exact (x, y) point where both equations are true simultaneously (the geometric intersection on a graph).',
          formulaOrRule: 'For infinite solutions: slopes and intercepts must be identical. For no solution: slopes equal, y-intercepts distinct.'
        },
        level2Elimination: {
          title: 'Eliminate Flawed Ratios',
          description: 'Inspect the coefficients. If an option proposes a solution with mismatched signs or doesn’t satisfy the simpler of the two equations, eliminate it immediately.',
          pitfallAvoidance: 'Do not pick the x-coordinate if the prompt asks for the value of y or (x + y).'
        },
        level3Setup: {
          title: 'Algebraic Isolation Step',
          description: 'Isolate one variable in terms of the other, or multiply one entire equation by a constant to eliminate one variable by addition/subtraction.',
          firstStep: 'Multiply the equation to align coefficients, or plug both expressions directly into Desmos on separate lines.'
        },
        examinerTrap: {
          headline: 'Target Variable Misdirection',
          explanation: primaryTrap || 'Examiners frequently place the value of x as distractor Choice A, hoping you will stop calculating before finding y or the requested composite expression.',
          psychologicalTrigger: 'Premature closure after completing the first algebra operation.'
        },
        distractorTraps: traps
      };
    }

    // 2. Quadratics & Parabolas / Vertex
    if (promptLower.includes('vertex') || promptLower.includes('maximum') || promptLower.includes('minimum') || promptLower.includes('quadratic') || skillLower.includes('quadratic')) {
      return {
        level1Concept: {
          title: 'Quadratic Extremum & Symmetry',
          description: 'The maximum or minimum of any parabola y = ax² + bx + c occurs at its vertex, positioned along the axis of symmetry.',
          formulaOrRule: 'Vertex x-coordinate: h = -b / (2a). Maximum/minimum value is k = f(h).'
        },
        level2Elimination: {
          title: 'Eliminate Asymmetric Values',
          description: 'Check the sign of leading coefficient a. If a < 0, the parabola opens downward and has a MAXIMUM (no minimum). If a > 0, it has a MINIMUM.',
          pitfallAvoidance: 'Eliminate choices with opposite signs or values that place the vertex outside the domain.'
        },
        level3Setup: {
          title: 'Locate the Axis of Symmetry',
          description: 'Compute -b / (2a) to find the critical x-value. Then substitute this value back into the original quadratic function to find the maximum or minimum value.',
          firstStep: 'Identify a, b, and c from standard form: ax² + bx + c = 0.'
        },
        examinerTrap: {
          headline: 'Input (x) vs Output (y) Confusion',
          explanation: primaryTrap || 'When asked for the maximum height or value, the answer is the y-coordinate (k). Examiners include the x-coordinate (time/location) to trap hasty solvers.',
          psychologicalTrigger: 'Confusing "where the maximum occurs" with "what the maximum is".'
        },
        distractorTraps: traps
      };
    }

    // 3. Circles & Geometry
    if (promptLower.includes('circle') || promptLower.includes('radius') || promptLower.includes('center')) {
      return {
        level1Concept: {
          title: 'Standard Equation of a Circle',
          description: 'All points on a circle satisfy the Pythagorean distance from center (h, k) with radius r.',
          formulaOrRule: '(x - h)² + (y - k)² = r²'
        },
        level2Elimination: {
          title: 'Eliminate Unsquared Radii & Reversed Signs',
          description: 'Notice that the right side of the circle equation is r², not r! If the radius is 5, the right side must equal 25.',
          pitfallAvoidance: 'Watch the signs inside the parentheses: (x - 3) means center x = +3, NOT -3.'
        },
        level3Setup: {
          title: 'Complete the Square',
          description: 'Group x-terms and y-terms together. Move the constant to the right side, then take half of each linear coefficient, square it, and add to both sides.',
          firstStep: 'Rewrite as (x² + Bx + __) + (y² + Dy + __) = Constant.'
        },
        examinerTrap: {
          headline: 'Radius vs Radius Squared Trap',
          explanation: primaryTrap || 'Over 35% of students forget that the constant term in standard circle form equals r², choosing r instead or forgetting to take the square root.',
          psychologicalTrigger: 'Forgetting the radical on the right-hand constant.'
        },
        distractorTraps: traps
      };
    }

    // 4. Exponents & Radicals
    if (promptLower.includes('exponent') || promptLower.includes('power') || promptLower.includes('radical') || promptLower.includes('root') || promptLower.includes('equivalent')) {
      return {
        level1Concept: {
          title: 'Exponential Laws & Power Matching',
          description: 'To solve exponential equations or simplify complex powers, express all bases as powers of a common prime base (e.g. 4 = 2², 8 = 2³).',
          formulaOrRule: '(x^a)^b = x^(a·b)  and  x^(a/b) = b-th root of x^a'
        },
        level2Elimination: {
          title: 'Eliminate Base Multiplication Errors',
          description: 'When bases with equal exponents are multiplied, the bases multiply: a^x · b^x = (ab)^x. But a^x + a^y CANNOT be combined into a single power.',
          pitfallAvoidance: 'Cross out choices that add bases together or confuse root index with exponent power.'
        },
        level3Setup: {
          title: 'Convert to Shared Base',
          description: 'Convert every number in the expression to base 2, 3, or 5. Once the bases match on both sides, equate the exponents directly.',
          firstStep: 'Express composite numbers as prime factors (e.g. 9^x -> (3²)^x = 3^(2x)).'
        },
        examinerTrap: {
          headline: 'Fractional Exponent Inversion',
          explanation: primaryTrap || 'Examiners invert the numerator and denominator: remember that in x^(p/r), the numerator p is the POWER and the denominator r is the ROOT.',
          psychologicalTrigger: 'Inverting numerator and denominator in rational powers.'
        },
        distractorTraps: traps
      };
    }

    // Generic Math Fallback
    return {
      level1Concept: {
        title: 'Core Algebraic Relation',
        description: 'Read the question carefully to identify the given quantities, the unknown variable, and the specific target expression requested.',
        formulaOrRule: 'Translate words into mathematical operators: "is" -> (=), "of" -> (×), "per" -> (÷).'
      },
      level2Elimination: {
        title: 'Order of Magnitude & Feasibility',
        description: 'Estimate the expected numerical magnitude. If an answer choice is negative when a positive physical quantity is required, eliminate it.',
        pitfallAvoidance: 'Eliminate choices that calculate intermediate steps rather than the final question objective.'
      },
      level3Setup: {
        title: 'Isolate Target Expression',
        description: 'Set up an equation representing the relationships described in the prompt. Gather like terms on one side of the equality.',
        firstStep: 'Define your variable clearly and write the fundamental relationship equation.'
      },
      examinerTrap: {
        headline: 'Premature Answer Selection',
        explanation: primaryTrap || 'Examiners construct distractors matching common arithmetic slip-ups, sign errors, or unsimplified fractions.',
        psychologicalTrigger: 'Failing to re-read what the final question prompt specifically asks for.'
      },
      distractorTraps: traps
    };
  }

  // Reading & Writing Socratic Hint Ladders
  // 1. Boundaries / Punctuation (Standard English Conventions)
  if (domainLower.includes('conventions') || skillLower.includes('boundaries') || archetypeLower.includes('boundary')) {
    return {
      level1Concept: {
        title: 'Independent vs Dependent Clause Boundaries',
        description: 'Every sentence consists of clauses. Two independent clauses (complete thoughts with subject and verb) can ONLY be linked by a period, a semicolon, a colon, or a comma + FANBOYS conjunction.',
        formulaOrRule: 'Independent + ; + Independent  OR  Independent + , + [for/and/nor/but/or/yet/so] + Independent'
      },
      level2Elimination: {
        title: 'Eliminate Comma Splices & Run-ons',
        description: 'A comma ALONE can never join two independent clauses. Eliminate any choice that places only a comma between two complete sentences.',
        pitfallAvoidance: 'Also eliminate unnecessary commas placed between a subject and its verb or between a verb and its object.'
      },
      level3Setup: {
        title: 'Identify Clause Structure Surrounding the Blank',
        description: 'Read the words before the blank: can they stand alone as a complete sentence? Read the words after the blank: can they stand alone?',
        firstStep: 'Determine if you are joining [Independent + Independent], [Dependent + Independent], or [Subject + Verb].'
      },
      examinerTrap: {
        headline: 'The Comma Splice Trap',
        explanation: primaryTrap || 'Examiners know students rely on "natural pauses" in speech to place commas. A pause does not justify a comma between independent clauses without FANBOYS.',
        psychologicalTrigger: 'Relying on auditory rhythm rather than structural syntactic rules.'
      },
      distractorTraps: traps
    };
  }

  // 2. Transitions (Expression of Ideas)
  if (promptLower.includes('transition') || archetypeLower.includes('transition') || domainLower.includes('expression')) {
    return {
      level1Concept: {
        title: 'Logical Transition Direction (Polarity)',
        description: 'Transitions signal the logical connection between two consecutive thoughts: Continuous/Addition (furthermore, similarly), Contrast/Opposite (however, nonetheless), or Cause/Effect (therefore, consequently).',
        formulaOrRule: 'Sentence 1 [Claim] -> Transition -> Sentence 2 [Logical Relation to Claim]'
      },
      level2Elimination: {
        title: 'Categorize & Eliminate Duplicate Polarities',
        description: 'Group the four choices by category. If three choices represent "addition" (e.g., moreover, additionally, furthermore) and one represents "contrast" (however), the unique polarity is almost always the key candidate.',
        pitfallAvoidance: 'Cross out transitions that reverse the polarity when Sentence 2 actually provides evidence supporting Sentence 1.'
      },
      level3Setup: {
        title: 'Summarize Both Sentences Without Any Transition',
        description: 'Read Sentence 1 and summarize its main point in 3 words. Read Sentence 2 and summarize its main point. Ask: Does Sentence 2 disagree, explain why, or add a new example?',
        firstStep: 'Classify the logical relationship: Contrast, Cause/Effect, or Elaboration.'
      },
      examinerTrap: {
        headline: 'False Contrast / Superfluous Causation',
        explanation: primaryTrap || 'Examiners love pairing a sentence describing an unexpected fact with another describing a related fact, tempting students to choose "however" even when the relationship is simply explanatory.',
        psychologicalTrigger: 'Assuming an unusual finding automatically requires a contrast transition.'
      },
      distractorTraps: traps
    };
  }

  // 3. Information & Ideas / Central Ideas / Command of Evidence
  if (domainLower.includes('information') || skillLower.includes('central') || promptLower.includes('main idea') || promptLower.includes('which choice best')) {
    return {
      level1Concept: {
        title: 'Direct Textual Evidence & Scope',
        description: 'The correct answer MUST be directly verified by the text. It cannot rely on outside assumptions, excessive generalization, or unsupported inferences.',
        formulaOrRule: 'Correct Answer = Faithful Paraphrase of Passage Evidence'
      },
      level2Elimination: {
        title: 'Eliminate Extreme Language & Scope Drift',
        description: 'Eliminate choices containing absolute or exaggerated language (always, never, completely, universally) unless the text explicitly uses those exact words.',
        pitfallAvoidance: 'Eliminate choices that are factually true in real life but NOT mentioned anywhere in this specific passage.'
      },
      level3Setup: {
        title: 'Locate the Author’s Pivot or Conclusion Claim',
        description: 'Look for turn words in the passage (such as "yet", "instead", "in contrast", "demonstrates that"). The author’s central thesis almost always follows these markers.',
        firstStep: 'Underline or isolate the final sentence or the author’s primary concluding evaluation.'
      },
      examinerTrap: {
        headline: 'The Plausible-Sounding Extrapolation',
        explanation: primaryTrap || 'Distractors often state a scientifically or historically true fact that goes one step beyond what the passage actually proved.',
        psychologicalTrigger: 'Using personal outside knowledge rather than strictly text-bounded evidence.'
      },
      distractorTraps: traps
    };
  }

  // Generic Reading & Writing Fallback
  return {
    level1Concept: {
      title: 'Structural Precision & Syntax',
      description: 'Digital SAT Reading and Writing evaluates concise, unambiguous sentence structure and strictly evidenced logical claims.',
      formulaOrRule: 'Shortest, grammatically sound, and contextually precise choice is preferred.'
    },
    level2Elimination: {
      title: 'Eliminate Redundancy & Dangling Elements',
      description: 'Cross out choices that repeat meanings already stated in adjacent clauses or create ambiguous pronoun references.',
      pitfallAvoidance: 'Avoid choices with awkward passive phrasing when clear active voice alternatives exist.'
    },
    level3Setup: {
      title: 'Analyze Contextual Constraints',
      description: 'Read one full sentence before the blank and one full sentence after the blank to establish the required grammatical agreement or rhetorical flow.',
      firstStep: 'Check whether the blank requires a modifier, a main verb, or a transitional marker.'
    },
    examinerTrap: {
      headline: 'The Redundancy & Passive Voice Trap',
      explanation: primaryTrap || 'Examiners craft long, sophisticated-sounding choices that actually introduce unnecessary repetition or clunky passive constructions.',
      psychologicalTrigger: 'Assuming longer, academic-sounding vocabulary is inherently more correct.'
    },
    distractorTraps: traps
  };
}
