import { SATQuestion } from './sat';

export interface DesmosShortcutTip {
  id: string;
  title: string;
  trigger: string;
  desmosCode: string;
  stepByStep: string[];
  proTip: string;
}

export function getDesmosShortcutForQuestion(q: SATQuestion): DesmosShortcutTip | null {
  const isMath = q.section === 'math' || (q.exam && q.exam.toLowerCase().includes('math'));
  if (!isMath) return null;

  const text = (q.prompt + ' ' + (q.skill || '') + ' ' + (q.domain || '')).toLowerCase();

  // 1. Systems of Linear & Non-Linear Equations (Intersections)
  if (
    text.includes('system of linear equations') ||
    text.includes('system of equations') ||
    text.includes('intersection') ||
    (text.includes('how many solutions') && (text.includes('system') || text.includes('equations'))) ||
    text.includes('linear-quadratic system')
  ) {
    return {
      id: 'system-intersections',
      title: '⚡ Instant Intersection (System of Equations)',
      trigger: 'Finding (x, y) solution or counting number of intersections',
      desmosCode: 'y = [Eq 1]\ny = [Eq 2]',
      stepByStep: [
        'Type both equations on separate lines exactly as written in the question (no need to solve for y).',
        'Desmos will highlight intersection points with gray dots.',
        'Click the gray dot to display the exact coordinates (x, y). The question will ask for either x, y, or x + y.'
      ],
      proTip: 'If lines are parallel and never intersect -> 0 solutions. If they lie directly on top of each other -> infinitely many solutions.'
    };
  }

  // 2. Linear Table / Rate of Change / Slope-Intercept
  if (
    text.includes('linear model') ||
    text.includes('linear equation') ||
    text.includes('table of values') ||
    text.includes('rate of change') ||
    text.includes('slope') ||
    text.includes('two points')
  ) {
    return {
      id: 'linear-regression',
      title: '⚡ Linear Regression via Table (Find Slope m & Intercept b)',
      trigger: 'Given points or a table, find the linear function or rate of change',
      desmosCode: 'y_1 ~ m x_1 + b',
      stepByStep: [
        'Click "+" in the top left of Desmos and choose "table".',
        'Enter at least two (x, y) coordinates from the problem into x1 and y1 columns.',
        'On line 2, type: y1 ~ m*x1 + b (use tilde "~" instead of equals).',
        'Desmos instantly calculates m (slope) and b (y-intercept) in the parameters box.'
      ],
      proTip: 'To find a value at x = k, add line 3: m*k + b to get the exact output.'
    };
  }

  // 3. Quadratics Vertex / Maximum / Minimum
  if (
    text.includes('maximum') ||
    text.includes('minimum') ||
    text.includes('vertex') ||
    text.includes('quadratic') ||
    text.includes('parabola')
  ) {
    return {
      id: 'quadratic-vertex-regression',
      title: '⚡ Vertex & Max/Min Finder (Quadratic Parabola Apex)',
      trigger: 'Finding the maximum height, minimum cost, or vertex (h, k)',
      desmosCode: 'y = a x^2 + b x + c',
      stepByStep: [
        'Type the quadratic function into Desmos line 1.',
        'Click directly on the apex (highest peak or lowest trough) of the parabola.',
        'The gray dot displays (h, k): h is the x-value where it occurs; k is the actual maximum or minimum value.'
      ],
      proTip: 'If asked for the vertex form from points, use regression: y1 ~ a(x1 - h)^2 + k.'
    };
  }

  // 4. Constant k/c with No Solution / Infinitely Many Solutions
  if (
    text.includes('constant k') ||
    text.includes('constant c') ||
    text.includes('constant a') ||
    text.includes('for what value of') ||
    text.includes('no solution') ||
    text.includes('infinitely many')
  ) {
    return {
      id: 'constant-slider-search',
      title: '⚡ Desmos Slider Hack for Constants (k, c, or a)',
      trigger: 'Equations with an unknown constant parameter (k, a, or c)',
      desmosCode: 'y = 2x + k  (add slider k)',
      stepByStep: [
        'Type the equation with the letter "k" into line 1. Desmos will ask "add slider: k" — click it.',
        'Type the second equation or target value into line 2.',
        'Drag the slider "k" (or click its limits to set values from -20 to 20) until the graph matches the condition (e.g. parallel lines or tangent intersection).'
      ],
      proTip: 'For multiple choice questions, set the slider step size to match the options to test them instantly.'
    };
  }

  // 5. Circle Equations & Radius / Center
  if (
    text.includes('circle') ||
    text.includes('radius') ||
    text.includes('center of the circle') ||
    text.includes('x^2 + y^2')
  ) {
    return {
      id: 'circle-expanded-form',
      title: '⚡ Instant Circle Graphing (Radius & Center)',
      trigger: 'Finding radius, center (h, k), or circle-line intersections',
      desmosCode: 'x^2 + y^2 + 8x - 6y = 24',
      stepByStep: [
        'Type the unexpanded or expanded circle equation directly into Desmos.',
        'Click the leftmost, rightmost, top, and bottom extremities of the circle.',
        'Distance from center to any extremity gives radius r. Center is the midpoint between opposite extremes.'
      ],
      proTip: 'Zero completing-the-square needed! Desmos handles non-standard equations automatically.'
    };
  }

  // 6. Exponential Growth / Decay / Percentages
  if (
    text.includes('exponential') ||
    text.includes('compounded') ||
    text.includes('percent increase') ||
    text.includes('percent decrease') ||
    text.includes('half-life')
  ) {
    return {
      id: 'exponential-regression',
      title: '⚡ Exponential Growth / Decay Regression',
      trigger: 'Modeling population, interest, radioactive decay, or percentage growth',
      desmosCode: 'y_1 ~ a (b)^{x_1}',
      stepByStep: [
        'Create a table (+) with initial value (0, a) and any subsequent point (x, y).',
        'Type regression model: y1 ~ a * (b)^x1.',
        'Desmos calculates a (initial amount) and b (growth factor = 1 + r, or decay factor = 1 - r).'
      ],
      proTip: 'If growth is 7%, b = 1.07. If decay is 12%, b = 0.88.'
    };
  }

  // 7. General Algebraic Roots / Zeros
  if (
    text.includes('solutions') ||
    text.includes('value of x') ||
    text.includes('root') ||
    text.includes('zero of the function') ||
    text.includes('f(x) = 0')
  ) {
    return {
      id: 'system-intersections',
      title: '⚡ Direct Root Finding (Zero of Function)',
      trigger: 'Finding the solution/roots to any single-variable equation',
      desmosCode: 'y = [Expression]  -> check x-intercepts',
      stepByStep: [
        'Rearrange the equation so one side equals 0: e.g. 3x^2 - 5x = 8 becomes 3x^2 - 5x - 8 = 0.',
        'Type y = 3x^2 - 5x - 8 into Desmos.',
        'Click the gray dots on the x-axis (where y = 0). The x-values are your exact solutions.'
      ],
      proTip: 'Works for rational functions, square roots, and absolute values with zero algebraic factoring.'
    };
  }

  // Default fallback for any remaining math question
  return {
    id: 'default',
    title: '⚡ Desmos Graphing Verification',
    trigger: 'Verifying solutions visually without manual computation',
    desmosCode: 'y = f(x)',
    stepByStep: [
      'Plot the given equation or function in Desmos.',
      'Test answer choices by plugging in coordinate pairs or typing candidate values on separate lines.',
      'Check where lines intersect or where curves cross the axes.'
    ],
    proTip: 'Use fractions directly by typing "/" in Desmos for exact values rather than rounding decimals.'
  };
}
