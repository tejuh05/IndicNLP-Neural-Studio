/**
 * Code-Switching Index (CMI) Formal Calculator
 * Formalizes the Gambäck & Das (2014) multilingual index methodology for Dravidian-English code-mixing.
 * Calculates token distributions (Kannada, English, Hybrid), language-switch frequency, and transition points.
 */

import { LanguageClass, TokenEntity } from '../types';

export interface LanguageDistribution {
  totalTokens: number;
  lexicalTokens: number; // N - u (excluding punctuation and numbers)
  kannadaCount: number;
  englishCount: number;
  hybridCount: number;
  otherCount: number;
  // Proportions (0.0 to 1.0)
  kannadaProportion: number;
  englishProportion: number;
  hybridProportion: number;
  otherProportion: number;
}

export interface LanguageSwitchEvent {
  index: number;
  fromToken: string;
  fromLanguage: LanguageClass;
  toToken: string;
  toLanguage: LanguageClass;
  isIntraWord: boolean; // true for hybrid agglutinated tokens (e.g. English root -> Kannada suffix)
}

export interface CMICalculationResult {
  cmiScore: number; // 0.0 to 100.0 percentage
  distribution: LanguageDistribution;
  dominantLanguage: 'kannada' | 'english' | 'balanced' | 'none';
  effectiveWeights: {
    kannada: number;
    english: number;
  };
  switchFrequency: {
    totalSwitches: number;
    switchRate: number; // transitions per token boundary
    intraWordSwitches: number;
    interWordSwitches: number;
    transitions: LanguageSwitchEvent[];
  };
  methodology: {
    citation: string;
    formula: string;
    stepByStepBreakdown: string;
    linguisticInterpretation: string;
  };
}

/**
 * Computes the Gambäck & Das (2014) Code-Switching Index (CMI)
 *
 * Formula:
 *   CMI = 100 * [1 - max(W_kn, W_en) / (N - u)]
 *
 * Where:
 *   N = total number of tokens
 *   u = language-independent tokens (punctuation, symbols, digits)
 *   W_kn = Kannada tokens + 0.5 * Hybrid tokens
 *   W_en = English tokens + 0.5 * Hybrid tokens
 *   max(W_kn, W_en) = weight of the primary matrix language
 */
export function calculateCMI(tokens: TokenEntity[]): CMICalculationResult {
  let kannadaCount = 0;
  let englishCount = 0;
  let hybridCount = 0;
  let otherCount = 0;

  for (const token of tokens) {
    switch (token.language) {
      case 'kannada':
        kannadaCount++;
        break;
      case 'english':
        englishCount++;
        break;
      case 'hybrid':
        hybridCount++;
        break;
      case 'punct':
      case 'unknown':
      default:
        otherCount++;
        break;
    }
  }

  const totalTokens = tokens.length;
  const lexicalTokens = totalTokens - otherCount;

  const kannadaProportion = totalTokens > 0 ? Number((kannadaCount / totalTokens).toFixed(3)) : 0;
  const englishProportion = totalTokens > 0 ? Number((englishCount / totalTokens).toFixed(3)) : 0;
  const hybridProportion = totalTokens > 0 ? Number((hybridCount / totalTokens).toFixed(3)) : 0;
  const otherProportion = totalTokens > 0 ? Number((otherCount / totalTokens).toFixed(3)) : 0;

  const distribution: LanguageDistribution = {
    totalTokens,
    lexicalTokens,
    kannadaCount,
    englishCount,
    hybridCount,
    otherCount,
    kannadaProportion,
    englishProportion,
    hybridProportion,
    otherProportion,
  };

  // Language Switch Events & Frequency Analysis
  const transitions: LanguageSwitchEvent[] = [];
  let intraWordSwitches = 0;
  let interWordSwitches = 0;
  let previousLang: LanguageClass | null = null;
  let previousToken = '';

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.language === 'punct') continue;

    // Intra-word hybrid switch (e.g., "College-ge" root:en -> suffix:kn)
    if (t.language === 'hybrid' && t.morphology.suffix) {
      transitions.push({
        index: i,
        fromToken: t.morphology.root,
        fromLanguage: t.morphology.rootLanguage === 'english' ? 'english' : 'kannada',
        toToken: t.morphology.suffix,
        toLanguage: 'kannada',
        isIntraWord: true,
      });
      intraWordSwitches++;
    }

    // Inter-word language transition
    if (previousLang && previousLang !== t.language) {
      transitions.push({
        index: i,
        fromToken: previousToken,
        fromLanguage: previousLang,
        toToken: t.surface,
        toLanguage: t.language,
        isIntraWord: false,
      });
      interWordSwitches++;
    }

    previousLang = t.language;
    previousToken = t.surface;
  }

  const totalSwitches = transitions.length;
  const tokenBoundaries = Math.max(1, totalTokens - 1);
  const switchRate = Number((totalSwitches / tokenBoundaries).toFixed(3));

  // CMI Calculation
  if (lexicalTokens <= 0) {
    return {
      cmiScore: 0,
      distribution,
      dominantLanguage: 'none',
      effectiveWeights: { kannada: 0, english: 0 },
      switchFrequency: {
        totalSwitches: 0,
        switchRate: 0,
        intraWordSwitches: 0,
        interWordSwitches: 0,
        transitions: [],
      },
      methodology: {
        citation: 'Gambäck, B., & Das, A. (2014). Comparing the Level of Code-Switching in Corpora.',
        formula: 'CMI = 100 * [1 - max(W_kn, W_en) / (N - u)]',
        stepByStepBreakdown: 'No valid lexical language tokens (all punctuation/symbols). CMI = 0.0%',
        linguisticInterpretation: 'Zero linguistic content; only symbols or whitespace detected.',
      },
    };
  }

  // Weight hybrid enclitics across both Kannada and English constituent systems
  const effectiveKannada = kannadaCount + (hybridCount * 0.5);
  const effectiveEnglish = englishCount + (hybridCount * 0.5);
  const maxLanguageWeight = Math.max(effectiveKannada, effectiveEnglish);

  const rawCMI = (1 - (maxLanguageWeight / lexicalTokens)) * 100;
  const cmiScore = Math.max(0, Math.min(100, Number(rawCMI.toFixed(1))));

  let dominantLanguage: 'kannada' | 'english' | 'balanced' | 'none' = 'balanced';
  if (effectiveKannada > effectiveEnglish) {
    dominantLanguage = 'kannada';
  } else if (effectiveEnglish > effectiveKannada) {
    dominantLanguage = 'english';
  }

  // Step-by-step breakdown string
  const stepByStepBreakdown = [
    `Total tokens N = ${totalTokens}, Language-independent tokens u = ${otherCount}.`,
    `Lexical tokens (N - u) = ${lexicalTokens}.`,
    `Token counts: Kannada = ${kannadaCount}, English = ${englishCount}, Hybrid = ${hybridCount}.`,
    `Effective weights: W_kn = ${kannadaCount} + 0.5×${hybridCount} = ${effectiveKannada.toFixed(1)}, W_en = ${englishCount} + 0.5×${hybridCount} = ${effectiveEnglish.toFixed(1)}.`,
    `Majority language weight max(W_kn, W_en) = ${maxLanguageWeight.toFixed(1)} (${dominantLanguage}).`,
    `CMI = 100 × [1 - (${maxLanguageWeight.toFixed(1)} / ${lexicalTokens})] = ${cmiScore.toFixed(1)}%.`,
    `Language switch points = ${totalSwitches} (${intraWordSwitches} intra-word enclitic, ${interWordSwitches} inter-word).`,
  ].join(' ');

  let linguisticInterpretation = '';
  if (cmiScore === 0) {
    linguisticInterpretation = 'Completely monolingual utterance; no code-mixing detected.';
  } else if (cmiScore < 20) {
    linguisticInterpretation = 'Low code-mixing; sparse single-token borrowing or isolated enclitic attachment.';
  } else if (cmiScore < 40) {
    linguisticInterpretation = 'Moderate code-mixing; typical urban colloquial Kanglish with active Dravidian case marking.';
  } else {
    linguisticInterpretation = 'High code-mixing; dense linguistic alternating equilibrium between Kannada and English syntax.';
  }

  return {
    cmiScore,
    distribution,
    dominantLanguage,
    effectiveWeights: {
      kannada: effectiveKannada,
      english: effectiveEnglish,
    },
    switchFrequency: {
      totalSwitches,
      switchRate,
      intraWordSwitches,
      interWordSwitches,
      transitions,
    },
    methodology: {
      citation: 'Gambäck, B., & Das, A. (2014). Comparing the Level of Code-Switching in Corpora. Proceedings of the 9th LREC.',
      formula: 'CMI = 100 * [1 - max(W_kn, W_en) / (N - u)]',
      stepByStepBreakdown,
      linguisticInterpretation,
    },
  };
}
