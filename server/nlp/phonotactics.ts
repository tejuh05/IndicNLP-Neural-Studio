/**
 * Subword & Phonotactic Analyzer for Dravidian (Kannada) vs Germanic (English)
 * Enables zero-shot generalization for unseen words by evaluating morphological
 * and phonetic character patterns.
 */

// Characteristic English consonant clusters, suffixes, and orthographic patterns
const ENGLISH_PATTERNS = [
  /tion$/i, /sion$/i, /ment$/i, /ness$/i, /less$/i, /able$/i, /ible$/i,
  /ence$/i, /ance$/i, /ship$/i, /hood$/i, /ism$/i, /ist$/i, /ity$/i,
  /ous$/i, /ive$/i, /ful$/i, /ing$/i, /ed$/i, /er$/i, /est$/i,
  /[bcdfghjklmnpqrstvwxyz]{3,}$/i, // triple consonant cluster at end (e.g., 'length', 'script')
  /^(?:str|spr|scr|thr|spl)/i,      // English 3-consonant onset
  /[aeiou]ght/i,                     // 'night', 'right', 'thought'
  /qu[aeiou]/i,                      // 'quick', 'question'
  /wh[aeiou]/i,                      // 'what', 'which', 'where'
  /ck$/i,                            // 'check', 'ticket'
  /tch/i,                            // 'batch', 'switch'
  /dge$/i,                           // 'bridge', 'judge'
  /(?:ct|pt|rt|rk|st|nd|nt|nk|mp|ft|xt)$/i // English terminal clusters
];

// Characteristic Romanized Kannada subword suffixes and inflectional markers
const KANNADA_INFLECTIONS = [
  // Verbal Conjugation Endings
  /t(?:h)?ini$/i,     // 1sg pres: hogtini, barthini
  /t(?:h)?ira$/i,     // 2pl/polite: bartira, hogtira
  /t(?:h)?eera$/i,    // 2pl polite variant
  /t(?:h)?a(?:ne|le|re)$/i, // 3sg masc/fem/pl: barthane, hogtale, bartare
  /i(?:thu|tu)$/i,    // past neuter: mugithu, aaythu, bittithu
  /aay(?:thu|tu)$/i,  // stative past: aaythu, mugidaaythu
  /(?:i|a)lla$/i,     // negative: baralla, hogalla, madilla, gothilla
  /(?:o|oda)na$/i,    // hortative: hogona, maadona, nodona
  /(?:aag|maad)?beku$/i, // modal obligation: maadbeku, hogbeku
  /id(?:i|ee)ra$/i,   // past polite question: madidira, nodidira
  /aag(?:ide|idhe)$/i, // auxiliary: complete-aagide

  // Case Clitics & Postpositions
  /(?:[aeiou])ge$/i,  // Dative: manege, oorige, collegege
  /(?:[aeiou])alli$/i,// Locative: officealli, maneyalli
  /(?:[aeiou])inda$/i,// Instrumental: businda, maneyinda
  /(?:[aeiou])annu$/i,// Accusative: filennu, linkannu
  /o(?:lage|ndige|ndhe)$/i // Postpositions: olage, jothe
];

// Geminate consonants common in Romanized Dravidian words
const GEMINATE_REGEX = /(?:tt|dd|nn|ll|kk|pp|mm|vv|yy|ss|rr|gg)/i;

/**
 * Computes subword phonotactic likelihood score:
 * Returns score: > 0 implies Kannada likelihood, < 0 implies English likelihood
 */
export function analyzePhonotactics(token: string): {
  score: number; // positive = Kannada, negative = English
  detectedKannadaFeatures: string[];
  detectedEnglishFeatures: string[];
  endsInVowel: boolean;
} {
  const clean = token.trim();
  const lower = clean.toLowerCase();

  let score = 0;
  const detectedKannadaFeatures: string[] = [];
  const detectedEnglishFeatures: string[] = [];

  // 1. Check English Morphological Suffixes & Clusters
  for (const pattern of ENGLISH_PATTERNS) {
    if (pattern.test(lower)) {
      score -= 2.5;
      detectedEnglishFeatures.push(pattern.source);
    }
  }

  // 2. Check Kannada Verbal Inflectional Subwords
  for (const pattern of KANNADA_INFLECTIONS) {
    if (pattern.test(lower)) {
      score += 3.5;
      detectedKannadaFeatures.push(pattern.source);
    }
  }

  // 3. Geminate Consonants (very common in Kannada: ivattu, ninne, banni, baralla)
  if (GEMINATE_REGEX.test(lower)) {
    score += 1.8;
    detectedKannadaFeatures.push('geminate_consonant');
  }

  // 4. Dravidian Vocalic Ending check:
  // In Kannada, virtually all words end in a vowel [a, e, i, o, u]
  const endsInVowel = /[aeiou]$/i.test(lower);
  if (endsInVowel) {
    score += 0.8;
  } else {
    // English words frequently end in consonants
    score -= 1.0;
  }

  // 5. Retroflex / Aspirated digraphs: 'th', 'dh', 'bh', 'gh', 'kh'
  if (/(?:th|dh|bh|gh|kh)/i.test(lower)) {
    score += 1.2;
    detectedKannadaFeatures.push('aspirated_digraph');
  }

  return {
    score: Number(score.toFixed(2)),
    detectedKannadaFeatures,
    detectedEnglishFeatures,
    endsInVowel,
  };
}
