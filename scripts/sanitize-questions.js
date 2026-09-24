const fs = require('fs');
const path = require('path');

const RW_PATH = path.join(__dirname, '../data/sat/official-sat-reading-writing.json');
const MATH_PATH = path.join(__dirname, '../data/sat/official-sat-math.json');

const rw = JSON.parse(fs.readFileSync(RW_PATH, 'utf8'));
const math = JSON.parse(fs.readFileSync(MATH_PATH, 'utf8'));

function cleanSpacedText(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/\bExpr\s*ession\s*of\s*Ideas\b/gi, 'Expression of Ideas')
    .replace(/\bCr\s*aft\s*and\s*Str\s*uctur\s*e\b/gi, 'Craft and Structure')
    .replace(/\bInformation\s*and\s*Ideas\b/gi, 'Information and Ideas')
    .replace(/\bStandard\s*English\s*Conventions\b/gi, 'Standard English Conventions')
    .replace(/\bPr\s*oblem-Solving\s*and\s*Data(\s*Analysis)?\b/gi, 'Problem-Solving and Data Analysis')
    .replace(/\bGeometry\s*and\s*T\s*rigonometry\b/gi, 'Geometry and Trigonometry')
    .replace(/\bT\s*r\s*ansitions\b/gi, 'Transitions')
    .replace(/\bInf\s*er\s*ences\b/gi, 'Inferences')
    .replace(/\bCentr\s*al\s*Ideas\s*and\s*Details\b/gi, 'Central Ideas and Details')
    .replace(/\bCommand\s*of\s*E\s*vidence\b/gi, 'Command of Evidence')
    .replace(/\bW\s*or\s*ds\s*in\s*Context\b/gi, 'Words in Context')
    .replace(/\bText\s*Str\s*uctur\s*e\s*and\s*Pur\s*pose\b/gi, 'Text Structure and Purpose')
    .replace(/\bCr\s*oss-Text\s*Connections\b/gi, 'Cross-Text Connections')
    .replace(/\bRhetor\s*ical\s*Synthesis\b/gi, 'Rhetorical Synthesis')
    .replace(/\bF\s*or\s*m,\s*Str\s*uctur\s*e,\s*and\s*Sense\b/gi, 'Form, Structure, and Sense')
    .replace(/\bBoundaries\b/gi, 'Boundaries')
    .replace(/\bt o\b/g, 'to')
    .replace(/\bo f\b/g, 'of')
    .replace(/\ba r e\b/g, 'are')
    .replace(/\bar e\b/g, 'are')
    .replace(/\bf or\b/g, 'for')
    .replace(/\bF or\b/g, 'For')
    .replace(/\bth e\b/g, 'the')
    .replace(/\bin to\b/g, 'into')
    .replace(/\bfr om\b/g, 'from')
    .replace(/\bwi th\b/g, 'with')
    .replace(/\bwh ich\b/g, 'which')
    .replace(/\bth at\b/g, 'that')
    .replace(/\bth is\b/g, 'this')
    .replace(/\bth ese\b/g, 'these')
    .replace(/\bth ose\b/g, 'those')
    .replace(/\bth eir\b/g, 'their')
    .replace(/\bth ere\b/g, 'there')
    .replace(/\bTher efor e\b/g, 'Therefore')
    .replace(/\bther efor e\b/g, 'therefore')
    .replace(/\bwh en\b/g, 'when')
    .replace(/\bwh ere\b/g, 'where')
    .replace(/\bwh at\b/g, 'what')
    .replace(/\bwh o\b/g, 'who')
    .replace(/\bwh y\b/g, 'why')
    .replace(/\bh ow\b/g, 'how')
    .replace(/\bb een\b/g, 'been')
    .replace(/\bh ave\b/g, 'have')
    .replace(/\bh as\b/g, 'has')
    .replace(/\bh ad\b/g, 'had')
    .replace(/\bw ould\b/g, 'would')
    .replace(/\bc ould\b/g, 'could')
    .replace(/\bs hould\b/g, 'should')
    .replace(/\bb ecause\b/g, 'because')
    .replace(/\bincorr ect\b/gi, 'incorrect')
    .replace(/\bcorr ect\b/gi, 'correct')
    .replace(/\bperf ectly\b/gi, 'perfectly')
    .replace(/\bpr evious\b/gi, 'previous')
    .replace(/\bpr ovides\b/gi, 'provides')
    .replace(/\bpr ovide\b/gi, 'provide')
    .replace(/\bpr esented\b/gi, 'presented')
    .replace(/\bpr esent\b/gi, 'present')
    .replace(/\btr ansition\b/gi, 'transition')
    .replace(/\btr ansitions\b/gi, 'transitions')
    .replace(/\btr ansitio n\b/gi, 'transition')
    .replace(/\bwor ds\b/gi, 'words')
    .replace(/\bwor d\b/gi, 'word')
    .replace(/\bRegar dless\b/gi, 'Regardless')
    .replace(/\bStandar d\b/gi, 'Standard')
    .replace(/\bstandar d\b/gi, 'standard')
    .replace(/\br estatement\b/gi, 'restatement')
    .replace(/\br estate\b/gi, 'restate')
    .replace(/\bdisagr eement\b/gi, 'disagreement')
    .replace(/\bactual ly\b/gi, 'actually')
    .replace(/\bagr ees\b/gi, 'agrees')
    .replace(/\bagr ee\b/gi, 'agree')
    .replace(/\bappear ance\b/gi, 'appearance')
    .replace(/\br ole\b/gi, 'role')
    .replace(/\bst ories\b/gi, 'stories')
    .replace(/\bst ory\b/gi, 'story')
    .replace(/\bcelebr ated\b/gi, 'celebrated')
    .replace(/\bE dgar\b/g, 'Edgar')
    .replace(/\bhorr or\b/gi, 'horror')
    .replace(/\bGener ations\b/gi, 'Generations')
    .replace(/\bear thenwar e\b/gi, 'earthenware')
    .replace(/\bdecor ative\b/gi, 'decorative')
    .replace(/\bdur able\b/gi, 'durable')
    .replace(/\blogic al\b/gi, 'logical')
    .replace(/\bp iece\b/gi, 'piece')
    .replace(/\bp ieces\b/gi, 'pieces')
    .replace(/\bpiece s\b/gi, 'pieces')
    .replace(/\bk ey\b/gi, 'key')
    .replace(/\bfact ors\b/gi, 'factors')
    .replace(/\bfact or\b/gi, 'factor')
    .replace(/\bdesir ed\b/gi, 'desired')
    .replace(/\bp otter\b/gi, 'potter')
    .replace(/\bp otters\b/gi, 'potters')
    .replace(/\br adiation\b/gi, 'radiation')
    .replace(/\br adioactive\b/gi, 'radioactive')
    .replace(/\bat omic\b/gi, 'atomic')
    .replace(/\bk nown\b/gi, 'known')
    .replace(/\bappr oved\b/gi, 'approved')
    .replace(/\bCo ngr ess\b/g, 'Congress')
    .replace(/\br epr esented\b/gi, 'represented')
    .replace(/\binfr astr uctur e\b/gi, 'infrastructure')
    .replace(/\bst udy\b/gi, 'study')
    .replace(/\btr ack ed\b/gi, 'tracked')
    .replace(/\bor char ds\b/gi, 'orchards')
    .replace(/\bpr oduce\b/gi, 'produce')
    .replace(/\bnonr enewable\b/gi, 'nonrenewable')
    .replace(/\bpetr oleum\b/gi, 'petroleum')
    .replace(/\bmos t\b/gi, 'most')
    .replace(/\bm or e\b/gi, 'more')
    .replace(/\bmor e\b/gi, 'more')
    .replace(/\bvar iable\b/gi, 'variable')
    .replace(/\br ewritten\b/gi, 'rewritten')
    .replace(/\bpr oper ty\b/gi, 'property')
    .replace(/\br equired\b/gi, 'required')
    .replace(/\br esult\b/gi, 'result')
    .replace(/\br esults\b/gi, 'results')
    .replace(/\bd ifferent\b/gi, 'different')
    .replace(/\bf unction\b/gi, 'function')
    .replace(/\be quation\b/gi, 'equation')
    .replace(/\bs ystem\b/gi, 'system')
    .replace(/\bs olution\b/gi, 'solution')
    .replace(/\bs olutions\b/gi, 'solutions')
    .replace(/\bsolutio ns\b/gi, 'solutions')
    .replace(/\bc onstant\b/gi, 'constant')
    .replace(/\bc onstants\b/gi, 'constants')
    .replace(/\bp erpendicular\b/gi, 'perpendicular')
    .replace(/\bp oints\b/gi, 'points')
    .replace(/\bp oint\b/gi, 'point')
    .replace(/\bv alue\b/gi, 'value')
    .replace(/\bg iven\b/gi, 'given')
    .replace(/\bl inear\b/gi, 'linear')
    .replace(/\be xpression\b/gi, 'expression')
    .replace(/\bc hoice\b/gi, 'choice')
    .replace(/\bc hoices\b/gi, 'choices')
    .replace(/\bp aragraph\b/gi, 'paragraph')
    .replace(/\bs entence\b/gi, 'sentence')
    .replace(/\bs entences\b/gi, 'sentences')
    .replace(/\bsentence s\b/gi, 'sentences')
    .replace(/\bb est\b/gi, 'best')
    .replace(/\ba nswer\b/gi, 'answer')
    .replace(/\br ight-h and\b/gi, 'right-hand')
    .replace(/\binf initely\b/gi, 'infinitely')
    .replace(/\s+/g, ' ')
    .trim();
}

function detectRWDomain(skillStr) {
  const s = (skillStr || '').toLowerCase();
  if (s.includes('standard english') || s.includes('conventions') || s.includes('boundaries') || s.includes('structur e, and sense')) {
    return 'Standard English Conventions';
  }
  if (s.includes('information and ideas') || s.includes('inf er ences') || s.includes('centr al') || s.includes('command of e')) {
    return 'Information and Ideas';
  }
  if (s.includes('cr aft') || s.includes('craft') || s.includes('words in context') || s.includes('cross-text') || s.includes('text structur')) {
    return 'Craft and Structure';
  }
  if (s.includes('expr ession') || s.includes('expression') || s.includes('rhetor') || s.includes('transition')) {
    return 'Expression of Ideas';
  }
  return 'Reading and Writing';
}

function detectRWSkill(skillStr) {
  const s = (skillStr || '').toLowerCase();
  if (s.includes('boundar')) return 'Boundaries';
  if (s.includes('form') || s.includes('sense') || s.includes('structur e, and sense')) return 'Form, Structure, and Sense';
  if (s.includes('centr al') || s.includes('central idea')) return 'Central Ideas and Details';
  if (s.includes('inf er ence') || s.includes('inference')) return 'Inferences';
  if (s.includes('command of')) return 'Command of Evidence';
  if (s.includes('words in context') || s.includes('wor ds in context')) return 'Words in Context';
  if (s.includes('cross-text')) return 'Cross-Text Connections';
  if (s.includes('text structur') || s.includes('purpose')) return 'Text Structure and Purpose';
  if (s.includes('rhetor')) return 'Rhetorical Synthesis';
  if (s.includes('transition')) return 'Transitions';
  return 'Reading and Writing Skills';
}

function detectMathDomain(skillStr) {
  const s = (skillStr || '').toLowerCase();
  if (s.includes('advanced math') || s.includes('nonlinear') || s.includes('e quivalent') || s.includes('equivalent')) {
    return 'Advanced Math';
  }
  if (s.includes('pr oblem') || s.includes('problem-solving') || s.includes('data analysis') || s.includes('ratios') || s.includes('percentages') || s.includes('probability')) {
    return 'Problem-Solving and Data Analysis';
  }
  if (s.includes('geometry') || s.includes('rigonometry') || s.includes('area') || s.includes('circles') || s.includes('triangles')) {
    return 'Geometry and Trigonometry';
  }
  if (s.includes('algebra') || s.includes('linear')) {
    return 'Algebra';
  }
  return 'Math';
}

function detectMathSkill(skillStr) {
  const s = (skillStr || '').toLowerCase();
  if (s.includes('linear equations in one')) return 'Linear equations in one variable';
  if (s.includes('linear equations in two')) return 'Linear equations in two variables';
  if (s.includes('systems of two linear')) return 'Systems of two linear equations in two variables';
  if (s.includes('linear inequalities')) return 'Linear inequalities in one or two variables';
  if (s.includes('linear functions')) return 'Linear functions';
  if (s.includes('equivalent expressions') || s.includes('e quivalent')) return 'Equivalent expressions';
  if (s.includes('nonlinear equations')) return 'Nonlinear equations in one variable and systems of equations';
  if (s.includes('nonlinear functions')) return 'Nonlinear functions';
  if (s.includes('ratios') || s.includes('proportional')) return 'Ratios, rates, and proportional relationships';
  if (s.includes('percentages')) return 'Percentages';
  if (s.includes('probability')) return 'Probability and conditional probability';
  if (s.includes('two-variable') || s.includes('scatter')) return 'Two-variable data: models and scatterplots';
  if (s.includes('one-variable') || s.includes('distributions') || s.includes('statistics')) return 'One-variable data: distributions and measures of center';
  if (s.includes('inference') || s.includes('margin of error')) return 'Inference from sample statistics and margin of error';
  if (s.includes('evaluating statistical')) return 'Evaluating statistical claims';
  if (s.includes('circles')) return 'Circles';
  if (s.includes('area and volume') || s.includes('volume')) return 'Area and volume';
  if (s.includes('right triangles') || s.includes('trigonometry')) return 'Right triangles and trigonometry';
  if (s.includes('lines, angles') || s.includes('angles') || s.includes('triangles')) return 'Lines, angles, and triangles';
  return 'Math Concepts';
}

// Process RW
const sanitizedRW = rw.map(q => {
  const domain = detectRWDomain(q.skill);
  const skill = detectRWSkill(q.skill);
  const questionId = q.questionId.replace(/\s+/g, '');
  return {
    ...q,
    questionId,
    domain,
    skill,
    conceptLabel: `${domain}: ${skill}`,
    prompt: cleanSpacedText(q.prompt),
    choices: (q.choices || []).map(cleanSpacedText),
    rationale: cleanSpacedText(q.rationale)
  };
});

// Process Math
const sanitizedMath = math.map(q => {
  const domain = detectMathDomain(q.skill);
  const skill = detectMathSkill(q.skill);
  const questionId = q.questionId.replace(/\s+/g, '');
  return {
    ...q,
    questionId,
    domain,
    skill,
    conceptLabel: `${domain}: ${skill}`,
    prompt: cleanSpacedText(q.prompt),
    choices: (q.choices || []).map(cleanSpacedText),
    rationale: cleanSpacedText(q.rationale)
  };
});

fs.writeFileSync(RW_PATH, JSON.stringify(sanitizedRW, null, 2), 'utf8');
fs.writeFileSync(MATH_PATH, JSON.stringify(sanitizedMath, null, 2), 'utf8');

console.log('Sanitization complete!');
console.log('RW count:', sanitizedRW.length);
console.log('Math count:', sanitizedMath.length);
