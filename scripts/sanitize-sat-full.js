const fs = require('fs');
const path = require('path');

const RW_PATH = path.join(__dirname, '../data/sat/official-sat-reading-writing.json');
const MATH_PATH = path.join(__dirname, '../data/sat/official-sat-math.json');

const rw = JSON.parse(fs.readFileSync(RW_PATH, 'utf8'));
const math = JSON.parse(fs.readFileSync(MATH_PATH, 'utf8'));

// Load dictionary if available
let dictWords = new Set();
try {
  if (fs.existsSync('/usr/share/dict/words')) {
    dictWords = new Set(
      fs.readFileSync('/usr/share/dict/words', 'utf8')
        .split('\n')
        .map(w => w.trim().toLowerCase())
        .filter(Boolean)
    );
  }
} catch (e) {
  console.warn('Could not load /usr/share/dict/words, using internal set');
}

const customAdditions = [
  'representation', 'representations', 'representative', 'reign', 'reigns',
  'consistent', 'consistently', 'consistency', 'similarity', 'similarities',
  'generalization', 'generalizations', 'difference', 'differences', 'portraits',
  'portrait', 'effectively', 'drawing', 'drawings', 'sculptor', 'sculptors',
  'proclaim', 'percentage', 'percentages', 'suitable', 'trade', 'trades',
  'raised', 'threshold', 'thresholds', 'higher', 'decrease', 'decreased',
  'decreases', 'proportion', 'proportions', 'silver', 'enriquez', 'luis',
  'jimenez', 'rudolfo', 'anaya', 'mexican', 'americans', 'sidonian',
  'ba\'alšillem', 'bce', 'were', 'not', 'atomic', 'radiation', 'radioactive',
  'infrastructure', 'orchards', 'petroleum', 'nonrenewable', 'semicolon',
  'apostrophe', 'participial', 'modifiers', 'prepositional', 'transitions',
  'quadratics', 'vieta', 'theorems', 'discriminant', 'earthenware',
  'linear', 'nonlinear', 'variable', 'variables', 'inequalities', 'inequality',
  'coordinates', 'polynomial', 'polynomials', 'system', 'systems', 'solution',
  'solutions', 'expression', 'expressions', 'equation', 'equations', 'constant',
  'constants', 'perpendicular', 'parallel', 'intercept', 'intercepts', 'slope',
  'exponential', 'exponentials', 'probability', 'statistics', 'distribution',
  'standard', 'conventions', 'boundaries', 'rhetorical', 'synthesis', 'passage',
  'passages', 'characterize', 'characterized', 'underlined', 'statement', 'statements'
];
customAdditions.forEach(w => dictWords.add(w.toLowerCase()));

function cleanSpacedText(text) {
  if (!text || typeof text !== 'string') return text || '';

  let s = text;

  // Protect Choice A, Choice B, Choice C, Choice D placeholders
  s = s.replace(/\bChoice\s+([A-D])\b/g, 'CHOICE__$1__PLACEHOLDER');

  // Fix spaced numbers: "3 67 BCE" -> "367 BCE", "2 000" -> "2000"
  s = s.replace(/\b(\d)\s+(\d{2,})\b/g, '$1$2');

  // Spacing around apostrophes: "Enriquez ’ s" -> "Enriquez's", "doesn ’ t" -> "doesn't"
  s = s.replace(/(\w+)\s*['’]\s*s\b\s*/gi, "$1's ");
  s = s.replace(/(\w+)\s*['’]\s*t\b/gi, "$1't");
  s = s.replace(/(\w+)\s*['’]\s*d\b/gi, "$1'd");
  s = s.replace(/(\w+)\s*['’]\s*ll\b/gi, "$1'll");
  s = s.replace(/(\w+)\s*['’]\s*re\b/gi, "$1're");
  s = s.replace(/(\w+)\s*['’]\s*ve\b/gi, "$1've");
  s = s.replace(/(\w+)\s*['’]\s*m\b/gi, "$1'm");
  s = s.replace(/(\w+)\s*['’]\s*([a-zA-Z]+)/g, "$1'$2");

  // Space before punctuation: "answer ." -> "answer.", "sculpt or ," -> "sculptor,"
  s = s.replace(/\s+([,.:;?!])/g, '$1');

  // Fix explicit known fractured words
  s = s
    .replace(/\bwer\s*e\s*n\s*ot\b/gi, 'were not')
    .replace(/\bwer\s*e\b/gi, 'were')
    .replace(/\bar\s*e\b/gi, 'are')
    .replace(/\bt\s*o\b/gi, 'to')
    .replace(/\bo\s*f\b/gi, 'of')
    .replace(/\bf\s*or\b/gi, 'for')
    .replace(/\bo\s*ne\b/gi, 'one')
    .replace(/\bn\s*ot\b/gi, 'not')
    .replace(/\br\s*eign\b/gi, 'reign')
    .replace(/\br\s*eigns\b/gi, 'reigns')
    .replace(/\br\s*esear\s*ching\b/gi, 'researching')
    .replace(/\br\s*esear\s*ch\b/gi, 'research')
    .replace(/\br\s*ather\b/gi, 'rather')
    .replace(/\br\s*aised\b/gi, 'raised')
    .replace(/\ba\s+t\s+opic\b/gi, 'a topic')
    .replace(/\bt\s+opic\b/gi, 'topic')
    .replace(/\bt\s+opics\b/gi, 'topics')
    .replace(/\br\s*epr\s*esent/gi, 'represent')
    .replace(/\bd\s*i\s*ff\s*er\s*ence/gi, 'difference')
    .replace(/\bd\s*i\s*ff\s*er\s*ent/gi, 'different')
    .replace(/\bs\s*i\s*milar/gi, 'similar')
    .replace(/\bgener\s*aliz/gi, 'generaliz')
    .replace(/\bdecr\s*ea\s*se/gi, 'decrease')
    .replace(/\bincr\s*ea\s*se/gi, 'increase')
    .replace(/\bpor\s*tr\s*ait/gi, 'portrait')
    .replace(/\bdr\s*aw\s*ing/gi, 'drawing')
    .replace(/\bper\s*cent/gi, 'percent')
    .replace(/\bBa\s*'\s*al\s*š\s*illem\b/g, "Ba'alšillem")
    .replace(/\bL\s+u\s+is\b/g, 'Luis');

  // Trailing single consonant: "emphasize s" -> "emphasizes"
  s = s.replace(/\b([a-z]{3,})\s+s\b/gi, '$1s');

  // Isolated capital letter followed by lowercase fragment:
  // "E nriquez" -> "Enriquez", "L uis" -> "Luis", "R udolfo" -> "Rudolfo", "J imenez" -> "Jimenez"
  s = s.replace(/\b([B-HJ-Z])\s+([a-z]{2,})\b/g, '$1$2');

  // Single isolated lowercase letter followed by fragment (e.g. "t opic" -> "topic", "r aised" -> "raised")
  s = s.replace(/\b([b-hj-np-z])\s+([a-z]+)\b/g, (match, letter, rest) => {
    const combined = (letter + rest).toLowerCase();
    if (dictWords.has(combined) || !dictWords.has(rest.toLowerCase())) {
      return letter + rest;
    }
    return match;
  });

  // Broken prefixes
  const brokenPrefixes = ['pr', 'tr', 'dr', 'thr', 'cr', 'br', 'gr', 'fr', 'st', 'sp', 'sc', 'wh', 'th', 'ch', 'sh', 'ph', 'ar', 'por', 'diff', 'eff', 'sui', 'decr', 'incr', 'wer', 'perso', 'sculpt', 'wr', 'mak', 'tak', 'repr', 'si', 'di'];
  for (const prefix of brokenPrefixes) {
    const regex = new RegExp(`\\b(${prefix})\\s+([a-z]+)\\b`, 'gi');
    s = s.replace(regex, (match, p, rest) => {
      const combined = (p + rest).toLowerCase();
      if (dictWords.has(combined) || !dictWords.has(rest.toLowerCase()) || ['aits', 'ait', 'ence', 'ences', 'ent', 'ents', 'ively', 'or', 'ors', 'iter', 'iters', 'es', 'en', 'e', 'milarity'].includes(rest.toLowerCase())) {
        return p + rest;
      }
      return match;
    });
  }

  // Broken suffixes
  const brokenSuffixes = ['en', 'or', 'ors', 'er', 'ers', 'ing', 'ings', 'tion', 'tions', 'ment', 'ments', 'ence', 'ences', 'ent', 'ents', 'ance', 'ances', 'ed', 'ly', 'al', 'able', 'ible', 'ive', 'ively', 'ade', 'ses', 'centage', 'lver', 'ade', 'ous', 'ful', 'less', 'ism', 'ist', 'ists', 'ical', 'ally', 'ic', 'ize', 'ized', 'izing', 'ization'];
  for (const suffix of brokenSuffixes) {
    const regex = new RegExp(`\\b([a-z]+)\\s+(${suffix})\\b`, 'gi');
    s = s.replace(regex, (match, prefix, sfx) => {
      const combined = (prefix + sfx).toLowerCase();
      if (dictWords.has(combined) || !dictWords.has(prefix.toLowerCase())) {
        return prefix + sfx;
      }
      return match;
    });
  }

  // Trailing single consonant: "perso n" -> "person", "Mexica n" -> "Mexican"
  s = s.replace(/\b([a-z]{3,})\s+([ntd])\b/gi, (match, base, end) => {
    const combined = (base + end).toLowerCase();
    if (dictWords.has(combined) || !dictWords.has(base.toLowerCase())) {
      return base + end;
    }
    return match;
  });

  // Restore Choice placeholders
  s = s.replace(/CHOICE__([A-D])__PLACEHOLDER/g, 'Choice $1');

  // Collapse consecutive whitespace
  s = s.replace(/\s+/g, ' ').trim();

  return s;
}

console.log('Sanitizing Reading & Writing questions...');
let cleanedRWCount = 0;
const sanitizedRW = rw.map(q => {
  const pClean = cleanSpacedText(q.prompt);
  const rClean = cleanSpacedText(q.rationale);
  const cClean = (q.choices || []).map(cleanSpacedText);
  if (pClean !== q.prompt || rClean !== q.rationale) cleanedRWCount++;

  return {
    ...q,
    questionId: (q.questionId || '').replace(/\s+/g, ''),
    prompt: pClean,
    choices: cClean,
    rationale: rClean,
    skill: cleanSpacedText(q.skill),
    domain: cleanSpacedText(q.domain),
    conceptLabel: cleanSpacedText(q.conceptLabel)
  };
});

console.log('Sanitizing Math questions...');
let cleanedMathCount = 0;
const sanitizedMath = math.map(q => {
  const pClean = cleanSpacedText(q.prompt);
  const rClean = cleanSpacedText(q.rationale);
  const cClean = (q.choices || []).map(cleanSpacedText);
  if (pClean !== q.prompt || rClean !== q.rationale) cleanedMathCount++;

  return {
    ...q,
    questionId: (q.questionId || '').replace(/\s+/g, ''),
    prompt: pClean,
    choices: cClean,
    rationale: rClean,
    skill: cleanSpacedText(q.skill),
    domain: cleanSpacedText(q.domain),
    conceptLabel: cleanSpacedText(q.conceptLabel)
  };
});

fs.writeFileSync(RW_PATH, JSON.stringify(sanitizedRW, null, 2), 'utf8');
fs.writeFileSync(MATH_PATH, JSON.stringify(sanitizedMath, null, 2), 'utf8');

console.log(`Finished! Cleaned ${cleanedRWCount} RW questions and ${cleanedMathCount} Math questions.`);
