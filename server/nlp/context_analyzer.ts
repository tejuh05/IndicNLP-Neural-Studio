/**
 * Sentence-Level Context Analyzer for Code-Mixed Discourse
 * Analyzes sequence patterns, complex predicates (serial verbs), detached postpositions,
 * and syntactic structure (SOV vs SVO).
 */

import { LanguageClass } from './types.js';

export interface ContextualCue {
  tokenIndex: number;
  inferredLanguage?: LanguageClass;
  inferredPos?: string;
  reason?: string;
}

// Standalone Kannada postpositions / case clitics
const STANDALONE_KANNADA_POSTPOSITIONS = new Set([
  'ge', 'ige', 'alli', 'nalli', 'inda', 'ninda', 'annu', 'na', 'jothe', 'olage', 'mele', 'kelege'
]);

// Kannada verbalizers and auxiliaries that form complex predicates with English verbs
const KANNADA_AUXILIARY_VERBS = new Set([
  'maadi', 'maadbeku', 'maadona', 'madidira', 'maadidira', 'madilla', 'maadilla',
  'madalla', 'maadalla', 'madtini', 'madthini', 'maaduthini', 'madona',
  'aagide', 'agide', 'aaythu', 'aythu', 'aagthini', 'agthilla', 'aagbeku',
  'ide', 'idhe', 'illa', 'alla', 'beku', 'beda'
]);

// Common English functional words
const ENGLISH_FUNCTION_WORDS = new Set([
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'am', 'is', 'are', 'was', 'were',
  'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'shall',
  'will', 'should', 'would', 'may', 'might', 'must', 'can', 'could',
  'a', 'an', 'the', 'and', 'but', 'or', 'nor', 'for', 'yet', 'so',
  'in', 'on', 'at', 'to', 'from', 'with', 'by', 'about', 'against', 'between',
  'into', 'through', 'during', 'before', 'after', 'above', 'below', 'up', 'down'
]);

/**
 * Analyzes contextual dependencies across a full sequence of tokens
 */
export function analyzeSentenceContext(tokens: string[]): Map<number, ContextualCue> {
  const cues = new Map<number, ContextualCue>();

  for (let i = 0; i < tokens.length; i++) {
    const raw = tokens[i].trim();
    const lower = raw.toLowerCase();
    const prevRaw = tokens[i - 1]?.trim().toLowerCase();
    const nextRaw = tokens[i + 1]?.trim().toLowerCase();

    // 1. Standalone Dative/Locative/Instrumental Postpositions (e.g. "office ge", "college ge", "room alli")
    if (STANDALONE_KANNADA_POSTPOSITIONS.has(lower)) {
      cues.set(i, {
        tokenIndex: i,
        inferredLanguage: 'kannada',
        inferredPos: 'ADP',
        reason: `Standalone Kannada postposition following "${tokens[i - 1] || 'noun'}"`,
      });
      continue;
    }

    // 2. English Verb in Complex Predicate (e.g. "submit madidira", "complete madilla", "verify maadi")
    if (nextRaw && KANNADA_AUXILIARY_VERBS.has(nextRaw)) {
      // If the auxiliary is Kannada, the preceding action word (e.g. "submit", "complete") is often an English loan verb/noun
      if (!STANDALONE_KANNADA_POSTPOSITIONS.has(lower) && !ENGLISH_FUNCTION_WORDS.has(lower)) {
        cues.set(i + 1, {
          tokenIndex: i + 1,
          inferredLanguage: 'kannada',
          inferredPos: 'AUX',
          reason: `Kannada light verb / auxiliary in complex predicate attached to "${raw}"`,
        });
      }
    }

    // 3. Copula "ide" / "idhe" following Noun (e.g. "exam ide", "class ide")
    if (lower === 'ide' || lower === 'idhe') {
      cues.set(i, {
        tokenIndex: i,
        inferredLanguage: 'kannada',
        inferredPos: 'AUX',
        reason: 'Kannada existential copula ("exists/is")',
      });
      continue;
    }

    // 4. Pronoun followed by Verb/Argument (e.g. "Avanu project", "Nivu assignment", "Nanu college")
    if (['avanu', 'avalu', 'avaru', 'nanu', 'nivu', 'naanu', 'neevu', 'naavu'].includes(lower)) {
      cues.set(i, {
        tokenIndex: i,
        inferredLanguage: 'kannada',
        inferredPos: 'PRON',
        reason: 'Kannada subject personal pronoun',
      });
      continue;
    }

    // 5. English Pronoun & Auxiliary sequence (e.g. "I am manege hogtini")
    if (lower === 'i' && nextRaw === 'am') {
      cues.set(i, {
        tokenIndex: i,
        inferredLanguage: 'english',
        inferredPos: 'PRON',
        reason: 'English first-person pronoun in English matrix clause',
      });
      cues.set(i + 1, {
        tokenIndex: i + 1,
        inferredLanguage: 'english',
        inferredPos: 'AUX',
        reason: 'English copula auxiliary following "I"',
      });
    }

    // 6. Sentence-Final Verb in Dravidian SOV syntax (e.g. "...bartira?", "...hogtini.", "...baralla.")
    if ((i === tokens.length - 1 || (i === tokens.length - 2 && /^[\p{P}]+$/u.test(tokens[tokens.length - 1]))) &&
        (lower.endsWith('tira') || lower.endsWith('tini') || lower.endsWith('alla') || lower.endsWith('ona') || lower.endsWith('ithu') || lower.endsWith('ide'))) {
      cues.set(i, {
        tokenIndex: i,
        inferredLanguage: 'kannada',
        inferredPos: 'VERB',
        reason: 'Sentence-final finite verb in Dravidian SOV structure',
      });
    }
  }

  return cues;
}
