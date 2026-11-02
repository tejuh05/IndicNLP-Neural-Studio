/**
 * Spelling Normalizer & Phonetic Canonicalizer for Romanized Kannada
 * Handles transliteration variances, vowel lengthening/shortening, syncope, dialectal spelling,
 * and Levenshtein distance-based fuzzy matching for robust root identification.
 */

// Direct equivalence map for known high-frequency Romanized Kannada variants
const CANONICAL_MAP: Record<string, string> = {
  // Pronouns
  'nanu': 'naanu',
  'naanu': 'naanu',
  'nivu': 'neevu',
  'neevu': 'neevu',
  'navu': 'naavu',
  'naavu': 'naavu',
  'avnu': 'avanu',
  'avanu': 'avanu',
  'avlu': 'avalu',
  'avalu': 'avalu',
  'avru': 'avaru',
  'avaru': 'avaru',
  'nange': 'nanage',
  'nimge': 'nimage',
  'namge': 'namage',
  'avange': 'avanige',
  'avlige': 'avalige',
  'avarge': 'avarige',
  'nanna': 'nanna',
  'nimma': 'nimma',
  'namma': 'namma',
  'avana': 'avana',
  'avala': 'avala',
  'avara': 'avara',

  // Time & Demonstratives
  'nale': 'naale',
  'naale': 'naale',
  'ivattu': 'eevatthu',
  'eevatthu': 'eevatthu',
  'eewathu': 'eevatthu',
  'ninne': 'ninne',
  'yavaga': 'yaavaga',
  'yaavaga': 'yaavaga',
  'yaake': 'yaake',
  'yake': 'yaake',
  'yenu': 'enu',
  'enu': 'enu',
  'hege': 'hege',
  'hegide': 'hegide',
  'hegidey': 'hegide',
  'hegidhe': 'hegide',
  'hegiddira': 'hegiddira',
  'hegiddiraa': 'hegiddira',
  'illi': 'illi',
  'alli': 'alli',
  'elli': 'elli',
  'idu': 'idu',
  'adu': 'adu',

  // Common Verbs & Auxiliaries (with casual vowel syncope)
  'hogtini': 'hoguthini',
  'hogthini': 'hoguthini',
  'hoguthini': 'hoguthini',
  'hogtheeni': 'hoguthini',
  'bartini': 'baruthini',
  'barthini': 'baruthini',
  'bartira': 'baruttira',
  'barthira': 'baruttira',
  'baruttira': 'baruttira',
  'bartheera': 'baruttira',
  'hogtira': 'hoguttira',
  'hogthira': 'hoguttira',
  'hoguttira': 'hoguttira',
  'madtini': 'maaduthini',
  'madthini': 'maaduthini',
  'maadtini': 'maaduthini',
  'maadutheeni': 'maaduthini',
  'madidira': 'maadidira',
  'maadidira': 'maadidira',
  'madiddeera': 'maadidira',
  'madilla': 'maadilla',
  'maadilla': 'maadilla',
  'madalla': 'maadalla',
  'maadalla': 'maadalla',
  'baralla': 'baralla',
  'baaralla': 'baralla',
  'hogalla': 'hogalla',
  'mugithu': 'mugithu',
  'mugitu': 'mugithu',
  'mugidide': 'mugithu',
  'hogona': 'hogona',
  'maadona': 'maadona',
  'madona': 'maadona',
  'nodona': 'nodona',
  'ide': 'ide',
  'idhe': 'ide',
  'idini': 'idini',
  'idira': 'idira',
  'iddira': 'idira',
  'iddane': 'iddane',
  'iddare': 'iddare',
  'illa': 'illa',
  'beku': 'beku',
  'baeku': 'beku',
  'beda': 'beda',
  'chennagi': 'chennagi',
  'channagi': 'chennagi',
  'gothu': 'gothu',
  'gottu': 'gothu',
  'gothilla': 'gothilla',
  'gottilla': 'gothilla',
  'agalla': 'aagalla',
  'aagalla': 'aagalla',
  'agthilla': 'aaguthilla',
  'aagthilla': 'aaguthilla',
  'aaguthilla': 'aaguthilla',
  'agide': 'aagide',
  'aagide': 'aagide',
  'aaythu': 'aaythu',
  'aaytu': 'aaythu',
  'aythu': 'aaythu',
  'banni': 'banni',
  'hogi': 'hogi',
  'kodi': 'kodi',
  'kodu': 'kodu',
  'oota': 'oota',
  'kelsa': 'kelasa',
  'kelasa': 'kelasa',
  'mane': 'mane',
  'manege': 'manege',
  'ooru': 'ooru',
  'oorige': 'oorige',
  'solpa': 'swalpa',
  'swalpa': 'swalpa',
  'thumba': 'tumba',
  'tumba': 'tumba',
  'dayavittu': 'dayavittu',
  'namaskara': 'namaskara',
  'haudu': 'haudu',
};

// Canonical Romanized Kannada Root Inventory for Fuzzy Matching
const CANONICAL_KANNADA_ROOTS: string[] = Array.from(new Set([
  ...Object.values(CANONICAL_MAP),
  'mane', 'ooru', 'kelsa', 'oota', 'thindi', 'kelasa', 'neeru', 'bengaluru',
  'hegide', 'hegiddira', 'hege', 'enu', 'illi', 'alli', 'elli', 'yavaga',
  'yaake', 'naale', 'ninne', 'eevatthu', 'ivattu', 'ide', 'illa', 'beku',
  'beda', 'gottu', 'gothilla', 'chennagi', 'swalpa', 'tumba', 'dayavittu',
  'namaskara', 'haudu', 'hogu', 'baru', 'maadu', 'nodu', 'kodu', 'thago',
  'banni', 'hogi', 'kodi', 'nodi', 'helu', 'keli'
]));

/**
 * Calculates Levenshtein Distance between two strings
 */
export function calculateLevenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1].toLowerCase() === b[j - 1].toLowerCase() ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,      // deletion
        dp[i][j - 1] + 1,      // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return dp[m][n];
}

/**
 * Fuzzy matcher against canonical Romanized Kannada root inventory
 */
export function findFuzzyKannadaMatch(token: string): {
  matched: boolean;
  canonical?: string;
  distance?: number;
} {
  const lower = token.toLowerCase().trim();
  if (lower.length < 3) return { matched: false };

  let bestMatch: string | null = null;
  let minDistance = Infinity;

  // Max allowed edit distance: 1 for length 3-5, 2 for length 6+
  const maxAllowedDistance = lower.length >= 6 ? 2 : 1;

  for (const root of CANONICAL_KANNADA_ROOTS) {
    // Quick length filter
    if (Math.abs(root.length - lower.length) > maxAllowedDistance) continue;

    const dist = calculateLevenshteinDistance(lower, root);
    if (dist < minDistance && dist <= maxAllowedDistance) {
      minDistance = dist;
      bestMatch = root;
    }
  }

  if (bestMatch && minDistance <= maxAllowedDistance) {
    return {
      matched: true,
      canonical: bestMatch,
      distance: minDistance,
    };
  }

  return { matched: false };
}

/**
 * Phonetically normalizes a Romanized token to test for Kannada grammatical patterns
 */
export function normalizeRomanizedSpelling(token: string): {
  canonical: string;
  isRecognizedVariant: boolean;
  normalizedPattern: string;
  fuzzyMatched?: boolean;
  distance?: number;
} {
  const clean = token.trim();
  const lower = clean.toLowerCase();

  // 1. Direct dictionary match
  if (CANONICAL_MAP[lower]) {
    return {
      canonical: CANONICAL_MAP[lower],
      isRecognizedVariant: true,
      normalizedPattern: CANONICAL_MAP[lower],
    };
  }

  // 2. Algorithmic Phonetic Simplification:
  // - Strip trailing casual glides: 'ey' -> 'e' (e.g. 'hegidey' -> 'hegide')
  // - Normalize double vowels: 'aa' -> 'a', 'ee' -> 'i', 'oo' -> 'u', 'ii' -> 'i', 'uu' -> 'u'
  // - Normalize dental digraphs: 'th' -> 't', 'dh' -> 'd'
  let simplified = lower
    .replace(/ey$/, 'e')
    .replace(/^y(?=[ei])/, '') // 'yenu' -> 'enu'
    .replace(/aa/g, 'a')
    .replace(/ee/g, 'i')
    .replace(/oo/g, 'u')
    .replace(/ii/g, 'i')
    .replace(/uu/g, 'u')
    .replace(/th/g, 't')
    .replace(/dh/g, 'd')
    .replace(/shh?/g, 's')
    .replace(/([bcdfghjklmnpqrstvwxyz])\1+/g, '$1'); // collapse geminates 'tt' -> 't'

  if (CANONICAL_MAP[simplified]) {
    return {
      canonical: CANONICAL_MAP[simplified],
      isRecognizedVariant: true,
      normalizedPattern: simplified,
    };
  }

  // 3. Levenshtein Distance-Based Fuzzy Matching
  const fuzzy = findFuzzyKannadaMatch(lower);
  if (fuzzy.matched && fuzzy.canonical) {
    return {
      canonical: fuzzy.canonical,
      isRecognizedVariant: true,
      normalizedPattern: fuzzy.canonical,
      fuzzyMatched: true,
      distance: fuzzy.distance,
    };
  }

  return {
    canonical: lower,
    isRecognizedVariant: false,
    normalizedPattern: simplified,
  };
}
