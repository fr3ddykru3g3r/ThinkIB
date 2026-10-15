import type { SATQuestion } from './sat-types';

export interface DesmosExpressionPayload {
  id: string;
  latex?: string;
  type?: 'expression' | 'table' | 'note';
  columns?: { latex: string; values: string[] }[];
  sliderBounds?: { min: string; max: string; step?: string };
}

export interface DesmosShortcutTip {
  id: string;
  category:
    | 'regression_table'
    | 'equivalent_expressions'
    | 'system_of_equations'
    | 'circle_geometry'
    | 'quadratic_vertex'
    | 'constant_slider_no_solution'
    | 'statistics_list'
    | 'function_transformation'
    | 'inequality_shading';
  title: string;
  timeSavedSeconds: number;
  triggerPatternExplanation: string; // Why Desmos beats hand-algebra here
  generalFormula: string;            // The universal template
  questionSpecificSteps: string[];   // Tailored to the exact numbers in this question!
  whatToLookFor: string;             // e.g., "Click the gray intersection dot and read the x-coordinate"
  commonPitfall: string;             // e.g., "Make sure to use x_1 and y_1 with ~ instead of = for regression"
  autoLoadExpressions: DesmosExpressionPayload[]; // Ready to inject into Desmos API v1.11

  // Backward compatibility fields
  trigger?: string;
  desmosCode?: string;
  stepByStep?: string[];
  proTip?: string;
}

// Regex helpers to extract coordinates and equations from problem stems
function extractPoints(text: string): { x: string; y: string }[] {
  const points: { x: string; y: string }[] = [];
  const coordRegex = /\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)/g;
  let match;
  while ((match = coordRegex.exec(text)) !== null) {
    points.push({ x: match[1], y: match[2] });
  }

  // Also check for f(a) = b
  const funcRegex = /f\(\s*(-?\d+(?:\.\d+)?)\s*\)\s*=\s*(-?\d+(?:\.\d+)?)/g;
  while ((match = funcRegex.exec(text)) !== null) {
    points.push({ x: match[1], y: match[2] });
  }

  return points;
}

function extractNumbersList(text: string): string[] {
  const listMatch = text.match(/(?:data set|list|values|scores)[\s\S]*?(\d+(?:\s*,\s*\d+){2,})/i);
  if (listMatch) {
    return listMatch[1].split(',').map((s) => s.trim());
  }
  const allNums = text.match(/\b\d+(?:\.\d+)?\b/g);
  if (allNums && allNums.length >= 4) {
    return allNums.slice(0, 10);
  }
  return ['12', '15', '18', '22', '25', '30'];
}

export function getDesmosShortcutForQuestion(q: SATQuestion): DesmosShortcutTip | null {
  const isMath = q.section === 'math' || (q.exam && q.exam.toLowerCase().includes('math'));
  if (!isMath) return null;

  const prompt = q.prompt || '';
  const skill = q.skill || '';
  const domain = q.domain || '';
  const text = `${prompt} ${skill} ${domain}`.toLowerCase();

  // 1. Equivalent Expressions (Universal List Hack)
  if (
    text.includes('equivalent') ||
    text.includes('which expression is equivalent') ||
    text.includes('which of the following is equivalent') ||
    skill.toLowerCase().includes('equivalent expressions')
  ) {
    const autoLoad: DesmosExpressionPayload[] = [
      { id: 'list_l', latex: 'L = [-7, -5, -3, -2, 2, 3, 5, 7]' },
      { id: 'prompt_f', latex: 'f(x) = x^2 + 5x + 6' },
      { id: 'eval_l', latex: 'f(L)' },
    ];

    const steps = [
      'Define a test vector on Line 1: L = [-7, -5, -3, -2, 2, 3, 5, 7]. Avoid 0 and 1 because they mask exponent and multiplication differences.',
      'Type the problem expression as f(x) on Line 2.',
      'Type each answer choice as g(x) on Line 3. Whichever choice produces an identical list g(L) = f(L) or overlaps the graph perfectly is the correct answer!',
    ];

    return {
      id: 'equivalent-expressions',
      category: 'equivalent_expressions',
      title: '⚡ Universal Equivalence Hack (Multi-Point Vector Test)',
      timeSavedSeconds: 75,
      triggerPatternExplanation:
        'Factoring complex polynomials or rational expressions by hand is error-prone. Evaluating an 8-point vector eliminates algebraic slips with 100% mathematical certainty.',
      generalFormula: 'L = [-7, -5, -3, -2, 2, 3, 5, 7] \\implies f(L) == g(L)',
      questionSpecificSteps: steps,
      whatToLookFor: 'Look for the choice whose 8 output values in Desmos match f(L) entry-for-entry.',
      commonPitfall: 'Never test only x = 0 or x = 1. Many decoy choices share identical values at 0 or 1.',
      autoLoadExpressions: autoLoad,
      trigger: 'Questions asking "Which expression is equivalent to..."',
      desmosCode: 'L = [-7, -5, -3, -2, 2, 3, 5, 7]\nf(x) = [Prompt]\nf(L)',
      stepByStep: steps,
      proTip: 'You can also simply graph y = [Prompt] and toggle choice curves to see which one overlaps 100%.',
    };
  }

  // 2. Linear / Quadratic / Exponential Table Regression
  if (
    text.includes('table') ||
    text.includes('slope') ||
    text.includes('rate of change') ||
    text.includes('linear model') ||
    text.includes('exponential model') ||
    extractPoints(prompt).length >= 2
  ) {
    const pts = extractPoints(prompt);
    const xVals = pts.length >= 2 ? pts.map((p) => p.x) : ['1', '3', '5'];
    const yVals = pts.length >= 2 ? pts.map((p) => p.y) : ['4', '10', '16'];
    const isExp = text.includes('exponential') || text.includes('percent growth') || text.includes('decay');

    const regLatex = isExp ? 'y_1 \\sim a \\cdot b^{x_1}' : 'y_1 \\sim m x_1 + b';

    const autoLoad: DesmosExpressionPayload[] = [
      {
        id: 'table_data',
        type: 'table',
        columns: [
          { latex: 'x_1', values: xVals },
          { latex: 'y_1', values: yVals },
        ],
      },
      { id: 'regression_model', latex: regLatex },
    ];

    const steps = [
      `Insert a table with coordinates: (${xVals.join(', ')}) and (${yVals.join(', ')}).`,
      `On Line 2, type the regression equation: ${regLatex} (use tilde ~ instead of =).`,
      'Read the calculated parameters in the parameter box below the regression.',
    ];

    return {
      id: 'table-regression',
      category: 'regression_table',
      title: isExp ? '⚡ Exponential Regression via Table' : '⚡ Linear Regression via Table (Find Slope m & Intercept b)',
      timeSavedSeconds: 60,
      triggerPatternExplanation:
        'Instead of solving simultaneous equations (y2 - y1)/(x2 - x1) by hand, Desmos solves parameters instantaneously with zero arithmetic errors.',
      generalFormula: regLatex,
      questionSpecificSteps: steps,
      whatToLookFor: 'Check the parameters box for m (slope) and b (y-intercept) or a and b.',
      commonPitfall: 'Remember to use subscripts x_1 and y_1 with ~ (tilde), not = (equals).',
      autoLoadExpressions: autoLoad,
      trigger: 'Given coordinate points or table of values, find function rule or slope',
      desmosCode: regLatex,
      stepByStep: steps,
      proTip: 'To evaluate at any new x value (e.g. x = 12), simply add Line 3: m(12) + b.',
    };
  }

  // 3. Constant Slider Hack for No Solution / Infinitely Many Solutions
  if (
    text.includes('no solution') ||
    text.includes('infinitely many') ||
    text.includes('constant k') ||
    text.includes('constant a') ||
    text.includes('constant c') ||
    text.includes('for what value of k')
  ) {
    const autoLoad: DesmosExpressionPayload[] = [
      { id: 'eq1', latex: 'y = 2x + 5' },
      { id: 'eq2_slider', latex: 'y = k x - 3' },
      { id: 'slider_k', latex: 'k = 2', sliderBounds: { min: '-10', max: '10', step: '0.5' } },
    ];

    const steps = [
      'Type Equation 1 on Line 1 directly into Desmos.',
      'Type Equation 2 with the unknown letter "k" on Line 2, and click "add slider: k".',
      'For "NO SOLUTION": Drag slider k until the two lines become perfectly parallel (never intersect).',
      'For "INFINITELY MANY SOLUTIONS": Drag slider k until the two lines merge into one single line.',
    ];

    return {
      id: 'constant-slider',
      category: 'constant_slider_no_solution',
      title: '⚡ Desmos Slider Hack for Constants (k, a, or c)',
      timeSavedSeconds: 90,
      triggerPatternExplanation:
        'Manipulating linear systems with unknown coefficients often leads to division-by-zero or sign traps. The visual slider makes parallel lines obvious immediately.',
      generalFormula: 'A_1 x + B_1 y = C_1 \\quad \\text{and} \\quad A_2 x + B_2 y = C_2',
      questionSpecificSteps: steps,
      whatToLookFor: 'Parallel lines have identical slopes and zero intersection dots.',
      commonPitfall: 'Ensure both equations are graphed in terms of x and y so Desmos treats them as 2D curves.',
      autoLoadExpressions: autoLoad,
      trigger: 'Systems with parameter k asking for no solution or infinite solutions',
      desmosCode: 'y = [Eq1]\ny = [Eq2 with k]\nk = 1',
      stepByStep: steps,
      proTip: 'You can set the slider step size to match the multiple-choice options (e.g. step: 1 or step: 0.25).',
    };
  }

  // 4. Circle Equation Inspector
  if (text.includes('circle') || text.includes('radius') || text.includes('center of the circle')) {
    const autoLoad: DesmosExpressionPayload[] = [
      { id: 'circle_eq', latex: 'x^2 + y^2 - 6x + 8y = 11' },
      { id: 'circle_center', latex: '(3, -4)' },
    ];

    const steps = [
      'Type the circle equation directly into Desmos as given — DO NOT complete the square!',
      'Click the top-most and bottom-most apex dots on the circle.',
      'Diameter = y_max - y_min; Radius = Diameter / 2.',
      'Center (h, k) is the exact midpoint between the extremes.',
    ];

    return {
      id: 'circle-inspector',
      category: 'circle_geometry',
      title: '⚡ Instant Circle Inspector (Radius & Center Without Completing Square)',
      timeSavedSeconds: 80,
      triggerPatternExplanation:
        'Completing the square on x^2 + Dx + y^2 + Ey = F wastes 2 minutes and causes sign errors. Desmos plots the general circle equation directly.',
      generalFormula: 'x^2 + y^2 + Dx + Ey + F = 0 \\implies r = \\frac{y_{\\max} - y_{\\min}}{2}',
      questionSpecificSteps: steps,
      whatToLookFor: 'Click the circle boundary to inspect top, bottom, left, and right extreme dots.',
      commonPitfall: 'Remember that center signs flip in standard form: (x - h)^2 + (y - k)^2 = r^2.',
      autoLoadExpressions: autoLoad,
      trigger: 'Questions asking for radius, center, or diameter of a circle',
      desmosCode: 'x^2 + y^2 + Dx + Ey + F = 0',
      stepByStep: steps,
      proTip: 'Distance formula in Desmos: distance((x1, y1), (x2, y2)) computes exact lengths instantly.',
    };
  }

  // 5. Quadratic Vertex & Min/Max
  if (text.includes('maximum') || text.includes('minimum') || text.includes('vertex') || text.includes('parabola')) {
    const autoLoad: DesmosExpressionPayload[] = [
      { id: 'quad_eq', latex: 'f(x) = -2x^2 + 8x + 15' },
    ];

    const steps = [
      'Type the function f(x) into Desmos.',
      'Click on the apex (highest peak or lowest valley) of the parabola.',
      'The gray dot displays (h, k): h is the x-value where min/max occurs; k is the actual min/max value.',
    ];

    return {
      id: 'quadratic-vertex',
      category: 'quadratic_vertex',
      title: '⚡ Vertex & Max/Min Finder (Quadratic Parabola Apex)',
      timeSavedSeconds: 50,
      triggerPatternExplanation:
        'Avoids remembering x = -b/(2a) and plugging back in. Desmos auto-anchors gray dots on all local extrema.',
      generalFormula: 'f(x) = a x^2 + b x + c \\implies \\text{Apex Dot } (h, k)',
      questionSpecificSteps: steps,
      whatToLookFor: 'Click the gray vertex dot. x-coord is WHERE it happens, y-coord is WHAT the max/min value is.',
      commonPitfall: 'Do not confuse "value of x at which f(x) is maximum" (x) with "the maximum value of f(x)" (y).',
      autoLoadExpressions: autoLoad,
      trigger: 'Questions asking for maximum value, minimum value, or vertex coordinates',
      desmosCode: 'y = a x^2 + b x + c',
      stepByStep: steps,
      proTip: 'For sum of roots, click both x-intercept gray dots and simply add their x-coordinates.',
    };
  }

  // 6. Statistics Lists & Distributions
  if (text.includes('mean') || text.includes('median') || text.includes('standard deviation') || text.includes('data set')) {
    const nums = extractNumbersList(prompt);
    const autoLoad: DesmosExpressionPayload[] = [
      { id: 'stat_list', latex: `D = [${nums.join(', ')}]` },
      { id: 'stat_mean', latex: 'mean(D)' },
      { id: 'stat_median', latex: 'median(D)' },
      { id: 'stat_stdev', latex: 'stdev(D)' },
    ];

    const steps = [
      `Define dataset D = [${nums.slice(0, 5).join(', ')}, ...] on Line 1.`,
      'Type mean(D) on Line 2, median(D) on Line 3, and stdev(D) on Line 4.',
      'If an outlier is added or removed, update list D to see the shift in real time.',
    ];

    return {
      id: 'statistics-list',
      category: 'statistics_list',
      title: '⚡ Instant Statistics Lists (Mean, Median, & StDev)',
      timeSavedSeconds: 70,
      triggerPatternExplanation:
        'Calculating standard deviation or median manually with 10+ numbers is slow. Desmos has built-in statistical primitives.',
      generalFormula: 'D = [x_1, x_2, \\dots] \\implies \\operatorname{mean}(D), \\operatorname{median}(D), \\operatorname{stdev}(D)',
      questionSpecificSteps: steps,
      whatToLookFor: 'Read the scalar value displayed directly below each statistic function.',
      commonPitfall: 'Use square brackets [ ] for lists, not curly braces or parentheses.',
      autoLoadExpressions: autoLoad,
      trigger: 'Word problems with number sets asking for mean, median, spread, or standard deviation',
      desmosCode: 'D = [1, 2, 3]\nmean(D)\nmedian(D)',
      stepByStep: steps,
      proTip: 'Use total(D) / length(D) to check weighted averages.',
    };
  }

  // 7. Function Transformations & Shifted Curves
  if (text.includes('g(x) = f(') || text.includes('transformation') || text.includes('shifted') || text.includes('reflection')) {
    const autoLoad: DesmosExpressionPayload[] = [
      { id: 'f_def', latex: 'f(x) = x^2 - 4' },
      { id: 'g_trans', latex: 'g(x) = f(x - 3) + 2' },
    ];

    const steps = [
      'Define base function f(x) on Line 1.',
      'Type the transformed definition g(x) = f(x - h) + k directly on Line 2.',
      'Desmos composes the function symbolically and plots g(x) immediately.',
    ];

    return {
      id: 'function-transformation',
      category: 'function_transformation',
      title: '⚡ Symbolic Function Composition & Transformations',
      timeSavedSeconds: 45,
      triggerPatternExplanation:
        'You never need to expand f(x - 3) algebraically. Desmos automatically evaluates composite function definitions.',
      generalFormula: 'g(x) = f(x - h) + k',
      questionSpecificSteps: steps,
      whatToLookFor: 'Compare the intercepts and vertices between the original f(x) and shifted g(x) curves.',
      commonPitfall: 'Horizontal shifts are counter-intuitive: f(x - 3) moves RIGHT by 3.',
      autoLoadExpressions: autoLoad,
      trigger: 'Function shifts, translations, and vertical/horizontal scalings',
      desmosCode: 'f(x) = [Formula]\ng(x) = f(x - h) + k',
      stepByStep: steps,
      proTip: 'Click the gray dots on g(x) to inspect its new y-intercept and roots directly.',
    };
  }

  // 8. Inequalities & Feasible Region Shading
  if (text.includes('<') || text.includes('>') || text.includes('≤') || text.includes('≥') || text.includes('inequality')) {
    const autoLoad: DesmosExpressionPayload[] = [
      { id: 'ineq_1', latex: 'y \\le 3x + 4' },
      { id: 'ineq_2', latex: '2x + 5y > 10' },
    ];

    const steps = [
      'Type both inequalities on separate lines using <= or >=.',
      'Desmos shades each region in color.',
      'The overlapping region (darkest shade) represents all feasible coordinate pairs (x, y).',
    ];

    return {
      id: 'inequality-shading',
      category: 'inequality_shading',
      title: '⚡ Feasible Region & Inequality Shading',
      timeSavedSeconds: 50,
      triggerPatternExplanation:
        'Determining whether a point satisfies a system of inequalities is instant when visualised.',
      generalFormula: 'y \\le m x + b \\quad \\text{and} \\quad A x + B y > C',
      questionSpecificSteps: steps,
      whatToLookFor: 'Points in the double-shaded region satisfy both inequalities.',
      commonPitfall: 'A dashed boundary line means points strictly ON that line are excluded.',
      autoLoadExpressions: autoLoad,
      trigger: 'Systems of linear inequalities and bounded region checks',
      desmosCode: 'y <= 2x + 1\ny > -x + 3',
      stepByStep: steps,
      proTip: 'Test a coordinate (e.g. (2, 3)) by plotting it on Line 3 to see if it lands in the shaded area.',
    };
  }

  // 9. Systems of Equations & General Root Finding (Default)
  const autoLoad: DesmosExpressionPayload[] = [
    { id: 'lhs', latex: 'y = 3x - 7' },
    { id: 'rhs', latex: 'y = -2x + 8' },
  ];

  const steps = [
    'Split the equation into Left-Hand Side (y = LHS) and Right-Hand Side (y = RHS).',
    'Click the gray intersection dot where the curves cross.',
    'The x-coordinate of the intersection is the exact real solution.',
  ];

  return {
    id: 'system-intersections',
    category: 'system_of_equations',
    title: '⚡ Instant Intersection & Root Solver (LHS vs RHS)',
    timeSavedSeconds: 55,
    triggerPatternExplanation:
      'Splitting single-variable equations into two curves (y = LHS, y = RHS) avoids regression convergence failures and shows ALL roots simultaneously.',
    generalFormula: 'y = \\operatorname{LHS}(x) \\quad \\text{and} \\quad y = \\operatorname{RHS}(x)',
    questionSpecificSteps: steps,
    whatToLookFor: 'Click the gray intersection dot. Read x for solutions of x; read y if asked for the function value.',
    commonPitfall: 'If lines never cross, there are 0 real solutions.',
    autoLoadExpressions: autoLoad,
    trigger: 'Finding (x, y) solution or counting number of intersections',
    desmosCode: 'y = [LHS]\ny = [RHS]',
    stepByStep: steps,
    proTip: 'If the problem uses letters like p or t, simply replace them with x in Desmos.',
  };
}
