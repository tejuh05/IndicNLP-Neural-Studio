/**
 * Morphological Parser for Dravidian-English Agglutination and Kannada Enclitics
 * Implements configurable rules for the 7 primary Kannada suffixes:
 * -ge, -alli, -inda, -annu, -maadi, -aagide, and -beku.
 * Fully supports Kannada Unicode, Romanized Kannada, English roots with Kannada suffixes,
 * and lexical ambiguity safeguards.
 */

import { KannadaSuffixRule, MorphologyDetails } from './types.js';

// Default Configurable Suffix Rules
export const DEFAULT_KANNADA_SUFFIX_RULES: KannadaSuffixRule[] = [
  {
    id: 'dative_ge',
    suffix: '-ge',
    grammaticalCase: 'dative',
    description: 'Dative case marker ("to", "for", direction or recipient)',
    examples: ['College-ge', 'Bengaluru-ge', 'Manege', 'Room-ge', 'Office-ge'],
    enabled: true,
  },
  {
    id: 'locative_alli',
    suffix: '-alli',
    grammaticalCase: 'locative',
    description: 'Locative case marker ("in", "at", spatial or temporal enclosure)',
    examples: ['Meeting-alli', 'Office-alli', 'Traffic-alli', 'Bengaluru-alli'],
    enabled: true,
  },
  {
    id: 'instrumental_inda',
    suffix: '-inda',
    grammaticalCase: 'instrumental',
    description: 'Instrumental / Ablative case marker ("from", "by", "with", source)',
    examples: ['Bus-inda', 'Train-inda', 'Code-inda', 'Error-inda', 'Morning-inda'],
    enabled: true,
  },
  {
    id: 'accusative_annu',
    suffix: '-annu',
    grammaticalCase: 'accusative',
    description: 'Accusative direct object marker ("whom", "what")',
    examples: ['File-annu', 'Link-annu', 'Doc-annu', 'Report-annu', 'Ticket-annu'],
    enabled: true,
  },
  {
    id: 'verbalizer_maadi',
    suffix: '-maadi',
    grammaticalCase: 'verbalizer',
    description: 'Agglutinated verbalizer / imperative auxiliary ("do", "perform", "make")',
    examples: ['Open-maadi', 'Share-maadi', 'Submit-maadi', 'Check-maadi', 'Deploy-maadi'],
    enabled: true,
  },
  {
    id: 'auxiliary_aagide',
    suffix: '-aagide',
    grammaticalCase: 'auxiliary',
    description: 'Stative / Perfective copula auxiliary ("has happened", "is completed")',
    examples: ['Finish-aagide', 'Complete-aagide', 'Deliver-aagide', 'Cancel-aagide'],
    enabled: true,
  },
  {
    id: 'modal_beku',
    suffix: '-beku',
    grammaticalCase: 'modal',
    description: 'Modal auxiliary denoting obligation or necessity ("must", "need", "want")',
    examples: ['Complete-aagbeku', 'Submit-maadbeku', 'Send-maadbeku', 'Hogbeku'],
    enabled: true,
  },
];

// Curated list of English words ending in "ge" that must NOT be falsely parsed as the "-ge" suffix
const ENGLISH_LEXICAL_GE_WORDS = new Set([
  'orange', 'cabbage', 'message', 'package', 'image', 'stage', 'page', 'storage',
  'luggage', 'baggage', 'bridge', 'fridge', 'judge', 'gauge', 'charge', 'change',
  'range', 'large', 'huge', 'manage', 'damage', 'village', 'college', 'cottage',
  'carriage', 'voyage', 'garbage', 'shortage', 'courage', 'average', 'beverage',
  'heritage', 'language', 'passage', 'usage', 'vintage', 'bandage', 'bondage',
  'mileage', 'postage', 'sewage', 'voltage', 'wreckage', 'merge', 'surge', 'purge',
  'sponge', 'plunge', 'lounge', 'hinge', 'singe', 'tinge', 'binge', 'forge', 'gorge',
  'urge', 'edge', 'hedge', 'wedge', 'ledge', 'sledge', 'badge', 'dodge', 'lodge'
]);

// Extended list of common English nouns/verbs often found in code-mixed sentences
const COMMON_ENGLISH_ROOTS = new Set([
  'college', 'meeting', 'office', 'project', 'bus', 'train', 'file', 'link', 'doc',
  'ticket', 'team', 'room', 'server', 'laptop', 'code', 'error', 'system', 'data',
  'feature', 'release', 'deploy', 'open', 'close', 'send', 'share', 'submit', 'check',
  'finish', 'start', 'cancel', 'verify', 'update', 'delete', 'review', 'download',
  'upload', 'install', 'build', 'test', 'call', 'message', 'chat', 'feed', 'post',
  'video', 'class', 'friend', 'road', 'traffic', 'metro', 'cab', 'auto', 'home', 'work',
  'assignment', 'exam', 'presentation', 'interview', 'salary', 'manager', 'lead',
  'client', 'package', 'order', 'delivery', 'dinner', 'lunch', 'breakfast', 'party',
  'complete', 'delivered', 'ready', 'live', 'now', 'today', 'tomorrow', 'yesterday'
]);

// Common pure Kannada roots in Romanized script
const COMMON_KANNADA_ROOTS = new Set([
  'nange', 'nimge', 'namge', 'avarge', 'nanu', 'neevu', 'naavu', 'avaru', 'idu', 'adu',
  'yavaga', 'yaake', 'hege', 'enu', 'illi', 'alli', 'elli', 'haudu', 'illa', 'beku',
  'beda', 'chennagi', 'namaskara', 'hegiddira', 'oota', 'kelsa', 'mane', 'thindi',
  'neeru', 'banni', 'hogi', 'kodi', 'thagondu', 'nodona', 'maadona', 'hogona', 'barona',
  'ooru', 'oorige', 'manege', 'avanu', 'avalu', 'naale', 'nale', 'ninne', 'ivattu',
  'eevatthu', 'ide', 'idhe', 'mugithu', 'bartira', 'hogtini', 'baralla', 'madilla',
  'madidira', 'nodidira'
]);

/**
 * Parses morphological structure of a token with active suffix rules and ambiguity checks
 */
export function parseMorphology(
  tokenSurface: string,
  activeRules: KannadaSuffixRule[] = DEFAULT_KANNADA_SUFFIX_RULES
): MorphologyDetails {
  const clean = tokenSurface.trim();
  const lower = clean.toLowerCase();

  // 0. Standalone Kannada Case Postpositions (e.g. "ge" in "office ge", "alli" in "room alli")
  if (lower === 'ge') {
    return {
      root: 'ge',
      rootLanguage: 'kannada',
      suffix: '-ge',
      suffixLanguage: 'kannada',
      suffixType: 'dative',
      suffixDescription: 'Standalone dative postposition ("to/for")',
      isAmbiguous: false,
    };
  }
  if (lower === 'alli') {
    return {
      root: 'alli',
      rootLanguage: 'kannada',
      suffix: '-alli',
      suffixLanguage: 'kannada',
      suffixType: 'locative',
      suffixDescription: 'Standalone locative postposition ("in/at")',
      isAmbiguous: false,
    };
  }
  if (lower === 'inda') {
    return {
      root: 'inda',
      rootLanguage: 'kannada',
      suffix: '-inda',
      suffixLanguage: 'kannada',
      suffixType: 'instrumental',
      suffixDescription: 'Standalone instrumental postposition ("from/by")',
      isAmbiguous: false,
    };
  }

  // 1. Explicit Hyphenated Enclitic Form (e.g. "College-ge", "Open-maadi", "Office-alli", "Complete-aagbeku")
  if (clean.includes('-')) {
    const parts = clean.split('-');
    if (parts.length === 2) {
      const rootPart = parts[0];
      const rawSuffix = parts[1].toLowerCase();
      const suffixPart = '-' + rawSuffix;

      // Check compound suffixes like -aagbeku, -maadbeku
      let matchedRule = activeRules.find((r) => r.enabled && r.suffix.toLowerCase() === suffixPart);
      let suffixType = matchedRule?.grammaticalCase;
      let suffixDesc = matchedRule?.description;

      if (!matchedRule) {
        if (rawSuffix === 'aagbeku' || rawSuffix === 'maadbeku') {
          suffixType = 'modal';
          suffixDesc = 'Compound verbalizer + modal obligation ("must complete / must do")';
        } else if (rawSuffix === 'aagide' || rawSuffix === 'aaythu') {
          suffixType = 'auxiliary';
          suffixDesc = 'Stative / Perfective auxiliary ("has happened")';
        } else if (rawSuffix === 'maadi' || rawSuffix === 'maadona') {
          suffixType = 'verbalizer';
          suffixDesc = 'Verbalizer auxiliary ("do / perform")';
        } else if (rawSuffix === 'ge' || rawSuffix === 'ige') {
          suffixType = 'dative';
          suffixDesc = 'Dative case marker ("to / for")';
        } else if (rawSuffix === 'alli') {
          suffixType = 'locative';
          suffixDesc = 'Locative case marker ("in / at")';
        } else if (rawSuffix === 'inda') {
          suffixType = 'instrumental';
          suffixDesc = 'Instrumental case marker ("from / with / by")';
        } else if (rawSuffix === 'annu' || rawSuffix === 'na') {
          suffixType = 'accusative';
          suffixDesc = 'Accusative direct object marker ("what / whom")';
        }
      }

      if (suffixType) {
        const rootLower = rootPart.toLowerCase();
        const rootLang = COMMON_KANNADA_ROOTS.has(rootLower)
          ? 'kannada'
          : COMMON_ENGLISH_ROOTS.has(rootLower) || /^[a-zA-Z]+$/.test(rootPart)
            ? 'english'
            : 'unknown';

        return {
          root: rootPart,
          rootLanguage: rootLang,
          suffix: suffixPart,
          suffixLanguage: 'kannada',
          suffixType,
          suffixDescription: suffixDesc || `Kannada ${suffixType} enclitic`,
          isAmbiguous: false,
        };
      }
    }
  }

  // 2. Lexical Ambiguity Check: Ensure standard English words ending in "ge" are not marked as suffixes
  if (ENGLISH_LEXICAL_GE_WORDS.has(lower)) {
    return {
      root: clean,
      rootLanguage: 'english',
      isAmbiguous: false,
    };
  }

  // 3. Known Kannada root words with morphological case endings (e.g. "manege", "nange", "nimge", "oorige")
  if (lower === 'manege') {
    return {
      root: 'mane (home/house)',
      rootLanguage: 'kannada',
      suffix: '-ge',
      suffixLanguage: 'kannada',
      suffixType: 'dative',
      suffixDescription: 'Dative case marker on Kannada noun ("to home")',
      isAmbiguous: false,
    };
  }
  if (lower === 'oorige') {
    return {
      root: 'ooru (town/village)',
      rootLanguage: 'kannada',
      suffix: '-ige',
      suffixLanguage: 'kannada',
      suffixType: 'dative',
      suffixDescription: 'Dative case marker on Kannada noun ("to hometown")',
      isAmbiguous: false,
    };
  }
  if (lower === 'nange') {
    return {
      root: 'naanu (I/me)',
      rootLanguage: 'kannada',
      suffix: '-ge',
      suffixLanguage: 'kannada',
      suffixType: 'dative',
      suffixDescription: 'First person singular dative ("to me")',
      isAmbiguous: false,
    };
  }
  if (lower === 'nimge') {
    return {
      root: 'neevu (you/honorific)',
      rootLanguage: 'kannada',
      suffix: '-ge',
      suffixLanguage: 'kannada',
      suffixType: 'dative',
      suffixDescription: 'Second person honorific dative ("to you")',
      isAmbiguous: false,
    };
  }

  // 4. Concatenated Suffix Detection (without explicit hyphen, e.g. "collegalli", "collegege", "officege", "openmaadi")
  // First test compound modal suffixes like 'aagbeku', 'maadbeku'
  if (lower.endsWith('aagbeku') && lower.length > 9) {
    const stem = clean.slice(0, clean.length - 7);
    return {
      root: stem,
      rootLanguage: COMMON_ENGLISH_ROOTS.has(stem.toLowerCase()) ? 'english' : 'unknown',
      suffix: '-aagbeku',
      suffixLanguage: 'kannada',
      suffixType: 'modal',
      suffixDescription: 'Compound auxiliary modal ("must be completed")',
      isAmbiguous: false,
    };
  }
  if (lower.endsWith('maadbeku') && lower.length > 10) {
    const stem = clean.slice(0, clean.length - 8);
    return {
      root: stem,
      rootLanguage: COMMON_ENGLISH_ROOTS.has(stem.toLowerCase()) ? 'english' : 'unknown',
      suffix: '-maadbeku',
      suffixLanguage: 'kannada',
      suffixType: 'modal',
      suffixDescription: 'Compound verbalizer modal ("must perform/do")',
      isAmbiguous: false,
    };
  }

  for (const rule of activeRules) {
    if (!rule.enabled) continue;
    const bareSuffix = rule.suffix.replace(/^-/, '').toLowerCase();

    if (lower.length > bareSuffix.length + 2 && lower.endsWith(bareSuffix)) {
      const stemLower = lower.slice(0, -bareSuffix.length);
      const originalStem = clean.slice(0, clean.length - bareSuffix.length);

      // Ambiguity check: English words ending in 'ge' handled earlier.
      if (bareSuffix === 'ge' && (stemLower.endsWith('d') || stemLower.endsWith('r') || stemLower.length < 3)) {
        continue;
      }

      const isEnglishRoot = COMMON_ENGLISH_ROOTS.has(stemLower) || COMMON_ENGLISH_ROOTS.has(stemLower.replace(/e$/, ''));
      const isKannadaRoot = COMMON_KANNADA_ROOTS.has(stemLower) || stemLower === 'mane' || stemLower === 'oor';

      if (isEnglishRoot || isKannadaRoot) {
        return {
          root: originalStem,
          rootLanguage: isKannadaRoot ? 'kannada' : 'english',
          suffix: '-' + bareSuffix,
          suffixLanguage: 'kannada',
          suffixType: rule.grammaticalCase,
          suffixDescription: rule.description,
          isAmbiguous: false,
        };
      }
    }
  }

  // 5. Default Non-Agglutinated Token
  const isEnglish = COMMON_ENGLISH_ROOTS.has(lower) || (ENGLISH_LEXICAL_GE_WORDS.has(lower));
  const isKannada = COMMON_KANNADA_ROOTS.has(lower) || /[\u0C80-\u0CFF]/.test(clean);

  return {
    root: clean,
    rootLanguage: isKannada ? 'kannada' : isEnglish ? 'english' : 'unknown',
    isAmbiguous: false,
  };
}
