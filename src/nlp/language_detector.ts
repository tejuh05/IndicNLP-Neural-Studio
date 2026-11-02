/**
 * Hybrid Language Detector & Pre-Processing Layer
 * 
 * Implements a multi-tier hybrid detection logic combining:
 * 1. Regex patterns for common Kannada suffixes & clitic agglutinations.
 * 2. Regex patterns for Romanized Kannada phonotactic indicators (geminates, Dravidian codas).
 * 3. Probabilistic lookup and morphological scoring for English roots and affixes.
 * 4. Identification of hybrid tokens (English root + Kannada suffix).
 * 
 * This module acts as the pre-processing layer before Gemini is invoked for
 * contextual clarification on ambiguous or low-confidence tokens.
 */

import { LanguageClass, SuffixType, MorphologyDetails } from '../types';
import { ENGLISH_GE_EXCEPTIONS, matchEnglishMorphology } from './english_lexicon';
import { calculateLevenshteinDistance, findFuzzyKannadaMatch } from './spelling_normalizer';

// ============================================================================
// 1. Types & Interfaces
// ============================================================================

export interface DetectedToken {
  id: string;
  surface: string;
  cleanSurface: string;
  language: LanguageClass;
  confidence: number; // 0.0 to 1.0 deterministic / probabilistic confidence
  isAmbiguous: boolean;
  needsGeminiClarification: boolean;
  clarificationReason?: string;
  candidateLanguages: LanguageClass[];
  morphology: MorphologyDetails;
  phonotacticIndicators: {
    hasKannadaGeminates: boolean;
    hasDravidianDigraph: boolean;
    hasVowelCoda: boolean;
    hasEnglishConsonantCluster: boolean;
    englishRootProbability: number;
  };
  posTag?: string;
  normalizedSpelling?: string;
}

export interface PreprocessingSentenceResult {
  rawSentence: string;
  tokens: DetectedToken[];
  overallConfidence: number;
  requiresGeminiClarification: boolean;
  ambiguousTokens: DetectedToken[];
  geminiPromptContext?: {
    sentence: string;
    targetTokens: Array<{
      surface: string;
      position: number;
      initialGuess: LanguageClass;
      suspectedRoot?: string;
      suspectedSuffix?: string;
      reason: string;
    }>;
  };
}

export interface KannadaSuffixDefinition {
  name: string;
  regex: RegExp;
  grammaticalCase: SuffixType;
  suffixString: string;
  description: string;
  falsePositiveProtections?: RegExp[];
}

// ============================================================================
// 2. Regex Patterns for Kannada Suffixes
// ============================================================================

export const KANNADA_SUFFIX_RULES: KannadaSuffixDefinition[] = [
  {
    name: 'Dative Case (-ge, -ige, -kke, -ke)',
    regex: /(?:[-_])?(?:i?ge|kke|ke)$/i,
    grammaticalCase: 'dative',
    suffixString: '-ge',
    description: 'Dative case suffix denoting target, direction or recipient (to / for)',
    falsePositiveProtections: [
      /^(?:orange|cabbage|village|baggage|luggage|damage|manage|voyage|message|passage|cottage|image|stage|page|age|huge|forge|verge|merge)$/i,
      /^(?:strike|smoke|brake|cake|lake|make|take|wake|like|bike|hike)$/i, // -ke protection
    ],
  },
  {
    name: 'Locative Case (-alli, -dalli)',
    regex: /(?:[-_])?(?:d?alli)$/i,
    grammaticalCase: 'locative',
    suffixString: '-alli',
    description: 'Locative case suffix denoting location or containment (in / at)',
    falsePositiveProtections: [
      /^(?:halli|alli)$/i,
    ],
  },
  {
    name: 'Instrumental / Ablative (-inda, -dinda)',
    regex: /(?:[-_])?(?:d?inda)$/i,
    grammaticalCase: 'instrumental',
    suffixString: '-inda',
    description: 'Instrumental/ablative suffix denoting source or instrument (from / by)',
  },
  {
    name: 'Accusative Case (-annu, -nu, -na)',
    regex: /(?:[-_])?(?:annu|nu)$/i,
    grammaticalCase: 'accusative',
    suffixString: '-annu',
    description: 'Accusative case suffix denoting direct object',
    falsePositiveProtections: [
      /^(?:menu)$/i,
    ],
  },
  {
    name: 'Verbalizer / Causative (-maadi, -madi, -madbeku)',
    regex: /(?:[-_])?(?:maa?di|maa?do|maa?dbeku)$/i,
    grammaticalCase: 'verbalizer',
    suffixString: '-maadi',
    description: 'Verbalizer compound converting noun or loan verb into predicate (to do / make)',
  },
  {
    name: 'Stative / Perfect Auxiliary (-aagide, -aaythu, -aagidhe)',
    regex: /(?:[-_])?(?:aagi?dhe?|aaythu|aythu)$/i,
    grammaticalCase: 'auxiliary',
    suffixString: '-aagide',
    description: 'Stative auxiliary marker (has become / happened)',
  },
  {
    name: 'Modal Obligation (-beku, -aagbeku, -baardu)',
    regex: /(?:[-_])?(?:aag)?(?:beku|baardu)$/i,
    grammaticalCase: 'modal',
    suffixString: '-beku',
    description: 'Modal auxiliary expressing obligation or desire (must / should / want)',
  },
  {
    name: 'First Person Verb Inflection (-tini, -thini, -de, -thene)',
    regex: /(?:[-_])?(?:th?ini|th?ene)$/i,
    grammaticalCase: 'auxiliary',
    suffixString: '-tini',
    description: 'First person non-past habitual/future verb inflection (I will do / I do)',
  },
  {
    name: 'Second Person Plural / Honorific Verb Inflection (-tira, -thira, -tiraa)',
    regex: /(?:[-_])?(?:th?iraa?)$/i,
    grammaticalCase: 'auxiliary',
    suffixString: '-tira',
    description: 'Second person honorific verb inflection (Will you do / Do you do)',
  },
  {
    name: 'Hortative / Plural Imperative (-ona)',
    regex: /(?:[-_])?(?:ona)$/i,
    grammaticalCase: 'auxiliary',
    suffixString: '-ona',
    description: 'Hortative plural inflection (Let us / shall we)',
  },
  {
    name: 'Negative Finite Predicate (-illa, -alla, -baralla)',
    regex: /(?:[-_])?(?:illa|alla|baralla)$/i,
    grammaticalCase: 'auxiliary',
    suffixString: '-illa',
    description: 'Negative finite predicate marker (did not / will not / is not)',
  },
];

// ============================================================================
// 3. Regex Patterns for Romanized Kannada Indicators
// ============================================================================

/**
 * Phonotactic and orthographic signatures strongly characteristic of Romanized Kannada:
 * - Geminate consonants (retroflex & dental doubled stops): tt, dd, nn, ll, mm, kk, pp, gg, bb, jj
 * - Aspirated stops & fricative digraphs: th, dh, bh, gh, kh, ph, jh
 * - Characteristic grammatical particles and pronouns
 */
export const ROMANIZED_KANNADA_PATTERNS = {
  geminates: /(?:tt|dd|nn|ll|mm|kk|pp|gg|bb|jj|ss|vv)/i,
  aspirateDigraphs: /(?:th|dh|bh|gh|kh|ph|jh|ny|ch)/i,
  dravidianVowelCoda: /[aeiou]$/i,
  
  // Frequent closed-class pronouns & deictic markers
  pronounsAndDeictics: /^(?:naanu|nanu|neenu|ninu|neevu|nivu|avanu|avnu|avalu|avlu|avaru|naavu|navu|namdu|nimdu|avardu|idu|adu|yaavudu|yavdu)$/i,
  
  // Spatiotemporal and relational postpositions / temporal adverbs
  postpositionsAndAdverbs: /^(?:illi|alli|elli|eega|iga|aaga|yaavaaga|yavaga|mele|kelage|olage|horage|jothe|pakka|mundhe|hinde|matte|innu|naale|nale|ivattu|ivathu|ninne|bega|sulabha|kashta)$/i,
  
  // High-frequency functional copulas & discourse particles
  copulasAndDiscourse: /^(?:ide|idhe|illa|alla|beku|beda|houdu|haudu|kano|kane|kanoo|ri|re|andre|adre|kooda|kuda|mathra|anthu|anthara|nodidira|nodona)$/i,
  
  // Common Kannada verbs and inflected stems
  commonVerbalForms: /^(?:hogu|hogi|hogtini|hogona|banni|ba|bartira|baralla|madu|maadi|madi|madidira|madilla|mugithu|mugitu|kelu|heli|gothu|gottu|kodi|thogo|bega)$/i,
};

// ============================================================================
// 4. Probabilistic Lookup for English Roots & Affixes
// ============================================================================

/**
 * High-probability English lexical roots (normalized lowercase).
 * Includes core vocabulary, workplace terms, digital terminology, campus nouns, and common loan roots.
 */
const ENGLISH_LEXICON_PRIORS: Record<string, number> = {
  // Workplace & Tech (Highest borrowability in Kanglish)
  office: 0.99,
  meeting: 0.99,
  college: 0.99,
  project: 0.99,
  assignment: 0.99,
  exam: 0.99,
  class: 0.98,
  classes: 0.98,
  submit: 0.98,
  submitted: 0.98,
  submitting: 0.98,
  complete: 0.98,
  completed: 0.98,
  completing: 0.98,
  laptop: 0.99,
  phone: 0.99,
  mobile: 0.98,
  table: 0.95,
  chair: 0.95,
  desk: 0.95,
  room: 0.95,
  screen: 0.98,
  code: 0.99,
  app: 0.99,
  application: 0.99,
  server: 0.99,
  database: 0.99,
  system: 0.98,
  data: 0.98,
  email: 0.99,
  message: 0.98,
  chat: 0.98,
  call: 0.95,
  link: 0.98,
  doc: 0.98,
  document: 0.98,
  file: 0.98,
  folder: 0.98,
  issue: 0.98,
  bug: 0.98,
  error: 0.98,
  test: 0.96,
  testing: 0.96,
  deploy: 0.98,
  review: 0.98,
  sprint: 0.99,
  demo: 0.98,
  presentation: 0.98,
  interview: 0.98,
  package: 0.98,
  order: 0.97,
  delivery: 0.98,
  payment: 0.98,
  price: 0.96,
  bill: 0.96,
  card: 0.96,
  bank: 0.97,
  ticket: 0.98,
  bus: 0.98,
  train: 0.98,
  metro: 0.98,
  cab: 0.98,
  auto: 0.95,
  car: 0.97,
  bike: 0.97,
  traffic: 0.98,
  road: 0.96,
  station: 0.98,
  stop: 0.96,
  movie: 0.98,
  film: 0.98,
  cinema: 0.98,
  show: 0.96,
  book: 0.95,
  booking: 0.98,
  coffee: 0.98,
  tea: 0.96,
  lunch: 0.98,
  dinner: 0.98,
  breakfast: 0.98,
  team: 0.98,
  friend: 0.97,
  friends: 0.97,
  work: 0.96,
  time: 0.95,
  morning: 0.96,
  evening: 0.96,
  night: 0.96,
  today: 0.97,
  tomorrow: 0.98,
  yesterday: 0.98,
  plans: 0.96,
  details: 0.98,
  display: 0.98,
  customer: 0.98,
  service: 0.98,
  support: 0.98,

  // Common Function Words & Grammatical Core
  i: 0.99,
  me: 0.99,
  my: 0.99,
  we: 0.99,
  you: 0.99,
  your: 0.99,
  he: 0.99,
  she: 0.99,
  it: 0.99,
  they: 0.99,
  am: 0.99,
  is: 0.99,
  are: 0.99,
  was: 0.99,
  were: 0.99,
  be: 0.99,
  have: 0.99,
  has: 0.99,
  had: 0.99,
  do: 0.99,
  did: 0.99,
  will: 0.99,
  can: 0.99,
  should: 0.99,
  the: 0.99,
  a: 0.99,
  an: 0.99,
  and: 0.99,
  but: 0.99,
  or: 0.99,
  if: 0.99,
  because: 0.99,
  so: 0.98,
  not: 0.99,
  no: 0.98,
  yes: 0.98,
  for: 0.98,
  with: 0.98,
  about: 0.98,
  from: 0.98,
  to: 0.95, // can overlap with Kannada short syllables in isolation
  in: 0.98,
  on: 0.98,
  at: 0.98,
  by: 0.98,
  just: 0.98,
  very: 0.98,
  good: 0.97,
  bad: 0.97,
  great: 0.97,
  new: 0.97,
  old: 0.97,
  ready: 0.97,
  send: 0.98,
  sent: 0.98,
  share: 0.98,
  check: 0.98,
  open: 0.98,
  close: 0.98,
};

/**
 * English morphological affix indicators.
 */
export const ENGLISH_AFFIX_PATTERNS = {
  suffixes: /(?:tion|sion|ment|ness|able|ible|ious|eous|ity|ive|ence|ance|ful|less|ing|ed|est|ist|ism|ize|ise)$/i,
  prefixes: /^(?:un|dis|re|pre|post|inter|multi|non|over|under|anti|super|sub|pro|ex)/i,
  consonantClusters: /(?:str|spl|scr|spr|ght|tch|ck|xt|wh|wr|kn|ph)/i,
};

// ============================================================================
// 5. Probabilistic English Root Scoring
// ============================================================================

export interface EnglishRootScore {
  probability: number; // 0.0 to 1.0
  isLikelyEnglish: boolean;
  matchedDirectLexicon: boolean;
  matchedStemLexicon?: string;
  matchedAffix?: string;
}

export function scoreEnglishRoot(stem: string): EnglishRootScore {
  const clean = stem.trim().toLowerCase();
  if (!clean || clean.length < 2) {
    return { probability: 0.0, isLikelyEnglish: false, matchedDirectLexicon: false };
  }

  // 1. Direct prior probability match in lexicon
  if (ENGLISH_LEXICON_PRIORS[clean] !== undefined) {
    return {
      probability: ENGLISH_LEXICON_PRIORS[clean],
      isLikelyEnglish: true,
      matchedDirectLexicon: true,
    };
  }

  // 2. Stemming inspection (stripping English inflectional endings: -ed, -ing, -s, -es)
  const strippedStems = [
    clean.replace(/(?:ing|ed|es|s)$/i, ''),
    clean.replace(/(?:e?d)$/i, 'e'), // completed -> complete
  ];

  for (const s of strippedStems) {
    if (s.length >= 3 && ENGLISH_LEXICON_PRIORS[s] !== undefined) {
      return {
        probability: Math.min(0.95, ENGLISH_LEXICON_PRIORS[s] * 0.98),
        isLikelyEnglish: true,
        matchedDirectLexicon: false,
        matchedStemLexicon: s,
      };
    }
  }

  // 3. Subword & affix pattern evaluation
  let prob = 0.2; // Base prior for unknown Latin token
  let matchedAffix: string | undefined;

  if (ENGLISH_AFFIX_PATTERNS.suffixes.test(clean)) {
    prob += 0.45;
    matchedAffix = 'english_derivational_suffix';
  }
  if (ENGLISH_AFFIX_PATTERNS.prefixes.test(clean)) {
    prob += 0.25;
    matchedAffix = matchedAffix ? `${matchedAffix}+prefix` : 'english_prefix';
  }
  if (ENGLISH_AFFIX_PATTERNS.consonantClusters.test(clean)) {
    prob += 0.25;
  }

  // Penalize tokens that end with typical Dravidian vowels without Germanic clusters
  if (ROMANIZED_KANNADA_PATTERNS.dravidianVowelCoda.test(clean) && !ENGLISH_AFFIX_PATTERNS.consonantClusters.test(clean)) {
    prob -= 0.3;
  }

  // Penalize geminates typical of Kannada
  if (ROMANIZED_KANNADA_PATTERNS.geminates.test(clean)) {
    prob -= 0.35;
  }

  const clampedProb = Math.max(0.01, Math.min(0.99, Number(prob.toFixed(2))));
  return {
    probability: clampedProb,
    isLikelyEnglish: clampedProb >= 0.65,
    matchedDirectLexicon: false,
    matchedAffix,
  };
}

// ============================================================================
// 6. Suffix & Enclitic Analysis Helper
// ============================================================================

export interface SuffixMatchResult {
  hasSuffix: boolean;
  root: string;
  suffix?: string;
  rule?: KannadaSuffixDefinition;
  isHyphenated: boolean;
}

export function detectKannadaSuffix(tokenSurface: string): SuffixMatchResult {
  const clean = tokenSurface.trim();
  
  // A. Check explicit hyphenation (e.g., "College-ge", "Submit-madi", "Project-alli")
  if (clean.includes('-')) {
    const parts = clean.split('-');
    if (parts.length === 2 && parts[0] && parts[1]) {
      const rootPart = parts[0];
      const suffixPart = parts[1].toLowerCase();

      for (const rule of KANNADA_SUFFIX_RULES) {
        // Test suffix part without leading dash
        const bareSuffixPattern = new RegExp(`^${rule.suffixString.replace(/^[-_]/, '')}$`, 'i');
        if (bareSuffixPattern.test(suffixPart) || rule.regex.test(suffixPart)) {
          return {
            hasSuffix: true,
            root: rootPart,
            suffix: `-${suffixPart}`,
            rule,
            isHyphenated: true,
          };
        }
      }
    }
  }

  // B. Check agglutinated suffix at word ending
  for (const rule of KANNADA_SUFFIX_RULES) {
    if (rule.falsePositiveProtections?.some(fp => fp.test(clean))) {
      continue;
    }

    const match = clean.match(rule.regex);
    if (match) {
      const matchedSuffix = match[0];
      const potentialRoot = clean.slice(0, clean.length - matchedSuffix.length);

      // Root must have meaningful length (at least 2 letters)
      if (potentialRoot.length >= 2) {
        return {
          hasSuffix: true,
          root: potentialRoot,
          suffix: matchedSuffix.startsWith('-') ? matchedSuffix : `-${matchedSuffix}`,
          rule,
          isHyphenated: false,
        };
      }
    }
  }

  return {
    hasSuffix: false,
    root: clean,
    isHyphenated: false,
  };
}

// ============================================================================
// 7. Core Hybrid Token Language Detector
// ============================================================================

/**
 * Classifies an individual token using regex suffixes, Romanized indicators,
 * and probabilistic English root analysis.
 */
export function detectTokenLanguage(
  tokenSurface: string,
  context?: {
    tokenIndex?: number;
    previousToken?: string;
    nextToken?: string;
    fullSentence?: string;
  }
): DetectedToken {
  const clean = tokenSurface.trim();
  const lower = clean.toLowerCase();
  const tokenId = `tok_${context?.tokenIndex ?? 0}_${clean}`;

  // 1. Punctuation & Numeric Symbols
  if (/^[\p{P}\p{S}\d]+$/u.test(clean)) {
    return {
      id: tokenId,
      surface: tokenSurface,
      cleanSurface: clean,
      language: 'punct',
      confidence: 1.0,
      isAmbiguous: false,
      needsGeminiClarification: false,
      candidateLanguages: ['punct'],
      morphology: { root: clean, rootLanguage: 'unknown' },
      phonotacticIndicators: {
        hasKannadaGeminates: false,
        hasDravidianDigraph: false,
        hasVowelCoda: false,
        hasEnglishConsonantCluster: false,
        englishRootProbability: 0.0,
      },
      posTag: 'PUNCT',
    };
  }

  // 2. Pure Kannada Unicode Characters (U+0C80 - U+0CFF)
  if (/[\u0C80-\u0CFF]/.test(clean)) {
    const isMixedScript = /[a-zA-Z]/.test(clean);
    const lang: LanguageClass = isMixedScript ? 'hybrid' : 'kannada';
    return {
      id: tokenId,
      surface: tokenSurface,
      cleanSurface: clean,
      language: lang,
      confidence: 0.99,
      isAmbiguous: false,
      needsGeminiClarification: false,
      candidateLanguages: [lang],
      morphology: {
        root: clean,
        rootLanguage: 'kannada',
      },
      phonotacticIndicators: {
        hasKannadaGeminates: false,
        hasDravidianDigraph: false,
        hasVowelCoda: true,
        hasEnglishConsonantCluster: false,
        englishRootProbability: 0.0,
      },
      posTag: 'NOUN',
    };
  }

  // Compute Romanized Kannada Phonotactic Flags
  const hasKannadaGeminates = ROMANIZED_KANNADA_PATTERNS.geminates.test(clean);
  const hasDravidianDigraph = ROMANIZED_KANNADA_PATTERNS.aspirateDigraphs.test(clean);
  const hasVowelCoda = ROMANIZED_KANNADA_PATTERNS.dravidianVowelCoda.test(clean);
  const hasEnglishConsonantCluster = ENGLISH_AFFIX_PATTERNS.consonantClusters.test(clean);

  // 3. Strict English Lexical Defense against False-Positive Suffix Matching (e.g. "college", "orange", "damage", "package", "page")
  if (ENGLISH_GE_EXCEPTIONS.has(lower)) {
    return {
      id: tokenId,
      surface: tokenSurface,
      cleanSurface: clean,
      language: 'english',
      confidence: 0.99,
      isAmbiguous: false,
      needsGeminiClarification: false,
      candidateLanguages: ['english'],
      morphology: { root: clean, rootLanguage: 'english' },
      phonotacticIndicators: {
        hasKannadaGeminates: false,
        hasDravidianDigraph: false,
        hasVowelCoda: true,
        hasEnglishConsonantCluster: true,
        englishRootProbability: 0.99,
      },
      posTag: 'NOUN',
    };
  }

  // 4. Standalone Postposition / Clitic Check (e.g., "office ge", "college alli")
  if (['ge', 'alli', 'inda', 'annu', 'na', 'jothe', 'olage'].includes(lower)) {
    return {
      id: tokenId,
      surface: tokenSurface,
      cleanSurface: clean,
      language: 'kannada',
      confidence: 0.95,
      isAmbiguous: false,
      needsGeminiClarification: false,
      candidateLanguages: ['kannada'],
      morphology: {
        root: clean,
        rootLanguage: 'kannada',
        suffixType: lower === 'ge' ? 'dative' : lower === 'alli' ? 'locative' : 'instrumental',
      },
      phonotacticIndicators: {
        hasKannadaGeminates,
        hasDravidianDigraph,
        hasVowelCoda: true,
        hasEnglishConsonantCluster: false,
        englishRootProbability: 0.05,
      },
      posTag: 'ADP',
    };
  }

  // 4. Suffix Extraction & Hybrid Evaluation
  const suffixMatch = detectKannadaSuffix(clean);
  const rootEnglishScore = scoreEnglishRoot(suffixMatch.root);

  // A. HYBRID DETECTED: Root has high English probability, but suffix is Kannada
  if (suffixMatch.hasSuffix && (rootEnglishScore.isLikelyEnglish || suffixMatch.isHyphenated)) {
    return {
      id: tokenId,
      surface: tokenSurface,
      cleanSurface: clean,
      language: 'hybrid',
      confidence: suffixMatch.isHyphenated ? 0.96 : 0.88,
      isAmbiguous: false,
      needsGeminiClarification: false,
      candidateLanguages: ['hybrid'],
      morphology: {
        root: suffixMatch.root,
        rootLanguage: 'english',
        suffix: suffixMatch.suffix,
        suffixLanguage: 'kannada',
        suffixType: suffixMatch.rule?.grammaticalCase,
        suffixDescription: suffixMatch.rule?.description,
      },
      phonotacticIndicators: {
        hasKannadaGeminates,
        hasDravidianDigraph,
        hasVowelCoda,
        hasEnglishConsonantCluster,
        englishRootProbability: rootEnglishScore.probability,
      },
      posTag: suffixMatch.rule?.grammaticalCase === 'verbalizer' ? 'VERB' : 'NOUN',
    };
  }

  // B. KANNADA INFLECTED: Suffix matched and root is NOT English
  if (suffixMatch.hasSuffix && !rootEnglishScore.isLikelyEnglish && !ENGLISH_LEXICON_PRIORS[suffixMatch.root.toLowerCase()]) {
    return {
      id: tokenId,
      surface: tokenSurface,
      cleanSurface: clean,
      language: 'kannada',
      confidence: 0.92,
      isAmbiguous: false,
      needsGeminiClarification: false,
      candidateLanguages: ['kannada'],
      morphology: {
        root: suffixMatch.root,
        rootLanguage: 'kannada',
        suffix: suffixMatch.suffix,
        suffixLanguage: 'kannada',
        suffixType: suffixMatch.rule?.grammaticalCase,
        suffixDescription: suffixMatch.rule?.description,
      },
      phonotacticIndicators: {
        hasKannadaGeminates,
        hasDravidianDigraph,
        hasVowelCoda,
        hasEnglishConsonantCluster,
        englishRootProbability: rootEnglishScore.probability,
      },
      posTag: suffixMatch.rule?.grammaticalCase === 'verbalizer' ? 'VERB' : 'NOUN',
    };
  }

  // 5. Direct Romanized Kannada Regex Patterns (High-Precision Functional Classes)
  if (
    ROMANIZED_KANNADA_PATTERNS.pronounsAndDeictics.test(lower) ||
    ROMANIZED_KANNADA_PATTERNS.postpositionsAndAdverbs.test(lower) ||
    ROMANIZED_KANNADA_PATTERNS.copulasAndDiscourse.test(lower) ||
    ROMANIZED_KANNADA_PATTERNS.commonVerbalForms.test(lower)
  ) {
    const isPronoun = ROMANIZED_KANNADA_PATTERNS.pronounsAndDeictics.test(lower);
    const isAdverb = ROMANIZED_KANNADA_PATTERNS.postpositionsAndAdverbs.test(lower);
    return {
      id: tokenId,
      surface: tokenSurface,
      cleanSurface: clean,
      language: 'kannada',
      confidence: 0.97,
      isAmbiguous: false,
      needsGeminiClarification: false,
      candidateLanguages: ['kannada'],
      morphology: {
        root: clean,
        rootLanguage: 'kannada',
      },
      phonotacticIndicators: {
        hasKannadaGeminates,
        hasDravidianDigraph,
        hasVowelCoda,
        hasEnglishConsonantCluster,
        englishRootProbability: 0.05,
      },
      posTag: isPronoun ? 'PRON' : isAdverb ? 'ADV' : 'VERB',
    };
  }

  // 6. Levenshtein Distance-Based Fuzzy Matcher for Romanized Kannada Root Identification
  const fuzzy = findFuzzyKannadaMatch(lower);
  if (fuzzy.matched && fuzzy.canonical) {
    return {
      id: tokenId,
      surface: tokenSurface,
      cleanSurface: clean,
      language: 'kannada',
      confidence: 0.91,
      isAmbiguous: false,
      needsGeminiClarification: false,
      candidateLanguages: ['kannada'],
      morphology: {
        root: fuzzy.canonical,
        rootLanguage: 'kannada',
      },
      phonotacticIndicators: {
        hasKannadaGeminates,
        hasDravidianDigraph,
        hasVowelCoda,
        hasEnglishConsonantCluster,
        englishRootProbability: 0.05,
      },
      posTag: 'VERB',
      normalizedSpelling: fuzzy.canonical,
    };
  }

  // 7. High-Probability English Lexicon Match
  const wholeTokenEnglishScore = scoreEnglishRoot(clean);
  if (wholeTokenEnglishScore.isLikelyEnglish && wholeTokenEnglishScore.probability >= 0.8) {
    return {
      id: tokenId,
      surface: tokenSurface,
      cleanSurface: clean,
      language: 'english',
      confidence: wholeTokenEnglishScore.probability,
      isAmbiguous: false,
      needsGeminiClarification: false,
      candidateLanguages: ['english'],
      morphology: {
        root: clean,
        rootLanguage: 'english',
      },
      phonotacticIndicators: {
        hasKannadaGeminates,
        hasDravidianDigraph,
        hasVowelCoda,
        hasEnglishConsonantCluster,
        englishRootProbability: wholeTokenEnglishScore.probability,
      },
      posTag: 'NOUN',
    };
  }

  // 7. Kannada Phonotactic Generalization for Unseen Tokens
  let kannadaScore = 0;
  if (hasKannadaGeminates) kannadaScore += 0.45;
  if (hasDravidianDigraph) kannadaScore += 0.35;
  if (hasVowelCoda) kannadaScore += 0.25;
  if (!hasEnglishConsonantCluster) kannadaScore += 0.15;

  if (kannadaScore >= 0.75 && wholeTokenEnglishScore.probability < 0.35) {
    return {
      id: tokenId,
      surface: tokenSurface,
      cleanSurface: clean,
      language: 'kannada',
      confidence: Number(Math.min(0.88, 0.5 + kannadaScore * 0.4).toFixed(2)),
      isAmbiguous: false,
      needsGeminiClarification: false,
      candidateLanguages: ['kannada'],
      morphology: { root: clean, rootLanguage: 'kannada' },
      phonotacticIndicators: {
        hasKannadaGeminates,
        hasDravidianDigraph,
        hasVowelCoda,
        hasEnglishConsonantCluster,
        englishRootProbability: wholeTokenEnglishScore.probability,
      },
      posTag: 'NOUN',
    };
  }

  // 8. Ambiguous / Low-Confidence Cases That Require Gemini Clarification
  // E.g. short words, novel slang, or competing phonotactic signals
  const isBorderline = Math.abs(kannadaScore - wholeTokenEnglishScore.probability) < 0.25;
  const confidence = Number(Math.max(0.4, 1 - Math.abs(kannadaScore - wholeTokenEnglishScore.probability)).toFixed(2));
  const candidateLanguages: LanguageClass[] = kannadaScore > wholeTokenEnglishScore.probability
    ? ['kannada', 'english']
    : ['english', 'kannada'];

  return {
    id: tokenId,
    surface: tokenSurface,
    cleanSurface: clean,
    language: candidateLanguages[0],
    confidence,
    isAmbiguous: isBorderline || confidence < 0.70,
    needsGeminiClarification: true,
    clarificationReason: `Competing phonetic/lexical cues (KN Score: ${kannadaScore.toFixed(2)}, EN Prob: ${wholeTokenEnglishScore.probability.toFixed(2)})`,
    candidateLanguages,
    morphology: {
      root: clean,
      rootLanguage: 'unknown',
      isAmbiguous: true,
      ambiguityReason: 'Awaiting contextual clarification from LLM',
    },
    phonotacticIndicators: {
      hasKannadaGeminates,
      hasDravidianDigraph,
      hasVowelCoda,
      hasEnglishConsonantCluster,
      englishRootProbability: wholeTokenEnglishScore.probability,
    },
    posTag: 'X',
  };
}

// ============================================================================
// 8. Sentence Pre-Processing Pipeline
// ============================================================================

/**
 * Pre-processes an entire sentence with hybrid logic, segmenting tokens and
 * assessing whether Gemini is needed for contextual clarification.
 */
export function preprocessSentence(sentence: string): PreprocessingSentenceResult {
  if (!sentence || !sentence.trim()) {
    return {
      rawSentence: '',
      tokens: [],
      overallConfidence: 1.0,
      requiresGeminiClarification: false,
      ambiguousTokens: [],
    };
  }

  // Tokenization preserving punctuation boundaries
  const rawTokens = sentence.match(/[\p{L}\p{N}]+(?:[-_][\p{L}\p{N}]+)*|[\p{P}\p{S}]/gu) || [];
  const tokens: DetectedToken[] = [];
  const ambiguousTokens: DetectedToken[] = [];

  for (let i = 0; i < rawTokens.length; i++) {
    const raw = rawTokens[i];
    const prev = i > 0 ? rawTokens[i - 1] : undefined;
    const next = i < rawTokens.length - 1 ? rawTokens[i + 1] : undefined;

    const detected = detectTokenLanguage(raw, {
      tokenIndex: i,
      previousToken: prev,
      nextToken: next,
      fullSentence: sentence,
    });

    tokens.push(detected);
    if (detected.needsGeminiClarification || detected.isAmbiguous) {
      ambiguousTokens.push(detected);
    }
  }

  const lexicalTokens = tokens.filter(t => t.language !== 'punct');
  const totalConfidence = lexicalTokens.reduce((sum, t) => sum + t.confidence, 0);
  const overallConfidence = lexicalTokens.length > 0
    ? Number((totalConfidence / lexicalTokens.length).toFixed(2))
    : 1.0;

  const requiresGeminiClarification = ambiguousTokens.length > 0 || overallConfidence < 0.85;

  let geminiPromptContext: PreprocessingSentenceResult['geminiPromptContext'];
  if (requiresGeminiClarification) {
    geminiPromptContext = {
      sentence,
      targetTokens: ambiguousTokens.map((t, idx) => ({
        surface: t.surface,
        position: idx,
        initialGuess: t.language,
        suspectedRoot: t.morphology.root,
        suspectedSuffix: t.morphology.suffix,
        reason: t.clarificationReason || 'Low deterministic confidence in code-mixed environment',
      })),
    };
  }

  return {
    rawSentence: sentence,
    tokens,
    overallConfidence,
    requiresGeminiClarification,
    ambiguousTokens,
    geminiPromptContext,
  };
}

/**
 * Convenience helper to format the prompt payload for Gemini contextual clarification
 */
export function formatGeminiClarificationPayload(
  preprocessing: PreprocessingSentenceResult
): string {
  if (!preprocessing.geminiPromptContext || preprocessing.ambiguousTokens.length === 0) {
    return '';
  }

  const tokenList = preprocessing.geminiPromptContext.targetTokens
    .map(t => `- Token "${t.surface}": Initial guess=${t.initialGuess}, Root="${t.suspectedRoot || 'none'}", Suffix="${t.suspectedSuffix || 'none'}" (${t.reason})`)
    .join('\n');

  return `Context Sentence: "${preprocessing.rawSentence}"
Ambiguous / Borderline Tokens to Clarify:
${tokenList}

Please clarify the exact language ('kannada' | 'english' | 'hybrid'), the stem root, suffix, and grammatical POS tag based on the surrounding sentence context.`;
}
