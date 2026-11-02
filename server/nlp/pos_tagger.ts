/**
 * Universal Dependencies Part-of-Speech (UD PoS) Tagger
 * Tagset: NOUN, VERB, ADJ, ADV, AUX, PRON, ADP, CCONJ, PUNCT, NUM, PROPN
 */

import { LanguageClass, MorphologyDetails } from './types.js';

export function tagPOS(
  surface: string,
  language: LanguageClass,
  morphology: MorphologyDetails,
  contextPos?: string
): string {
  if (contextPos) {
    return contextPos;
  }

  const clean = surface.trim();
  const lower = clean.toLowerCase();

  // 1. Punctuation
  if (language === 'punct' || /^[\p{P}\p{S}]+$/u.test(clean)) {
    return 'PUNCT';
  }

  // 2. Numbers
  if (/^\d+$/.test(clean)) {
    return 'NUM';
  }

  // 3. Postpositions & Clitics
  if (['ge', 'alli', 'inda', 'annu', 'na', 'jothe', 'olage', 'mele', 'kelege'].includes(lower)) {
    return 'ADP';
  }

  // 4. Pronouns
  if ([
    'nanu', 'naanu', 'nivu', 'neevu', 'naavu', 'navu', 'avaru', 'avru', 'avnu', 'avanu',
    'avlu', 'avalu', 'idu', 'adu', 'nange', 'nimge', 'namge', 'i', 'you', 'we', 'they',
    'he', 'she', 'it', 'me', 'us', 'him', 'her'
  ].includes(lower)) {
    return 'PRON';
  }

  // 5. Morphological Suffix Indicators
  if (morphology.suffixType) {
    switch (morphology.suffixType) {
      case 'dative':
      case 'locative':
      case 'instrumental':
      case 'accusative':
        return 'NOUN';
      case 'verbalizer':
        return 'VERB';
      case 'auxiliary':
      case 'modal':
        return 'AUX';
    }
  }

  // 6. Time Adverbs & Demonstratives
  if ([
    'nale', 'naale', 'ivattu', 'eevatthu', 'ninne', 'yavaga', 'yaavaga', 'yaake',
    'hege', 'illi', 'alli', 'elli', 'today', 'tomorrow', 'yesterday', 'now', 'bega',
    'swalpa', 'then', 'again'
  ].includes(lower)) {
    return 'ADV';
  }

  // 7. Conjunctions
  if (['and', 'or', 'but', 'matte', 'anthu', 'yet', 'so'].includes(lower)) {
    return 'CCONJ';
  }

  // 8. Auxiliaries & Copulas
  if ([
    'ide', 'idhe', 'idini', 'idira', 'iddane', 'iddare', 'illa', 'aagide', 'aaythu',
    'am', 'is', 'are', 'was', 'were', 'have', 'has', 'had', 'madidira', 'madilla'
  ].includes(lower)) {
    return 'AUX';
  }

  // 9. Kannada & English Verbs
  const VERBS = new Set([
    'bartira', 'baruttira', 'hogtini', 'hoguthini', 'hogona', 'barona', 'nodona',
    'maadona', 'mugithu', 'baralla', 'hogalla', 'banni', 'hogi', 'kodi', 'submit',
    'complete', 'open', 'close', 'send', 'share', 'check', 'verify', 'update',
    'review', 'download', 'upload', 'install', 'build', 'test', 'deploy', 'call'
  ]);
  if (VERBS.has(lower) || lower.endsWith('tini') || lower.endsWith('tira') || lower.endsWith('ona')) {
    return 'VERB';
  }

  // 10. Adjectives
  const ADJS = new Set([
    'new', 'all', 'any', 'first', 'last', 'good', 'bad', 'high', 'low',
    'quick', 'fast', 'slow', 'big', 'small', 'ready', 'live', 'chennagi'
  ]);
  if (ADJS.has(lower)) {
    return 'ADJ';
  }

  // 11. Proper Nouns (Cities, Platforms)
  if (['bengaluru', 'bangalore', 'india', 'karnataka', 'amazon', 'google', 'microsoft'].includes(lower)) {
    return 'PROPN';
  }

  // Default Noun
  return 'NOUN';
}
